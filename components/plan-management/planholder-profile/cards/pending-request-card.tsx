import { OSPBadge, type OSPBadgeProps } from "osp-ui-kit";
import { Box, Flex, Text } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import React from "react";
import {
  LuRefreshCw,
  LuArrowLeftRight,
  LuFileText,
  LuReceiptText,
  LuReplace,
  LuTrendingUpDown,
  LuChevronRight,
} from "react-icons/lu";

/**
 * What raised the request.
 *
 * NOT PLAN-MANAGEMENT'S ALONE SINCE 2026-09-16. The first four were the whole
 * union while this card was only drawn on the plan-management profile; the
 * CLAIMS profile draws it too now, and what it puts on the card is a death claim
 * or a service payable. Widening is additive — every existing caller passes one
 * of the original four and nothing about them changes — and it is the
 * alternative to a second card that looks identical with two strings different.
 *
 * ADD A KIND HERE AND GIVE IT AN ICON in {@link typeIcon}, which is a total
 * `Record` and will not compile without one. That is deliberate: the history
 * drawer's icon switch degrades silently to a document glyph, and this one
 * should not.
 */
export type RequestType =
  | "Reinstatement"
  | "Change of Mode"
  | "Transfer of Rights"
  | "Returned of Premium"
  // Claims
  | "Death Claim"
  | "Service Payable";

export type RequestStatus = "Pending" | "In Progress" | "Approved" | "Denied";

export interface ProgressCardProps {
  current: number;
  total: number;
  title: string;
  description: string;
  transactionId: string;
  type: RequestType;
  status: RequestStatus;
  date: string;
  onClick?: () => void;
  /**
   * Whether pressing the card also routes to `/transaction/{transactionId}`.
   *
   * ON BY DEFAULT, so every caller that existed before this prop behaves exactly
   * as it did: the card calls `onClick` and then navigates.
   *
   * THE CLAIMS PROFILE TURNS IT OFF. A request there goes to one of two places
   * depending on what raised it — a claim opens in place beside the plan holder,
   * a service payable routes to its own queue — and only the page knows which.
   * A card that navigated on its own as well would take the reader somewhere on
   * the way to wherever the page was sending them.
   */
  navigateOnClick?: boolean;
}

const typeIcon: Record<RequestType, React.ReactNode> = {
  Reinstatement: <LuRefreshCw size={15} />,
  "Change of Mode": <LuReplace size={15} />,
  "Transfer of Rights": <LuArrowLeftRight size={15} />,
  "Returned of Premium": <LuTrendingUpDown size={15} />,
  "Death Claim": <LuFileText size={15} />,
  "Service Payable": <LuReceiptText size={15} />,
};

/**
 * Which badge each status gets.
 *
 * IT USED TO BE `type="warning"`, HARD-CODED — every card wore the amber of a
 * pending request whatever its status said, so an approved one read as
 * outstanding. It went unnoticed because the only caller filters to `Pending`
 * before it renders anything (see `sections/pending-requests`), which is also
 * why fixing it changes nothing on the screens that existed before today.
 */
const statusBadge: Record<RequestStatus, OSPBadgeProps["type"]> = {
  Pending: "warning",
  "In Progress": "info",
  Approved: "success",
  Denied: "danger",
};

const statusStyle: Record<
  RequestStatus,
  { bg: string; color: string; dot: string }
> = {
  Pending: {
    bg: "orange.50",
    color: "orange.600",
    dot: "orange.400",
  },
  "In Progress": {
    bg: "blue.50",
    color: "blue.600",
    dot: "blue.400",
  },
  Approved: {
    bg: "green.50",
    color: "green.600",
    dot: "green.400",
  },
  Denied: {
    bg: "red.50",
    color: "red.600",
    dot: "red.400",
  },
};

