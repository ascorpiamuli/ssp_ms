'use client'

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Home,
  ArrowLeft,
  Search,
  Building2,
  ShoppingBag,
  FileText,
  Users,
  Calendar,
  Package,
  Mail,
  MapPin,
  ArrowRight,
  Shield
} from 'lucide-react';

export default function NotFound() {
  const router = useRouter();

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const floatAnimation = {
    animate: {
      y: [0, -15, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut" as const
      }
    }
  };

  const rotateAnimation = {
    animate: {
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut" as const
      }
    }
  };

  const quickLinks = [
    { href: '/', label: 'Dashboard', icon: Home, color: 'from-blue-500 to-cyan-500' },
    { href: '/requisitions', label: 'Requisitions', icon: FileText, color: 'from-purple-500 to-pink-500' },
    { href: '/suppliers', label: 'Suppliers', icon: Package, color: 'from-green-500 to-emerald-500' },
    { href: '/departments', label: 'Departments', icon: Building2, color: 'from-red-500 to-rose-500' },
    { href: '/reports', label: 'Reports', icon: ShoppingBag, color: 'from-amber-500 to-orange-500' },
    { href: '/admin/users', label: 'Users', icon: Users, color: 'from-indigo-500 to-purple-500' },
  ];

  const popularPages = [
    { href: '/requisitions', label: 'My Requisitions' },
    { href: '/suppliers', label: 'Supplier List' },
    { href: '/departments', label: 'Department Management' },
    { href: '/reports', label: 'Reports & Analytics' },
    { href: '/admin/users', label: 'User Management' },
    { href: '/settings', label: 'System Settings' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:from-slate-900 dark:via-blue-950/30 dark:to-indigo-950/40">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/20 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-200/20 dark:bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-100/10 dark:bg-blue-400/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-16">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="max-w-4xl w-full text-center"
        >
          {/* Logo and 404 Section */}
          <motion.div variants={fadeInUp} className="mb-8">
            <div className="flex justify-center mb-6">
              <motion.div
                variants={floatAnimation}
                animate="animate"
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur-2xl opacity-50"></div>
                <div className="relative w-28 h-28 rounded-2xl overflow-hidden shadow-2xl ring-4 ring-blue-500/30 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
                  <Building2 className="h-14 w-14 text-white" />
                </div>
              </motion.div>
            </div>

            <motion.h1
              variants={rotateAnimation}
              animate="animate"
              className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent mb-4"
            >
              404
            </motion.h1>

            <motion.h2
              variants={fadeInUp}
              className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4"
            >
              Page Not Found
            </motion.h2>

            <motion.p
              variants={fadeInUp}
              className="text-slate-600 dark:text-slate-400 text-base md:text-lg max-w-md mx-auto"
            >
              Oops! The page you're looking for doesn't exist or has been moved.
              Let's get you back to managing school supplies & procurement.
            </motion.p>
          </motion.div>

          {/* Search Bar */}
          <motion.div variants={fadeInUp} className="max-w-md mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search the system..."
                className="w-full pl-12 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const searchTerm = (e.target as HTMLInputElement).value;
                    if (searchTerm.trim()) {
                      window.location.href = `/search?q=${encodeURIComponent(searchTerm)}`;
                    }
                  }
                }}
              />
            </div>
          </motion.div>

          {/* Quick Links Grid */}
          <motion.div
            variants={fadeInUp}
            className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8"
          >
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group flex flex-col items-center gap-2 p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <div className={`p-2 rounded-lg bg-gradient-to-r ${link.color}`}>
                  <link.icon className="h-4 w-4 text-white" />
                </div>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {link.label}
                </span>
              </Link>
            ))}
          </motion.div>

          {/* Popular Pages */}
          <motion.div variants={fadeInUp} className="mb-8">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Popular Pages
            </h3>
            <div className="flex flex-wrap justify-center gap-2">
              {popularPages.map((page) => (
                <Link
                  key={page.href}
                  href={page.href}
                  className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors px-3 py-1 bg-white/50 dark:bg-slate-800/50 rounded-full border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700"
                >
                  {page.label}
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all group"
            >
              <Home className="h-4 w-4 group-hover:scale-110 transition-transform" />
              Back to Dashboard
            </Link>
            <button
              onClick={() => router.back()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Go Back
            </button>
          </motion.div>

          {/* System Info */}
          <motion.div
            variants={fadeInUp}
            className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400"
          >
            <Shield className="h-3 w-3" />
            <span>SSPMS v1.0.0 • Secure • Encrypted</span>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
