"use client";

import React from "react";

export type ChipVariant = "met" | "unknown" | "not-met" | "unlock" | "info" | "neutral" | "warn";
export type ChipSize = "sm" | "md" | "lg";

interface ChipProps {
  variant?: ChipVariant;
  size?: ChipSize;
  label?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function Chip({
  variant = "neutral",
  size = "md",
  label,
  icon,
  children,
  className = "",
}: ChipProps) {
  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
  }[size];

  const baseStyles = `inline-flex items-center gap-1.5 rounded-md font-semibold border ${sizeStyles}`;

  const variantStyles = {
    met: "bg-ok/10 text-ok border-ok/30",
    unknown: "bg-warn/10 text-warn border-warn/30",
    warn: "bg-warn/10 text-warn border-warn/30",
    "not-met": "bg-surface-2 text-muted border-border",
    unlock: "bg-unlock/10 text-unlock border-unlock/30",
    info: "bg-accent/10 text-accent border-accent/30",
    neutral: "bg-surface-2 text-text border-border",
  }[variant];

  return (
    <span className={`${baseStyles} ${variantStyles} ${className}`}>
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{label || children}</span>
    </span>
  );
}
