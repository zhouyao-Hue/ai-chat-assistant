import { Component } from "react";
import type { ErrorBoundaryProps, ErrorBoundaryState } from "@/types";

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, resetKey: 0 };
  }
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo.componentStack);
  }
  handleReset = () => {
    this.setState({ hasError: false, error: null, resetKey: this.state.resetKey + 1 });
  };
  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div style={{ padding: 24, textAlign: "center" }}>
            <h2>页面出现了错误</h2>
            <p style={{ color: "#666" }}>{this.state.error?.message ?? "未知错误"}</p>
            <button onClick={this.handleReset}>重试</button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
export default ErrorBoundary;
