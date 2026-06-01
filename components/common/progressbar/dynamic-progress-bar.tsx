"use client";

import { Box } from "@chakra-ui/react";

type Props = {
  value?: number;
  size?: number;
  loadingLabel?: string;
  completeLabel?: string;
};

export const PremiumCircularProgress = ({
  value = 0,
  size = 120,
  loadingLabel = "Processing...",
  completeLabel = "Done",
}: Props) => {
  const safeValue = Math.min(Math.max(value, 0), 100);
  const isComplete = safeValue === 100;
  const hasStarted = safeValue > 0;

  const strokeWidth = 8;
  const radius = 50 - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (safeValue / 100) * circumference;

  const percentageFontSize = Math.min(size * 0.22, 26);
  const checkSize = Math.min(size * 0.3, 52);

  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap="16px">
      <Box width={`${size}px`} height={`${size}px`} position="relative">
        <svg viewBox="0 0 100 100" width={size} height={size}>
          <defs>
            <linearGradient id="pgGrad" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chakra-colors-primary)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--chakra-colors-primary)" stopOpacity="1" />
            </linearGradient>
          </defs>

          {/* Track */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="#EDF2F7"
            strokeWidth={strokeWidth}
            fill="none"
          />

          {/* Progress arc — CSS transition for smooth per-increment updates */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="url(#pgGrad)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 50 50)"
            style={{ transition: "stroke-dashoffset 0.45s cubic-bezier(0.4, 0, 0.2, 1)" }}
          />
        </svg>

        {/* Center content */}
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          {isComplete ? (
            <svg
              width={checkSize}
              height={checkSize}
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--chakra-colors-primary)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <Box
              fontSize={`${percentageFontSize}px`}
              fontWeight="700"
              color={hasStarted ? "var(--chakra-colors-primary)" : "#CBD5E0"}
              lineHeight="1"
            >
              {safeValue}%
            </Box>
          )}
        </Box>
      </Box>

      {/* Status label */}
      {hasStarted && (
        <Box
          fontSize="13px"
          fontWeight="500"
          color={isComplete ? "var(--chakra-colors-primary)" : "#718096"}
          textAlign="center"
          maxW={`${size + 60}px`}
          lineHeight="1.5"
        >
          {isComplete ? completeLabel : loadingLabel}
        </Box>
      )}
    </Box>
  );
};
