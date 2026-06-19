// Author: Jimwell Ocsio
"use client";

import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Text,
  VStack,
  type BoxProps,
} from "@chakra-ui/react";
import React from "react";
import Caption from "../../texts/Caption";
import BackButton from "./BackButton";
import { useRouter } from "next/navigation";
import { LuChevronLeft, LuMenu } from "react-icons/lu";
import { useSidebarToggle } from "../sidebar-context";

import { motion, type Transition } from "framer-motion";
import { cubicBezier } from "framer-motion";
import { User } from "lucide-react";

type PageScrollShellProps = {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  description?: React.ReactNode;
  toolContent?: React.ReactNode;
  mainContent?: React.ReactNode;
  boxProps?: BoxProps;
  headerButton?: "back" | "menu";
};

const MotionDiv = motion.div;

const pageVariants = {
  initial: { x: 16, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: -16, opacity: 0 },
};

const pageTransition: Transition = {
  type: "tween",
  ease: cubicBezier(0.22, 1, 0.36, 1),
  duration: 0.24,
};

const MobileBackBtn = () => {
  const router = useRouter();

  return (
    <Flex
      as="button"
      align="center"
      gap="2px"
      onClick={() => router.back()}
      cursor="pointer"
      color="green.600"
      _dark={{ color: "green.400" }}
      fontFamily="var(--font-dm-sans), system-ui, sans-serif"
      fontSize="14px"
      fontWeight="600"
      letterSpacing="0.01em"
      aria-label="Go back"
      flexShrink={0}
      px={1}
      py={1}
      mr={1}
      borderRadius="md"
      _hover={{ bg: "green.50" }}
      _active={{ transform: "scale(0.93)" }}
      transition="all 0.14s ease"
      userSelect="none"
    >
      <LuChevronLeft size={20} strokeWidth={2.5} />
    </Flex>
  );
};

const PageScrollShell = ({
  title,
  subtitle,
  description,
  toolContent,
  mainContent,
  boxProps,
  headerButton = "back",
}: PageScrollShellProps) => {
  const toggleSidebar = useSidebarToggle();

  return (
    <MotionDiv
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={pageTransition}
      style={{
        width: "100%",
        height: "100%",
        overflowY: "auto",
        overflowX: "hidden",
        scrollBehavior: "smooth",
        background: "var(--chakra-colors-bg)",
        paddingBottom: "96px",
      }}
    >
      <Box px={{ base: 0, lg: "44px" }} {...boxProps}>
        {/* ── MOBILE HEADER ── */}
        <Box display={{ base: "block", lg: "none" }}>
          <Box
            position="sticky"
            top={0}
            zIndex={10}
            px={2}
            pt="max(env(safe-area-inset-top, 0px), 12px)"
            pb={3}
            bg="bg/80"
            backdropFilter="blur(16px)"
            // WebkitBackdropFilter="blur(16px)"
            borderBottom="1px solid"
            borderColor="blackAlpha.200"
            _dark={{ borderColor: "whiteAlpha.200" }}
          >
            <Flex align="center" gap={2}>
              {headerButton === "back" && <MobileBackBtn />}
              {headerButton === "menu" && toggleSidebar && (
                <IconButton
                  aria-label="Open menu"
                  size="sm"
                  variant="ghost"
                  color="fg.muted"
                  borderRadius="full"
                  onClick={toggleSidebar}
                  _hover={{ bg: "blackAlpha.100" }}
                  _dark={{ _hover: { bg: "whiteAlpha.100" } }}
                >
                  <LuMenu size={20} />
                </IconButton>
              )}

              <Box flex="1" minW={0}>
                <Text
                  as="h1"
                  fontWeight="600"
                  fontSize="16.5px"
                  lineHeight="1.2"
                  color="fg"
                  overflow="hidden"
                  textOverflow="ellipsis"
                  whiteSpace="nowrap"
                  letterSpacing="-0.01em"
                >
                  {title}
                </Text>

                {description && (
                  <Text
                    fontSize="12.5px"
                    color="fg.muted"
                    mt="2px"
                    overflow="hidden"
                    textOverflow="ellipsis"
                    whiteSpace="nowrap"
                  >
                    {description}
                  </Text>
                )}
              </Box>

              {toolContent && <Box>{toolContent}</Box>}
            </Flex>
          </Box>
        </Box>

        {/* ── DESKTOP HEADER ── */}
        <Box display={{ base: "none", lg: "block" }}>
          <Box mx="-44px" px="66px" pt="36px" mb="0px">
            <Flex
              direction="row"
              align="center"
              justify="space-between"
              gap="32px"
              pb="24px"
            >
              <Box minW={0} flex="1">
                {headerButton === "back" && <BackButton />}

                {subtitle && (
                  <Box
                    fontFamily="var(--font-dm-sans), system-ui, sans-serif"
                    color="fg.muted"
                    fontSize="10px"
                    fontWeight={700}
                    lineHeight="1"
                    letterSpacing="0.06em"
                    textTransform="uppercase"
                    mb="2px"
                  >
                    {subtitle}
                  </Box>
                )}

                <Box
                  as="h1"
                  m="0"
                  fontFamily="var(--font-dm-sans), system-ui, sans-serif"
                  fontWeight={subtitle ? 600 : 500}
                  color="fg"
                  lineHeight="1"
                  letterSpacing={subtitle ? "-0.025em" : "-0.015em"}
                  fontSize={{ lg: subtitle ? "28px" : "32px" }}
                >
                  {title}
                </Box>

                {description && (
                  <Caption
                    fontFamily="var(--font-dm-sans), system-ui, sans-serif"
                    mt="6px"
                  >
                    {description}
                  </Caption>
                )}
              </Box>

              {toolContent}
            </Flex>
          </Box>
        </Box>

        {/* ── MAIN CONTENT ── */}
        <Box px={{ base: 4, lg: 0 }} pt={{ base: 3, lg: 0 }}>
          {mainContent}
        </Box>
      </Box>
    </MotionDiv>
  );
};

export default PageScrollShell;
