import { createContext, useContext } from "react";

const SidebarContext = createContext<(() => void) | null>(null);

export const SidebarProvider = SidebarContext.Provider;

export const useSidebarToggle = () => useContext(SidebarContext);
