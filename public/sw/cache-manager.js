/**
 * Cache management: atomic, versioned application-shell caches.
 *
 * ## The atomicity model
 *
 * The Cache API has no rename and no transaction, so "swap the cache" is
 * implemented with **pointer indirection**:
 *
 *   - Each deployment owns its own cache, named `osp-ui-v<revision>`.
 *   - A single IndexedDB key, `activeRevision`, decides which of those caches
 *     serves traffic.
 *   - A new revision is downloaded in full into its own cache while the old one
 *     keeps serving. Nothing observes the new cache until every asset has
 *     landed and been validated.
 *   - The commit is one IndexedDB write. Before it, 100% of requests resolve
 *     from the old build; after it, 100% resolve from the new one. There is no
 *     window in which the two are mixed.
 *   - A failed or partial download deletes only the *new* cache. The working
 *     build is never touched.
 *
 * The previous revision's cache is retained for a grace period so tabs that are
 * still running the old build can keep loading their lazy chunks.
 */

// @ts-nocheck — worker scope: `self` is a ServiceWorkerGlobalScope carrying the
// helpers attached by sibling modules, which the editor's DOM lib cannot model.
/* eslint-disable no-undef */

(function initCacheManager() {
  const { SHELL_CACHE_PREFIX, DOWNLOAD_CONCURRENCY, PREVIOUS_CACHE_GRACE_MS } =
    self.SW_CONFIG;

  const META_KEYS = {
    active: "activeRevision",
    previous: "previousRevision",
    retiredAt: "previousRetiredAt",
    lastChecked: "lastCheckedAt",
    manifest: (revision) => `manifest:${revision}`,
  };

  /** In-memory mirror of the pointer, refreshed on every commit. */
  let activeRevisionCache;

  const cacheNameFor = (revision) => `${SHELL_CACHE_PREFIX}${revision}`;

  /* ---------------------------------------------------------------------- */
  /* Pointer state                                                          */
  /* ---------------------------------------------------------------------- */

  async function getActiveRevision() {
    if (activeRevisionCache === undefined) {
      activeRevisionCache = await self.swMeta.get(META_KEYS.active, null);
    }
    return activeRevisionCache;
  }

  async function getPreviousRevision() {
    return self.swMeta.get(META_KEYS.previous, null);
  }

  /* ---------------------------------------------------------------------- */
  /* Downloading                                                            */
  /* ---------------------------------------------------------------------- */

  /**
   * Fetches one asset, bypassing the HTTP cache so a precache never captures a
   * stale intermediary copy. Retries transient failures.
   */
  async function fetchAsset(url, attempts = 3) {
    let lastError;

    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      try {
        const response = await fetch(url, {
          cache: "no-cache",
          credentials: "same-origin",
          redirect: "follow",
        });

        // An opaque or redirected response cannot be validated, and an error
        // status must never be written into the shell — both are treated as a
        // failed download so the update aborts instead of half-applying.
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        if (response.type === "opaque" || response.redirected) {
          throw new Error(`unusable response type "${response.type}"`);
        }

        return response;
      } catch (error) {
        lastError = error;
        if (attempt < attempts) {
          await new Promise((resolve) => setTimeout(resolve, 250 * attempt));
        }
      }
    }

    throw new Error(`Failed to download ${url}: ${lastError?.message}`);
  }

  /**
   * Runs `worker` over `items` with bounded concurrency.
   * Rejects as soon as any item fails — a shell download is all-or-nothing.
   */
  async function runPool(items, concurrency, worker) {
    let cursor = 0;

    const runners = Array.from(
      { length: Math.min(concurrency, items.length) },
      async () => {
        while (cursor < items.length) {
          const index = cursor;
          cursor += 1;
          await worker(items[index], index);
        }
      },
    );

    await Promise.all(runners);
  }

  /**
   * Builds the shell cache for `manifest.revision`.
   *
   * Assets whose content hash is unchanged from an already-cached revision are
   * copied cache-to-cache instead of re-downloaded, so a typical deployment
   * only pulls the chunks that actually changed.
   *
   * Throws if any asset cannot be obtained; the caller deletes the partial
   * cache. Never touches the live cache.
   */
  async function populateShellCache(manifest, { onProgress } = {}) {
    const targetName = cacheNameFor(manifest.revision);
    const cache = await caches.open(targetName);

    // Hashes from the revisions already on disk, used to decide what can be
    // reused. Later entries win, so the active revision takes precedence.
    const knownHashes = new Map();
    const donorNames = [];

    for (const revision of [
      await getPreviousRevision(),
      await getActiveRevision(),
    ]) {
      if (!revision) continue;
      const donorManifest = await self.swMeta.get(
        META_KEYS.manifest(revision),
        null,
      );
      if (!donorManifest?.assets) continue;

      donorNames.push(cacheNameFor(revision));
      for (const asset of donorManifest.assets) {
        knownHashes.set(asset.url, { hash: asset.hash, revision });
      }
    }

    const total = manifest.assets.length;
    let completed = 0;
    let downloaded = 0;
    let reused = 0;
    const skipped = [];

    await runPool(manifest.assets, DOWNLOAD_CONCURRENCY, async (asset) => {
      const known = knownHashes.get(asset.url);
      let stored = false;

      // Reuse path: identical content already sits in another shell cache.
      if (known && known.hash === asset.hash) {
        const donor = await caches.open(cacheNameFor(known.revision));
        const existing = await donor.match(asset.url);
        if (existing) {
          await cache.put(asset.url, existing.clone());
          stored = true;
          reused += 1;
        }
      }

      if (!stored) {
        try {
          const response = await fetchAsset(asset.url);
          await cache.put(asset.url, response);
          downloaded += 1;
        } catch (error) {
          // Required assets are non-negotiable: rethrow and abort the update.
          // Optional media is best-effort — an auth-gated or deleted image must
          // not be able to block every future release. It simply falls back to
          // the runtime cache / network when something actually requests it.
          if (asset.required !== false) throw error;
          skipped.push(asset.url);
          console.warn("[sw] optional asset skipped:", asset.url);
        }
      }

      completed += 1;
      onProgress?.({ completed, total, downloaded, reused });
    });

    // Validation gate: prove every *required* entry is actually retrievable
    // from the new cache before it is allowed to become live.
    const missing = [];
    for (const asset of manifest.assets) {
      if (asset.required === false) continue;
      if (!(await cache.match(asset.url))) missing.push(asset.url);
    }
    if (missing.length > 0) {
      throw new Error(
        `Incomplete shell cache: ${missing.length} required asset(s) missing, e.g. ${missing[0]}`,
      );
    }

    return {
      cacheName: targetName,
      total,
      downloaded,
      reused,
      skipped: skipped.length,
      donorNames,
    };
  }

  /* ---------------------------------------------------------------------- */
  /* Commit + cleanup                                                       */
  /* ---------------------------------------------------------------------- */

  /**
   * The atomic switch. One IndexedDB transaction moves the pointer to the new
   * revision, demotes the current one to "previous", and records the manifest
   * needed for the next update's hash-reuse pass.
   */
  async function commitRevision(manifest) {
    const outgoing = await getActiveRevision();

    await self.swMeta.setMany({
      [META_KEYS.active]: manifest.revision,
      [META_KEYS.previous]: outgoing,
      [META_KEYS.retiredAt]: outgoing ? Date.now() : 0,
      [META_KEYS.manifest(manifest.revision)]: manifest,
    });

    activeRevisionCache = manifest.revision;
    return { previousRevision: outgoing };
  }

  /**
   * Deletes shell caches that are neither live nor within the retention grace
   * window, plus any metadata left behind by them.
   *
   * Retaining the immediately-previous revision is what stops an open tab from
   * breaking mid-session: it keeps resolving its lazy chunks from the build it
   * was loaded with.
   */
  async function pruneCaches({ force = false } = {}) {
    const active = await getActiveRevision();
    const previous = await getPreviousRevision();
    const retiredAt = await self.swMeta.get(META_KEYS.retiredAt, 0);

    const graceExpired =
      force || (retiredAt > 0 && Date.now() - retiredAt > PREVIOUS_CACHE_GRACE_MS);

    const keep = new Set();
    if (active) keep.add(cacheNameFor(active));
    if (previous && !graceExpired) keep.add(cacheNameFor(previous));

    const deleted = [];
    for (const name of await caches.keys()) {
      if (!name.startsWith(SHELL_CACHE_PREFIX)) continue;
      if (keep.has(name)) continue;
      await caches.delete(name);
      deleted.push(name);
    }

    // Drop the retired pointer and its manifest once its cache is gone.
    if (previous && graceExpired) {
      await self.swMeta.delete(META_KEYS.manifest(previous));
      await self.swMeta.setMany({
        [META_KEYS.previous]: null,
        [META_KEYS.retiredAt]: 0,
      });
    }

    return deleted;
  }

  /**
   * Discards a partially-built cache after a failed update. Guarded so a bug
   * can never delete the cache that is currently serving traffic.
   */
  async function discardRevision(revision) {
    const active = await getActiveRevision();
    if (!revision || revision === active) return;
    await caches.delete(cacheNameFor(revision));
    await self.swMeta.delete(META_KEYS.manifest(revision));
  }

  /* ---------------------------------------------------------------------- */
  /* Lookup                                                                 */
  /* ---------------------------------------------------------------------- */

  /**
   * Resolves a request against the live shell cache, falling back to the
   * retained previous shell.
   *
   * The fallback is deliberate: a tab loaded before an update still asks for
   * the old build's chunk URLs, and the server no longer has them. Serving them
   * from the retired cache keeps that tab whole until the user reloads.
   */
  async function matchShell(request) {
    const active = await getActiveRevision();
    if (active) {
      const hit = await (await caches.open(cacheNameFor(active))).match(request);
      if (hit) return hit;
    }

    const previous = await getPreviousRevision();
    if (previous) {
      const hit = await (
        await caches.open(cacheNameFor(previous))
      ).match(request);
      if (hit) return hit;
    }

    return undefined;
  }

  /** FIFO trim for the unversioned runtime caches. */
  async function trimCache(cacheName, maxEntries) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    if (keys.length <= maxEntries) return;

    for (const key of keys.slice(0, keys.length - maxEntries)) {
      await cache.delete(key);
    }
  }

  self.swCache = {
    META_KEYS,
    cacheNameFor,
    getActiveRevision,
    getPreviousRevision,
    populateShellCache,
    commitRevision,
    pruneCaches,
    discardRevision,
    matchShell,
    trimCache,
  };
})();
