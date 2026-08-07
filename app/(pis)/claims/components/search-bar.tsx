"use client";

// The claims area's search field — one component, so every search in the area
// matches the plan holder lookup in accounts-management, which is the design
// this copies.
//
// Copied from `LookupField`'s own trigger field in `osp-ui-kit` rather than
// approximated: the border, the radius, the 40px floor, the hover, and the
// focus ring are that component's values. It is not reused directly because
// `LookupField` is a modal picker over a fixed dataset — it owns its results,
// its table and its pagination — where these searches filter a list the caller
// already has. Same field, different job.
//
// The magnifier sits at the TRAILING edge, which is where that design puts it.
// Whether it is a BUTTON is the caller's choice: see `onSearch`.

import type { KeyboardEventHandler } from "react";
import { Box, Flex, IconButton, Input, type FlexProps } from "@chakra-ui/react";
import { LuSearch, LuX } from "react-icons/lu";

/**
 * The two sizes, kept in one place because the parts have to agree.
 *
 * The height of this field is NOT the box's — it is the input's, which carries
 * `--input-height` from its own size recipe (40px at `md`, 36px at `sm`) and
 * pushes the box open to fit. Set the box alone and nothing happens; the input
 * still measures what it always did. So each size names both, plus the padding
 * the recipe uses at that size, so the glyphs either side sit at the same
 * inset as the text.
 *
 * The `md` numbers are the ones `LookupField` uses. `sm` is the same field at
 * the height the claims toolbars share (CONTROL_HEIGHT, 36px).
 */
const SIZES = {
  md: { minH: "10", icon: 15, button: "sm", clear: 12 },
  sm: { minH: "9", icon: 14, button: "xs", clear: 11 },
} as const;

export interface SearchBarProps
  extends Omit<FlexProps, "onChange" | "children"> {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Announced to screen readers, since the field carries no visible label. */
  label?: string;
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>;
  /** `md` is the plan holder lookup's size; `sm` fits a toolbar row. */
  size?: keyof typeof SIZES;
  /**
   * What the magnifier does when clicked. Omit it and the magnifier is drawn
   * but inert.
   *
   * Only a search that has something to RUN should pass this. A field that
   * filters a list already on screen has nothing behind the icon — the list
   * narrowed as it was typed — and a button that visibly does nothing is worse
   * than no button. A search that goes somewhere, on the other hand, needs a
   * way to say "go" that is not the Enter key.
   */
  onSearch?: () => void;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search…",
  label = "Search",
  onKeyDown,
  onSearch,
  size = "md",
  ...rest
}: SearchBarProps) {
  const s = SIZES[size];
  const icon = <LuSearch size={s.icon} />;

  return (
    <Flex
      w="full"
      align="center"
      border="1px solid"
      borderColor="gray.200"
      borderRadius="lg"
      bg="white"
      // A floor rather than a height, as the original has it. It matches the
      // input's own height at this size, so the two agree instead of one
      // silently winning — see SIZES.
      minH={s.minH}
      overflow="hidden"
      // No transition on the border: hover and focus are answers to something
      // the hand just did, and easing them in makes the field feel slow to
      // respond to a click it has in fact already taken. It changes on the
      // frame the pointer or the caret arrives.
      _hover={{ borderColor: "gray.300" }}
      // The BORDER is the whole focus state — no ring around it. A 3px spread
      // of `primary-disabled` is a solid light green at that width, and against
      // the white it read as a second, filled box behind the field rather than
      // as a halo. The border going primary says the same thing without it.
      //
      // It belongs to the field and not to the input inside it: focus lands on
      // the input, but what the eye should see lit is the whole control.
      _focusWithin={{ borderColor: "var(--chakra-colors-primary)" }}
      {...rest}
    >
      <Input
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        // Carries the height and the horizontal padding for the whole field —
        // both come from the size recipe, so neither is restated here. Setting
        // `px` by hand is what made this a notch roomier than the original at
        // the smaller size: the recipe drops it from 3 to 2.5 and a literal 3
        // ignored that.
        size={size}
        flex={1}
        minW={0}
        // Stripped of every border and shadow it would otherwise draw, because
        // the box around it is drawing them. An input with its own chrome
        // inside a bordered row reads as two nested fields.
        border="none"
        bg="transparent"
        boxShadow="none"
        borderRadius="0"
        // A typed query is the state worth seeing at a glance; the placeholder
        // is not, so only the former is darkened and weighted.
        color={value ? "gray.800" : "gray.700"}
        fontWeight={value ? "medium" : "normal"}
        _placeholder={{ color: "gray.400" }}
        // Both, because the kit's input recipe hangs its own ring off
        // `_focusVisible` — leaving that one out puts a second ring inside the
        // field the moment it is reached from the keyboard.
        _focus={{ boxShadow: "none", outline: "none" }}
        _focusVisible={{ boxShadow: "none", outline: "none" }}
      />

      {value && (
        <IconButton
          aria-label="Clear search"
          variant="ghost"
          size="xs"
          borderRadius="full"
          color="gray.400"
          flexShrink={0}
          _hover={{ bg: "gray.100", color: "gray.600" }}
          onClick={() => onChange("")}
        >
          <LuX size={s.clear} />
        </IconButton>
      )}

      {onSearch ? (
        <IconButton
          aria-label="Search"
          onClick={onSearch}
          variant="ghost"
          size={s.button}
          borderRadius="md"
          mx={1}
          color="gray.400"
          flexShrink={0}
          _hover={{ bg: "gray.100", color: "gray.700" }}
          _active={{ bg: "gray.200" }}
        >
          {icon}
        </IconButton>
      ) : (
        // Same glyph in the same place, drawn rather than pressed. `mx` matches
        // the button's, so the icon sits at the same inset either way.
        <Box color="gray.400" flexShrink={0} mx={1} px={2} display="flex">
          {icon}
        </Box>
      )}
    </Flex>
  );
}

export default SearchBar;
