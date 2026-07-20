"use client";

import {
  LuIdCard,
  LuPenTool,
  LuReceipt,
  LuBaby,
  LuHeart,
  LuBookUser,
  LuBanknote,
} from "react-icons/lu";
import type { DocumentTypeConfig } from "./types";

/**
 * The document registry.
 *
 * This is the ONLY place you touch to add a new document type. Drop a new
 * entry here and the upload grid, validation, persistence, and (if you map a
 * processor) AI extraction all pick it up automatically. Nothing about the
 * upload UI is hardcoded to a specific document.
 *
 * `processor` chooses the extraction pipeline in extraction-service.ts:
 *   - "valid-id"  → OCR field extraction (prefills the form)
 *   - "signature" → detect + crop + clean the signature image
 *   - "generic"   → store only, no extraction
 */
export const DOCUMENT_TYPES: DocumentTypeConfig[] = [
  {
    id: "valid-id",
    label: "Valid Government ID",
    description:
      "PhilSys, Driver's License, Passport, UMID, PRC, Postal ID, etc.",
    required: true,
    accept: "image/jpeg,image/png,application/pdf",
    maxSizeMB: 10,
    icon: LuIdCard,
    processor: "valid-id",
    hint: "JPG, PNG or PDF · up to 10MB",
  },
  {
    id: "specimen-signature",
    label: "Specimen Signature",
    description: "A clear photo or scan of the applicant's signature.",
    required: true,
    accept: "image/jpeg,image/png,application/pdf",
    maxSizeMB: 10,
    icon: LuPenTool,
    processor: "signature",
    hint: "JPG, PNG or PDF · up to 10MB",
  },

  /* -------------------------------------------------------------- */
  /* Future documents — flip `required`/uncomment to enable.        */
  /* They already work end-to-end; they're hidden until needed.     */
  /* -------------------------------------------------------------- */
  // {
  //   id: "proof-of-billing",
  //   label: "Proof of Billing",
  //   description: "Utility bill issued within the last 3 months.",
  //   required: false,
  //   accept: "image/jpeg,image/png,application/pdf",
  //   maxSizeMB: 10,
  //   icon: LuReceipt,
  //   processor: "valid-id", // reuses address extraction
  //   hint: "JPG, PNG or PDF · up to 10MB",
  // },
  // {
  //   id: "birth-certificate",
  //   label: "Birth Certificate",
  //   description: "PSA-issued birth certificate.",
  //   required: false,
  //   accept: "image/jpeg,image/png,application/pdf",
  //   maxSizeMB: 10,
  //   icon: LuBaby,
  //   processor: "valid-id",
  // },
  // {
  //   id: "marriage-certificate",
  //   label: "Marriage Certificate",
  //   description: "PSA-issued marriage certificate.",
  //   required: false,
  //   accept: "image/jpeg,image/png,application/pdf",
  //   maxSizeMB: 10,
  //   icon: LuHeart,
  //   processor: "generic",
  // },
  // {
  //   id: "passport",
  //   label: "Passport",
  //   description: "Philippine or foreign passport.",
  //   required: false,
  //   accept: "image/jpeg,image/png,application/pdf",
  //   maxSizeMB: 10,
  //   icon: LuBookUser,
  //   processor: "valid-id",
  // },
  // {
  //   id: "income-documents",
  //   label: "Income Documents",
  //   description: "Payslip, ITR, or Certificate of Employment.",
  //   required: false,
  //   accept: "image/jpeg,image/png,application/pdf",
  //   maxSizeMB: 10,
  //   icon: LuBanknote,
  //   processor: "generic",
  // },
];

/**
 * Confidence threshold. Extracted fields at or above this prefill the form as
 * "AI Filled"; below this they are surfaced for manual verification instead of
 * silently trusting a shaky read.
 */
export const CONFIDENCE_THRESHOLD = 0.6;

export const getDocumentConfig = (id: string): DocumentTypeConfig | undefined =>
  DOCUMENT_TYPES.find((d) => d.id === id);

export const REQUIRED_DOCUMENT_IDS = DOCUMENT_TYPES.filter(
  (d) => d.required,
).map((d) => d.id);

// Keep unused future-icon imports referenced so tree-shaking/lint stays happy
// when the future entries above are commented out.
void [LuReceipt, LuBaby, LuHeart, LuBookUser, LuBanknote];
