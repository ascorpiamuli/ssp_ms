// src/components/ui/logo.tsx

import { cn } from '../../lib/utils'

interface LogoProps {
  className?: string
  showText?: boolean
  collapsed?: boolean
  companyLogo?: string | null
  variant?: 'default' | 'compact' | 'minimal'
}

export function Logo({
  className,
  showText = true,
  collapsed = false,
  companyLogo = null,
  variant = 'default'
}: LogoProps) {
  // Determine sizes based on variant and collapsed state
  const getSizes = () => {
    if (collapsed) {
      return {
        container: 'h-10 w-10',
        iconSize: 'text-base',
        padding: 'p-2'
      }
    }

    switch (variant) {
      case 'compact':
        return {
          container: 'h-10 w-10',
          iconSize: 'text-base',
          padding: 'p-2'
        }
      case 'minimal':
        return {
          container: 'h-8 w-8',
          iconSize: 'text-sm',
          padding: 'p-1.5'
        }
      default:
        return {
          container: 'h-11 w-11',
          iconSize: 'text-lg',
          padding: 'p-2.5'
        }
    }
  }

  const sizes = getSizes()

  // If company logo is provided, show it instead
  if (companyLogo) {
    return (
      <div className={cn(
        "flex items-center",
        className
      )}>
        <div className={cn(
          "flex-shrink-0 transition-all duration-300",
          collapsed ? "h-8 w-8" : "h-10 w-10"
        )}>
          <img
            src={companyLogo}
            alt="Company Logo"
            className={cn(
              "w-full h-full object-contain rounded-xl",
              "transition-all duration-300",
              "hover:scale-105"
            )}
          />
        </div>
        {!collapsed && showText && (
          <div className="ml-2.5 flex flex-col min-w-0">
            <span className="font-bold text-sm leading-tight text-gray-800 dark:text-white truncate">
              SSPMIS
            </span>
            <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 truncate">
              School Supplies
            </span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn(
      "flex items-center group",
      className
    )}>
      {/* Logo Icon */}
      <div className={cn(
        "relative flex-shrink-0 transition-all duration-300",
        sizes.container,
        "hover:scale-105 active:scale-95"
      )}>
        <div className={cn(
          "flex items-center justify-center rounded-xl",
          "w-full h-full",
          "bg-gradient-to-br from-blue-500 via-indigo-500 to-blue-600",
          "shadow-md shadow-blue-500/25",
          "transition-all duration-300",
          "group-hover:shadow-lg group-hover:shadow-blue-500/35",
          "group-hover:scale-105",
          sizes.padding
        )}>
          <span className={cn(
            "font-extrabold text-white",
            sizes.iconSize,
            "tracking-tight",
            "drop-shadow-sm"
          )}>
            S
          </span>
        </div>
      </div>

      {/* Text Section */}
      <div className={cn(
        "flex flex-col min-w-0 ml-2.5 transition-all duration-300",
        (!showText || collapsed) ? "hidden md:hidden" : "flex"
      )}>
        <span className={cn(
          "font-bold leading-tight tracking-tight",
          "text-gray-800 dark:text-white",
          variant === 'compact' ? "text-base" : "text-lg",
          "transition-all duration-300",
          "group-hover:text-blue-600 dark:group-hover:text-blue-400"
        )}>
          SSPMIS
        </span>
        <span className={cn(
          "text-[10px] font-medium tracking-wider uppercase",
          "text-gray-500 dark:text-gray-400",
          "transition-all duration-300",
          "group-hover:text-blue-500 dark:group-hover:text-blue-400"
        )}>
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
