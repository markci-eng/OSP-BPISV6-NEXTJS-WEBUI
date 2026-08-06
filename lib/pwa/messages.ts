/**
 * Typed contract for the service worker ↔ page channel.
 *
 * These string literals mirror `SW_CONFIG.MESSAGES` / `SW_CONFIG.COMMANDS` in
 * `public/sw/config.js`. The worker cannot import from here (it runs as plain
 * JS outside the bundle), so the two lists are kept deliberately small and
 * declared side by side — change one, change the other.
 */

/** Messages the worker broadcasts to the page. */
export const SW_MESSAGE = {
  /** A background download of a new deployment has begun. */
  UPDATE_STARTED: "UPDATE_STARTED",
  /** Progress ticks while the new shell downloads (whole percent steps). */
  UPDATE_PROGRESS: "UPDATE_PROGRESS",
  /** Every asset landed and the cache pointer was switched. */
  UPDATE_FINISHED: "UPDATE_FINISHED",
  /** The download failed; the previous build is still intact and serving. */
  UPDATE_FAILED: "UPDATE_FAILED",
  /** A newer build is cached and ready — the page should offer a reload. */
  NEW_VERSION_AVAILABLE: "NEW_VERSION_AVAILABLE",
  /** Emitted alongside the commit, carrying download/reuse counts. */
  CACHE_UPDATED: "CACHE_UPDATED",
  /** First install finished — the app now works offline. No reload needed. */
  OFFLINE_READY: "OFFLINE_READY",
  /** Reply to a GET_STATUS command. */
  STATUS: "STATUS",
} as const;

/** Commands the page sends to the worker. */
export const SW_COMMAND = {
  CHECK_FOR_UPDATE: "CHECK_FOR_UPDATE",
  GET_STATUS: "GET_STATUS",
  SKIP_WAITING: "SKIP_WAITING",
} as const;

export type SwMessageType = (typeof SW_MESSAGE)[keyof typeof SW_MESSAGE];
export type SwCommandType = (typeof SW_COMMAND)[keyof typeof SW_COMMAND];

interface RevisionInfo {
  revision: string;
  buildId?: string;
}

export type SwMessage =
  | ({
      type: typeof SW_MESSAGE.UPDATE_STARTED;
      totalAssets: number;
      totalBytes: number | null;
      isInitial: boolean;
    } & RevisionInfo)
  | ({
      type: typeof SW_MESSAGE.UPDATE_PROGRESS;
      completed: number;
      total: number;
      downloaded: number;
      reused: number;
      percent: number;
    } & RevisionInfo)
  | ({ type: typeof SW_MESSAGE.UPDATE_FINISHED; isInitial: boolean } & RevisionInfo)
  | {
      type: typeof SW_MESSAGE.UPDATE_FAILED;
      revision: string;
      reason: string;
      isInitial: boolean;
    }
  | ({ type: typeof SW_MESSAGE.NEW_VERSION_AVAILABLE } & RevisionInfo)
  | ({
      type: typeof SW_MESSAGE.CACHE_UPDATED;
      downloaded: number;
      reused: number;
      total: number;
    } & RevisionInfo)
  | ({ type: typeof SW_MESSAGE.OFFLINE_READY } & RevisionInfo)
  | {
      type: typeof SW_MESSAGE.STATUS;
      activeRevision: string | null;
      previousRevision: string | null;
      lastCheckedAt: number;
      updating: boolean;
    };

/** Narrowing guard for `MessageEvent.data` coming off the SW channel. */
export function isSwMessage(data: unknown): data is SwMessage {
  return (
    typeof data === "object" &&
    data !== null &&
    typeof (data as { type?: unknown }).type === "string" &&
    (Object.values(SW_MESSAGE) as string[]).includes(
      (data as { type: string }).type,
    )
  );
}
