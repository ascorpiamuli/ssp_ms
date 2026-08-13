// frontend/src/app/(dashboard)/settings/layout.tsx

'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  User,
  Shield,
  FileSignature,
  Building2,
  Bell,
  Palette,
  Globe,
  Lock,
  Key,
  Users,
  Store,
  CreditCard,
  Settings as SettingsIcon,
  ChevronDown,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { PageTemplate } from '@/components/dashboard/PageTemplate';
import { useAuthContext } from '@/contexts/AuthContext';
import { useSignatureStatus } from '@/hooks/useSignature';
import { motion, AnimatePresence } from 'framer-motion';

interface SettingsNavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href: string;
  badge?: string;
  badgeColor?: string;
  roles?: string[];
  children?: SettingsNavItem[];
}

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthContext();
  const { data: signatureStatus } = useSignatureStatus();
  const [expandedItems, setExpandedItems] = useState<string[]>(['security']);

  const userRoles = user?.roles?.map(r => r.toUpperCase()) || [];
  if (user?.role) userRoles.push(user.role.toUpperCase());

  const isAdmin = userRoles.some(r => r === 'ADMIN' || r === 'SUPER_ADMIN');
  const isSupplier = userRoles.some(r => r === 'SUPPLIER');
  const isProcurement = userRoles.some(r => r === 'PROCUREMENT');

  const navigationItems: SettingsNavItem[] = [
    {
      id: 'profile',
      label: 'Personal Profile',
      icon: User,
      href: '/settings/profile',
    },
    {
      id: 'security',
      label: 'Security',
      icon: Shield,
      href: '/settings/security',
      children: [
        {
          id: 'password',
          label: 'Change Password',
          icon: Key,
          href: '/settings/security/password',
        },
        {
          id: 'two-factor',
          label: 'Two-Factor Authentication',
          icon: Lock,
          href: '/settings/security/two-factor',
        },
        {
          id: 'sessions',
          label: 'Active Sessions',
          icon: Globe,
          href: '/settings/security/sessions',
        },
      ],
    },
    {
      id: 'signature',
      label: 'Signature',
      icon: FileSignature,
      href: '/settings/signature',
      badge: signatureStatus?.label || 'Not Set',
      badgeColor: signatureStatus?.color || 'secondary',
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      href: '/settings/notifications',
    },
    {
      id: 'appearance',
      label: 'Appearance',
      icon: Palette,
      href: '/settings/appearance',
    },
    {
      id: 'preferences',
      label: 'Preferences',
      icon: SettingsIcon,
      href: '/settings/preferences',
    },
  ];

  // Admin only items
  if (isAdmin) {
    navigationItems.push(
      {
        id: 'company',
        label: 'Company Profile',
        icon: Building2,
        href: '/settings/company',
      },
      {
        id: 'users',
        label: 'User Management',
        icon: Users,
        href: '/settings/users',
      }
    );
  }

  // Supplier items
  if (isSupplier) {
    navigationItems.push({
      id: 'supplier',
      label: 'Supplier Profile',
      icon: Store,
      href: '/settings/supplier',
    });
  }

  // Procurement items
  if (isProcurement || isAdmin) {
    navigationItems.push({
      id: 'procurement',
      label: 'Procurement Settings',
      icon: CreditCard,
      href: '/settings/procurement',
    });
  }

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const isActive = (href: string) => {
    if (href === '/settings') return pathname === '/settings';
    return pathname.startsWith(href);
  };

  const isItemActive = (item: SettingsNavItem) => {
    if (isActive(item.href)) return true;
    if (item.children && item.children.length > 0) {
      return item.children.some(child => isActive(child.href));
    }
    return false;
  };

  const getBadgeColorClass = (color?: string) => {
    const colors: Record<string, string> = {
      success: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
      warning: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
      danger: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800',
      secondary: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700',
    };
    return colors[color || 'secondary'] || colors.secondary;
  };

  const renderNavItem = (item: SettingsNavItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const active = isItemActive(item);

    // Check if user has required role
    if (item.roles && !item.roles.some(role => userRoles.includes(role.toUpperCase()))) {
      return null;
    }

    return (
      <motion.div
        key={item.id}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2, delay: depth * 0.05 }}
        className="space-y-1"
      >
        <button
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group relative",
            active
              ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 text-blue-700 dark:text-blue-400 font-medium shadow-sm"
              : "hover:bg-gray-100 dark:hover:bg-gray-800/50 text-gray-600 dark:text-gray-300",
            depth > 0 && "ml-4"
          )}
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.id);
            } else {
              router.push(item.href);
            }
          }}
        >
          <div className={cn(
            "p-1.5 rounded-lg transition-colors flex-shrink-0",
            active
              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
              : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300"
          )}>
            <item.icon className="h-4 w-4" />
          </div>
          <span className="flex-1 text-sm text-left">{item.label}</span>
          {item.badge && (
            <Badge className={cn(
              "text-[10px] px-2 py-0 rounded-full",
              getBadgeColorClass(item.badgeColor)
            )}>
              {item.badge}
            </Badge>
          )}
          {hasChildren && (
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "text-gray-400",
                active && "text-blue-500"
              )}
            >
              <ChevronDown className="h-4 w-4" />
            </motion.div>
          )}
          {active && !hasChildren && (
            <motion.div
              layoutId="activeIndicator"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
        </button>
        <AnimatePresence>
          {hasChildren && isExpanded && item.children && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="ml-2 space-y-1 border-l-2 border-blue-100 dark:border-blue-900/30 pl-2"
            >
              {item.children.map(child => renderNavItem(child, depth + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <PageTemplate
      title="Settings"
      description="Manage your account settings and preferences"
      icon={<SettingsIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />}
      background="gradient"
      variant="default"
    >
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-72 flex-shrink-0">
          <div className="sticky top-6">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl shadow-gray-200/20 dark:shadow-gray-800/20 overflow-hidden"
            >
              {/* Header */}
              <div className="relative p-5 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 border-b border-gray-200/50 dark:border-gray-700/50">
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute -top-12 -right-12 w-24 h-24 bg-blue-500 rounded-full blur-2xl"></div>
                  <div className="absolute -bottom-12 -left-12 w-24 h-24 bg-indigo-500 rounded-full blur-2xl"></div>
                </div>
                <div className="relative flex items-center gap-3">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/20 flex-shrink-0"
                  >
                    <SettingsIcon className="h-5 w-5" />
                  </motion.div>
                  <div>
                    <h3 className="font-semibold dark:text-white">Settings</h3>
                    <p className="text-xs text-muted-foreground">Manage your preferences</p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <ScrollArea className="h-[calc(100vh-260px)] p-3">
                <div className="space-y-1">
                  {navigationItems.map(item => renderNavItem(item))}
                </div>
              </ScrollArea>

              {/* Footer */}
              <div className="p-3 border-t border-gray-200/50 dark:border-gray-700/50 bg-gray-50/30 dark:bg-gray-800/20">
                <button
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 group"
                  onClick={() => router.push('/dashboard')}
                >
                  <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-500 group-hover:bg-rose-100 dark:group-hover:bg-rose-900/20 transition-colors">
                    <LogOut className="h-4 w-4" />
                  </div>
                  <span>Back to Dashboard</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex-1 min-w-0"
        >
          {children}
        </motion.div>
      </div>
    </PageTemplate>
  );
}
