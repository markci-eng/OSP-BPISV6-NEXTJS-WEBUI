"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  SideBarItemsBMSTL,
  SideBarItemsBranch,
  SideBarItemsEKolekta,
} from "@/components/layout/data/sidebar-items";
import { Notifications } from "@/components/layout/data/notifications";
import { AppLayout } from "@/claude components/layout/app-layout";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2)
    return decodeURIComponent(parts.pop()!.split(";").shift() ?? "");
  return null;
}

export function RenderPage({ children }: { children?: ReactNode }) {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    setUserRole(readCookie("osp_user"));
  }, []);

  if (pathname?.startsWith("/login")) return <>{children}</>;

  const navItems =
    userRole === "branch"
      ? SideBarItemsBranch
      : userRole === "bmstl"
        ? SideBarItemsBMSTL
        : SideBarItemsEKolekta;

  return (
    <AppLayout
      navItems={navItems}
      notifications={Notifications}
      appName="One St. Peter"
      appSubtitle="Life Plan"
    >
      {children}
    </AppLayout>
  );
}
