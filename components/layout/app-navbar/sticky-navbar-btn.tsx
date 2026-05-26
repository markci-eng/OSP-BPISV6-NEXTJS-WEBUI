import { Box, Flex, Icon } from "@chakra-ui/react";
import React from "react";
import { IconType } from "react-icons";

export const StickyNavbarBtn = (params: {
  btnChildren?: IconType;
  activeIcon?: IconType;
  onClickEvent?: () => void;
  title?: string;
  isActive?: boolean;
}) => {
  const { onClickEvent, btnChildren, activeIcon, title, isActive = false } = params;
  const DisplayIcon = isActive && activeIcon ? activeIcon : btnChildren;

  return (
    <Box
      as="button"
      onClick={onClickEvent}
      px="14px"
      py="10px"
      borderRadius="2xl"
      bg={isActive ? "primary-disabled" : "transparent"}
      color={isActive ? "primary" : "gray.500"}
      transition="background 0.2s ease, color 0.2s ease, transform 0.12s ease"
      _hover={{
        bg: isActive ? "primary-disabled" : "bg.muted",
        color: isActive ? "primary" : "fg",
      }}
      _active={{ transform: "scale(0.90)" }}
      cursor="pointer"
      border="none"
      outline="none"
      userSelect="none"
    >
      <Flex direction="column" align="center" gap="5px">
        <Icon as={DisplayIcon} w="20px" h="20px" />
        <Box
          fontSize="9px"
          fontWeight={isActive ? "700" : "500"}
          letterSpacing="0.06em"
          textTransform="uppercase"
          lineHeight="1"
        >
          {title}
        </Box>
      </Flex>
    </Box>
  );
};