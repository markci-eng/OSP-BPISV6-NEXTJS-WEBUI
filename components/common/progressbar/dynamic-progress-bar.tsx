"use client";

import { Box } from "@chakra-ui/react";
import { useEffect, useState } from "react";

type Props = {
  value?: number;
  size?: number;
  duration?: number;
  loadingLabel?: string;
  completeLabel?: string;
  onComplete?: (isComplete: boolean) => void; 
};

export const PremiumCircularProgress = ({
  value = 0,
  size = 120,
  duration = 1200,
  loadingLabel = "In Process",
  completeLabel = "Done",  
  onComplete, 
}: Props) => {

  const resolvedSize = size;
  const safeValue = Math.min(Math.max(value, 0), 100);

  const [animatedValue, setAnimatedValue] = useState(0);

  // Animate progress
  useEffect(() => {
    let start = 0;
    const increment = safeValue / (duration / 16);

    const interval = setInterval(() => {
      start += increment;

      if (start >= safeValue) {
        start = safeValue;
        clearInterval(interval);
      }

      setAnimatedValue(Math.floor(start));
    }, 16);

    return () => clearInterval(interval);
  }, [safeValue, duration]);


  //set complete
  useEffect(() => {
  if (animatedValue === 100) {
    onComplete?.(true);
  }
}, [animatedValue, onComplete]);


  // Progress calculations
  const strokeWidth = 1.5;
  const radius = 50 - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedValue / 100) * circumference;

  // Font sizes
  const percentageFontSize = Math.min(resolvedSize * 0.3, 36);
  const labelFontSize = Math.min(resolvedSize * 0.12, 14);

  // States
  const hasStarted = safeValue > 0 || animatedValue > 0;
  const isComplete = animatedValue === 100;

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      {/* Progress Circle */}
      <Box
        width={`${resolvedSize}px`}
        height={`${resolvedSize}px`}
        position="relative"
      >
        <svg
          viewBox="0 0 100 100"
          width={`${resolvedSize}px`}
          height={`${resolvedSize}px`}
        >
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
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

        {/* Center Content */}
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          display="flex"
          flexDirection="column"
          alignItems="center"
          gap="4px"
        >
          {/* Percentage */}
          <Box
            fontSize={`${percentageFontSize}px`}
            fontWeight="bold"
            lineHeight={1}
          >
            {animatedValue}%
          </Box>

          {/* Checkmark */}
          {isComplete && (
            <svg
              width={Math.min(resolvedSize * 0.25, 28)}
              height={Math.min(resolvedSize * 0.25, 28)}
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--chakra-colors-primary)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </Box>
      </Box>

      {/* Label (only when started) */}
      {hasStarted && (
        <Box
          mt="8px"
          fontSize={`${labelFontSize}px`}
          fontWeight="medium"
          color={isComplete ? "var(--chakra-colors-primary)" : "gray.500"}
        >
          {isComplete ? completeLabel : loadingLabel}
        </Box>
      )}
    </Box>
  );
};