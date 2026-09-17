"use client";

// THE FLOATING DOCK — the Gmail-compose / Messenger-thread pattern, for claims.
//
// A processor works one claim while keeping another in view: "does this branch
// always file late?", "what did I put on the last one from this chapel?". The
// drawer the current dashboard uses cannot answer that, because a drawer is
// modal — it owns the screen until it is dismissed, so consulting a second
// claim means abandoning the first.
//
// A dock does not. Each claim opens as its own window along the bottom edge,
// several at once, and the page behind them stays live: the queue still
// scrolls, the rail still searches, and a window can be folded down to its
// title bar rather than closed. That is exactly what Gmail's compose windows
// and Messenger's chat threads do, and for the same reason — the work is
// secondary to the surface that spawned it, and there is more than one of it.
//
// WHAT MAKES THIS SAFE TO KEEP MOUNTED. The dock is `position: fixed` and spans
// the bottom of the viewport, so it lies over the page whether or not any window
// is open. It is therefore `pointer-events: none`, and only the windows inside
// it take `pointer-events: auto`. Without that pairing an empty dock would
// swallow every click along the bottom of the page — the same class of failure
// as a conditionally mounted dialog stranding the page, and the reason this is
// never `{open && <Dock/>}` either. The container is always rendered; the LIST
// is what is empty.
//
// STATE LIVES HERE, NOT IN THE PAGE. Windows outlive the row that opened them —
// the queue can re-sort, filter or re-render underneath and the open windows are
// unaffected — so the dock owns them, and the page reads them through the hook.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { Box, Flex, IconButton, Text } from "@chakra-ui/react";
import { LuChevronDown, LuChevronUp, LuX } from "react-icons/lu";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";

/**
 * One open window.
 *
 * `kind` and `payload` rather than a stored `ReactNode`: state that holds JSX
 * cannot be compared, serialised or re-rendered from fresh data — a window
 * opened this morning would keep painting this morning's claim. A key and an id
 * let the renderer look the record up again on every paint.
 */
export interface DockWindow {
  /** Unique per window. Opening the same id twice focuses rather than duplicates. */
  id: string;
  /** What kind of thing this window works — the renderer switches on it. */
  kind: string;
  /** The record's key, e.g. a claim reference. */
  payload: string;
  /** Bold line in the title bar. */
  title: string;
  /** Small line under it. */
  subtitle?: string;
  /** Folded down to its title bar. */
  minimized: boolean;
}

interface FloatingDockValue {
  windows: DockWindow[];
  /** Opens a window, or focuses and unfolds one already open with this id. */
  open: (window: Omit<DockWindow, "minimized">) => void;
  close: (id: string) => void;
  toggleMinimize: (id: string) => void;
  /** True when a window with this id is open — for marking the row that spawned it. */
  isOpen: (id: string) => boolean;
}

const FloatingDockContext = createContext<FloatingDockValue | null>(null);

/**
 * How many windows may stand open at once.
 *
 * Three, and the number is the dock's width divided by a window's: a fourth
 * would either overflow the viewport or force every window narrower than its
 * content reads at. Gmail caps itself for the same reason. Opening a fourth
 * closes the OLDEST — the one least likely to still be in play — rather than
 * refusing to open, which would make the queue's rows unreliable.
 */
const MAX_WINDOWS = 3;

