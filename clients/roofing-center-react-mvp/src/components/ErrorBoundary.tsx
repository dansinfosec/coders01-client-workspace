import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props { children: ReactNode }
interface State { hasError: boolean }

/** Catches render errors and shows a calm fallback instead of a blank page. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError(): State { return { hasError: true }; }
  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("Unexpected error:", error, info.componentStack);
  }
  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[60vh] items-center justify-center px-4">
          <div className="max-w-prose text-center">
            <h1 className="text-2xl font-bold text-text-strong">Er ging iets mis</h1>
            <p className="mt-3 text-text-muted">Probeer de pagina opnieuw te laden.</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 inline-flex items-center justify-center rounded-lg bg-green px-5 py-2.5 font-semibold text-navy"
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
