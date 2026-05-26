import { Box, Button, Drawer, DrawerContent, Flex, Icon, Portal, Text } from "@chakra-ui/react";
import React, { ReactNode, useState } from "react";
import { IconType } from "react-icons";
import { LuArrowLeft } from "react-icons/lu";
import { PrimaryMdButton, SecondaryMdButton } from "st-peter-ui";

export const StickyNavbarBtn = (params: {
  children?: ReactNode | null;
  btnChildren?: IconType;
  onClickEvent?: () => void | null;
  title?: string | null;
}) => {
  const { onClickEvent, btnChildren, title } = params;

  return (
    <Box
          bg="none"
          color="gray.500"
          fontWeight="600"
          letterSpacing={-0.5}
          fontSize="11px"
          flex="1"
          py={2}
          onClick={onClickEvent}
          _open={{
            bg: "gray.50",
          }}
          transition="backgrounds 100ms ease"
          borderRadius="none"
        >
          <Flex direction="column" align={"center"}>
            <Icon as={btnChildren} size={"lg"}/>
            {title}
          </Flex>
        </Box>
  );
};