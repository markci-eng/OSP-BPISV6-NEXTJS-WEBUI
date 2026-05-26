"use client";

import { AppLayout } from "@/components/layout/app-layout";
import Login from "@/components/login/page";
import { ReactNode, useEffect, useState } from "react";

export function RenderPage({ children }: { children?: ReactNode }) {
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    setUser(storedUser);
  }, []);

  if (!user) return <Login />;

  return <AppLayout>{children}</AppLayout>;
}
