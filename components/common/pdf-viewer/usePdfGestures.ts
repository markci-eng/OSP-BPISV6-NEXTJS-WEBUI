"use client";

import { useEffect, useRef, type RefObject } from "react";

const DOUBLE_TAP_MS = 300;
const DOUBLE_TAP_SLOP_PX = 30;
const TAP_MOVE_SLOP_PX = 12;
const DOUBLE_TAP_ZOOM = 1.8;

/**
 * Pinch-to-zoom and double-tap-to-zoom for touch pointers, feeding the same
 * zoom state the toolbar buttons use. The zoom value is read from a ref
 * (kept in sync separately) rather than the effect's dependency array, so a
 * zoom change mid-pinch doesn't tear down and reattach the listeners and
 * lose track of the active pointers.
 *
 * Zooming goes through `setZoomAtPoint` so the content under the pinch
 * midpoint (or double-tap point) stays visually anchored instead of
 * jumping/drifting — the midpoint is recomputed every frame from live
 * pointer positions, so translating the fingers together pans the content
 * at the same time as zooming it.
 */
export function usePdfGestures(
  targetRef: RefObject<HTMLElement | null>,
  zoomFactor: number,
  setZoomAtPoint: (next: number, clientX: number, clientY: number) => void,
) {
  const zoomRef = useRef(zoomFactor);

  useEffect(() => {
    zoomRef.current = zoomFactor;
  }, [zoomFactor]);

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return undefined;

    const pointers = new Map<number, { x: number; y: number }>();
    const downPositions = new Map<number, { x: number; y: number }>();
    let pinchStartDistance = 0;
    let pinchStartZoom = 1;
    let didPinch = false;
    let lastTapAt = 0;
    let lastTapPoint = { x: 0, y: 0 };
    let rafId: number | null = null;

    const distance = () => {
      const [a, b] = Array.from(pointers.values());
      if (!a || !b) return 0;
      return Math.hypot(a.x - b.x, a.y - b.y);
    };

    const midpoint = () => {
      const [a, b] = Array.from(pointers.values());
      if (!a || !b) return { x: 0, y: 0 };
      return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType !== "touch") return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      downPositions.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 2) {
        pinchStartDistance = distance();
        pinchStartZoom = zoomRef.current;
        didPinch = true;
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
          if (pointers.size !== 2) return;
          const ratio = distance() / pinchStartDistance;
          const mid = midpoint();
          setZoomAtPoint(pinchStartZoom * ratio, mid.x, mid.y);
        });
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      const downPos = downPositions.get(e.pointerId);
      downPositions.delete(e.pointerId);

      if (e.pointerType === "touch" && pointers.size === 1 && !didPinch) {
        // Only a gesture that barely moved between down and up is a tap
        // candidate — a vertical (or any direction) swipe must never be
        // mistaken for a tap, no matter where it happens to end, otherwise
        // two quick scroll swipes ending near the same spot would read as
        // a double-tap and zoom instead of just scrolling.
        const travel = downPos
          ? Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y)
          : Infinity;
        const wasTap = travel < TAP_MOVE_SLOP_PX;

        if (wasTap) {
          const now = Date.now();
          const dx = e.clientX - lastTapPoint.x;
          const dy = e.clientY - lastTapPoint.y;
          const isSameSpot = Math.hypot(dx, dy) < DOUBLE_TAP_SLOP_PX;
          if (now - lastTapAt < DOUBLE_TAP_MS && isSameSpot) {
            setZoomAtPoint(
              zoomRef.current > 1.1 ? 1 : DOUBLE_TAP_ZOOM,
              e.clientX,
              e.clientY,
            );
            lastTapAt = 0;
          } else {
            lastTapAt = now;
            lastTapPoint = { x: e.clientX, y: e.clientY };
          }
        } else {
          // A swipe breaks the double-tap chain — two taps separated by a
          // scroll gesture shouldn't combine into a double-tap.
          lastTapAt = 0;
        }
      }
      pointers.delete(e.pointerId);
      if (pointers.size < 2) pinchStartDistance = 0;
      // A pinch just ended once every finger involved in it has lifted —
      // only then is a fresh tap allowed to count toward double-tap again,
      // otherwise the second finger lifting off a pinch reads as a "tap"
      // and can spuriously toggle zoom on the next unrelated single tap.
      if (pointers.size === 0) didPinch = false;
    };

    // preventDefault() on pointermove isn't reliably honored by iOS Safari
    // for suppressing native pinch/scroll; a passive:false touchmove
    // listener is the historically reliable way to block it there.
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) e.preventDefault();
    };

    el.addEventListener("pointerdown", onPointerDown, { passive: true });
    el.addEventListener("pointermove", onPointerMove, { passive: false });
    el.addEventListener("pointerup", onPointerUp, { passive: true });
    el.addEventListener("pointercancel", onPointerUp, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointercancel", onPointerUp);
      el.removeEventListener("touchmove", onTouchMove);
    };
  }, [targetRef, setZoomAtPoint]);
}
