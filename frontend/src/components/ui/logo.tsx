import { cn } from '../../lib/utils'

interface LogoProps {
  className?: string
  showText?: boolean
  collapsed?: boolean
  companyLogo?: string | null
}

export function Logo({
  className,
  showText = true,
  collapsed = false,
  companyLogo = null
}: LogoProps) {
  return (
    <div className={cn("flex items-center justify-center group", className)}>
      {/* Logo Icon - SSPMIS Text Badge */}
      <div className={cn(
        "relative flex-shrink-0 transition-all duration-300",
        "hover:scale-105 active:scale-95",
        collapsed ? "h-12 w-12" : "h-14 w-14"
      )}>
        <div className={cn(
          "flex items-center justify-center rounded-2xl",
          "w-full h-full",
          "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500",
          "shadow-lg shadow-indigo-500/30",
          "transition-all duration-300",
          "group-hover:shadow-xl group-hover:shadow-indigo-500/40",
          "group-hover:scale-105"
        )}>
          <span className={cn(
            "font-extrabold text-white",
            collapsed ? "text-lg" : "text-xl",
            "tracking-tight",
            "drop-shadow-sm"
          )}>
            S
          </span>
        </div>
      </div>

      {/* Text Section */}
      <div className={cn(
        "flex flex-col min-w-0 ml-3 transition-all duration-300",
        (!showText || collapsed) ? "hidden md:flex" : "flex"
      )}>
        <span className={cn(
          "font-extrabold text-2xl leading-tight tracking-tight",
          "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600",
          "bg-clip-text text-transparent",
          "dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400",
          "drop-shadow-sm",
          "transition-all duration-300",
          "group-hover:scale-105 group-hover:origin-left",
          "group-hover:from-indigo-700 group-hover:via-purple-700 group-hover:to-pink-700",
          "dark:group-hover:from-indigo-300 dark:group-hover:via-purple-300 dark:group-hover:to-pink-300"
        )}>
          SSPMIS
        </span>
        <span className={cn(
          "text-xs font-medium tracking-wider uppercase",
          "text-gray-500 dark:text-indigo-200",
          "transition-all duration-300",
          "group-hover:text-indigo-600 dark:group-hover:text-indigo-300"
        )}>
          School Supplies &amp; Purchases
        </span>
      </div>

      {/* Collapsed tooltip-like text */}
      {collapsed && (
        <div className="absolute left-full ml-4 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-50">
          <div className="bg-gray-900 dark:bg-gray-800 text-white text-sm font-medium px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap">
            SSPMIS
            <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 border-8 border-transparent border-r-gray-900 dark:border-r-gray-800" />
          </div>
        </div>
      )}
    </div>
  )
}
