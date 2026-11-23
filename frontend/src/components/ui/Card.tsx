"use client";

import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "subtle" | "interactive";
  children: React.ReactNode;
}

export function Card({
  variant = "default",
  className = "",
  children,
  ...props
}: CardProps) {
  const baseStyles = "rounded-xl border border-border p-4 sm:p-5 text-text transition-colors";
  
  const variantStyles = {
    default: "bg-surface shadow-xs",
    subtle: "bg-surface-2",
    interactive: "bg-surface hover:border-accent hover:shadow-sm cursor-pointer",
  }[variant];

  return (
    <div className={`${baseStyles} ${variantStyles} ${className}`} {...props}>
      {children}
    </div>
  );
}
