"use client";
import { Box, Flex, Show, useBreakpointValue } from "@chakra-ui/react";
import Sidebar from "./app-sidebar";
import AppHeader from "./app-header";
import { ReactNode, useEffect, useRef, useState } from "react";
import { Notifications } from "./data/notifications";
import {
  SideBarItemsBMSTL,
  SideBarItemsBranch,
  SideBarItemsEKolekta,
} from "./data/sidebar-items";
import { ColorModeProvider } from "../ui/color-mode";
import { AppBottomNavBar } from "./app-navbar/app-bottom-navbar";
import { StickyNavbarContext } from "./app-navbar/sticky-navbar-context";

export function AppLayout({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const isMobile = useBreakpointValue({ base: true, md: false });

  useEffect(() => {
    if (!isSidebarOpen && window.innerWidth >= 768) {
      setIsSidebarOpen(true);
    }
  }, []);

  return (
    <ColorModeProvider>
      {/* OUTER: sidebar + right area */}
      <Flex
        h="100vh"
        fontFamily="'Open Sans', sans-serif"
        bg={"white"}
        overflow="hidden"
      >
        {/* LEFT: Sidebar (full height) */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          navItems={SideBarItemsBranch}
          appName={"One St. Peter"}
        />

        {/* RIGHT: Navbar + content */}
        <Flex flex="1" direction="column" minW={0}>
          {/* Top Navbar */}
          <AppHeader
            onToggleSidebar={toggleSidebar}
            notifications={Notifications}
          />

          {/* Page content */}
          <Box flex="1" minW={0} bg="bg" p={4} overflow="auto" ref={scrollRef}>
            <StickyNavbarContext refParent={scrollRef}>
              {children}
              <Show when={isMobile}>
                <AppBottomNavBar
                  onToggleSidebar={toggleSidebar}
                  notifications={Notifications}
                />
              </Show>
            </StickyNavbarContext>
          </Box>
        </Flex>
      </Flex>
    </ColorModeProvider>
  );
}
