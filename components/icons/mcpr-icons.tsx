import React from "react";

interface SVGIconProps extends React.SVGProps<SVGSVGElement> {
  size?: string | number;
  color?: string;
}

export function McprOutlineIcon({ size = "1em", color, style, ...props }: SVGIconProps) {
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
      {/* Document body with clipped top-right corner */}
      <path d="M4 2H16L20 6V22H4V2Z" />
      {/* Corner fold crease */}
      <path d="M16 2V6H20" />
      {/* Data rows suggesting a collection report */}
      <line x1="7" y1="10" x2="17" y2="10" />
      <line x1="7" y1="13.5" x2="17" y2="13.5" />
      <line x1="7" y1="17" x2="13" y2="17" />
    </svg>
  );
}

export function McprSolidIcon({ size = "1em", color, style, ...props }: SVGIconProps) {
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
      {/* Filled document body */}
      <path d="M4 2H16L20 6V22H4V2Z" />
      <g fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {/* Corner fold crease */}
        <path d="M16 2V6H20" />
        {/* Data rows */}
        <line x1="7" y1="10" x2="17" y2="10" />
        <line x1="7" y1="13.5" x2="17" y2="13.5" />
        <line x1="7" y1="17" x2="13" y2="17" />
      </g>
    </svg>
  );
}
