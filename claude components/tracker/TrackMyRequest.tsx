"use client";

import { Flex, VStack, Box, Text, Input, Badge } from "@chakra-ui/react";
import React from "react";
import { IconType } from "react-icons";
import {
  MdCreditCard,
  MdDescription,
  MdEditCalendar,
  MdRefresh,
} from "react-icons/md";
import {
  fallbackJourney,
  journeyMeta,
  JourneyMeta,
  journeys,
} from "./journeys";
import JourneyTimeline, { JourneyStep } from "./JourneyTimeline";
import { PrimarySmButton, SecondarySmButton } from "st-peter-ui";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useColorModeValue } from "@/components/ui/color-mode";
import {
  FileText,
  Calendar,
  Hash,
  Clock,
  HelpCircle,
  CheckCircle2,
  ClipboardCheck,
  Settings,
  FileCheck,
  Check,
  Route,
} from "lucide-react";
import Page from "@/claude components/layout/page/Page";
import { Card } from "../card-accordion/card";

interface TrackRequestPageProps {
  requestId?: string;
  progressIcon?: IconType;
}

const SUMMARY_PHASES = [
  { label: "Received", Icon: ClipboardCheck },
  { label: "Processing", Icon: Settings },
  { label: "Finalizing", Icon: FileCheck },
  { label: "Completed", Icon: CheckCircle2 },
];

