"use client";

import React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Card } from "./Card";
import { Button } from "./Button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  retryText?: string;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message = "Failed to load data. Please check your connection and try again.",
  onRetry,
  retryLabel,
  retryText,
  className = "",
}: ErrorStateProps) {
  const buttonLabel = retryLabel || retryText || "Retry";
  return (
    <Card className={`p-8 sm:p-10 text-center max-w-lg mx-auto space-y-4 border-danger/30 bg-danger/5 ${className}`}>
      <div className="w-12 h-12 rounded-full bg-danger/10 text-danger flex items-center justify-center mx-auto">
        <AlertCircle className="w-6 h-6" />
      </div>
      <div>
        <h3 className="text-sm sm:text-base font-bold text-text">
          {title}
        </h3>
        <p className="text-xs text-muted mt-1 max-w-md mx-auto">
          {message}
        </p>
      </div>
      {onRetry && (
        <div>
          <Button variant="primary" onClick={onRetry} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            <span>{buttonLabel}</span>
          </Button>
        </div>
      )}
    </Card>
  );
}
