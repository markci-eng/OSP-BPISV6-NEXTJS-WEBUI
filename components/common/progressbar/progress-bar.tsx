"use client";

import { Box } from "@chakra-ui/react";

type Props = {
  value?: number;
  size?: number;
  loadingLabel?: string;
  completeLabel?: string;
};

export const ReusableProgressBar = ({
  value = 0,
  size = 120,
  loadingLabel = "In Process",
  completeLabel = "Done",
}: Props) => {
  const resolvedSize = size;
  const safeValue = Math.min(Math.max(value, 0), 100);

  const strokeWidth = 1.5;
  const radius = 50 - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (safeValue / 100) * circumference;

  const percentageFontSize = Math.min(resolvedSize * 0.3, 36);
  const labelFontSize = Math.min(resolvedSize * 0.12, 14);

  const isComplete = safeValue === 100;
  const hasStarted = safeValue > 0;

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <Box width={`${resolvedSize}px`} height={`${resolvedSize}px`} position="relative">
        <svg width={resolvedSize} height={resolvedSize} viewBox="0 0 100 100">
          <defs>
            <linearGradient id="progressGradient">
              <stop offset="0%" stopColor="var(--chakra-colors-primary)" />
              <stop offset="100%" stopColor="var(--chakra-colors-primary)" />
            </linearGradient>
          </defs>

          {/* Track */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Progress */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="url(#progressGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 50 50)"
          />
        </svg>

        {/* Center */}
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          textAlign="center"
        >
          <Box fontSize={`${percentageFontSize}px`} fontWeight="bold">
            {safeValue}%
          </Box>

          {isComplete && (
            <Box color="green.500" fontSize="20px">
              ✔
            </Box>
          )}
        </Box>
      </Box>

      {hasStarted && (
        <Box
          mt="8px"
          fontSize={`${labelFontSize}px`}
          color={isComplete ? "green.500" : "gray.500"}
        >
          {isComplete ? completeLabel : loadingLabel}
        </Box>
      )}
    </Box>
  );
};