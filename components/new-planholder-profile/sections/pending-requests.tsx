"use client";
import {
  Box,
  Carousel,
  Flex,
  IconButton,
  Separator,
  Strong,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useState } from "react";
import {
  LuArrowLeft,
  LuArrowRight,
  LuClock,
  LuHistory,
} from "react-icons/lu";
import { ProgressCard } from "../cards/pending-request-card";
import RequestHistoryDrawer, {
  RequestHistoryItem,
} from "@/components/drawers/request-history-drawer";
import { Small } from "st-peter-ui";
import { Card } from "@/claude components/card-accordion/card";

export interface RequestProps {
  type:
    | "Reinstatement"
    | "Change of Mode"
    | "Transfer of Rights"
    | "Returned of Premium";
  title: string;
  description: string;
  transactionId: string;
  currentStep: number;
  totalSteps: number;
  status: "Pending" | "In Progress" | "Approved" | "Denied";
  date: string;
  hyperlink: string;
}

export function PendingRequests({
  requests,
  h,
}: {
  requests?: RequestProps[] | undefined;
  h?: string | Record<string, string>;
}) {
  const isMobile = useBreakpointValue({ base: true, lg: false }) ?? false;
  const [historyOpen, setHistoryOpen] = useState(false);

  const pendingRequests = requests?.filter((x) => x.status === "Pending");

  const historyItems: RequestHistoryItem[] = (requests ?? [])
    .filter((x) => x.status !== "Pending")
    .map((x) => ({
      type: x.type,
      description: x.description,
      transactionId: x.transactionId,
      date: x.date,
    }));

  const content = (
    <Flex flexDir="column">
      <Carousel.Root slideCount={pendingRequests?.length ?? 0} maxW="full">
        <Carousel.Control justifyContent="center" gap={2} w="full">
          {!isMobile && pendingRequests && pendingRequests.length > 1 && (
            <Carousel.PrevTrigger asChild>
              <IconButton size="2xs" variant="outline">
                <LuArrowLeft />
              </IconButton>
            </Carousel.PrevTrigger>
          )}

          <Carousel.ItemGroup w="full">
            {!pendingRequests || pendingRequests.length === 0 ? (
              <Carousel.Item index={0} minW={0}>
                <Flex
                  align={"center"}
                  justify="center"
                  flexDir="column"
                  py={10}
                  gap={2}
                >
                  <Small>No Pending Request</Small>
                </Flex>
              </Carousel.Item>
            ) : (
              pendingRequests.map((request, index) => (
                <Carousel.Item key={index} index={index} minW={0}>
                  <ProgressCard
                    current={request.currentStep}
                    total={request.totalSteps}
                    title={request.title}
                    description={request.description}
                    transactionId={request.transactionId}
                    type={request.type}
                    status={request.status}
                    date={request.date}
                    onClick={() => (window.location.href = request.hyperlink)}
                  />
                </Carousel.Item>
              ))
            )}
          </Carousel.ItemGroup>

          {!isMobile && pendingRequests && pendingRequests.length > 1 && (
            <Carousel.NextTrigger asChild>
              <IconButton size={{ base: "2xs", lg: "xs" }} variant="outline">
                <LuArrowRight />
              </IconButton>
            </Carousel.NextTrigger>
          )}
        </Carousel.Control>

        <Carousel.Indicators
          transition="width 0.2s ease-in-out"
          transformOrigin="center"
          opacity="0.5"
          boxSize="2"
          bg="gray.200"
          _current={{
            width: "10",
            bg: "gray.300",
            opacity: 1,
          }}
        />
      </Carousel.Root>
    </Flex>
  );
  const pendingCount = pendingRequests?.length ?? 0;

  return (
    <Card
      h={h}
      activeIcon={<LuClock size={16} />}
      title="Pending Request(s)"
      subtitle={
        pendingCount > 0
          ? `${pendingCount} request${pendingCount > 1 ? "s" : ""} awaiting action`
          : "No pending requests"
      }
      headerAction={
        <IconButton
          aria-label="View request history"
          size="xs"
          variant="ghost"
          color="var(--chakra-colors-primary)"
          onClick={() => setHistoryOpen(true)}
        >
          <LuHistory /> History
        </IconButton>
      }
    >
      <RequestHistoryDrawer
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        items={historyItems}
      />
      {content}
    </Card>
  );
}
