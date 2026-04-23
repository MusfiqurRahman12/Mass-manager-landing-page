import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "./Button";
import { Card } from "./Card";

interface Props {
  children?: ReactNode;
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
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 p-4">
          <Card className="max-w-md w-full text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-error/10 text-error rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
              Something went wrong
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              An unexpected error occurred in the application.
            </p>
            {this.state.error && (
              <div className="mt-4 p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-left overflow-auto">
                <code className="text-xs text-error">
                  {this.state.error.message}
                </code>
              </div>
            )}
            <div className="pt-4">
              <Button
                onClick={() => window.location.reload()}
                className="w-full"
              >
                Reload Page
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
