// app/(auth)/AuthLayoutClient.tsx

'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import AccessibilityWidget from '../../components/accessibility-widget'

export default function AuthLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  const isRegisterPage = pathname === '/register'
  const containerWidth = isRegisterPage
    ? 'w-full max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-2xl'
    : 'w-full max-w-md sm:max-w-md md:max-w-md'

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-8 sm:px-6 lg:px-8 overflow-hidden">
      <AccessibilityWidget />

      {/* ============================================
          CLEAN WHITE BACKGROUND WITH ANIMATIONS
          ============================================ */}
      <div className="absolute inset-0 z-0">
        {/* Base white */}
        <div className="absolute inset-0 bg-white dark:bg-slate-950" />

        {/* Animated gradient mesh */}
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/80 via-white to-indigo-50/80 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 animate-gradient-xy" />

        {/* Animated grid/netted pattern */}
        <div className="absolute inset-0 opacity-[0.4] dark:opacity-[0.15]">
          <svg className="absolute inset-0 w-full h-full animate-grid-pulse">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#3B82F6" strokeWidth="0.5" className="animate-grid-draw" />
              </pattern>
              <pattern id="dot-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="2" fill="#3B82F6" className="animate-dot-pulse" />
                <circle cx="32" cy="32" r="1.5" fill="#6366F1" className="animate-dot-pulse-delay" />
                <circle cx="62" cy="62" r="1" fill="#8B5CF6" className="animate-dot-pulse-slow" />
              </pattern>
              <linearGradient id="gradient-mesh" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.05">
                  <animate attributeName="stopOpacity" values="0.05;0.08;0.05" dur="4s" repeatCount="indefinite" />
                </stop>
                <stop offset="50%" stopColor="#6366F1" stopOpacity="0.03">
                  <animate attributeName="stopOpacity" values="0.03;0.06;0.03" dur="5s" repeatCount="indefinite" />
                </stop>
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.05">
                  <animate attributeName="stopOpacity" values="0.05;0.08;0.05" dur="4.5s" repeatCount="indefinite" />
                </stop>
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            <rect width="100%" height="100%" fill="url(#dot-grid)" />
            <rect width="100%" height="100%" fill="url(#gradient-mesh)" />
          </svg>
        </div>

        {/* Floating geometric shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 right-10 w-64 h-64 bg-blue-100/30 dark:bg-blue-500/5 rounded-full blur-2xl animate-float-slow" />
          <div className="absolute bottom-10 left-10 w-48 h-48 bg-indigo-100/30 dark:bg-indigo-500/5 rounded-full blur-2xl animate-float-slower" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-50/20 dark:bg-purple-500/5 rounded-full blur-3xl animate-pulse-glow" />
        </div>

        {/* Clean wave at bottom */}
        <svg
          className="absolute bottom-0 left-0 w-full h-32 md:h-40"
          preserveAspectRatio="none"
          viewBox="0 0 1440 320"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,192L48,197.3C96,203,192,213,288,208C384,203,480,181,576,181.3C672,181,768,203,864,208C960,213,1056,203,1152,186.7C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            fill="#3B82F6"
            fillOpacity="0.04"
          />
          <path
            d="M0,256L48,261.3C96,267,192,277,288,272C384,267,480,245,576,245.3C672,245,768,267,864,272C960,277,1056,267,1152,250.7C1248,235,1344,213,1392,202.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            fill="#6366F1"
            fillOpacity="0.03"
          />
        </svg>
      </div>

      {/* ============================================
          MAIN CONTAINER
          ============================================ */}
      <div className={`relative z-10 ${containerWidth}`}>

        {/* ============================================
            LOGO SECTION
            ============================================ */}
        <div className={`text-center ${isRegisterPage ? 'mb-1' : 'mb-1'}`}>
          <div className="flex justify-center items-center ">
            <div className="relative">
              {/* Logo with subtle glow */}
              <Image
                src="/images/pasbest-logo.png"
                alt="PASBEST VENTURES - Transforming Ideas Into Digital Reality"
                width={280}
                height={180}
                className="w-44 h-44 sm:w-56 sm:h-56 md:w-72 md:h-72 object-contain drop-shadow-2xl"
                priority
              />
            </div>
          </div>

          {/* Welcome Text */}
          <div className="space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {isRegisterPage ? 'Create Your Account' : 'Welcome Back'}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 px-4">
              {isRegisterPage
                ? 'Join SSPMS - Streamline school procurement management'
                : 'Access your school supplies & purchases dashboard'
              }
            </p>
            <div className="flex items-center justify-center gap-3 text-xs sm:text-sm text-blue-600 dark:text-blue-400 pt-2">
              <span className="w-10 h-px bg-gradient-to-r from-transparent to-blue-400" />
              <span className="font-medium tracking-widest uppercase">PASBEST VENTURES</span>
              <span className="w-10 h-px bg-gradient-to-l from-transparent to-blue-400" />
            </div>
          </div>
        </div>

        {/* ============================================
            AUTH CARD
            ============================================ */}
        <div className="relative">
          {/* Card shadow */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 rounded-xl blur" />

          {/* Card */}
          <div className={`relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-xl shadow-2xl border border-blue-100/50 dark:border-blue-900/30 ${isRegisterPage
            ? 'p-6 sm:p-8 md:p-10'
            : 'p-8 sm:p-10 md:p-12'
            }`}>
            {/* Inner subtle gradient */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-50/30 to-indigo-50/30 dark:from-blue-900/5 dark:to-indigo-900/5 pointer-events-none" />

            {/* Content */}
            <div className="relative">
              {children}
            </div>
          </div>
        </div>

        {/* ============================================
            FOOTER
            ============================================ */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="w-8 h-px bg-gradient-to-r from-transparent to-blue-400/50" />
            <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              © {new Date().getFullYear()} SSPMS
            </span>
            <span className="w-8 h-px bg-gradient-to-l from-transparent to-blue-400/50" />
          </div>
          <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 tracking-[0.15em] uppercase">
            PASBEST VENTURES • Transforming Ideas Into Digital Reality
          </p>
          <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 mt-1 tracking-wider">
            SSPMS v1.0.0 • Streamline • Transparent • Efficient
          </p>
        </div>
      </div>

      {/* ============================================
          CUSTOM ANIMATIONS
          ============================================ */}
      <style jsx global>{`
        @keyframes gradient-xy {
          0%, 100% {
            background-size: 400% 400%;
            background-position: left top;
          }
          25% {
            background-size: 400% 400%;
            background-position: right top;
          }
          50% {
            background-size: 400% 400%;
            background-position: right bottom;
          }
          75% {
            background-size: 400% 400%;
            background-position: left bottom;
          }
        }

        @keyframes grid-draw {
          0% { stroke-dashoffset: 80; opacity: 0.3; }
          50% { stroke-dashoffset: 0; opacity: 0.8; }
          100% { stroke-dashoffset: 80; opacity: 0.3; }
        }

        @keyframes dot-pulse {
          0%, 100% { r: 2; opacity: 0.3; }
          50% { r: 3; opacity: 0.8; }
        }

        @keyframes dot-pulse-delay {
          0%, 100% { r: 1.5; opacity: 0.2; }
          50% { r: 2.5; opacity: 0.7; }
        }

        @keyframes dot-pulse-slow {
          0%, 100% { r: 1; opacity: 0.15; }
          50% { r: 2; opacity: 0.6; }
        }

        @keyframes grid-pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.6; }
        }

        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -20px) scale(1.05); }
        }

        @keyframes float-slower {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-20px, 15px) scale(1.05); }
        }

        @keyframes pulse-glow {
          0%, 100% { opacity: 0.3; transform: scale(0.95); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }

        .animate-gradient-xy {
          animation: gradient-xy 15s ease infinite;
        }

        .animate-grid-pulse {
          animation: grid-pulse 4s ease-in-out infinite;
        }

        .animate-grid-draw {
          stroke-dasharray: 80;
          animation: grid-draw 3s ease-in-out infinite;
        }

        .animate-dot-pulse {
          animation: dot-pulse 2s ease-in-out infinite;
        }

        .animate-dot-pulse-delay {
          animation: dot-pulse-delay 2.5s ease-in-out infinite 0.5s;
        }

        .animate-dot-pulse-slow {
          animation: dot-pulse-slow 3s ease-in-out infinite 1s;
        }

        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }

        .animate-float-slower {
          animation: float-slower 10s ease-in-out infinite;
        }

        .animate-pulse-glow {
          animation: pulse-glow 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
