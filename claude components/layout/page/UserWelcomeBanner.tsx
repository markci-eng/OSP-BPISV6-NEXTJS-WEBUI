"use client";

import React from "react";

interface UserWelcomeBannerProps {
  firstName: string;
  branch: string;
}

const C = {
  ink: "var(--chakra-colors-chakra-body-text, #1a202c)",
  muted: "var(--chakra-colors-gray-500, #718096)",
  faint: "var(--chakra-colors-gray-400, #a0aec0)",
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function formatDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function UserWelcomeBanner({ firstName, branch }: UserWelcomeBannerProps) {
  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 14,
        padding: "16px 18px",
      }}
    >
      {/* Animated background layer */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 20% 20%, rgba(99,102,241,0.18), transparent 45%), radial-gradient(circle at 80% 70%, rgba(16,185,129,0.14), transparent 40%)",
          animation: "bgFloat 14s ease-in-out infinite",
          zIndex: 0,
        }}
      />

      {/* Glass overlay for readability */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(10px)",
          zIndex: 0,
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: ".14em",
              textTransform: "uppercase",
              color: C.faint,
            }}
          >
            {getGreeting()}
          </div>

          <h1
            style={{
              fontSize: "clamp(24px, 4vw, 32px)",
              fontWeight: 700,
              margin: "4px 0",
              color: C.ink,
              lineHeight: 1.1,
            }}
          >
            Welcome back, {firstName}!
          </h1>

          <div
            style={{
              fontSize: 13.5,
              color: C.muted,
              fontWeight: 500,
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <span>📅 {formatDate()}</span>
            <span>•</span>
            <span>📍 {branch}</span>
          </div>
        </div>
      </div>

      {/* Animation keyframes */}
      <style>{`
        @keyframes bgFloat {
          0%   { transform: scale(1);    opacity: 0.85; }
          50%  { transform: scale(1.05); opacity: 1;    }
          100% { transform: scale(1);    opacity: 0.85; }
        }
      `}</style>
    </div>
  );
}
