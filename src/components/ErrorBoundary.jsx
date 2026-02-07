import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    if (typeof this.props?.onError === 'function') {
      try {
        this.props.onError(error, errorInfo)
      } catch {
        // ignore
      }
    }
  }

  render() {
    if (this.state.hasError) {
      const errorMessage = this.state.error?.message ? String(this.state.error.message) : 'Unknown error'

      return (
        <div className="min-h-screen bg-secondary/30 flex items-center justify-center px-4">
          <div className="w-full max-w-lg bg-white border border-secondary rounded-2xl shadow-soft p-6">
            <h1 className="text-2xl font-cairo font-bold text-text-dark mb-2">Something went wrong</h1>
            <p className="text-text-gray mb-4">The page crashed while rendering. You can reload and try again.</p>

            {import.meta?.env?.DEV && (
              <div className="bg-secondary/50 border border-secondary rounded-lg p-4 mb-4">
                <div className="text-sm font-semibold text-text-dark mb-1">Error</div>
                <pre className="text-xs text-text-gray whitespace-pre-wrap break-words">{errorMessage}</pre>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                className="flex-1 px-4 py-3 rounded-lg bg-primary text-white font-semibold hover:opacity-95 transition"
                onClick={() => window.location.reload()}
              >
                Reload
              </button>
              <button
                type="button"
                className="flex-1 px-4 py-3 rounded-lg border border-secondary text-text-dark font-semibold hover:bg-secondary transition"
                onClick={() => this.setState({ hasError: false, error: null })}
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
