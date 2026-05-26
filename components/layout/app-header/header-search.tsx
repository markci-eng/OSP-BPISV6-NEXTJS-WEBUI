"use client";

import {
  Box,
  Dialog,
  IconButton,
  Input,
  InputGroup,
  Portal,
  Text,
} from "@chakra-ui/react";
import { LuSearch } from "react-icons/lu";

export function HeaderSearch() {
  return (
    <Dialog.Root
      size={{ base: "full", md: "lg" }}
      motionPreset="slide-in-bottom"
    >
      <Dialog.Trigger asChild>
        <IconButton
          color={"gray.fg"}
          display={{ base: "flex" }}
          aria-label="Search"
          size="sm"
          variant="ghost"
        >
          <LuSearch />
        </IconButton>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <InputGroup
                flex="1"
                startElement={<LuSearch />}
                endElement={
                  <Dialog.CloseTrigger>
                    <Box
                      py={1}
                      px={2}
                      bg={"gray.100"}
                      borderRadius={"md"}
                      cursor={"pointer"}
                      _hover={{ bg: "gray.200" }}
                    >
                      Cancel
                    </Box>
                  </Dialog.CloseTrigger>
                }
              >
                <Input placeholder="Search . . ." />
              </InputGroup>
            </Dialog.Header>
            <Dialog.Body>
              <Text textAlign={"center"} py={5}>
                No recent searches
              </Text>
            </Dialog.Body>
            <Dialog.Footer />
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
