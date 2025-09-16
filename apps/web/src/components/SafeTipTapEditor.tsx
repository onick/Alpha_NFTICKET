'use client'

import React, { forwardRef, useCallback } from 'react'
import { TipTapErrorBoundary } from './ErrorBoundary'
import TipTapEditor, { TipTapEditorRef } from './TipTapEditor'
import type { TipTapEditorProps } from './TipTapEditor'

interface SafeTipTapEditorProps extends TipTapEditorProps {
  onEditorError?: (error: Error) => void
}

const SafeTipTapEditor = forwardRef<TipTapEditorRef, SafeTipTapEditorProps>(
  ({ onEditorError, ...props }, ref) => {
    const handleEditorError = useCallback((error: Error) => {
      // Log specific TipTap errors
      console.error('TipTap Editor Error Details:', {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        props: {
          placeholder: props.placeholder,
          maxLength: props.maxLength,
          hasImageUpload: !!props.onImageUpload,
        }
      })

      // Call custom error handler
      onEditorError?.(error)

      // Analytics/monitoring integration
      if (typeof window !== 'undefined') {
        // Track editor errors for monitoring
        try {
          // Example: analytics.track('TipTap Editor Error', { error: error.message })
          console.warn('TipTap Error tracked for monitoring')
        } catch (trackingError) {
          console.error('Error tracking failed:', trackingError)
        }
      }
    }, [onEditorError, props.placeholder, props.maxLength, props.onImageUpload])

    return (
      <TipTapErrorBoundary onEditorError={handleEditorError}>
        <TipTapEditor ref={ref} {...props} />
      </TipTapErrorBoundary>
    )
  }
)

SafeTipTapEditor.displayName = 'SafeTipTapEditor'

export default SafeTipTapEditor
export type { SafeTipTapEditorProps }