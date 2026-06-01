"use client";
import { Box, Flex } from "@chakra-ui/react";
import Sidebar from "./app-sidebar";
import AppHeader from "./app-header";
import { ReactNode, useEffect, useRef, useState } from "react";
import { Notifications } from "./data/notifications";
import {
  SideBarItemsBMSTL,
  SideBarItemsBranch,
  SideBarItemsEKolekta,
} from "./data/sidebar-items";
import { StickyNavbarContext } from "../common/navbar/StickyNavbarContext";
import { AppBottomNavBar } from "./app-navbar/app-bottom-navbar";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop()!.split(";").shift() ?? "");
  return null;
}

export function AppLayout({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isSidebarOpen && window.innerWidth >= 992) {
      setIsSidebarOpen(true);
    }
    setUserRole(readCookie("osp_user"));
    const fontSizeMap: Record<string, string> = { sm: "14px", md: "16px", lg: "18px" };
    const fontPref = localStorage.getItem("font-size-pref") ?? "md";
    document.documentElement.style.fontSize = fontSizeMap[fontPref] ?? "16px";
  }, []);

  const navItems =
    userRole === "branch"
      ? SideBarItemsBranch
      : userRole === "bmstl"
        ? SideBarItemsBMSTL
        : SideBarItemsEKolekta;

  return (
    /* OUTER: sidebar + right area */
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
        navItems={navItems}
        appName={"One St. Peter"}
      />

      {/* RIGHT: Navbar + content */}
      <Flex flex="1" direction="column" minW={0}>
        {/* Top Navbar */}
        <AppHeader
          onToggleSidebar={toggleSidebar}
          notifications={Notifications}
          onOpenProfile={() => setProfileOpen(true)}
        />

        {/* Page content */}
        <Box flex="1" minW={0} bg="bg" p={0} overflow="auto" ref={scrollRef}>
          <StickyNavbarContext refParent={scrollRef}>
            {children}
            <AppBottomNavBar
              onToggleSidebar={toggleSidebar}
              notifications={Notifications}
              profileOpen={profileOpen}
              onProfileOpenChange={setProfileOpen}
            />
          </StickyNavbarContext>
        </Box>
      </Flex>
    </Flex>
  );
}
