"use client";

import { useRef, useState } from "react";

type Options = {
  total: number;
  onComplete?: () => void;
};

export function useProgressController({ total, onComplete }: Options) {
  const [current, setCurrent] = useState(0);

  const completedRef = useRef(false);

  const start = () => {
    setCurrent(0);
    completedRef.current = false;
  };

  const increment = () => {
    setCurrent((prev) => {
      const next = prev + 1;

      if (next >= total) {
        if (!completedRef.current) {
          completedRef.current = true;
          onComplete?.();
        }
        return total;
      }

      return next;
    });
  };

  const reset = () => {
    setCurrent(0);
    completedRef.current = false;
  };

  const percentage = total === 0 ? 0 : Math.round((current / total) * 100);
  const isComplete = current >= total;

  return {
    current,
    total,
    percentage,
    isComplete,
    start,
    increment,
    reset,
  };
}