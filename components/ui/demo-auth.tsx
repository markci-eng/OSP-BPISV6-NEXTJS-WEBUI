"use client";

import React, { createContext, useContext, useMemo, useState } from "react";

export type DemoAuthContextValue = {
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
  toggle: () => void;
};

const DemoAuthContext = createContext<DemoAuthContextValue | null>(null);

export function DemoAuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const value = useMemo<DemoAuthContextValue>(
    () => ({
      isLoggedIn,
      login: () => setIsLoggedIn(true),
      logout: () => setIsLoggedIn(false),
      toggle: () => setIsLoggedIn((v) => !v),
    }),
    [isLoggedIn],
  );

  return (
    <DemoAuthContext.Provider value={value}>
      {children}
    </DemoAuthContext.Provider>
  );
}

export function useDemoAuth() {
  const ctx = useContext(DemoAuthContext);
  if (!ctx) {
    throw new Error("useDemoAuth must be used within <DemoAuthProvider />");
  }
  return ctx;
}
