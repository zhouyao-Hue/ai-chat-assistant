import { Component } from "react";
import type { ErrorBoundaryProps, ErrorBoundaryState } from "@/types";

/**
 * 捕获子树渲染错误，展示 fallback；重置时递增 resetKey 以 remount 子树。
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  /**
   * @param props - children 与可选 fallback
   */
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, resetKey: 0 };
  }

  /**
   * 从子树 throw 推导错误 UI 状态。
   * @param error - 捕获到的错误
   */
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  /**
   * 记录错误栈到控制台。
   * @param error - 错误对象
   * @param errorInfo - React 组件栈信息
   */
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo.componentStack);
  }

  /** 清除错误并递增 resetKey，强制子树 remount。 */
  handleReset = () => {
    this.setState({ hasError: false, error: null, resetKey: this.state.resetKey + 1 });
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="error-fallback" role="alert">
            <h2>页面出现了错误</h2>
            <p>{this.state.error?.message ?? "未知错误"}</p>
            <button type="button" className="btn btn-primary" onClick={this.handleReset}>
              重试
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
export default ErrorBoundary;
