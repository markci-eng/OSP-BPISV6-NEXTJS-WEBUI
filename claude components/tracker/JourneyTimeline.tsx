"use client";

import React from "react";
import { Check, Circle, LucideIcon } from "lucide-react";
import {
  Box,
  Text,
  Badge,
  Timeline,
  Spinner,
  HStack,
  VStack,
} from "@chakra-ui/react";
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
  /** makes timeline expand to parent height */
  fullHeight?: boolean;
  statusConfig?: Record<string, StatusConfigItem>;
}

const DEFAULT_STATUS_CONFIG: Record<string, StatusConfigItem> = {
  Done: {
    colorPalette: "green",
    icon: Check,
    label: "Completed",
  },
  Current: {
    colorPalette: "blue",
    icon: "spinner",
    label: "In Progress",
    pulse: true,
  },
  Pending: {
    colorPalette: "gray",
    icon: Circle,
    label: "Up Next",
  },
};

const MotionBox = motion(Box);

export default function JourneyTimeline({
  journey,
  fullHeight = false,
  statusConfig,
}: JourneyTimelineProps) {
  const config = statusConfig ?? DEFAULT_STATUS_CONFIG;

  const completedCount = journey.filter((j) => j.status === "Done").length;

  const getStatus = (status: string) =>
    config[status] ?? {
      colorPalette: "gray",
      icon: Circle,
      label: status,
    };

  const renderIcon = (step: JourneyStep, status: StatusConfigItem) => {
    // 1. PRIORITY: step icon
    const StepIcon = step.icon;

    if (StepIcon) {
      return <StepIcon size={14} />;
    }

    // 2. STATUS ICON
    if (status.icon === "spinner") {
      return <Spinner size="xs" />;
    }

    const StatusIcon = status.icon;

    return <StatusIcon size={14} />;
  };

  return (
    <Box
      w="full"
      h={fullHeight ? "full" : "auto"}
      display="flex"
      flexDirection="column">
      {/* HEADER */}
      <Box mb={4} w="full">
        <HStack justify="space-between">
          <Text fontSize="sm" fontWeight="semibold">
            Journey Progress
          </Text>

          <Text fontSize="xs" color="fg.muted">
            {completedCount}/{journey.length} completed
          </Text>
        </HStack>
      </Box>

      {/* TIMELINE */}
      <Box flex="1" w="full">
        <Timeline.Root size="lg">
          {journey.map((step, index) => {
            const status = getStatus(step.status);
            const isCurrent = step.status === "Current";

            return (
              <Timeline.Item key={step.step}>
                <Timeline.Connector>
                  <Timeline.Separator borderStyle="dashed" />

                  <Timeline.Indicator
                    colorPalette={status.colorPalette}
                    _before={
                      isCurrent && status.pulse
                        ? {
                            content: '""',
                            position: "absolute",
                            inset: "-6px",
                            borderRadius: "full",
                            bg: "blue.400",
                            opacity: 0.25,
                            animation: "pulse 1.5s infinite",
                          }
                        : undefined
                    }>
                    {renderIcon(step, status)}
                  </Timeline.Indicator>
                </Timeline.Connector>

                <Timeline.Content>
                  <MotionBox
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.01 }}>
                    {/* RESPONSIVE GRID */}
                    <Box
                      display="grid"
                      gridTemplateColumns={{
                        base: "1fr",
                        md: "1fr auto",
                      }}
                      gap={2}
                      alignItems="start"
                      w="full">
                      {/* LEFT */}
                      <VStack align="start" gap={0.5}>
                        <Timeline.Title fontSize="sm" fontWeight="semibold">
                          {step.title}
                        </Timeline.Title>

                        {step.description && (
                          <Timeline.Description fontSize="xs" color="fg.muted">
                            {step.description}
                          </Timeline.Description>
                        )}

                        {step.dateTime && (
                          <Text fontSize="xs" color="fg.subtle">
                            {step.dateTime}
                          </Text>
                        )}
                      </VStack>

                      {/* BADGE */}
                      <Badge
                        width="fit-content"
                        size="sm"
                        variant="subtle"
                        rounded="full"
                        colorPalette={status.colorPalette}
                        colorScheme={status.colorPalette}>
                        {status.label}
                      </Badge>
                    </Box>
                  </MotionBox>
                </Timeline.Content>
              </Timeline.Item>
            );
          })}
        </Timeline.Root>
      </Box>

      {/* PULSE ANIMATION */}
      <style jsx global>{`
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.4);
            opacity: 0.15;
          }
          100% {
            transform: scale(1);
            opacity: 0.3;
          }
        }
      `}</style>
    </Box>
  );
}
