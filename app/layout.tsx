import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { StPeterProvider } from "st-peter-ui";
import { Toaster } from "sonner";
import { MessageDialogProvider } from "@/components/common/message-box/message-box-provider";
import { RenderPage } from "./render-page";
import RootLayoutClient from "./root-layout-client";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "One St. Peter",
  description: "Life Plan Operations",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ fontSize: "100%" }}>
      <body
        className={`${geistSans.variable} ${geistMono.variable}`}
        style={{ background: "#fff" }}
      >
        <RootLayoutClient>
          <StPeterProvider font="Open Sans" theme="green">
            <MessageDialogProvider>
              <RenderPage>{children}</RenderPage>
              {/* <AppLayout>{children}</AppLayout> */}
              <Toaster position="top-right" richColors />
            </MessageDialogProvider>
          </StPeterProvider>
        </RootLayoutClient>
      </body>
    </html>
  );
}
