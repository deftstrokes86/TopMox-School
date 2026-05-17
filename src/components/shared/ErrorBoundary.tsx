"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

import { AppErrorFallback } from "@/components/shared/AppErrorFallback";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (process.env.NODE_ENV === "development") {
      console.error(
        "Unhandled UI error caught by ErrorBoundary:",
        error,
        errorInfo
      );
    }
  }

  private handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null
    });
  };

  public render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <AppErrorFallback
        error={this.state.error ?? undefined}
        reset={this.handleReset}
        context="client-error-boundary"
      />
    );
  }
}
