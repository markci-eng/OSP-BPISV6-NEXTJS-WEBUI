"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { createPortal } from "react-dom";

const PAD = 8;
const CARD_W = 300;
const CARD_H_EST = 220;

export interface Step {
  targetId: string;
  title: string;
  body: string;
}

export const ACCOUNT_SUMMARY_STEPS: Step[] = [
  {
    targetId: "tour-search",
    title: "Search for a Planholder",
    body: "Type a name or person ID to look up any planholder. Results appear as you type — select one to load their full account summary.",
  },
  {
    targetId: "tour-actions-menu",
    title: "Quick Actions",
    body: "Access all planholder actions here: edit info, delete records, and initiate transactions like Pay My Plan, Change of Mode, ROP, and Claims.",
  },
  {
    targetId: "tour-profile-header",
    title: "Planholder Profile",
    body: "This card shows the planholder's full name and insurability status at a glance — your quick reference for who you're working with.",
  },
  {
    targetId: "tour-contact-actions",
    title: "Contact Shortcuts",
    body: "One-click access to call the planholder, send an email, or open their registered address directly in Google Maps.",
  },
  {
    targetId: "tour-pending-requests",
    title: "Pending Requests",
    body: "Monitor all active transactions — reinstatements, Change of Mode, ROP, and more. See their current approval step and status at a glance.",
  },
  {
    targetId: "tour-planholder-info",
    title: "Personal Details",
    body: "Verify personal information like date of birth, civil status, TIN, and occupation. Use the menu to edit these details when needed.",
  },
  {
    targetId: "tour-plans-list",
    title: "List of Plans",
    body: "All plans attached to this planholder are listed here with their premium, payment mode, and status. Click any plan to view details and available transactions.",
  },
];

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function getRect(id: string): Rect | null {
  if (typeof window === "undefined") return null;
  const el = document.getElementById(id);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.width === 0 || r.height === 0) return null;
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

export interface TourHandle {
  start: () => void;
}

interface OnboardingTutorialProps {
  steps: Step[];
  storageKey: string;
}

