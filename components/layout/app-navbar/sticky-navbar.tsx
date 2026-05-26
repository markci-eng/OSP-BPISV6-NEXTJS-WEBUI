"use client";

import { Flex } from "@chakra-ui/react";
import React, { ReactNode, useEffect, useRef, useState } from "react";
import { useStickyNavbar } from "./sticky-navbar-context";

export const StickyNavbar = ({ children }: { children: ReactNode }) => {
  const refSticky = useRef<HTMLDivElement>(null);
  const refParent = useStickyNavbar();
  const [hidden, setHidden] = useState(false);
  const [stickyHeight, setStickyHeight] = useState(0);

  useEffect(() => {
    const elParent = refParent?.current;
    const elSticky = refSticky.current;

    if (!elParent || !elSticky) return;
    setStickyHeight(elSticky.clientHeight);

    const prevScrollRef = { current: elParent.scrollTop };

    const onScroll = () => {
      const current = elParent.scrollTop;
      if (prevScrollRef.current > current) {
        setHidden(false);
      } else {
        setHidden(true);
      }

      prevScrollRef.current = current;
    };

    elParent.addEventListener("scroll", onScroll);

    return () => elParent.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <Flex
      ref={refSticky}
      position="fixed"
      left="0"
      right="0"
      bottom="0"
      transform={hidden ? `translateY(${stickyHeight}px)` : "translateY(0)"}
      transition="transform 0.2s ease, border-color 0.2s ease"
      bg="white"
      borderTopWidth={1}
      borderTopColor={hidden ? "transparent" : "var(--chakra-colors-gray-200)"}
    >
      {children}
    </Flex>
  );
};
