import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
}

/** Minimal error boundary so a render error shows a friendly message, not a blank page. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("App error:", error, info);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="mx-auto max-w-prose px-4 py-24 text-center">
          <h1 className="text-2xl font-bold">Er ging iets mis</h1>
          <p className="mt-3 text-text-body">
            Vernieuw de pagina of neem telefonisch contact met ons op.
          </p>
          <a href="/" className="mt-6 inline-block font-semibold text-green-strong underline">
            Terug naar de homepage
          </a>
        </div>
      );
    }
    return this.props.children;
  }
}
