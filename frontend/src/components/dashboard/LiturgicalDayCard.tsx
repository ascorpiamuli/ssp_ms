'use client'

import { memo, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Church, Cross, CalendarDays, Activity } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

// Helper function to get liturgical color hex
const getLiturgicalColorHex = (color: string | null | undefined): string => {
  const colors: Record<string, string> = {
    'Green': '#10B981',
    'White': '#ececec',
    'Red': '#EF4444',
    'Purple': '#8B5CF6',
    'Violet': '#8B5CF6',
    'Rose': '#EC4899',
    'Gold': '#F59E0B',
    'Black': '#1F2937',
  }
  return colors[color || 'Green'] || '#10B981'
}

interface LiturgicalDayCardProps {
  event: any
  loading?: boolean
  className?: string
  showDate?: boolean
}

// Custom comparison function for memo to prevent unnecessary re-renders
const arePropsEqual = (prev: LiturgicalDayCardProps, next: LiturgicalDayCardProps) => {
  // Always update if loading state changes
  if (prev.loading !== next.loading) return false

  // If still loading, no need to check event data
  if (prev.loading) return true

  // If both events are null/undefined
  if (!prev.event && !next.event) return true

  // If one is null/undefined and the other isn't
  if (!prev.event || !next.event) return false

  // Only re-render if important fields actually changed
  return (
    prev.event.id === next.event.id &&
    prev.event.title === next.event.title &&
    prev.event.description === next.event.description &&
    prev.event.liturgical_color === next.event.liturgical_color &&
    prev.event.liturgical_season === next.event.liturgical_season &&
    prev.event.rank === next.event.rank &&
    prev.className === next.className &&
    prev.showDate === next.showDate
  )
}

// Helper function to check if color is light
const isLightColor = (hex: string): boolean => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.7
}

export const LiturgicalDayCard = memo(({
  event,
  loading = false,
  className = '',
  showDate = true
}: LiturgicalDayCardProps) => {

  // Loading skeleton
  if (loading) {
    return (
      <div className={`rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 bg-gray-100 dark:bg-gray-800 animate-pulse ${className}`}>
        <div className="h-5 w-36 sm:h-6 sm:w-48 bg-gray-200 dark:bg-gray-700 rounded mb-2 sm:mb-3" />
        <div className="h-3 w-24 sm:h-4 sm:w-32 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    )
  }

  // No event available
  if (!event) {
    return (
      <div className={`rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 bg-gray-100 dark:bg-gray-800 ${className}`}>
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <CalendarDays className="h-5 w-5" />
          <span className="text-sm">No liturgical event for today</span>
        </div>
      </div>
    )
  }

  // Calculate colors based on liturgical color
  const liturgicalColor = getLiturgicalColorHex(event.liturgical_color)
  const isLight = isLightColor(liturgicalColor)

  const textColor = isLight ? 'text-gray-900' : 'text-white'
  const mutedTextColor = isLight ? 'text-gray-600' : 'text-white/75'
  const badgeBgClass = isLight
    ? 'bg-white/80 text-gray-700 border-gray-200'
    : 'bg-white/20 text-white border-white/30'
  const iconBgClass = isLight
    ? 'bg-white/60 text-gray-700'
    : 'bg-white/20 text-white'
  const decorativeOpacity = isLight ? 'opacity-5' : 'opacity-10'

  // Format today's date
  const todayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`rounded-xl sm:rounded-2xl overflow-hidden shadow-lg border-0 ${className}`}
      style={{ backgroundColor: liturgicalColor }}
    >
      <div className="relative p-3 sm:p-5 md:p-7">
        {/* Decorative Church icon - hidden on very small screens */}
        <div className={`absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 ${decorativeOpacity} hidden sm:block`}>
          <Church className="w-full h-full" />
        </div>

        {/* Decorative cross - hidden on mobile */}
        <div className={`absolute bottom-2 left-2 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 ${decorativeOpacity} hidden sm:block`}>
          <Cross className="w-full h-full" />
        </div>

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className={`p-1.5 sm:p-2 md:p-2.5 rounded-lg sm:rounded-xl ${iconBgClass} backdrop-blur-sm shadow-sm shrink-0`}>
                <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className={`text-sm sm:text-lg md:text-2xl font-bold ${textColor} tracking-tight truncate sm:whitespace-normal`}>
                  {event.title}
                </h3>
                <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-1">
                  {event.liturgical_season && (
                    <Badge className={`${badgeBgClass} border text-[8px] sm:text-[10px] md:text-xs font-medium backdrop-blur-sm px-1.5 py-0.5 sm:px-2 sm:py-0.5`}>
                      {event.liturgical_season}
                    </Badge>
                  )}
                  {event.rank && (
                    <Badge variant="outline" className={`border-current ${mutedTextColor} text-[8px] sm:text-[10px] md:text-xs backdrop-blur-sm px-1.5 py-0.5 sm:px-2 sm:py-0.5`}>
                      {event.rank}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className={`flex items-center gap-1.5 sm:gap-2 ${mutedTextColor} text-[10px] sm:text-xs md:text-sm shrink-0`}>
              <Activity className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
              <span className="text-[9px] sm:text-xs md:text-sm whitespace-nowrap">Liturgical Day</span>
            </div>
          </div>

          {event.description && (
            <div className="mt-2 sm:mt-4 md:mt-5">
              <div className={`w-8 sm:w-10 md:w-12 h-0.5 ${isLight ? 'bg-gray-400/40' : 'bg-white/30'} rounded-full mb-2 sm:mb-3`} />
              <p className={`${textColor} text-xs sm:text-sm md:text-base leading-relaxed max-w-3xl opacity-90 line-clamp-3 sm:line-clamp-none`}>
                {event.description}
              </p>
            </div>
          )}

          {/* Subtle footer with optional date */}
          {showDate && (
            <div className={`mt-2 sm:mt-4 md:mt-5 pt-2 sm:pt-3 ${isLight ? 'border-t border-gray-400/20' : 'border-t border-white/20'}`}>
              <div className={`flex flex-wrap items-center gap-1.5 sm:gap-2 ${mutedTextColor} text-[8px] sm:text-[10px] md:text-xs`}>
                <Church className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                <span>Today's Liturgical Celebration</span>
                <span className="w-0.5 h-0.5 rounded-full bg-current hidden xs:inline-block" />
                <span className="hidden xs:inline-block">
                  {todayDate}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}, arePropsEqual)

LiturgicalDayCard.displayName = 'LiturgicalDayCard'
