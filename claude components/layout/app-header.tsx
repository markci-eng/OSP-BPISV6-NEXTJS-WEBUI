"use client";

import React, { useEffect, useState } from "react";
import {
  Flex,
  IconButton,
  Box,
  Avatar,
  Text,
  useBreakpointValue,
  Show,
  Image,
} from "@chakra-ui/react";
import { LuMenu } from "react-icons/lu";
import { NotificationDataProps } from "./app-layout.type";
import { Body } from "st-peter-ui";
import { AppHeaderActions } from "./app-header-actions";
import Breadcrumb from "@/components/breadcrumb/Breadcrumb";

import logoIcon from "@/public/images/logo/icon.png";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2)
    return decodeURIComponent(parts.pop()!.split(";").shift() ?? "");
  return null;
}

function parseAvatarName(session: string | null): string {
  if (!session) return "";
  try {
    const json = session.split(".")[0];
    const padded = json.replace(/-/g, "+").replace(/_/g, "/");
    const padding = (4 - (padded.length % 4)) % 4;
    const decoded = atob(padded + "=".repeat(padding));
    const payload = JSON.parse(decoded) as { email?: string };
    const email = payload.email ?? "";
    const stored =
      typeof localStorage !== "undefined"
        ? localStorage.getItem("user-display-name")
        : null;
    return (
      stored ||
      (email.split("@")[0] ?? "")
        .replace(/[._-]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
        .trim()
    );
  } catch {
    return "";
  }
}

export default function AppHeader({
  onToggleSidebar,
  notifications,
  onOpenProfile,
  appName = "App",
  appSubtitle,
  breadcrumb,
}: {
  onToggleSidebar: () => void;
  notifications: NotificationDataProps[];
  onOpenProfile: () => void;
  appName?: string;
  appSubtitle?: string;
  breadcrumb?: React.ReactNode;
}) {
  const isMobileBreak = useBreakpointValue({ base: true, lg: false });
  const [isMounted, setIsMounted] = useState(false);
  const [avatarName, setAvatarName] = useState("");
  const isMobile = isMounted ? isMobileBreak : false;

  useEffect(() => {
    setIsMounted(true);
    setAvatarName(parseAvatarName(readCookie("osp_session")));
  }, []);

  const colorPalette = ["red", "blue", "green", "yellow", "purple", "orange"];

  const pickPalette = (name: string) => {
    const index = name.charCodeAt(0) % colorPalette.length;
    return colorPalette[index];
  };

  return (
    <Flex
      display={{ base: "none", lg: "flex" }}
      className="no-print"
      px={2}
      pt={2}
      align="center"
      justify="space-between"
      bg="bg"
      _dark={{ bg: "rgba(20, 24, 36, 0.88)" }}
      borderBottom="1px solid"
      borderColor="gray.200"
    >
      {/* Left side */}
      <Flex align="center" gap={2}>
        {/* Sidebar toggle */}
        <Show when={!isMobile}>
          <IconButton
            color={"gray.fg"}
            aria-label="Toggle sidebar"
            size="sm"
            variant="ghost"
            onClick={onToggleSidebar}
          >
            <LuMenu />
          </IconButton>
          {breadcrumb ?? <Breadcrumb />}
        </Show>
        <Show when={isMobile}>
          <Flex align="center" gap={2}>
            <IconButton
              color={"gray.fg"}
              aria-label="Toggle sidebar"
              size="sm"
              variant="ghost"
              onClick={onToggleSidebar}
            >
              <LuMenu />
            </IconButton>
            <Box
              w="24px"
              h="24px"
              display="flex"
              justifyContent="center"
              alignItems="center"
            >
              <Image
                src={logoIcon.src}
                width={24}
                height={24}
                style={{ objectFit: "contain" }}
              />
            </Box>
            <Box overflow="hidden" transition="width 0.2s">
              <Body
                fontWeight="bold"
                whiteSpace="nowrap"
                transition="opacity 0.2s"
                color="gray.800"
              >
                {appName}
              </Body>
              {appSubtitle && (
                // <Small mt={"-5px"} color={"primary"} fontStyle={"normal"}>
                //   {appSubtitle}
                // </Small>
                <Text
                  mt={"-5px"}
                  color="#003818"
                  fontStyle={"normal"}
                  fontSize="small"
                >
                  {appSubtitle}
                </Text>
              )}
            </Box>
          </Flex>
        </Show>
      </Flex>

      {/* Right side */}
      <Flex align="center">
        <AppHeaderActions />
        <Show when={!isMobile}>
          <Avatar.Root
            mx={2}
            size={"xs"}
            cursor="pointer"
            onClick={onOpenProfile}
            title="Account & Settings"
            colorPalette={pickPalette(avatarName || "U")}
            border={"2px solid"}
            borderColor={"primary"}
          >
            <Avatar.Image
              src="https://lh3.googleusercontent.com/a-/ALV-UjVMJSHCRae9AI71omM-12-JXe6RRORMkcfShnPQRn5izScdfxo=s240-p-k-rw-no"
              alt={avatarName || "U"}
            />
            <Avatar.Fallback name={avatarName || "U"} fontWeight="bold" />
          </Avatar.Root>
        </Show>
      </Flex>
    </Flex>
  );
}
