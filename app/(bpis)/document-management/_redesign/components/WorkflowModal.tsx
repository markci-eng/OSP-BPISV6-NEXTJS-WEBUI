"use client";

import * as React from "react";
import {
  Box,
  CloseButton,
  Dialog,
  Flex,
  HStack,
  Portal,
  Text,
} from "@chakra-ui/react";
import { Check } from "lucide-react";

type WorkflowModalProps = {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  headExtra?: React.ReactNode;
  footer?: React.ReactNode;
  /** Desktop max width of the dialog content. */
  maxW?: string;
  children: React.ReactNode;
};

export function WorkflowModal({
  open,
  onClose,
  title,
  subtitle,
  headExtra,
  footer,
  maxW = "640px",
  children,
}: WorkflowModalProps) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(e) => {
        if (!e.open) onClose();
      }}
      size={{ base: "full", md: "xl" }}
      placement="center"
      scrollBehavior="inside"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner p={{ base: 0, md: 4 }}>
          <Dialog.Content
            borderRadius={{ base: "0", md: "2xl" }}
            overflow="hidden"
            maxW={{ base: "100%", md: maxW }}
          >
            <Box
              px={{ base: 5, md: 6 }}
              pt={5}
              pb={4}
              borderBottomWidth="1px"
              borderColor="border.muted"
            >
              <HStack align="flex-start" justify="space-between" gap={3}>
                <Box>
                  <Dialog.Title
                    fontSize="lg"
                    fontWeight="700"
                    letterSpacing="-0.01em"
                  >
                    {title}
                  </Dialog.Title>
                  {subtitle && (
                    <Text fontSize="sm" color="fg.muted" mt={0.5}>
                      {subtitle}
                    </Text>
                  )}
                </Box>
                <Dialog.CloseTrigger asChild>
                  <CloseButton size="sm" />
                </Dialog.CloseTrigger>
              </HStack>
              {headExtra}
            </Box>

            <Dialog.Body px={{ base: 5, md: 6 }} py={0}>
              {children}
            </Dialog.Body>

            {footer && (
              <Flex
                px={{ base: 5, md: 6 }}
                py={3.5}
                gap={3}
                align="center"
                borderTopWidth="1px"
                borderColor="border.muted"
                bg="bg.subtle"
              >
                {footer}
              </Flex>
            )}
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

export function Stepper({
  labels,
  current,
}: {
  labels: string[];
  current: number;
}) {
  return (
    <HStack mt={4} overflowX="auto" pb={0.5} gap={0}>
      {labels.map((label, i) => {
        const n = i + 1;
        const done = n < current;
        const on = n === current;
        return (
          <React.Fragment key={label}>
            <HStack gap={2} flexShrink={0}>
              <Box
                w="26px"
                h="26px"
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontSize="xs"
                fontWeight="700"
                flexShrink={0}
                bg={
                  done
                    ? "colorPalette.solid"
                    : on
                      ? "colorPalette.subtle"
                      : "bg.muted"
                }
                color={
                  done
                    ? "colorPalette.contrast"
                    : on
                      ? "colorPalette.fg"
                      : "fg.muted"
                }
                borderWidth="2px"
                borderColor={on ? "colorPalette.solid" : "transparent"}
                transition="all .2s"
              >
                {done ? <Check size={14} /> : n}
              </Box>
              <Text
                fontSize="xs"
                fontWeight={on || done ? "600" : "medium"}
                color={on ? "fg" : done ? "fg.muted" : "fg.subtle"}
                whiteSpace="nowrap"
              >
                {label}
              </Text>
            </HStack>
            {i < labels.length - 1 && (
              <Box
                w="26px"
                h="2px"
                mx={2.5}
                flexShrink={0}
                bg={done ? "colorPalette.solid" : "border.muted"}
                transition="background .3s"
              />
            )}
          </React.Fragment>
        );
      })}
    </HStack>
  );
}
