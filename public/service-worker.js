/**
 * One St. Peter — Life Plan Operations · Service Worker
 * =====================================================
 *
 * Entry point and request router. All real work lives in the modules below,
 * loaded with `importScripts` (the browser revalidates imported worker scripts
 * on every update check, so they can never go stale):
 *
 *   sw/config.js         constants + client broadcast helper
 *   sw/idb-kv.js         persistent metadata store (the cache pointer)
 *   sw/cache-manager.js  atomic, versioned shell caches
 *   sw/update-checker.js deployment detection + background update
 *   sw/strategies.js     runtime caching strategies
 *
 * ## Lifecycle
 *
 *   install   → download + commit the current deployment, then skipWaiting()
 *   activate  → clients.claim(), prune retired caches, re-check for updates
 *   fetch     → route by request type (see `routeRequest` below)
 *   message   → handle commands from the page
 *
 * ## Why updates do not depend on this file changing
 *
 * A conventional worker only updates when its own bytes change, which forces a
 * hand-edited `CACHE_NAME` on every release. Here the *running* worker polls
 * `/sw-manifest.json` — regenerated on each build — and swaps the shell cache
 * itself. This file can stay byte-identical across a hundred deployments.
 */

// @ts-nocheck — worker scope: `self` is a ServiceWorkerGlobalScope carrying the
// helpers attached by the modules below, which the editor's DOM lib cannot model.
/* eslint-disable no-undef */

importScripts(
  "/sw/config.js",
  "/sw/idb-kv.js",
  "/sw/cache-manager.js",
  "/sw/update-checker.js",
  "/sw/strategies.js",
);

const { MESSAGES, COMMANDS, MANIFEST_URL, NETWORK_ONLY_PREFIXES } =
  self.SW_CONFIG;

/* -------------------------------------------------------------------------- */
/* Install                                                                    */
/* -------------------------------------------------------------------------- */

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      try {
        // Downloads the whole shell and commits it atomically. On a fresh
        // install this is what makes the app usable offline.
        await self.swUpdater.checkForUpdate({ force: true });
      } catch (error) {
        // Deliberately non-fatal. Because the live cache is chosen by a
        // pointer rather than by this worker's identity, an installation whose
        // precache failed still serves the previously cached build correctly,
        // and the checker will retry on the next activation or navigation.
        console.error("[sw] install precache failed (non-fatal):", error);
      }

      await self.skipWaiting();
    })(),
  );
});

/* -------------------------------------------------------------------------- */
/* Activate                                                                   */
/* -------------------------------------------------------------------------- */

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      await self.clients.claim();

      // Removes shell caches that are neither live nor inside the retention
      // window. Runs after the pointer is settled, never before.
      await self.swCache.pruneCaches();

      // Covers the case where the worker script itself was redeployed: the new
      // worker may still be pointing at an older shell revision.
      self.swUpdater.checkForUpdate({ force: true }).catch(() => {});
    })(),
  );
});

/* -------------------------------------------------------------------------- */
/* Fetch routing                                                              */
/* -------------------------------------------------------------------------- */

const IMAGE_EXTENSIONS = /\.(?:png|jpe?g|gif|webp|avif|svg|ico|bmp)$/i;
const STATIC_EXTENSIONS = /\.(?:js|mjs|css|woff2?|ttf|otf|eot)$/i;

/** Debounces the navigation-triggered update check to one per minute. */
let lastNavigationCheck = 0;

function scheduleUpdateCheck() {
  const now = Date.now();
  if (now - lastNavigationCheck < 60_000) return;
  lastNavigationCheck = now;
  self.swUpdater.checkForUpdate().catch(() => {});
}

/**
 * Picks a strategy for a request, or returns `null` to let the browser handle
 * it untouched.
 */
