"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
} from "@chakra-ui/react";
import {
  LuMenu,
  LuUserPen,
  LuReplace,
  LuTrendingUpDown,
  LuClipboardCheck,
} from "react-icons/lu";
import { NotificationDataProps } from "../app-layout.type";
import { StickyNavbar } from "./sticky-navbar";
import { StickyNavbarBtn } from "./sticky-navbar-btn";
import { RiBookShelfLine, RiDashboardFill, RiDashboardLine } from "react-icons/ri";
import { HiOutlineCurrencyDollar } from "react-icons/hi2";

export function AppBottomNavBar({
  onToggleSidebar,
  notifications,
}: {
  onToggleSidebar: () => void;
  notifications: NotificationDataProps[];
}) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [systemColorMode, setColorMode] = useState(
    localStorage?.getItem("color-mode") ?? "light",
  );

  useEffect(() => {
    localStorage.setItem("color-mode", systemColorMode);
  }, [systemColorMode]);

  return (
    <StickyNavbar>
                  <StickyNavbarBtn
                    onClickEvent={() => {}}
                    btnChildren={RiDashboardLine}
                    title="Dashboard"
                  />
    
                  <StickyNavbarBtn
                    onClickEvent={() => {}}
                    btnChildren={LuClipboardCheck}
                    title="Approvals"
                  />
    
                  <StickyNavbarBtn
                    onClickEvent={() => {}}
                    btnChildren={RiBookShelfLine}
                    title="Documents"
                  />
                  
                  <StickyNavbarBtn
                    onClickEvent={() => {}}
                    btnChildren={RiBookShelfLine}
                    title="Documents"
                  />
    
                  <StickyNavbarBtn
                    onClickEvent={onToggleSidebar}
                    btnChildren={LuMenu}
                    title="More"
                  >
                  </StickyNavbarBtn>
                </StickyNavbar>
  );
}
