'use client'

import React, { memo, useMemo, useCallback, useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import { TipTapEditorRef } from './TipTapEditor'
import type { TipTapEditorProps } from './TipTapEditor'
import LazyTipTapEditor from './LazyTipTapEditor'
import { useEditorPerformance } from '../lib/performance-monitor'

interface ProductionTipTapEditorProps extends TipTapEditorProps {
  // Performance optimization props
  debounceMs?: number
  enableLazyLoading?: boolean
  preloadOnHover?: boolean
  optimizationLevel?: 'basic' | 'aggressive'
  enablePerformanceMonitoring?: boolean
}

// Optimized debounced callback hook
const useDebouncedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const timeoutRef = useRef<NodeJS.Timeout>()
  const callbackRef = useRef(callback)
  
  // Update callback ref without causing re-renders
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])
  
  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args)
      }, delay)
    }) as T,
    [delay] // Only depend on delay, not callback
  )
}

// Main production-ready editor component
const ProductionTipTapEditor = memo(forwardRef<TipTapEditorRef, ProductionTipTapEditorProps>(({
  onUpdate,
  onKeyDown,
  onImageUpload,
  debounceMs = 150,
  enableLazyLoading = true,
  preloadOnHover = true,
  optimizationLevel = 'basic',
  enablePerformanceMonitoring = process.env.NODE_ENV === 'development',
  placeholder,
  maxLength,
  className,
  ...props
}, ref) => {
  const editorRef = useRef<TipTapEditorRef>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const hasInteracted = useRef(false)

  // Performance monitoring (only in development or when explicitly enabled)
  const {
    startMonitoring,
    recordReady,
    recordFirstInput,
    recordRender,
    recordContent,
    recordError,
  } = useEditorPerformance()

  // Expose ref methods
  useImperativeHandle(ref, () => ({
    getContent: () => editorRef.current?.getContent() || '',
    setContent: (content: string) => editorRef.current?.setContent(content),
    focus: () => editorRef.current?.focus(),
    getCharacterCount: () => editorRef.current?.getCharacterCount() || 0,
    getUploadedImages: () => editorRef.current?.getUploadedImages?.() || [],
    clearUploadedImages: () => editorRef.current?.clearUploadedImages?.(),
  }), [])

  // Stable callback references - minimal dependencies
  const handleUpdateCallback = useCallback((content: string) => {
    try {
      onUpdate?.(content)
      
      // Record performance metrics only if monitoring is enabled
      if (enablePerformanceMonitoring && editorRef.current) {
        const images = editorRef.current.getUploadedImages?.() || []
        recordContent(content, [], [], images)
      }
    } catch (error) {
      if (enablePerformanceMonitoring) {
        recordError(error as Error, 'onUpdate')
      }
      console.error('TipTap onUpdate error:', error)
    }
  }, [onUpdate, enablePerformanceMonitoring]) // Removed unstable performance functions

  // Memoized callbacks with debouncing
  const debouncedOnUpdate = useDebouncedCallback(handleUpdateCallback, debounceMs)

  const memoizedOnKeyDown = useCallback((event: KeyboardEvent) => {
    try {
      if (!hasInteracted.current) {
        hasInteracted.current = true
        if (enablePerformanceMonitoring) {
          recordFirstInput()
        }
      }
      
      return onKeyDown?.(event) || false
    } catch (error) {
      if (enablePerformanceMonitoring) {
        recordError(error as Error, 'onKeyDown')
      }
      console.error('TipTap onKeyDown error:', error)
      return false
    }
  }, [onKeyDown, enablePerformanceMonitoring]) // Simplified dependencies

  const memoizedOnImageUpload = useCallback(async (file: File): Promise<string> => {
    if (!onImageUpload) {
      throw new Error('Image upload handler not provided')
    }

    try {
      const startTime = performance.now()
      const result = await onImageUpload(file)
      const duration = performance.now() - startTime
      
      // Log slow uploads
      if (duration > 3000) {
        console.warn(`Slow image upload: ${duration.toFixed(2)}ms`)
      }
      
      return result
    } catch (error) {
      if (enablePerformanceMonitoring) {
        recordError(error as Error, 'imageUpload')
      }
      throw error
    }
  }, [onImageUpload, recordError, enablePerformanceMonitoring])

  // Memoized editor props - simplified dependencies
  const editorProps = useMemo(() => ({
    placeholder,
    maxLength,
    className,
    onUpdate: debouncedOnUpdate,
    onKeyDown: memoizedOnKeyDown,
    onImageUpload: onImageUpload ? memoizedOnImageUpload : undefined,
    // Spread other props individually to avoid props object reference changes
    debounceMs,
    enableLazyLoading,
    preloadOnHover,
    optimizationLevel,
    enablePerformanceMonitoring,
  }), [
    placeholder,
    maxLength,
    className,
    debouncedOnUpdate,
    memoizedOnKeyDown,
    memoizedOnImageUpload,
    debounceMs,
    enableLazyLoading,
    preloadOnHover,
    optimizationLevel,
    enablePerformanceMonitoring,
  ])

  // Performance monitoring initialization - simplified dependencies
  useEffect(() => {
    if (enablePerformanceMonitoring) {
      startMonitoring()
      recordRender()
    }
  }, [enablePerformanceMonitoring]) // Only depend on the flag

  // Error handling
  const handleEditorError = useCallback((error: Error) => {
    if (enablePerformanceMonitoring) {
      recordError(error, 'editor-component')
    }
    console.error('TipTap Editor Error:', error)
  }, [recordError, enablePerformanceMonitoring])

  // Preload on hover for better UX
  const handleMouseEnter = useCallback(() => {
    if (preloadOnHover && enableLazyLoading) {
      import('./SafeTipTapEditor').catch(console.error)
    }
  }, [preloadOnHover, enableLazyLoading])

  // Intersection Observer for smart preloading
  useEffect(() => {
    if (!enableLazyLoading || !containerRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Preload when component comes into view
            import('./SafeTipTapEditor').catch(console.error)
            observer.disconnect()
          }
        })
      },
      { 
        threshold: optimizationLevel === 'aggressive' ? 0.1 : 0.3,
        rootMargin: optimizationLevel === 'aggressive' ? '100px' : '50px'
      }
    )

    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [enableLazyLoading, optimizationLevel])

  // Render the appropriate editor based on configuration
  const editorComponent = useMemo(() => {
    if (enableLazyLoading) {
      return (
        <LazyTipTapEditor
          ref={editorRef}
          preload={optimizationLevel === 'aggressive'}
          onEditorError={handleEditorError}
          {...editorProps}
        />
      )
    }

    // Direct import for when lazy loading is disabled
    const SafeTipTapEditor = require('./SafeTipTapEditor').default
    return (
      <SafeTipTapEditor
        ref={editorRef}
        onEditorError={handleEditorError}
        {...editorProps}
      />
    )
  }, [
    enableLazyLoading,
    optimizationLevel,
    handleEditorError,
    editorProps,
  ])

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      className="production-tiptap-editor"
      data-optimization-level={optimizationLevel}
      data-lazy-loading={enableLazyLoading}
      data-performance-monitoring={enablePerformanceMonitoring}
    >
      {editorComponent}
      
      {/* Development performance indicator */}
      {enablePerformanceMonitoring && process.env.NODE_ENV === 'development' && (
        <div className="absolute top-0 right-0 bg-green-500/20 text-green-400 px-2 py-1 text-xs rounded-bl">
          Monitored
        </div>
      )}
    </div>
  )
}))

