"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

import { Button } from "@/components/ui/button";

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
    console.error("Unhandled UI error caught by ErrorBoundary:", error, errorInfo);
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
      <div className="min-h-screen bg-background bg-brand-sheen px-4 py-12">
        <div className="container mx-auto max-w-xl">
          <div className="rounded-xl border border-border bg-card p-8 shadow-card">
            <h1 className="text-2xl font-semibold text-deep-navy">
              Something went wrong
            </h1>
            <p className="mt-3 text-sm text-text-secondary">
              We hit an unexpected issue while loading this page.
            </p>

            {process.env.NODE_ENV === "development" && this.state.error ? (
              <pre className="mt-4 overflow-x-auto rounded-md bg-muted p-3 text-xs text-danger">
                {this.state.error.message}
              </pre>
            ) : null}

            <div className="mt-6">
              <Button onClick={this.handleReset}>Try again</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

