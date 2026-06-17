"use client";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import {
  SideBarItemsBMSTL,
  SideBarItemsBranch,
  SideBarItemsEKolekta,
} from "@/components/layout/data/sidebar-items";
import { Notifications } from "@/components/layout/data/notifications";
import { AppLayout } from "@/claude components/layout/app-layout";
import { NotifyInstall } from "@splpi/estore-shared-components";

export function RenderPage({
  children,
  userRole,
}: {
  children?: ReactNode;
  userRole: string | null;
}) {
  const pathname = usePathname();

  if (pathname?.startsWith("/login")) return <>{children}</>;

  const navItems =
    userRole === "branch"
      ? SideBarItemsBranch
      : userRole === "bmstl"
        ? SideBarItemsBMSTL
        : SideBarItemsEKolekta;

  return (
    <NotifyInstall appName={"One St. Peter: Life Plan"}>
      <AppLayout
        navItems={navItems}
        notifications={Notifications}
        appName="One St. Peter"
        appSubtitle="Life Plan Operations"
      >
        {children}
      </AppLayout>
    </NotifyInstall>
  );
}
