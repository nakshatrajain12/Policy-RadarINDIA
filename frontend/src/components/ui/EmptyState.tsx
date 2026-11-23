"use client";

import React from "react";
import { Layers } from "lucide-react";
import { Card } from "./Card";
import { Button } from "./Button";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon = <Layers className="w-8 h-8 text-muted" />,
  title,
  description,
  message,
  actionLabel,
  onAction,
  action,
  className = "",
}: EmptyStateProps) {
  const desc = description || message;
  const label = actionLabel || action?.label;
  const handleAction = onAction || action?.onClick;

  return (
    <Card className={`p-8 sm:p-12 text-center max-w-lg mx-auto space-y-4 ${className}`}>
      <div className="w-12 h-12 rounded-xl bg-surface-2 text-muted flex items-center justify-center mx-auto">
        {icon}
      </div>
      <div>
        <h3 className="text-sm sm:text-base font-bold text-text">
          {title}
        </h3>
        {desc && (
          <p className="text-xs text-muted mt-1 max-w-md mx-auto">
            {desc}
          </p>
        )}
      </div>
      {label && handleAction && (
        <div>
          <Button variant="secondary" onClick={handleAction}>
            {label}
          </Button>
        </div>
      )}
    </Card>
  );
}
