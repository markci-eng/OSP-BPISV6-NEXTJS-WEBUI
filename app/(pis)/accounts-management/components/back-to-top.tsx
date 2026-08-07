"use client";

import * as React from "react";
import { Box, IconButton } from "@chakra-ui/react";
import { LuArrowUp } from "react-icons/lu";

/**
 * Floating "back to top" for long mobile pages.
 *
 * Renders a 1px sentinel plus the button itself, so it only needs dropping in
 * once — at the very top of the page content. The button is fixed, so its
 * position in the DOM doesn't affect where it appears.
 *
 * Visibility comes from an IntersectionObserver on the sentinel rather than
 * `window.scrollY`, since the app shell may scroll an inner element instead of
 * the document. Scrolling back rewinds the scrolling ancestor to 0 so the page
 * header comes back into view too, not just the content area.
 */
export function BackToTop() {
  const sentinelRef = React.useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const scrollToTop = () => {
    let node = sentinelRef.current?.parentElement ?? null;

    while (node) {
      const { overflowY } = window.getComputedStyle(node);
      const scrolls = overflowY === "auto" || overflowY === "scroll";
      if (scrolls && node.scrollHeight > node.clientHeight) {
        node.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      node = node.parentElement;
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <Box ref={sentinelRef} h="1px" mb={-1} aria-hidden />

      <IconButton
        aria-label="Back to top"
        onClick={scrollToTop}
        display={{ base: "flex", lg: "none" }}
        position="fixed"
        // Right-hand corner, 80px up from the viewport edge — above the bottom
        // nav bar. Note the kit's chatbot FAB starts in the same column and
        // spans 72–136px up, so the two share space until it is dragged away.
        right="16px"
        bottom="80px"
        zIndex={20}
        boxSize="44px"
        borderRadius="full"
        // Translucent so it sits over the page without hiding it
        bg="var(--chakra-colors-primary)/55"
        backdropFilter="blur(8px)"
        color="white"
        shadow="md"
        opacity={visible ? 1 : 0}
        pointerEvents={visible ? "auto" : "none"}
        transform={visible ? "translateY(0)" : "translateY(8px)"}
        transition="opacity 0.2s ease, transform 0.2s ease"
        _hover={{ bg: "var(--chakra-colors-primary)/80" }}
        _active={{ transform: "scale(0.94)" }}
      >
        <LuArrowUp size={20} />
      </IconButton>
    </>
  );
}

export default BackToTop;
