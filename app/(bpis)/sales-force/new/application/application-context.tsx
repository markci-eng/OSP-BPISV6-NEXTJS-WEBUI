"use client";

/**
 * ApplicationProvider — the single source of truth for the whole
 * document-first application flow.
 *
 * Responsibilities:
 *   1. Own every document slot and drive its upload → process → complete/fail
 *      lifecycle (with abortable, retryable async work).
 *   2. Own the canonical applicant field state, including which fields were
 *      AI-filled, which the user has touched, and per-field confidence.
 *   3. Auto-prefill fields from extraction WITHOUT ever overwriting a value the
 *      user has edited, and surface low-confidence reads for verification.
 *   4. Persist enough to sessionStorage that previews and extracted data
 *      survive a refresh or backward navigation (live File handles cannot be
 *      serialized, so re-upload is requested only when a retry needs the bytes).
 *
 * Consumers use the `useApplication()` hook + the `useField()` selector.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  DocumentSlot,
  DocumentStatus,
  ExtractionFields,
  FieldKey,
} from "./types";
import {
  CONFIDENCE_THRESHOLD,
  DOCUMENT_TYPES,
  REQUIRED_DOCUMENT_IDS,
  getDocumentConfig,
} from "./document-config";
import {
  makeThumbnail,
  processDocument,
  readAsDataURL,
} from "./extraction-service";

/* ------------------------------------------------------------------ */
/* Field state                                                         */
/* ------------------------------------------------------------------ */

export interface FieldState {
  value: string;
  /** Value currently sourced from AI and not yet edited by the user. */
  aiFilled: boolean;
  /** User has edited this field → never auto-overwrite it. */
  userTouched: boolean;
  confidence?: number;
  /** Document type id that produced the value/suggestion. */
  source?: string;
  /** A low-confidence extracted value offered for manual review (field left empty). */
  suggestion?: string;
}

type FormState = Partial<Record<FieldKey, FieldState>>;

const EMPTY_FIELD: FieldState = {
  value: "",
  aiFilled: false,
  userTouched: false,
};

/* ------------------------------------------------------------------ */
/* Context shape                                                       */
/* ------------------------------------------------------------------ */

interface ApplicationContextValue {
  documents: Record<string, DocumentSlot>;
  fields: FormState;

  // Document actions
  uploadDocument: (typeId: string, file: File) => Promise<void>;
  retryDocument: (typeId: string) => Promise<void>;
  removeDocument: (typeId: string) => void;

  // Field actions
  setField: (key: FieldKey, value: string) => void;
  getField: (key: FieldKey) => FieldState;
  acceptSuggestion: (key: FieldKey) => void;

  /** Merge all completed extractions into the form (respecting user edits). */
  applyExtraction: () => void;

  // Derived helpers
  requiredComplete: boolean;
  cleanedSignatureUrl?: string;
  extractionSummary: ExtractionSummaryItem[];
  clearAll: () => void;
}

export interface ExtractionSummaryItem {
  label: string;
  detected: boolean;
}

const ApplicationContext = createContext<ApplicationContextValue | null>(null);

/* ------------------------------------------------------------------ */
/* Persistence                                                         */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = "sf-new-application-v1";

interface PersistedShape {
  documents: Record<string, Omit<DocumentSlot, "file">>;
  fields: FormState;
}

const loadPersisted = (): PersistedShape | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedShape;
  } catch {
    return null;
  }
};

const savePersisted = (documents: Record<string, DocumentSlot>, fields: FormState) => {
  if (typeof window === "undefined") return;
  try {
    const safeDocs: Record<string, Omit<DocumentSlot, "file">> = {};
    for (const [id, slot] of Object.entries(documents)) {
      // Drop the live File handle and the potentially-large cleaned image so
      // the extracted field data (the important part) always fits the quota.
      // `previewUrl` is already a small thumbnail; the cleaned signature is
      // regenerated on retry / falls back to the preview after a refresh.
      const { file, cleanedImageUrl, ...rest } = slot;
      safeDocs[id] = rest;
    }
    window.sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ documents: safeDocs, fields }),
    );
  } catch {
    // Over quota or serialization issue — previews are best-effort, ignore.
  }
};

/* ------------------------------------------------------------------ */
/* Provider                                                            */
/* ------------------------------------------------------------------ */