export default function TrackRequestPage({ requestId }: TrackRequestPageProps) {
  const [journey, setJourney] = useState<JourneyStep[]>(
    requestId ? [] : fallbackJourney,
  );
  const [searched, setSearched] = useState(!!requestId);
  const [currentRef, setCurrentRef] = useState(requestId ?? "");
  const [meta, setMeta] = useState<JourneyMeta | null>(null);

  const handleSearch = (referenceNo: string) => {
    const upper = referenceNo.toUpperCase();
    const prefix = referenceNo.split("-")[0].toUpperCase();
    const foundJourney = journeys[upper] || journeys[prefix] || fallbackJourney;
    const foundMeta = journeyMeta[upper] || journeyMeta[prefix] || null;
    setJourney(foundJourney);
    setMeta(foundMeta);
    setSearched(true);
    setCurrentRef(referenceNo);
  };

  const handleReset = () => {
    setJourney(requestId ? [] : fallbackJourney);
    setSearched(false);
    setCurrentRef("");
  };

  const completedCount = journey.filter((s) => s.status === "Done").length;
  const progressPercent =
    journey.length > 0 ? (completedCount / journey.length) * 100 : 0;
  const clampedProgress = Math.min(100, Math.max(0, progressPercent));
  const currentStep = journey.find((s) => s.status === "Current");
  const isComplete = clampedProgress === 100;

  const cardBg = useColorModeValue("white", "gray.800");

  /* ── Summarise journey into 4 phases ── */
  const summarizedSteps = SUMMARY_PHASES.map((phase, i) => {
    const total = journey.length;
    const chunkSize = Math.ceil(total / 4);
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, total);
    const chunk = journey.slice(start, end);

    const allDone = chunk.length > 0 && chunk.every((s) => s.status === "Done");
    const hasCurrent = chunk.some((s) => s.status === "Current");
    const status: "done" | "current" | "pending" = allDone
      ? "done"
      : hasCurrent
        ? "current"
        : "pending";
    const dateTime = allDone
      ? (chunk[chunk.length - 1]?.dateTime ?? "")
      : hasCurrent
        ? (chunk.find((s) => s.status === "Current")?.dateTime ?? "")
        : "";

    return { ...phase, status, dateTime };
  });

  const currentStatusCard = (
    <Box
      w="100%"
      p={4}
      borderRadius="2xl"
      bg={cardBg}
      shadow="sm"
      transition="all 0.25s ease"
      _hover={{ transform: "translateY(-3px)", shadow: "lg" }}
      overflow="hidden"
    >
      {/* HEADER */}
      <Flex justify="space-between" align="center" mb={5}>
        <Flex align="center" gap={2}>
          <Box p={2} borderRadius="full" bg="gray.100">
            {isComplete ? <CheckCircle2 size={18} /> : <Clock size={18} />}
          </Box>
          <Box>
            <Text fontWeight="bold" fontSize="md" lineHeight="1.2">
              Current Status
            </Text>
            <Text
              fontSize="xs"
              color="gray.500"
              overflow="hidden"
              textOverflow="ellipsis"
              whiteSpace="nowrap"
              maxW="160px"
            >
              {currentStep?.title ?? "All steps completed"}
            </Text>
          </Box>
        </Flex>

        <Flex align="center" gap={2}>
          <Box
            w="2"
            h="2"
            borderRadius="full"
            bg={isComplete ? "green.400" : "blue.400"}
          />
          <Badge
            variant="subtle"
            px={2}
            py={1}
            fontSize="0.75rem"
            bg={isComplete ? "green.50" : "blue.50"}
            color={isComplete ? "green.700" : "blue.700"}
          >
            {Math.round(clampedProgress)}%
          </Badge>
        </Flex>
      </Flex>

      {/* SHOPEE-STYLE 4-STEP TRACKER */}
      <Flex align="flex-start">
        {summarizedSteps.map((step, i) => (
          <React.Fragment key={step.label}>
            {/* Step column */}
            <Flex direction="column" align="center" flex="1" minW="0">
              {/* Circle */}
              <Box
                w="36px"
                h="36px"
                borderRadius="full"
                flexShrink={0}
                display="flex"
                alignItems="center"
                justifyContent="center"
                position="relative"
                bg={
                  step.status === "done"
                    ? "green.500"
                    : step.status === "current"
                      ? "blue.500"
                      : "gray.100"
                }
                color={step.status === "pending" ? "gray.400" : "white"}
                transition="all 0.3s"
                boxShadow={
                  step.status === "current"
                    ? "0 0 0 4px rgba(59,130,246,0.18)"
                    : "none"
                }
              >
                {step.status === "done" ? (
                  <Check size={16} />
                ) : (
                  <step.Icon size={16} />
                )}
              </Box>

              {/* Label */}
              <Text
                fontSize="xs"
                fontWeight={step.status !== "pending" ? "semibold" : "normal"}
                mt={2}
                textAlign="center"
                lineHeight="1.2"
                color={
                  step.status === "pending"
                    ? "gray.400"
                    : step.status === "current"
                      ? "blue.600"
                      : "gray.700"
                }
              >
                {step.label}
              </Text>

              {/* Timestamp or status hint */}
              {/* {step.dateTime ? (
                <Text
                  fontSize="9px"
                  color="gray.400"
                  textAlign="center"
                  mt="2px"
                  lineHeight="1.3"
                  px={1}
                >
                  {step.dateTime}
                </Text>
              ) : step.status === "current" ? (
                <Text
                  fontSize="9px"
                  color="blue.400"
                  textAlign="center"
                  mt="2px"
                  fontWeight="medium"
                >
                  In Progress
                </Text>
              ) : null} */}
            </Flex>

            {/* Connector line */}
            {i < summarizedSteps.length - 1 && (
              <Box
                h="2px"
                flex="1"
                mt="17px"
                flexShrink={0}
                bg={step.status === "done" ? "green.400" : "gray.200"}
                transition="background 0.3s"
              />
            )}
          </React.Fragment>
        ))}
      </Flex>
    </Box>
  );

  return (
    <Page.Root
      title={"Transaction Tracker"}
      description={"Monitor and follow up on your service requests"}
    >
      <Page.MainContent>
        {/* SEARCH / REFERENCE CARD */}
        <RequestCard
          description="Request details"
          dateTime="2025-03-31 09:00 AM"
          onSearch={handleSearch}
          onReset={handleReset}
          searched={searched}
          initialReferenceNo={requestId}
          cardBg={cardBg}
          journey={journey}
          progressPercent={clampedProgress}
          completedCount={completedCount}
          isComplete={isComplete}
          meta={meta}
        />

        {/* MOBILE: CURRENT STATUS (shown right after RequestCard on mobile) */}
        {journey.length > 0 && (
          <Box display={{ base: "block", lg: "none" }} mb={3}>
            {currentStatusCard}
          </Box>
        )}

        {/* JOURNEY CONTENT */}
        {journey.length > 0 && (
          <Flex
            mt={3}
            direction={{ base: "column", lg: "row" }}
            align={{ lg: "flex-start" }}
            gap={3}
          >
            {/* ===== TIMELINE (mobile: first, desktop: left) ===== */}
            <Box w={{ base: "100%", lg: "55%" }} order={{ base: 0, lg: 0 }}>
              <Card
                activeIcon={<Route size={18} />}
                title="Request Journey"
                subtitle={`${completedCount} of ${journey.length} steps completed`}
              >
                <JourneyTimeline journey={journey} />
              </Card>
            </Box>

            {/* ===== SIDE PANEL (mobile: second, desktop: right) ===== */}
            <VStack
              w={{ base: "100%", lg: "45%" }}
              gap={3}
              order={{ base: 1, lg: 1 }}
            >
              {/* CURRENT STATUS CARD — desktop only (mobile shown above) */}
              <Box display={{ base: "none", lg: "block" }} w="100%">
                {currentStatusCard}
              </Box>

              {/* HELP CARD */}
              <Box
                w="100%"
                p={4}
                borderRadius="2xl"
                bg={cardBg}
                shadow="sm"
                transition="all 0.25s ease"
                _hover={{ transform: "translateY(-3px)", shadow: "lg" }}
              >
                <Flex align="center" gap={2} mb={2}>
                  <Box p={2} borderRadius="full" bg="gray.100">
                    <HelpCircle size={18} />
                  </Box>
                  <Text fontWeight="bold" fontSize="md" lineHeight="1.2">
                    Need Help?
                  </Text>
                </Flex>

                <Text fontSize="xs" color="gray.500" pl={10}>
                  For assistance, contact{" "}
                  <Link
                    href="mailto:support@example.com"
                    style={{ color: "#2e7d32", fontWeight: 600 }}
                  >
                    support@example.com
                  </Link>
                </Text>
              </Box>
            </VStack>
          </Flex>
        )}
      </Page.MainContent>
    </Page.Root>
  );
}

