/**
 * Minimal promise-based IndexedDB key/value store for service-worker metadata.
 *
 * The worker's global scope is torn down and restarted by the browser at will,
 * so the "which cache is live?" pointer cannot live in a variable. It lives
 * here. IndexedDB (rather than the Cache API) because this is structured state,
 * and because the same database is the natural home for the future offline
 * write-queue / sync layer.
 *
 * Stored keys:
 *   activeRevision    – revision whose shell cache serves traffic right now
 *   previousRevision  – superseded revision, retained during the grace window
 *   previousRetiredAt – epoch ms at which `previousRevision` was superseded
 *   manifest:<rev>    – the asset manifest for a revision (enables hash reuse)
 *   lastCheckedAt     – epoch ms of the last deployment check
 */

// @ts-nocheck — worker scope: `self` is a ServiceWorkerGlobalScope carrying the
// helpers attached by sibling modules, which the editor's DOM lib cannot model.
/* eslint-disable no-undef */

(function initIdbKv() {
  const DB_NAME = "osp-sw-meta";
  const DB_VERSION = 1;
  const STORE_NAME = "kv";

  /** @type {Promise<IDBDatabase> | null} */
  let dbPromise = null;

  function openDatabase() {
    if (dbPromise) return dbPromise;

    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    }).catch((error) => {
      // Allow a later call to retry rather than caching a rejected promise.
      dbPromise = null;
      throw error;
    });

    return dbPromise;
  }

  /** Runs `work` inside a transaction and resolves once it has committed. */
  async function withStore(mode, work) {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, mode);
      const store = transaction.objectStore(STORE_NAME);
      let result;

      try {
        result = work(store);
      } catch (error) {
        transaction.abort();
        reject(error);
        return;
      }

      // `work` returns either an IDBRequest (get/put/delete) or nothing
      // (multi-op writes). Unwrap the former once the transaction commits.
      transaction.oncomplete = () =>
        resolve(result instanceof IDBRequest ? result.result : result);
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  }

  self.swMeta = {
    /** Reads a key, returning `fallback` when absent or when IDB is unusable. */
    async get(key, fallback = null) {
      try {
        const value = await withStore("readonly", (store) => store.get(key));
        return value === undefined || value === null ? fallback : value;
      } catch (error) {
        console.warn("[sw] meta.get failed", key, error);
        return fallback;
      }
    },

    /** Writes a key. Resolves only after the transaction has committed. */
    async set(key, value) {
      try {
        await withStore("readwrite", (store) => store.put(value, key));
        return true;
      } catch (error) {
        console.warn("[sw] meta.set failed", key, error);
        return false;
      }
    },

    /** Writes several keys inside a single transaction — used for the atomic
     *  pointer flip, so the app can never observe a half-updated pointer. */
    async setMany(entries) {
      try {
        await withStore("readwrite", (store) => {
          for (const [key, value] of Object.entries(entries)) {
            store.put(value, key);
          }
        });
        return true;
      } catch (error) {
        console.warn("[sw] meta.setMany failed", error);
        return false;
      }
    },

    async delete(key) {
      try {
        await withStore("readwrite", (store) => store.delete(key));
        return true;
      } catch (error) {
        console.warn("[sw] meta.delete failed", key, error);
        return false;
      }
    },
  };
})();
