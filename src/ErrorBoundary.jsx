import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Studio error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
          color: "var(--text)",
          padding: 32
        }}>
          <h2 style={{ marginBottom: 16, fontFamily: "Inter, sans-serif", fontWeight: 500 }}>
            Unable to load 3D viewer
          </h2>
          <p style={{ marginBottom: 24, color: "var(--muted)", fontSize: 14 }}>
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
          <button onClick={this.handleRetry}>Retry</button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
