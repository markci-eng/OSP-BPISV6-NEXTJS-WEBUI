"use client";

import { Flex, VStack, Box, Heading, Text, Input } from "@chakra-ui/react";
import React from "react";
import { IconType } from "react-icons";
import {
  MdCreditCard,
  MdDescription,
  MdEditCalendar,
  MdRefresh,
} from "react-icons/md";
import { fallbackJourney, journeys } from "./journeys";
import JourneyTimeline, { JourneyStep } from "./JourneyTimeline";
import { PrimarySmButton, SecondarySmButton } from "st-peter-ui";
import { useEffect, useState } from "react";
import Link from "next/link";
import ActionButtons, {
  ActionButtonItem,
} from "@/components/buttons/ActionButtons";
import PageHeader from "./PageHeader";
import { Card } from "../card-accordion/card";

interface TrackRequestPageProps {
  requestId?: string;
  progressIcon?: IconType;
  actionButtons?: ActionButtonItem[];
}

export default function TrackRequestPage({
  requestId,
  actionButtons,
}: TrackRequestPageProps) {
  const [journey, setJourney] = useState<JourneyStep[]>(
    requestId ? [] : fallbackJourney,
  );

  const [searched, setSearched] = useState(!!requestId);
  const [currentRef, setCurrentRef] = useState(requestId ?? "");

  const handleSearch = (referenceNo: string) => {
    const prefix = referenceNo.split("-")[0].toUpperCase();
    const foundJourney = journeys[prefix] || fallbackJourney;

    setJourney(foundJourney);
    setSearched(true);
    setCurrentRef(referenceNo);
  };

  const handleReset = () => {
    setJourney(requestId ? [] : fallbackJourney);
    setSearched(false);
    setCurrentRef("");
  };

  // ✅ PROGRESS CALCULATION
  const completedCount = journey.filter((s) => s.status === "Done").length;

  const progressPercent =
    journey.length > 0 ? (completedCount / journey.length) * 100 : 0;

  const clampedProgress = Math.min(100, Math.max(0, progressPercent));

  const progressText = `${completedCount}/${journey.length} `;

  const actionButtonsDef: ActionButtonItem[] = [
    {
      label: "Service Information",
      href: `/serviceinfo/${currentRef}`,
      icon: () => <MdDescription size={16} />,
    },

    currentRef.toUpperCase() === "RR-1234567"
      ? {
          label: "Reservation Details",
          href: `/reservation/room/RR-123456`,
          icon: () => <MdEditCalendar size={16} />,
        }
      : {
          label: "Reserve Room",
          href: `/reservation/room/new`,
          icon: () => <MdEditCalendar size={16} />,
        },

    {
      label: "Statement Of Account",
      href: `/contract/${currentRef}/soa`,
      icon: () => <MdCreditCard size={16} />,
    },
  ];

  return (
    <Box minH="100vh">
      {/* HEADER */}
      {/* <Box mb={4}>
        <Heading size="2xl" fontWeight="semibold">
          Track Request
        </Heading>
        <Text fontSize="sm" color="gray.600" mt={1}>
          Monitor your request journey
        </Text>

        <ActionButtons buttons={actionButtonsDef ?? []} />
      </Box> */}

      <Flex justify="space-between" align="flex-start" flexWrap="wrap" gap={2}>
        {/* Left side: PageHeader */}
        <Box flex="1" minW="200px">
          <PageHeader
            title="Track Request"
            subtitle="Monitor your request journey"
          />
        </Box>
        {/* Desktop & Mobile Actions */}
        <ActionButtons buttons={actionButtonsDef} />
      </Flex>

      {/* REQUEST CARD */}
      <RequestCard
        description="Request details"
        dateTime="2025-03-31 09:00 AM"
        onSearch={handleSearch}
        onReset={handleReset}
        searched={searched}
        initialReferenceNo={requestId}
      />

      {/* MAIN CONTENT */}
      {journey.length > 0 && (
        <Flex
          mt={4}
          direction={{ base: "column", lg: "row" }}
          align={{ lg: "flex-start" }}
          gap={{ lg: 8 }}
        >
          {/* LEFT PANEL */}
          <VStack
            w={{ base: "100%", lg: "50%" }}
            gap={3}
            order={{ base: 0, lg: 1 }}
          >
            {/* CURRENT STATUS */}
            <Box
              mb={3}
              bg="white"
              shadow="md"
              rounded="lg"
              p={4}
              w="100%"
              position="relative"
            >
              {/* HEADER ROW (TITLE + % RIGHT SIDE) */}
              <Flex justify="space-between" align="center" mb={1}>
                <Heading size="sm">Current Status</Heading>

                {/* PROGRESS % (UPPER RIGHT) */}
                <Text fontSize="xs" fontWeight="semibold" color="green.600">
                  {/* {progressText} */}
                  {Math.round(clampedProgress)}%
                </Text>
                {/* <Text fontSize="xs" color="gray.600" mb={1}>
                  
                </Text> */}
              </Flex>

              <Text fontSize="xs" color="gray.600">
                {journey.find((s) => s.status === "Current")?.title ??
                  "Completed"}
              </Text>

              {/* HORIZONTAL TIMELINE */}
              <Flex align="center" gap={0} flex={1} mt={3}>
                {Array.from({ length: journey.length }).map((_, i) => {
                  const currentIdx = journey.findIndex(
                    (s) => s.status === "Current",
                  );
                  const current =
                    currentIdx === -1 ? journey.length + 1 : currentIdx + 1;
                  return (
                    <React.Fragment key={i}>
                      {i > 0 && (
                        <Box
                          flex={1}
                          h="1.5px"
                          bg={
                            i < current
                              ? "var(--chakra-colors-primary)"
                              : "gray.200"
                          }
                          minW="10px"
                          transition="background 0.3s"
                        />
                      )}
                      <Box
                        w={i === current - 1 ? "10px" : "7px"}
                        h={i === current - 1 ? "10px" : "7px"}
                        borderRadius="full"
                        bg={
                          i < current
                            ? "var(--chakra-colors-primary)"
                            : "gray.200"
                        }
                        boxShadow={
                          i === current - 1
                            ? "0 0 0 3px var(--chakra-colors-primary-disabled)"
                            : "none"
                        }
                        flexShrink={0}
                        transition="all 0.2s"
                      />
                    </React.Fragment>
                  );
                })}
              </Flex>
            </Box>

            {/* HELP BOX */}
            <Box bg="white" shadow="md" rounded="lg" p={4} w="100%" mb={3}>
              <Heading size="sm" mb={1}>
                Need Help?
              </Heading>

              <Text fontSize="xs" color="gray.600">
                If you need assistance, please contact{" "}
                <Link href="mailto:support@example.com">
                  support@example.com
                </Link>
                .
              </Text>
            </Box>
          </VStack>

          {/* TIMELINE */}
          <Box
            w={{ base: "100%", lg: "50%" }}
            order={{ base: 1, lg: 0 }}
            mt={3}
          >
            <JourneyTimeline journey={journey} />
          </Box>
        </Flex>
      )}
    </Box>
  );
}