ProductionTipTapEditor.displayName = 'ProductionTipTapEditor'

// Performance monitoring component for development
export const ProductionEditorMonitor = memo(() => {
  if (process.env.NODE_ENV !== 'development') return null

  const { getSummary } = useEditorPerformance()

  const handleShowMetrics = () => {
    const summary = getSummary()
    console.group('📊 TipTap Editor Performance Summary')
    console.table(summary)
    console.groupEnd()
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-3 rounded-lg shadow-lg">
      <div className="text-xs font-mono mb-2">Production TipTap Monitor</div>
      <button
        onClick={handleShowMetrics}
        className="text-xs bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded transition-colors"
      >
        Show Metrics
      </button>
    </div>
  )
})

ProductionEditorMonitor.displayName = 'ProductionEditorMonitor'

// Export with default optimized settings
export const OptimizedTipTapEditor = memo(forwardRef<TipTapEditorRef, Omit<ProductionTipTapEditorProps, 'optimizationLevel' | 'enableLazyLoading'>>((props, ref) => (
  <ProductionTipTapEditor
    ref={ref}
    optimizationLevel="aggressive"
    enableLazyLoading={true}
    preloadOnHover={true}
    {...props}
  />
)))

OptimizedTipTapEditor.displayName = 'OptimizedTipTapEditor'

export default ProductionTipTapEditor
export type { ProductionTipTapEditorProps }