import { Box, Flex, Icon } from "@chakra-ui/react";
import { IconType } from "react-icons";

const ACTIVE_BG =
  "linear-gradient(160deg, rgba(255,255,255,0.38) 0%, rgba(255,255,255,0.10) 100%), var(--chakra-colors-primary-disabled)/50";
const ACTIVE_SHADOW =
  "inset 0 1.5px 0 rgba(255,255,255,0.80), inset 0 -0.5px 0 rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.10)";
const ACTIVE_BORDER = "rgba(255,255,255,0.55)";

export const StickyNavbarBtn = (params: {
  btnChildren?: IconType;
  activeIcon?: IconType;
  onClickEvent?: () => void;
  title?: string;
  isActive?: boolean;
}) => {
  const {
    onClickEvent,
    btnChildren,
    activeIcon,
    title,
    isActive = false,
  } = params;
  const DisplayIcon = isActive && activeIcon ? activeIcon : btnChildren;

  return (
    <Box
      as="button"
      onClick={onClickEvent}
      px="14px"
      py="9px"
      borderRadius="2xl"
      position="relative"
      border={isActive ? "1px solid" : "1px solid transparent"}
      borderColor={isActive ? ACTIVE_BORDER : "transparent"}
      color={isActive ? "var(--chakra-colors-primary)" : "gray.500"}
      cursor="pointer"
      outline="none"
      userSelect="none"
      style={{
        background: isActive ? ACTIVE_BG : "transparent",
        boxShadow: isActive ? ACTIVE_SHADOW : "none",
        backdropFilter: isActive ? "blur(12px) saturate(160%)" : "none",
        WebkitBackdropFilter: isActive ? "blur(12px) saturate(160%)" : "none",
        transition:
          "background 0.32s cubic-bezier(0.4,0,0.2,1), box-shadow 0.32s ease, border-color 0.32s ease, color 0.2s ease, transform 0.14s ease",
      }}
      _hover={{
        color: isActive ? "var(--chakra-colors-primary)" : "fg",
        bg: isActive ? undefined : "rgba(0,0,0,0.04)",
      }}
      _active={{ transform: "scale(0.88)" }}
      _dark={{
        color: isActive ? "var(--chakra-colors-primary)" : "gray.400",
        borderColor: isActive ? "rgba(255,255,255,0.14)" : "transparent",
      }}
    >
      <Flex direction="column" align="center" gap="5px">
        <Icon
          as={DisplayIcon}
          w="20px"
          h="20px"
          style={{
            filter: isActive
              ? "drop-shadow(0 1px 3px var(--chakra-colors-primary-disabled))"
              : "none",
            transition: "filter 0.3s ease",
          }}
        />
        <Box
          fontSize="7.5px"
          fontWeight={isActive ? "700" : "500"}
          letterSpacing="0.06em"
          textTransform="uppercase"
          lineHeight="1"
          maxW="50px"
          overflow="hidden"
          whiteSpace="nowrap"
          textOverflow="ellipsis"
          style={{
            opacity: isActive ? 1 : 0.6,
            transition: "opacity 0.2s ease",
          }}
        >
          {title}
        </Box>
      </Flex>
    </Box>
  );
};
