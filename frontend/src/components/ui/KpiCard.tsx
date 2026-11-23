"use client";

import React from "react";
import { Card } from "./Card";

interface KpiCardProps {
  label: string;
  value: React.ReactNode;
  caption?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function KpiCard({
  label,
  value,
  caption,
  icon,
  className = "",
  onClick,
}: KpiCardProps) {
  return (
    <Card
      variant={onClick ? "interactive" : "default"}
      onClick={onClick}
      className={`flex flex-col justify-between space-y-1.5 ${className}`}
    >
      <div className="flex items-center justify-between text-xs font-semibold text-muted">
        <span>{label}</span>
        {icon && <span className="shrink-0">{icon}</span>}
      </div>
      <div className="text-2xl sm:text-3xl font-extrabold text-text font-headline tracking-tight">
        {value}
      </div>
      {caption && (
        <div className="text-xs text-muted font-medium pt-0.5">
          {caption}
        </div>
      )}
    </Card>
  );
}
