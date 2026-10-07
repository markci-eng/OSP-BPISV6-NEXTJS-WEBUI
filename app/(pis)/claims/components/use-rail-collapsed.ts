"use client";

// WHETHER THE CONVEYOR'S RAIL IS FOLDED TO ITS ICON STRIP (user, 2026-10-05:
// "A, remember the state"). One setting for BOTH conveyors: fold it on Death
// Claim and Service Payables opens folded too, because they are worked by the
// same people at the same desk.
//
// IN localStorage, per browser, like the colour mode. It is a convenience, so a
// blocked or empty store simply means expanded.
//
// `useSyncExternalStore` and not state-plus-effect: the server snapshot is
// "expanded", so hydration agrees, and every mounted reader — and every other
// tab, through `storage` — follows a change without a provider.

import { useCallback, useSyncExternalStore } from "react";

const KEY = "claims.conveyor.railCollapsed";
/** Same-tab change signal; `storage` only fires in the OTHER tabs. */
const EVENT = "claims:rail-collapsed";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

function read(): boolean {
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function useRailCollapsed(): [boolean, (collapsed: boolean) => void] {
  const collapsed = useSyncExternalStore(subscribe, read, () => false);
  const setCollapsed = useCallback((next: boolean) => {
    try {
      if (next) window.localStorage.setItem(KEY, "1");
      else window.localStorage.removeItem(KEY);
    } catch {
      // Storage refused: the fold still works, it just is not remembered.
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);
  return [collapsed, setCollapsed];
}
