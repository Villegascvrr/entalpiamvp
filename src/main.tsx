import React from "react";
import { createRoot } from "react-dom/client";
import "./i18n"; // Initialize i18n BEFORE App renders
import App from "./App.tsx";
import "./index.css";

// ── Error Boundary to surface runtime crashes ──
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("🔴 ErrorBoundary caught:", error, info.componentStack);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 32, fontFamily: "monospace", color: "#e53e3e" }}>
          <h1>⚠️ Application Error</h1>
          <pre style={{ whiteSpace: "pre-wrap", marginTop: 16 }}>
            {this.state.error?.message}
          </pre>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              marginTop: 8,
              fontSize: 12,
              color: "#999",
            }}
          >
            {this.state.error?.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
);
