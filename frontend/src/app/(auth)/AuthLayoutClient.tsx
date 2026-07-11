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
    ? 'w-full max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-2xl'
    : 'w-full max-w-md sm:max-w-md md:max-w-md'

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

        {/* Floating particles background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-blue-400/20 dark:bg-blue-300/10 animate-float-particle"
              style={{
                width: Math.random() * 6 + 2 + 'px',
                height: Math.random() * 6 + 2 + 'px',
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
                animationDelay: Math.random() * 10 + 's',
                animationDuration: Math.random() * 15 + 10 + 's',
              }}
            />
          ))}
        </div>
      </div>

      {/* ============================================
          MAIN CONTAINER - Responsive width
          ============================================ */}
      <div className={`relative z-10 ${containerWidth}`}>

        {/* ============================================
            LOGO SECTION - With Beautiful Animations
            ============================================ */}
        <div className={`text-center ${isRegisterPage ? 'mb-2 sm:mb-3' : 'mb-2 sm:mb-3'}`}>
          <div className="relative flex justify-center items-center mb-2 sm:mb-3">
            {/* Glow effect behind logo */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 bg-blue-500/10 dark:bg-blue-400/5 rounded-full blur-3xl animate-pulse-glow" />
            </div>

            {/* Rotating rings around logo */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56">
                <div className="absolute inset-0 border-2 border-blue-400/20 dark:border-blue-400/10 rounded-full animate-spin-slow" />
                <div className="absolute inset-2 border-2 border-dashed border-indigo-400/15 dark:border-indigo-400/10 rounded-full animate-spin-reverse-slow" />
                <div className="absolute inset-4 border border-blue-400/10 dark:border-blue-400/5 rounded-full animate-pulse-ring" />
              </div>
            </div>

            {/* Logo with animations */}
            <div className="relative group">
              <div className="relative animate-float-logo">
                <Image
                  src="/images/logo.png"
                  alt="SSPMS Logo - Transforming Ideas Into Digital Reality"
                  width={220}
                  height={150}
                  className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 object-contain drop-shadow-2xl transition-all duration-700 group-hover:scale-110 group-hover:rotate-2"
                  priority
                />
                {/* Glow ring on hover */}
                <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-blue-500/20 rounded-full blur-xl" />
                </div>
              </div>

              {/* Floating sparkles around logo */}
              <div className="absolute -top-4 -right-4 animate-float-particle-delayed">
                <div className="w-2 h-2 bg-yellow-400/60 dark:bg-yellow-300/40 rounded-full shadow-lg shadow-yellow-400/30" />
              </div>
              <div className="absolute -bottom-3 -left-3 animate-float-particle-slow">
                <div className="w-2 h-2 bg-blue-400/60 dark:bg-blue-300/40 rounded-full shadow-lg shadow-blue-400/30" />
              </div>
              <div className="absolute top-1/2 -right-6 animate-float-particle-medium">
                <div className="w-1.5 h-1.5 bg-indigo-400/60 dark:bg-indigo-300/40 rounded-full shadow-lg shadow-indigo-400/30" />
              </div>
              <div className="absolute top-1/3 -left-5 animate-float-particle-slower">
                <div className="w-1.5 h-1.5 bg-purple-400/60 dark:bg-purple-300/40 rounded-full shadow-lg shadow-purple-400/30" />
              </div>
            </div>
          </div>

          {/* Welcome Text with fade animation */}
          <div className="space-y-0.5 sm:space-y-1 animate-fade-in">
            <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-700 dark:from-blue-400 dark:via-indigo-400 dark:to-blue-300 bg-clip-text text-transparent animate-slide-up">
              {isRegisterPage ? 'Create Your Account' : 'Welcome Back'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 px-4 animate-slide-up-delay">
              {isRegisterPage
                ? 'Join SSPMS - Streamline school procurement management'
                : 'Access your school supplies & purchases dashboard'
              }
            </p>
            <div className="flex items-center justify-center gap-2 text-[10px] sm:text-xs text-blue-600 dark:text-blue-400 pt-0.5 animate-slide-up-delay-2">
              <span className="w-6 sm:w-8 h-px bg-gradient-to-r from-transparent to-blue-400" />
              <span className="font-medium tracking-wider">PASBEST VENTURES</span>
              <span className="w-6 sm:w-8 h-px bg-gradient-to-l from-transparent to-blue-400" />
            </div>
          </div>
        </div>

        {/* ============================================
            AUTH CARD - Geometric Style
            ============================================ */}
        <div className="relative group animate-slide-up-delay-3">
          {/* Animated geometric gradient border */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 animate-gradient-xy" />

          {/* Card content with geometric styling */}
          <div className={`relative bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-xl shadow-2xl border-2 border-blue-200/50 dark:border-blue-700/50 transform transition-all duration-300 hover:shadow-2xl ${isRegisterPage
            ? 'p-4 sm:p-6 md:p-8'
            : 'p-5 sm:p-6 md:p-8 lg:p-10'
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
            <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              © {new Date().getFullYear()} SSPMS
            </span>
            <span className="w-6 sm:w-8 h-0.5 bg-gradient-to-l from-transparent to-blue-400 dark:to-blue-600" />
          </div>
          <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 tracking-wide uppercase">
            PASBEST VENTURES • Transforming Ideas Into Digital Reality
          </p>
          <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 mt-0.5 tracking-wider">
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

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes spin-reverse-slow {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }

        @keyframes pulse-ring {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }

        @keyframes pulse-glow {
          0%, 100% { opacity: 0.3; transform: scale(0.9); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }

        @keyframes float-logo {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        @keyframes float-particle {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0; }
          25% { opacity: 1; }
          75% { opacity: 1; }
          100% { transform: translate(50px, -50px) scale(1.5); opacity: 0; }
        }

        @keyframes float-particle-delayed {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0; }
          25% { opacity: 1; }
          75% { opacity: 1; }
          100% { transform: translate(-30px, 20px) scale(1.3); opacity: 0; }
        }

        @keyframes float-particle-slow {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0; }
          25% { opacity: 1; }
          75% { opacity: 1; }
          100% { transform: translate(40px, 30px) scale(1.2); opacity: 0; }
        }

        @keyframes float-particle-medium {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0; }
          25% { opacity: 1; }
          75% { opacity: 1; }
          100% { transform: translate(-20px, -40px) scale(1.4); opacity: 0; }
        }

        @keyframes float-particle-slower {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0; }
          25% { opacity: 1; }
          75% { opacity: 1; }
          100% { transform: translate(60px, 10px) scale(1.1); opacity: 0; }
        }

        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .animate-gradient-xy {
          animation: gradient-xy 15s ease infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }

        .animate-spin-reverse-slow {
          animation: spin-reverse-slow 8s linear infinite;
        }

        .animate-pulse-ring {
          animation: pulse-ring 3s ease-in-out infinite;
        }

        .animate-pulse-glow {
          animation: pulse-glow 4s ease-in-out infinite;
        }

        .animate-float-logo {
          animation: float-logo 4s ease-in-out infinite;
        }

        .animate-float-particle {
          animation: float-particle 20s ease-in-out infinite;
        }

        .animate-float-particle-delayed {
          animation: float-particle-delayed 18s ease-in-out infinite 2s;
        }

        .animate-float-particle-slow {
          animation: float-particle-slow 22s ease-in-out infinite 4s;
        }

        .animate-float-particle-medium {
          animation: float-particle-medium 16s ease-in-out infinite 1s;
        }

        .animate-float-particle-slower {
          animation: float-particle-slower 24s ease-in-out infinite 3s;
        }

        .animate-slide-up {
          animation: slide-up 0.8s ease-out forwards;
        }

        .animate-slide-up-delay {
          animation: slide-up 0.8s ease-out 0.2s forwards;
          opacity: 0;
        }

        .animate-slide-up-delay-2 {
          animation: slide-up 0.8s ease-out 0.4s forwards;
          opacity: 0;
        }

        .animate-slide-up-delay-3 {
          animation: slide-up 0.8s ease-out 0.6s forwards;
          opacity: 0;
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
