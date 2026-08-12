"use client";

import { useMemo } from "react";
import {
  Box,
  Field,
  Input,
  Select,
  createListCollection,
  defineStyle,
} from "@chakra-ui/react";

/**
 * Floating label notched onto the top border — mirrors the design of
 * `FloatingLabelInput` (osp-ui-kit) so date and select
 * fields read as the same system as our text inputs. Date & select controls
 * always show intrinsic content, so the label stays floated.
 */
const floatingLabelStyles = defineStyle({
  pos: "absolute",
  bg: "bg",
  px: "0.5",
  top: "-3",
  insetStart: "2",
  fontWeight: "normal",
  pointerEvents: "none",
  color: "fg",
  zIndex: 1,
});

type Option = { label: string; value: string };

/** Floating-label date input matching `FloatingLabelInput`. */
export function FloatingLabelDate({
  label,
  value,
  onChange,
  onBlur,
  readOnly = false,
}: {
  label: React.ReactNode;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  /**
   * A date that is shown but not set here — one that came off the paperwork
   * rather than one the user types.
   *
   * `readOnly` alone is not enough on a date input: the browser's own picker
   * ignores it and will still write a new value through the calendar button.
   * So the button is taken away and the field stops taking pointer events,
   * which leaves nothing that can change it.
   *
   * It keeps the ordinary look and the ordinary date format, which is the
   * point — a derived date should read as the same kind of value as the ones
   * beside it, not as a sentence about a date.
   */
  readOnly?: boolean;
}) {
  return (
    <Box pos="relative" w="full">
      <Input
        type="date"
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        onBlur={onBlur}
        readOnly={readOnly}
        {...(readOnly && {
          tabIndex: -1,
          pointerEvents: "none",
          css: { "&::-webkit-calendar-picker-indicator": { display: "none" } },
        })}
      />
      <Field.Label css={floatingLabelStyles}>{label}</Field.Label>
    </Box>
  );
}

/** Floating-label select matching `FloatingLabelInput`. */
export function FloatingLabelSelect({
  label,
  items,
  value,
  onValueChange,
  onBlur,
}: {
  label: React.ReactNode;
  items: Option[];
  value?: string;
  onValueChange?: (value: string) => void;
  onBlur?: () => void;
}) {
  const collection = useMemo(() => createListCollection({ items }), [items]);
  return (
    <Box pos="relative" w="full">
      <Select.Root
        collection={collection}
        value={value ? [value] : []}
        onValueChange={(d) => onValueChange?.(d.value[0])}
        onInteractOutside={onBlur}
      >
        <Select.HiddenSelect />
        <Select.Control>
          <Select.Trigger>
            <Select.ValueText placeholder=" " />
          </Select.Trigger>
          <Select.IndicatorGroup>
            <Select.Indicator />
          </Select.IndicatorGroup>
        </Select.Control>
        <Select.Positioner>
          <Select.Content>
            {collection.items.map((item) => (
              <Select.Item key={item.value} item={item}>
                {item.label}
                <Select.ItemIndicator />
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Positioner>
      </Select.Root>
      <Field.Label css={floatingLabelStyles}>{label}</Field.Label>
    </Box>
  );
}
