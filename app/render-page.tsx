"use client";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { NotifyInstall } from "@splpi/estore-shared-components";
import { AppLayout, AppUser } from "osp-ui-kit";
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

/** Roles that do not get the kit's chatbot. */
const ROLES_WITHOUT_CHATBOT = new Set(["claims"]);

/**
 * Hides the chatbot's floating button.
 *
 * `AppLayout` mounts it for every role and takes no prop to turn it off, so
 * this is done in CSS rather than by forking the layout. `!important` is not
 * decoration: the button positions itself with an inline `style`, which a
 * plain rule would lose to.
 *
 * Hiding the button is enough to hide the whole feature — the panel is opened
 * from it and nothing else, so with the button gone there is no way to reach
 * it. `display: none` also takes it out of the tab order and the accessibility
 * tree, so it is not merely invisible.
 */
const HIDE_CHATBOT_CSS = `.chatbot-fab { display: none !important; }`;

const appUser: AppUser = {
  email: "joycemb@stpeter.com.ph",
  name: "Joyce Basilio-Ramos",
  role: "Branch Manager",
  avatarUrl:
    "https://lh3.googleusercontent.com/a-/ALV-UjVMJSHCRae9AI71omM-12-JXe6RRORMkcfShnPQRn5izScdfxo=s240-p-k-rw-no",
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
      {userRole && ROLES_WITHOUT_CHATBOT.has(userRole) && (
        <style>{HIDE_CHATBOT_CSS}</style>
      )}
      <OspNavigationProvider>
        <AppLayout
          navItems={navItems}
          notifications={Notifications}
          appName={userRole === "sales-agent" ? "eKolekta" : "One St. Peter"}
          appSubtitle="Life Plan Operations"
          user={appUser}
        >
          {children}
        </AppLayout>
      </OspNavigationProvider>
    </NotifyInstall>
  );
}