/* ===========================
   REQUEST CARD
   =========================== */

interface RequestCardProps {
  description: string;
  dateTime: string;
  onSearch: (referenceNo: string) => void;
  onReset: () => void;
  searched: boolean;
  initialReferenceNo?: string;
  cardBg: string;
  journey: JourneyStep[];
  progressPercent: number;
  completedCount: number;
  isComplete: boolean;
  meta: JourneyMeta | null;
}

const RequestCard = ({
  description,
  dateTime,
  onSearch,
  onReset,
  searched,
  initialReferenceNo,
  cardBg,
  journey,
  progressPercent,
  completedCount,
  isComplete,
  meta,
}: RequestCardProps) => {
  const [referenceNo, setReferenceNo] = useState(initialReferenceNo ?? "");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialReferenceNo) {
      handleSearch(initialReferenceNo);
    }
  }, [initialReferenceNo]);

  const handleSearch = (ref?: string) => {
    const refToUse = ref ?? referenceNo;
    if (!refToUse.trim()) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onSearch(refToUse);
    }, 800);
  };

  const isSearched = searched || !!initialReferenceNo;

  return (
    <Box
      mb={4}
      w="100%"
      p={4}
      borderRadius="2xl"
      bg={cardBg}
      shadow="sm"
      transition="all 0.25s ease"
      _hover={{ transform: "translateY(-3px)", shadow: "lg" }}
      overflow="hidden"
    >
      {/* HEADER — icon + title/badge inline, no cramped space-between */}
      <Flex align="center" gap={3} mb={3}>
        <Box p={2} borderRadius="full" bg="gray.100" flexShrink={0}>
          <FileText size={18} />
        </Box>

        <Box flex={1} minW={0} position="relative">
          {/* Badge (top-right) — desktop only */}
          {isSearched && (
            <Badge
              position="absolute"
              top={0}
              right={0}
              variant="subtle"
              px={2}
              py="1px"
              borderRadius="full"
              fontSize="0.7rem"
              bg={isComplete ? "green.50" : "blue.50"}
              color={isComplete ? "green.700" : "blue.700"}
              display={{ base: "none", sm: "flex" }}
              alignItems="center"
              gap={1}
            >
              <Box
                w="1.5"
                h="1.5"
                borderRadius="full"
                bg={isComplete ? "green.400" : "blue.400"}
                display="inline-block"
              />
              {isComplete ? "Completed" : "In Progress"}
            </Badge>
          )}

          {/* Title */}
          <Text
            fontWeight="bold"
            fontSize="md"
            lineHeight="1.2"
            overflow="hidden"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
            maxW="100%"
            pr={isSearched ? { base: 0, sm: "80px" } : 0}
            mb="2px"
          >
            {isSearched ? referenceNo : "Track Your Transaction"}
          </Text>

          {/* Subtitle */}
          <Text fontSize="xs" color="gray.500" lineHeight="1.3">
            {isSearched
              ? meta
                ? `${meta.name} · ${meta.transactionType}`
                : description
              : "Enter your reference number to get started"}
          </Text>
        </Box>

        {/* Mobile: badge + refresh icon button — beside the title */}
        {isSearched && (
          <Flex
            display={{ base: "flex", sm: "none" }}
            direction="row"
            align="center"
            gap={2}
            flexShrink={0}
          >
            <Badge
              variant="subtle"
              px={2}
              py="1px"
              borderRadius="full"
              fontSize="0.7rem"
              bg={isComplete ? "green.50" : "blue.50"}
              color={isComplete ? "green.700" : "blue.700"}
              display="flex"
              alignItems="center"
              gap={1}
            >
              <Box
                w="1.5"
                h="1.5"
                borderRadius="full"
                bg={isComplete ? "green.400" : "blue.400"}
              />
              {isComplete ? "Completed" : "In Progress"}
            </Badge>

            <Box
              as="button"
              onClick={() => handleSearch()}
              p="6px"
              borderRadius="full"
              bg="gray.100"
              display="flex"
              alignItems="center"
              justifyContent="center"
              _hover={{ bg: "gray.200" }}
              _active={{ bg: "gray.300" }}
              transition="background 0.15s"
            >
              <MdRefresh size={15} className={isLoading ? "spin" : ""} />
            </Box>
          </Flex>
        )}
      </Flex>

      {/* CHIPS (when searched) — scrollable on mobile */}
      {isSearched && (
        <Flex
          gap={2}
          mb={3}
          overflowX={{ base: "auto", md: "visible" }}
          flexWrap={{ base: "nowrap", md: "wrap" }}
          pb={{ base: "2px", md: 0 }}
          css={{ "&::-webkit-scrollbar": { display: "none" } }}
        >
          <Box
            px={2}
            py={1}
            fontSize="xs"
            borderRadius="full"
            bg="gray.50"
            display="flex"
            alignItems="center"
            gap={1}
            flexShrink={0}
          >
            <Calendar size={11} />
            {dateTime}
          </Box>
          <Box
            px={2}
            py={1}
            fontSize="xs"
            borderRadius="full"
            bg="gray.50"
            display="flex"
            alignItems="center"
            gap={1}
            flexShrink={0}
          >
            <Hash size={11} />
            {completedCount} / {journey.length} steps done
          </Box>
        </Flex>
      )}

      {/* INPUT — inline with Search button on mobile */}
      {!isSearched && (
        <Flex gap={2} mb={3}>
          <Input
            placeholder="e.g. RR-1234567"
            size="sm"
            borderRadius="xl"
            flex={1}
            value={referenceNo}
            onChange={(e) => setReferenceNo(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <PrimarySmButton
            style={{ borderRadius: "15px", flexShrink: 0 }}
            onClick={() => handleSearch()}
            loading={isLoading}
          >
            Search
          </PrimarySmButton>
        </Flex>
      )}

      {/* FOOTER — hint hidden on mobile; buttons full-width on mobile */}
      {isSearched && (
        <Flex
          justify={{ base: "flex-end", sm: "space-between" }}
          align="center"
          mt={2}
          gap={2}
        >
          <Text
            fontSize="xs"
            color="gray.400"
            display={{ base: "none", sm: "block" }}
          >
            Showing journey progress
          </Text>

          <Flex gap={2} w={{ base: "full", sm: "auto" }}>
            {initialReferenceNo ? (
              <Box display={{ base: "none", sm: "block" }}>
                <PrimarySmButton
                  style={{ borderRadius: "15px" }}
                  onClick={() => handleSearch()}
                  loading={isLoading}
                >
                  <MdRefresh className={isLoading ? "spin" : ""} /> Refresh
                </PrimarySmButton>
              </Box>
            ) : (
              <>
                <Box display={{ base: "none", sm: "block" }}>
                  <PrimarySmButton
                    style={{ borderRadius: "15px" }}
                    onClick={() => handleSearch()}
                    loading={isLoading}
                  >
                    <MdRefresh className={isLoading ? "spin" : ""} /> Refresh
                  </PrimarySmButton>
                </Box>
                <SecondarySmButton
                  style={{ borderRadius: "15px", flex: 1 }}
                  onClick={onReset}
                >
                  Search Another
                </SecondarySmButton>
              </>
            )}
          </Flex>
        </Flex>
      )}
    </Box>
  );
};
