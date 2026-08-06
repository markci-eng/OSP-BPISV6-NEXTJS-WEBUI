"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  SW_COMMAND,
  SW_MESSAGE,
  isSwMessage,
  type SwMessage,
} from "@/lib/pwa/messages";

const SW_URL = "/service-worker.js";

export interface ServiceWorkerState {
  /** The browser supports service workers and registration was attempted. */
  supported: boolean;
  /** Registration succeeded. */
  registered: boolean;
  /** The shell is fully cached — the app works without a connection. */
  offlineReady: boolean;
  /** A newer deployment is cached and waiting for a reload. */
  updateAvailable: boolean;
  /** A background download is in progress. */
  updating: boolean;
  /** Download progress, 0–100, while `updating`. */
  progress: number;
  /** Revision currently serving the app. */
  activeRevision: string | null;
  /** Reason the last update attempt failed, if any. */
  error: string | null;
}

const INITIAL_STATE: ServiceWorkerState = {
  supported: false,
  registered: false,
  offlineReady: false,
  updateAvailable: false,
  updating: false,
  progress: 0,
  activeRevision: null,
  error: null,
};

/** Registration is production-only by default; `NEXT_PUBLIC_SW_ENABLED=true`
 *  opts a dev build in (useful for testing offline behaviour locally). */
function isEnabled(): boolean {
  if (process.env.NEXT_PUBLIC_SW_ENABLED === "true") return true;
  if (process.env.NEXT_PUBLIC_SW_ENABLED === "false") return false;
  return process.env.NODE_ENV === "production";
}

/**
 * Registers the service worker and surfaces its lifecycle to React.
 *
 * The worker swaps its own cache atomically in the background, so
 * `updateAvailable` means "a fully-downloaded newer build is sitting in the
 * cache" — calling `applyUpdate()` is a plain reload, with nothing left to
 * fetch and no chance of a half-updated UI.
 */
export function useServiceWorker(): ServiceWorkerState & {
  checkForUpdate: () => void;
  applyUpdate: () => void;
  dismissUpdate: () => void;
} {
  const [state, setState] = useState<ServiceWorkerState>(INITIAL_STATE);
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);

  /** Posts a command to the controlling worker, if there is one. */
  const send = useCallback(
    (type: string, payload: Record<string, unknown> = {}) => {
      const target =
        navigator.serviceWorker?.controller ??
        registrationRef.current?.active ??
        null;
      target?.postMessage({ type, ...payload });
    },
    [],
  );

  const checkForUpdate = useCallback(() => {
    // Ask the browser whether `service-worker.js` itself changed, and the
    // worker whether the *deployment* changed. They are independent paths.
    registrationRef.current?.update().catch(() => {});
    send(SW_COMMAND.CHECK_FOR_UPDATE, { force: true });
  }, [send]);

  const applyUpdate = useCallback(() => {
    // If a replacement worker script is waiting, let it take over first.
    const waiting = registrationRef.current?.waiting;
    if (waiting) waiting.postMessage({ type: SW_COMMAND.SKIP_WAITING });
    window.location.reload();
  }, []);

  const dismissUpdate = useCallback(
    () => setState((prev) => ({ ...prev, updateAvailable: false })),
    [],
  );

  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }
    if (!isEnabled()) return;

    setState((prev) => ({ ...prev, supported: true }));

    let cancelled = false;

    const handleMessage = (event: MessageEvent) => {
      if (!isSwMessage(event.data)) return;
      const message: SwMessage = event.data;

      setState((prev) => {
        switch (message.type) {
          case SW_MESSAGE.UPDATE_STARTED:
            return { ...prev, updating: true, progress: 0, error: null };

          case SW_MESSAGE.UPDATE_PROGRESS:
            return { ...prev, updating: true, progress: message.percent };

          case SW_MESSAGE.UPDATE_FINISHED:
            return {
              ...prev,
              updating: false,
              progress: 100,
              activeRevision: message.revision,
            };

          case SW_MESSAGE.UPDATE_FAILED:
            // The previous build is untouched and still serving.
            return { ...prev, updating: false, error: message.reason };

          case SW_MESSAGE.NEW_VERSION_AVAILABLE:
            return { ...prev, updateAvailable: true, updating: false };

          case SW_MESSAGE.OFFLINE_READY:
            return {
              ...prev,
              offlineReady: true,
              updating: false,
              activeRevision: message.revision,
            };

          case SW_MESSAGE.STATUS:
            return {
              ...prev,
              activeRevision: message.activeRevision,
              offlineReady: Boolean(message.activeRevision),
              updating: message.updating,
            };

          default:
            return prev;
        }
      });
    };

    navigator.serviceWorker.addEventListener("message", handleMessage);

    navigator.serviceWorker
      .register(SW_URL, { scope: "/", updateViaCache: "none" })
      .then((registration) => {
        if (cancelled) return;
        registrationRef.current = registration;
        setState((prev) => ({ ...prev, registered: true }));

        // Pull the worker's current state so a page loaded into an already
        // installed worker reflects reality instead of the initial state.
        registration.active?.postMessage({ type: SW_COMMAND.GET_STATUS });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : String(error),
        }));
      });

    // Regaining connectivity is the highest-signal moment to look for a new
    // deployment — the SW `online` event is unreliable, so the page drives it.
    const handleOnline = () => checkForUpdate();

    // Returning to a long-lived tab is the second-best moment.
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        send(SW_COMMAND.CHECK_FOR_UPDATE);
      }
    };

    window.addEventListener("online", handleOnline);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelled = true;
      navigator.serviceWorker.removeEventListener("message", handleMessage);
      window.removeEventListener("online", handleOnline);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [checkForUpdate, send]);

  return { ...state, checkForUpdate, applyUpdate, dismissUpdate };
}
