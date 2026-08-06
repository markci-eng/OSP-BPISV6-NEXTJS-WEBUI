"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useServiceWorker } from "@/hooks/useServiceWorker";

const UPDATE_TOAST_ID = "sw-update-available";
const OFFLINE_TOAST_ID = "sw-offline-ready";

/**
 * Headless PWA controller.
 *
 * Registers the service worker and turns its lifecycle events into user-facing
 * notifications. Renders nothing itself, so it can sit at the top of the tree
 * without affecting layout.
 *
 * The reload prompt only appears once the new build is *fully* cached, so
 * accepting it is instant and cannot produce a partially updated UI.
 */
export function ServiceWorkerProvider() {
  const { offlineReady, updateAvailable, applyUpdate, dismissUpdate } =
    useServiceWorker();

  const announcedUpdate = useRef(false);
  const announcedOffline = useRef(false);

  useEffect(() => {
    if (!updateAvailable || announcedUpdate.current) return;
    announcedUpdate.current = true;

    toast.info("A new version is available", {
      id: UPDATE_TOAST_ID,
      description: "It's already downloaded — refresh to start using it.",
      duration: Infinity,
      action: { label: "Refresh", onClick: applyUpdate },
      onDismiss: dismissUpdate,
    });
  }, [updateAvailable, applyUpdate, dismissUpdate]);

  useEffect(() => {
    if (!offlineReady || announcedOffline.current) return;
    announcedOffline.current = true;

    toast.success("Ready to work offline", {
      id: OFFLINE_TOAST_ID,
      description: "The app has been saved to this device.",
      duration: 4000,
    });
  }, [offlineReady]);

  return null;
}
