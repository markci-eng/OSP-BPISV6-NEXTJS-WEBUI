/**
 * AI document-processing service.
 *
 * This module is the single integration seam between the UI and whatever
 * actually reads the documents. Today the ID pipeline returns a realistic
 * mock so the whole flow is demonstrable end-to-end; swapping in a real
 * Document-AI backend is a one-function change (see `extractIdFields`).
 *
 * The signature pipeline (`cleanSignature`) is NOT mocked — it genuinely
 * detects the signature bounding box, crops it, and knocks out the paper
 * background to a transparent PNG entirely on the client.
 *
 * Everything is async and abortable so the UI can show independent
 * "uploading" and "processing" states and support retry.
 */

import type {
  DocumentTypeConfig,
  ExtractedField,
  ExtractionFields,
  ProcessResult,
} from "./types";

/** Injected failure hook for demos/QA: any file named like *fail* fails processing. */
const shouldSimulateFailure = (file: File) => /fail/i.test(file.name);

const delay = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(t);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });

export interface ProcessOptions {
  signal?: AbortSignal;
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

/**
 * Route a freshly-uploaded file through the pipeline its document type
 * declares. Returns extracted fields and/or a cleaned image.
 */
export async function processDocument(
  config: DocumentTypeConfig,
  file: File,
  opts: ProcessOptions = {},
): Promise<ProcessResult> {
  switch (config.processor) {
    case "valid-id":
      return { fields: await extractIdFields(file, config.id, opts) };
    case "signature":
      return { cleanedImageUrl: await cleanSignature(file, opts) };
    case "generic":
    default:
      await delay(600, opts.signal);
      return {};
  }
}

/* ------------------------------------------------------------------ */
/* Valid-ID OCR — MOCK. Replace the body with a real backend call.     */
/* ------------------------------------------------------------------ */

/**
 * Extract structured fields from a government ID.
 *
 * ── To go live ──────────────────────────────────────────────────────
 * Replace the mock block below with a call to your Document-AI endpoint,
 * e.g.:
 *
 *   const body = new FormData();
 *   body.append("file", file);
 *   const res = await fetch("/api/extract-id", { method: "POST", body,
 *     signal: opts.signal });
 *   if (!res.ok) throw new Error("Extraction failed");
 *   return normalizeToExtractionFields(await res.json());
 *
 * The contract the UI depends on is only `ExtractionFields` (canonical keys +
 * confidence), so the rest of the app is untouched. The extractor is layout-
 * agnostic by design — it returns whatever fields it can read for ANY PH ID
 * (PhilSys, Driver's License, Passport, UMID, PRC, Postal, etc.).
 */
export async function extractIdFields(
  file: File,
  sourceId: string,
  opts: ProcessOptions = {},
): Promise<ExtractionFields> {
  // Simulate variable model latency so the "Processing" state is visible.
  await delay(1200 + Math.random() * 1200, opts.signal);

  if (shouldSimulateFailure(file)) {
    throw new Error(
      "We couldn't read this ID clearly. Try a sharper, well-lit photo.",
    );
  }

  // ── MOCK RESULT ──────────────────────────────────────────────────
  // Confidence values are intentionally mixed: `middleName` and
  // `placeOfBirth` land below CONFIDENCE_THRESHOLD to exercise the
  // "verify this field" UX. Real backends return their own scores.
  const f = (value: string, confidence: number): ExtractedField => ({
    value,
    confidence,
    source: sourceId,
  });

  return {
    firstName: f("Maria", 0.98),
    middleName: f("Santos", 0.54), // low → surfaced for verification
    lastName: f("Dela Cruz", 0.97),
    dateOfBirth: f("March 14, 1996", 0.95),
    placeOfBirth: f("Quezon City", 0.48), // low → surfaced for verification
    sex: f("Female", 0.96),
    civilStatus: f("Single", 0.9),
    nationality: f("Filipino", 0.99),
    street: f("123 Mabini Street", 0.83),
    barangay: f("Barangay San Antonio", 0.71),
    city: f("Pasig City", 0.88),
    province: f("Metro Manila", 0.85),
    zipCode: f("1600", 0.8),
    idType: f("PhilSys ID (National ID)", 0.99),
    idNumber: f("1234-5678-9012", 0.93),
    issueDate: f("Jan 12, 2023", 0.9),
    expiryDate: f("Jan 12, 2033", 0.9),
  };
}

/* ------------------------------------------------------------------ */
/* Signature cleaning — real client-side canvas processing.            */
/* ------------------------------------------------------------------ */

/**
 * Detect the signature, crop away the surrounding whitespace, and knock the
 * paper background out to transparency. Returns a trimmed PNG data URL.
 *
 * PDFs are stored as-is (no raster crop) — returns "" and the caller keeps the
 * original preview.
 */
export async function cleanSignature(
  file: File,
  opts: ProcessOptions = {},
): Promise<string> {
  await delay(700 + Math.random() * 700, opts.signal);

  if (shouldSimulateFailure(file)) {
    throw new Error(
      "We couldn't isolate the signature. Try a clearer image on white paper.",
    );
  }

  if (file.type === "application/pdf") return "";
  if (typeof document === "undefined") return "";

  const dataUrl = await readAsDataURL(file);
  const img = await loadImage(dataUrl);

  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;

  ctx.drawImage(img, 0, 0);
  const { width, height } = canvas;
  const image = ctx.getImageData(0, 0, width, height);
  const data = image.data;

  // A pixel counts as "ink" when it's meaningfully darker than the paper.
  const INK_LUMA = 200; // 0..255; below this = ink
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  let inkFound = false;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const luma = 0.299 * r + 0.587 * g + 0.114 * b;
      if (luma < INK_LUMA) {
        inkFound = true;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      } else {
        // Background → transparent, scaled by how light it is for a soft edge.
        data[i + 3] = Math.max(0, data[i + 3] - luma);
      }
    }
  }

  ctx.putImageData(image, 0, 0);

  // Nothing detected — return the original rather than an empty crop.
  if (!inkFound) return dataUrl;

  const pad = Math.round(Math.min(width, height) * 0.04);
  const cropX = Math.max(0, minX - pad);
  const cropY = Math.max(0, minY - pad);
  const cropW = Math.min(width, maxX + pad) - cropX;
  const cropH = Math.min(height, maxY + pad) - cropY;

  const out = document.createElement("canvas");
  out.width = cropW;
  out.height = cropH;
  const outCtx = out.getContext("2d");
  if (!outCtx) return canvas.toDataURL("image/png");
  outCtx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

  return out.toDataURL("image/png");
}

/* ------------------------------------------------------------------ */
/* Small browser helpers                                               */
/* ------------------------------------------------------------------ */

export function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Downscale an image file to a small JPEG data URL for previews. This is what
 * gets persisted (full-res files blow the sessionStorage quota). Returns "" for
 * PDFs / non-images — callers fall back to a document icon.
 */
export async function makeThumbnail(file: File, max = 512): Promise<string> {
  if (typeof document === "undefined") return "";
  if (!file.type.startsWith("image/")) return "";
  try {
    const img = await loadImage(await readAsDataURL(file));
    const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.max(1, Math.round(img.naturalWidth * scale));
    const h = Math.max(1, Math.round(img.naturalHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";
    ctx.drawImage(img, 0, 0, w, h);
    return canvas.toDataURL("image/jpeg", 0.82);
  } catch {
    return "";
  }
}
