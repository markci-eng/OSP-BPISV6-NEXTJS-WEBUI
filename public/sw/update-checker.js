/**
 * Deployment detection and background update orchestration.
 *
 * Detection compares the `revision` field of `/sw-manifest.json` — a hash over
 * every emitted asset's content — against the revision currently pinned by the
 * cache manager. That is strictly more reliable than watching the Next build id
 * alone: the build id changes on every rebuild even when nothing shipped, while
 * the revision changes exactly when the bytes users download change.
 *
 * Crucially, updates are driven by the *running* worker polling this file, not
 * by the browser noticing that `service-worker.js` itself changed. That is what
 * lets the shell update without any hand-edited cache version.
 */

// @ts-nocheck — worker scope: `self` is a ServiceWorkerGlobalScope carrying the
// helpers attached by sibling modules, which the editor's DOM lib cannot model.
/* eslint-disable no-undef */

(function initUpdateChecker() {
  const { MANIFEST_URL, MESSAGES, UPDATE_CHECK_INTERVAL_MS } = self.SW_CONFIG;
  const { META_KEYS } = self.swCache;

  /** Serializes updates — concurrent triggers join the in-flight run. */
  let inFlight = null;

  /* ---------------------------------------------------------------------- */

  /** Fetches and shape-validates the deployment manifest. */
  async function fetchManifest() {
    const response = await fetch(MANIFEST_URL, {
      cache: "no-store",
      credentials: "same-origin",
    });

    if (!response.ok) {
      throw new Error(`Manifest request failed: HTTP ${response.status}`);
    }

    const manifest = await response.json();

    if (
      !manifest ||
      typeof manifest.revision !== "string" ||
      !Array.isArray(manifest.assets) ||
      manifest.assets.length === 0
    ) {
      throw new Error("Malformed sw-manifest.json");
    }

    return manifest;
  }

  /**
   * Downloads a revision into its own cache and commits it only once complete.
   *
   * @param {object} manifest    manifest describing the target revision
   * @param {boolean} isInitial  true for the very first install (no prior shell)
   */
  async function applyUpdate(manifest, { isInitial = false } = {}) {
    await self.swBroadcast(MESSAGES.UPDATE_STARTED, {
      revision: manifest.revision,
      buildId: manifest.buildId,
      totalAssets: manifest.assets.length,
      totalBytes: manifest.totalBytes ?? null,
      isInitial,
    });

    try {
      // Progress is throttled to whole percentage points to avoid flooding the
      // page with postMessage traffic on a several-hundred-asset build.
      let lastPercent = -1;

      const result = await self.swCache.populateShellCache(manifest, {
        onProgress: ({ completed, total, downloaded, reused }) => {
          const percent = Math.floor((completed / total) * 100);
          if (percent === lastPercent) return;
          lastPercent = percent;
          self.swBroadcast(MESSAGES.UPDATE_PROGRESS, {
            revision: manifest.revision,
            completed,
            total,
            downloaded,
            reused,
            percent,
          });
        },
      });

      // ---- the atomic switch -------------------------------------------
      await self.swCache.commitRevision(manifest);

      await self.swBroadcast(MESSAGES.CACHE_UPDATED, {
        revision: manifest.revision,
        buildId: manifest.buildId,
        downloaded: result.downloaded,
        reused: result.reused,
        skipped: result.skipped,
        total: result.total,
      });

      await self.swBroadcast(MESSAGES.UPDATE_FINISHED, {
        revision: manifest.revision,
        buildId: manifest.buildId,
        isInitial,
      });

      // A first install is already showing the build it just cached, so there
      // is nothing to reload for. Only a genuine upgrade prompts the user.
      await self.swBroadcast(
        isInitial ? MESSAGES.OFFLINE_READY : MESSAGES.NEW_VERSION_AVAILABLE,
        { revision: manifest.revision, buildId: manifest.buildId },
      );

      // Cleanup runs after the commit, never before it.
      await self.swCache.pruneCaches();

      return { updated: true, revision: manifest.revision };
    } catch (error) {
      // The live cache was never touched — roll back by dropping the partial.
      await self.swCache.discardRevision(manifest.revision);

      await self.swBroadcast(MESSAGES.UPDATE_FAILED, {
        revision: manifest.revision,
        reason: error?.message ?? String(error),
        isInitial,
      });

      throw error;
    }
  }

  /**
   * Checks whether the server is serving a different deployment and, if so,
   * downloads and commits it.
   *
   * @param {boolean} force  bypass the interval throttle (user-initiated /
   *                         install-time checks)
   */
  async function checkForUpdate({ force = false } = {}) {
    if (inFlight) return inFlight;

    inFlight = (async () => {
      const active = await self.swCache.getActiveRevision();

      if (!force && active) {
        const lastChecked = await self.swMeta.get(META_KEYS.lastChecked, 0);
        if (Date.now() - lastChecked < UPDATE_CHECK_INTERVAL_MS) {
          return { updated: false, reason: "throttled" };
        }
      }

      let manifest;
      try {
        manifest = await fetchManifest();
      } catch (error) {
        // Offline or a bad deploy: keep serving the cache we already have.
        console.warn("[sw] update check skipped:", error.message);
        return { updated: false, reason: "unreachable" };
      }

      await self.swMeta.set(META_KEYS.lastChecked, Date.now());

      if (manifest.revision === active) {
        return { updated: false, reason: "current", revision: active };
      }

      return applyUpdate(manifest, { isInitial: !active });
    })().finally(() => {
      inFlight = null;
    });

    return inFlight;
  }

  /** Snapshot of worker state, answered to the page's `GET_STATUS` command. */
  async function getStatus() {
    return {
      activeRevision: await self.swCache.getActiveRevision(),
      previousRevision: await self.swCache.getPreviousRevision(),
      lastCheckedAt: await self.swMeta.get(META_KEYS.lastChecked, 0),
      updating: inFlight !== null,
    };
  }

  self.swUpdater = { fetchManifest, checkForUpdate, getStatus };
})();
