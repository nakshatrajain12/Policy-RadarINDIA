"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: string;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = "lg",
  className = "",
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStylesMap: Record<string, string> = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    "6xl": "max-w-6xl",
  };

  const resolvedMaxWidth = maxWidth.startsWith("max-w-")
    ? maxWidth
    : maxWidthStylesMap[maxWidth] || "max-w-lg";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fadeIn">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
        aria-hidden="true" 
      />
      <div
        role="dialog"
        aria-modal="true"
        className={`relative w-full ${resolvedMaxWidth} max-h-[90vh] flex flex-col bg-surface border border-border rounded-2xl shadow-xl overflow-hidden z-10 ${className}`}
      >
        {(title || subtitle) && (
          <div className="px-6 py-4 border-b border-border flex items-center justify-between gap-4 bg-surface-2">
            <div>
              {title && (
                <h2 className="text-base sm:text-lg font-bold text-text tracking-tight">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-xs text-muted mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-muted hover:text-text rounded-lg hover:bg-surface transition-colors focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-6 text-text">
          {children}
        </div>
      </div>
    </div>
  );
}
