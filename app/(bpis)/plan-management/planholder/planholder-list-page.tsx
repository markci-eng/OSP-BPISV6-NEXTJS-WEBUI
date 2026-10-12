"use client";

import {
  Box,
  Carousel,
  chakra,
  Flex,
  IconButton,
  Show,
  SimpleGrid,
} from "@chakra-ui/react";
import { MetricCard, Page, Tooltip } from "osp-ui-kit";
import { useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  LuBadgeCheck,
  LuChevronLeft,
  LuChevronRight,
  LuCircleCheck,
  LuRotateCcw,
  LuSparkles,
  LuTriangleAlert,
  LuUsers,
} from "react-icons/lu";
import { useIsMobile } from "@/hooks/useIsMobile";
import { formatCompact } from "@/lib/format/compact";
import { usePlanholderSearch } from "./hooks/usePlanholderSearch";
import { PlanholderListTable } from "./components/PlanholderListTable";
import { StatusCardSkeleton } from "./components/StatusCardSkeleton";
import {
  LIST_PARAMS,
  replaceListParam,
} from "./components/planholder-list-utils";

/** The status cards' filters, in card order. A status in the URL must be one. */
const STATUS_FILTERS = [
  "All",
  "ACTIVE",
  "FULLY PAID",
  "LAPSED",
  "NEW SALES",
  "REINSTATED",
];

