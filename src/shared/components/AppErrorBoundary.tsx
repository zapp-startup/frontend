import * as React from "react";

type State = { error: Error | null };

/**
 * Catches render errors so a failed import or component tree still shows diagnostics
 * instead of a blank page (default empty #root on white body).
 */
export class AppErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("AppErrorBoundary:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-[#0B1220] text-white flex flex-col items-center justify-center p-8 font-sans">
          <p className="text-xs font-black uppercase tracking-widest text-red-400">Something went wrong</p>
          <pre className="mt-4 max-w-2xl whitespace-pre-wrap rounded-2xl border border-red-500/30 bg-black/40 p-4 text-sm text-red-100">
            {this.state.error.message}
          </pre>
          <button
            type="button"
            className="mt-6 rounded-xl border border-white/20 px-4 py-2 text-sm font-bold hover:bg-white/10"
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
