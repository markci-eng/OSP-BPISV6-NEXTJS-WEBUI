"use client";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { NotifyInstall } from "@splpi/estore-shared-components";
import { AppLayout } from "osp-ui-kit";
import { OspNavigationProvider } from "@/components/navigation/osp-nav-provider";
import {
  SideBarItemsAMD,
  SideBarItemsBM,
  SideBarItemsBranch,
  SideBarItemsClaims,
  SideBarItemsEKolekta,
  SideBarItemsSTL,
} from "@/components/data/sidebar-items";
import { Notifications } from "@/components/data/notifications";

const ROLE_SIDEBAR_ITEMS: Record<string, typeof SideBarItemsBranch> = {
  branch: SideBarItemsBranch,
  claims: SideBarItemsClaims,
  amd: SideBarItemsAMD,
  bm: SideBarItemsBM,
  stl: SideBarItemsSTL,
};

export function RenderPage({
  children,
  userRole,
}: {
  children?: ReactNode;
  userRole: string | null;
}) {
  const pathname = usePathname();

  if (pathname?.startsWith("/login"))
    return (
      <NotifyInstall appName={"One St. Peter: Life Plan"}>
        {children}
      </NotifyInstall>
    );

  const navItems =
    (userRole && ROLE_SIDEBAR_ITEMS[userRole]) || SideBarItemsEKolekta;

  return (
    <NotifyInstall appName={"One St. Peter: Life Plan"}>
      <OspNavigationProvider>
        <AppLayout
          navItems={navItems}
          notifications={Notifications}
          appName={userRole === "sales-agent" ? "eKolekta" : "One St. Peter"}
          appSubtitle="Life Plan Operations"
        >
          {children}
        </AppLayout>
      </OspNavigationProvider>
    </NotifyInstall>
  );
}
