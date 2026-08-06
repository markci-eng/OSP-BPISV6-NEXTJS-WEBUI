"use client";

import React, { useState } from "react";
import { ColorModeProvider } from "@/components/ui/color-mode";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ServiceWorkerProvider } from "@/components/pwa/service-worker-provider";

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ColorModeProvider>
      <QueryClientProvider client={queryClient}>
        {/* Registers the service worker and surfaces update / offline toasts.
            Renders nothing — see components/pwa/service-worker-provider.tsx. */}
        <ServiceWorkerProvider />
        {children}
      </QueryClientProvider>
    </ColorModeProvider>
  );
}
