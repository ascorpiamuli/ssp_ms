// src/components/ui/logo.tsx

"use client"

import { useState } from 'react'
import { cn } from '../../lib/utils'

interface LogoProps {
  className?: string
  showText?: boolean
  collapsed?: boolean
  companyLogo?: string | null
  variant?: 'default' | 'compact' | 'minimal'
}

// Default logo path - change this if your file is elsewhere
const DEFAULT_LOGO_SRC = '/images/logo.png'

export function Logo({
  className,
  showText = true,
  collapsed = false,
  companyLogo = null,
  variant = 'default'
}: LogoProps) {
  const [imageError, setImageError] = useState(false)
  const [companyImageError, setCompanyImageError] = useState(false)

  // Determine sizes based on variant and collapsed state
  const getSizes = () => {
    if (collapsed) {
      return {
        container: 'h-10 w-10',
        padding: 'p-1',
        textSize: 'text-base',
        subtitleSize: 'text-[10px]',
      }
    }

    switch (variant) {
      case 'compact':
        return {
          container: 'h-10 w-10',
          padding: 'p-1',
          textSize: 'text-base',
          subtitleSize: 'text-[10px]',
        }
      case 'minimal':
        return {
          container: 'h-8 w-8',
          padding: 'p-0.5',
          textSize: 'text-sm',
          subtitleSize: 'text-[9px]',
        }
      default:
        return {
          container: 'h-11 w-11',
          padding: 'p-1',
          textSize: 'text-lg',
          subtitleSize: 'text-[10px]',
        }
    }
  }

  const sizes = getSizes()

  // Determine which image to use (company logo takes priority)
  const logoSrc = companyLogo && !companyImageError ? companyLogo : DEFAULT_LOGO_SRC
  const currentImageError = companyLogo && !companyImageError ? companyImageError : imageError
  const handleImageError = () => {
    if (companyLogo && !companyImageError) {
      setCompanyImageError(true)
    } else {
      setImageError(true)
    }
  }

  return (
    <div
      className={cn(
        "flex items-center group relative",
        className
      )}
    >
      {/* Logo Image */}
      <div
        className={cn(
          "relative flex-shrink-0 transition-all duration-300",
          sizes.container,
          "hover:scale-105 active:scale-95"
        )}
      >
        {!currentImageError ? (
          <img
            src={logoSrc}
            alt="SSPMIS Logo"
            onError={handleImageError}
            className={cn(
              "w-full h-full object-contain",
              "rounded-xl",
              "transition-all duration-300",
              "drop-shadow-md group-hover:drop-shadow-lg",
              "group-hover:scale-105"
            )}
          />
        ) : (
          // Fallback if image fails to load
          <div
            className={cn(
              "flex items-center justify-center rounded-xl w-full h-full",
              "bg-gradient-to-br from-blue-500 via-indigo-500 to-blue-600",
              "shadow-md shadow-blue-500/25",
              "transition-all duration-300",
              "group-hover:shadow-lg group-hover:shadow-blue-500/35"
            )}
          >
            <span className="font-extrabold text-white text-sm tracking-tight drop-shadow-sm">
              S
            </span>
          </div>
        )}
      </div>

      {/* Text Section */}
      <div
        className={cn(
          "flex flex-col min-w-0 ml-2.5 transition-all duration-300",
          (!showText || collapsed) ? "hidden md:hidden" : "flex"
        )}
      >
        <span
          className={cn(
            "font-bold leading-tight tracking-tight",
            "text-gray-800 dark:text-white",
            sizes.textSize,
            "transition-all duration-300",
            "group-hover:text-blue-600 dark:group-hover:text-blue-400"
          )}
        >
          SSPMIS
        </span>
        <span
          className={cn(
            "font-medium tracking-wider uppercase",
            "text-gray-500 dark:text-gray-400",
            sizes.subtitleSize,
            "transition-all duration-300",
            "group-hover:text-blue-500 dark:group-hover:text-blue-400"
          )}
        >
          School Supplies
        </span>
      </div>

      {/* Tooltip for collapsed state */}
      {collapsed && (
        <div className="absolute left-full ml-3 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-50">
          <div className="bg-gray-900 dark:bg-gray-800 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg shadow-lg whitespace-nowrap">
            SSPMIS
            <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 border-8 border-transparent border-r-gray-900 dark:border-r-gray-800" />
          </div>
        </div>
      )}
    </div>
  )
}
