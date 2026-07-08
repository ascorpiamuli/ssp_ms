'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  X, ChevronUp, Activity, Eye, Clock, Trash2,
  TrendingUp, Users, Loader2, AlertCircle,
  Zap, BarChart3, Network, Globe, Smartphone,
  Monitor, Chrome, Database, Timer, RefreshCw,
  Minimize2, Maximize2, Download, Filter
} from 'lucide-react'

interface AnalyticsEvent {
  id: string
  type: string
  data: any
  timestamp: Date
  pageUrl?: string
  performance?: {
    ttfb?: number
    fcp?: number
    lcp?: number
    cls?: number
    fid?: number
  }
}

interface PerformanceMetrics {
  ttfb: number | null
  fcp: number | null
  lcp: number | null
  cls: number | null
  fid: number | null
  sessionDuration: number
  pageViews: number
}

export function DevAnalyticsDashboard() {
  const [isOpen, setIsOpen] = useState(true)
  const [events, setEvents] = useState<AnalyticsEvent[]>([])
  const [isMinimized, setIsMinimized] = useState(false)
  const [activeTab, setActiveTab] = useState<'events' | 'metrics' | 'network'>('events')
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    ttfb: null,
    fcp: null,
    lcp: null,
    cls: null,
    fid: null,
    sessionDuration: 0,
    pageViews: 0
  })
  const [networkRequests, setNetworkRequests] = useState<any[]>([])
  const [sessionStart] = useState(Date.now())
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Track page views
  const [pageViews, setPageViews] = useState<Map<string, number>>(new Map())
  const [deviceInfo, setDeviceInfo] = useState({
    type: 'Desktop',
    browser: 'Unknown',
    os: 'Unknown',
    screenSize: 'Unknown'
  })

  // Check if mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Track device and browser info (client-side only)
  useEffect(() => {
    if (typeof window === 'undefined') return

    const ua = navigator.userAgent
    const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(ua)
    const isTablet = /iPad|Android(?!.*Mobile)/i.test(ua)
    const browser = /Chrome/.test(ua) ? 'Chrome' : /Firefox/.test(ua) ? 'Firefox' : /Safari/.test(ua) ? 'Safari' : 'Other'

    setDeviceInfo({
      type: isTablet ? 'Tablet' : isMobileDevice ? 'Mobile' : 'Desktop',
      browser,
      os: /Mac/i.test(ua) ? 'macOS' : /Win/i.test(ua) ? 'Windows' : /Linux/i.test(ua) ? 'Linux' : 'Other',
      screenSize: `${window.screen.width}x${window.screen.height}`
    })
  }, [])

  // Collect performance metrics
  const collectPerformanceMetrics = useCallback(() => {
    if (typeof window === 'undefined' || !('performance' in window)) return

    // Get navigation timing
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    if (navigation) {
      setPerformanceMetrics(prev => ({
        ...prev,
        ttfb: navigation.responseStart - navigation.requestStart,
        fcp: performance.getEntriesByType('paint').find(entry => entry.name === 'first-contentful-paint')?.startTime || null,
      }))
    }

    // Observe LCP
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      setPerformanceMetrics(prev => ({ ...prev, lcp: lastEntry.startTime }))
    })
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

    // Observe CLS
    let clsValue = 0
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value
        }
      }
      setPerformanceMetrics(prev => ({ ...prev, cls: clsValue }))
    })
    clsObserver.observe({ entryTypes: ['layout-shift'] })

    // Observe FID
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const firstEntry = entries[0] as PerformanceEventTiming
      if (firstEntry && firstEntry.processingStart) {
        setPerformanceMetrics(prev => ({ ...prev, fid: firstEntry.processingStart - firstEntry.startTime }))
      }
    })
    fidObserver.observe({ entryTypes: ['first-input'] })

    return () => {
      lcpObserver.disconnect()
      clsObserver.disconnect()
      fidObserver.disconnect()
    }
  }, [])

  useEffect(() => {
    setMounted(true)

    if (process.env.NODE_ENV !== 'development') return

    // Track page view
    const currentPath = window.location.pathname
    setPageViews(prev => {
      const newMap = new Map(prev)
      newMap.set(currentPath, (newMap.get(currentPath) || 0) + 1)
      return newMap
    })

    // Collect performance metrics
    const cleanup = collectPerformanceMetrics()

    // Update session duration
    const durationInterval = setInterval(() => {
      setPerformanceMetrics(prev => ({
        ...prev,
        sessionDuration: Math.floor((Date.now() - sessionStart) / 1000)
      }))
    }, 1000)

    // Intercept console.log for analytics
    const originalLog = console.log
    console.log = (...args) => {
      if (args[0]?.includes?.('[Analytics]') || args[0]?.includes?.('[Page View]')) {
        setEvents(prev => [{
          id: Date.now().toString(),
          type: 'log',
          data: args,
          timestamp: new Date(),
          pageUrl: window.location.pathname
        }, ...prev].slice(0, 100))
      }
      originalLog.apply(console, args)
    }

    // Listen for fetch events
    const originalFetch = window.fetch
    window.fetch = async (...args) => {
      const startTime = Date.now()
      const response = await originalFetch(...args)
      const endTime = Date.now()

      if (typeof args[0] === 'string') {
        const isAnalytics = args[0].includes('analytics') || args[0].includes('insights')

        setNetworkRequests(prev => [{
          id: Date.now().toString(),
          url: args[0],
          method: args[1]?.method || 'GET',
          duration: endTime - startTime,
          status: response.status,
          timestamp: new Date()
        }, ...prev].slice(0, 50))

        if (isAnalytics) {
          setEvents(prev => [{
            id: Date.now().toString(),
            type: 'api',
            data: { url: args[0], body: args[1]?.body, duration: endTime - startTime },
            timestamp: new Date(),
            pageUrl: window.location.pathname
          }, ...prev].slice(0, 100))
        }
      }

      return response
    }

    return () => {
      console.log = originalLog
      window.fetch = originalFetch
      cleanup?.()
      clearInterval(durationInterval)
    }
  }, [collectPerformanceMetrics, sessionStart])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
  }

  const exportData = () => {
    const data = {
      events,
      performanceMetrics,
      networkRequests,
      pageViews: Object.fromEntries(pageViews),
      deviceInfo,
      exportTime: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-data-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getMetricColor = (value: number | null, thresholds: { good: number, poor: number }) => {
    if (!value) return 'text-gray-400'
    if (value < thresholds.good) return 'text-green-600 dark:text-green-400'
    if (value < thresholds.poor) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  // Don't render during SSR
  if (!mounted) return null

  // Responsive sizing
  const getDashboardWidth = () => {
    if (isFullScreen) return 'inset-0 w-auto h-auto rounded-none'
    if (isMinimized) return isMobile ? 'w-[calc(100vw-32px)]' : 'w-96'
    return isMobile ? 'w-[calc(100vw-32px)]' : 'w-[480px]'
  }

  const getMaxHeight = () => {
    if (isFullScreen) return 'h-[calc(100vh-0px)]'
    return isMobile ? 'max-h-[70vh]' : 'max-h-[80vh]'
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 bg-gradient-to-r from-brand-blue to-brand-purple text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
      >
        <Activity size={isMobile ? 16 : 20} />
      </button>
    )
  }

  return (
    <div className={`fixed ${isFullScreen ? 'inset-0' : 'bottom-4 right-4'} z-50 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 transition-all ${getDashboardWidth()} ${getMaxHeight()} flex flex-col`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 rounded-t-lg">
        <div className="flex items-center gap-2 min-w-0">
          <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-brand-blue dark:text-brand-purple flex-shrink-0" />
          <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white truncate">
            Analytics Dashboard
          </h3>
          <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-0.5 rounded-full animate-pulse flex-shrink-0">
            Live
          </span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={exportData}
            className="p-1.5 hover:bg-white/50 dark:hover:bg-gray-700 rounded transition-colors"
            title="Export data"
          >
            <Download className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="p-1.5 hover:bg-white/50 dark:hover:bg-gray-700 rounded transition-colors"
          >
            {isFullScreen ? <Minimize2 className="w-3 h-3 sm:w-4 sm:h-4" /> : <Maximize2 className="w-3 h-3 sm:w-4 sm:h-4" />}
          </button>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 hover:bg-white/50 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <ChevronUp className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${isMinimized ? 'rotate-180' : ''}`} />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 hover:bg-white/50 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <X className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Tabs - Responsive */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
            {[
              { id: 'events', label: 'Events', icon: Activity },
              { id: 'metrics', label: 'Metrics', icon: TrendingUp },
              { id: 'network', label: 'Network', icon: Network }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
                    ? 'text-brand-blue dark:text-brand-purple border-b-2 border-brand-blue dark:border-brand-purple bg-blue-50/50 dark:bg-gray-700/50'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
              >
                <tab.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.charAt(0)}</span>
              </button>
            ))}
          </div>

          {/* Content - Responsive scrolling */}
          <div className="flex-1 overflow-auto p-2 sm:p-3">
            {activeTab === 'events' && (
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 py-2 z-10">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Eye className="w-3 h-3" />
                    <span>{events.length} events</span>
                  </div>
                  <button
                    onClick={() => setEvents([])}
                    className="text-red-600 hover:text-red-700 flex items-center gap-1 text-xs"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span className="hidden sm:inline">Clear all</span>
                  </button>
                </div>

                {events.length === 0 ? (
                  <div className="text-center py-8 sm:py-12 text-gray-500 text-sm">
                    <Activity className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 opacity-30" />
                    <p>No analytics events yet</p>
                    <p className="text-xs mt-1">Navigate to see events</p>
                  </div>
                ) : (
                  events.map((event) => (
                    <div key={event.id} className="text-xs border-l-2 border-blue-500 pl-2 sm:pl-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors">
                      <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2 flex-wrap">
                        <Clock className="w-2 h-2 sm:w-3 sm:h-3 text-gray-400" />
                        <span className="text-gray-500 text-[10px] sm:text-xs">
                          {event.timestamp.toLocaleTimeString()}
                        </span>
                        {event.pageUrl && (
                          <span className="text-gray-400 text-[10px] sm:text-xs truncate max-w-[100px] sm:max-w-[150px]">
                            {event.pageUrl}
                          </span>
                        )}
                        <span className={`px-1 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs ${event.type === 'api'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                          }`}>
                          {event.type}
                        </span>
                      </div>
                      <pre className="text-gray-700 dark:text-gray-300 overflow-x-auto text-[10px] sm:text-xs bg-gray-50 dark:bg-gray-900 p-1 sm:p-2 rounded">
                        {JSON.stringify(event.data, null, 2)}
                      </pre>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'metrics' && (
              <div className="space-y-3 sm:space-y-4">
                {/* Device Info */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-2 sm:p-3 rounded-lg">
                  <h4 className="text-xs sm:text-sm font-semibold mb-2 flex items-center gap-2">
                    <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
                    Device Info
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 text-[10px] sm:text-xs">
                    <div className="flex items-center gap-2">
                      {deviceInfo.type === 'Mobile' ? <Smartphone className="w-3 h-3" /> : <Monitor className="w-3 h-3" />}
                      <span className="truncate">{deviceInfo.type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Chrome className="w-3 h-3" />
                      <span className="truncate">{deviceInfo.browser}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Database className="w-3 h-3" />
                      <span className="truncate">{deviceInfo.os}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Monitor className="w-3 h-3" />
                      <span className="truncate">{deviceInfo.screenSize}</span>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="space-y-2">
                  <h4 className="text-xs sm:text-sm font-semibold flex items-center gap-2">
                    <Timer className="w-3 h-3 sm:w-4 sm:h-4" />
                    Core Web Vitals
                  </h4>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded">
                      <div className="text-[10px] sm:text-xs text-gray-500">TTFB</div>
                      <div className={`text-sm sm:text-lg font-bold ${getMetricColor(performanceMetrics.ttfb, { good: 200, poor: 500 })}`}>
                        {performanceMetrics.ttfb ? `${performanceMetrics.ttfb.toFixed(0)}ms` : '—'}
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded">
                      <div className="text-[10px] sm:text-xs text-gray-500">FCP</div>
                      <div className={`text-sm sm:text-lg font-bold ${getMetricColor(performanceMetrics.fcp, { good: 1800, poor: 3000 })}`}>
                        {performanceMetrics.fcp ? `${performanceMetrics.fcp.toFixed(0)}ms` : '—'}
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded">
                      <div className="text-[10px] sm:text-xs text-gray-500">LCP</div>
                      <div className={`text-sm sm:text-lg font-bold ${getMetricColor(performanceMetrics.lcp, { good: 2500, poor: 4000 })}`}>
                        {performanceMetrics.lcp ? `${performanceMetrics.lcp.toFixed(0)}ms` : '—'}
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded">
                      <div className="text-[10px] sm:text-xs text-gray-500">CLS</div>
                      <div className={`text-sm sm:text-lg font-bold ${getMetricColor(performanceMetrics.cls, { good: 0.1, poor: 0.25 })}`}>
                        {performanceMetrics.cls ? performanceMetrics.cls.toFixed(3) : '—'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Session Stats */}
                <div className="space-y-2">
                  <h4 className="text-xs sm:text-sm font-semibold flex items-center gap-2">
                    <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                    Session Stats
                  </h4>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded">
                      <div className="text-[10px] sm:text-xs text-gray-500">Duration</div>
                      <div className="text-sm sm:text-lg font-bold text-brand-blue dark:text-brand-purple">
                        {formatDuration(performanceMetrics.sessionDuration)}
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded">
                      <div className="text-[10px] sm:text-xs text-gray-500">Views</div>
                      <div className="text-sm sm:text-lg font-bold text-brand-blue dark:text-brand-purple">
                        {pageViews.size}
                      </div>
                    </div>
                  </div>

                  {/* Top Pages */}
                  {pageViews.size > 0 && (
                    <div className="mt-2">
                      <div className="text-[10px] sm:text-xs text-gray-500 mb-2">Top Pages</div>
                      <div className="space-y-1">
                        {Array.from(pageViews.entries()).slice(0, 3).map(([path, count]) => (
                          <div key={path} className="flex justify-between text-[10px] sm:text-xs">
                            <span className="truncate flex-1 mr-2">{path || '/'}</span>
                            <span className="font-semibold flex-shrink-0">{count} views</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'network' && (
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 py-2">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Network className="w-3 h-3" />
                    <span>{networkRequests.length} requests</span>
                  </div>
                  <button
                    onClick={() => setNetworkRequests([])}
                    className="text-red-600 hover:text-red-700 text-[10px] sm:text-xs"
                  >
                    Clear
                  </button>
                </div>

                {networkRequests.length === 0 ? (
                  <div className="text-center py-8 sm:py-12 text-gray-500 text-sm">
                    <Zap className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 opacity-30" />
                    <p>No network requests</p>
                  </div>
                ) : (
                  networkRequests.map((req) => (
                    <div key={req.id} className="text-[10px] sm:text-xs border-l-2 border-purple-500 pl-2 sm:pl-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                      <div className="flex items-center justify-between mb-1 flex-wrap gap-1">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <span className={`px-1 sm:px-1.5 py-0.5 rounded text-[9px] sm:text-xs font-mono ${req.status < 300 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                              req.status < 400 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                            }`}>
                            {req.status}
                          </span>
                          <span className="font-mono font-semibold">{req.method}</span>
                        </div>
                        <span className="text-gray-500">{req.duration}ms</span>
                      </div>
                      <div className="text-gray-600 dark:text-gray-400 truncate text-[9px] sm:text-xs">
                        {req.url}
                      </div>
                      <div className="text-gray-400 text-[9px] sm:text-xs mt-1">
                        {req.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Footer Stats - Responsive */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-2 bg-gray-50 dark:bg-gray-900 rounded-b-lg">
            <div className="flex justify-between text-[9px] sm:text-xs text-gray-600 dark:text-gray-400">
              <span>📊 Real-time</span>
              <span>🔄 Auto</span>
              <span>📱 Mobile</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
