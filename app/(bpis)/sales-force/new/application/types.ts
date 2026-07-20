/**
 * Shared types for the document-first application flow.
 *
 * The upload step (Step 1) captures files, runs them through the AI extraction
 * service, and writes the results into a centralized store. Every subsequent
 * step consumes the same canonical field keys, so extraction and form wiring
 * never drift.
 */

/* ------------------------------------------------------------------ */
/* Canonical applicant fields                                          */
/* ------------------------------------------------------------------ */

/**
 * The single source of truth for every field an applicant can have.
 * Extraction results, form values, and AI-filled tracking are all keyed
 * by these strings. Adding a new extractable field = add a key here.
 */
export type FieldKey =
  // Identity
  | "firstName"
  | "middleName"
  | "lastName"
  | "suffix"
  // Birth
  | "dateOfBirth"
  | "placeOfBirth"
  // Demographics
  | "sex"
  | "civilStatus"
  | "nationality"
  | "naturalizationDate"
  // Contact
  | "email"
  | "mobileNumber"
  | "landlineNumber"
  // Address
  | "street"
  | "barangay"
  | "district"
  | "city"
  | "province"
  | "zipCode"
  // ID document metadata
  | "idType"
  | "idNumber"
  | "issueDate"
  | "expiryDate"
  // Employment
  | "employer"
  | "position"
  | "hireDate"
  | "employmentStatus"
  | "nbiNumber"
  | "tinNumber"
  | "sssNumber";

/** A value extracted for one field, with the model's confidence [0..1]. */
export interface ExtractedField {
  value: string;
  /** 0..1 — anything below the config threshold is treated as "verify". */
  confidence: number;
  /** Which document produced this field (document type id). */
  source: string;
}

/** Partial map of extracted fields — extractors only return what they find. */
export type ExtractionFields = Partial<Record<FieldKey, ExtractedField>>;

/* ------------------------------------------------------------------ */
/* Upload + processing lifecycle                                       */
/* ------------------------------------------------------------------ */

export type DocumentStatus =
  | "idle" // waiting for upload
  | "uploading" // bytes transferring
  | "processing" // AI extraction / signature clean running
  | "completed" // done, results available
  | "failed"; // upload or processing error — retryable

/**
 * Everything we track for a single document slot. `file` is the live File
 * handle (not serializable); `previewUrl` is a data URL that IS persisted so
 * previews survive refresh/back-navigation.
 */
export interface DocumentSlot {
  typeId: string;
  status: DocumentStatus;
  /** 0..100 upload progress. */
  progress: number;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  /** data URL used for preview + persistence (images only; PDFs show an icon). */
  previewUrl?: string;
  /** Live handle, present only within the session that uploaded it. */
  file?: File;
  /** Human-readable failure reason for the failed state. */
  error?: string;
  /** Fields extracted from this specific document. */
  extraction?: ExtractionFields;
  /** For signature-type docs: the cleaned/cropped signature data URL. */
  cleanedImageUrl?: string;
  /** Epoch ms when processing finished. */
  processedAt?: number;
}

/** What the AI service returns for one document. */
export interface ProcessResult {
  fields?: ExtractionFields;
  /** For signature processors: cleaned transparent PNG data URL. */
  cleanedImageUrl?: string;
}

/* ------------------------------------------------------------------ */
/* Document type configuration                                         */
/* ------------------------------------------------------------------ */

/** Which processing pipeline a document type runs through. */
export type ProcessorKind = "valid-id" | "signature" | "generic";

export interface DocumentTypeConfig {
  id: string;
  label: string;
  description: string;
  required: boolean;
  /** MIME/extension accept string for the file input. */
  accept: string;
  /** Max size in megabytes. */
  maxSizeMB: number;
  /** react-icons component. */
  icon: React.ComponentType<{ size?: number | string }>;
  /** Extraction pipeline to invoke after upload. */
  processor: ProcessorKind;
  /** Short helper text for accepted formats, shown in the dropzone. */
  hint?: string;
}
