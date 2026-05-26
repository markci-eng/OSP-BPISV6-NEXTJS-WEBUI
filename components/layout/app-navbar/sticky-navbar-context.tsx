import React, { createContext, useContext, useEffect, useState } from "react";

const ScrollContext =
  createContext<React.RefObject<HTMLDivElement | null> | null>(null);

export const StickyNavbarContext = (params: {
  children: React.ReactNode;
  refParent: React.RefObject<HTMLDivElement | null>;
}) => {
  const { children, refParent } = params;

  return (
    <ScrollContext.Provider value={refParent}>
      {children}
    </ScrollContext.Provider>
  );
};

export const useStickyNavbar = () => useContext(ScrollContext);
