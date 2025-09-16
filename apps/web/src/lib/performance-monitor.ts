// Performance monitoring utilities for TipTap Editor

interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
  metadata?: Record<string, any>
}

interface EditorPerformanceData {
  initTime: number
  firstInputTime: number
  characterCount: number
  mentionCount: number
  hashtagCount: number
  imageCount: number
  renderCount: number
  errorCount: number
}

class EditorPerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private editorData: Partial<EditorPerformanceData> = {}
  private startTime: number | null = null
  private renderCount = 0

  // Initialize monitoring
  startMonitoring(editorId: string = 'default') {
    this.startTime = performance.now()
    this.editorData = {
      renderCount: 0,
      errorCount: 0,
      characterCount: 0,
      mentionCount: 0,
      hashtagCount: 0,
      imageCount: 0,
    }

    this.recordMetric('editor_init_start', this.startTime, {
      editorId,
      timestamp: new Date().toISOString(),
    })
  }

  // Record editor initialization complete
  recordEditorReady() {
    if (!this.startTime) return

    const initTime = performance.now() - this.startTime
    this.editorData.initTime = initTime

    this.recordMetric('editor_init_complete', initTime, {
      initTime,
      timestamp: new Date().toISOString(),
    })

    // Log if initialization is slow
    if (initTime > 1000) {
      console.warn(`TipTap Editor slow initialization: ${initTime.toFixed(2)}ms`)
    }
  }

  // Record first user interaction
  recordFirstInput() {
    if (!this.startTime || this.editorData.firstInputTime) return

    const firstInputTime = performance.now() - this.startTime
    this.editorData.firstInputTime = firstInputTime

    this.recordMetric('editor_first_input', firstInputTime, {
      firstInputTime,
      timestamp: new Date().toISOString(),
    })
  }

  // Record component re-renders
  recordRender() {
    this.renderCount++
    this.editorData.renderCount = this.renderCount

    // Log excessive re-renders
    if (this.renderCount > 50) {
      console.warn(`TipTap Editor excessive re-renders: ${this.renderCount}`)
      this.recordMetric('editor_excessive_renders', this.renderCount)
    }
  }

  // Record content metrics
  recordContentMetrics(content: string, mentions: string[], hashtags: string[], images: string[]) {
    this.editorData.characterCount = content.length
    this.editorData.mentionCount = mentions.length
    this.editorData.hashtagCount = hashtags.length
    this.editorData.imageCount = images.length

    this.recordMetric('editor_content_update', Date.now(), {
      characterCount: content.length,
      mentionCount: mentions.length,
      hashtagCount: hashtags.length,
      imageCount: images.length,
    })
  }

  // Record errors
  recordError(error: Error, context?: string) {
    this.editorData.errorCount = (this.editorData.errorCount || 0) + 1

    this.recordMetric('editor_error', Date.now(), {
      errorMessage: error.message,
      errorStack: error.stack,
      context,
      errorCount: this.editorData.errorCount,
    })

    console.error('TipTap Editor Error:', error, { context })
  }

  // Record API performance
  recordAPICall(endpoint: string, duration: number, success: boolean) {
    this.recordMetric('api_call', duration, {
      endpoint,
      duration,
      success,
      timestamp: new Date().toISOString(),
    })

    // Log slow API calls
    if (duration > 1000) {
      console.warn(`Slow API call to ${endpoint}: ${duration.toFixed(2)}ms`)
    }
  }

  // Generic metric recording
  private recordMetric(name: string, value: number, metadata?: Record<string, any>) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      metadata,
    }

    this.metrics.push(metric)

    // Keep only last 100 metrics to prevent memory leaks
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100)
    }

    // Development logging
    if (process.env.NODE_ENV === 'development') {
      console.debug(`Performance Metric [${name}]:`, value, metadata)
    }
  }

  // Get performance summary
  getSummary(): EditorPerformanceData & { metrics: PerformanceMetric[] } {
    return {
      ...this.editorData as EditorPerformanceData,
      metrics: [...this.metrics],
    }
  }

  // Send metrics to analytics service
  async sendMetrics() {
    if (this.metrics.length === 0) return

    const payload = {
      session: this.generateSessionId(),
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      editorData: this.editorData,
      metrics: this.metrics,
    }

    try {
      // In production, send to analytics service
      if (process.env.NODE_ENV === 'production') {
        // Example: await analytics.track('Editor Performance', payload)
        console.log('Performance metrics ready for analytics:', payload)
      } else {
        console.log('Development Performance Metrics:', payload)
      }
    } catch (error) {
      console.error('Failed to send performance metrics:', error)
    }
  }

  // Generate unique session ID
  private generateSessionId(): string {
    return `editor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Clear metrics
  reset() {
    this.metrics = []
    this.editorData = {}
    this.startTime = null
    this.renderCount = 0
  }
}

// Singleton instance
export const editorPerformanceMonitor = new EditorPerformanceMonitor()

// React hook for performance monitoring
export const useEditorPerformance = (editorId?: string) => {
  const monitor = editorPerformanceMonitor

  const startMonitoring = () => monitor.startMonitoring(editorId)
  const recordReady = () => monitor.recordEditorReady()
  const recordFirstInput = () => monitor.recordFirstInput()
  const recordRender = () => monitor.recordRender()
  const recordContent = (content: string, mentions: string[], hashtags: string[], images: string[]) =>
    monitor.recordContentMetrics(content, mentions, hashtags, images)
  const recordError = (error: Error, context?: string) => monitor.recordError(error, context)
  const recordAPI = (endpoint: string, duration: number, success: boolean) =>
    monitor.recordAPICall(endpoint, duration, success)
  const getSummary = () => monitor.getSummary()
  const sendMetrics = () => monitor.sendMetrics()

  return {
    startMonitoring,
    recordReady,
    recordFirstInput,
    recordRender,
    recordContent,
    recordError,
    recordAPI,
    getSummary,
    sendMetrics,
  }
}

// Web Vitals integration
export const measureWebVitals = () => {
  if (typeof window === 'undefined') return

  // Measure Core Web Vitals (optional dependency)
  // Only try to load web-vitals if it's available
  if (process.env.NODE_ENV === 'development') {
    console.log('web-vitals monitoring disabled - install web-vitals package to enable')
  }
  
  // Note: To enable web-vitals monitoring, install the package:
  // pnpm add web-vitals
  // Then uncomment the code below:
  /*
  try {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(console.log)
      getFID(console.log)
      getFCP(console.log)
      getLCP(console.log)
      getTTFB(console.log)
    }).catch(() => {
      console.log('web-vitals not available - Core Web Vitals monitoring disabled')
    })
  } catch (error) {
    console.log('web-vitals not available - Core Web Vitals monitoring disabled')
  }
  */
}

export default EditorPerformanceMonitor