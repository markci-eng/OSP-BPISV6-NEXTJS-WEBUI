/**
 * Runtime caching strategies.
 *
 * Each strategy is a pure request→response function so the fetch router in
 * `service-worker.js` stays a readable dispatch table.
 */

// @ts-nocheck — worker scope: `self` is a ServiceWorkerGlobalScope carrying the
// helpers attached by sibling modules, which the editor's DOM lib cannot model.
/* eslint-disable no-undef */

(function initStrategies() {
  const { PAGES_CACHE, IMAGES_CACHE, OFFLINE_URL, PAGES_CACHE_MAX_ENTRIES, IMAGES_CACHE_MAX_ENTRIES } =
    self.SW_CONFIG;

  /** Navigation network timeout — past this we prefer a cached page to a spinner. */
  const NAVIGATION_TIMEOUT_MS = 6000;

  /**
   * A response is only safe to persist if it is a complete, same-origin,
   * non-redirected success. Partial (206) and opaque responses are rejected:
   * caching either produces a page that renders wrong rather than not at all.
   */
  function isCacheable(response) {
    return Boolean(
      response &&
        response.ok &&
        response.status === 200 &&
        !response.redirected &&
        (response.type === "basic" || response.type === "default"),
    );
  }

  /** `fetch` with an abortable deadline. */
  async function fetchWithTimeout(request, timeoutMs) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      return await fetch(request, { signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
  }

  /* ---------------------------------------------------------------------- */

  /** Never cached. Used for API traffic and every non-GET request. */
  function networkOnly(request) {
    return fetch(request);
  }

  /**
   * Cache First — for the immutable, content-hashed build output.
   *
   * Resolves against the versioned shell (live cache, then the retained
   * previous one). A miss falls through to the network and self-heals the live
   * cache so a request that raced the install is not permanently uncached.
   */
  async function cacheFirst(request) {
    const cached = await self.swCache.matchShell(request);
    if (cached) return cached;

    const response = await fetch(request);

    if (isCacheable(response)) {
      const activeRevision = await self.swCache.getActiveRevision();
      if (activeRevision) {
        const cache = await caches.open(
          self.swCache.cacheNameFor(activeRevision),
        );
        await cache.put(request, response.clone());
      }
    }

    return response;
  }

  /**
   * Network First — for navigations.
   *
   * HTML is server-rendered per role and per session here, so the network copy
   * always wins when it is available. The cached copy exists purely to make a
   * previously-visited route openable offline.
   */
  async function networkFirst(request) {
    const cache = await caches.open(PAGES_CACHE);

    try {
      const response = await fetchWithTimeout(request, NAVIGATION_TIMEOUT_MS);

      // Auth redirects (`/login`) and error pages are intentionally not stored:
      // caching them would pin a signed-out shell into the offline experience.
      if (isCacheable(response)) {
        await cache.put(request, response.clone());
        // Trimming is opportunistic — it must never delay or fail the response.
        self.swCache.trimCache(PAGES_CACHE, PAGES_CACHE_MAX_ENTRIES).catch(() => {});
      }

      return response;
    } catch {
      const cached =
        (await cache.match(request)) ||
        (await cache.match(request, { ignoreSearch: true }));
      if (cached) return cached;

      return offlineFallback();
    }
  }

  /**
   * Stale While Revalidate — for images.
   *
   * Returns the cached bitmap immediately and refreshes it in the background.
   * Kept in its own unversioned cache: artwork is large, changes rarely, and
   * has no business being re-downloaded on every deployment.
   */
  async function staleWhileRevalidate(request) {
    const cache = await caches.open(IMAGES_CACHE);
    const cached = await cache.match(request);

    const network = fetch(request)
      .then(async (response) => {
        if (isCacheable(response)) {
          await cache.put(request, response.clone());
          self.swCache
            .trimCache(IMAGES_CACHE, IMAGES_CACHE_MAX_ENTRIES)
            .catch(() => {});
        }
        return response;
      })
      .catch(() => undefined);

    if (cached) return cached;

    const response = await network;
    if (response) return response;

    // A missing image must not surface as a browser error page inside an <img>.
    return new Response("", { status: 504, statusText: "Offline" });
  }

  /**
   * The friendly offline document, served when a never-visited route is opened
   * without a connection. Falls back to an inline response if even the fallback
   * page is missing, so the user never sees a browser error screen.
   */
  async function offlineFallback() {
    const fallback = await self.swCache.matchShell(OFFLINE_URL);
    if (fallback) return fallback;

    const pages = await caches.open(PAGES_CACHE);
    const cachedFallback = await pages.match(OFFLINE_URL);
    if (cachedFallback) return cachedFallback;

    return new Response(
      "<!doctype html><meta charset=utf-8><title>Offline</title>" +
        "<body style=\"font-family:system-ui;padding:2rem\">" +
        "<h1>You are offline</h1><p>Reconnect and try again.</p>",
      {
        status: 503,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      },
    );
  }

  self.swStrategies = {
    networkOnly,
    cacheFirst,
    networkFirst,
    staleWhileRevalidate,
    offlineFallback,
  };
})();
