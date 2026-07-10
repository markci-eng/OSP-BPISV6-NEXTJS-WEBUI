export type PdfDocumentStatus = "loading" | "ready" | "error" | "empty";

export type PdfStateVariant =
  | "loading"
  | "error"
  | "empty"
  | "permission-denied";
