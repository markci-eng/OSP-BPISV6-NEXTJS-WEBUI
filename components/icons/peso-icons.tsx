import React from "react";

interface SVGIconProps extends React.SVGProps<SVGSVGElement> {
  size?: string | number;
  color?: string;
}

export function PesoOutlineIcon({ size = "1em", color, style, ...props }: SVGIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color, ...style }}
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="9.5" />
      {/* ₱ stem */}
      <line x1="10" y1="6" x2="10" y2="18" />
      {/* ₱ bowl: top-right of stem arcs right and down to mid-stem */}
      <path d="M10 6h3a3 3 0 0 1 0 6h-3" />
      {/* ₱ upper bar */}
      <line x1="7" y1="9" x2="16" y2="9" />
      {/* ₱ lower bar */}
      <line x1="7" y1="12" x2="16" y2="12" />
    </svg>
  );
}

export function PesoSolidIcon({ size = "1em", color, style, ...props }: SVGIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      style={{ color, ...style }}
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="9.5" />
      <g fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {/* ₱ stem */}
        <line x1="10" y1="6" x2="10" y2="18" />
        {/* ₱ bowl */}
        <path d="M10 6h3a3 3 0 0 1 0 6h-3" />
        {/* ₱ upper bar */}
        <line x1="7" y1="9" x2="16" y2="9" />
        {/* ₱ lower bar */}
        <line x1="7" y1="12" x2="16" y2="12" />
      </g>
    </svg>
  );
}
