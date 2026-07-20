"use client";

import type { TextareaProps } from "@chakra-ui/react";
import {
  Box,
  Field,
  Textarea,
  defineStyle,
  useControllableState,
} from "@chakra-ui/react";
import { useState } from "react";

export interface FloatingLabelTextareaProps extends TextareaProps {
  label: React.ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

export const FloatingLabelTextarea = (props: FloatingLabelTextareaProps) => {
  const { label, onValueChange, value, defaultValue = "", ...rest } = props;

  const [inputState, setInputState] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  });

  const [focused, setFocused] = useState(false);
  const shouldFloat = inputState.length > 0 || focused;

  return (
    <Box pos="relative" w="full">
      <Textarea
        {...rest}
        onFocus={(e) => {
          props.onFocus?.(e);
          setFocused(true);
        }}
        onBlur={(e) => {
          props.onBlur?.(e);
          setFocused(false);
        }}
        onChange={(e) => {
          props.onChange?.(e);
          setInputState(e.target.value);
        }}
        value={inputState}
        data-float={shouldFloat || undefined}
      />
      <Field.Label css={floatingStyles} data-float={shouldFloat || undefined}>
        {label}
      </Field.Label>
    </Box>
  );
};

const floatingStyles = defineStyle({
  pos: "absolute",
  bg: "bg",
  px: "0.5",
  top: "2.5",
  insetStart: "3",
  fontWeight: "normal",
  pointerEvents: "none",
  transition: "all 0.2s",
  color: "fg.muted",
  "&[data-float]": {
    top: "-3",
    insetStart: "2",
    fontSize: "sm",
    color: "fg",
  },
});
