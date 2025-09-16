'use client'

import React, { Suspense, lazy, forwardRef, ComponentProps } from 'react'
import { TipTapEditorRef } from './TipTapEditor'

// Lazy load the TipTap editor to reduce initial bundle size
const SafeTipTapEditor = lazy(() => import('./SafeTipTapEditor'))

// Loading skeleton component
const EditorSkeleton = () => (
  <div className="space-y-3 animate-pulse">
    {/* Editor content area */}
    <div className="min-h-[60px] bg-gray-600/20 rounded-lg">
      <div className="p-4 space-y-2">
        <div className="h-4 bg-gray-600/40 rounded w-3/4"></div>
        <div className="h-4 bg-gray-600/40 rounded w-1/2"></div>
      </div>
    </div>
    
    {/* Toolbar skeleton */}
    <div className="flex items-center justify-between pt-3 border-t border-[#404249]/50">
      <div className="flex items-center space-x-4">
        {/* Toolbar buttons */}
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="w-8 h-8 bg-gray-600/30 rounded-full"></div>
        ))}
      </div>
      
      {/* Character counter */}
      <div className="h-4 w-12 bg-gray-600/30 rounded"></div>
    </div>
  </div>
)

// Error fallback for lazy loading
const EditorLoadError = ({ retry }: { retry: () => void }) => (
  <div className="flex flex-col items-center justify-center min-h-[120px] p-4 bg-[#2b2d31] border border-[#404249] rounded-lg">
    <div className="text-red-400 mb-2">⚠️</div>
    <p className="text-sm text-gray-400 text-center mb-3">
      Error al cargar el editor
    </p>
    <button
      onClick={retry}
      className="text-xs px-3 py-1 bg-brand-500 hover:bg-brand-600 text-white rounded transition-colors"
    >
      Reintentar
    </button>
  </div>
)

// Props type for the lazy editor
type SafeTipTapEditorProps = ComponentProps<typeof SafeTipTapEditor>

interface LazyTipTapEditorProps extends SafeTipTapEditorProps {
  loadingComponent?: React.ComponentType
  errorComponent?: React.ComponentType<{ retry: () => void }>
  preload?: boolean
}

class LazyEditorBoundary extends React.Component<
  { children: React.ReactNode; errorComponent?: React.ComponentType<{ retry: () => void }> },
  { hasError: boolean; retryKey: number }
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false, retryKey: 0 }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Lazy TipTap Editor loading error:', error, errorInfo)
  }

  retry = () => {
    this.setState(prev => ({ hasError: false, retryKey: prev.retryKey + 1 }))
  }

  render() {
    if (this.state.hasError) {
      const ErrorComponent = this.props.errorComponent || EditorLoadError
      return <ErrorComponent retry={this.retry} />
    }

    return (
      <div key={this.state.retryKey}>
        {this.props.children}
      </div>
    )
  }
}

const LazyTipTapEditor = forwardRef<TipTapEditorRef, LazyTipTapEditorProps>(
  ({ 
    loadingComponent: LoadingComponent = EditorSkeleton,
    errorComponent,
    preload = false,
    ...props 
  }, ref) => {
    // Preload the component on hover or focus
    React.useEffect(() => {
      if (preload) {
        // Preload the editor component
        import('./SafeTipTapEditor').catch(console.error)
      }
    }, [preload])

    return (
      <LazyEditorBoundary errorComponent={errorComponent}>
        <Suspense fallback={<LoadingComponent />}>
          <SafeTipTapEditor ref={ref} {...props} />
        </Suspense>
      </LazyEditorBoundary>
    )
  }
)

LazyTipTapEditor.displayName = 'LazyTipTapEditor'

// Hook for preloading the editor
export const usePreloadTipTapEditor = () => {
  const preload = React.useCallback(() => {
    import('./SafeTipTapEditor').catch(console.error)
  }, [])

  return preload
}

// Higher-order component for conditional lazy loading
export const withConditionalLazyLoading = <P extends object>(
  Component: React.ComponentType<P>,
  shouldLazyLoad: (props: P) => boolean = () => true
) => {
  return React.forwardRef<any, P>((props, ref) => {
    if (shouldLazyLoad(props)) {
      return <LazyTipTapEditor ref={ref} {...(props as any)} />
    }
    
    // Load immediately if condition not met
    return <SafeTipTapEditor ref={ref} {...(props as any)} />
  })
}

export default LazyTipTapEditor
export { EditorSkeleton, EditorLoadError }
export type { LazyTipTapEditorProps }