"use client";

// The claims area's search field — one component, so every search in the area
// matches the plan holder lookup in accounts-management, which is the design
// this copies.
//
// It is `LookupField`'s own trigger field in `osp-ui-kit`, to the number rather
// than to the eye: the border, the radius, the 40px floor, the padding, the
// type size, the hover, and both glyphs are that component's values. That
// matters more than it sounds — the plan holder search in the claims rail IS a
// `LookupField`, and the two stand a column apart.
//
// It is not reused directly because `LookupField` is a modal picker over a
// fixed dataset — it owns its results, its table and its pagination — where
// these searches filter a list the caller already has, which has no modal and
// nothing to pick. Same field, different job.
//
// The one place the two part is the FOCUS state: `LookupField` lights a 3px
// `primary-disabled` ring and eases its border over 150ms, and neither is drawn
// here. At that width the ring is a solid band of light green rather than a
// halo, and it read as a second, filled box behind the field. The border going
// primary, on the frame the caret lands, says the same thing. The lookup in the
// rail has the same two taken off it by its caller, so they still agree.
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
 * `md` is `LookupField` to the number — its height, its padding, its type size
 * and both of its glyphs — because the two fields stand in the same area and
 * one of them being a notch larger or a shade heavier reads as two different
 * controls. `sm` is the same field at the height the claims toolbars share
 * (CONTROL_HEIGHT, 36px), scaled by the recipe's own steps.
 *
 * `fontSize` is named here rather than left to the input's size recipe, which
 * is where the two used to part: the recipe's `md` is 16px and `LookupField`
 * asks for `sm` explicitly, so ours came out a size larger beside it.
 */
const SIZES = {
  md: { minH: "10", px: 3, fontSize: "sm", icon: 15, button: "sm", clear: 12 },
  sm: {
    minH: "9",
    px: 2.5,
    fontSize: "sm",
    icon: 14,
    button: "xs",
    clear: 11,
  },
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
        // The recipe is kept for the HEIGHT — `--input-height` is what the box
        // opens to fit — and overruled on the two things `LookupField` states
        // for itself. See SIZES.
        size={size}
        px={s.px}
        fontSize={s.fontSize}
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