function routeRequest(request, url) {
  // --- Never intercepted -------------------------------------------------
  //
  // Non-GET, cross-origin, and Range requests are passed straight through.
  // Intercepting them buys nothing and risks breaking uploads, third-party
  // endpoints and media seeking.
  if (request.method !== "GET") return null;
  if (url.origin !== self.location.origin) return null;
  if (request.headers.has("range")) return null;

  // Worker infrastructure must always be read live, never from a cache.
  if (url.pathname === MANIFEST_URL) return null;
  if (url.pathname === "/service-worker.js") return null;
  if (url.pathname.startsWith("/sw/")) return null;

  // Authenticated API traffic. Responses are never written to the Cache API.
  // A future offline write-queue / IndexedDB sync layer hooks in here.
  if (NETWORK_ONLY_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))) {
    return null;
  }

  // React Server Component payloads for client-side navigation. These are
  // route-specific and session-specific; a hard navigation (handled below)
  // is the correct offline path for them.
  if (request.headers.get("RSC") === "1") return null;
  if (url.searchParams.has("_rsc")) return null;

  // --- Strategies --------------------------------------------------------

  // HTML documents: network first, cached copy as the offline fallback.
  if (request.mode === "navigate") {
    scheduleUpdateCheck();
    return self.swStrategies.networkFirst;
  }

  // Images (including Next's optimizer output): stale while revalidate.
  if (
    request.destination === "image" ||
    url.pathname.startsWith("/_next/image") ||
    IMAGE_EXTENSIONS.test(url.pathname)
  ) {
    return self.swStrategies.staleWhileRevalidate;
  }

  // Build output, fonts and styles: cache first against the versioned shell.
  if (
    url.pathname.startsWith("/_next/static/") ||
    STATIC_EXTENSIONS.test(url.pathname) ||
    ["script", "style", "font", "worker"].includes(request.destination)
  ) {
    return self.swStrategies.cacheFirst;
  }

  // Anything precached but not matched above (manifest.json, icons, …).
  return async (req) =>
    (await self.swCache.matchShell(req)) ?? self.swStrategies.networkOnly(req);
}

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  const strategy = routeRequest(event.request, url);
  if (!strategy) return;

  event.respondWith(
    Promise.resolve(strategy(event.request)).catch(async (error) => {
      console.warn("[sw] request failed:", url.pathname, error?.message);

      // A failed document request must land on the friendly offline page
      // rather than the browser's error screen.
      if (event.request.mode === "navigate") {
        return self.swStrategies.offlineFallback();
      }

      return new Response("", { status: 504, statusText: "Offline" });
    }),
  );
});

/* -------------------------------------------------------------------------- */
/* Client messages                                                            */
/* -------------------------------------------------------------------------- */

self.addEventListener("message", (event) => {
  const type = event.data?.type;
  if (!type) return;

  switch (type) {
    // Sent by the page on load, on regaining connectivity, and on demand.
    case COMMANDS.CHECK_FOR_UPDATE:
      event.waitUntil(
        self.swUpdater
          .checkForUpdate({ force: Boolean(event.data.force) })
          .catch(() => {}),
      );
      break;

    case COMMANDS.GET_STATUS:
      event.waitUntil(
        (async () => {
          const status = await self.swUpdater.getStatus();
          const target = event.source;
          if (target) target.postMessage({ type: MESSAGES.STATUS, ...status });
        })(),
      );
      break;

    // Sent when a *worker script* update is waiting (as opposed to a shell
    // update, which this worker applies on its own).
    case COMMANDS.SKIP_WAITING:
      self.skipWaiting();
      break;

    default:
      break;
  }
});

/* -------------------------------------------------------------------------- */
/* Background triggers                                                        */
/* -------------------------------------------------------------------------- */

// Fired in browsers that support it (Chrome/Edge, installed PWAs). The page
// also drives checks on its own `online` event, so this is an optimisation
// rather than a dependency.
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "osp-update-check") {
    event.waitUntil(self.swUpdater.checkForUpdate({ force: true }).catch(() => {}));
  }
});