export default function PlanholderListPage() {
  // The status lives in the URL and nowhere else, so coming back from a
  // profile restores the card that was picked, and following a plain link to
  // this page (the sidebar) resets it.
  const searchParams = useSearchParams();
  const statusParam = searchParams.get(LIST_PARAMS.status);
  const statusFilter =
    statusParam && STATUS_FILTERS.includes(statusParam) ? statusParam : "All";
  const carouselIdx = Math.max(0, STATUS_FILTERS.indexOf(statusFilter));
  const setStatusFilter = (status: string) =>
    replaceListParam(LIST_PARAMS.status, status, "All");

  // The carousel can report a page change of its own while it mounts and
  // measures its slides, which would clobber the status restored from the
  // URL. Only a page change the visitor caused counts.
  const carouselTouched = useRef(false);
  const markCarouselTouched = () => {
    carouselTouched.current = true;
  };

  // Card counts cover every planholder, independent of search and filters.
  const { data, isLoading } = usePlanholderSearch("");

  const cards = useMemo(() => {
    const countOf = (status: string) =>
      data.filter((ph) => ph.accountStatus === status).length;

    return [
      {
        label: "All",
        count: data.length,
        filter: "All",
        icon: LuUsers,
        accent: "blue",
      },
      {
        label: "Active",
        count: countOf("ACTIVE"),
        filter: "ACTIVE",
        icon: LuCircleCheck,
        accent: "green",
      },
      {
        label: "Fully Paid",
        count: countOf("FULLY PAID"),
        filter: "FULLY PAID",
        icon: LuBadgeCheck,
        accent: "cyan",
      },
      {
        label: "Lapsed",
        count: countOf("LAPSED"),
        filter: "LAPSED",
        icon: LuTriangleAlert,
        accent: "orange",
      },
      {
        label: "New Sales",
        count: countOf("NEW SALES"),
        filter: "NEW SALES",
        icon: LuSparkles,
        accent: "purple",
      },
      {
        label: "Reinstated",
        count: countOf("REINSTATED"),
        filter: "REINSTATED",
        icon: LuRotateCcw,
        accent: "teal",
      },
    ].map(({ count, ...card }) => ({
      ...card,
      value: formatCompact(count),
      fullValue: count.toLocaleString("en-US"),
    }));
  }, [data]);

  const isMobile = useIsMobile();

  // MetricCard is display-only, so the selection lives on a wrapper: a button
  // that rings the active card in its accent colour. The value on the card is
  // abbreviated, so the tooltip carries the exact count.
  const renderCardContent = (card: (typeof cards)[number]) => {
    const isActive = statusFilter === card.filter;
    return (
      // osp-ui-kit's `xs` text style, which Chakra's tooltip uses, carries the
      // dark `foreground` colour and overrides the tooltip's own inverted text.
      <Tooltip
        content={card.fullValue}
        showArrow
        contentProps={{ color: "fg.inverted" }}
      >
        <chakra.button
          type="button"
          aria-pressed={isActive}
          display="block"
          w="full"
          h="full"
          textAlign="start"
          borderRadius="card"
          outline="2px solid"
          outlineOffset="2px"
          outlineColor={isActive ? `${card.accent}.solid` : "transparent"}
          cursor="pointer"
          transition="outline-color 0.15s ease, transform 0.15s ease"
          transform={isActive ? "translateY(-2px)" : "none"}
          _hover={{ transform: "translateY(-2px)" }}
          _focusVisible={{ outlineColor: `${card.accent}.focusRing` }}
          onClick={() => setStatusFilter(card.filter)}
        >
          <MetricCard
            icon={<card.icon size={28} />}
            label={card.label}
            value={card.value}
            accent={card.accent}
          />
        </chakra.button>
      </Tooltip>
    );
  };

  return (
    <Page.Root
      headerButton="menu"
      title="Planholder Lists"
      description="Find a planholder to view their profile."
      paddingBottom={{ base: "96px", md: 0 }}
    >
      <Page.MainContent>
        {/* Account status summary cards */}
        <Page.Row>
          <Flex direction="column" gap={4} w="full">
            {/* Desktop: grid */}
            <SimpleGrid
              columns={{ md: 3, xl: 6 }}
              gap={4}
              display={{ base: "none", md: "grid" }}
            >
              {isLoading
                ? cards.map((_, i) => <StatusCardSkeleton key={i} />)
                : cards.map((card) => (
                    <Box key={card.label} minW={0}>
                      {renderCardContent(card)}
                    </Box>
                  ))}
            </SimpleGrid>

            {/* Mobile: carousel (only mounted on mobile so its page events can't
                leak into statusFilter on desktop) */}
            {isMobile && (
              <Box>
                <Show when={isLoading}>
                  <StatusCardSkeleton />
                </Show>
                <Show when={!isLoading}>
                  <Carousel.Root
                    slideCount={cards.length}
                    page={carouselIdx}
                    onPointerDown={markCarouselTouched}
                    onKeyDown={markCarouselTouched}
                    onWheel={markCarouselTouched}
                    onPageChange={(details: { page: number }) => {
                      if (!carouselTouched.current) return;
                      setStatusFilter(cards[details.page].filter);
                    }}
                  >
                    <Carousel.ItemGroup>
                      {cards.map((card, i) => (
                        <Carousel.Item key={card.label} index={i} p={1} pt={2}>
                          {renderCardContent(card)}
                        </Carousel.Item>
                      ))}
                    </Carousel.ItemGroup>

                    <Carousel.Control justifyContent="center" gap="4">
                      <Carousel.PrevTrigger asChild>
                        <IconButton
                          size="xs"
                          variant="ghost"
                          aria-label="Previous"
                        >
                          <LuChevronLeft size={16} />
                        </IconButton>
                      </Carousel.PrevTrigger>

                      <Carousel.Indicators
                        transition="width 0.2s ease-in-out"
                        transformOrigin="center"
                        opacity="0.5"
                        boxSize="2"
                        bg={"primaryDisabled"}
                        _current={{
                          width: "10",
                          bg: "primary",
                          opacity: 1,
                        }}
                      />

                      <Carousel.NextTrigger asChild>
                        <IconButton size="xs" variant="ghost" aria-label="Next">
                          <LuChevronRight size={16} />
                        </IconButton>
                      </Carousel.NextTrigger>
                    </Carousel.Control>
                  </Carousel.Root>
                </Show>
              </Box>
            )}
          </Flex>
        </Page.Row>
        <Page.Row mb={10}>
          <PlanholderListTable status={statusFilter} />
        </Page.Row>
      </Page.MainContent>
    </Page.Root>
  );
}
