"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { ErrorState } from "./ErrorState";

interface Props {
  children: ReactNode;
  tabName?: string;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[ErrorBoundary] Uncaught error in ${this.props.tabName || "section"}:`, error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-4 sm:p-6 my-4 bg-surface border border-border rounded-xl">
          <ErrorState
            title={`Unable to display ${this.props.tabName || "this section"}`}
            message={this.state.error?.message || "An unexpected error occurred while rendering this section."}
            onRetry={this.handleReset}
            retryText="Reload Section"
          />
        </div>
      );
    }

    return this.props.children;
  }
}
