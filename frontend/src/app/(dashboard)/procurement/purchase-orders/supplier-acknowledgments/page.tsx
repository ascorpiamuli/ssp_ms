// frontend/src/app/(dashboard)/procurement/purchase-orders/supplier-acknowledgments/page.tsx

'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Clock,
  FileText,
  Package,
  Truck,
  DollarSign,
  Building2,
  RefreshCw,
  FileCheck,
  ThumbsUp,
  AlertTriangle,
  Info,
  Handshake,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Users,
  CreditCard,
  Receipt,
  Send,
  Sparkles,
  Zap,
  Rocket,
  Shield,
  Award,
  Gem,
  TrendingUp,
  Activity,
  ChevronRight,
  ArrowRight,
  Star,
  BadgeCheck,
  Circle,
  CircleCheck,
  CircleDot,
  Crown,
  Bell,
  BellRing,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  LayoutGrid,
  List,
  Table,
  Grid,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Lightbulb,
  Target,
  Flag,
  Milestone,
  Route,
  Map,
  Compass,
  Navigation,
  Waypoints,
  History,
  BookOpen,
  GraduationCap,
  BarChart3,
  LineChart,
  PieChart,
  Layers,
  GitBranch,
  GitCommit,
  GitMerge,
  GitPullRequest,
  Workflow,
  RefreshCcw,
  RotateCw,
  Repeat,
  Share2,
  ExternalLink,
  Link2,
  Copy,
  Clipboard,
  ClipboardCheck,
  ClipboardList,
  ListChecks,
  CheckSquare,
  Square,
  SquareCheck,
  Radio,
  RadioTower,
  Signal,
  Wifi,
  WifiOff,
  UserCheck,
  MessagesSquare,
  Megaphone,
  BellPlus,
  BellOff,
  CircleAlert,
  TriangleAlert,
  OctagonAlert,
  Flame,
  Bug,
  Ban,
  ShieldAlert,
  ShieldCheck as ShieldCheckIcon,
  ShieldQuestion,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table as TableComponent,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge as UIBadge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { PageTemplate } from '@/components/dashboard/PageTemplate';
import { useToast } from '@/components/ui/toast-context';
import { motion, AnimatePresence } from 'framer-motion';

// Hooks
import {
  usePurchaseOrders,
  useAcknowledgePurchaseOrder,
  useGetPurchaseOrderPdf,
} from '@/hooks/usePurchaseOrder';
import { useAuthContext } from '@/contexts/AuthContext';
import { useSuppliers } from '@/hooks/useSuppliers';

// Types
import type { PurchaseOrder, PurchaseOrderStatus } from '@/types/purchaseOrder.types';
import StatsCards, { type StatCardItem } from '@/components/ui/stat-cards';
import { Alert, AlertDescription, AlertTitle } from '../../../../../components/ui/alert';

// ============================================
// HELPERS
// ============================================

const formatDate = (date: string | null | undefined): string => {
  if (!date) return 'N/A';
  try {
    return format(new Date(date), 'dd MMM yyyy');
  } catch {
    return 'Invalid Date';
  }
};

const formatDateTime = (date: string | null | undefined): string => {
  if (!date) return 'N/A';
  try {
    return format(new Date(date), 'dd MMM yyyy, HH:mm');
  } catch {
    return 'Invalid Date';
  }
};

