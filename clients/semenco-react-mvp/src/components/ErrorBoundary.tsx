import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Catches render errors anywhere in the tree and shows a calm fallback instead
 * of a blank screen. Class component because error boundaries require it.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Kept minimal for the scaffold; wire up real monitoring later (TODO.md).
    console.error("Unexpected error:", error, info.componentStack);
  }

  handleReload = (): void => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[60vh] items-center justify-center px-4">
          <div className="max-w-prose text-center">
            <h1 className="text-2xl font-semibold text-text-primary">
              Er ging iets mis
            </h1>
            <p className="mt-3 text-text-secondary">
              Onze excuses voor het ongemak. Probeer de pagina opnieuw te laden.
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="mt-6 inline-flex items-center justify-center rounded-lg bg-brand px-5 py-2.5 font-medium text-white transition-colors hover:bg-brand-strong"
            >
              Pagina herladen
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