export function ApplicationProvider({ children }: { children: React.ReactNode }) {
  const [documents, setDocuments] = useState<Record<string, DocumentSlot>>({});
  const [fields, setFields] = useState<FormState>({});
  const [hydrated, setHydrated] = useState(false);

  // Abort controllers per document, so replace/remove cancels in-flight work.
  const controllers = useRef<Record<string, AbortController>>({});

  /* --- Hydrate from sessionStorage on mount ----------------------- */
  useEffect(() => {
    const persisted = loadPersisted();
    if (persisted) {
      const restored: Record<string, DocumentSlot> = {};
      for (const [id, slot] of Object.entries(persisted.documents)) {
        // Work interrupted by a refresh can't resume (the File is gone).
        const status: DocumentStatus =
          slot.status === "uploading" || slot.status === "processing"
            ? "failed"
            : slot.status;
        restored[id] = {
          ...slot,
          status,
          error:
            status === "failed" && !slot.error
              ? "Upload was interrupted. Please re-upload this document."
              : slot.error,
        };
      }
      setDocuments(restored);
      setFields(persisted.fields ?? {});
    }
    setHydrated(true);
  }, []);

  /* --- Persist on change ------------------------------------------ */
  useEffect(() => {
    if (!hydrated) return;
    savePersisted(documents, fields);
  }, [documents, fields, hydrated]);

  /* --- Internal helpers ------------------------------------------- */

  const patchDoc = useCallback(
    (typeId: string, patch: Partial<DocumentSlot>) => {
      setDocuments((prev) => ({
        ...prev,
        [typeId]: { ...(prev[typeId] ?? { typeId, status: "idle", progress: 0 }), ...patch },
      }));
    },
    [],
  );

  /**
   * Merge every completed document's extraction into the form state.
   * - Highest-confidence value per field wins across documents.
   * - Fields the user has touched are never overwritten.
   * - >= threshold → filled + flagged AI.
   * - <  threshold → left empty, offered as a suggestion to verify.
   */
  const applyExtractionFrom = useCallback(
    (docs: Record<string, DocumentSlot>) => {
      // Best (highest-confidence) extracted field across all documents.
      const best: Partial<Record<FieldKey, ExtractionFields[FieldKey]>> = {};
      for (const slot of Object.values(docs)) {
        if (slot.status !== "completed" || !slot.extraction) continue;
        for (const [k, ef] of Object.entries(slot.extraction)) {
          if (!ef) continue;
          const key = k as FieldKey;
          const current = best[key];
          if (!current || ef.confidence > current.confidence) best[key] = ef;
        }
      }

      setFields((prev) => {
        const next: FormState = { ...prev };
        for (const [k, ef] of Object.entries(best)) {
          if (!ef) continue;
          const key = k as FieldKey;
          const existing = next[key] ?? EMPTY_FIELD;
          if (existing.userTouched) continue; // never clobber user edits

          if (ef.confidence >= CONFIDENCE_THRESHOLD) {
            next[key] = {
              value: ef.value,
              aiFilled: true,
              userTouched: false,
              confidence: ef.confidence,
              source: ef.source,
              suggestion: undefined,
            };
          } else {
            // Low confidence: leave value empty, surface for verification.
            next[key] = {
              value: existing.value, // keep any prior good value
              aiFilled: existing.aiFilled,
              userTouched: false,
              confidence: ef.confidence,
              source: ef.source,
              suggestion: ef.value,
            };
          }
        }
        return next;
      });
    },
    [],
  );

  /* --- Upload + processing lifecycle ------------------------------ */

  const runProcessing = useCallback(
    async (typeId: string, file: File) => {
      const config = getDocumentConfig(typeId);
      if (!config) return;

      controllers.current[typeId]?.abort();
      const controller = new AbortController();
      controllers.current[typeId] = controller;

      // 1) Upload phase — simulated byte progress (swap for real XHR/fetch
      //    progress events when a storage backend exists).
      patchDoc(typeId, {
        typeId,
        status: "uploading",
        progress: 0,
        file,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        error: undefined,
        extraction: undefined,
        cleanedImageUrl: undefined,
      });

      // Generate a small persistable preview in parallel.
      makeThumbnail(file).then((thumb) => {
        if (controller.signal.aborted) return;
        if (thumb) patchDoc(typeId, { previewUrl: thumb });
      });

      const uploadDone = await new Promise<boolean>((resolve) => {
        let pct = 0;
        const tick = setInterval(() => {
          if (controller.signal.aborted) {
            clearInterval(tick);
            resolve(false);
            return;
          }
          pct = Math.min(100, pct + 12 + Math.random() * 18);
          patchDoc(typeId, { progress: Math.round(pct) });
          if (pct >= 100) {
            clearInterval(tick);
            resolve(true);
          }
        }, 120);
      });
      if (!uploadDone) return;

      // 2) Processing phase — AI extraction / signature cleaning.
      patchDoc(typeId, { status: "processing", progress: 100 });

      try {
        const result = await processDocument(config, file, {
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;

        // For signature docs, keep a full-res cleaned image if produced,
        // else fall back to the original for the preview.
        let cleanedImageUrl = result.cleanedImageUrl;
        if (config.processor === "signature" && !cleanedImageUrl) {
          cleanedImageUrl = await readAsDataURL(file).catch(() => undefined);
        }

        setDocuments((prev) => {
          const nextDocs: Record<string, DocumentSlot> = {
            ...prev,
            [typeId]: {
              ...(prev[typeId] as DocumentSlot),
              status: "completed",
              progress: 100,
              extraction: result.fields,
              cleanedImageUrl,
              processedAt: Date.now(),
              error: undefined,
            },
          };
          // Prefill immediately so downstream steps are ready.
          queueMicrotask(() => applyExtractionFrom(nextDocs));
          return nextDocs;
        });
      } catch (err) {
        if (controller.signal.aborted) return;
        patchDoc(typeId, {
          status: "failed",
          error:
            err instanceof Error
              ? err.message
              : "Something went wrong while processing this document.",
        });
      }
    },
    [applyExtractionFrom, patchDoc],
  );

  const uploadDocument = useCallback(
    async (typeId: string, file: File) => {
      await runProcessing(typeId, file);
    },
    [runProcessing],
  );

  const retryDocument = useCallback(
    async (typeId: string) => {
      const slot = documents[typeId];
      if (slot?.file) {
        await runProcessing(typeId, slot.file);
      }
      // No live file (e.g. after refresh) → the card prompts a re-upload.
    },
    [documents, runProcessing],
  );

  const removeDocument = useCallback((typeId: string) => {
    controllers.current[typeId]?.abort();
    delete controllers.current[typeId];
    setDocuments((prev) => {
      const next = { ...prev };
      delete next[typeId];
      return next;
    });
    // Clear fields that were AI-filled from this document and are untouched.
    setFields((prev) => {
      const next: FormState = {};
      for (const [k, fs] of Object.entries(prev)) {
        if (!fs) continue;
        const key = k as FieldKey;
        if (fs.source === typeId && !fs.userTouched) {
          next[key] = { ...EMPTY_FIELD };
        } else {
          next[key] = fs;
        }
      }
      return next;
    });
  }, []);

  /* --- Field actions ---------------------------------------------- */

  const setField = useCallback((key: FieldKey, value: string) => {
    setFields((prev) => ({
      ...prev,
      [key]: {
        value,
        aiFilled: false,
        userTouched: true,
        confidence: prev[key]?.confidence,
        source: prev[key]?.source,
        suggestion: undefined,
      },
    }));
  }, []);

  const acceptSuggestion = useCallback((key: FieldKey) => {
    setFields((prev) => {
      const fs = prev[key];
      if (!fs?.suggestion) return prev;
      return {
        ...prev,
        [key]: {
          value: fs.suggestion,
          aiFilled: true,
          userTouched: false,
          confidence: fs.confidence,
          source: fs.source,
          suggestion: undefined,
        },
      };
    });
  }, []);

  const getField = useCallback(
    (key: FieldKey): FieldState => fields[key] ?? EMPTY_FIELD,
    [fields],
  );

  const applyExtraction = useCallback(
    () => applyExtractionFrom(documents),
    [applyExtractionFrom, documents],
  );

  const clearAll = useCallback(() => {
    Object.values(controllers.current).forEach((c) => c.abort());
    controllers.current = {};
    setDocuments({});
    setFields({});
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  /* --- Derived ---------------------------------------------------- */

  const requiredComplete = useMemo(
    () =>
      REQUIRED_DOCUMENT_IDS.every(
        (id) => documents[id]?.status === "completed",
      ),
    [documents],
  );

  const cleanedSignatureUrl = useMemo(() => {
    const sig = DOCUMENT_TYPES.find((d) => d.processor === "signature");
    if (!sig) return undefined;
    const slot = documents[sig.id];
    return slot?.status === "completed"
      ? slot.cleanedImageUrl ?? slot.previewUrl
      : undefined;
  }, [documents]);

  const extractionSummary = useMemo<ExtractionSummaryItem[]>(() => {
    const has = (k: FieldKey) => {
      const fs = fields[k];
      return !!fs && (fs.aiFilled || !!fs.value);
    };
    const fullName = has("firstName") || has("lastName");
    const items: ExtractionSummaryItem[] = [
      { label: "Full Name", detected: fullName },
      { label: "Birth Date", detected: has("dateOfBirth") },
      { label: "Address", detected: has("street") || has("city") },
      { label: "ID Number", detected: has("idNumber") },
      { label: "Signature", detected: !!cleanedSignatureUrl },
    ];
    return items;
  }, [fields, cleanedSignatureUrl]);

  const value: ApplicationContextValue = {
    documents,
    fields,
    uploadDocument,
    retryDocument,
    removeDocument,
    setField,
    getField,
    acceptSuggestion,
    applyExtraction,
    requiredComplete,
    cleanedSignatureUrl,
    extractionSummary,
    clearAll,
  };

  return (
    <ApplicationContext.Provider value={value}>
      {children}
    </ApplicationContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/* Hooks                                                               */
/* ------------------------------------------------------------------ */

export function useApplication(): ApplicationContextValue {
  const ctx = useContext(ApplicationContext);
  if (!ctx)
    throw new Error("useApplication must be used within an ApplicationProvider");
  return ctx;
}

/** Non-throwing variant for shared components that may render outside the flow. */
export function useApplicationOptional(): ApplicationContextValue | null {
  return useContext(ApplicationContext);
}

/** Convenience selector for a single field + its setter and metadata. */
export function useField(key: FieldKey) {
  const { getField, setField, acceptSuggestion } = useApplication();
  const state = getField(key);
  return {
    ...state,
    setValue: (v: string) => setField(key, v),
    acceptSuggestion: () => acceptSuggestion(key),
  };
}
