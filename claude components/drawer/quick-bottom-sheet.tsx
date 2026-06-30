"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Dialog,
  Drawer,
  Flex,
  Portal,
  Separator,
  Text,
  VStack,
  useBreakpointValue,
} from "@chakra-ui/react";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

export type QuickBottomSheetOption = {
  value: string;
  label: string;
  description?: string;
  icon: LucideIcon;
  iconBg?: string;
  iconColor?: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  options: QuickBottomSheetOption[];
  onConfirm: (value: string) => void;
  continueLabel?: string;
  defaultValue?: string;
};

const MotionBox = motion(Box);

function OptionList({
  options,
  selected,
  onSelect,
}: {
  options: QuickBottomSheetOption[];
  selected: string | null;
  onSelect: (value: string) => void;
}) {
  return (
    <VStack gap={3} align="stretch">
      {options.map((opt) => {
        const active = selected === opt.value;
        const Icon = opt.icon;
        return (
          <Box
            as="button"
            key={opt.value}
            textAlign="left"
            w="full"
            bg="white"
            borderWidth="1.5px"
            borderColor={active ? "var(--chakra-colors-primary)" : "gray.200"}
            borderRadius="xl"
            px={4}
            py={4}
            cursor="pointer"
            transition="all 0.14s"
            boxShadow={active ? "0 0 0 3px var(--chakra-colors-primary-disabled)" : "xs"}
            _hover={active ? undefined : { borderColor: "green.300", bg: "green.50" }}
            onClick={() => onSelect(opt.value)}
          >
            <Flex align="center" gap={3}>
              <Box
                p={2.5}
                borderRadius="xl"
                bg={opt.iconBg ?? "green.50"}
                color={opt.iconColor ?? "var(--chakra-colors-primary)"}
                flexShrink={0}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Icon size={20} />
              </Box>

              <Box flex={1} minW={0}>
                <Text fontWeight="semibold" fontSize="sm" color="gray.800">
                  {opt.label}
                </Text>
                {opt.description && (
                  <Text fontSize="xs" color="gray.500" mt={0.5}>
                    {opt.description}
                  </Text>
                )}
              </Box>

              <Box
                w="20px"
                h="20px"
                borderRadius="full"
                borderWidth="1.5px"
                borderColor={active ? "var(--chakra-colors-primary)" : "gray.300"}
                bg={active ? "var(--chakra-colors-primary)" : "white"}
                flexShrink={0}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                {active && <Box w="8px" h="8px" borderRadius="full" bg="white" />}
              </Box>
            </Flex>
          </Box>
        );
      })}
    </VStack>
  );
}

function ContinueButton({
  selected,
  label,
  onClick,
}: {
  selected: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <Box
      as="button"
      w="full"
      py={3}
      borderRadius="xl"
      bg={selected ? "var(--chakra-colors-primary)" : "gray.200"}
      color={selected ? "white" : "gray.400"}
      fontWeight="semibold"
      fontSize="sm"
      cursor={selected ? "pointer" : "not-allowed"}
      transition="all 0.14s"
      display="flex"
      alignItems="center"
      justifyContent="center"
      gap={1}
      onClick={onClick}
      _hover={selected ? { opacity: 0.9 } : undefined}
      _active={selected ? { transform: "scale(0.98)" } : undefined}
    >
      {label}
      <ChevronRight size={16} />
    </Box>
  );
}

export function QuickBottomSheet({
  open,
  onOpenChange,
  title,
  subtitle,
  options,
  onConfirm,
  continueLabel = "Continue",
  defaultValue,
}: Props) {
  const [selected, setSelected] = useState<string | null>(defaultValue ?? null);
  const [hasMounted, setHasMounted] = useState(false);
  const isDesktop = useBreakpointValue({ base: false, md: true }) ?? false;

  // Defer rendering until the breakpoint is resolved on the client. Otherwise
  // the first render mounts the mobile Drawer and the second swaps in the
  // desktop Dialog — that mount/unmount race corrupts zag-js's modal
  // pointer-events bookkeeping and freezes the page after closing on web.
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Safety net: Chakra v3 (zag-js) can leave `pointer-events: none` + the
  // `data-inert` attribute stuck on <body> after a modal closes, which makes
  // the whole page unresponsive. When this sheet is closed and no other modal
  // is open, restore interactivity.
  useEffect(() => {
    if (open) return;
    const t = window.setTimeout(() => {
      const anyModalOpen = document.querySelector(
        '[role="dialog"][data-state="open"], [role="alertdialog"][data-state="open"]',
      );
      if (!anyModalOpen) {
        document.body.style.pointerEvents = "";
        document.body.removeAttribute("data-inert");
      }
    }, 50);
    return () => window.clearTimeout(t);
  }, [open]);

  const handleConfirm = () => {
    if (!selected) return;
    onConfirm(selected);
    onOpenChange(false);
  };

  if (!hasMounted) return null;

  if (isDesktop) {
    return (
      <Dialog.Root
        open={open}
        onOpenChange={(e) => onOpenChange(e.open)}
        placement="center"
        closeOnEscape={false}
        closeOnInteractOutside={false}
      >
        <Portal>
          <Dialog.Backdrop bg="blackAlpha.500" backdropFilter="blur(4px)" />
          <Dialog.Positioner>
            <Dialog.Content
              bg="#f2f4f3"
              borderRadius="2xl"
              w="sm"
              maxW="90vw"
              shadow="2xl"
              overflow="hidden"
            >
              <Dialog.Body px={5} pt={6} pb={2}>
                <Text fontSize="xl" fontWeight="bold" lineHeight="1.25" color="gray.900" mb={1}>
                  {title}
                </Text>
                {subtitle && (
                  <Text fontSize="sm" color="gray.500" mb={4}>
                    {subtitle}
                  </Text>
                )}
                <OptionList options={options} selected={selected} onSelect={setSelected} />
              </Dialog.Body>

              <Separator opacity={0.2} mt={3} />

              <Dialog.Footer px={5} py={4}>
                <ContinueButton
                  selected={!!selected}
                  label={continueLabel}
                  onClick={handleConfirm}
                />
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    );
  }

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(e) => onOpenChange(e.open)}
      placement="bottom"
      closeOnEscape={false}
      closeOnInteractOutside={false}
    >
      <Portal>
        <Drawer.Backdrop bg="blackAlpha.400" backdropFilter="blur(4px)" />
        <Drawer.Positioner>
          <Drawer.Content asChild bg="transparent" shadow="none">
            <MotionBox
              initial={{ y: 500, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 500, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
              style={{
                position: "relative",
                background: "#f2f4f3",
                borderTopLeftRadius: "24px",
                borderTopRightRadius: "24px",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box pt={3} pb={1} display="flex" justifyContent="center">
                <Box w="36px" h="4px" bg="gray.300" borderRadius="full" opacity={0.6} />
              </Box>

              <Box px={5} pt={4} pb={3}>
                <Text fontSize="xl" fontWeight="bold" lineHeight="1.25" color="gray.900">
                  {title}
                </Text>
                {subtitle && (
                  <Text fontSize="sm" color="gray.500" mt={1}>
                    {subtitle}
                  </Text>
                )}
              </Box>

              <Drawer.Body px={4} pb={2} pt={0}>
                <OptionList options={options} selected={selected} onSelect={setSelected} />
              </Drawer.Body>

              <Separator opacity={0.2} />

              <Box px={4} py={4}>
                <ContinueButton
                  selected={!!selected}
                  label={continueLabel}
                  onClick={handleConfirm}
                />
              </Box>
            </MotionBox>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}

export default QuickBottomSheet;
