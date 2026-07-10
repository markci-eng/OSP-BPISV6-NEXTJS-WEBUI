// `PdfViewer` is deliberately NOT re-exported here. It statically imports
// react-pdf/pdfjs, which touches browser-only APIs (DOMMatrix, canvas,
// Worker) at module-evaluation time. Any file that imports from this barrel
// pulls its whole module graph in, so re-exporting PdfViewer here would
// crash server rendering the moment anything else in this barrel is
// statically imported by a "use client" page. Import it directly instead:
//   const PdfViewer = dynamic(
//     () => import("@/components/common/pdf-viewer/PdfViewer").then((m) => m.PdfViewer),
//     { ssr: false },
//   );
export { PdfToolbar } from "./PdfToolbar";
export type { PdfToolbarProps } from "./PdfToolbar";
export { PdfViewerState } from "./PdfViewerStates";
export type { PdfViewerStateProps } from "./PdfViewerStates";
export { usePdfZoom } from "./usePdfZoom";
export { usePdfGestures } from "./usePdfGestures";
export type { PdfDocumentStatus, PdfStateVariant } from "./types";