export function FloatingDockProvider({ children }: { children: ReactNode }) {
  const [windows, setWindows] = useState<DockWindow[]>([]);

  const open = useCallback((next: Omit<DockWindow, "minimized">) => {
    setWindows((current) => {
      const existing = current.find((w) => w.id === next.id);
      // Already open: unfold it and move it to the near end of the dock, which
      // is what "focus" means for a row of windows. Do NOT rebuild it — a
      // rebuilt window would lose any scroll position inside its body.
      if (existing) {
        return [
          ...current.filter((w) => w.id !== next.id),
          { ...existing, minimized: false },
        ];
      }
      const opened: DockWindow = { ...next, minimized: false };
      const room = [...current, opened];
      return room.length > MAX_WINDOWS ? room.slice(room.length - MAX_WINDOWS) : room;
    });
  }, []);

  const close = useCallback((id: string) => {
    setWindows((current) => current.filter((w) => w.id !== id));
  }, []);

  const toggleMinimize = useCallback((id: string) => {
    setWindows((current) =>
      current.map((w) => (w.id === id ? { ...w, minimized: !w.minimized } : w)),
    );
  }, []);

  const isOpen = useCallback(
    (id: string) => windows.some((w) => w.id === id),
    [windows],
  );

  // Escape closes the nearest window — the last in the row, which is the one
  // most recently opened or focused. Only when something is open, so the key is
  // left alone for the drawers and dialogs elsewhere on the page.
  useEffect(() => {
    if (windows.length === 0) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setWindows((current) => current.slice(0, -1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [windows.length]);

  const value = useMemo(
    () => ({ windows, open, close, toggleMinimize, isOpen }),
    [windows, open, close, toggleMinimize, isOpen],
  );

  return (
    <FloatingDockContext.Provider value={value}>
      {children}
    </FloatingDockContext.Provider>
  );
}

export function useFloatingDock(): FloatingDockValue {
  const value = useContext(FloatingDockContext);
  if (!value) {
    throw new Error("useFloatingDock must be used inside a FloatingDockProvider");
  }
  return value;
}

/* ------------------------------ the dock itself ------------------------------ */

/**
 * Where the dock sits above the bottom edge.
 *
 * On a phone the shell's bottom navigation overlays the last 62px of the
 * viewport, so a dock at `bottom: 0` would have its title bars underneath it.
 * `env()` adds the home-indicator inset on the phones that have one and
 * resolves to 0 everywhere else. From `lg` there is no bottom navigation and
 * the dock sits on the edge, as Gmail's does.
 */
const DOCK_BOTTOM = {
  base: "calc(62px + env(safe-area-inset-bottom, 0px))",
  lg: "0px",
} as const;

/** Expanded window body height. Capped so a short laptop still shows the queue. */
const WINDOW_BODY_HEIGHT = { base: "50vh", lg: "min(420px, 55vh)" } as const;

interface FloatingDockProps {
  /**
   * Draws a window's body. A slot rather than stored JSX, for the reason given
   * over {@link DockWindow} — the body is rebuilt from the record on every
   * paint, so it can never show a stale copy.
   */
  renderBody: (window: DockWindow) => ReactNode;
  /**
   * The column the windows may cover — the WORK column, not the whole viewport.
   *
   * WHY THIS EXISTS. Gmail docks its compose windows to the bottom-right
   * because the right of a mail list is empty. Here the right is the QUEUE, and
   * a window that covers it hides the one control you need to pick the claim
   * you were going to compare against — which is the entire point of opening
   * the window. So the dock is confined to the work column instead.
   *
   * MEASURED, not assumed. The obvious version of this is a constant: the shell
   * spends 352px before the content starts (a 300px sidebar, 8px of shell
   * padding, 44px of gutter). But that number is only true while the sidebar is
   * open, and it collapses. Reading the element's own box keeps the dock right
   * through a collapse, a resize, and any future change to the shell's widths.
   *
   * Omit it and the dock falls back to the bottom-right of the viewport.
   */
  boundsRef?: RefObject<HTMLElement | null>;
}

/** The measured horizontal band the dock is confined to. */
interface DockBounds {
  left: number;
  width: number;
}

/**
 * Tracks an element's horizontal box.
 *
 * `ResizeObserver` catches the element changing size — a sidebar collapsing
 * beside it, the grid re-laying out — and the window listener catches the page
 * moving under it. Both write the same state, and it is only ever read at `lg`
 * and above, where the dock is confined at all.
 */
function useElementBounds(ref?: RefObject<HTMLElement | null>): DockBounds | null {
  const [bounds, setBounds] = useState<DockBounds | null>(null);

  useEffect(() => {
    const el = ref?.current;
    if (!el) return;

    const measure = () => {
      const box = el.getBoundingClientRect();
      setBounds((current) =>
        current && current.left === box.left && current.width === box.width
          ? // Same numbers: return the SAME object so this never schedules a
            // render. A resize observer fires on every animation frame of a
            // drag, and a fresh object each time would re-render the dock
            // throughout it.
            current
          : { left: box.left, width: box.width },
      );
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [ref]);

  return bounds;
}

/**
 * The row of open windows, pinned to the bottom-right of the viewport.
 *
 * Render it ONCE, high in the page, inside a {@link FloatingDockProvider}.
 */
export function FloatingDock({ renderBody, boundsRef }: FloatingDockProps) {
  const { windows, close, toggleMinimize } = useFloatingDock();
  const bounds = useElementBounds(boundsRef);

  // Confined to the work column once it has been measured — see `boundsRef`.
  // Until then, and on any width where the columns are stacked, the dock falls
  // back to the viewport's own bottom-right.
  const confined = bounds
    ? {
        left: { base: 0, lg: `${bounds.left}px` },
        width: { base: "auto", lg: `${bounds.width}px` },
        right: { base: 0, lg: "auto" },
      }
    : { left: { base: 0, lg: "auto" }, width: "auto", right: { base: 0, lg: 4 } };

  return (
    <Flex
      position="fixed"
      bottom={DOCK_BOTTOM}
      left={confined.left}
      right={confined.right}
      w={confined.width}
      // THE PAIRING THAT KEEPS THE PAGE CLICKABLE — see the note at the top.
      // The container lies over the bottom of the page at all times; only the
      // windows within it may be clicked.
      pointerEvents="none"
      // Above the page and its cards, below the kit's dialogs and popovers
      // (1400+), so a lookup modal opened from inside a window still covers it.
      zIndex={1200}
      align="flex-end"
      justify="flex-end"
      gap={{ base: 0, lg: 3 }}
      // Stacked on a phone: windows are full-width there, so a row would put
      // them side by side at a width nothing reads at.
      direction={{ base: "column", lg: "row" }}
      px={{ base: 2, lg: 0 }}
      pb={{ base: 2, lg: 0 }}
      gapY={2}
      // Never wider than the screen, whatever the measured column says.
      maxW="100vw"
      // The windows fill the band from its right edge and wrap when three no
      // longer fit the work column — better than overflowing into the queue,
      // which is the column this dock exists to keep clear.
      wrap={{ base: "nowrap", lg: "wrap-reverse" }}
    >
      {windows.map((w) => (
        <Box
          key={w.id}
          pointerEvents="auto"
          w={{ base: "full", lg: w.minimized ? "260px" : "360px" }}
          bg="white"
          borderWidth="1px"
          borderColor="gray.200"
          // Square along the bottom on a desktop: the window is docked to the
          // edge, and a rounded corner there would float it off the frame.
          borderTopRadius="xl"
          borderBottomRadius={{ base: "xl", lg: 0 }}
          borderBottomWidth={{ base: "1px", lg: 0 }}
          boxShadow="0 -2px 16px rgba(16,24,40,.12)"
          overflow="hidden"
          flexShrink={0}
        >
          {/* TITLE BAR — the whole bar folds the window, as Gmail's does. The
              two buttons stop the click so they are not also folds. */}
          <Flex
            align="center"
            gap={2}
            px={3}
            py={2.5}
            bg={BRAND_COLORS.darkGreen}
            color="white"
            cursor="pointer"
            onClick={() => toggleMinimize(w.id)}
            role="button"
            aria-expanded={!w.minimized}
          >
            <Box minW={0} flex="1">
              <Text fontSize="sm" fontWeight="700" lineClamp={1}>
                {w.title}
              </Text>
              {w.subtitle && (
                <Text fontSize="11px" opacity={0.85} lineClamp={1}>
                  {w.subtitle}
                </Text>
              )}
            </Box>

            <IconButton
              aria-label={w.minimized ? "Expand" : "Minimise"}
              size="xs"
              variant="ghost"
              color="white"
              _hover={{ bg: "whiteAlpha.300" }}
              onClick={(e) => {
                e.stopPropagation();
                toggleMinimize(w.id);
              }}
            >
              {w.minimized ? <LuChevronUp /> : <LuChevronDown />}
            </IconButton>

            <IconButton
              aria-label="Close"
              size="xs"
              variant="ghost"
              color="white"
              _hover={{ bg: "whiteAlpha.300" }}
              onClick={(e) => {
                e.stopPropagation();
                close(w.id);
              }}
            >
              <LuX />
            </IconButton>
          </Flex>

          {/* BODY — hidden with `display` rather than unmounted, so folding a
              window and unfolding it again keeps whatever the user had scrolled
              to or typed inside it. */}
          <Box
            display={w.minimized ? "none" : "block"}
            h={WINDOW_BODY_HEIGHT}
            overflowY="auto"
            bg="white"
          >
            {renderBody(w)}
          </Box>
        </Box>
      ))}
    </Flex>
  );
}

export default FloatingDock;
