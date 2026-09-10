// app/page.tsx

'use client'

import React, { useEffect, useState, useRef, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Check,
  Shield,
  Users,
  FileText,
  BarChart3,
  Target,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Twitter,
  Youtube,
  Instagram,
  Menu,
  X,
  Quote,
  ClipboardList,
  CreditCard,
  Truck,
  Wallet,
  MessageSquare,
  PhoneCall,
  Code2,
  Mic,
  Moon,
  Sun,
  Building2,
  Layers,
  Sparkles,
  Play,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AnimatedCounter from '../components/ui/animated-counter';

// ============================================
// TYPES
// ============================================

interface NavItem { label: string; href: string; }
interface StatItem { value: string; label: string; icon: React.ReactNode; }
interface Testimonial { name: string; role: string; content: string; avatar: string; }
interface PricingPlan { name: string; price: string; period: string; description: string; features: string[]; cta: string; popular?: boolean; }
interface ModuleItem { title: string; description: string; icon: React.ReactNode; large?: boolean; wide?: boolean; image?: string; }
interface TourRow { eyebrow: string; title: string; body: string; image: string; reverse?: boolean; }
interface Step { num: string; title: string; body: string; }

// ============================================
// CONTEXT
// ============================================

type Theme = 'light' | 'dark';
interface ThemeContextType { theme: Theme; toggleTheme: () => void; }
const ThemeContext = createContext<ThemeContextType>({ theme: 'light', toggleTheme: () => { } });
export const useTheme = () => useContext(ThemeContext);

// ============================================
// CONSTANTS
// ============================================

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '#home' },
  { label: 'Features', href: '#features' },
  { label: 'Modules', href: '#modules' },
  { label: 'Tour', href: '#tour' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Contact', href: '#contact' },
];

const STATS: StatItem[] = [
  { value: '9', label: 'User roles built in', icon: <Users className="h-5 w-5" /> },
  { value: '18', label: 'Reports, out of the box', icon: <BarChart3 className="h-5 w-5" /> },
  { value: '4', label: 'Approval levels per order', icon: <Target className="h-5 w-5" /> },
  { value: '2FA', label: 'Security on every account', icon: <Shield className="h-5 w-5" /> },
];

const MODULES: ModuleItem[] = [
  { title: 'Customers & Suppliers', description: 'Track every supplier, contact, and conversation in one place, and never lose the thread on a deal. Balances, history, and portal access live under one profile.', icon: <Users className="h-5 w-5" />, large: true, image: '/images/marketing/app-customers.jpg' },
  { title: 'Quotations & LPOs', description: 'Send professional quotations, receive supplier responses, and generate Local Purchase Orders with a 4-stage approval workflow.', icon: <FileText className="h-5 w-5" /> },
  { title: 'Expenses & Payments', description: 'Log what the school spends, categorize it, and see every payment collected in one ledger.', icon: <Wallet className="h-5 w-5" /> },
  { title: 'Requisition Management', description: 'Staff create and submit requisitions with item details and budgets. HODs approve in one click.', icon: <ClipboardList className="h-5 w-5" /> },
  { title: 'GRN & SAN Tracking', description: 'Track goods received and services acknowledged with full inspection and approval workflows.', icon: <Truck className="h-5 w-5" /> },
  { title: 'Payment Processing', description: 'Complete payment cycle from invoice matching to payment voucher and cheque tracking.', icon: <CreditCard className="h-5 w-5" /> },
  { title: 'Advanced Analytics', description: '18 comprehensive reports with real-time dashboards and export to PDF, Excel, and CSV.', icon: <BarChart3 className="h-5 w-5" /> },
  { title: 'WhatsApp & Email', description: 'Deliver approvals, LPOs, and payment notifications the way your staff actually check, via WhatsApp or email.', icon: <MessageSquare className="h-5 w-5" /> },
  { title: 'Call Center', description: 'Answer and make calls straight from the browser, with queues, IVR routing, and call recordings built in.', icon: <PhoneCall className="h-5 w-5" /> },
  { title: 'Secure by Design', description: 'Role-based access, two-factor authentication, and a workspace that is entirely yours, isolated from every other school on SSPMS.', icon: <Shield className="h-5 w-5" /> },
  { title: 'Web Studio', description: 'Manage your school website, blog, careers page, and portfolio from your workspace, then pull it all into your own site through a REST API with webhooks and full documentation.', icon: <Code2 className="h-5 w-5" />, wide: true },
  { title: 'AI Chat & Voice Assistant', description: 'Ask Rena anything about your procurement, by typing or by voice, and get real answers pulled from your live data. She can create requisitions, add suppliers, and more, always with your confirmation first.', icon: <Mic className="h-5 w-5" />, wide: true },
];

const TOUR_ROWS: TourRow[] = [
  { eyebrow: 'Reports & analytics', title: 'See how the school is doing without asking anyone', body: 'Collections, outstanding balances, and daily procurement spend, updated the moment a payment lands. Export any report to PDF or Excel when you need to hand it off.', image: '/images/marketing/app-reports.jpg' },
  { eyebrow: 'Requisitions & approvals', title: 'Every requisition, tracked down to the shilling', body: 'Submit a requisition in minutes and know instantly what is pending, approved, or rejected. HODs, accountants, principals, and directors approve in one click, and the balance updates itself.', image: '/images/marketing/app-invoices.jpg', reverse: true },
  { eyebrow: 'Suppliers & CRM', title: 'One record for every supplier, not a spreadsheet', body: 'Contact details, balances, and history live under one profile. Anyone on your team can open a supplier and know exactly where things stand, no digging through email required.', image: '/images/marketing/app-customers.jpg' },
];

