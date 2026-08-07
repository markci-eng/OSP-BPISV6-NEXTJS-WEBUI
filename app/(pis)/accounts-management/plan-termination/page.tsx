"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Carousel,
  Flex,
  IconButton,
  SimpleGrid,
  Text,
} from "@chakra-ui/react";
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Files,
  XCircle,
} from "lucide-react";

import { PLAN_TERMINATION_REQUESTS } from "./data/data";
import type { PlanTerminationStatus } from "./data/types";
import { planTerminationColumns } from "./components/plan-termination-columns";
import { BackToTop } from "../components/back-to-top";
import { DataTable, Page } from "osp-ui-kit";

type StatusFilter = PlanTerminationStatus | "All";

const STATUS_OPTIONS: { label: string; value: PlanTerminationStatus }[] = [
  { label: "Approved", value: "APPROVED" },
  { label: "Denied", value: "DENIED" },
  { label: "Pending", value: "PENDING" },
];

export default function PlanTerminationPage() {
  const [status, setStatus] = useState<StatusFilter>("PENDING");
  const [carouselIdx, setCarouselIdx] = useState(1);
  const carouselReady = useRef(false);

  // Only mount the mobile carousel on mobile viewports. When hidden with
  // `display: none` on desktop it can't measure its slides and re-emits
  // onPageChange(0), which would clobber the Pending default with "All".
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 47.99em)"); // below Chakra `md`
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const statusLabel =
    status === "All"
      ? "All"
      : (STATUS_OPTIONS.find((s) => s.value === status)?.label ?? "");

  const summary = useMemo(() => {
    const total = PLAN_TERMINATION_REQUESTS.length;
    const pending = PLAN_TERMINATION_REQUESTS.filter(
      (r) => r.status === "PENDING",
    ).length;
    const approved = PLAN_TERMINATION_REQUESTS.filter(
      (r) => r.status === "APPROVED",
    ).length;
    const denied = PLAN_TERMINATION_REQUESTS.filter(
      (r) => r.status === "DENIED",
    ).length;
    return { total, pending, approved, denied };
  }, []);

  const filteredData = useMemo(
    () =>
      status === "All"
        ? PLAN_TERMINATION_REQUESTS
        : PLAN_TERMINATION_REQUESTS.filter((r) => r.status === status),
    [status],
  );

  const cards = useMemo(
    () => [
      {
        label: "Total Requests",
        value: summary.total,
        filter: "All" as StatusFilter,
        sub: "All requests",
        icon: Files,
        accent: "blue",
      },
      {
        label: "Pending",
        value: summary.pending,
        filter: "PENDING" as StatusFilter,
        sub: "Awaiting review",
        icon: Clock,
        accent: "orange",
      },
      {
        label: "Approved",
        value: summary.approved,
        filter: "APPROVED" as StatusFilter,
        sub: "Completed",
        icon: CheckCircle,
        accent: "green",
      },
      {
        label: "Denied",
        value: summary.denied,
        filter: "DENIED" as StatusFilter,
        sub: "Denied",
        icon: XCircle,
        accent: "red",
      },
    ],
    [summary],
  );

  const renderCardContent = (card: (typeof cards)[number], i: number) => {
    const isActive = status === card.filter;
    return (
      <Box
        position="relative"
        bg={isActive ? `${card.accent}.100` : `${card.accent}.50`}
        border="2px solid"
        borderColor={isActive ? `${card.accent}.500` : `${card.accent}.200`}
        borderRadius="xl"
        p={4}
        mt={2}
        boxShadow={isActive ? "lg" : "xs"}
        cursor="pointer"
        transform={isActive ? "translateY(-2px)" : "none"}
        onClick={() => {
          setStatus(card.filter);
          setCarouselIdx(i);
        }}
        transition="all 0.15s ease"
        _hover={{
          bg: `${card.accent}.100`,
          borderColor: `${card.accent}.400`,
        }}
      >
        {isActive && (
          <Box
            position="absolute"
            top={-2}
            right={-2}
            zIndex={2}
            w="22px"
            h="22px"
            borderRadius="full"
            bg={`${card.accent}.500`}
            color="white"
            border="2px solid"
            borderColor="white"
            display={{ base: "none", md: "flex" }}
            alignItems="center"
            justifyContent="center"
            fontSize="11px"
            fontWeight="800"
            boxShadow="sm"
          >
            ✓
          </Box>
        )}
        <Flex justify="space-between" align="flex-start">
          <Box>
            <Text
              fontSize="10px"
              fontWeight={isActive ? "800" : "700"}
              letterSpacing="0.08em"
              textTransform="uppercase"
              color={isActive ? `${card.accent}.600` : `${card.accent}.500`}
              mb={1}
            >
              {card.label}
            </Text>
            <Text
              fontSize={isActive ? "4xl" : "2xl"}
              fontWeight="bold"
              color={isActive ? `${card.accent}.700` : `${card.accent}.600`}
              lineHeight="1"
              mb={1}
              transition="font-size 0.15s ease"
            >
              {card.value}
            </Text>
            <Text fontSize="xs" color="gray.600" fontWeight="medium">
              {card.sub}
            </Text>
          </Box>
          <Box
            p={2}
            borderRadius="lg"
            bg={isActive ? `${card.accent}.200` : `${card.accent}.100`}
            color={`${card.accent}.500`}
          >
            <card.icon size={18} />
          </Box>
        </Flex>
      </Box>
    );
  };

  return (
    <Page.Root
      title="Plan Termination"
      description="Plan termination requests."
      headerButton="menu"
    >
      <Page.MainContent>
        <BackToTop />

        {/* ── Summary cards ── */}
        {/* Desktop: 4-column grid */}
        <SimpleGrid columns={4} gap={3} display={{ base: "none", md: "grid" }}>
          {cards.map((card, i) => (
            <Box key={card.label}>{renderCardContent(card, i)}</Box>
          ))}
        </SimpleGrid>

        {/* Mobile: carousel (only mounted on mobile so its page events can't
            leak into statusFilter on desktop) */}
        {isMobile && (
          <Box>
            <Carousel.Root
              slideCount={cards.length}
              page={carouselIdx}
              onPageChange={(details: { page: number }) => {
                // The carousel emits an initial onPageChange(0) on mount (even while
                // hidden on desktop), which would clobber the Pending default. Skip
                // that first firing and only react to real page changes afterward.
                if (!carouselReady.current) {
                  carouselReady.current = true;
                  return;
                }
                setCarouselIdx(details.page);
                setStatus(cards[details.page].filter);
              }}
            >
              <Carousel.ItemGroup>
                {cards.map((card, i) => (
                  <Carousel.Item key={card.label} index={i}>
                    {renderCardContent(card, i)}
                  </Carousel.Item>
                ))}
              </Carousel.ItemGroup>

              <Carousel.Control justifyContent="center" gap="4">
                <Carousel.PrevTrigger asChild>
                  <IconButton size="xs" variant="ghost" aria-label="Previous">
                    <ChevronLeft size={16} />
                  </IconButton>
                </Carousel.PrevTrigger>

                <Carousel.Indicators />

                <Carousel.NextTrigger asChild>
                  <IconButton size="xs" variant="ghost" aria-label="Next">
                    <ChevronRight size={16} />
                  </IconButton>
                </Carousel.NextTrigger>
              </Carousel.Control>
            </Carousel.Root>
          </Box>
        )}

        {/* ── List ── */}
        <DataTable
          title="Plan Termination Requests"
          description={`Showing ${statusLabel.toLowerCase()} requests.`}
          data={filteredData}
          columns={planTerminationColumns}
          getRowId={(row) => row.id}
          features={{
            search: true,
            filtering: true,
            sorting: true,
            pagination: true,
            columnToggle: true,
            selection: false,
            detailSidebar: false,
          }}
          mobileConfig={{
            viewMode: "accordion",
            primaryField: "lpaNo",
            secondaryField: "planholderName",
            badgeField: "status",
            visibleFields: [
              "planType",
              "terminationReason",
              "refundAmount",
              "terminationDate",
              "requestDate",
              "requester",
            ],
            badgeColorMap: {
              PENDING: "orange",
              APPROVED: "green",
              DENIED: "red",
            },
          }}
        />
      </Page.MainContent>
    </Page.Root>
  );
}
