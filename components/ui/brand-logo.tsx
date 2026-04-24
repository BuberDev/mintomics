"use client";

import type { CSSProperties } from "react";

type BrandLogoProps = {
  variant: "icon" | "wordmark";
  alt?: string;
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  style?: CSSProperties;
};

function MintomicsMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient id="mintomics-mark-gradient" x1="16" y1="14" x2="84" y2="86" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.55" stopColor="#f0f2f6" />
          <stop offset="1" stopColor="#8c97a8" />
        </linearGradient>
      </defs>

      <g fill="url(#mintomics-mark-gradient)" transform="translate(50 50)">
        <rect x="-7.5" y="-39" width="15" height="26" rx="4" transform="translate(0 0) rotate(0)" />
        <rect x="-7.5" y="-39" width="15" height="26" rx="4" transform="rotate(60)" />
        <rect x="-7.5" y="-39" width="15" height="26" rx="4" transform="rotate(120)" />
        <rect x="-7.5" y="-39" width="15" height="26" rx="4" transform="rotate(180)" />
        <rect x="-7.5" y="-39" width="15" height="26" rx="4" transform="rotate(240)" />
        <rect x="-7.5" y="-39" width="15" height="26" rx="4" transform="rotate(300)" />
      </g>
    </svg>
  );
}

const sharedWrapper =
  "inline-flex items-center justify-center overflow-hidden border border-white/15 bg-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.28)] backdrop-blur-2xl ring-1 ring-white/10";

export default function BrandLogo({
  variant,
  alt = "Mintomics",
  className = "",
  iconClassName = "",
  textClassName = "",
  style,
}: BrandLogoProps) {
  if (variant === "icon") {
    return (
      <span
        className={`${sharedWrapper} rounded-[1.35rem] px-2 py-2 ${className}`}
        style={style}
        role="img"
        aria-label={alt}
      >
        <MintomicsMark className={`h-full w-full opacity-95 drop-shadow-[0_3px_8px_rgba(0,0,0,0.16)] ${iconClassName}`} />
      </span>
    );
  }

  return (
    <span
      className={`${sharedWrapper} rounded-full px-4 py-2.5 ${className}`}
      style={style}
      role="img"
      aria-label={alt}
    >
      <MintomicsMark className={`h-6 w-6 shrink-0 opacity-95 drop-shadow-[0_3px_8px_rgba(0,0,0,0.16)] ${iconClassName}`} />
      <span className={`text-[0.98rem] font-semibold tracking-[-0.02em] text-white/95 sm:text-[1.02rem] ${textClassName}`}>
        Mintomics
      </span>
    </span>
  );
}