const STEPS: Step[] = [
  { num: '1', title: 'Tell us about your school', body: 'Fill in a few details: your school name, what you procure, and how big your team is.' },
  { num: '2', title: 'We set up your workspace', body: 'Our team configures your subdomain, branding, and starter data so you can get straight to work.' },
  { num: '3', title: 'Start running procurement', body: 'Create requisitions, track approvals, generate LPOs, and manage payments, all from one login.' },
];

const TESTIMONIALS: Testimonial[] = [
  { name: 'Dr. Sarah Mwangi', role: 'School Principal, Nairobi Academy', content: 'SSPMS has transformed how we manage procurement. The transparency and accountability are unmatched. Our budget utilization has improved by 40%.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face' },
  { name: 'Mr. James Ochieng', role: "Head of Procurement, St. Mary's School", content: 'The LPO/LSO workflow is exactly what we needed. The 4-stage approval ensures proper oversight and eliminates procurement irregularities.', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face' },
  { name: 'Ms. Grace Akinyi', role: 'Accountant, Sunshine Academy', content: 'The payment processing module has streamlined our financial operations. Three-way matching and payment vouchers have reduced errors significantly.', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face' },
];

const PRICING_PLANS: PricingPlan[] = [
  { name: 'Starter', price: 'Free', period: 'forever', description: 'Perfect for small schools just getting started with digital procurement.', features: ['Up to 50 requisitions/month', '3 user roles', 'Basic reporting', 'Email support', '1 department'], cta: 'Get Started' },
  { name: 'Professional', price: 'KES 15,000', period: 'per month', description: 'Full procurement suite for medium-sized schools with all features.', features: ['Unlimited requisitions', 'All 9 user roles', 'Complete reporting suite', 'Priority support', 'Unlimited departments', 'LPO/LSO generation', 'GRN/SAN management', 'Quotation management'], cta: 'Start Free Trial', popular: true },
  { name: 'Enterprise', price: 'Custom', period: 'contact us', description: 'Tailored solution for large institutions with multiple campuses.', features: ['Everything in Professional', 'Multi-campus support', 'Custom workflows', 'Dedicated account manager', 'On-premise deployment', '24/7 phone support', 'SLA guarantee'], cta: 'Contact Sales' },
];

// ============================================
// SHARED
// ============================================

const Eyebrow = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <span className={cn("inline-block text-xs font-semibold uppercase tracking-[0.14em] text-blue-600 dark:text-blue-400", className)}>
    {children}
  </span>
);

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="relative w-10 h-10 sm:w-9 sm:h-9 rounded-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors flex items-center justify-center"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? <Moon className="h-4 w-4 text-gray-700" /> : <Sun className="h-4 w-4 text-yellow-400" />}
    </button>
  );
};

// ============================================
// NAVBAR
// ============================================

const Navbar = ({ isScrolled, activeSection, scrollToSection, handleGetStarted }: {
  isScrolled: boolean; activeSection: string;
  scrollToSection: (href: string) => void; handleGetStarted: () => void;
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    if (isMenuOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      isScrolled ? "bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl border-b border-gray-200/70 dark:border-white/10" : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <Link href="/" className="flex items-center gap-2.5 min-w-0">
            <Image
              src="/images/pasbest-logo.png"
              alt="SSPMS"
              width={180}
              height={32}
              className="h-auto w-32 sm:w-36 lg:w-40 object-contain"
              priority
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.href.replace('#', '');
              return (
                <button
                  key={item.label}
                  onClick={() => scrollToSection(item.href)}
                  className={cn(
                    "px-3.5 py-2 rounded-lg text-sm font-medium transition-colors",
                    isScrolled
                      ? (isActive
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white")
                      : "text-white/85 hover:text-white"
                  )}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="hidden lg:flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/login"
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                isScrolled
                  ? "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
                  : "text-white hover:bg-white/10"
              )}
            >
              Go to Dashboard
            </Link>
            <button
              onClick={handleGetStarted}
              className="group inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
            >
              Get Started
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="flex items-center gap-1 lg:hidden">
            <ThemeToggle />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={cn(
                "p-2.5 rounded-lg transition-colors",
                isScrolled ? "hover:bg-gray-100 dark:hover:bg-white/5" : "hover:bg-white/10"
              )}
              aria-label="Menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen
                ? <X className={cn("h-5 w-5", isScrolled ? "text-gray-900 dark:text-white" : "text-white")} />
                : <Menu className={cn("h-5 w-5", isScrolled ? "text-gray-900 dark:text-white" : "text-white")} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu — full height slide */}
      <div className={cn(
        "lg:hidden overflow-hidden transition-all duration-300 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-white/10",
        isMenuOpen ? "max-h-[calc(100vh-3.5rem)] opacity-100" : "max-h-0 opacity-0"
      )}>
        <div className="px-4 sm:px-5 py-4 space-y-1 overflow-y-auto max-h-[calc(100vh-3.5rem)]">
          {NAV_ITEMS.map((item) => (
            <button key={item.label} onClick={() => { scrollToSection(item.href); setIsMenuOpen(false); }}
              className="block w-full text-left px-4 py-3.5 rounded-lg text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
              {item.label}
            </button>
          ))}
          <div className="pt-3 border-t border-gray-200 dark:border-white/10 space-y-2">
            <Link href="/login" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3.5 rounded-lg text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">Go to Dashboard</Link>
            <button onClick={() => { handleGetStarted(); setIsMenuOpen(false); }} className="w-full px-4 py-3.5 rounded-lg bg-blue-600 text-white text-base font-semibold">Get Started</button>
          </div>
        </div>
      </div>
    </header>
  );
};

// ============================================
// HERO — Premium content on video (GitHub-style)
// ============================================

