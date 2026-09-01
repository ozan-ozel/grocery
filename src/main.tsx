import { render } from "preact";
import { QueryClient, QueryClientProvider } from "@tanstack/preact-query";
import { App } from "@/App";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import "./index.css";

const queryClient = new QueryClient();

render(
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </ErrorBoundary>,
  document.getElementById("app")!
);
