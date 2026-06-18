import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { StPeterProvider } from "st-peter-ui";
import { Toaster } from "sonner";
import { MessageDialogProvider } from "@/components/common/message-box/message-box-provider";
import { RenderPage } from "./render-page";
import RootLayoutClient from "./root-layout-client";
import { NavigationLoadingOverlay } from "@/components/common/loading-overlay/navigation-loading-overlay";
import { DemoAuthProvider } from "@/components/ui/demo-auth";
import { cookies } from "next/headers";
import { USER_COOKIE } from "@/lib/session";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "One St. Peter",
  description: "Life Plan Operations",
  manifest: "/manifest.json",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const userRole = cookieStore.get(USER_COOKIE)?.value ?? null;

  return (
    <html
      lang="en"
      style={{
        fontSize: "100%",
        maxHeight: "100vh",
        overflow: "auto",
        overscrollBehavior: "none",
      }}
      suppressHydrationWarning
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable}`}
        style={{ background: "#fff", overscrollBehavior: "none" }}
      >
        <RootLayoutClient>
          <StPeterProvider font="Open Sans" theme="green">
            <DemoAuthProvider>
              <MessageDialogProvider>
                <RenderPage userRole={userRole}>{children}</RenderPage>
                {/* <AppLayout>{children}</AppLayout> */}
                <Toaster position="top-right" richColors />
                <NavigationLoadingOverlay />
              </MessageDialogProvider>
            </DemoAuthProvider>
          </StPeterProvider>
        </RootLayoutClient>
      </body>
    </html>
  );
}
