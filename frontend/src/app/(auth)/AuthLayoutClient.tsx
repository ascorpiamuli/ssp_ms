// app/(auth)/AuthLayoutClient.tsx

'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import {
  ShieldCheck,
  Workflow,
  LineChart,
  FileCheck2,
  Sparkles,
  Users,
  Zap,
  Lock,
} from 'lucide-react'
import AccessibilityWidget from '../../components/accessibility-widget'

export default function AuthLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  const isRegisterPage = pathname === '/register'

  useEffect(() => {
    setMounted(true)

    const fontFamily = 'Manrope, sans-serif'
    document.body.style.setProperty('font-family', fontFamily, 'important')
    document.documentElement.style.setProperty('font-family', fontFamily, 'important')

    const styleElement = document.getElementById('auth-brand-styles')
    if (!styleElement) {
      const style = document.createElement('style')
      style.id = 'auth-brand-styles'
      style.textContent = `
        :root {
          --primary-color: #1a237e !important;
          --secondary-color: #3498db !important;
          --accent-color: #ffc107 !important;
        }
      `
      document.head.appendChild(style)
    }
  }, [])

  if (!mounted) return null

  const features = [
    {
      icon: FileCheck2,
      title: 'Requisition to Payment',
      desc: 'Complete lifecycle in one flow.',
    },
    {
      icon: Workflow,
      title: '4-Stage Approvals',
      desc: 'HOD → Accountant → Principal → Director.',
    },
    {
      icon: ShieldCheck,
      title: 'Full Audit Trail',
      desc: 'Every action traceable.',
    },
    {
      icon: LineChart,
      title: '18 Live Reports',
      desc: 'Real-time dashboards.',
    },
  ]

  const trust = [
    { icon: Users, label: '50+ Schools' },
    { icon: Zap, label: '9 Roles' },
    { icon: Lock, label: '2FA' },
  ]

  return (
    <div className="relative min-h-screen bg-background overflow-hidden flex items-center justify-center px-4 py-10">
      <AccessibilityWidget />

      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -top-40 -left-40 w-[520px] h-[520px] bg-blue-500/10 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute -bottom-40 -right-40 w-[520px] h-[520px] bg-indigo-500/10 rounded-full blur-3xl animate-float-slower" />
      </div>

      {/* Wrapper: info panel + form panel, equal height, touching */}
      <div className="relative z-10 w-full max-w-5xl animate-fade-up">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_32rem] items-stretch rounded-2xl overflow-hidden border border-gray-200/80 dark:border-white/10 shadow-2xl bg-white/90 dark:bg-white/5 backdrop-blur-xl">

          {/* ───────── LEFT — Info Panel ───────── */}
          <aside className="relative hidden lg:flex flex-col justify-between p-10 xl:p-12 bg-gradient-to-br from-blue-50/80 via-blue-50/40 to-indigo-50/80 dark:from-blue-950/30 dark:via-background dark:to-indigo-950/30 border-r border-gray-200/70 dark:border-white/5">
            {/* Brand top */}
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 flex-shrink-0">
                <Image
                  src="/images/logo.png"
                  alt="SSPMIS"
                  width={48}
                  height={48}
                  className="h-full w-full object-contain drop-shadow"
                  priority
                />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
                  SSPMIS
                </span>
                <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
                  School Supplies
                </span>
              </div>
            </div>

            {/* Hero */}
            <div className="my-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/20 mb-4">
                <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-blue-700 dark:text-blue-300">
                  Procurement, Reimagined
                </span>
              </div>

              <h1 className="text-2xl xl:text-3xl font-extrabold leading-tight text-gray-900 dark:text-white tracking-tight">
                Run every purchase with{' '}
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  clarity and control
                </span>
              </h1>

              <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                From requisition to payment — a single source of truth for every
                procurement decision.
              </p>

              {/* Features */}
              <ul className="mt-6 space-y-3.5">
                {features.map((f) => (
                  <li key={f.title} className="flex items-start gap-3 group">
                    <div className="flex-shrink-0 mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center bg-white dark:bg-white/10 border border-gray-200/80 dark:border-white/10 shadow-sm group-hover:scale-105 transition-all duration-300">
                      <f.icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {f.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-snug">
                        {f.desc}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Trust + Footer */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {trust.map((t) => (
                  <div
                    key={t.label}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200/80 dark:border-white/10"
                  >
                    <t.icon className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                    <span className="text-[11px] font-medium text-gray-700 dark:text-gray-300">
                      {t.label}
                    </span>
                  </div>
                ))}
              </div>

              <p className="text-[10px] uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">
                © {new Date().getFullYear()} SSPMIS
              </p>
            </div>
          </aside>

          {/* ───────── RIGHT — Form Panel ───────── */}
          <main className="relative flex items-center justify-center px-8 py-10 sm:px-10">
            {/* Mobile-only brand header */}
            <div className="lg:hidden absolute top-5 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-20">
              <div className="h-9 w-9">
                <Image
                  src="/images/logo.png"
                  alt="SSPMIS"
                  width={36}
                  height={36}
                  className="h-full w-full object-contain drop-shadow"
                  priority
                />
              </div>
              <span className="text-base font-bold text-gray-900 dark:text-white">
                SSPMIS
              </span>
            </div>

            <div className="w-full max-w-md mt-10 lg:mt-0">
              {/* Greeting */}
              <div className="mb-6 text-center">
                <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {isRegisterPage ? 'Create your account' : 'Welcome back'}
                </h2>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {isRegisterPage
                    ? 'Set up your institution in a few steps.'
                    : 'Sign in to continue to your dashboard.'}
                </p>
              </div>

              {/* Form body */}
              <div>{children}</div>
            </div>
          </main>
        </div>

        {/* Mobile footer */}
        <div className="mt-5 text-center lg:hidden">
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
            © {new Date().getFullYear()} SSPMIS
          </p>
        </div>
      </div>

      {/* Animations */}
      <style jsx global>{`
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -20px) scale(1.05); }
        }
        @keyframes float-slower {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-25px, 20px) scale(1.05); }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-float-slow { animation: float-slow 9s ease-in-out infinite; }
        .animate-float-slower { animation: float-slower 11s ease-in-out infinite; }
        .animate-fade-up { animation: fade-up 0.5s ease-out both; }
      `}</style>
    </div>
  )
}
