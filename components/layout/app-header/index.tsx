"use client";

import { Flex, IconButton, Show } from "@chakra-ui/react";
import { LuMenu } from "react-icons/lu";
import { ColorModeButton } from "@/components/ui/color-mode";
import { NotificationDataProps } from "../app-layout.type";
import { HeaderLogo } from "./header-logo";
import { HeaderSearch } from "./header-search";
import { HeaderNotifications } from "./header-notifications";
import { HeaderProfile } from "./header-profile";
import { useEffect, useState } from "react";

export default function AppHeader({
  onToggleSidebar,
  notifications,
}: {
  onToggleSidebar: () => void;
  notifications: NotificationDataProps[];
}) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1047px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <Flex
      className="no-print"
      h="58px"
      px={4}
      align="center"
      justify="space-between"
      bg="bg"
      borderBottom="1px solid"
      borderColor="gray.200"
      fontFamily="'Open Sans', sans-serif"
    >
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
        <Show when={isMobile}>
          <HeaderLogo />
        </Show>
      </Flex>

      <Flex align="center" gap={2}>
        <HeaderSearch />
        <ColorModeButton color={"gray.fg"} _hover={{ color: "primary" }} />
        <HeaderNotifications notifications={notifications} />
        <HeaderProfile />
      </Flex>
    </Flex>
  );
}
