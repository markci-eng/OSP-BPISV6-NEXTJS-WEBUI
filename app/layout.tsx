import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { StPeterProvider, MessageDialogProvider } from "osp-ui-kit";
import { Toaster } from "sonner";
import { RenderPage } from "./render-page";
import RootLayoutClient from "./root-layout-client";
import { cookies } from "next/headers";
import { EMAIL_COOKIE, USER_COOKIE } from "@/lib/session";

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
  // Read here rather than in `RenderPage`: `osp_session` carries the address
  // too but is `httpOnly`, so the browser cannot see it. Handing the shell its
  // user from the server means the first paint already has the name instead of
  // swapping one in after hydration.
  const userEmail = cookieStore.get(EMAIL_COOKIE)?.value ?? null;

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
            <MessageDialogProvider>
              <RenderPage userRole={userRole}>{children}</RenderPage>
              {/* <AppLayout>{children}</AppLayout> */}
              <Toaster position="top-right" richColors />
              {/* <NavigationLoadingOverlay /> */}
            </MessageDialogProvider>
          </StPeterProvider>
        </RootLayoutClient>
      </body>
    </html>
  );
}