const formatCurrency = (amount: number | string | null | undefined): string => {
  if (amount === null || amount === undefined) return 'KES 0.00';
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return 'KES 0.00';
  return `KES ${Number(numAmount).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const getInitials = (name: string): string => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const getStatusConfig = (status: string) => {
  const config: Record<string, { label: string; color: string; bg: string; icon: any }> = {
    draft: {
      label: 'Draft',
      color: 'text-gray-600 dark:text-gray-400',
      bg: 'bg-gray-100 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700',
      icon: FileText,
    },
    issued: {
      label: 'Issued',
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800',
      icon: Send,
    },
    sent: {
      label: 'Awaiting Acknowledgment',
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800',
      icon: Clock,
    },
    acknowledged: {
      label: 'Acknowledged',
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800',
      icon: CheckCircle,
    },
    delivered: {
      label: 'Delivered',
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',
      icon: Truck,
    },
    partial: {
      label: 'Partial Delivery',
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800',
      icon: Clock,
    },
    completed: {
      label: 'Completed',
      color: 'text-teal-600 dark:text-teal-400',
      bg: 'bg-teal-50 dark:bg-teal-950/30 border-teal-200 dark:border-teal-800',
      icon: FileCheck,
    },
    cancelled: {
      label: 'Cancelled',
      color: 'text-gray-500 dark:text-gray-400',
      bg: 'bg-gray-50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700',
      icon: XCircle,
    },
    closed: {
      label: 'Closed',
      color: 'text-gray-500 dark:text-gray-400',
      bg: 'bg-gray-50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700',
      icon: FileCheck,
    },
  };
  return config[status] || config.sent;
};

// ============================================
// LPO STATUS BADGE COMPONENT
// ============================================

interface LPOStatusBadgeProps {
  status: string;
  size?: 'sm' | 'default' | 'lg';
}

const LPOStatusBadge = ({ status, size = 'default' }: LPOStatusBadgeProps) => {
  const config = getStatusConfig(status);
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    default: 'text-xs px-3 py-1 gap-1.5',
    lg: 'text-sm px-4 py-1.5 gap-2',
  };

  return (
    <div className={cn(
      "inline-flex items-center font-medium rounded-full border",
      config.bg,
      config.color,
      sizeClasses[size]
    )}>
      <Icon className={cn(
        "flex-shrink-0",
        size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-4 w-4' : 'h-3.5 w-3.5'
      )} />
      {config.label}
    </div>
  );
};

// ============================================
// WORKFLOW STEP COMPONENT
// ============================================

interface WorkflowStepProps {
  number: number;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'pending';
  icon: React.ReactNode;
  date?: string;
  user?: string;
}


// ============================================
// GENERAL WORKFLOW COMPONENT - DYNAMIC HORIZONTAL
// ============================================

const GeneralWorkflowGuide = () => {
  // ✅ Get supplier's orders from context
  const { data: ordersData } = usePurchaseOrders();
  const { user } = useAuthContext();

  // ✅ Get supplier profile using the hook correctly
  const { useSupplierProfileExists } = useSuppliers();
  const { exists: supplierExists, supplier: supplierProfile } = useSupplierProfileExists();

  // ✅ Get supplier ID
  const supplierId = useMemo(() => {
    const userObj = user as any;
    if (userObj?.supplier_id) return userObj.supplier_id;
    if (supplierProfile && typeof supplierProfile === 'object' && 'id' in supplierProfile) return supplierProfile.id;
    return null;
  }, [user, supplierProfile]);

  // ✅ Get supplier's orders
  const getOrdersArray = useCallback((data: any): PurchaseOrder[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (data.data && Array.isArray(data.data)) return data.data;
    if (data.success && data.data && Array.isArray(data.data)) return data.data;
    return [];
  }, []);

  const ordersArray = useMemo(() => getOrdersArray(ordersData), [ordersData, getOrdersArray]);

  // ✅ Filter to supplier's orders only
  const supplierOrders = useMemo(() => {
    if (!ordersArray.length) return [];
    if (!supplierId) return [];
    return ordersArray.filter((order: PurchaseOrder) => order.supplier_id === supplierId);
  }, [ordersArray, supplierId]);

  // ✅ Check if ALL supplier's LPOs are acknowledged or completed
  const allLposAcknowledged = useMemo(() => {
    if (!supplierOrders.length) return false;
    return supplierOrders.every((order: PurchaseOrder) =>
      order.status === 'acknowledged' ||
      order.status === 'completed' ||
      order.status === 'delivered'
    );
  }, [supplierOrders]);

  // ✅ Check if supplier has any pending LPOs
  const hasPendingLpos = useMemo(() => {
    return supplierOrders.some((order: PurchaseOrder) => order.status === 'sent');
  }, [supplierOrders]);

  // ✅ Define steps with dynamic status based on all LPOs acknowledged
  const steps = useMemo(() => {
    // Determine the current step based on supplier's progress
    let acknowledgmentStatus: 'completed' | 'current' | 'pending';
    let deliveryStatus: 'completed' | 'current' | 'pending';
    let completionStatus: 'completed' | 'current' | 'pending';

    // If ALL LPOs are completed
    if (supplierOrders.length > 0 && supplierOrders.every((o) => o.status === 'completed' || o.status === 'closed')) {
      acknowledgmentStatus = 'completed';
      deliveryStatus = 'completed';
      completionStatus = 'completed';
    }
    // If ALL LPOs are delivered but not completed
    else if (supplierOrders.length > 0 && supplierOrders.every((o) => o.status === 'delivered')) {
      acknowledgmentStatus = 'completed';
      deliveryStatus = 'completed';
      completionStatus = 'current'; // ✅ Completion is current (spinning)
    }
    // If ALL LPOs are acknowledged but not delivered
    else if (supplierOrders.length > 0 && supplierOrders.every((o) => o.status === 'acknowledged')) {
      acknowledgmentStatus = 'completed';
      deliveryStatus = 'current'; // ✅ Delivery is current (spinning)
      completionStatus = 'pending';
    }
    // If ALL LPOs are acknowledged OR some are delivered
    else if (allLposAcknowledged) {
      acknowledgmentStatus = 'completed';
      // Check if any are delivered
      const hasDelivered = supplierOrders.some((o) => o.status === 'delivered');
      if (hasDelivered) {
        deliveryStatus = 'current';
        completionStatus = 'pending';
      } else {
        deliveryStatus = 'current';
        completionStatus = 'pending';
      }
    }
    // If there are pending LPOs
    else if (hasPendingLpos) {
      acknowledgmentStatus = 'current'; // ✅ Acknowledgment is current (spinning)
      deliveryStatus = 'pending';
      completionStatus = 'pending';
    }
    // Default
    else {
      acknowledgmentStatus = 'pending';
      deliveryStatus = 'pending';
      completionStatus = 'pending';
    }

    return [
      {
        number: 1,
        title: 'Requisition',
        subtitle: 'Submission',
        description: 'Department submits requisition for approval',
        icon: <FileText className="h-5 w-5" />,
        status: 'completed' as const,
      },
      {
        number: 2,
        title: 'HOD',
        subtitle: 'Check',
        description: 'Head of Department reviews and approves',
        icon: <UserCheck className="h-5 w-5" />,
        status: 'completed' as const,
      },
      {
        number: 3,
        title: 'Accountant',
        subtitle: 'Endorsement',
        description: 'Accountant verifies budget and endorses',
        icon: <CreditCard className="h-5 w-5" />,
        status: 'completed' as const,
      },
      {
        number: 4,
        title: 'Director',
        subtitle: 'Approval',
        description: 'Director approves final commitment',
        icon: <Shield className="h-5 w-5" />,
        status: 'completed' as const,
      },
      {
        number: 5,
        title: 'LPO',
        subtitle: 'Issued & Sent',
        description: 'LPO is issued and sent to supplier',
        icon: <Send className="h-5 w-5" />,
        status: 'completed' as const,
      },
      {
        number: 6,
        title: 'Supplier',
        subtitle: 'Acknowledgment',
        description: 'Accept and acknowledge LPO',
        icon: <Handshake className="h-5 w-5" />,
        status: acknowledgmentStatus,
      },
      {
        number: 7,
        title: 'Delivery',
        subtitle: 'Goods/Services',
        description: 'Deliver as per LPO specifications',
        icon: <Truck className="h-5 w-5" />,
        status: deliveryStatus,
      },
      {
        number: 8,
        title: 'Order',
        subtitle: 'Completion',
        description: 'Order fully completed and closed',
        icon: <FileCheck className="h-5 w-5" />,
        status: completionStatus,
      },
    ];
  }, [allLposAcknowledged, hasPendingLpos, supplierOrders]);

  const completedCount = steps.filter(s => s.status === 'completed').length;
  const totalCount = steps.length;
  const progressPercentage = (completedCount / totalCount) * 100;

  // ✅ If no orders exist, show default state
  const hasOrders = supplierOrders.length > 0;

  // ✅ Determine if supplier has fully completed all LPOs
  const allLposCompleted = useMemo(() => {
    if (!supplierOrders.length) return false;
    return supplierOrders.every((order: PurchaseOrder) =>
      order.status === 'completed' || order.status === 'closed'
    );
  }, [supplierOrders]);

  // ✅ If all orders are completed, show everything as completed
  if (allLposCompleted && hasOrders) {
    const allCompletedSteps = steps.map(step => ({ ...step, status: 'completed' as const }));

    return (
      <Card className="border shadow-xl rounded-2xl bg-gradient-to-br from-white to-gray-50/80 dark:from-gray-950 dark:to-gray-900/90 backdrop-blur-sm overflow-hidden">
        <CardContent className="pt-8 pb-6 px-6">
          {/* Completion Banner */}
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-200/50 dark:border-emerald-800/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
                <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                  All LPOs Completed!
                </p>
                <p className="text-sm text-emerald-600 dark:text-emerald-400">
                  All your LPOs have been successfully completed. Thank you for your service!
                </p>
              </div>
            </div>
          </div>

          {/* Progress Bar - Full */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Progress</span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">100%</span>
            </div>
            <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-1000 w-full" />
            </div>
          </div>

          {/* All Steps Completed */}
          <div className="relative">
            <div className="absolute top-9 left-0 right-0 h-1 bg-emerald-300 dark:bg-emerald-700 rounded-full" />
            <div className="absolute top-9 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-1000 w-full" />

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 relative">
              {allCompletedSteps.map((step, index) => (
                <div key={index} className="flex flex-col items-center text-center relative group">
                  <div className="relative z-10">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center border-2 shadow-lg border-emerald-500 bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/40 dark:to-emerald-900/30 shadow-emerald-500/20">
                      <div className="relative">
                        <CheckCircle className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                      </div>
                    </div>
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-md bg-emerald-500">
                      {step.number}
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    <div className="text-emerald-600 dark:text-emerald-400">{step.icon}</div>
                    <p className="text-sm font-semibold leading-tight text-emerald-800 dark:text-emerald-300">{step.title}</p>
                    <p className="text-[11px] font-medium leading-tight text-emerald-600/70 dark:text-emerald-400/70">{step.subtitle}</p>
                    <div className="mt-2">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle className="h-3 w-3" />
                        Done
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ✅ If all LPOs are acknowledged but not completed
  if (allLposAcknowledged && hasOrders && !allLposCompleted) {
    // Show that acknowledgment is done, delivery is in progress (spinning)
    return (
      <Card className="border shadow-xl rounded-2xl bg-gradient-to-br from-white to-gray-50/80 dark:from-gray-950 dark:to-gray-900/90 backdrop-blur-sm overflow-hidden">
        <CardContent className="pt-8 pb-6 px-6">
          {/* Acknowledgment Complete Banner */}
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-200/50 dark:border-emerald-800/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
                <Handshake className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                  All LPOs Acknowledged!
                </p>
                <p className="text-sm text-emerald-600 dark:text-emerald-400">
                  You have acknowledged all your LPOs. Now preparing for delivery.
                </p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8 sm:hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Progress</span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-1000" style={{ width: `${progressPercentage}%` }} />
            </div>
          </div>

          {/* Steps */}
          <div className="relative">
            <div className="absolute top-9 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 rounded-full" />
            <div className="absolute top-9 left-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${progressPercentage}%` }} />

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 relative">
              {steps.map((step, index) => {
                const isCompleted = step.status === 'completed';
                const isCurrent = step.status === 'current';
                const isPending = step.status === 'pending';
                const stepNumber = index + 1;
                const isLast = index === steps.length - 1;

                return (
                  <div key={index} className="flex flex-col items-center text-center relative group">
                    <div className="relative z-10">
                      <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center border-2 shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl",
                        isCompleted && "border-emerald-500 bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/40 dark:to-emerald-900/30 shadow-emerald-500/20",
                        isCurrent && "border-amber-500 bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/40 dark:to-amber-900/30 shadow-amber-500/20 ring-4 ring-amber-500/20 animate-pulse",
                        isPending && "border-gray-300 dark:border-gray-600 bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-800/40 dark:to-gray-800/30 shadow-gray-300/10"
                      )}>
                        {isCompleted ? (
                          <div className="relative">
                            <CheckCircle className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
                          </div>
                        ) : isCurrent ? (
                          <Loader2 className="h-7 w-7 text-amber-600 dark:text-amber-400 animate-spin" />
                        ) : (
                          <span className="text-lg font-bold text-gray-400 dark:text-gray-500">{stepNumber}</span>
                        )}
                      </div>
                      <div className={cn(
                        "absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-md",
                        isCompleted && "bg-emerald-500",
                        isCurrent && "bg-amber-500",
                        isPending && "bg-gray-400 dark:bg-gray-600"
                      )}>
                        {stepNumber}
                      </div>
                    </div>
                    <div className="mt-3 space-y-1">
                      <div className={cn(
                        "text-muted-foreground transition-colors duration-300",
                        isCompleted && "text-emerald-600 dark:text-emerald-400",
                        isCurrent && "text-amber-600 dark:text-amber-400"
                      )}>
                        {step.icon}
                      </div>
                      <p className={cn(
                        "text-sm font-semibold leading-tight",
                        isCompleted && "text-emerald-800 dark:text-emerald-300",
                        isCurrent && "text-amber-800 dark:text-amber-300",
                        isPending && "text-gray-600 dark:text-gray-400"
                      )}>
                        {step.title}
                      </p>
                      <p className={cn(
                        "text-[11px] font-medium leading-tight",
                        isCompleted && "text-emerald-600/70 dark:text-emerald-400/70",
                        isCurrent && "text-amber-600/70 dark:text-amber-400/70",
                        isPending && "text-gray-500/70 dark:text-gray-500/70"
                      )}>
                        {step.subtitle}
                      </p>
                      <div className="mt-2">
                        {isCompleted && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle className="h-3 w-3" />
                            Done
                          </span>
                        )}
                        {isCurrent && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800 animate-pulse">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            In Progress
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600 dark:bg-gray-800/40 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                            <Clock className="h-3 w-3" />
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                    {!isLast && (
                      <div className="hidden lg:block absolute -right-1.5 top-14 text-muted-foreground/30">
                        <ChevronRight className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-8 pt-6 border-t border-gray-200/50 dark:border-gray-700/50 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/20" />
                <span className="text-sm font-medium text-muted-foreground">Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500 shadow-sm shadow-amber-500/20 animate-pulse" />
                <span className="text-sm font-medium text-muted-foreground">In Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600" />
                <span className="text-sm font-medium text-muted-foreground">Pending</span>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{completedCount}</span>
                </div>
                <span className="text-muted-foreground">Completed</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                  {Math.round(progressPercentage)}% Complete
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ✅ Default: Show normal workflow with acknowledgment as current (spinning)
  return (
    <Card className="border shadow-xl rounded-2xl bg-gradient-to-br from-white to-gray-50/80 dark:from-gray-950 dark:to-gray-900/90 backdrop-blur-sm overflow-hidden">
      <CardContent className="pt-8 pb-6 px-6">
        {/* Notification if has pending LPOs */}
        {hasPendingLpos && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-200/50 dark:border-amber-800/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/40">
                <BellRing className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="font-semibold text-amber-800 dark:text-amber-300">
                  Action Required
                </p>
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  {supplierOrders.filter((o: PurchaseOrder) => o.status === 'sent').length} LPO(s) awaiting your acknowledgment.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-8 sm:hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Progress</span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-1000"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Horizontal Flow */}
        <div className="relative">
          <div className="absolute top-9 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 rounded-full" />
          <div
            className="absolute top-9 left-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 rounded-full transition-all duration-1000"
            style={{ width: `${progressPercentage}%` }}
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 relative">
            {steps.map((step, index) => {
              const isCompleted = step.status === 'completed';
              const isCurrent = step.status === 'current';
              const isPending = step.status === 'pending';
              const stepNumber = index + 1;
              const isLast = index === steps.length - 1;

              return (
                <div key={index} className="flex flex-col items-center text-center relative group">
                  <div className="relative z-10">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center border-2 shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl",
                      isCompleted && "border-emerald-500 bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/40 dark:to-emerald-900/30 shadow-emerald-500/20",
                      isCurrent && "border-amber-500 bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/40 dark:to-amber-900/30 shadow-amber-500/20 ring-4 ring-amber-500/20 animate-pulse",
                      isPending && "border-gray-300 dark:border-gray-600 bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-800/40 dark:to-gray-800/30 shadow-gray-300/10"
                    )}>
                      {isCompleted ? (
                        <div className="relative">
                          <CheckCircle className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
                        </div>
                      ) : isCurrent ? (
                        <Loader2 className="h-7 w-7 text-amber-600 dark:text-amber-400 animate-spin" />
                      ) : (
                        <span className="text-lg font-bold text-gray-400 dark:text-gray-500">
                          {stepNumber}
                        </span>
                      )}
                    </div>
                    <div className={cn(
                      "absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-md",
                      isCompleted && "bg-emerald-500",
                      isCurrent && "bg-amber-500",
                      isPending && "bg-gray-400 dark:bg-gray-600"
                    )}>
                      {stepNumber}
                    </div>
                  </div>

                  <div className="mt-3 space-y-1">
                    <div className={cn(
                      "text-muted-foreground transition-colors duration-300",
                      isCompleted && "text-emerald-600 dark:text-emerald-400",
                      isCurrent && "text-amber-600 dark:text-amber-400"
                    )}>
                      {step.icon}
                    </div>
                    <p className={cn(
                      "text-sm font-semibold leading-tight",
                      isCompleted && "text-emerald-800 dark:text-emerald-300",
                      isCurrent && "text-amber-800 dark:text-amber-300",
                      isPending && "text-gray-600 dark:text-gray-400"
                    )}>
                      {step.title}
                    </p>
                    <p className={cn(
                      "text-[11px] font-medium leading-tight",
                      isCompleted && "text-emerald-600/70 dark:text-emerald-400/70",
                      isCurrent && "text-amber-600/70 dark:text-amber-400/70",
                      isPending && "text-gray-500/70 dark:text-gray-500/70"
                    )}>
                      {step.subtitle}
                    </p>
                    <div className="mt-2">
                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle className="h-3 w-3" />
                          Done
                        </span>
                      )}
                      {isCurrent && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800 animate-pulse">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          In Progress
                        </span>
                      )}
                      {isPending && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600 dark:bg-gray-800/40 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                          <Clock className="h-3 w-3" />
                          Pending
                        </span>
                      )}
                    </div>
                  </div>

                  {!isLast && (
                    <div className="hidden lg:block absolute -right-1.5 top-14 text-muted-foreground/30">
                      <ChevronRight className="h-5 w-5" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend & Stats */}
        <div className="mt-8 pt-6 border-t border-gray-200/50 dark:border-gray-700/50 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/20" />
              <span className="text-sm font-medium text-muted-foreground">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500 shadow-sm shadow-amber-500/20 animate-pulse" />
              <span className="text-sm font-medium text-muted-foreground">In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600" />
              <span className="text-sm font-medium text-muted-foreground">Pending</span>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{completedCount}</span>
              </div>
              <span className="text-muted-foreground">Completed</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
              <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                {Math.round(progressPercentage)}% Complete
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================
// DETAILS DIALOG
// ============================================

interface LpoDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lpo: PurchaseOrder | null;
  onAcknowledge: (id: number, comment?: string) => void;
  isAcknowledging: boolean;
  onDownload: (id: number) => void;
  isDownloading: boolean;
  supplierName?: string;
}

const LpoDetailsDialog = ({
  open,
  onOpenChange,
  lpo,
  onAcknowledge,
  isAcknowledging,
  onDownload,
  isDownloading,
  supplierName,
}: LpoDetailsDialogProps) => {
  const [acknowledgeComment, setAcknowledgeComment] = useState('');

  if (!lpo) return null;

  const isPending = lpo.status === 'sent';
  const isAcknowledged = lpo.status === 'acknowledged';
  const isCancelled = lpo.status === 'cancelled';
  const isOverdue = isPending &&
    (new Date().getTime() - new Date(lpo.updated_at || lpo.created_at).getTime()) > (48 * 60 * 60 * 1000);

  const totalItems = lpo.items?.length || 0;
  const totalAmount = lpo.total_amount || 0;

  const handleAcknowledge = () => {
    onAcknowledge(lpo.id, acknowledgeComment || undefined);
  };

  const getSupplierDisplayName = () => {
    if (supplierName) return supplierName;
    if (lpo.supplier && typeof lpo.supplier === 'object' && 'full_name' in lpo.supplier) {
      return lpo.supplier.full_name;
    }
    return 'N/A';
  };

  const getSupplierEmail = () => {
    if (lpo.supplier && typeof lpo.supplier === 'object' && 'email' in lpo.supplier) {
      return lpo.supplier.email;
    }
    return 'N/A';
  };

  const getSupplierPhone = () => {
    if (lpo.supplier && typeof lpo.supplier === 'object' && 'phone' in lpo.supplier) {
      return lpo.supplier.phone || 'N/A';
    }
    return 'N/A';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl p-0 gap-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-950 dark:to-gray-900/90">
        <DialogTitle className="sr-only">
          Purchase Order {lpo.po_number} - {lpo.title || 'Details'}
        </DialogTitle>



        <div className="p-6 space-y-6">

          {/* Order Details */}
          <Card className="border shadow-sm rounded-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4 text-emerald-600" />
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">PO Number</p>
                  <p className="font-medium font-mono">{lpo.po_number}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="font-medium">{lpo.type === 'lpo' ? 'LPO (Goods)' : 'LSO (Services)'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Issue Date</p>
                  <p className="font-medium">{formatDate(lpo.issue_date)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Expected Delivery</p>
                  <p className="font-medium">{formatDate(lpo.expected_delivery_date)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Currency</p>
                  <p className="font-medium">{lpo.currency || 'KES'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Items</p>
                  <p className="font-medium">{totalItems}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Total Amount</p>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">
                    {formatCurrency(totalAmount)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items Table */}
          <Card className="border shadow-sm rounded-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Package className="h-4 w-4 text-emerald-600" />
                Order Items ({totalItems})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="border rounded-xl overflow-hidden">
                <TableComponent>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="w-12 text-center">#</TableHead>
                      <TableHead>Item Name</TableHead>
                      <TableHead className="text-center">UOM</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lpo.items?.map((item: any, index: number) => (
                      <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="text-center text-muted-foreground text-xs font-mono">
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{item.item_name}</p>
                          {item.description && (
                            <p className="text-xs text-muted-foreground">{item.description}</p>
                          )}
                        </TableCell>
                        <TableCell className="text-center">{item.unit_of_measure || '-'}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(item.total_price)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </TableComponent>
              </div>
            </CardContent>
          </Card>

          {/* Approval Signatures */}
          <Card className="border shadow-sm rounded-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                Approval Signatures
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-muted/30 rounded-xl">
                  <p className="text-xs text-muted-foreground">Checked By</p>
                  <p className="font-medium">
                    {typeof lpo.checked_by === 'object' && lpo.checked_by !== null
                      ? (lpo.checked_by as any).full_name || 'Pending'
                      : lpo.checked_by || 'Pending'}
                  </p>
                  {lpo.checked_at && (
                    <p className="text-xs text-muted-foreground">{formatDateTime(lpo.checked_at)}</p>
                  )}
                </div>
                <div className="p-3 bg-muted/30 rounded-xl">
                  <p className="text-xs text-muted-foreground">Endorsed By</p>
                  <p className="font-medium">
                    {typeof lpo.endorsed_by === 'object' && lpo.endorsed_by !== null
                      ? (lpo.endorsed_by as any).full_name || 'Pending'
                      : lpo.endorsed_by || 'Pending'}
                  </p>
                  {lpo.endorsed_at && (
                    <p className="text-xs text-muted-foreground">{formatDateTime(lpo.endorsed_at)}</p>
                  )}
                </div>
                <div className="p-3 bg-muted/30 rounded-xl">
                  <p className="text-xs text-muted-foreground">Approved By</p>
                  <p className="font-medium">
                    {typeof lpo.approved_by === 'object' && lpo.approved_by !== null
                      ? (lpo.approved_by as any).full_name || 'Pending'
                      : lpo.approved_by || 'Pending'}
                  </p>
                  {lpo.approved_at && (
                    <p className="text-xs text-muted-foreground">{formatDateTime(lpo.approved_at)}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          {isPending && (
            <div className="space-y-4">
              <div className={cn(
                "rounded-xl border p-4 flex items-start gap-3",
                isOverdue
                  ? "border-red-200 bg-red-50/80 dark:border-red-800 dark:bg-red-950/30"
                  : "border-amber-200 bg-amber-50/80 dark:border-amber-800 dark:bg-amber-950/30"
              )}>
                <div className={cn(
                  "p-2 rounded-lg flex-shrink-0",
                  isOverdue
                    ? "bg-red-100 dark:bg-red-900/40"
                    : "bg-amber-100 dark:bg-amber-900/40"
                )}>
                  {isOverdue ? (
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  ) : (
                    <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  )}
                </div>
                <div>
                  <p className={cn(
                    "font-medium",
                    isOverdue
                      ? "text-red-800 dark:text-red-300"
                      : "text-amber-800 dark:text-amber-300"
                  )}>
                    {isOverdue ? 'Overdue - Awaiting Acknowledgment' : 'Awaiting Your Acknowledgment'}
                  </p>
                  <p className={cn(
                    "text-sm",
                    isOverdue
                      ? "text-red-700 dark:text-red-400"
                      : "text-amber-700 dark:text-amber-400"
                  )}>
                    {isOverdue
                      ? 'This LPO is overdue. Please acknowledge immediately to avoid delivery delays.'
                      : 'Please review this LPO and acknowledge if you accept the terms and conditions.'}
                  </p>
                  {isOverdue && (
                    <p className="text-xs text-red-500 mt-1">
                      Sent on: {formatDateTime(lpo.updated_at || lpo.created_at)}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex-1">
                  <Textarea
                    placeholder="Add a comment (optional)"
                    value={acknowledgeComment}
                    onChange={(e) => setAcknowledgeComment(e.target.value)}
                    className="resize-none text-sm rounded-xl dark:bg-gray-800/50 min-h-[44px] max-h-[80px]"
                    rows={1}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleAcknowledge}
                    disabled={isAcknowledging}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-600/20 transition-all duration-300 hover:scale-[1.02] flex-1 sm:flex-none"
                  >
                    {isAcknowledging ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <ThumbsUp className="h-4 w-4 mr-2" />
                    )}
                    Acknowledge LPO
                  </Button>
                </div>
              </div>
            </div>
          )}

          {isAcknowledged && (
            <div className="rounded-xl border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50/80 dark:bg-emerald-950/30 p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="font-medium text-emerald-800 dark:text-emerald-300">
                  LPO Acknowledged
                </p>
                <p className="text-sm text-emerald-700 dark:text-emerald-400">
                  You acknowledged this LPO on {formatDateTime(lpo.updated_at)}
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                  Next step: Prepare delivery of goods/services as per the LPO specifications.
                </p>
              </div>
            </div>
          )}

          {isCancelled && (
            <div className="rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/30 p-4 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800/40">
                <XCircle className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-300">LPO Cancelled</p>
                <p className="text-sm text-gray-700 dark:text-gray-400">
                  This LPO has been cancelled. No further action is required.
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ============================================
// LOADING SKELETON
// ============================================

const LoadingSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-28 rounded-xl" />
      ))}
    </div>
    <Skeleton className="h-64 rounded-xl" />
    <Skeleton className="h-48 rounded-xl" />
  </div>
);

// ============================================
// MAIN PAGE
// ============================================

export default function SupplierAcknowledgmentsPage() {
  const router = useRouter();


  const { user, isSupplier, isAuthenticated, isLoading: authLoading } = useAuthContext();

  const {
    useSupplierByUserId,
    useSupplierProfileExists
  } = useSuppliers();

  const {
    data: supplierData,
    isLoading: supplierLoading,
    refetch: refetchSupplier
  } = useSupplierByUserId();

  const {
    exists: supplierExists,
    supplier: supplierProfile,
    isLoading: profileLoading
  } = useSupplierProfileExists();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedLpo, setSelectedLpo] = useState<PurchaseOrder | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const { data: ordersData, isLoading: ordersLoading, refetch } = usePurchaseOrders();
  const acknowledgeMutation = useAcknowledgePurchaseOrder();
  const downloadMutation = useGetPurchaseOrderPdf();

  const supplierId = useMemo(() => {
    const userObj = user as any;
    if (userObj?.supplier_id) return userObj.supplier_id;
    if (supplierProfile && typeof supplierProfile === 'object' && 'id' in supplierProfile) return supplierProfile.id;
    if (supplierData && typeof supplierData === 'object' && 'id' in supplierData) return supplierData.id;
    return null;
  }, [user, supplierProfile, supplierData]);

  const supplierName = useMemo(() => {
    const profile = supplierProfile as any;
    const data = supplierData as any;
    const userObj = user as any;
    if (profile?.company_name) return profile.company_name;
    if (data?.company_name) return data.company_name;
    if (userObj?.supplier?.company_name) return userObj.supplier.company_name;
    return null;
  }, [supplierProfile, supplierData, user]);

  const getOrdersArray = useCallback((data: any): PurchaseOrder[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (data.data && Array.isArray(data.data)) return data.data;
    if (data.success && data.data && Array.isArray(data.data)) return data.data;
    return [];
  }, []);

  const ordersArray = useMemo(() => getOrdersArray(ordersData), [ordersData, getOrdersArray]);

  // ✅ Filter orders to only show this supplier's LPOs
  const supplierOrders = useMemo(() => {
    if (!ordersArray.length) return [];
    if (!supplierId) return [];
    return ordersArray.filter((order: PurchaseOrder) => {
      const isMatchingSupplier = order.supplier_id === supplierId;
      const isRelevantStatus = ['sent', 'acknowledged', 'delivered', 'completed', 'partial'].includes(order.status);
      return isMatchingSupplier && isRelevantStatus;
    });
  }, [ordersArray, supplierId]);

  const filteredOrders = useMemo(() => {
    return supplierOrders.filter((order: PurchaseOrder) => {
      if (statusFilter !== 'all' && order.status !== statusFilter) return false;
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesPO = order.po_number.toLowerCase().includes(search);
        const matchesTitle = order.title?.toLowerCase().includes(search);
        return matchesPO || matchesTitle;
      }
      return true;
    });
  }, [supplierOrders, searchTerm, statusFilter]);

  // ✅ Stats based on supplier's LPOs ONLY
  const stats = useMemo(() => {
    const total = supplierOrders.length;
    const pending = supplierOrders.filter((o: PurchaseOrder) => o.status === 'sent').length;
    const acknowledged = supplierOrders.filter((o: PurchaseOrder) => o.status === 'acknowledged').length;
    const overdue = supplierOrders.filter((o: PurchaseOrder) => {
      if (o.status !== 'sent') return false;
      const sentDate = new Date(o.updated_at || o.created_at);
      const now = new Date();
      const diffHours = (now.getTime() - sentDate.getTime()) / (1000 * 60 * 60);
      return diffHours > 48;
    }).length;
    const completed = supplierOrders.filter((o: PurchaseOrder) => o.status === 'completed').length;
    const delivered = supplierOrders.filter((o: PurchaseOrder) => o.status === 'delivered' || o.status === 'partial').length;

    return { total, pending, acknowledged, overdue, completed, delivered };
  }, [supplierOrders]);

  const handleRefresh = () => {
    refetch();
    refetchSupplier();
  };

  const handleViewLpo = (order: PurchaseOrder) => {
    setSelectedLpo(order);
    setShowDetailsDialog(true);
  };

  const handleAcknowledge = (id: number, comment?: string) => {
    if (!supplierId) {
      return;
    }
    acknowledgeMutation.mutate(
      { id, supplierId },
      {
        onSuccess: (data) => {
          setShowDetailsDialog(false);
          handleRefresh();
        },
        onError: (err: any) => {
        },
      }
    );
  };

  const handleDownload = (id: number) => {
    downloadMutation.download(id);
  };

  // ✅ Stats cards with supplier's actual data
  const statsItems: StatCardItem[] = useMemo(() => [
    {
      label: 'Total LPOs',
      value: stats.total,
      icon: FileText,
      tagLabel: 'TOTAL',
      tagColor: 'blue' as const,
      subtitle: supplierName || 'All orders',
    },
    {
      label: 'Pending Acknowledgment',
      value: stats.pending,
      icon: Clock,
      tagLabel: 'PENDING',
      tagColor: 'amber' as const,
      subtitle: 'Awaiting your action',
    },
    {
      label: 'Acknowledged',
      value: stats.acknowledged,
      icon: CheckCircle,
      tagLabel: 'DONE',
      tagColor: 'emerald' as const,
      subtitle: 'Accepted orders',
    },
    {
      label: 'Overdue',
      value: stats.overdue,
      icon: AlertCircle,
      tagLabel: 'OVERDUE',
      tagColor: 'red' as const,
      subtitle: '48+ hours pending',
    },
  ], [stats, supplierName]);

  const isLoading = authLoading || supplierLoading || profileLoading || ordersLoading;

  if (isLoading) {
    return (
      <PageTemplate
        title="Supplier Acknowledgments"
        description="Loading your LPOs..."
        icon={<Handshake className="h-5 w-5 text-emerald-600" />}
        background="gradient"
        variant="default"
        breadcrumbs={[
          { label: 'Procurement', href: '/procurement' },
          { label: 'Supplier Acknowledgments' },
        ]}
      >
        <LoadingSkeleton />
      </PageTemplate>
    );
  }

  if (!isAuthenticated) {
    return (
      <PageTemplate
        title="Supplier Acknowledgments"
        description="Please login to continue"
        icon={<Handshake className="h-5 w-5 text-red-600" />}
        background="gradient"
        variant="default"
        breadcrumbs={[
          { label: 'Procurement', href: '/procurement' },
          { label: 'Supplier Acknowledgments' },
        ]}
      >
        <Card className="border-0 shadow-sm rounded-xl">
          <CardContent className="p-12 text-center">
            <AlertTriangle className="h-16 w-16 mx-auto text-amber-500 mb-4" />
            <h3 className="text-xl font-medium mb-2">Please Login</h3>
            <p className="text-muted-foreground">You need to be logged in to view your LPOs.</p>
            <Button onClick={() => router.push('/login')} className="mt-4 rounded-xl">Login</Button>
          </CardContent>
        </Card>
      </PageTemplate>
    );
  }

  if (!isSupplier()) {
    return (
      <PageTemplate
        title="Supplier Acknowledgments"
        description="Access restricted"
        icon={<Handshake className="h-5 w-5 text-red-600" />}
        background="gradient"
        variant="default"
        breadcrumbs={[
          { label: 'Procurement', href: '/procurement' },
          { label: 'Supplier Acknowledgments' },
        ]}
      >
        <Card className="border-0 shadow-sm rounded-xl">
          <CardContent className="p-12 text-center">
            <AlertTriangle className="h-16 w-16 mx-auto text-amber-500 mb-4" />
            <h3 className="text-xl font-medium mb-2">Access Restricted</h3>
            <p className="text-muted-foreground">This page is only accessible to suppliers.</p>
          </CardContent>
        </Card>
      </PageTemplate>
    );
  }

  if (!supplierExists && !supplierId) {
    return (
      <PageTemplate
        title="Supplier Acknowledgments"
        description="Supplier profile not found"
        icon={<Handshake className="h-5 w-5 text-red-600" />}
        background="gradient"
        variant="default"
        breadcrumbs={[
          { label: 'Procurement', href: '/procurement' },
          { label: 'Supplier Acknowledgments' },
        ]}
      >
        <Card className="border-0 shadow-sm rounded-xl">
          <CardContent className="p-12 text-center">
            <AlertTriangle className="h-16 w-16 mx-auto text-amber-500 mb-4" />
            <h3 className="text-xl font-medium mb-2">Supplier Profile Not Found</h3>
            <p className="text-muted-foreground">Your supplier profile could not be found. Please contact the procurement team.</p>
          </CardContent>
        </Card>
      </PageTemplate>
    );
  }

  const pendingCount = stats.pending;

  return (
    <PageTemplate
      title="Supplier Acknowledgments"
      description={supplierName ? `View and acknowledge LPOs sent to ${supplierName}` : 'View and acknowledge LPOs sent to your company'}
      icon={<Handshake className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />}
      background="gradient"
      variant="default"
      breadcrumbs={[
        { label: 'Procurement', href: '/procurement' },
        { label: 'Supplier Acknowledgments' },
      ]}
      actions={
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 animate-pulse">
              <BellRing className="h-4 w-4 text-red-600 dark:text-red-400" />
              <span className="text-sm font-medium text-red-700 dark:text-red-300">
                {pendingCount} pending
              </span>
            </div>
          )}
          {supplierName && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
              <Building2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                {supplierName}
              </span>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="gap-1.5 h-9 rounded-xl border-white/20 dark:border-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-gray-800/50 backdrop-blur-sm"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Stats Cards - Based on supplier's LPOs only */}
        <StatsCards
          stats={statsItems}
          isLoading={isLoading}
          columns={4}
          variant="default"
          formatCompact={true}
        />



        {/* Key Alerts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Alert className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertTitle className="text-blue-800 dark:text-blue-300 text-sm">Understanding LPO Status</AlertTitle>
            <AlertDescription className="text-blue-700 dark:text-blue-400 text-xs">
              Status shows where your LPO is in the workflow. 'Sent' means it's awaiting your acknowledgment. 'Acknowledged' means you've accepted and delivery is next.
            </AlertDescription>
          </Alert>

          <Alert className="border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/20">
            <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <AlertTitle className="text-emerald-800 dark:text-emerald-300 text-sm">After Acknowledgment</AlertTitle>
            <AlertDescription className="text-emerald-700 dark:text-emerald-400 text-xs">
              Once you acknowledge an LPO, prepare goods/services for delivery. You'll receive delivery tracking updates from the procurement team.
            </AlertDescription>
          </Alert>

          <Alert className="border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertTitle className="text-amber-800 dark:text-amber-300 text-sm">48-Hour Response Window</AlertTitle>
            <AlertDescription className="text-amber-700 dark:text-amber-400 text-xs">
              Please acknowledge LPOs within 48 hours. Overdue orders may be escalated or reassigned to alternative suppliers.
            </AlertDescription>
          </Alert>

          <Alert className="border-purple-200 bg-purple-50/50 dark:border-purple-800 dark:bg-purple-950/20">
            <Truck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <AlertTitle className="text-purple-800 dark:text-purple-300 text-sm">Delivery & Completion</AlertTitle>
            <AlertDescription className="text-purple-700 dark:text-purple-400 text-xs">
              After delivery, procurement verifies quality and quantities. Upon successful verification, the order is marked as completed and payment is processed.
            </AlertDescription>
          </Alert>
        </div>
        {/* General Workflow Guide - ONLY WORKFLOW, NO ALERTS */}
        <GeneralWorkflowGuide />

        {/* Filters */}
        <Card className="border shadow-sm rounded-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by LPO number or title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 rounded-xl bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50"
                />
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[180px] rounded-xl bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="sent">Awaiting Acknowledgment</SelectItem>
                    <SelectItem value="acknowledged">Acknowledged</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25, delay: 0.1 }}
        >
          <Card className="border shadow-sm rounded-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm overflow-hidden">
            <CardHeader className="pb-3 border-b bg-gradient-to-r from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/20">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4 text-emerald-600" />
                  Your LPOs
                  <UIBadge variant="secondary" className="ml-2 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                    {filteredOrders.length}
                  </UIBadge>
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Showing {filteredOrders.length} of {supplierOrders.length}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-12">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="w-16 h-16 mx-auto bg-muted/30 rounded-full flex items-center justify-center mb-4"
                  >
                    <FileText className="h-8 w-8 text-muted-foreground/50" />
                  </motion.div>
                  <h3 className="text-lg font-medium mb-2">No LPOs Found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || statusFilter !== 'all'
                      ? 'No LPOs match your current filters. Try adjusting your search criteria.'
                      : 'You have no LPOs to acknowledge at this time.'}
                  </p>
                </div>
              ) : (
                <div className="border rounded-xl overflow-hidden">
                  <TableComponent>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="w-12 text-center">#</TableHead>
                        <TableHead>LPO Number</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead className="text-center">Type</TableHead>
                        <TableHead className="text-center">Date</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order: PurchaseOrder, index: number) => {
                        const isOverdue = order.status === 'sent' &&
                          (new Date().getTime() - new Date(order.updated_at || order.created_at).getTime()) > (48 * 60 * 60 * 1000);
                        const isPending = order.status === 'sent';

                        return (
                          <TableRow
                            key={order.id}
                            data-pending={isPending ? "true" : "false"}
                            className={cn(
                              "hover:bg-muted/30 transition-colors cursor-pointer group",
                              isOverdue && "border-l-4 border-l-red-500"
                            )}
                            onClick={() => handleViewLpo(order)}
                          >
                            <TableCell className="text-center text-muted-foreground text-xs font-mono">
                              {index + 1}
                            </TableCell>
                            <TableCell>
                              <p className="font-medium text-emerald-600 dark:text-emerald-400 group-hover:underline">
                                {order.po_number}
                              </p>
                            </TableCell>
                            <TableCell>
                              <p className="font-medium">{order.title || 'N/A'}</p>
                              {order.type === 'lpo' && order.items && order.items.length > 0 && (
                                <p className="text-xs text-muted-foreground">
                                  {order.items.length} item{order.items.length > 1 ? 's' : ''}
                                </p>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              <UIBadge
                                variant="outline"
                                className={cn(
                                  "rounded-full",
                                  order.type === 'lpo'
                                    ? "border-blue-200 text-blue-600 bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:bg-blue-950/30"
                                    : "border-purple-200 text-purple-600 bg-purple-50 dark:border-purple-800 dark:text-purple-400 dark:bg-purple-950/30"
                                )}
                              >
                                {order.type === 'lpo' ? 'LPO' : 'LSO'}
                              </UIBadge>
                            </TableCell>
                            <TableCell className="text-center text-sm">
                              {formatDate(order.issue_date)}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(order.total_amount)}
                            </TableCell>
                            <TableCell className="text-center">
                              <LPOStatusBadge status={order.status} size="sm" />
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewLpo(order);
                                  }}
                                  className="h-8 w-8 p-0 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownload(order.id);
                                  }}
                                  className="h-8 w-8 p-0 rounded-full hover:bg-blue-50 dark:hover:bg-blue-950/30"
                                  disabled={downloadMutation.isDownloading}
                                >
                                  {downloadMutation.isDownloading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Download className="h-4 w-4" />
                                  )}
                                </Button>
                                {isPending && (
                                  <Button
                                    variant="default"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewLpo(order);
                                    }}
                                    className="h-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs shadow-lg shadow-emerald-600/20 transition-all duration-300 hover:scale-[1.05]"
                                  >
                                    <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                    Acknowledge
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </TableComponent>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>


      </div>

      <LpoDetailsDialog
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        lpo={selectedLpo}
        onAcknowledge={handleAcknowledge}
        isAcknowledging={acknowledgeMutation.isPending}
        onDownload={handleDownload}
        isDownloading={downloadMutation.isDownloading}
        supplierName={supplierName || undefined}
      />
    </PageTemplate>
  );
}
