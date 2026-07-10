"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Box, Spinner } from "@chakra-ui/react";

export function NavigationLoadingOverlay() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const pendingRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = () => {
    pendingRef.current = true;
    setIsLoading(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    // Safety: auto-hide after 3s if navigation never completes
    timeoutRef.current = setTimeout(hide, 3000);
  };

  const hide = () => {
    if (!pendingRef.current) return;
    pendingRef.current = false;
    setIsLoading(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  // Show for programmatic router.push() navigations, not just <a>/<Link> clicks.
  // `router` from useRouter() is the same singleton instance app-wide, so patching
  // it here intercepts every router.push() call in the codebase.
  useEffect(() => {
    const originalPush = router.push.bind(router);
    router.push = (...args: Parameters<typeof router.push>) => {
      show();
      return originalPush(...args);
    };
    return () => {
      router.push = originalPush;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  // Show for full-page navigations triggered via window.location.href / .reload() / .replace()
  useEffect(() => {
    const handleBeforeUnload = () => show();
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Hide as soon as the browser URL changes — fires before React re-renders the new page
  useEffect(() => {
    const originalPushState = window.history.pushState.bind(window.history);
    const originalReplaceState = window.history.replaceState.bind(window.history);

    window.history.pushState = (...args) => {
      originalPushState(...args);
      hide();
    };
    window.history.replaceState = (...args) => {
      originalReplaceState(...args);
      hide();
    };

    window.addEventListener("popstate", hide);

    return () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      window.removeEventListener("popstate", hide);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fallback: hide via usePathname in case history patch is bypassed
  useEffect(() => {
    hide();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as Element).closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      if (
        href.startsWith("http") ||
        href.startsWith("//") ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
      )
        return;

      if (href === pathname || href === window.location.pathname) return;

      show();
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [pathname]);

  if (!isLoading) return null;

  return (
    <Box
      position="fixed"
      inset={0}
      bg="rgba(255, 255, 255, 0.75)"
      backdropFilter="blur(2px)"
      zIndex={9999}
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      gap={3}
    >
      <Spinner
        size="xl"
        color="var(--chakra-colors-primary)"
        borderWidth="3px"
      />
      <Box fontSize="sm" fontWeight="medium" color="gray.500" letterSpacing="wide">
        Loading...
      </Box>
    </Box>
  );
}
