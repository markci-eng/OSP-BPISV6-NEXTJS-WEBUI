"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

const MIN_ZOOM = 0.4;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.15;
const RESIZE_DEBOUNCE_MS = 150;

/**
 * Owns the PDF viewer's zoom/rotation/fit-width state and measures the
 * scrollable container's width (debounced) so pages can be sized to fill it.
 * Zoom always multiplies on top of "fit width" (factor 1) so toolbar
 * buttons, pinch gestures, and container resizes all funnel through one
 * number instead of fighting each other.
 */
export function usePdfZoom() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [zoomFactor, setZoomFactorState] = useState(1);
  const [rotation, setRotation] = useState<0 | 90 | 180 | 270>(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const pendingScrollRef = useRef<{ left: number; top: number } | null>(null);
  const containerWidthRef = useRef(containerWidth);
  const zoomFactorRef = useRef(zoomFactor);

  useEffect(() => {
    containerWidthRef.current = containerWidth;
  }, [containerWidth]);

  useEffect(() => {
    zoomFactorRef.current = zoomFactor;
  }, [zoomFactor]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;

    let timeoutId: number | undefined;
    const observer = new ResizeObserver((entries) => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        const width = entries[0]?.contentRect.width;
        if (width) setContainerWidth(Math.floor(width));
      }, RESIZE_DEBOUNCE_MS);
    });

    observer.observe(el);
    return () => {
      window.clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const handler = () => {
      setIsFullscreen(
        Boolean(document.fullscreenElement) &&
          document.fullscreenElement === containerRef.current,
      );
    };
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const setZoom = useCallback((next: number) => {
    setZoomFactorState(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next)));
  }, []);

  // Zooms while keeping the content under (clientX, clientY) visually
  // anchored in place — e.g. keep the point between two pinching fingers
  // stationary instead of the page jumping/drifting under them. The scroll
  // correction is computed here (while we still know the pre-zoom layout)
  // and applied in the layout effect below, once the new width has been
  // committed to the DOM but before the browser paints.
  const setZoomAtPoint = useCallback(
    (nextRaw: number, clientX: number, clientY: number) => {
      const el = containerRef.current;
      const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, nextRaw));
      const width = containerWidthRef.current;
      if (!el || width <= 0) {
        setZoomFactorState(next);
        return;
      }
      const oldPageWidth = Math.max(120, Math.floor(width * zoomFactorRef.current));
      const newPageWidth = Math.max(120, Math.floor(width * next));
      const scaleRatio = newPageWidth / oldPageWidth;
      const rect = el.getBoundingClientRect();
      const anchorX = el.scrollLeft + (clientX - rect.left);
      const anchorY = el.scrollTop + (clientY - rect.top);
      pendingScrollRef.current = {
        left: anchorX * scaleRatio - (clientX - rect.left),
        top: anchorY * scaleRatio - (clientY - rect.top),
      };
      setZoomFactorState(next);
    },
    [],
  );

  const zoomIn = useCallback(() => {
    setZoomFactorState((z) =>
      Math.min(MAX_ZOOM, Math.round((z + ZOOM_STEP) * 100) / 100),
    );
  }, []);

  const zoomOut = useCallback(() => {
    setZoomFactorState((z) =>
      Math.max(MIN_ZOOM, Math.round((z - ZOOM_STEP) * 100) / 100),
    );
  }, []);

  const resetZoom = useCallback(() => setZoomFactorState(1), []);

  const rotate = useCallback(() => {
    setRotation((r) => (((r + 90) % 360) as 0 | 90 | 180 | 270));
  }, []);

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      el.requestFullscreen?.();
    }
  }, []);

  const pageWidth = Math.max(120, Math.floor(containerWidth * zoomFactor));

  // Runs after the width-driven layout change from a zoom update has been
  // committed but before paint, so the corrected scroll position never
  // visibly flashes at the old position first.
  useLayoutEffect(() => {
    const el = containerRef.current;
    const pending = pendingScrollRef.current;
    if (!el || !pending) return;
    el.scrollLeft = pending.left;
    el.scrollTop = pending.top;
    pendingScrollRef.current = null;
  }, [pageWidth]);

  return {
    containerRef,
    pageWidth,
    zoomFactor,
    rotation,
    isFullscreen,
    isFitWidth: zoomFactor === 1,
    setZoom,
    setZoomAtPoint,
    zoomIn,
    zoomOut,
    resetZoom,
    rotate,
    toggleFullscreen,
  };
}
