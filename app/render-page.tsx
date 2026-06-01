"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";

export function RenderPage({ children }: { children?: ReactNode }) {
  const pathname = usePathname();

  // Login page renders without AppLayout chrome
  if (pathname?.startsWith("/login")) return <>{children}</>;

  return <AppLayout>{children}</AppLayout>;
}
