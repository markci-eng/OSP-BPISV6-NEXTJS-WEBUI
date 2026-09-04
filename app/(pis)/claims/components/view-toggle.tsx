"use client";

// Cards or table — how the list below is drawn.
//
// A pair of icons rather than a labelled control: there are two of them, they
// sit at the end of a row that already carries other controls, and what each one
// does is the thing it draws. The label is on the `aria-label`, where a screen
// reader needs it and the eye does not.
//
// Deliberately NOT the pill row's construction (`DeathClaimsFilter`), which it
// would otherwise resemble: those pills change WHICH ROWS are listed, and this
// changes only how the same rows look. Keeping the two visually distinct is what
// stops a toolbar reading as five filters in a row.
//
// Shared across the claims area rather than owned by the death queue, which is
// where it started. Every list here is drawn one of these two ways, and the two
// dashboards offering the same choice through the same control — in the same
// place, at the same size — is the whole point of it being one component.

import type { IconType } from "react-icons";
import { Box, Flex } from "@chakra-ui/react";
import { LuLayoutGrid, LuTable2 } from "react-icons/lu";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { CONTROL_HEIGHT } from "./control-height";

/** How the rows in a list are laid out. */
export type ClaimsView = "cards" | "table";

interface ViewOption {
  value: ClaimsView;
  /** Announced by assistive tech, and the button's tooltip. */
  label: string;
  Icon: IconType;
}

const VIEWS: ViewOption[] = [
  { value: "cards", label: "Card view", Icon: LuLayoutGrid },
  { value: "table", label: "Table view", Icon: LuTable2 },
];

interface ClaimsViewToggleProps {
  value: ClaimsView;
  onChange: (value: ClaimsView) => void;
  /** Describes the pair to assistive tech, e.g. "Territory list view". */
  label?: string;
}

/**
 * Segmented pair of icon buttons, sized to sit level with the toolbar's other
 * controls.
 *
 * The track is the control; the selected half is a raised white tile inside it.
 * That is the other way round from the filter pills, where the selected pill is
 * the one that gains a ring — and it is the right way round here, because a view
 * switch has no "unset" state to fall back to. One of the two is always on.
 */
export function ClaimsViewToggle({
  value,
  onChange,
  label = "Claim list view",
}: ClaimsViewToggleProps) {
  return (
    <Flex
      role="group"
      aria-label={label}
      h={CONTROL_HEIGHT}
      p="3px"
      gap="3px"
      flexShrink={0}
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="lg"
      bg="gray.50"
    >
      {VIEWS.map(({ value: view, label, Icon }) => {
        const active = view === value;

        return (
          <Box
            key={view}
            // A real button, so Enter and Space work without this having to
            // re-implement them the way the pill row does.
            as="button"
            aria-label={label}
            aria-pressed={active}
            title={label}
            onClick={() => onChange(view)}
            display="flex"
            alignItems="center"
            justifyContent="center"
            w="34px"
            borderRadius="md"
            cursor="pointer"
            transition="all 0.15s ease"
            bg={active ? "white" : "transparent"}
            color={active ? BRAND_COLORS.primaryGreen : "gray.500"}
            boxShadow={active ? "xs" : "none"}
            _hover={{ color: active ? undefined : "gray.700" }}
          >
            <Icon size={16} />
          </Box>
        );
      })}
    </Flex>
  );
}

export default ClaimsViewToggle;
