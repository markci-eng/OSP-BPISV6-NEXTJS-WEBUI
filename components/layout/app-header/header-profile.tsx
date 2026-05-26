"use client";

import { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  CloseButton,
  Dialog,
  Text,
  VStack,
} from "@chakra-ui/react";
import { PrimaryMdButton } from "st-peter-ui";
import { Tooltip } from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";

export function HeaderProfile() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <Box cursor="pointer" onClick={() => setOpen(true)}>
      <Tooltip
        ids={{ trigger: "1" }}
        content="Mark Cristian Ibe"
        contentProps={{ css: { bg: "white" } }}
      >
        <Avatar.Root size={"sm"} ids={{ root: "1" }}>
          <Avatar.Fallback name="Mark Cristian Ibe" />
        </Avatar.Root>
      </Tooltip>

      <Dialog.Root
        open={open}
        onOpenChange={(e) => setOpen(e.open)}
        size="md"
        placement="top"
      >
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title display="none" />
            </Dialog.Header>
            <Dialog.Body as={VStack} gap={8} py={8}>
              <Avatar.Root size="xl">
                <Avatar.Image src="/images/profile.jpg" alt="Profile" />
                <Avatar.Fallback />
              </Avatar.Root>

              <VStack gap={1}>
                <Text fontSize="lg" fontWeight="bold">
                  Yhuan Shin Tejima
                </Text>
                <Text fontSize="sm" color="gray.600">
                  SPLPI-01-123456789
                </Text>
              </VStack>

              <VStack gap={3} w="full" pt={4}>
                <PrimaryMdButton
                  w="full"
                  onClick={() => {
                    router.push("/profile");
                    setOpen(false);
                  }}
                >
                  Manage Account
                </PrimaryMdButton>
                <Button
                  w="full"
                  colorScheme="red"
                  variant="outline"
                  onClick={() => {}}
                >
                  Sign Out
                </Button>
              </VStack>
            </Dialog.Body>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="md" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </Box>
  );
}
