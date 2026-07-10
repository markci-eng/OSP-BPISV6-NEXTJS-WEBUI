"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Box, Skeleton } from "@chakra-ui/react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import {
  STANDARD_RADIUS,
  STANDARD_SHADOWS,
  STANDARD_SPACING,
} from "@/lib/theme/standard-design-tokens";
import { usePdfZoom } from "./usePdfZoom";
import { usePdfGestures } from "./usePdfGestures";
import { PdfViewerState } from "./PdfViewerStates";
import { PdfToolbar } from "./PdfToolbar";
import type { PdfDocumentStatus } from "./types";

// This module only ever runs client-side (consumers must load it via
// next/dynamic with ssr:false) since pdfjs touches browser-only APIs
// (Worker, canvas, DOMMatrix) that don't exist during SSR.
if (typeof window !== "undefined") {
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
}

const RENDER_BUFFER_PAGES = 2;
const LETTER_ASPECT_RATIO = 792 / 612;

export interface PdfViewerProps {
  fileUrl?: string;
  documentLabel?: string;
  /** Bypasses virtualization so every page is mounted at once — used for print. */
  renderAllPages?: boolean;
  onRetry?: () => void;
}

export function PdfViewer({
  fileUrl,
  documentLabel = "Statement of Account",
  renderAllPages = false,
  onRetry,
}: PdfViewerProps) {
  const zoom = usePdfZoom();
  const [status, setStatus] = useState<PdfDocumentStatus>(
    fileUrl ? "loading" : "empty",
  );
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [visiblePages, setVisiblePages] = useState<Set<number>>(new Set([1]));
  const [pageAspect, setPageAspect] = useState<Map<number, number>>(new Map());
  const pageNodesRef = useRef<Map<number, HTMLDivElement>>(new Map());

  useEffect(() => {
    setStatus(fileUrl ? "loading" : "empty");
    setNumPages(0);
    setCurrentPage(1);
    setVisiblePages(new Set([1]));
    setPageAspect(new Map());
  }, [fileUrl]);

  usePdfGestures(zoom.containerRef, zoom.zoomFactor, zoom.setZoom);

  const registerPageNode = useCallback(
    (page: number, node: HTMLDivElement | null) => {
      if (node) pageNodesRef.current.set(page, node);
      else pageNodesRef.current.delete(page);
    },
    [],
  );

  useEffect(() => {
    const root = zoom.containerRef.current;
    if (!root || numPages === 0) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        let bestPage: number | null = null;
        let bestRatio = 0;

        entries.forEach((entry) => {
          const page = Number(entry.target.getAttribute("data-page"));
          if (!page || !entry.isIntersecting) return;
          if (entry.intersectionRatio > bestRatio) {
            bestRatio = entry.intersectionRatio;
            bestPage = page;
          }
        });

        if (bestPage) setCurrentPage(bestPage);

        setVisiblePages((prev) => {
          const next = new Set(prev);
          entries.forEach((entry) => {
            const page = Number(entry.target.getAttribute("data-page"));
            if (!page) return;
            if (entry.isIntersecting) next.add(page);
            else next.delete(page);
          });
          const buffered = new Set(next);
          next.forEach((p) => {
            for (let d = 1; d <= RENDER_BUFFER_PAGES; d++) {
              if (p - d >= 1) buffered.add(p - d);
              if (p + d <= numPages) buffered.add(p + d);
            }
          });
          return buffered;
        });
      },
      { root, threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    pageNodesRef.current.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [numPages, zoom.containerRef]);

  const goToPage = useCallback(
    (page: number) => {
      const clamped = Math.min(Math.max(1, page), numPages || 1);
      pageNodesRef.current
        .get(clamped)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [numPages],
  );

  const handleLoadSuccess = useCallback((doc: { numPages: number }) => {
    setNumPages(doc.numPages);
    setStatus("ready");
  }, []);

  const handleLoadError = useCallback(() => {
    setStatus("error");
  }, []);

  const shouldRenderPage = useCallback(
    (page: number) => renderAllPages || visiblePages.has(page),
    [renderAllPages, visiblePages],
  );

  if (status === "empty") {
    return <PdfViewerState variant="empty" onRetry={onRetry} />;
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      h="full"
      w="full"
      minH={0}
      borderRadius={STANDARD_RADIUS.xl}
      overflow="hidden"
      bg={BRAND_COLORS.mutedBg}
      boxShadow={STANDARD_SHADOWS.level1}
    >
      <Box
        ref={zoom.containerRef}
        role="document"
        aria-label={`${documentLabel}, page ${currentPage} of ${numPages || 1}`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "PageDown") {
            e.preventDefault();
            goToPage(currentPage + 1);
          }
          if (e.key === "ArrowUp" || e.key === "PageUp") {
            e.preventDefault();
            goToPage(currentPage - 1);
          }
        }}
        flex="1"
        minH={0}
        overflowY="auto"
        overflowX="auto"
        scrollBehavior="smooth"
        css={{ WebkitOverflowScrolling: "touch", touchAction: "pan-x pan-y" }}
        className="print-area"
        py={STANDARD_SPACING.sm}
        px={{ base: STANDARD_SPACING.xs, md: STANDARD_SPACING.md }}
      >
        {status === "loading" && <PdfViewerState variant="loading" />}
        {status === "error" && (
          <PdfViewerState variant="error" onRetry={onRetry} />
        )}

        {fileUrl && status !== "error" && (
          <Document
            file={fileUrl}
            onLoadSuccess={handleLoadSuccess}
            onLoadError={handleLoadError}
            loading={null}
            error={null}
            noData={null}
          >
            {status === "ready" &&
              Array.from({ length: numPages }, (_, i) => i + 1).map(
                (page) => {
                  const aspect = pageAspect.get(page) ?? LETTER_ASPECT_RATIO;
                  const height = Math.round(zoom.pageWidth * aspect);

                  return (
                    <Box
                      key={page}
                      ref={(node: HTMLDivElement | null) =>
                        registerPageNode(page, node)
                      }
                      data-page={page}
                      mx="auto"
                      mb={STANDARD_SPACING.sm}
                      w={`${zoom.pageWidth}px`}
                      minH={`${height}px`}
                      bg={BRAND_COLORS.white}
                      borderRadius={STANDARD_RADIUS.md}
                      boxShadow={STANDARD_SHADOWS.level2}
                      overflow="hidden"
                      transition="box-shadow 0.15s ease"
                    >
                      {shouldRenderPage(page) ? (
                        <Page
                          pageNumber={page}
                          width={zoom.pageWidth}
                          rotate={zoom.rotation}
                          onLoadSuccess={(loadedPage) => {
                            const ratio =
                              loadedPage.height / loadedPage.width;
                            setPageAspect((prev) => {
                              if (prev.get(page) === ratio) return prev;
                              const next = new Map(prev);
                              next.set(page, ratio);
                              return next;
                            });
                          }}
                          loading={<Skeleton w="full" h={`${height}px`} />}
                        />
                      ) : (
                        <Skeleton w="full" h={`${height}px`} />
                      )}
                    </Box>
                  );
                },
              )}
          </Document>
        )}
      </Box>

      <PdfToolbar
        currentPage={currentPage}
        totalPages={numPages}
        onPrevPage={() => goToPage(currentPage - 1)}
        onNextPage={() => goToPage(currentPage + 1)}
        onJumpToPage={goToPage}
        zoomFactor={zoom.zoomFactor}
        onZoomIn={zoom.zoomIn}
        onZoomOut={zoom.zoomOut}
        onResetZoom={zoom.resetZoom}
        onRotate={zoom.rotate}
        onToggleFullscreen={zoom.toggleFullscreen}
        isFullscreen={zoom.isFullscreen}
        disabled={status !== "ready"}
      />
    </Box>
  );
}
