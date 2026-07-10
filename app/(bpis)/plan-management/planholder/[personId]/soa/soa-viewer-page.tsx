"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Box, Button, HStack, Text } from "@chakra-ui/react";
import { toast } from "sonner";
import {
  LuDownload,
  LuLoaderCircle,
  LuPrinter,
  LuShare2,
} from "react-icons/lu";
import { LuCalendarClock, LuCalendarRange, LuHash, LuLayers, LuUser, LuWallet } from "react-icons/lu";
import Page from "@/claude components/layout/page/Page";
import { DocumentInfoCard } from "@/components/common/document-info-card/DocumentInfoCard";
import { PdfViewerState } from "@/components/common/pdf-viewer/PdfViewerStates";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import {
  STANDARD_RADIUS,
  STANDARD_SIZES,
  STANDARD_SPACING,
} from "@/lib/theme/standard-design-tokens";
import type { PlanholderLookup } from "@/components/plan-management/planholders/tables/planholder-list-table";
import type { SoaRecord } from "./soa.types";

const ACCOUNT_STATUS_BADGE: Record<
  string,
  { type: "success" | "info" | "warning" | "danger"; label: string }
> = {
  ACTIVE: { type: "success", label: "Active" },
  "FULLY PAID": { type: "info", label: "Fully Paid" },
  LAPSED: { type: "danger", label: "Lapsed" },
};

// react-pdf touches browser-only APIs (Worker, canvas, DOMMatrix), so the
// viewer must never be rendered during SSR.
const PdfViewer = dynamic(
  () =>
    import("@/components/common/pdf-viewer/PdfViewer").then(
      (mod) => mod.PdfViewer,
    ),
  { ssr: false, loading: () => <PdfViewerState variant="loading" /> },
);

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatPeso(amount: number) {
  return "₱ " + amount.toLocaleString("en-PH");
}

const actionButtonStyle = {
  h: { base: "44px", md: STANDARD_SIZES.button.sm.height },
  minW: { base: "44px", md: STANDARD_SIZES.button.sm.minWidth },
  px: { base: 0, md: STANDARD_SPACING.sm },
  borderRadius: STANDARD_RADIUS.md,
  variant: "outline" as const,
};

const spinStyle = {
  "@keyframes soaSpin": {
    from: { transform: "rotate(0deg)" },
    to: { transform: "rotate(360deg)" },
  },
  animation: "soaSpin 1s linear infinite",
};

export interface SoaViewerPageProps {
  planholder: PlanholderLookup;
  soaRecord: SoaRecord;
}

export function SoaViewerPage({ planholder, soaRecord }: SoaViewerPageProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [renderAllForPrint, setRenderAllForPrint] = useState(false);

  useEffect(() => {
    const onBeforePrint = () => setRenderAllForPrint(true);
    const onAfterPrint = () => setRenderAllForPrint(false);
    window.addEventListener("beforeprint", onBeforePrint);
    window.addEventListener("afterprint", onAfterPrint);
    return () => {
      window.removeEventListener("beforeprint", onBeforePrint);
      window.removeEventListener("afterprint", onAfterPrint);
    };
  }, []);

  if (soaRecord.accessRestricted) {
    return (
      <Page.Root
        title="Statement of Account"
        description={soaRecord.soaNumber}
        headerButton="back"
      >
        <Page.MainContent>
          <Page.Row>
            <PdfViewerState variant="permission-denied" />
          </Page.Row>
        </Page.MainContent>
      </Page.Root>
    );
  }

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      const response = await fetch(soaRecord.pdfUrl);
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${soaRecord.soaNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success("Statement downloaded");
    } catch {
      toast.error("Couldn't download the statement. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => window.print();

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}${soaRecord.pdfUrl}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Statement of Account ${soaRecord.soaNumber}`,
          url: shareUrl,
        });
      } catch {
        // user dismissed the native share sheet — nothing to report
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Couldn't copy the link");
    }
  };

  const planholderName = [
    planholder.firstName,
    planholder.middleName,
    planholder.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  const isTerminated = planholder.terminationStatus !== "NOT YET TERMINATED";
  const statusBadge = isTerminated
    ? { type: "danger" as const, label: planholder.terminationStatus }
    : (ACCOUNT_STATUS_BADGE[planholder.accountStatus] ?? {
        type: "warning" as const,
        label: planholder.accountStatus,
      });

  return (
    <Page.Root
      title="Statement of Account"
      description={soaRecord.soaNumber}
      headerButton="back"
    >
      <Page.ToolContent className="no-print">
        <HStack gap={STANDARD_SPACING.xs}>
          <Button
            aria-label="Download PDF"
            onClick={handleDownload}
            disabled={isDownloading}
            {...actionButtonStyle}
          >
            {isDownloading ? (
              <Box as={LuLoaderCircle} boxSize="16px" css={spinStyle} />
            ) : (
              <LuDownload size={16} />
            )}
            <Text display={{ base: "none", md: "inline" }} ml={1} fontSize="13px">
              {isDownloading ? "Downloading..." : "Download"}
            </Text>
          </Button>
          <Button aria-label="Print statement" onClick={handlePrint} {...actionButtonStyle}>
            <LuPrinter size={16} />
            <Text display={{ base: "none", md: "inline" }} ml={1} fontSize="13px">
              Print
            </Text>
          </Button>
          <Button aria-label="Share statement" onClick={handleShare} {...actionButtonStyle}>
            <LuShare2 size={16} />
            <Text display={{ base: "none", md: "inline" }} ml={1} fontSize="13px">
              Share
            </Text>
          </Button>
        </HStack>
      </Page.ToolContent>

      <Page.MainContent>
        <Page.Row flex="1" minH={0}>
          <PdfViewer
              fileUrl={soaRecord.pdfUrl}
              documentLabel={`Statement of Account ${soaRecord.soaNumber}`}
              renderAllPages={renderAllForPrint}
            />
        </Page.Row>
      </Page.MainContent>
    </Page.Root>
  );
}
