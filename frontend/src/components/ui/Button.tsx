"use client";

import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 focus:ring-offset-bg disabled:opacity-50 disabled:pointer-events-none";

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs min-h-[44px] min-w-[44px]",
    md: "px-4 py-2 text-xs sm:text-sm min-h-[44px] min-w-[44px]",
    lg: "px-6 py-3 text-sm sm:text-base min-h-[44px] min-w-[44px]",
  }[size];

  const variantStyles = {
    primary: "bg-accent text-accent-contrast hover:opacity-90 active:scale-[0.99]",
    secondary: "bg-surface border border-border text-text hover:bg-surface-2",
    ghost: "bg-transparent text-text hover:bg-surface-2",
    danger: "bg-danger text-white hover:opacity-90",
  }[variant];

  return (
    <button
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
