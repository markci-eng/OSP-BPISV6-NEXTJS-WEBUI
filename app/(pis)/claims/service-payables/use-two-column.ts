"use client";

// Whether the workspace is currently two columns — the same question
// `workspace-layout`'s container query asks, asked from JavaScript.
//
// TWO PLACES NEED IT, and neither can be done in CSS. A service record opens in
// the page when the rail is beside it and in a DRAWER when it is not; and
// picking in the rail scrolls the main column into view only when the rail is
// sitting on top of it. Both are behaviour, not style.
//
// So the answer has to be derived the same way twice, and the risk is that the
// two derivations drift — which is exactly what happened before this file: the
// CSS split on a `xl` media query and the JS split on `window.innerWidth >=
// 1280`, and they agreed only for as long as nobody touched either. Here the
// hook and the query read the SAME element against the SAME two constants, so a
// change to one is a change to both.
//
// It reads the container's own width rather than the viewport's, which is the
// whole point of the repair — see the note on `TWO_COLUMN_MIN`.

import { useEffect, useState, type RefObject } from "react";
import { TWO_COLUMN_MIN, DESKTOP_SHELL_MIN } from "./workspace-layout";

/** The predicate itself, so the one-shot callers below can share it. */
export function isTwoColumn(workspace: HTMLElement | null): boolean {
  if (!workspace) return false;
  return (
    window.innerWidth >= DESKTOP_SHELL_MIN &&
    workspace.getBoundingClientRect().width >= TWO_COLUMN_MIN
  );
}

/**
 * Whether `ref`'s element is wide enough to be laid out as two columns.
 *
 * `false` until it has measured, so the server and the first client render
 * agree — the element does not exist on the server and has no width until it is
 * in the document. The layout ITSELF does not wait for this: the container query
 * paints the right columns on the first frame, and what settles a beat later is
 * only the drawer-or-page decision, which nothing has been able to act on yet.
 */
export function useTwoColumn(ref: RefObject<HTMLElement | null>): boolean {
  const [twoColumn, setTwoColumn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const sync = () => setTwoColumn(isTwoColumn(el));
    sync();

    // The element's own size, because the sidebar collapsing or the shell's
    // gutter changing moves it without the window moving at all — and the
    // window, because the `lg` floor is a viewport condition and a resize that
    // crosses it need not resize this element.
    const observer = new ResizeObserver(sync);
    observer.observe(el);
    window.addEventListener("resize", sync);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", sync);
    };
  }, [ref]);

  return twoColumn;
}
