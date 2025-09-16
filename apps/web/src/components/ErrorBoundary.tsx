'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo })
    
    // Log error to monitoring service
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)
    
    // In production, send to error reporting service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to Sentry, LogRocket, or similar service
      this.reportError(error, errorInfo)
    }
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    // Error reporting implementation
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    }
    
    // Example: Send to monitoring service
    // analytics.track('Error Boundary Triggered', errorData)
    console.warn('Error reported:', errorData)
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="flex flex-col items-center justify-center min-h-[200px] p-6 bg-[#2b2d31] border border-[#404249] rounded-lg">
          <AlertTriangle className="w-12 h-12 text-red-400 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            Algo salió mal
          </h3>
          <p className="text-gray-400 text-center mb-4 max-w-md">
            El editor encontró un problema inesperado. Puedes intentar recargar o contactar soporte si el problema persiste.
          </p>
          
          {/* Development error details */}
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded text-xs text-red-200 max-w-lg overflow-auto">
              <summary className="cursor-pointer text-red-400 font-semibold mb-2">
                Detalles del Error (Desarrollo)
              </summary>
              <pre className="whitespace-pre-wrap">
                {this.state.error.message}
                {'\n\n'}
                {this.state.error.stack}
              </pre>
            </details>
          )}
          
          <button
            onClick={this.handleRetry}
            className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-colors"
          >
            <RefreshCw size={16} />
            Intentar nuevamente
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

// Specialized Error Boundary for TipTap Editor
interface TipTapErrorBoundaryProps {
  children: ReactNode
  onEditorError?: (error: Error) => void
}

export const TipTapErrorBoundary: React.FC<TipTapErrorBoundaryProps> = ({ 
  children, 
  onEditorError 
}) => {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    // Specific handling for TipTap errors
    console.error('TipTap Editor Error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    })
    
    onEditorError?.(error)
  }

  const fallback = (
    <div className="flex flex-col items-center justify-center min-h-[120px] p-4 bg-[#2b2d31] border border-[#404249] rounded-lg">
      <AlertTriangle className="w-8 h-8 text-yellow-400 mb-2" />
      <p className="text-sm text-gray-400 text-center mb-3">
        El editor de texto no está disponible temporalmente
      </p>
      <button
        onClick={() => window.location.reload()}
        className="text-xs px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
      >
        Recargar página
      </button>
    </div>
  )

  return (
    <ErrorBoundary fallback={fallback} onError={handleError}>
      {children}
    </ErrorBoundary>
  )
}

export default ErrorBoundary