export const OnboardingTutorial = forwardRef<TourHandle, OnboardingTutorialProps>(
  function OnboardingTutorial({ steps, storageKey }, ref) {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState(0);
    const [rect, setRect] = useState<Rect | null>(null);
    const [mounted, setMounted] = useState(false);

    useImperativeHandle(ref, () => ({
      start: () => {
        setStep(0);
        setOpen(true);
      },
    }));

    useEffect(() => {
      setMounted(true);
      if (!localStorage.getItem(storageKey)) {
        const t = setTimeout(() => setOpen(true), 900);
        return () => clearTimeout(t);
      }
    }, [storageKey]);

    useEffect(() => {
      const handler = () => { setStep(0); setOpen(true); };
      window.addEventListener("osp-start-page-tour", handler);
      return () => window.removeEventListener("osp-start-page-tour", handler);
    }, []);

    const focusStep = useCallback((index: number) => {
      const id = steps[index]?.targetId;
      if (!id) return;
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      setTimeout(() => setRect(getRect(id)), 400);
    }, [steps]);

    useEffect(() => {
      if (open) focusStep(step);
    }, [open, step, focusStep]);

    useEffect(() => {
      if (!open) return;
      const onResize = () => focusStep(step);
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }, [open, step, focusStep]);

    const close = useCallback(() => {
      setOpen(false);
      localStorage.setItem(storageKey, "1");
    }, [storageKey]);

    const next = () => {
      if (step < steps.length - 1) setStep((s) => s + 1);
      else close();
    };

    const prev = () => {
      if (step > 0) setStep((s) => s - 1);
    };

    if (!mounted || !open) return null;

    const current = steps[step];
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const hasSpot = !!rect;

    const spotTop = rect ? rect.top - PAD : 0;
    const spotLeft = rect ? rect.left - PAD : 0;
    const spotW = rect ? rect.width + PAD * 2 : 0;
    const spotH = rect ? rect.height + PAD * 2 : 0;

    let cardTop: number;
    let cardLeft: number;

    if (hasSpot) {
      const spaceBelow = vh - (spotTop + spotH);
      cardTop =
        spaceBelow >= CARD_H_EST + 16
          ? spotTop + spotH + 12
          : Math.max(12, spotTop - CARD_H_EST - 12);
      cardLeft = Math.max(
        12,
        Math.min(vw - CARD_W - 12, spotLeft + spotW / 2 - CARD_W / 2),
      );
    } else {
      cardTop = vh / 2 - CARD_H_EST / 2;
      cardLeft = vw / 2 - CARD_W / 2;
    }

    const primary = "var(--chakra-colors-primary, #3b82f6)";

    return createPortal(
      <div
        style={{ position: "fixed", inset: 0, zIndex: 9999, pointerEvents: "none" }}
        role="dialog"
        aria-modal="true"
        aria-label={`Onboarding tour step ${step + 1} of ${steps.length}`}
      >
        {/* Overlay */}
        {hasSpot ? (
          <>
            <div
              style={{ position: "absolute", top: 0, left: 0, right: 0, height: `${Math.max(0, spotTop)}px`, background: "rgba(0,0,0,0.6)", pointerEvents: "auto" }}
              onClick={close}
            />
            <div
              style={{ position: "absolute", top: `${spotTop + spotH}px`, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", pointerEvents: "auto" }}
              onClick={close}
            />
            <div
              style={{ position: "absolute", top: `${spotTop}px`, left: 0, width: `${Math.max(0, spotLeft)}px`, height: `${spotH}px`, background: "rgba(0,0,0,0.6)", pointerEvents: "auto" }}
              onClick={close}
            />
            <div
              style={{ position: "absolute", top: `${spotTop}px`, left: `${spotLeft + spotW}px`, right: 0, height: `${spotH}px`, background: "rgba(0,0,0,0.6)", pointerEvents: "auto" }}
              onClick={close}
            />
            <div
              style={{
                position: "absolute",
                top: `${spotTop}px`,
                left: `${spotLeft}px`,
                width: `${spotW}px`,
                height: `${spotH}px`,
                borderRadius: "10px",
                outline: `3px solid ${primary}`,
                boxShadow: "0 0 0 4px rgba(59,130,246,0.25)",
                pointerEvents: "none",
                transition: "top 0.35s cubic-bezier(0.4,0,0.2,1), left 0.35s cubic-bezier(0.4,0,0.2,1), width 0.35s cubic-bezier(0.4,0,0.2,1), height 0.35s cubic-bezier(0.4,0,0.2,1)",
              }}
            />
          </>
        ) : (
          <div
            style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", pointerEvents: "auto" }}
            onClick={close}
          />
        )}

        {/* Tooltip card */}
        <div
          style={{
            position: "absolute",
            top: `${cardTop}px`,
            left: `${cardLeft}px`,
            width: `${CARD_W}px`,
            background: "#ffffff",
            borderRadius: "16px",
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,0,0,0.05)",
            padding: "20px",
            pointerEvents: "auto",
            transition: "top 0.35s cubic-bezier(0.4,0,0.2,1), left 0.35s cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          {/* Step badge + close */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <span
              style={{
                background: primary,
                color: "#fff",
                borderRadius: "9999px",
                padding: "2px 10px",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.04em",
              }}
            >
              {step + 1} of {steps.length}
            </span>
            <button
              onClick={close}
              aria-label="Close tour"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#9ca3af",
                fontSize: "14px",
                lineHeight: 1,
                padding: "4px 6px",
                borderRadius: "6px",
              }}
            >
              ✕
            </button>
          </div>

          {/* Title */}
          <p style={{ margin: "0 0 6px", fontWeight: 700, fontSize: "15px", color: "#111827", lineHeight: "1.3" }}>
            {current.title}
          </p>

          {/* Body */}
          <p style={{ margin: "0 0 16px", fontSize: "13px", color: "#6b7280", lineHeight: "1.6" }}>
            {current.body}
          </p>

          {/* Progress segments */}
          <div style={{ display: "flex", gap: "4px", marginBottom: "16px" }}>
            {steps.map((_, i) => (
              <div
                key={i}
                style={{
                  height: "4px",
                  borderRadius: "9999px",
                  flex: i === step ? 2 : 1,
                  background: i <= step ? primary : "#e5e7eb",
                  transition: "flex 0.3s ease, background 0.3s ease",
                }}
              />
            ))}
          </div>

          {/* Navigation */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button
              onClick={close}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "12px",
                color: "#9ca3af",
                padding: 0,
              }}
            >
              Skip tour
            </button>
            <div style={{ display: "flex", gap: "8px" }}>
              {step > 0 && (
                <button
                  onClick={prev}
                  style={{
                    background: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "6px 14px",
                    fontSize: "13px",
                    fontWeight: 500,
                    cursor: "pointer",
                    color: "#374151",
                  }}
                >
                  ← Back
                </button>
              )}
              <button
                onClick={next}
                style={{
                  background: primary,
                  border: "none",
                  borderRadius: "8px",
                  padding: "6px 16px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  color: "#fff",
                }}
              >
                {step < steps.length - 1 ? "Next →" : "Finish ✓"}
              </button>
            </div>
          </div>
        </div>
      </div>,
      document.body,
    );
  },
);
