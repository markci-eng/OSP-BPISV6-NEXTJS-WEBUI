// Author: Jimwell Ocsio
"use client";

import { Box, Flex, type BoxProps } from "@chakra-ui/react";
import React from "react";
import Caption from "../../texts/Caption";
import BackButton from "./BackButton";

type PageScrollShellProps = {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  description?: React.ReactNode;
  swapOnScroll?: boolean;
  scrolledValue?: React.ReactNode;
  toolContent?: React.ReactNode;
  mainContent?: React.ReactNode;
  boxProps?: BoxProps;
};

const PageScrollShell = ({
  title,
  subtitle,
  description,
  swapOnScroll,
  scrolledValue,
  toolContent,
  mainContent,
  boxProps,
}: PageScrollShellProps) => {
  const [scrolled, setScrolled] = React.useState(false);
  const scrolledRef = React.useRef(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const stickyHeaderRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const header = stickyHeaderRef.current;
    const container = containerRef.current;
    if (!header || !container) return;

    const update = () => {
      const topPx = parseFloat(getComputedStyle(header).top) || 0;
      const visibleH = Math.max(0, header.offsetHeight + topPx);
      container.style.setProperty("--sticky-header-h", `${visibleH}px`);
    };

    const ro = new ResizeObserver(update);
    ro.observe(header);
    window.addEventListener("resize", update);
    update();

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);
  const upIntentRef = React.useRef(0);
  const lastTouchYRef = React.useRef<number | null>(null);
  const lastReleaseRef = React.useRef(0);

  // Threshold of accumulated upward intent (px) required to release the compact header
  // once it's been latched on. Prevents the shrink→no-overflow→expand feedback loop.
  const RELEASE_THRESHOLD = 80;

  const setScrolledLatched = (next: boolean) => {
    if (next === scrolledRef.current) return;
    // Guard against immediate re-latch during the header expand transition (~200ms).
    if (next && Date.now() - lastReleaseRef.current < 200) return;
    scrolledRef.current = next;
    setScrolled(next);
    if (!next) {
      upIntentRef.current = 0;
      lastReleaseRef.current = Date.now();
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop } = e.currentTarget;
    if (!scrolledRef.current && scrollTop > 24) {
      setScrolledLatched(true);
    }
    // Release when scrolled back to top via any method (scrollbar, keyboard, programmatic).
    if (scrolledRef.current && scrollTop === 0) {
      setScrolledLatched(false);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!scrolledRef.current) return;
    if (e.deltaY < 0) {
      upIntentRef.current += -e.deltaY;
      if (
        upIntentRef.current >= RELEASE_THRESHOLD &&
        e.currentTarget.scrollTop <= 4
      ) {
        setScrolledLatched(false);
      }
    } else if (e.deltaY > 0) {
      upIntentRef.current = 0;
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    lastTouchYRef.current = e.touches[0]?.clientY ?? null;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!scrolledRef.current) return;
    const y = e.touches[0]?.clientY;
    if (y == null || lastTouchYRef.current == null) return;
    const dy = y - lastTouchYRef.current;
    lastTouchYRef.current = y;
    if (dy > 0) {
      upIntentRef.current += dy;
      if (
        upIntentRef.current >= RELEASE_THRESHOLD &&
        e.currentTarget.scrollTop <= 4
      ) {
        setScrolledLatched(false);
      }
    } else if (dy < 0) {
      upIntentRef.current = 0;
    }
  };

  return (
    <Box
      ref={containerRef}
      w="100%"
      p={{ base: "20px 16px 96px", lg: "36px 44px 56px" }}
      onScroll={handleScroll}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      {...boxProps}
      h="100%"
      maxH="100%"
      overflowY="auto"
      overflowX="hidden"
      scrollBehavior="smooth"
      bg="#fafafaff"
    >
      <Box
        ref={stickyHeaderRef}
        position="sticky"
        top={{ base: "-20px", lg: "-36px" }}
        mt={{ base: "-20px", lg: "-36px" }}
        mx={{ base: "-16px", lg: "-44px" }}
        px={{ base: "16px", lg: "66px" }}
        pt={scrolled ? "14px" : { base: "20px", lg: "36px" }}
        mb="20px"
        bg={scrolled ? "#fff" : ""}
        zIndex={10}
        boxShadow={scrolled ? "0 1px 0 0 #cfcecbff" : "none"}
        transition="padding .2s ease, box-shadow .2s ease"
      >
        <Flex
          direction="row"
          align="center"
          justify="space-between"
          gap={{ base: "10px", lg: "32px" }}
          pb={scrolled ? "14px" : "24px"}
          borderBottom="1px solid"
          borderColor={scrolled ? "transparent" : "#E5DFCD"}
          transition="padding .2s ease, border-color .2s ease"
        >
          <Box minW={0} flex="1">
            <BackButton />
            {(() => {
              // When swapOnScroll and scrolled: swap title/subtitle values inline.
              const swap = swapOnScroll && scrolled;
              const mainTitle = swap ? subtitle : title;
              return (
                <>
                  {subtitle && !scrolled && (
                    <Box
                      fontFamily="var(--font-dm-sans), system-ui, sans-serif"
                      color="#7B8079"
                      fontSize="10px"
                      fontWeight={700}
                      lineHeight="1"
                      letterSpacing="0.06em"
                      textTransform="uppercase"
                      mb="2px"
                    >
                      {subtitle}
                    </Box>
                  )}
                  <Box
                    as="h1"
                    m="0"
                    fontFamily="var(--font-dm-sans), system-ui, sans-serif"
                    fontWeight={subtitle ? 600 : 500}
                    color="gray.900"
                    lineHeight="1"
                    letterSpacing={subtitle ? "-0.025em" : "-0.015em"}
                    fontSize={
                      scrolled
                        ? {
                            base: subtitle ? "18px" : "20px",
                            lg: subtitle ? "22px" : "24px",
                          }
                        : {
                            base: subtitle ? "22px" : "24px",
                            lg: subtitle ? "28px" : "32px",
                          }
                    }
                    transition="font-size .2s ease"
                  >
                    {mainTitle}
                  </Box>
                </>
              );
            })()}
            {description && (
              <Caption
                fontFamily="var(--font-dm-sans), system-ui, sans-serif"
                mt={scrolled ? "0" : "6px"}
                maxH={scrolled ? "0" : "40px"}
                opacity={scrolled ? 0 : 1}
                overflow="hidden"
                transition="max-height .2s ease, opacity .2s ease, margin-top .2s ease"
              >
                {description}
              </Caption>
            )}
          </Box>
          {toolContent}
        </Flex>
      </Box>
      {mainContent}
    </Box>
  );
};

export default PageScrollShell;
