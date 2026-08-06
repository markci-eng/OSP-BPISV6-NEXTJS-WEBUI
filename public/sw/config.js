/**
 * Service worker configuration and shared constants.
 *
 * Loaded into the worker scope via `importScripts`. Everything here is
 * deployment-independent: cache *names* are derived from the manifest revision
 * at runtime, so no constant in this file ever needs to be bumped by hand.
 */

// @ts-nocheck — worker scope: `self` is a ServiceWorkerGlobalScope carrying the
// helpers attached by sibling modules, which the editor's DOM lib cannot model.
/* eslint-disable no-undef */

self.SW_CONFIG = {
  /**
   * Prefix for the atomically-versioned application-shell caches.
   * Real names look like `osp-ui-v9f2c1a8b3d4e5f60`.
   */
  SHELL_CACHE_PREFIX: "osp-ui-v",

  /** Long-lived runtime caches. Not part of the atomic shell set. */
  PAGES_CACHE: "osp-pages-v1",
  IMAGES_CACHE: "osp-images-v1",

  /** Entry ceilings for the runtime caches (simple FIFO trimming). */
  PAGES_CACHE_MAX_ENTRIES: 60,
  IMAGES_CACHE_MAX_ENTRIES: 80,

  /** Build fingerprint served by `scripts/generate-sw-manifest.mjs`. */
  MANIFEST_URL: "/sw-manifest.json",

  /** Self-contained page shown when an uncached route is opened offline. */
  OFFLINE_URL: "/offline.html",

  /** Minimum spacing between deployment checks (10 minutes). */
  UPDATE_CHECK_INTERVAL_MS: 10 * 60 * 1000,

  /**
   * How long a superseded shell cache is retained after an update commits.
   * Tabs that are still running the previous build keep resolving their lazy
   * chunks from it instead of 404ing against a server that no longer has them.
   */
  PREVIOUS_CACHE_GRACE_MS: 24 * 60 * 60 * 1000,

  /** Concurrent downloads while populating a new shell cache. */
  DOWNLOAD_CONCURRENCY: 6,

  /**
   * Paths that must always hit the network and are never cached.
   * Authenticated payloads must not be written to the Cache API — offline
   * write support belongs in a future IndexedDB sync layer instead.
   */
  NETWORK_ONLY_PREFIXES: ["/api/"],

  /** Message types broadcast to the page. Mirrored in `lib/pwa/messages.ts`. */
  MESSAGES: {
    UPDATE_STARTED: "UPDATE_STARTED",
    UPDATE_PROGRESS: "UPDATE_PROGRESS",
    UPDATE_FINISHED: "UPDATE_FINISHED",
    UPDATE_FAILED: "UPDATE_FAILED",
    NEW_VERSION_AVAILABLE: "NEW_VERSION_AVAILABLE",
    CACHE_UPDATED: "CACHE_UPDATED",
    OFFLINE_READY: "OFFLINE_READY",
    STATUS: "STATUS",
  },

  /** Message types accepted from the page. */
  COMMANDS: {
    CHECK_FOR_UPDATE: "CHECK_FOR_UPDATE",
    GET_STATUS: "GET_STATUS",
    SKIP_WAITING: "SKIP_WAITING",
  },
};

/** Broadcasts a message to every controlled client. */
self.swBroadcast = async function swBroadcast(type, payload = {}) {
  const clients = await self.clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });

  for (const client of clients) {
    client.postMessage({ type, ...payload });
  }
};
