"use client";

import React from "react";
import { StickyNavbar } from "./sticky-navbar";
import { StickyNavbarBtn } from "./sticky-navbar-btn";
import {
  RiDashboardLine, RiDashboardFill,
  RiCheckboxCircleLine, RiCheckboxCircleFill,
  RiBookShelfLine, RiBookShelfFill,
  RiMoneyDollarCircleLine, RiMoneyDollarCircleFill,
  RiMenuLine,
} from "react-icons/ri";
import { usePathname, useRouter } from "next/navigation";

const NAV_ITEMS = [
  {
    Icon: RiDashboardLine,
    activeIcon: RiDashboardFill,
    title: "Home",
    href: "/",
    match: (p: string) => p === "/" || p.startsWith("/dashboard"),
  },
  {
    Icon: RiCheckboxCircleLine,
    activeIcon: RiCheckboxCircleFill,
    title: "Approvals",
    href: "/approvals",
    match: (p: string) => p.startsWith("/approvals"),
  },
  {
    Icon: RiBookShelfLine,
    activeIcon: RiBookShelfFill,
    title: "Docs",
    href: "/document-management",
    match: (p: string) => p.startsWith("/document-management"),
  },
  {
    Icon: RiMoneyDollarCircleLine,
    activeIcon: RiMoneyDollarCircleFill,
    title: "Payment",
    href: "/payment/encode-payment",
    match: (p: string) => p.startsWith("/payment/encode-payment"),
  },
  {
    Icon: RiMenuLine,
    activeIcon: undefined,
    title: "More",
    href: null,
    match: () => false,
  },
];

export function AppBottomNavBar({
  onToggleSidebar,
}: {
  onToggleSidebar: () => void;
  notifications?: unknown[];
}) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <StickyNavbar>
      {NAV_ITEMS.map((item) => (
        <StickyNavbarBtn
          key={item.title}
          btnChildren={item.Icon}
          activeIcon={item.activeIcon}
          title={item.title}
          isActive={item.match(pathname)}
          onClickEvent={() => {
            if (item.href) {
              router.push(item.href);
            } else {
              onToggleSidebar();
            }
          }}
        />
      ))}
    </StickyNavbar>
  );
}
