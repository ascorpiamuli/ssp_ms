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

  // Determine if we're on register page
  const isRegisterPage = pathname === '/register'

  // Responsive width classes based on page type
  const containerWidth = isRegisterPage
    ? 'w-full max-w-4xl lg:max-w-5xl xl:max-w-6xl'
    : 'w-full max-w-md sm:max-w-lg md:max-w-xl'

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8 overflow-hidden">
      <AccessibilityWidget />

      {/* ============================================
          BACKGROUND - Professional Blue/Navy Theme
          ============================================ */}
      <div className="absolute inset-0 z-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:from-slate-900 dark:via-blue-950/30 dark:to-indigo-950/40" />

        {/* Decorative geometric shapes - SSPMS style */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200/20 dark:bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-200/20 dark:bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-100/10 dark:bg-blue-400/5 rounded-full blur-3xl" />

        {/* Geometric grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] bg-[linear-gradient(rgba(37,99,235,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />

        {/* Wave SVG - Professional Blue with geometric style */}
        <svg
          className="absolute bottom-0 left-0 w-full h-64 md:h-96"
          preserveAspectRatio="none"
          viewBox="0 0 1440 320"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,165.3C1248,149,1344,107,1392,85.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            fill="url(#paint0_gradient)"
            fillOpacity="0.15"
          />
          <path
            d="M0,192L48,197.3C96,203,192,213,288,208C384,203,480,181,576,181.3C672,181,768,203,864,208C960,213,1056,203,1152,186.7C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            fill="url(#paint1_gradient)"
            fillOpacity="0.1"
          />
          <defs>
            <linearGradient id="paint0_gradient" x1="0" y1="0" x2="1440" y2="320" gradientUnits="userSpaceOnUse">
              <stop stopColor="#2563EB" />
              <stop offset="1" stopColor="#4F46E5" />
            </linearGradient>
            <linearGradient id="paint1_gradient" x1="0" y1="0" x2="1440" y2="320" gradientUnits="userSpaceOnUse">
              <stop stopColor="#1D4ED8" />
              <stop offset="1" stopColor="#4338CA" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* ============================================
          MAIN CONTAINER
          ============================================ */}
      <div className={`relative z-10 ${containerWidth} transform transition-all duration-500 ${!isRegisterPage && 'hover:scale-[1.01]'}`}>

        {/* ============================================
            LOGO SECTION
            ============================================ */}
        <div className={`text-center mb-6 sm:mb-8 ${isRegisterPage ? 'mb-4 sm:mb-6' : ''}`}>
          <div className="relative flex justify-center items-center mb-4 sm:mb-6">
            {/* Animated geometric rings */}
            <div className="absolute inset-0 flex justify-center items-center">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32">
                <div className="absolute inset-0 border-2 border-blue-500/40 dark:border-blue-400/50 rounded-lg animate-spin-slow" />
                <div className="absolute inset-2 border-2 border-blue-600/30 dark:border-blue-500/40 rounded-lg animate-spin-reverse-slow" />
                <div className="absolute inset-4 border-2 border-indigo-400/50 dark:border-indigo-300/60 rounded-lg animate-pulse" />
              </div>
            </div>

            {/* Logo with geometric border */}
            <div className="relative z-10 transform transition-all duration-300 hover:scale-110 hover:rotate-3">
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-white/90 dark:bg-slate-800/90 rounded-xl flex items-center justify-center backdrop-blur-sm shadow-xl border-2 border-blue-200/50 dark:border-blue-700/50">
                <Image
                  src="/images/logo.png"
                  alt="SSPMS Logo"
                  width={112}
                  height={112}
                  className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Welcome Text with geometric accent */}
          <div className="mt-2 sm:mt-4 space-y-1 sm:space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-700 dark:from-blue-400 dark:via-indigo-400 dark:to-blue-300 bg-clip-text text-transparent animate-slide-up">
              {isRegisterPage ? 'Create Your Account' : 'Welcome Back'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 animate-slide-up-delay px-4">
              {isRegisterPage
                ? 'Join SSPMS - Streamline school procurement management'
                : 'Access your school supplies & purchases dashboard'
              }
            </p>
          </div>

          {/* Geometric decorative dots */}
          <div className="flex justify-center gap-1.5 sm:gap-2 mt-3 sm:mt-4">
            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-blue-500/60 rounded-sm animate-bounce-geo" style={{ animationDelay: '0ms' }} />
            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-indigo-600/60 rounded-sm animate-bounce-geo" style={{ animationDelay: '150ms' }} />
            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-blue-400/60 rounded-sm animate-bounce-geo" style={{ animationDelay: '300ms' }} />
          </div>
        </div>

        {/* ============================================
            SYSTEM NOTICE - Professional
            ============================================ */}
        {true && (
          <div className="mb-6 animate-slide-up">
            <div className="bg-blue-50/80 dark:bg-blue-900/20 backdrop-blur-sm border-l-4 border-blue-500 dark:border-blue-400 rounded-lg p-3 sm:p-4">
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="flex-shrink-0">
                  <svg className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xs sm:text-sm font-semibold text-blue-800 dark:text-blue-400">
                    SSPMS - School Supplies & Purchases Management System
                  </h3>
                  <p className="text-[11px] sm:text-sm text-blue-700 dark:text-blue-300 mt-0.5 sm:mt-1">
                    Complete procurement lifecycle management - From requisition to payment
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================
            AUTH CARD - Geometric Style
            ============================================ */}
        <div className="relative group">
          {/* Animated geometric gradient border */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 animate-gradient-xy" />

          {/* Card content with geometric styling */}
          <div className={`relative bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-xl shadow-2xl border-2 border-blue-200/50 dark:border-blue-700/50 transform transition-all duration-300 hover:shadow-2xl ${isRegisterPage ? 'p-6 sm:p-8' : 'p-5 sm:p-6 md:p-8 lg:p-10'
            }`}>
            {/* Inner geometric glow effect */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-50/30 to-indigo-50/30 dark:from-blue-900/10 dark:to-indigo-900/10 pointer-events-none" />

            {/* Corner geometric accents */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-blue-400/20 dark:border-blue-400/10 rounded-tl-xl" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-blue-400/20 dark:border-blue-400/10 rounded-tr-xl" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-blue-400/20 dark:border-blue-400/10 rounded-bl-xl" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-blue-400/20 dark:border-blue-400/10 rounded-br-xl" />

            {/* Content */}
            <div className="relative">
              {children}
            </div>
          </div>
        </div>

        {/* ============================================
            FOOTER - Geometric Style
            ============================================ */}
        <div className={`mt-6 sm:mt-8 text-center transform transition-all duration-300 ${!isRegisterPage && 'hover:scale-105'}`}>
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="w-6 sm:w-8 h-0.5 bg-gradient-to-r from-transparent to-blue-400 dark:to-blue-600" />
            <span className="animate-pulse-slow text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              © {new Date().getFullYear()} SSPMS
            </span>
            <span className="w-6 sm:w-8 h-0.5 bg-gradient-to-l from-transparent to-blue-400 dark:to-blue-600" />
          </div>
          <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 tracking-wide uppercase">
            School Supplies & Purchases Management System
          </p>
          <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 mt-0.5 tracking-wider">
            v1.0.0 • Streamline • Transparent • Efficient
          </p>
        </div>
      </div>

      {/* ============================================
          CUSTOM ANIMATIONS - Geometric Style
          ============================================ */}
      <style jsx global>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes spin-reverse-slow {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }

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

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up-delay {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce-geo {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-6px) scale(1.2);
          }
        }

        .animate-spin-slow {
          animation: spin-slow 10s linear infinite;
        }

        .animate-spin-reverse-slow {
          animation: spin-reverse-slow 8s linear infinite;
        }

        .animate-gradient-xy {
          animation: gradient-xy 15s ease infinite;
        }

        .animate-slide-up {
          animation: slide-up 0.8s ease-out forwards;
        }

        .animate-slide-up-delay {
          animation: slide-up 0.8s ease-out 0.3s forwards;
          opacity: 0;
        }

        .animate-bounce-geo {
          animation: bounce-geo 1s ease-in-out infinite;
        }

        .animate-pulse-slow {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  )
}