const HeroSection = ({ isVisible, handleGetStarted, scrollToSection }: {
  isVisible: boolean; handleGetStarted: () => void; scrollToSection: (href: string) => void;
}) => {
  const { theme } = useTheme();
  const videoRef = useRef<HTMLVideoElement>(null);

  const videoSrc = theme === 'dark' ? '/videos/cast1dark.webm' : '/videos/cast1light.webm';

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.load();
    video.play().catch(() => { });
  }, [videoSrc]);

  const chips = [
    { icon: <Zap className="h-3 w-3" />, label: 'Requisitions' },
    { icon: <Check className="h-3 w-3" />, label: 'Approvals' },
    { icon: <FileText className="h-3 w-3" />, label: 'LPOs' },
    { icon: <Wallet className="h-3 w-3" />, label: 'Payments' },
  ];

  return (
    <section id="home" className="relative min-h-[100svh] flex items-center justify-center overflow-hidden bg-gray-950">

      {/* ─── Video background (untouched) ─── */}
      <video
        key={videoSrc}
        ref={videoRef}
        src={videoSrc}
        className="absolute inset-0 w-full h-full object-cover scale-105"
        playsInline
        muted
        loop
        autoPlay
        preload="auto"
      />

      {/* ─── Solid overlays for readability (no gradients) ─── */}
      <div className="absolute inset-0 bg-gray-950/75" />
      <div className="absolute inset-0 bg-gray-950/30" />

      {/* ─── Content — sits directly on video ─── */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-5 lg:px-8 w-full pt-24 pb-28 sm:pt-28 sm:pb-24">
        <div className="flex flex-col items-center text-center">

          {/* Glass badge — blue */}
          <div className={cn(
            "relative inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full",
            "bg-blue-600/20 backdrop-blur-xl border border-blue-400/40",
            "shadow-lg shadow-blue-900/40",
            "transition-all duration-700",
            isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          )}>
            <Sparkles className="h-3.5 w-3.5 text-blue-200" />
            <span className="relative text-[10px] sm:text-[11px] font-semibold text-white uppercase tracking-[0.14em] sm:tracking-[0.16em]">
              School Procurement
            </span>
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
            </span>
          </div>

          {/* Headline — wraps on mobile, one line on desktop */}
          <h1 className={cn(
            "mt-6 sm:mt-7 text-[28px] leading-[1.15] xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl",
            "font-bold tracking-tight",
            "sm:whitespace-nowrap",
            "transition-all duration-1000 delay-100",
            isVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          )}>
            <span className="text-white/55 font-medium">Your school's procurement, </span>
            <span className="text-white">
              all in{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-blue-400">one place</span>
              </span>
              .
            </span>
          </h1>

          {/* Sub-headline */}
          <p className={cn(
            "mt-5 sm:mt-6 text-sm sm:text-base md:text-lg text-white/70 max-w-2xl leading-relaxed px-2",
            "transition-all duration-1000 delay-200",
            isVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          )}>
            The AI-powered platform that unifies requisitions, approvals, LPOs, payments, and supplier communication — accessible from any device.
          </p>

          {/* Feature chips */}
          <div className={cn(
            "mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 px-2",
            "transition-all duration-1000 delay-300",
            isVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          )}>
            {chips.map((chip) => (
              <span
                key={chip.label}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 text-white/90 text-[10px] sm:text-[11px] font-medium transition-colors"
              >
                <span className="text-blue-300">{chip.icon}</span>
                {chip.label}
              </span>
            ))}
          </div>

          {/* CTA buttons — full-width on mobile, inline on desktop */}
          <div className={cn(
            "mt-8 sm:mt-10 flex flex-col sm:flex-row sm:flex-wrap justify-center gap-3 w-full max-w-sm sm:max-w-none px-2",
            "transition-all duration-1000 delay-500",
            isVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          )}>
            <button
              onClick={handleGetStarted}
              className="group relative inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-xl shadow-blue-600/40 hover:shadow-blue-500/60 transition-all duration-300 active:scale-[0.98] sm:hover:-translate-y-0.5 ring-1 ring-blue-400/40"
            >
              <span className="relative flex items-center gap-2">
                Get Started Free
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </button>

            <button
              onClick={() => scrollToSection('#features')}
              className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 text-white font-semibold text-sm transition-all duration-300 active:scale-[0.98] sm:hover:-translate-y-0.5"
            >
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/20 group-hover:bg-white/30 transition-colors">
                <Play className="h-2.5 w-2.5 fill-white text-white" />
              </span>
              See how it works
            </button>
          </div>

          {/* Trust strip */}
          <div className={cn(
            "mt-10 sm:mt-12 pt-6 sm:pt-7 border-t border-white/15 w-full max-w-sm sm:max-w-none flex flex-wrap items-center justify-center gap-x-5 sm:gap-x-6 gap-y-3",
            "transition-all duration-1000 delay-700",
            isVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          )}>
            <span className="text-[10px] sm:text-[11px] text-white/50 uppercase tracking-[0.14em] font-medium">
              Trusted by 50+ schools
            </span>
          </div>

        </div>
      </div>

      {/* ─── Scroll cue (hidden on very short screens) ─── */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-10 hidden xs:flex flex-col items-center gap-1.5 text-white/40">
        <span className="text-[9px] font-semibold uppercase tracking-[0.25em]">Scroll</span>
        <span className="w-[1px] h-5 sm:h-6 bg-white/40" />
      </div>
    </section>
  );
};

// ============================================
// STATS PANEL (overlapping the hero)
// ============================================

const StatsPanel = () => {
  // Pair each stat with an optional numeric value for the counter.
  // Non-numeric stats (like "2FA") have `numeric: undefined` and render as-is.
  const stats = [
    { numeric: 9, suffix: '', label: 'User roles built in', icon: <Users className="h-5 w-5" /> },
    { numeric: 18, suffix: '', label: 'Reports, out of the box', icon: <BarChart3 className="h-5 w-5" /> },
    { numeric: 4, suffix: '', label: 'Approval levels per order', icon: <Target className="h-5 w-5" /> },
    { numeric: undefined, raw: '2FA', label: 'Security on every account', icon: <Shield className="h-5 w-5" /> },
  ];

  return (
    <div className="relative -mt-12 sm:-mt-16 z-20 max-w-7xl mx-auto px-4 sm:px-5 lg:px-8">
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 shadow-xl shadow-gray-900/5 grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-gray-100 dark:divide-white/5 overflow-hidden">
        {stats.map((stat, i) => (
          <div key={i} className="p-4 sm:p-6 flex items-center gap-3 sm:gap-4">
            <div className="text-blue-600 dark:text-blue-400 flex-shrink-0">{stat.icon}</div>
            <div className="min-w-0">
              <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white leading-none">
                {typeof stat.numeric === 'number' ? (
                  <AnimatedCounter
                    value={stat.numeric}
                    duration={1400}
                    delay={i * 100}
                    suffix={stat.suffix}
                    triggerOnScroll
                    once
                  />
                ) : (
                  stat.raw
                )}
              </div>
              <div className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1 leading-snug">
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// BENTO
// ============================================

const BentoSection = () => {
  const { theme } = useTheme();

  // Theme-aware image helpers — swap dark/light automatically
  const requisitionImg = theme === 'dark'
    ? '/images/requisitiondark.png'
    : '/images/requisitionlight.png';

  const dashboardImg = theme === 'dark'
    ? '/images/dashdark.png'
    : '/images/dashlight.png';

  return (
    <section id="features" className="py-16 sm:py-24 md:py-32 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <Eyebrow>Everything included</Eyebrow>
          <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tight">
            One workspace instead of ten tools
          </h2>
          <p className="mt-4 sm:mt-5 text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            Requisitions, quotations, LPOs, payments, suppliers, and reports, connected from the first request to the final cheque. Built for how schools actually procure.
          </p>
        </div>

        <div className="mt-10 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 auto-rows-auto">

          {/* ─── 1. LARGE — Requisition Management ─── */}
          <div className="sm:col-span-2 lg:col-span-2 lg:row-span-2 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-5 sm:p-6 flex flex-col">
            <div className="text-blue-600 dark:text-blue-400 mb-4">
              <ClipboardList className="h-5 w-5" />
            </div>

            {/* Full-image frame — no crop, no squash */}
            <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden mb-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10">
              <Image
                src={requisitionImg}
                alt="Requisition form"
                fill
                className="object-contain p-2 sm:p-3"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                priority
              />
            </div>

            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Requisition Management</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Staff create and submit requisitions with multi-item details, quantities, units, budgets, and attachments. Emergency/fast-track available. HODs approve, return, or decline with comments, and every action is logged.
            </p>
          </div>

          {/* ─── 2. STANDARD — Quotations & LPOs ─── */}
          <div className="rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-5 sm:p-6 hover:bg-white dark:hover:bg-white/[0.07] hover:shadow-lg transition-all duration-300">
            <div className="text-blue-600 dark:text-blue-400 mb-4"><FileText className="h-5 w-5" /></div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Quotations & LPOs</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Send QTN requests to suppliers, compare responses side by side, and generate LPO or LSO documents with a 4-stage approval workflow.
            </p>
          </div>

          {/* ─── 3. STANDARD — Approval Workflow ─── */}
          <div className="rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-5 sm:p-6 hover:bg-white dark:hover:bg-white/[0.07] hover:shadow-lg transition-all duration-300">
            <div className="text-blue-600 dark:text-blue-400 mb-4"><Target className="h-5 w-5" /></div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">4-Level Approvals</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              HOD → Accountant → Principal → Director. Every requisition and LPO moves through the same transparent chain, with returns and comments.
            </p>
          </div>

          {/* ─── 4. STANDARD — Supplier Management ─── */}
          <div className="rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-5 sm:p-6 hover:bg-white dark:hover:bg-white/[0.07] hover:shadow-lg transition-all duration-300">
            <div className="text-blue-600 dark:text-blue-400 mb-4"><Users className="h-5 w-5" /></div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Supplier Management</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Full supplier database with categories, performance tracking, blacklist management, and supplier portal access.
            </p>
          </div>

          {/* ─── 5. STANDARD — GRN & SAN ─── */}
          <div className="rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-5 sm:p-6 hover:bg-white dark:hover:bg-white/[0.07] hover:shadow-lg transition-all duration-300">
            <div className="text-blue-600 dark:text-blue-400 mb-4"><Truck className="h-5 w-5" /></div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">GRN & SAN Tracking</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Goods Received Notes and Service Acknowledgment Notes with partial delivery, damaged goods tracking, and inspection workflows.
            </p>
          </div>

          {/* ─── 6. STANDARD — Invoice Matching ─── */}
          <div className="rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-5 sm:p-6 hover:bg-white dark:hover:bg-white/[0.07] hover:shadow-lg transition-all duration-300">
            <div className="text-blue-600 dark:text-blue-400 mb-4"><CreditCard className="h-5 w-5" /></div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Invoice Matching</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Three-way matching across LPO, GRN, and supplier invoice. Send back for rectification or approve for payment in one click.
            </p>
          </div>

          {/* ─── 7. STANDARD — Payment Processing ─── */}
          <div className="rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-5 sm:p-6 hover:bg-white dark:hover:bg-white/[0.07] hover:shadow-lg transition-all duration-300">
            <div className="text-blue-600 dark:text-blue-400 mb-4"><Wallet className="h-5 w-5" /></div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Payment Vouchers</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Prepare payment vouchers, capture digital endorsements, and track physical cheques from issue to cash.
            </p>
          </div>

          {/* ─── 8. STANDARD — Contracts & Tenders ─── */}
          <div className="rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-5 sm:p-6 hover:bg-white dark:hover:bg-white/[0.07] hover:shadow-lg transition-all duration-300">
            <div className="text-blue-600 dark:text-blue-400 mb-4"><Layers className="h-5 w-5" /></div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Contracts & Tenders</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Track contracts from activation to renewal, and run tenders with bidder management and award workflows.
            </p>
          </div>

          {/* ─── 9. WIDE — Reports & Analytics ─── */}
          <div className="sm:col-span-2 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-5 sm:p-6">
            <div className="text-blue-600 dark:text-blue-400 mb-4"><BarChart3 className="h-5 w-5" /></div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">18 Reports, Ready on Day One</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Requisition register, approval tracking, department spending, LPO register, supplier performance, payment register, tender register, audit trail, and more. Export any report to PDF, Excel, or CSV.
            </p>
          </div>

          {/* ─── 10. WIDE — Security & Audit ─── */}
          <div className="sm:col-span-2 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-5 sm:p-6">
            <div className="text-blue-600 dark:text-blue-400 mb-4"><Shield className="h-5 w-5" /></div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Security & Full Audit Trail</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Role-based access, two-factor authentication for sensitive roles, and every action logged with user, IP, and timestamp. Your workspace is fully isolated from every other school on SSPMS.
            </p>
          </div>

          {/* ─── 11. LARGE — Dashboard ─── */}
          <div className="sm:col-span-2 lg:col-span-2 lg:row-span-2 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-5 sm:p-6 flex flex-col">
            <div className="text-blue-600 dark:text-blue-400 mb-4"><BarChart3 className="h-5 w-5" /></div>

            {/* Full-image frame — no crop, no squash */}
            <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden mb-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10">
              <Image
                src={dashboardImg}
                alt="Dashboard"
                fill
                className="object-contain p-2 sm:p-3"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </div>

            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Live Dashboard</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Pending approvals, spend this month, outstanding payments, and department activity — all updated the moment something moves. Your first look every morning, and your answer to any question in the meeting.
            </p>
          </div>

          {/* ─── 12. STANDARD — Admin Settings ─── */}
          <div className="rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-5 sm:p-6 hover:bg-white dark:hover:bg-white/[0.07] hover:shadow-lg transition-all duration-300">
            <div className="text-blue-600 dark:text-blue-400 mb-4"><Shield className="h-5 w-5" /></div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Admin & Reference Formats</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Configure reference numbers (MR, QTN, LPO, GRN, PV), approval deadlines, SMTP, departments, users, and backups from one panel.
            </p>
          </div>

          {/* ─── 13. STANDARD — Company Profile ─── */}
          <div className="rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-5 sm:p-6 hover:bg-white dark:hover:bg-white/[0.07] hover:shadow-lg transition-all duration-300">
            <div className="text-blue-600 dark:text-blue-400 mb-4"><Building2 className="h-5 w-5" /></div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Company Profile & Branding</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Your logo, contacts, social links, and document templates power every PDF the system generates. Set it once, it flows everywhere.
            </p>
          </div>

          {/* ─── 14. STANDARD — Digital Signatures ─── */}
          <div className="rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-5 sm:p-6 hover:bg-white dark:hover:bg-white/[0.07] hover:shadow-lg transition-all duration-300">
            <div className="text-blue-600 dark:text-blue-400 mb-4"><Check className="h-5 w-5" /></div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Digital Signatures</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Upload signature specimens once. They are captured on every document you endorse, with QR verification for audit.
            </p>
          </div>

          {/* ─── 15. STANDARD — 9 Role-Based Access ─── */}
          <div className="rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-5 sm:p-6 hover:bg-white dark:hover:bg-white/[0.07] hover:shadow-lg transition-all duration-300">
            <div className="text-blue-600 dark:text-blue-400 mb-4"><Users className="h-5 w-5" /></div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">9 Built-in Roles</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Admin, Staff, HOD, Accountant, Principal, Director, Procurement, Supplier, and Auditor. Each sees only what they should.
            </p>
          </div>

          {/* ─── 16. STANDARD — AI Assistant (coming) ─── */}
          <div className="rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-5 sm:p-6 hover:bg-white dark:hover:bg-white/[0.07] hover:shadow-lg transition-all duration-300">
            <div className="text-blue-600 dark:text-blue-400 mb-4"><Mic className="h-5 w-5" /></div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">AI Assistant (Coming)</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Ask about your procurement by typing or voice, and get answers pulled from live data. Draft requisitions and add suppliers with your confirmation.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};
// ============================================
// TOUR
// ============================================

const TourSection = () => {
  const { theme } = useTheme();

  // Theme-aware image per row — swaps dark/light automatically
  const tourRows = [
    {
      eyebrow: 'Reports & analytics',
      title: 'See how the school is doing without asking anyone',
      body: 'Collections, outstanding balances, and daily procurement spend, updated the moment a payment lands. Export any report to PDF or Excel when you need to hand it off.',
      imageLight: '/images/reportslight.png',
      imageDark: '/images/reportsdark.png',
      alt: 'Reports dashboard',
      reverse: false,
    },
    {
      eyebrow: 'Requisitions & approvals',
      title: 'Every requisition, tracked down to the shilling',
      body: 'Submit a requisition in minutes and know instantly what is pending, approved, or rejected. HODs, accountants, principals, and directors approve in one click, and the balance updates itself.',
      imageLight: '/images/approvalslight.png',
      imageDark: '/images/approvalsdark.png',
      alt: 'Requisitions and approvals',
      reverse: true,
    },
    {
      eyebrow: 'Suppliers & CRM',
      title: 'One record for every supplier, not a spreadsheet',
      body: 'Contact details, balances, and history live under one profile. Anyone on your team can open a supplier and know exactly where things stand, no digging through email required.',
      imageLight: '/images/supplierslight.png',
      imageDark: '/images/suppliersdark.png',
      alt: 'Supplier profiles',
      reverse: false,
    },
  ];

  return (
    <section id="tour" className="py-16 sm:py-24 md:py-32 bg-gray-50 dark:bg-gray-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <Eyebrow>Take a look inside</Eyebrow>
          <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tight">
            The actual software, not a preview of it
          </h2>
          <p className="mt-4 sm:mt-5 text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            No placeholder screens. This is what your team opens every morning.
          </p>
        </div>

        <div className="mt-12 sm:mt-20 space-y-20 sm:space-y-28">
          {tourRows.map((row, i) => {
            const img = theme === 'dark' ? row.imageDark : row.imageLight;

            return (
              <div
                key={i}
                className={cn(
                  "grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center",
                  row.reverse && "lg:[&>*:first-child]:order-2"
                )}
              >
                {/* Text block */}
                <div className="order-2 lg:order-1">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-400/20 text-blue-700 dark:text-blue-300 text-xs font-semibold uppercase tracking-[0.12em]">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400" />
                    {row.eyebrow}
                  </span>
                  <h3 className="mt-4 text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white leading-tight tracking-tight">
                    {row.title}
                  </h3>
                  <p className="mt-4 text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                    {row.body}
                  </p>
                </div>

                {/* Image — as-is, no frame */}
                <div className="relative order-1 lg:order-2">
                  <Image
                    src={img}
                    alt={row.alt}
                    width={1600}
                    height={1000}
                    className="w-full h-auto"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
// ============================================
// STEPS
// ============================================

const StepsSection = () => (
  <section className="py-16 sm:py-24 md:py-28 bg-white dark:bg-gray-950">
    <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8">
      <div className="max-w-2xl mx-auto text-center">
        <Eyebrow>How it works</Eyebrow>
        <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tight">
          Up and running, without the busywork
        </h2>
        <p className="mt-4 sm:mt-5 text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
          Three steps. No training required. Most schools are live the same day.
        </p>
      </div>

      <div className="mt-12 sm:mt-20">

        {/* ─── Desktop / tablet: horizontal flow with arrows ─── */}
        <div className="hidden md:grid grid-cols-[1fr_auto_1fr_auto_1fr] gap-4 lg:gap-6 items-stretch">

          {STEPS.map((step, i) => (
            <React.Fragment key={step.num}>

              {/* Step card */}
              <div className="group relative p-6 sm:p-8 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-500/40 hover:bg-white dark:hover:bg-white/[0.07] hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300">

                {/* Big faded number — background accent */}
                <span className="pointer-events-none absolute top-4 right-5 text-[64px] lg:text-[80px] font-black leading-none text-gray-200 dark:text-white/5 select-none">
                  {step.num}
                </span>

                {/* Circle badge */}
                <div className="relative w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-blue-600/30 group-hover:scale-110 transition-transform duration-300">
                  {step.num}
                </div>

                <h3 className="relative mt-5 text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="relative mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {step.body}
                </p>
              </div>

              {/* Arrow between steps (not after the last one) */}
              {i < STEPS.length - 1 && (
                <div className="flex items-center justify-center">
                  <div className="relative flex items-center">
                    {/* Dashed line */}
                    <span className="hidden lg:block w-8 h-[2px] bg-gradient-to-r from-blue-200 to-blue-400 dark:from-blue-500/30 dark:to-blue-400/60" />
                    {/* Arrow head */}
                    <ArrowRight className="h-5 w-5 text-blue-500 dark:text-blue-400 -ml-0.5" strokeWidth={2.5} />
                  </div>
                </div>
              )}

            </React.Fragment>
          ))}

        </div>

        {/* ─── Mobile: vertical flow with down arrows ─── */}
        <div className="md:hidden space-y-4">

          {STEPS.map((step, i) => (
            <React.Fragment key={step.num}>

              <div className="group relative p-6 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10">

                {/* Big faded number */}
                <span className="pointer-events-none absolute top-3 right-4 text-[56px] font-black leading-none text-gray-200 dark:text-white/5 select-none">
                  {step.num}
                </span>

                {/* Circle badge */}
                <div className="relative w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-lg shadow-blue-600/30">
                  {step.num}
                </div>

                <h3 className="relative mt-4 text-base font-semibold text-gray-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="relative mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {step.body}
                </p>
              </div>

              {/* Down arrow between steps */}
              {i < STEPS.length - 1 && (
                <div className="flex justify-center py-1">
                  <div className="flex flex-col items-center">
                    <span className="w-[2px] h-4 bg-gradient-to-b from-blue-200 to-blue-400 dark:from-blue-500/30 dark:to-blue-400/60" />
                    <ArrowRight className="h-5 w-5 text-blue-500 dark:text-blue-400 rotate-90 -mt-1" strokeWidth={2.5} />
                  </div>
                </div>
              )}

            </React.Fragment>
          ))}

        </div>

      </div>
    </div>
  </section>
);



import { WrappedCornerTag } from '@/components/ui/wrapped-corner-tag';

// ============================================
// PRICING
// ============================================

const PricingSection = ({ handleGetStarted }: { handleGetStarted: () => void }) => (
  <section id="pricing" className="py-16 sm:py-24 md:py-32 bg-white dark:bg-gray-950">
    <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8">
      <div className="max-w-2xl mx-auto text-center">
        <Eyebrow>Pricing</Eyebrow>
        <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tight">
          Choose the right plan for your school
        </h2>
        <p className="mt-4 sm:mt-5 text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
          Flexible pricing designed for schools of all sizes. Start free and upgrade as you grow.
        </p>
      </div>

      <div className="mt-12 sm:mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">

        {PRICING_PLANS.map((plan) => {
          const isPopular = plan.popular;
          const isEnterprise = plan.name === 'Enterprise';
          const isStarter = plan.name === 'Starter';

          return (
            <div
              key={plan.name}
              className={cn(
                "relative rounded-2xl border transition-all duration-300 flex flex-col",
                isPopular
                  ? "bg-blue-600 border-blue-500 text-white shadow-2xl shadow-blue-600/30 md:scale-[1.04] md:-translate-y-1"
                  : "bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-500/5"
              )}
            >

              {/* ─── Corner tag: MOST POPULAR on the middle plan ─── */}
              {isPopular && (
                <WrappedCornerTag
                  label="BEST VALUE"
                  color="gold"
                  position="top-right"
                  size="lg"
                  className="!z-30"
                />
              )}

              {/* ─── Corner tag: FREE on Starter ─── */}
              {isStarter && (
                <WrappedCornerTag
                  label="FREE"
                  color="emerald"
                  position="top-right"
                  size="default"
                />
              )}

              {/* ─── Corner tag: CUSTOM on Enterprise ─── */}
              {isEnterprise && (
                <WrappedCornerTag
                  label="CUSTOM"
                  color="slate"
                  position="top-right"
                  size="default"
                />
              )}

              {/* ─── Card content ─── */}
              <div className="relative p-6 sm:p-8 flex flex-col flex-1">

                {/* Plan name */}
                <div className="flex items-center gap-2">
                  <h3 className={cn(
                    "text-lg font-semibold",
                    isPopular ? "text-white" : "text-gray-900 dark:text-white"
                  )}>
                    {plan.name}
                  </h3>
                  {isPopular && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-semibold uppercase tracking-wider">
                      Best value
                    </span>
                  )}
                </div>

                {/* Price */}
                <div className="mt-4 flex items-baseline gap-1.5 flex-wrap">
                  <span className={cn(
                    "text-4xl sm:text-5xl font-bold tracking-tight",
                    isPopular ? "text-white" : "text-gray-900 dark:text-white"
                  )}>
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className={cn(
                      "text-sm font-medium",
                      isPopular ? "text-blue-100" : "text-gray-500 dark:text-gray-400"
                    )}>
                      / {plan.period}
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className={cn(
                  "mt-3 text-sm leading-relaxed",
                  isPopular ? "text-blue-100" : "text-gray-600 dark:text-gray-400"
                )}>
                  {plan.description}
                </p>

                {/* Divider */}
                <div className={cn(
                  "my-6 h-px",
                  isPopular ? "bg-white/20" : "bg-gray-200 dark:bg-white/10"
                )} />

                {/* Features list */}
                <ul className="space-y-3 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <span className={cn(
                        "flex items-center justify-center w-5 h-5 rounded-full flex-shrink-0 mt-0.5",
                        isPopular
                          ? "bg-white/20 text-white"
                          : "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      )}>
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                      <span className={cn(
                        "leading-relaxed",
                        isPopular ? "text-white/90" : "text-gray-700 dark:text-gray-300"
                      )}>
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  onClick={handleGetStarted}
                  className={cn(
                    "mt-8 w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 active:scale-[0.98] inline-flex items-center justify-center gap-2",
                    isPopular
                      ? "bg-white text-blue-700 hover:bg-blue-50 shadow-lg shadow-blue-900/20"
                      : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20"
                  )}
                >
                  {plan.cta}
                  <ArrowRight className="h-4 w-4" />
                </button>

                {/* Small reassurance line under CTA */}
                <p className={cn(
                  "mt-3 text-center text-[11px]",
                  isPopular ? "text-blue-100" : "text-gray-500 dark:text-gray-400"
                )}>
                  {isStarter && 'No credit card required'}
                  {isPopular && '14-day free trial, cancel anytime'}
                  {isEnterprise && 'Tailored onboarding included'}
                </p>
              </div>
            </div>
          );
        })}

      </div>
    </div>
  </section>
);
// ============================================
// CTA BAND
// ============================================

const CTABand = ({ handleGetStarted, scrollToSection }: { handleGetStarted: () => void; scrollToSection: (href: string) => void; }) => (
  <section className="py-16 sm:py-20 bg-gray-50 dark:bg-gray-900/40">
    <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8">
      <div className="rounded-3xl bg-gray-900 dark:bg-gray-900 border border-gray-800 px-6 py-12 sm:px-8 sm:py-16 md:px-16 md:py-20 text-center">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
          Ready to bring it all together?
        </h2>
        <p className="mt-4 sm:mt-5 text-base sm:text-lg text-gray-300 max-w-xl mx-auto leading-relaxed">
          Tell us a bit about your school and we'll get your workspace ready.
        </p>
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row justify-center gap-3 max-w-sm sm:max-w-none mx-auto">
          <button onClick={handleGetStarted} className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors active:scale-[0.98]">
            Get Started
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
          <button onClick={() => scrollToSection('#contact')} className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-semibold text-sm border border-white/20 transition-colors active:scale-[0.98]">
            Talk to us
          </button>
        </div>
      </div>
    </div>
  </section>
);

// ============================================
// CONTACT
// ============================================

const ContactSection = () => {
  const items = [
    { icon: <Mail className="h-4 w-4" />, label: 'support@pasbestventures.com', href: 'mailto:support@pasbestventures.com' },
    { icon: <Phone className="h-4 w-4" />, label: '+254 795751700', href: 'tel:+254795751700' },
    { icon: <MapPin className="h-4 w-4" />, label: 'Westlands, Nairobi', href: '#' },
  ];

  return (
    <section id="contact" className="py-16 sm:py-24 md:py-28 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          <div>
            <Eyebrow>Get in touch</Eyebrow>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
              Let's build better procurement together
            </h2>
            <p className="mt-4 sm:mt-5 text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
              Have questions about SSPMS? We're here to help. Reach out and our team will get back to you within 24 hours.
            </p>

            <div className="mt-8 space-y-3">
              {items.map((item) => (
                <a key={item.label} href={item.href} className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                  <span className="text-blue-600 dark:text-blue-400 flex-shrink-0">{item.icon}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.label}</span>
                </a>
              ))}
            </div>

            <div className="mt-8 flex items-center gap-2">
              {[
                { icon: <Linkedin className="h-4 w-4" />, href: '#', label: 'LinkedIn' },
                { icon: <Twitter className="h-4 w-4" />, href: '#', label: 'Twitter' },
                { icon: <Youtube className="h-4 w-4" />, href: '#', label: 'YouTube' },
                { icon: <Instagram className="h-4 w-4" />, href: '#', label: 'Instagram' },
              ].map((s) => (
                <Link key={s.label} href={s.href} aria-label={s.label} className="w-11 h-11 sm:w-10 sm:h-10 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-blue-600 hover:border-blue-300 transition-colors">
                  {s.icon}
                </Link>
              ))}
            </div>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Send us a message</h3>
            <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="text" placeholder="First name" className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="text" placeholder="Last name" className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <input type="email" placeholder="Email address" className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input type="text" placeholder="Subject" className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <textarea rows={4} placeholder="Tell us about your procurement needs..." className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              <button type="submit" className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors inline-flex items-center justify-center gap-2 active:scale-[0.98]">
                Send message <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

// ============================================
// FOOTER
// ============================================

const Footer = ({ scrollToSection }: { scrollToSection: (href: string) => void }) => {
  const cols = [
    { title: 'Product', icon: <Layers className="h-3.5 w-3.5" />, links: [{ l: 'Features', h: '#features' }, { l: 'Modules', h: '#modules' }, { l: 'Pricing', h: '#pricing' }, { l: 'Tour', h: '#tour' }] },
    { title: 'Company', icon: <Building2 className="h-3.5 w-3.5" />, links: [{ l: 'About', h: '#' }, { l: 'Contact', h: '#contact' }, { l: 'Careers', h: '#' }] },
    { title: 'Legal', icon: <Shield className="h-3.5 w-3.5" />, links: [{ l: 'Terms & Conditions', h: '#' }, { l: 'Privacy Policy', h: '#' }] },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10">
          <div className="col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <Image src="/images/pasbest-logo.png" alt="SSPMS" width={160} height={32} className="h-auto w-32 object-contain" />
            </div>
            <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
              One workspace for requisitions, approvals, LPOs, payments, and supplier relationships.
            </p>
            <p className="mt-4 text-xs text-gray-500">A product of Reatech Technologies</p>
          </div>

          {cols.map((col) => (
            <div key={col.title}>
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-300 uppercase tracking-wider mb-4">
                {col.icon} {col.title}
              </div>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.l}>
                    <button onClick={() => link.h.startsWith('#') ? scrollToSection(link.h) : undefined} className="text-sm text-gray-400 hover:text-white transition-colors text-left">
                      {link.l}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 sm:mt-12 pt-8 border-t border-white/10 text-xs text-gray-500">
          © 2026 <span className="text-gray-300">Reatech Technologies</span>. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

// ============================================
// MAIN
// ============================================

export default function HomePage() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [isVisible, setIsVisible] = useState(false);
  const [theme, setTheme] = useState<Theme>('light');

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  useEffect(() => {
    const saved = (localStorage.getItem('theme') as Theme) || 'light';
    setTheme(saved);
    document.documentElement.classList.toggle('dark', saved === 'dark');
  }, []);

  useEffect(() => { localStorage.setItem('theme', theme); }, [theme]);

  useEffect(() => {
    setIsVisible(true);
    const onScroll = () => {
      setIsScrolled(window.scrollY > 20);
      const ids = ['home', 'features', 'modules', 'tour', 'pricing', 'contact'];
      let cur = 'home';
      ids.forEach((id) => {
        const el = document.getElementById(id);
        if (el) { const r = el.getBoundingClientRect(); if (r.top <= 100) cur = id; }
      });
      setActiveSection(cur);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToSection = (href: string) => {
    const el = document.getElementById(href.replace('#', ''));
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleGetStarted = () => router.push('/login');

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className="min-h-screen bg-white dark:bg-gray-950 overflow-x-hidden transition-colors">
        <Navbar isScrolled={isScrolled} activeSection={activeSection} scrollToSection={scrollToSection} handleGetStarted={handleGetStarted} />
        <main>
          <HeroSection isVisible={isVisible} handleGetStarted={handleGetStarted} scrollToSection={scrollToSection} />
          <StatsPanel />
          <BentoSection />
          <TourSection />
          <StepsSection />

          <PricingSection handleGetStarted={handleGetStarted} />
          <CTABand handleGetStarted={handleGetStarted} scrollToSection={scrollToSection} />
          <ContactSection />
        </main>
        <Footer scrollToSection={scrollToSection} />
      </div>
    </ThemeContext.Provider>
  );
}
