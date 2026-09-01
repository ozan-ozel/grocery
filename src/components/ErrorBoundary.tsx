import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
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

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto flex min-h-dvh w-full max-w-[30rem] flex-col items-center justify-center gap-6 px-5 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="size-10" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">Bir seyler yanlis gitti</h1>
            <p className="text-sm text-muted-foreground">
              Uygulama beklenmedik bir hata ile karsilasti.
            </p>
            {this.state.error && (
              <pre className="mt-4 max-h-40 overflow-auto rounded bg-muted p-3 text-left text-xs font-mono">
                {this.state.error.message}
              </pre>
            )}
          </div>
          <Button onClick={this.handleReset} className="w-full">
            <RefreshCw className="mr-2 size-4" />
            Uygulamayi Yeniden Baslat
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
