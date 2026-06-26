"use client";

import React from "react";
import { Check, Circle, LucideIcon } from "lucide-react";
import { Box, Flex, Text, Badge, Spinner } from "@chakra-ui/react";
import { motion } from "framer-motion";

export interface JourneyStep {
  step: number;
  title: string;
  description: string;
  dateTime: string;
  status: string;
  icon?: LucideIcon;
}

interface StatusConfigItem {
  colorPalette: string;
  icon: LucideIcon | "spinner";
  label: string;
  pulse?: boolean;
}

interface JourneyTimelineProps {
  journey: JourneyStep[];
  fullHeight?: boolean;
  statusConfig?: Record<string, StatusConfigItem>;
}

const DEFAULT_STATUS_CONFIG: Record<string, StatusConfigItem> = {
  Done: { colorPalette: "green", icon: Check, label: "Done" },
  Current: {
    colorPalette: "blue",
    icon: "spinner",
    label: "In Progress",
    pulse: true,
  },
  Pending: { colorPalette: "gray", icon: Circle, label: "Pending" },
};

const MotionFlex = motion(Flex);

export default function JourneyTimeline({
  journey,
  fullHeight = false,
  statusConfig,
}: JourneyTimelineProps) {
  const config = statusConfig ?? DEFAULT_STATUS_CONFIG;

  const getStatus = (status: string): StatusConfigItem =>
    config[status] ?? { colorPalette: "gray", icon: Circle, label: status };

  const renderIndicatorIcon = (
    step: JourneyStep,
    isDone: boolean,
    isCurrent: boolean,
  ) => {
    if (step.icon) {
      const StepIcon = step.icon;
      return <StepIcon size={13} />;
    }
    if (isDone) return <Check size={13} strokeWidth={3} />;
    if (isCurrent) return <Spinner size="xs" />;
    return (
      <Text fontSize="10px" fontWeight="bold" color="gray.400" lineHeight="1">
        {step.step}
      </Text>
    );
  };

  return (
    <Box w="full" h={fullHeight ? "full" : "auto"}>
      {journey.map((step, index) => {
        const status = getStatus(step.status);
        const isDone = step.status === "Done";
        const isCurrent = step.status === "Current";
        const isPending = step.status === "Pending";
        const isLast = index === journey.length - 1;

        return (
          <MotionFlex
            key={step.step}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.06, duration: 0.3 } as any}
            w="full"
            gap={3}
            align="stretch"
          >
            {/* ── Indicator + connector ── */}
            <Flex direction="column" align="center" flexShrink={0} pt="9px">
              {/* Circle */}
              <Box
                w="28px"
                h="28px"
                borderRadius="full"
                flexShrink={0}
                display="flex"
                alignItems="center"
                justifyContent="center"
                position="relative"
                bg={
                  isDone ? "green.500" : isCurrent ? "blue.500" : "transparent"
                }
                border={isPending ? "2px dashed" : "none"}
                borderColor={isPending ? "gray.200" : "transparent"}
                color={isDone || isCurrent ? "white" : "gray.400"}
                transition="all 0.3s"
                boxShadow={
                  isCurrent ? "0 0 0 5px rgba(59,130,246,0.15)" : "none"
                }
              >
                {renderIndicatorIcon(step, isDone, isCurrent)}
              </Box>

              {/* Connector line */}
              {!isLast && (
                <Box
                  w="2px"
                  flex={1}
                  minH="20px"
                  my="5px"
                  bg={isDone ? "green.200" : "gray.100"}
                  borderRadius="full"
                />
              )}
            </Flex>

            {/* ── Content ── */}
            <Box
              flex={1}
              pb={isLast ? 1 : 5}
              opacity={isPending ? 0.5 : 1}
              transition="opacity 0.2s"
            >
              <Box
                p={isCurrent ? 3 : 2}
                mx={-2}
                borderRadius="xl"
                bg={isCurrent ? "blue.50" : "transparent"}
                transition="background 0.25s"
              >
                {/* Title + badge row */}
                <Flex
                  justify="space-between"
                  align="flex-start"
                  gap={2}
                  mb="3px"
                >
                  <Text
                    fontSize="sm"
                    fontWeight={
                      isCurrent ? "bold" : isDone ? "medium" : "normal"
                    }
                    color={
                      isCurrent ? "blue.700" : isDone ? "gray.700" : "gray.500"
                    }
                    lineHeight="1.3"
                  >
                    {step.title}
                  </Text>

                  <Badge
                    size="sm"
                    variant="subtle"
                    rounded="full"
                    flexShrink={0}
                    colorPalette={status.colorPalette}
                    fontSize="9px"
                    px={2}
                  >
                    {status.label}
                  </Badge>
                </Flex>

                {/* Description */}
                {step.description && (
                  <Text
                    fontSize="xs"
                    color={isCurrent ? "blue.500" : "gray.400"}
                    lineHeight="1.4"
                  >
                    {step.description}
                  </Text>
                )}

                {/* DateTime */}
                {step.dateTime && (
                  <Text fontSize="10px" color="gray.400" mt="3px">
                    {step.dateTime}
                  </Text>
                )}
              </Box>
            </Box>
          </MotionFlex>
        );
      })}
    </Box>
  );
}
