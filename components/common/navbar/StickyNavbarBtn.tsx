import { Button, Drawer, DrawerContent, Flex, Portal, Text } from "@chakra-ui/react";
import React, { ReactNode, useState } from "react";
import { LuArrowLeft } from "react-icons/lu";
import { PrimaryMdButton, SecondaryMdButton } from "st-peter-ui";

const StickyNavbarBtn = (params: {
  children?: ReactNode | null;
  btnChildren?: ReactNode | null;
  onClickEvent?: () => void | null;
  title?: string | null;
}) => {
  const { children, onClickEvent, btnChildren, title } = params;
  const [open, setOpen] = useState(false);
  return (
    <Drawer.Root size="full" open={open} onOpenChange={(e) => setOpen(e.open)}>
      <Drawer.Trigger asChild>
        <Button
          bg="none"
          color="gray.500"
          fontWeight="600"
          letterSpacing={-0.5}
          fontSize="11px"
          flex="1"
          py={6}
          _open={{
            bg: "gray.50",
          }}
          transition="backgrounds 100ms ease"
          borderRadius="none"
        >
          <Flex direction="column" align={"center"}>
            {btnChildren}
          {title}
          </Flex>
        </Button>
      </Drawer.Trigger>
      <Portal>
        <Drawer.Positioner>
          <DrawerContent>
            <Drawer.Header
              paddingBottom={0}
              paddingTop={2}
              transform="translateX(-15px)"
            >
              <Drawer.CloseTrigger asChild>
                <Button
                  paddingX={1}
                  bg="none"
                  color="gray.500"
                  position="initial"
                >
                  <LuArrowLeft />
                </Button>
              </Drawer.CloseTrigger>
              <Text
                fontSize="16px"
                fontWeight="bold"
                letterSpacing={-0.2}
                color="gray.500"
              >
                {title}
              </Text>
            </Drawer.Header>
            <Drawer.Body borderTopWidth={1} borderTopColor="gray.200">
              {children}
            </Drawer.Body>
            <Drawer.Footer>
              <Drawer.ActionTrigger asChild>
                <SecondaryMdButton>Cancel</SecondaryMdButton>
              </Drawer.ActionTrigger>

              <PrimaryMdButton
                onClick={() => {
                  onClickEvent?.();
                  setOpen(false);
                }}
              >
                Save
              </PrimaryMdButton>
            </Drawer.Footer>
          </DrawerContent>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
};

export default StickyNavbarBtn;
