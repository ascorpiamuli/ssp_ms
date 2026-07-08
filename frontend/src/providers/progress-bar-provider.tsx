'use client'

import { AppProgressBar as ProgressBar } from 'next-nprogress-bar'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ProgressBarProvider({ children }: { children: React.ReactNode }) {
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Get brand colors based on theme
  const getProgressBarColor = () => {
    if (!mounted) return '#1E3A8A' // Default

    const isDark = theme === 'dark' || resolvedTheme === 'dark'

    if (isDark) {
      // Dark mode gradient colors
      return '#8B3FD9' // Brand purple for dark mode
    }

    // Light mode gradient colors
    return '#1E3A8A' // Brand blue for light mode
  }

  // Custom CSS for advanced animations
  const customStyles = `
    /* Base progress bar styling */
    #nprogress {
      pointer-events: none;
      z-index: 9999;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
    }

    #nprogress .bar {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 3px;
      z-index: 9999;
      background: linear-gradient(
        90deg,
        var(--brand-blue, #1E3A8A) 0%,
        var(--brand-purple, #6B21A8) 50%,
        var(--brand-blue, #1E3A8A) 100%
      );
      background-size: 200% 100%;
      animation: nprogress-gradient-shift 1.5s ease infinite;
      box-shadow: 0 0 10px rgba(30, 58, 138, 0.5);
    }

    /* Dark mode gradient */
    .dark #nprogress .bar {
      background: linear-gradient(
        90deg,
        var(--brand-purple, #8B3FD9) 0%,
        var(--brand-blue, #2E4DA8) 50%,
        var(--brand-purple, #8B3FD9) 100%
      );
      background-size: 200% 100%;
      box-shadow: 0 0 10px rgba(139, 63, 217, 0.5);
    }

    /* Animated gradient shift */
    @keyframes nprogress-gradient-shift {
      0% {
        background-position: 0% 50%;
      }
      50% {
        background-position: 100% 50%;
      }
      100% {
        background-position: 0% 50%;
      }
    }

    /* Glowing effect on the bar */
    #nprogress .peg {
      display: block;
      position: absolute;
      right: 0;
      width: 100px;
      height: 100%;
      box-shadow: 0 0 10px currentColor, 0 0 5px currentColor;
      opacity: 1;
      transform: rotate(3deg) translate(0px, -4px);
    }

    /* Spinner styling */
    #nprogress .spinner {
      display: block;
      position: fixed;
      top: 15px;
      right: 15px;
      z-index: 9999;
    }

    #nprogress .spinner-icon {
      width: 18px;
      height: 18px;
      box-sizing: border-box;
      border: solid 2px transparent;
      border-top-color: var(--brand-blue, #1E3A8A);
      border-left-color: var(--brand-purple, #6B21A8);
      border-radius: 50%;
      animation: nprogress-spinner 400ms linear infinite;
    }

    .dark #nprogress .spinner-icon {
      border-top-color: var(--brand-purple, #8B3FD9);
      border-left-color: var(--brand-blue, #2E4DA8);
    }

    @keyframes nprogress-spinner {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }

    /* Pulse animation for the bar */
    @keyframes nprogress-pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.8;
      }
    }

    #nprogress .bar {
      animation:
        nprogress-gradient-shift 1.5s ease infinite,
        nprogress-pulse 2s ease-in-out infinite;
    }

    /* Reduce motion preference */
    @media (prefers-reduced-motion: reduce) {
      #nprogress .bar,
      #nprogress .spinner-icon {
        animation: none;
      }
    }
  `

  return (
    <>
      {/* Inject custom styles */}
      <style>{customStyles}</style>

      {children}

      <ProgressBar
        height="3px"
        color={getProgressBarColor()}
        options={{
          showSpinner: true,
          trickleSpeed: 200,
          minimum: 0.08,
          parent: 'body',
          easing: 'ease',
          speed: 500,
          trickle: true,
        }}
        shallowRouting
        disableSameURL
      />
    </>
  )
}
