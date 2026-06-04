"use client";

import { Box, Flex } from "@chakra-ui/react";
import { ReactNode, useEffect, useRef, useState } from "react";

const SPRING = "0.46s cubic-bezier(0.34, 1.56, 0.64, 1)";
const EASE_OUT = "0.26s cubic-bezier(0.4, 0, 0.2, 1)";

const glassBg = "rgba(255, 255, 255, 0.72)";
const glassBorder = "rgba(255, 255, 255, 0.60)";
const glassShadow =
  "0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06), inset 0 1.5px 0 rgba(255,255,255,0.85), inset 0 -0.5px 0 rgba(0,0,0,0.04)";

const darkGlassBg = "rgba(20, 24, 36, 0.88)";
const darkGlassBorder = "rgba(255, 255, 255, 0.10)";
const darkGlassShadow =
  "0 8px 32px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.06)";

export const StickyNavbar = ({ children }: { children: ReactNode }) => {
  const [minimized, setMinimized] = useState(false);
  // Track scroll position per element so delta is always relative to that element.
  const scrollMap = useRef(new Map<EventTarget, number>());

  useEffect(() => {
    const handler = (e: Event) => {
      const target = e.target as HTMLElement;
      if (!target || typeof target.scrollTop !== "number") return;

      const prev = scrollMap.current.get(target) ?? target.scrollTop;
      const curr = target.scrollTop;
      const delta = curr - prev;
      scrollMap.current.set(target, curr);

      if (curr < 10) setMinimized(false);
      else if (delta > 4) setMinimized(true);
      else if (delta < -4) setMinimized(false);
    };

    // capture: true intercepts scroll from any nested scrollable element
    document.addEventListener("scroll", handler, { capture: true, passive: true });
    return () => document.removeEventListener("scroll", handler, { capture: true });
  }, []);

  return (
    <Box
      position="fixed"
      bottom="1.25rem"
      left={0}
      right={0}
      display="flex"
      justifyContent="center"
      zIndex={100}
      pointerEvents="none"
    >
      <Box position="relative" display="flex" justifyContent="center">

        {/* ── Full navbar pill ── */}
        <Box
          pointerEvents={minimized ? "none" : "auto"}
          style={{
            opacity: minimized ? 0 : 1,
            transform: minimized
              ? "translateY(18px) scale(0.86)"
              : "translateY(0) scale(1)",
            transition: `opacity ${EASE_OUT}, transform ${SPRING}`,
          }}
        >
          <Flex
            bg={glassBg}
            backdropFilter="blur(40px) saturate(200%)"
            borderRadius="3xl"
            border="1px solid"
            borderColor={glassBorder}
            boxShadow={glassShadow}
            _dark={{
              bg: darkGlassBg,
              borderColor: darkGlassBorder,
              boxShadow: darkGlassShadow,
            }}
            px={2}
            py={2}
            gap={1}
            align="center"
          >
            {children}
          </Flex>
        </Box>

        {/* ── Minimized dot pill ── */}
        <Flex
          position="absolute"
          bottom={0}
          left="50%"
          gap="5px"
          align="center"
          justify="center"
          bg={glassBg}
          backdropFilter="blur(40px) saturate(200%)"
          borderRadius="full"
          border="1px solid"
          borderColor={glassBorder}
          boxShadow={glassShadow}
          _dark={{
            bg: darkGlassBg,
            borderColor: darkGlassBorder,
            boxShadow: darkGlassShadow,
          }}
          px={6}
          py="10px"
          minH="44px"
          minW="80px"
          cursor="pointer"
          pointerEvents={minimized ? "auto" : "none"}
          onClick={() => setMinimized(false)}
          style={{
            opacity: minimized ? 1 : 0,
            transform: minimized
              ? "translateX(-50%) scale(1) translateY(0)"
              : "translateX(-50%) scale(0.65) translateY(12px)",
            transition: `opacity ${EASE_OUT}, transform ${SPRING}`,
          }}
        >
          {[0, 1, 2].map((i) => (
            <Box
              key={i}
              w="5px"
              h="5px"
              borderRadius="full"
              bg="var(--chakra-colors-primary)"
              flexShrink={0}
              style={{
                opacity: 0.4 + i * 0.25,
                transitionDelay: `${i * 0.04}s`,
              }}
            />
          ))}
        </Flex>

      </Box>
    </Box>
  );
};
