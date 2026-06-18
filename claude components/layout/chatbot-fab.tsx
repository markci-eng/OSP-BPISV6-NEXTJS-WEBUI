"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChatbotMessenger } from "./chatbot-messenger";

const FAB_SIZE = 64;
const EDGE_GAP = 16;

function getSnappedPos(x: number, y: number) {
  const W = window.innerWidth;
  const H = window.innerHeight;
  const dL = x;
  const dR = W - x - FAB_SIZE;
  const dT = y;
  const dB = H - y - FAB_SIZE;
  const min = Math.min(dL, dR, dT, dB);
  const clampY = (v: number) =>
    Math.max(EDGE_GAP, Math.min(v, H - FAB_SIZE - EDGE_GAP));
  const clampX = (v: number) =>
    Math.max(EDGE_GAP, Math.min(v, W - FAB_SIZE - EDGE_GAP));
  if (min === dL) return { x: EDGE_GAP, y: clampY(y) };
  if (min === dR) return { x: W - FAB_SIZE - EDGE_GAP, y: clampY(y) };
  if (min === dT) return { x: clampX(x), y: EDGE_GAP };
  return { x: clampX(x), y: H - FAB_SIZE - EDGE_GAP };
}

function RobotIcon() {
  return (
    <svg
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width="40"
      height="40"
    >
      {/* Headphone band */}
      <path
        d="M10 22 Q10 10 22 10 Q34 10 34 22"
        stroke="#94a3b8"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Headphone ear cups */}
      <rect x="7" y="20" width="5.5" height="8" rx="2.75" fill="#475569" />
      <rect x="31.5" y="20" width="5.5" height="8" rx="2.75" fill="#475569" />
      {/* Robot head */}
      <rect
        x="11"
        y="14"
        width="22"
        height="19"
        rx="5.5"
        fill="white"
        fillOpacity="0.92"
      />
      {/* Face screen */}
      <rect x="14" y="17" width="16" height="13" rx="3.5" fill="#0f172a" />
      {/* Left eye glow halo */}
      <circle cx="19" cy="22" r="3" fill="#00d4aa" fillOpacity="0.25" />
      {/* Right eye glow halo */}
      <circle cx="25" cy="22" r="3" fill="#00d4aa" fillOpacity="0.25" />
      {/* Eyes */}
      <circle cx="19" cy="22" r="2" fill="#00d4aa" />
      <circle cx="25" cy="22" r="2" fill="#00d4aa" />
      {/* Eye sheen */}
      <circle cx="19.6" cy="21.4" r="0.6" fill="white" fillOpacity="0.7" />
      <circle cx="25.6" cy="21.4" r="0.6" fill="white" fillOpacity="0.7" />
      {/* Smile */}
      <path
        d="M17.5 26.5 Q22 30 26.5 26.5"
        stroke="#00d4aa"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Antenna stem */}
      <line
        x1="22"
        y1="14"
        x2="22"
        y2="10"
        stroke="#94a3b8"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Antenna tip */}
      <circle cx="22" cy="8.5" r="2" fill="#00d4aa" />
      <circle cx="22" cy="8.5" r="3" fill="#00d4aa" fillOpacity="0.2" />
      {/* Neck */}
      <rect x="19" y="33" width="6" height="3" rx="1.5" fill="#cbd5e1" fillOpacity="0.6" />
    </svg>
  );
}

export function ChatbotFAB() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [messengerOpen, setMessengerOpen] = useState(false);
  const dragRef = useRef({ active: false, ox: 0, oy: 0 });
  const posRef = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false);

  useEffect(() => {
    const x = window.innerWidth - FAB_SIZE - EDGE_GAP;
    const y = window.innerHeight - FAB_SIZE - EDGE_GAP - 56;
    setPos({ x, y });
    posRef.current = { x, y };
    setMounted(true);
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      hasMoved.current = false;
      dragRef.current = {
        active: true,
        ox: e.clientX - posRef.current.x,
        oy: e.clientY - posRef.current.y,
      };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      setDragging(true);
      e.preventDefault();
    },
    [],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (!dragRef.current.active) return;
      hasMoved.current = true;
      const newPos = {
        x: e.clientX - dragRef.current.ox,
        y: e.clientY - dragRef.current.oy,
      };
      posRef.current = newPos;
      setPos(newPos);
    },
    [],
  );

  const onPointerUp = useCallback(() => {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    setDragging(false);
    if (hasMoved.current) {
      const snapped = getSnappedPos(posRef.current.x, posRef.current.y);
      posRef.current = snapped;
      setPos(snapped);
    } else {
      setMessengerOpen(true);
    }
  }, []);

  if (!mounted) return null;

  return (
    <>
      <style>{`
        @keyframes fab-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(0,200,100,0.35), 0 8px 32px rgba(0,120,60,0.45); }
          50%       { box-shadow: 0 0 0 8px rgba(0,200,100,0), 0 8px 32px rgba(0,120,60,0.45); }
        }
        .chatbot-fab {
          animation: fab-pulse 2.8s ease-in-out infinite;
        }
        .chatbot-fab:hover {
          animation: none;
          box-shadow: 0 0 0 6px rgba(0,200,100,0.18), 0 12px 40px rgba(0,120,60,0.55) !important;
          transform: scale(1.08);
        }
      `}</style>
      <button
        aria-label="Chatbot"
        className="chatbot-fab"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{
          position: "fixed",
          left: pos.x,
          top: pos.y,
          width: FAB_SIZE,
          height: FAB_SIZE,
          opacity: messengerOpen ? 0 : 1,
          pointerEvents: messengerOpen ? "none" : "auto",
          borderRadius: "50%",
          background:
            "linear-gradient(135deg, rgba(0,168,80,0.22) 0%, rgba(0,80,40,0.28) 100%)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          border: "1.5px solid rgba(0,220,110,0.38)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          touchAction: "none",
          cursor: dragging ? "grabbing" : "grab",
          transition: dragging
            ? "none"
            : "left 0.25s cubic-bezier(.4,0,.2,1), top 0.25s cubic-bezier(.4,0,.2,1), transform 0.15s ease",
          userSelect: "none",
          outline: "none",
          padding: 0,
          /* inner top-highlight for glass depth */
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.28), 0 8px 32px rgba(0,120,60,0.45)",
          overflow: "hidden",
        }}
      >
        {/* subtle inner circle tint */}
        <span
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.18) 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />
        <RobotIcon />
      </button>
      <ChatbotMessenger open={messengerOpen} onOpenChange={setMessengerOpen} />
    </>
  );
}
