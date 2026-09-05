import React from 'react';
import { ShieldAlert, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Phishing Investigator React ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-aurora-bg text-slate-100 flex items-center justify-center p-6 font-sans">
          <div className="max-w-lg w-full bg-aurora-surface border border-security-criticalBorder rounded-3xl p-8 shadow-2xl space-y-6 text-center">
            <div className="p-4 bg-security-criticalBg border border-security-criticalBorder rounded-2xl w-fit mx-auto text-security-critical">
              <ShieldAlert className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-black text-white">Something went wrong</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                The application encountered an unexpected UI rendering error. Your data and security tokens remain safe in memory.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-aurora-bg border border-aurora-border rounded-xl text-left overflow-hidden">
                <p className="font-mono text-[11px] text-security-critical break-words">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="flex-1 flex items-center justify-center gap-2 bg-aurora-violet hover:bg-aurora-violetHover text-white text-xs font-bold py-3 px-4 rounded-xl shadow-lg transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Application</span>
              </button>
              <button
                onClick={() => {
                  try {
                    localStorage.clear();
                  } catch (e) {}
                  window.location.href = window.location.pathname;
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-aurora-card hover:bg-aurora-cardElevated border border-aurora-border text-slate-300 text-xs font-semibold py-3 px-4 rounded-xl transition-all"
              >
                <Home className="w-4 h-4" />
                <span>Reset & Go to Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
