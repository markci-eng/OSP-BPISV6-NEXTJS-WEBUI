"use client";

import { useEffect, useRef, type RefObject } from "react";

const DOUBLE_TAP_MS = 300;
const DOUBLE_TAP_ZOOM = 1.8;

/**
 * Pinch-to-zoom and double-tap-to-zoom for touch pointers, feeding the same
 * zoom state the toolbar buttons use. The zoom value is read from a ref
 * (kept in sync separately) rather than the effect's dependency array, so a
 * zoom change mid-pinch doesn't tear down and reattach the listeners and
 * lose track of the active pointers.
 */
export function usePdfGestures(
  targetRef: RefObject<HTMLElement | null>,
  zoomFactor: number,
  setZoom: (next: number) => void,
) {
  const zoomRef = useRef(zoomFactor);

  useEffect(() => {
    zoomRef.current = zoomFactor;
  }, [zoomFactor]);

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return undefined;

    const pointers = new Map<number, { x: number; y: number }>();
    let pinchStartDistance = 0;
    let pinchStartZoom = 1;
    let lastTapAt = 0;
    let rafId: number | null = null;

    const distance = () => {
      const [a, b] = Array.from(pointers.values());
      if (!a || !b) return 0;
      return Math.hypot(a.x - b.x, a.y - b.y);
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType !== "touch") return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 2) {
        pinchStartDistance = distance();
        pinchStartZoom = zoomRef.current;
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!pointers.has(e.pointerId)) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 2 && pinchStartDistance > 0) {
        e.preventDefault();
        // Coalesce to one zoom update per frame so pinch stays smooth
        // instead of re-rendering the PDF canvas on every touchmove.
        if (rafId !== null) return;
        rafId = requestAnimationFrame(() => {
          rafId = null;
          const ratio = distance() / pinchStartDistance;
          setZoom(pinchStartZoom * ratio);
        });
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (e.pointerType === "touch" && pointers.size === 1) {
        const now = Date.now();
        if (now - lastTapAt < DOUBLE_TAP_MS) {
          setZoom(zoomRef.current > 1.1 ? 1 : DOUBLE_TAP_ZOOM);
          lastTapAt = 0;
        } else {
          lastTapAt = now;
        }
      }
      pointers.delete(e.pointerId);
      if (pointers.size < 2) pinchStartDistance = 0;
    };

    el.addEventListener("pointerdown", onPointerDown, { passive: true });
    el.addEventListener("pointermove", onPointerMove, { passive: false });
    el.addEventListener("pointerup", onPointerUp, { passive: true });
    el.addEventListener("pointercancel", onPointerUp, { passive: true });

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointercancel", onPointerUp);
    };
  }, [targetRef, setZoom]);
}
