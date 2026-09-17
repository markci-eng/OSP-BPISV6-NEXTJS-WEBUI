"use client";
import { Box, Flex, IconButton, Text } from "@chakra-ui/react";
import { AppHeaderActions, useSidebarToggle } from "osp-ui-kit";
import { LuMenu } from "react-icons/lu";

/* ── MOBILE HOME HEADER (login-page style, scrolls with content) ── */
export const DashboardHeaderMobile = () => {
  const toggleSidebar = useSidebarToggle();

  return (
    <Box
      display={{ base: "block", lg: "none" }}
      mx={-2}
      px={4}
      py={1}
      bg="white"
      borderBottom="1px solid"
      borderColor="gray.100"
      style={{
        paddingTop: "max(env(safe-area-inset-top, 0px), 12px)",
      }}
    >
      <Flex align="center" justify="space-between" gap={2}>
        {/* LEFT SIDE */}
        <Flex align="center" gap={2}>
          {toggleSidebar && (
            <IconButton
              aria-label="Open menu"
              size="sm"
              variant="ghost"
              color="gray.700"
              _hover={{ bg: "gray.100" }}
              onClick={toggleSidebar}
            >
              <LuMenu size={20} />
            </IconButton>
          )}

          <Box
            w="40px"
            h="40px"
            borderRadius="12px"
            bg="green.50"
            borderWidth="1px"
            borderColor="green.100"
            display="flex"
            alignItems="center"
            justifyContent="center"
            boxShadow="sm"
            flexShrink={0}
          >
            <img
              src="/images/logo/icon.png"
              alt="St. Peter Logo"
              width={26}
              height={26}
              style={{ objectFit: "contain" }}
            />
          </Box>

          <Box>
            <Text
              fontWeight="700"
              fontSize="md"
              color="gray.800"
              lineHeight="1.2"
              letterSpacing="-0.01em"
            >
              One St. Peter
            </Text>

            <Text
              fontSize="9px"
              color="#085725"
              letterSpacing="0.18em"
              textTransform="uppercase"
              fontWeight="600"
            >
              Life Plan Operations
            </Text>
          </Box>
        </Flex>

        {/* RIGHT SIDE */}
        <Flex align="center" flexShrink={0}>
          <AppHeaderActions iconColor="#065f46" />
        </Flex>
      </Flex>
    </Box>
  );
};