// ---------------------------
// REQUEST CARD (UNCHANGED LOGIC, CLEANED ONLY SAFETY)
// ---------------------------

interface RequestCardProps {
  description: string;
  dateTime: string;
  onSearch: (referenceNo: string) => void;
  onReset: () => void;
  searched: boolean;
  initialReferenceNo?: string;
}

const RequestCard = ({
  description,
  dateTime,
  onSearch,
  onReset,
  searched,
  initialReferenceNo,
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

  return (
    <Box mb={4}>
      <Card
        activeIcon={<MdDescription size={16} />}
        title={searched || initialReferenceNo ? referenceNo : "Reference No"}
        subtitle={
          searched || initialReferenceNo
            ? [description, dateTime].filter(Boolean).join(" · ")
            : "Enter your reference number"
        }
      >
        <Flex justify="flex-end" align="center" flexWrap="wrap" gap={2}>
          {!searched && !initialReferenceNo && (
            <Input
              flex="1"
              minW="160px"
              placeholder="Enter Reference No"
              size="sm"
              value={referenceNo}
              onChange={(e) => setReferenceNo(e.target.value)}
            />
          )}

          {initialReferenceNo ? (
            <PrimarySmButton onClick={() => handleSearch()} loading={isLoading}>
              <MdRefresh className={isLoading ? "spin" : ""} /> Refresh
            </PrimarySmButton>
          ) : !searched ? (
            <PrimarySmButton onClick={() => handleSearch()} loading={isLoading}>
              Search
            </PrimarySmButton>
          ) : (
            <>
              <PrimarySmButton
                onClick={() => handleSearch()}
                loading={isLoading}
              >
                <MdRefresh className={isLoading ? "spin" : ""} /> Refresh
              </PrimarySmButton>

              <SecondarySmButton onClick={onReset}>
                Search Another
              </SecondarySmButton>
            </>
          )}
        </Flex>
      </Card>
    </Box>
  );
};
