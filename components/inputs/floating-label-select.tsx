"use client";

import {
  Box,
  Field,
  Flex,
  NativeSelect,
  Text,
  defineStyle,
  useBreakpointValue,
  useControllableState,
} from "@chakra-ui/react";
import { ChevronDown, List } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import * as React from "react";
import { useState } from "react";
import {
  QuickBottomSheet,
  type QuickBottomSheetOption,
} from "@/claude components/drawer/quick-bottom-sheet";

export interface FloatingLabelSelectProps {
  label: React.ReactNode;
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  bg?: NativeSelect.FieldProps["bg"];
  /** Icon shown next to each choice in the mobile bottom sheet. */
  mobileIcon?: LucideIcon;
  required?: boolean;
}

/** Reads the `<option>` children into a flat list, skipping the blank placeholder. */
function optionsFromChildren(children: React.ReactNode) {
  const options: { value: string; label: string }[] = [];
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child) || child.type !== "option") return;
    const props = child.props as { value?: string; children?: React.ReactNode };
    const value = props.value ?? "";
    if (value === "") return;
    options.push({ value, label: String(props.children ?? value) });
  });
  return options;
}

export const FloatingLabelSelect = ({
  label,
  name,
  value,
  defaultValue = "",
  onChange,
  onValueChange,
  children,
  bg: selectBg = "bg",
  mobileIcon = List,
  required,
}: FloatingLabelSelectProps) => {
  const [selectState, setSelectState] = useControllableState({
    defaultValue,
    onChange: onValueChange,
    value,
  });

  const [focused, setFocused] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const shouldFloat = selectState.length > 0 || focused;
  // Default to desktop so the sheet isn't mounted during the first (unresolved) render.
  const isMobile = useBreakpointValue({ base: true, md: false }) ?? false;

  const commit = (next: string) => {
    setSelectState(next);
    onChange?.({
      target: { value: next },
      currentTarget: { value: next },
    } as unknown as React.ChangeEvent<HTMLSelectElement>);
  };

  if (isMobile) {
    const options = optionsFromChildren(children);
    const current = options.find((o) => o.value === selectState);
    const sheetOptions: QuickBottomSheetOption[] = options.map((o) => ({
      value: o.value,
      label: o.label,
      icon: mobileIcon,
    }));

    return (
      <Field.Root p={0.5} required={required}>
        <Box pos="relative" w="full">
          <Flex
            as="button"
            w="full"
            h="12"
            align="center"
            justify="space-between"
            gap={2}
            px={3}
            pt={shouldFloat ? "5" : "2"}
            pb="1"
            textAlign="left"
            borderWidth="1.5px"
            borderRadius="lg"
            bg={selectBg}
            cursor="pointer"
            onClick={() => setSheetOpen(true)}
          >
            <Text fontSize="sm" fontWeight="semibold" truncate>
              {current?.label ?? ""}
            </Text>
            <Box as="span" color="gray.400" flexShrink={0}>
              <ChevronDown size={16} />
            </Box>
          </Flex>

          <Field.Label
            css={floatingStyles(selectBg)}
            data-float={shouldFloat || undefined}
          >
            {label}
            <Field.RequiredIndicator color="red.500" />
          </Field.Label>
        </Box>

        <QuickBottomSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          title={typeof label === "string" ? label : ""}
          options={sheetOptions}
          defaultValue={selectState || undefined}
          onConfirm={commit}
        />
      </Field.Root>
    );
  }

  return (
    <Field.Root p={0.5} required={required}>
      <Box pos="relative" w="full">
        <NativeSelect.Root
          size="sm"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        >
          <NativeSelect.Field
            name={name}
            value={selectState}
            onChange={(e) => {
              onChange?.(e);
              setSelectState(e.target.value);
            }}
            bg={selectBg}
            h="12"
            pt={shouldFloat ? "5" : "2"}
            pb="1"
            fontSize="sm"
            fontWeight="semibold"
            borderWidth="1.5px"
            borderRadius="lg"
            data-float={shouldFloat || undefined}
          >
            <option value="">&nbsp;</option>
            {children}
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>

        <Field.Label
          css={floatingStyles(selectBg)}
          data-float={shouldFloat || undefined}
        >
          {label}
          <Field.RequiredIndicator color="red.500" />
        </Field.Label>
      </Box>
    </Field.Root>
  );
};

const floatingStyles = (bg: NativeSelect.FieldProps["bg"]) =>
  defineStyle({
    pos: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    insetStart: "3",
    fontSize: "sm",
    fontWeight: "normal",
    color: "gray.400",
    bg,
    px: "0.5",
    pointerEvents: "none",
    transition:
      "top 0.15s ease, font-size 0.15s ease, color 0.15s ease, transform 0.15s ease",
    "&[data-float]": {
      top: "-2",
      transform: "translateY(0)",
      fontSize: "xs",
      fontWeight: "medium",
      color: "gray.400",
      insetStart: "2.5",
    },
  });
