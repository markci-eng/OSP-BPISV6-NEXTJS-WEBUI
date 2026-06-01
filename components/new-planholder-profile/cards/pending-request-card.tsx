import { Box, Flex, Text } from "@chakra-ui/react";
import React from "react";
import {
  LuRefreshCw,
  LuArrowLeftRight,
  LuReplace,
  LuTrendingUpDown,
  LuChevronRight,
} from "react-icons/lu";

type RequestType =
  | "Reinstatement"
  | "Change of Mode"
  | "Transfer of Rights"
  | "Returned of Premium";

type RequestStatus = "Pending" | "In Progress" | "Approved" | "Denied";

interface ProgressCardProps {
  current: number;
  total: number;
  title: string;
  description: string;
  transactionId: string;
  type: RequestType;
  status: RequestStatus;
  date: string;
  onClick?: () => void;
}

const typeIcon: Record<RequestType, React.ReactNode> = {
  Reinstatement: <LuRefreshCw size={15} />,
  "Change of Mode": <LuReplace size={15} />,
  "Transfer of Rights": <LuArrowLeftRight size={15} />,
  "Returned of Premium": <LuTrendingUpDown size={15} />,
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
}: ProgressCardProps) {
  const style = statusStyle[status];

  return (
    <Box
      borderRadius="xl"
      overflow="hidden"
      bg="white"
      border="1px solid"
      borderColor="gray.100"
      // boxShadow="sm"
      cursor="pointer"
      w="full"
      transition="box-shadow 0.15s, border-color 0.15s"
      _hover={{
        boxShadow: "md",
        borderColor: "var(--chakra-colors-primary-disabled)",
      }}
      onClick={() => onClick?.()}
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
          <Flex
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
          </Flex>
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
      </Box>
    </Box>
  );
}
