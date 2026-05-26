"use client";

import { Box, Flex } from "@chakra-ui/react";
import React, { ReactNode, useEffect, useRef, useState } from "react";
import { useStickyNavbar } from "./sticky-navbar-context";

export const StickyNavbar = ({ children }: { children: ReactNode }) => {
  const refSticky = useRef<HTMLDivElement>(null);
  const refParent = useStickyNavbar();
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const elParent = refParent?.current;
    if (!elParent) return;

    const prevScrollRef = { current: elParent.scrollTop };

    const onScroll = () => {
      const current = elParent.scrollTop;
      const delta = current - prevScrollRef.current;

      if (current < 10) {
        setHidden(false);
      } else if (delta > 4) {
        setHidden(true);
      } else if (delta < -4) {
        setHidden(false);
      }

      prevScrollRef.current = current;
    };

    elParent.addEventListener("scroll", onScroll, { passive: true });
    return () => elParent.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <Box
      ref={refSticky}
      position="fixed"
      bottom="1.25rem"
      left="0"
      right="0"
      mx="auto"
      w="fit-content"
      zIndex={100}
      transform={hidden ? "translateY(calc(100% + 2rem))" : "translateY(0)"}
      transition="transform 0.38s cubic-bezier(0.4, 0, 0.2, 1)"
    >
      <Flex
        bg="rgba(255, 255, 255, 0.88)"
        _dark={{
          bg: "rgba(17, 24, 39, 0.90)",
          borderColor: "rgba(255, 255, 255, 0.10)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.40), 0 2px 8px rgba(0,0,0,0.30)",
        }}
        backdropFilter="blur(20px)"
        borderRadius="3xl"
        border="1px solid"
        borderColor="rgba(0, 0, 0, 0.07)"
        boxShadow="0 8px 32px rgba(0,0,0,0.09), 0 2px 8px rgba(0,0,0,0.05)"
        px={2}
        py={2}
        gap={1}
        align="center"
      >
        {children}
      </Flex>
    </Box>
  );
};
