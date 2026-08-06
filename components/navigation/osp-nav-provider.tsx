"use client";

import { useCallback, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import NextLink from "next/link";
import {
  NavigationProvider,
  type NavigateOptions,
  type NavLinkProps,
} from "osp-ui-kit";

// osp-ui-kit's Sidebar/Profile/AppBottomNavBar/etc. call useNavigation()
// instead of react-router-dom hooks directly, so this app (which routes via
// Next.js App Router, not react-router-dom) supplies its own NavigationAdapter
// backed by next/navigation + next/link. Without this, mounting AppLayout
// throws "useNavigate() may be used only in the context of a <Router>
// component" since there's no react-router-dom Router anywhere in this app.
function OspNavLink({ to, ...rest }: NavLinkProps) {
  return <NextLink href={to} {...rest} />;
}

export function OspNavigationProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname() ?? "/";

  const navigate = useCallback(
    (to: string | number, options?: NavigateOptions) => {
      if (typeof to === "number") {
        // Next.js's router only exposes back()/forward(), not an arbitrary
        // history delta the way react-router-dom's navigate(n) does.
        if (to < 0) router.back();
        else if (to > 0) router.forward();
        return;
      }
      if (options?.replace) {
        router.replace(to);
      } else {
        router.push(to);
      }
    },
    [router],
  );

  return (
    <NavigationProvider value={{ pathname, navigate, Link: OspNavLink }}>
      {children}
    </NavigationProvider>
  );
}
