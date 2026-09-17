"use client";

// IS THE SHELL A DESKTOP — the JavaScript half of the conveyor's split.
//
// WHY A SECOND MEASUREMENT EXISTS AT ALL. Most of the layout is CSS and needs no
// help, but four things on this page are decided in TypeScript rather than in a
// stylesheet: whether the rail is a bounded sticky column, which cap the account
// list is given, whether the list fills its wrapper, and whether the documents
// section believes it is in a rail. Those cannot be written as media queries
// because they are props, so something has to answer the same question the CSS
// is answering — and if the two answers disagree the rail is laid out for one
// arrangement inside the other.
//
// IT REPLACED `useTwoColumn`, which measured the WORKSPACE against 720px. That
// was the right question while the CSS asked it too; the conveyor now splits on
// the viewport at `lg`, to match the death claim (see `workspace-layout`), so a
// workspace measurement would have gone on saying "stacked" for every window
// between 1024 and about 1139 while the CSS had already gone to two columns.
//
// FALSE UNTIL MEASURED, so the server and the first client render agree and
// hydration has nothing to reconcile. The effect corrects it before paint.

import { useEffect, useState } from "react";
import { DESKTOP_SHELL_MIN } from "../workspace-layout";

/** Whether the viewport is at least the shell's desktop width. */
export function useDesktopShell(): boolean {
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(`(min-width: ${DESKTOP_SHELL_MIN}px)`);
    const sync = () => setDesktop(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  return desktop;
}
