"use client";

// The claims area's boxed picker — a bordered field with its own caption inside
// it, the chosen value under that, and a menu behind it.
//
// IT IS THE APPROVALS "REQUEST TYPE" FIELD, lifted out of that page. Every
// measurement here is that control's: the 1px gray.200 border and `xl` corner,
// the 4/3 padding, the 10px 700-weight gray.400 caption at 0.08em, the `sm`
// 600-weight value 3px under it, the 18px leading glyph in `primary`, the 16px
// chevron in gray.400, and the 260px menu. Written down once rather than
// measured off a screenshot a second time.
//
// NOT `FieldLabel` + A SELECT, which is the area's other picker and still the
// right one in a rail. The difference is where the caption sits: that pair
// stands a caption ABOVE a control, which is what a column of narrow fields
// wants, while this puts the caption INSIDE the box so the field states what it
// is and what it is set to as one object. A page with one prominent selector
// over its content wants the second; a rail of four wants the first.
//
// `approvals/page.tsx` still holds its own copy of this markup. It should use
// this instead — the two are the same control, and the copy there is the reason
// this file states its measurements rather than referring to them.

import type { ReactNode } from "react";
import { Box, chakra, HStack, Menu, Portal, Text } from "@chakra-ui/react";
import { ChevronDown } from "lucide-react";

/**
 * The trigger, as a real `<button>`.
 *
 * THE COPY IN `approvals/page.tsx` IS A `<div>`, and that is a bug rather than a
 * style: `Menu.Trigger asChild` hands its props to whatever child it is given,
 * and an `HStack` is a div — which takes no focus, so the field cannot be
 * reached by Tab and cannot be opened without a mouse. Ark's own trigger is a
 * button for exactly this reason; `asChild` onto a layout component quietly
 * gives that up.
 *
 * `chakra("button")` rather than `HStack as="button"` for the reason
 * `FieldLabel` states about `as`: it swaps the tag rendered but not the props
 * accepted, so `type="button"` would not be allowed through — and a button
 * inside a form without it submits.
 */
const Trigger = chakra("button");

export interface MenuSelectOption<T extends string> {
  label: string;
  value: T;
}

export interface MenuSelectProps<T extends string> {
  /** The caption inside the box, e.g. "Queue". Upper-cased by the style. */
  label: string;
  value: T;
  options: MenuSelectOption<T>[];
  onChange: (value: T) => void;
  /**
   * Optional leading glyph, e.g. `<Inbox size={18} />`. Drawn in `primary`.
   *
   * Optional because not every picker has an honest icon for what it selects,
   * and a vague one costs more than the space it fills.
   */
  icon?: ReactNode;
  /** Widths this sits at. Defaults to the approvals field's own. */
  width?: Record<string, string> | string;
}

export function MenuSelect<T extends string>({
  label,
  value,
  options,
  onChange,
  icon,
  width = { base: "full", md: "sm" },
}: MenuSelectProps<T>) {
  const selected = options.find((o) => o.value === value);

  return (
    <HStack w={width} gap={2} align="stretch">
      <Menu.Root>
        <Menu.Trigger asChild>
          <Trigger
            type="button"
            flex="1"
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            textAlign="left"
            borderWidth="1px"
            borderColor="gray.200"
            borderRadius="xl"
            bg="white"
            px={4}
            py={3}
            cursor="pointer"
            gap={3}
            _hover={{ borderColor: "gray.300" }}
            // The border is the focus state, as it is on `SearchBar` — one
            // answer to "this control has the caret" across the area.
            _focusVisible={{
              borderColor: "var(--chakra-colors-primary)",
              outline: "none",
            }}
            transition="border-color 0.15s"
            userSelect="none"
          >
            <HStack gap={3} minW={0} flex="1">
              {icon && (
                <Box color="var(--chakra-colors-primary)" flexShrink={0}>
                  {icon}
                </Box>
              )}
              <Box minW={0} flex="1">
                <Text
                  fontSize="10px"
                  fontWeight="700"
                  color="gray.400"
                  textTransform="uppercase"
                  letterSpacing="0.08em"
                  lineHeight="1"
                >
                  {label}
                </Text>
                <Text
                  fontSize="sm"
                  fontWeight="600"
                  color="gray.800"
                  lineClamp={1}
                  mt="3px"
                >
                  {selected?.label ?? ""}
                </Text>
              </Box>
            </HStack>
            <Box color="gray.400" flexShrink={0}>
              <ChevronDown size={16} />
            </Box>
          </Trigger>
        </Menu.Trigger>

        <Portal>
          <Menu.Positioner>
            <Menu.Content minW="260px">
              {options.map((option) => (
                <Menu.Item
                  key={option.value}
                  value={option.value}
                  onClick={() => onChange(option.value)}
                  fontWeight={option.value === value ? "600" : "400"}
                  color={
                    option.value === value
                      ? "var(--chakra-colors-primary)"
                      : undefined
                  }
                >
                  {option.label}
                </Menu.Item>
              ))}
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
    </HStack>
  );
}

export default MenuSelect;
