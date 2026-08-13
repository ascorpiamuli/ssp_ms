// app/page.tsx

'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Loader2, ArrowRight, Sparkles } from 'lucide-react';
import Image from 'next/image';

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Apply Manrope font for the landing page
    const fontFamily = 'Manrope, sans-serif';
    document.body.style.setProperty('font-family', fontFamily, 'important');
    document.documentElement.style.setProperty('font-family', fontFamily, 'important');

    // Small delay for smooth transition
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    // Redirect to login after loading
    const redirectTimer = setTimeout(() => {
      router.push('/login');
    }, 1500);

    return () => {
      clearTimeout(timer);
      clearTimeout(redirectTimer);
    };
  }, [router]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:from-slate-900 dark:via-blue-950/30 dark:to-indigo-950/40">
      {/* Animated background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/50 via-white to-indigo-50/50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 animate-gradient-xy" />

        {/* Floating shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-200/30 dark:bg-blue-500/10 rounded-full blur-3xl animate-float-slow" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-200/30 dark:bg-indigo-500/10 rounded-full blur-3xl animate-float-slower" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-100/20 dark:bg-purple-500/5 rounded-full blur-3xl animate-pulse-glow" />
        </div>

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.3] dark:opacity-[0.1]">
          <svg className="absolute inset-0 w-full h-full">
            <defs>
              <pattern id="grid-pattern" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#3B82F6" strokeWidth="0.5" className="animate-grid-draw" />
              </pattern>
              <pattern id="dot-pattern" width="80" height="80" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="#3B82F6" className="animate-dot-pulse" />
                <circle cx="42" cy="42" r="1" fill="#6366F1" className="animate-dot-pulse-delay" />
                <circle cx="82" cy="82" r="0.8" fill="#8B5CF6" className="animate-dot-pulse-slow" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-pattern)" />
            <rect width="100%" height="100%" fill="url(#dot-pattern)" />
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <div className="flex flex-col items-center gap-6 max-w-md text-center">
          {/* Logo */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 rounded-2xl blur-xl" />
            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center shadow-2xl shadow-blue-500/30">
              <Building2 className="h-10 w-10 text-white" />
            </div>
          </div>

          {/* Brand Name */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              SSPMS
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              School Supplies & Purchases Management System
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500">
              <span className="w-8 h-px bg-gradient-to-r from-transparent to-blue-400/50" />
              <span className="font-medium tracking-widest uppercase">PASBEST VENTURES</span>
              <span className="w-8 h-px bg-gradient-to-l from-transparent to-blue-400/50" />
            </div>
          </div>

          {/* Divider */}
          <div className="w-12 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" />

          {/* Loading State */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
              <div className="absolute inset-0 h-8 w-8 rounded-full border-2 border-blue-600/20 dark:border-blue-400/20 animate-ping" />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 animate-pulse">
              Loading SSPMS...
            </p>
          </div>

          {/* Footer with animated dots */}
          <div className="flex items-center gap-2 mt-4">
            <span className="w-2 h-2 rounded-full bg-blue-500/40 animate-pulse" />
            <span className="w-2 h-2 rounded-full bg-indigo-500/40 animate-pulse delay-150" />
            <span className="w-2 h-2 rounded-full bg-purple-500/40 animate-pulse delay-300" />
          </div>

          {/* Version info */}
          <p className="text-[10px] text-slate-400 dark:text-slate-500 tracking-wider mt-2">
            v2.0.0 • Streamline • Transparent • Efficient
          </p>
        </div>

        {/* Decorative bottom wave */}
        <svg
          className="absolute bottom-0 left-0 w-full h-24 md:h-32 pointer-events-none"
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

      {/* Styles */}
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
          0%, 100% { r: 1.5; opacity: 0.3; }
          50% { r: 2.5; opacity: 0.8; }
        }

        @keyframes dot-pulse-delay {
          0%, 100% { r: 1; opacity: 0.2; }
          50% { r: 2; opacity: 0.7; }
        }

        @keyframes dot-pulse-slow {
          0%, 100% { r: 0.8; opacity: 0.15; }
          50% { r: 1.5; opacity: 0.6; }
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

        .delay-150 {
          animation-delay: 150ms;
        }

        .delay-300 {
          animation-delay: 300ms;
        }
      `}</style>
    </div>
  );
}
