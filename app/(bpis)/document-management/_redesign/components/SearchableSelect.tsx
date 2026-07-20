"use client";

import * as React from "react";
import {
  Box,
  Flex,
  Input,
  InputGroup,
  Popover,
  Portal,
  Separator,
  Text,
  VStack,
  useBreakpointValue,
} from "@chakra-ui/react";
import { Check, ChevronDown, Search } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  QuickBottomSheet,
  type QuickBottomSheetOption,
} from "@/claude components/drawer/quick-bottom-sheet";

export type SearchableSelectOption = {
  value: string;
  label: string;
  /** Secondary line (e.g. employee id) — also matched by the search box. */
  description?: string;
  /** Small visual rendered at the start of the desktop row (avatar, dot, badge…). */
  leading?: React.ReactNode;
  /** Icon for the mobile bottom-sheet card. Falls back to the select's `mobileIcon`. */
  icon?: LucideIcon;
  iconBg?: string;
  iconColor?: string;
};

type Props = {
  label: string;
  value: string;
  options: SearchableSelectOption[];
  onChange: (value: string) => void;
  searchPlaceholder?: string;
  /** Shown as the mobile sheet's subtitle. */
  mobileSubtitle?: string;
  /** Default icon for mobile cards when an option has none (the sheet requires one). */
  mobileIcon: LucideIcon;
};

/**
 * The bottom sheet treats an empty-string value as "nothing selected" (its
 * Continue button is disabled). Our "All …" option legitimately uses "", so we
 * swap it for a sentinel on the way in and translate it back on confirm.
 */
const ALL_SENTINEL = "__all__";

/** Input-like trigger with an always-floated label — a value is always selected. */
const Trigger = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof Flex> & {
    open: boolean;
    label: string;
    current: SearchableSelectOption | undefined;
  }
>(function Trigger({ open, label, current, ...rest }, ref) {
  return (
    <Box pos="relative" w="full">
      <Flex
        ref={ref}
        as="button"
        w="full"
        h="10"
        align="center"
        justify="space-between"
        gap={2}
        px={3}
        textAlign="left"
        borderWidth="1px"
        borderColor={open ? "var(--chakra-colors-primary)" : "border"}
        borderRadius="md"
        bg="bg"
        cursor="pointer"
        transition="border-color .15s, box-shadow .15s"
        boxShadow={open ? "0 0 0 1px var(--chakra-colors-primary)" : undefined}
        _hover={{ borderColor: open ? "var(--chakra-colors-primary)" : "border.emphasized" }}
        {...rest}
      >
        <Flex align="center" gap={2} minW={0}>
          {current?.leading}
          <Text fontSize="sm" color={current?.value ? "fg" : "fg.muted"} truncate>
            {current?.label ?? ""}
          </Text>
        </Flex>
        <Box
          as="span"
          color="fg.muted"
          flexShrink={0}
          transition="transform .15s"
          transform={open ? "rotate(180deg)" : undefined}
        >
          <ChevronDown size={16} />
        </Box>
      </Flex>

      <Text
        as="span"
        pos="absolute"
        top="-2"
        insetStart="2"
        px="1"
        bg="bg"
        fontSize="xs"
        lineHeight="1"
        color="fg.muted"
        pointerEvents="none"
      >
        {label}
      </Text>
    </Box>
  );
});

function OptionRow({
  option,
  active,
  onSelect,
}: {
  option: SearchableSelectOption;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <Flex
      as="button"
      align="center"
      gap={2.5}
      w="full"
      textAlign="left"
      px={2.5}
      py={2}
      borderRadius="md"
      cursor="pointer"
      bg={active ? "var(--chakra-colors-primary-disabled)/50" : "transparent"}
      _hover={{ bg: active ? "var(--chakra-colors-primary-disabled)/50" : "bg.muted" }}
      onClick={onSelect}
    >
      {option.leading}
      <Box flex="1" minW={0}>
        <Text fontSize="sm" fontWeight={active ? "600" : "medium"} color="fg" truncate>
          {option.label}
        </Text>
        {option.description && (
          <Text fontSize="xs" color="fg.muted" truncate>
            {option.description}
          </Text>
        )}
      </Box>
      {active && (
        <Box as="span" color="var(--chakra-colors-primary)" flexShrink={0}>
          <Check size={15} />
        </Box>
      )}
    </Flex>
  );
}

export default function SearchableSelect({
  label,
  value,
  options,
  onChange,
  searchPlaceholder = "Search…",
  mobileSubtitle,
  mobileIcon,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  // Resolve the breakpoint before committing to a path; default to desktop so
  // the mobile sheet isn't mounted during the first (unresolved) render.
  const isMobile = useBreakpointValue({ base: true, md: false }) ?? false;

  const display = options.find((o) => o.value === value) ?? options[0];

  const q = query.trim().toLowerCase();
  const filtered = q
    ? options.filter(
        (o) =>
          o.label.toLowerCase().includes(q) ||
          (o.description?.toLowerCase().includes(q) ?? false),
      )
    : options;

  // Clear the search box whenever the dropdown closes.
  React.useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const choose = (v: string) => {
    onChange(v);
    setOpen(false);
  };

  /* ------------------------------- Mobile -------------------------------- */
  if (isMobile) {
    const sheetOptions: QuickBottomSheetOption[] = options.map((o) => ({
      value: o.value === "" ? ALL_SENTINEL : o.value,
      label: o.label,
      description: o.description,
      icon: o.icon ?? mobileIcon,
      iconBg: o.iconBg,
      iconColor: o.iconColor,
    }));

    return (
      <>
        <Trigger open={open} label={label} current={display} onClick={() => setOpen(true)} />
        <QuickBottomSheet
          open={open}
          onOpenChange={setOpen}
          title={label}
          subtitle={mobileSubtitle}
          options={sheetOptions}
          defaultValue={value === "" ? ALL_SENTINEL : value}
          onConfirm={(v) => onChange(v === ALL_SENTINEL ? "" : v)}
        />
      </>
    );
  }

  /* ------------------------------- Desktop ------------------------------- */
  return (
    <Popover.Root
      open={open}
      onOpenChange={(e) => setOpen(e.open)}
      positioning={{ sameWidth: true, offset: { mainAxis: 6, crossAxis: 0 } }}
    >
      <Popover.Trigger asChild>
        <Trigger open={open} label={label} current={display} />
      </Popover.Trigger>

      <Portal>
        <Popover.Positioner>
          <Popover.Content borderRadius="lg" overflow="hidden" boxShadow="lg">
            <Popover.Body p={2}>
              <InputGroup startElement={<Search size={15} />}>
                <Input
                  autoFocus
                  size="sm"
                  borderRadius="md"
                  placeholder={searchPlaceholder}
                  value={query}
                  onChange={(e) => setQuery(e.currentTarget.value)}
                />
              </InputGroup>

              <Separator my={2} />

              <Box maxH="264px" overflowY="auto">
                <VStack gap={0.5} align="stretch">
                  {filtered.length === 0 ? (
                    <Text fontSize="sm" color="fg.muted" textAlign="center" py={5}>
                      No matches
                    </Text>
                  ) : (
                    filtered.map((o) => (
                      <OptionRow
                        key={o.value}
                        option={o}
                        active={o.value === value}
                        onSelect={() => choose(o.value)}
                      />
                    ))
                  )}
                </VStack>
              </Box>
            </Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
}