function StepTrack({ current, total }: { current: number; total: number }) {
  return (
    <Flex align="center" gap={0} flex={1}>
      {Array.from({ length: total }).map((_, i) => (
        <React.Fragment key={i}>
          {i > 0 && (
            <Box
              flex={1}
              h="1.5px"
              bg={i < current ? "var(--chakra-colors-primary)" : "gray.200"}
              minW="10px"
              transition="background 0.3s"
            />
          )}
          <Box
            w={i === current - 1 ? "10px" : "7px"}
            h={i === current - 1 ? "10px" : "7px"}
            borderRadius="full"
            bg={i < current ? "var(--chakra-colors-primary)" : "gray.200"}
            boxShadow={
              i === current - 1
                ? "0 0 0 3px var(--chakra-colors-primary-disabled)"
                : "none"
            }
            flexShrink={0}
            transition="all 0.2s"
          />
        </React.Fragment>
      ))}
    </Flex>
  );
}

export function ProgressCard({
  current,
  total,
  title,
  description,
  transactionId,
  type,
  status,
  date,
  onClick,
  navigateOnClick = true,
}: ProgressCardProps) {
  const router = useRouter();
  const style = statusStyle[status];

  function handleClick() {
    onClick?.();
    // See {@link ProgressCardProps.navigateOnClick} — on unless a caller that
    // routes for itself turns it off.
    if (navigateOnClick) router.push(`/transaction/${transactionId}`);
  }

  return (
    <Box
      borderRadius="xl"
      overflow="hidden"
      bg="white"
      border="1px solid"
      borderColor="gray.200"
      // boxShadow="sm"
      cursor="pointer"
      w="full"
      transition="box-shadow 0.15s, border-color 0.15s"
      _hover={{
        boxShadow: "md",
        borderColor: "var(--chakra-colors-primary-disabled)",
      }}
      onClick={handleClick}
    >
      <Box px={4} pt={3} pb={4}>
        {/* Header row */}
        <Flex align="flex-start" justify="space-between" gap={2} mb={3}>
          <Flex align="center" gap={2.5} minW={0}>
            <Box
              p={2}
              borderRadius="lg"
              bg="var(--chakra-colors-primary-disabled)/20"
              color="var(--chakra-colors-primary)"
              flexShrink={0}
            >
              {typeIcon[type]}
            </Box>
            <Box minW={0}>
              <Text
                fontSize="sm"
                fontWeight="semibold"
                color="gray.800"
                lineClamp={1}
              >
                {title}
              </Text>
              <Text fontSize="xs" color="gray.500" lineClamp={1} mt="1px">
                {description}
              </Text>
            </Box>
          </Flex>

          {/* Status badge */}
          {/* <Flex
            align="center"
            gap={1.5}
            px={2}
            py={1}
            borderRadius="full"
            bg={style.bg}
            flexShrink={0}
          >
            <Box w="5px" h="5px" borderRadius="full" bg={style.dot} />
            <Text fontSize="10px" fontWeight="semibold" color={style.color}>
              {status}
            </Text>
          </Flex> */}
          {/* TYPED BY THE STATUS, not always "warning" — see
              {@link statusBadge}, where what that was hiding is written down. */}
          <OSPBadge type={statusBadge[status]}>{status}</OSPBadge>
        </Flex>

        {/* Step track */}
        <Flex align="center" gap={3} mb={3}>
          <StepTrack current={current} total={total} />
          <Text
            fontSize="xs"
            color="gray.400"
            whiteSpace="nowrap"
            flexShrink={0}
          >
            {current} / {total} steps
          </Text>
        </Flex>

        {/* Footer */}
        <Flex align="center" justify="space-between">
          <Text fontSize="xs" color="gray.400">
            {date}
          </Text>
          <Flex align="center" gap={1} color="gray.400">
            <Text fontSize="10px" fontFamily="mono">
              {transactionId}
            </Text>
            <LuChevronRight size={11} />
          </Flex>
        </Flex>

        {/* FOOTER */}
        <Flex
          justify="space-between"
          align="center"
          mt={1}
          pt={1}
          borderTop={"1px solid"}
          borderColor={"gray.100"}
        >
          <Text fontSize="xs" color="gray.400">
            Tap to track request
          </Text>
          <LuChevronRight color="#a1a1aa" />
        </Flex>
      </Box>
    </Box>
  );
}
