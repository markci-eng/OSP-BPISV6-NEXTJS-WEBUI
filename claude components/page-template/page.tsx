"use client";
import { Box, Flex } from "@chakra-ui/react";
import ActionButtons, { ActionButtonItem } from "./ActionButtons";
import { LuActivity, LuChevronLeft, LuPlus } from "react-icons/lu";
import Header from "./PageHeader";

export function PageHeader({
  title,
  subtitle,
  actionButtonDefs,
}: {
  title: string;
  subtitle?: string;
  actionButtonDefs: ActionButtonItem[];
}) {
  //   const actionButtonDefs = [
  //     {
  //       label: "New Request",
  //       href: `/request/new`,
  //       icon: LuPlus, // Clock for time logging
  //     },
  //     {
  //       label: "Tracker",
  //       href: `/Transaction`,
  //       icon: LuActivity, // Clock for time logging
  //     },
  //   ];

  return (
    <Flex justify="space-between" align="flex-start" flexWrap="wrap" gap={2}>
      {/* Left side: PageHeader */}
      <Flex justify={"start"} gap={1}>
        <Box
          display={{ base: "block", lg: "none" }}
          flexShrink={0}
          overflow="hidden"
          borderRadius="full"
          w={"30px"}
          h="30px"
          mr={"8px"}
          pointerEvents={"auto"}
          bg="rgba(255, 255, 255, 0.65)"
          backdropFilter="blur(28px) saturate(200%)"
          border="1px solid rgba(255, 255, 255, 0.52)"
          boxShadow="0 4px 16px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06), inset 0 1.5px 0 rgba(255,255,255,0.85), inset 0 -0.5px 0 rgba(0,0,0,0.04)"
          _hover={{ bg: "rgba(255, 255, 255, 0.88)" }}
        >
          {/* Inner: icon + entrance animation + press feedback */}
          <Box
            as="button"
            w="30px"
            h="30px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            cursor="pointer"
            aria-label="Go back"
            _active={{ bg: "rgba(0,0,0,0.06)" }}
          >
            <LuChevronLeft
              size={16}
              color="var(--chakra-colors-primary)"
              strokeWidth={2.5}
            />
          </Box>
        </Box>
        <Box flex="1" minW="200px">
          <Header title={title} subtitle={subtitle} />
        </Box>
      </Flex>

      {/* Desktop & Mobile Actions */}
      <ActionButtons buttons={actionButtonDefs} />
    </Flex>
  );
}
