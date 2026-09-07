// frontend/src/app/(dashboard)/procurement/purchase-orders/create/page.tsx

'use client';

import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Send,
  Loader2,
  Package,
  Briefcase,
  Layers,
  FileText,
  Building2,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Info,
  Award,
  Star,
  FileCheck,
  Shield,
  Truck,
  Clock,
  AlertCircle,
  Ruler,
  ClipboardList,
  Eye,
  Users,
  MapPin,
  Phone,
  Mail,
  Building,
  CreditCard,
  Wallet,
  Receipt,
  PenTool,
  Sparkles,
  Zap,
  ShieldCheck,
  BadgeCheck,
  Crown,
  Gem,
  Rocket,
  TrendingUp,
  XCircle,
  RefreshCw,
  Search,
  Table as TableIcon,
  LayoutGrid,
  ChevronRight,
  Grid3x3,
  Maximize2,
  Minimize2,
  Scale,
  ExternalLink,
  MoreHorizontal,
  Circle,
  CircleCheck,
  CircleDashed,
  Percent,
  ChartBar,
  MailCheck,
  Award as AwardIcon,
  BadgeCheck as BadgeCheckIcon,
  Sparkle,
  Zap as ZapIcon,
  Flame,
  Leaf,
  Heart,
  ThumbsUp,
  Gift,
  Clock as ClockIcon,
  Target,
  Timer,
  Hourglass,
  CalendarDays,
  UserCog,
  FileSpreadsheet,
  RotateCcw,
  Construction,
  Wrench,
  HardHat,
  Settings,
  Toolbox,
  Compass,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  ListChecks,
  DollarSign,
  CalendarIcon,
  BarChart3,
  MessageSquare,
  PlusCircle,
  ExternalLink as ExternalLinkIcon,
  GitBranch,
  History,
  Undo2,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { PageTemplate } from '@/components/dashboard/PageTemplate';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';

// Hooks
import { useSupplierQuotation } from '@/hooks/useSupplierQuotation';
import { useCreatePurchaseOrder } from '@/hooks/usePurchaseOrder';
import { useSuppliers } from '@/hooks/useSuppliers';

// Types
import type { CreatePurchaseOrderData } from '@/types/purchaseOrder.types';
import type { SupplierQuotation } from '@/types/supplierQuotation.types';

// UI Components
import HorizontalCornerTag from '@/components/ui/horizontal-corner-tag';
import WrappedCornerTag from '../../../../../components/ui/wrapped-corner-tag';

// ============================================
// CONSTANTS
// ============================================

const CURRENCY = 'KES';
const ITEMS_PER_PAGE = 10;

// ============================================
// HELPERS
// ============================================

const formatDate = (date: string | Date | null): string => {
  if (!date) return 'N/A';
  try {
    return format(new Date(date), 'dd MMM yyyy');
  } catch {
    return 'Invalid Date';
  }
};

const formatCurrency = (amount: number | string | null | undefined): string => {
  if (amount === null || amount === undefined) return 'KES 0.00';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return 'KES 0.00';
  return `KES ${Number(num).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const getInitials = (name: string): string => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

// ============================================
// GUIDE TIPS COMPONENT
// ============================================

const GuideTip = ({ title, description, icon: Icon, step, variant = 'blue' }: {
  title: string;
  description: string;
  icon?: any;
  step?: number;
  variant?: 'blue' | 'amber' | 'emerald' | 'purple';
}) => {
  const IconComponent = Icon || Lightbulb;

  const variants = {
    blue: 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200/50 dark:border-blue-800/50',
    amber: 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/50 dark:border-amber-800/50',
    emerald: 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-800/50',
    purple: 'bg-purple-50/50 dark:bg-purple-950/20 border-purple-200/50 dark:border-purple-800/50',
  };

  const iconVariants = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  };

  const textVariants = {
    blue: 'text-blue-800 dark:text-blue-300',
    amber: 'text-amber-800 dark:text-amber-300',
    emerald: 'text-emerald-800 dark:text-emerald-300',
    purple: 'text-purple-800 dark:text-purple-300',
  };

  const descVariants = {
    blue: 'text-blue-700 dark:text-blue-400',
    amber: 'text-amber-700 dark:text-amber-400',
    emerald: 'text-emerald-700 dark:text-emerald-400',
    purple: 'text-purple-700 dark:text-purple-400',
  };

  return (
    <div className={cn("flex items-start gap-3 p-3 rounded-xl border", variants[variant])}>
      <div className={cn("p-1.5 rounded-lg flex-shrink-0 mt-0.5", iconVariants[variant])}>
        <IconComponent className="h-4 w-4" />
      </div>
      <div>
        <p className={cn("text-sm font-medium", textVariants[variant])}>
          {step && <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-current/10 text-current text-xs font-bold mr-2">{step}</span>}
          {title}
        </p>
        <p className={cn("text-xs mt-0.5", descVariants[variant])}>{description}</p>
      </div>
    </div>
  );
};

// ============================================
// STEP INDICATOR
// ============================================

const StepIndicator = memo(({ currentStep, totalSteps, labels }: {
  currentStep: number;
  totalSteps: number;
  labels: string[];
}) => {
  return (
    <div className="flex items-center gap-2 mb-6">
      {Array.from({ length: totalSteps }).map((_, index) => {
        const step = index + 1;
        const isActive = step === currentStep;
        const isCompleted = step < currentStep;
        const isUpcoming = step > currentStep;

        return (
          <div key={index} className="flex items-center gap-2">
            <div className={cn(
              "flex items-center gap-2",
              isActive && "text-blue-600 dark:text-blue-400",
              isCompleted && "text-emerald-600 dark:text-emerald-400",
              isUpcoming && "text-gray-400 dark:text-gray-600"
            )}>
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                isActive && "bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500",
                isCompleted && "bg-emerald-100 dark:bg-emerald-900/30 border-2 border-emerald-500",
                isUpcoming && "bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600"
              )}>
                {isCompleted ? <CheckCircle className="h-4 w-4" /> : step}
              </div>
              <span className={cn(
                "text-xs font-medium hidden sm:inline",
                isActive && "text-blue-600 dark:text-blue-400",
                isCompleted && "text-emerald-600 dark:text-emerald-400",
                isUpcoming && "text-gray-400 dark:text-gray-500"
              )}>
                {labels[index]}
              </span>
            </div>
            {index < totalSteps - 1 && (
              <div className={cn(
                "w-8 h-0.5",
                step <= currentStep ? "bg-blue-400 dark:bg-blue-500" : "bg-gray-300 dark:bg-gray-600"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
});

StepIndicator.displayName = 'StepIndicator';

// ============================================
// STEP 1: QUOTATION & ORDER TYPE
// ============================================

const Step1QuotationInfo = memo(({
  supplierQuotation,
  supplierDisplayName,
  supplierEmail,
  supplierPhone,
  supplierContactPerson,
  supplierAddress,
  supplierRegistration,
  isService,
  requisition,
  quotationItems,
}: {
  supplierQuotation: any;
  supplierDisplayName: string;
  supplierEmail: string;
  supplierPhone: string;
  supplierContactPerson: string;
  supplierAddress: string;
  supplierRegistration: string;
  isService: boolean;
  requisition: any;
  quotationItems: any[];
}) => {
  // Calculate statistics
  const totalItems = quotationItems?.length || 0;
  const totalAmount = parseFloat(supplierQuotation?.total_amount || 0);
  const netAmount = parseFloat(supplierQuotation?.net_amount || 0);
  const taxAmount = parseFloat(supplierQuotation?.tax_amount || 0);
  const discountAmount = parseFloat(supplierQuotation?.discount_amount || 0);
  const isLowest = supplierQuotation?.is_lowest || false;
  const validityDate = supplierQuotation?.validity_date;
  const submissionDate = supplierQuotation?.submission_date;
  const verificationStatus = supplierQuotation?.verification_status || 'pending';

  // Get service category label
  const getServiceCategoryLabel = (category: string | null): string => {
    if (!category) return 'N/A';
    const labels: Record<string, string> = {
      consultancy: 'Consultancy',
      maintenance: 'Maintenance',
      training: 'Training',
      installation: 'Installation',
      cleaning: 'Cleaning',
      security: 'Security',
      transport: 'Transport',
      construction: 'Construction',
      professional_services: 'Professional Services',
      it_services: 'IT Services',
      other: 'Other',
    };
    return labels[category] || category;
  };

  // Get verification status label
  const getVerificationLabel = (status: string): string => {
    const labels: Record<string, string> = {
      pending: 'Pending Verification',
      verified: 'Verified',
      rejected: 'Rejected',
    };
    return labels[status] || status;
  };

  const getVerificationColor = (status: string): string => {
    const colors: Record<string, string> = {
      pending: 'bg-amber-50 text-amber-700 border-amber-200',
      verified: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      rejected: 'bg-red-50 text-red-700 border-red-200',
    };
    return colors[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <FileText className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        </div>
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Quotation & Order Type
          </h3>
          <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded-full text-[10px] border-0">
            Step 1
          </Badge>
        </div>
      </div>

      <GuideTip
        step={1}
        title="What's happening here?"
        description={isService
          ? "You're creating a Local Service Order (LSO) from an accepted service quotation. The order type is auto-detected from the requisition."
          : "You're creating a Local Purchase Order (LPO) from an accepted goods quotation. The order type is auto-detected from the requisition."
        }
        icon={Info}
      />

      <Alert className="border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
        <Lightbulb className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        <AlertDescription className="text-gray-700 dark:text-gray-300 text-sm">
          Review the quotation details and confirm the order type. The order type is auto-detected from the requisition.
        </AlertDescription>
      </Alert>

      {/* Main Card */}
      <Card className="border border-gray-200 dark:border-gray-700 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-gray-900">
        <CardContent className="p-6">
          {/* Header with Quotation Number and Badges */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {supplierQuotation.quotation_number}
                </h2>
                <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 rounded-full">
                  <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                  Accepted
                </Badge>
                {isLowest && (
                  <Badge className="bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800 rounded-full">
                    <Star className="h-3.5 w-3.5 mr-1.5" />
                    Lowest Price
                  </Badge>
                )}
                <Badge className={cn("rounded-full border text-xs px-3 py-1", getVerificationColor(verificationStatus))}>
                  {getVerificationLabel(verificationStatus)}
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-4 w-4" />
                  {supplierDisplayName}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  Submitted: {formatDate(submissionDate)}
                </span>
                {validityDate && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    Valid until: {formatDate(validityDate)}
                  </span>
                )}
                <span className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                  <Wallet className="h-4 w-4" />
                  Total: {formatCurrency(totalAmount)}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-start lg:items-end gap-2">
              <Badge className={cn(
                "rounded-full px-4 py-2 text-sm font-medium border",
                isService
                  ? "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 border-purple-200 dark:border-purple-800"
                  : "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
              )}>
                <span className="flex items-center gap-2">
                  {isService ? <Briefcase className="h-4 w-4" /> : <Package className="h-4 w-4" />}
                  {isService ? 'LSO - Local Service Order' : 'LPO - Local Purchase Order'}
                </span>
              </Badge>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {isService ? 'Service Requisition' : 'Goods Requisition'}
              </span>
              {requisition?.service_category && (
                <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded-full text-xs border-0">
                  Category: {getServiceCategoryLabel(requisition.service_category)}
                </Badge>
              )}
            </div>
          </div>

          <Separator className="my-5" />

          {/* Two Column Grid - Order Details & Supplier Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Order Details & Timeline */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Order Timeline</p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Quotation Accepted</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(submissionDate)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Order Creation</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">In Progress</p>
                    </div>
                  </div>

                  {validityDate && (
                    <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-800/30">
                      <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Quotation Validity</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Valid until {formatDate(validityDate)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Item Count & Order Stats */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Package className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Order Items</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700 text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalItems}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total Items</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700 text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {quotationItems?.filter(item => item.quantity > 0).length || 0}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Active Items</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700 text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {quotationItems?.some(item => item.quantity === 0) ? '⚠️' : '✓'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">All Quoted</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Supplier & Requisition Info */}
            <div className="space-y-4">
              {/* Supplier Info */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Supplier Information</p>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
                  <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-gray-700 dark:text-gray-300 font-semibold text-lg">
                      {getInitials(supplierDisplayName)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate text-gray-900 dark:text-white">{supplierDisplayName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{supplierEmail}</p>
                    {supplierRegistration && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">Reg: {supplierRegistration}</p>
                    )}
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 rounded-full">
                    Active
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2 text-sm p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Contact Person</p>
                    <p className="font-medium text-gray-900 dark:text-white">{supplierContactPerson}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                    <p className="font-medium text-gray-900 dark:text-white">{supplierPhone}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Address</p>
                    <p className="font-medium text-gray-900 dark:text-white truncate">{supplierAddress}</p>
                  </div>
                </div>
              </div>

              {/* Requisition Info */}
              {requisition && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <ClipboardList className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Requisition Information</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Reference Number</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white font-mono">
                        {requisition.reference_number || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Title</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[200px]">
                        {requisition.title || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Department</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {requisition.department?.name || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Priority</span>
                      <Badge className={cn(
                        "text-xs rounded-full border-0",
                        requisition.priority === 'high' ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400" :
                          requisition.priority === 'medium' ? "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400" :
                            "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                      )}>
                        {requisition.priority_label || requisition.priority || 'Normal'}
                      </Badge>
                    </div>
                    {isService && requisition.service_category && (
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Service Category</span>
                        <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                          {getServiceCategoryLabel(requisition.service_category)}
                        </span>
                      </div>
                    )}
                    {!isService && requisition.goods_category && (
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Goods Category</span>
                        <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                          {requisition.goods_category?.replace(/_/g, ' ') || 'N/A'}
                        </span>
                      </div>
                    )}
                    {requisition.required_by_date && (
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Required By</span>
                        <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                          {formatDate(requisition.required_by_date)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

Step1QuotationInfo.displayName = 'Step1QuotationInfo';

// ============================================
// STEP 2: VIEW ITEMS (LOCKED - NO REMOVAL)
// ============================================

interface Step2ViewItemsProps {
  quotationItems: any[];
  paginatedItems: any[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  viewMode: 'table' | 'cards';
  onViewModeChange: (mode: 'table' | 'cards') => void;
  totalAmount: number;
  isService: boolean;
  requisition: any;
  onCancelRequisition?: () => void;
  onNewRequisition?: () => void;
}

const Step2ViewItems = memo(({
  quotationItems,
  paginatedItems,
  currentPage,
  totalPages,
  onPageChange,
  viewMode,
  onViewModeChange,
  totalAmount,
  isService,
  requisition,
  onCancelRequisition,
  onNewRequisition,
}: Step2ViewItemsProps) => {
  const totalItems = quotationItems?.length || 0;
  const [showRemoveTip, setShowRemoveTip] = useState(false);

  // Calculate totals
  const itemsTotal = quotationItems.reduce((sum, item) => sum + (parseFloat(item.total_price) || 0), 0);
  const totalTax = quotationItems.reduce((sum, item) => sum + (parseFloat(item.tax_amount) || 0), 0);
  const totalDiscount = quotationItems.reduce((sum, item) => sum + (parseFloat(item.discount_amount) || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        {isService ? (
          <Briefcase className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        ) : (
          <Package className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        )}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Step 2: Review Items
        </h3>
        <Badge className={cn(
          "rounded-full text-[10px] ml-2",
          isService
            ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
        )}>
          {totalItems} items included
        </Badge>
      </div>

      {/* CRITICAL: Locked Items Alert */}
      <Alert className="border-amber-200 dark:border-amber-800/50 bg-amber-50/80 dark:bg-amber-950/30 rounded-xl shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex-shrink-0 mt-0.5">
            <Lock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <AlertTitle className="text-amber-800 dark:text-amber-300 font-semibold text-sm">
              Items Are Locked - No Removal Allowed
            </AlertTitle>
            <AlertDescription className="text-amber-700 dark:text-amber-400 text-sm space-y-2">
              <p>
                All {totalItems} items from the requisition <strong>must</strong> be included in this purchase order.
                Items cannot be removed or deselected at this stage.
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <Badge className="bg-amber-200/50 text-amber-800 dark:bg-amber-800/30 dark:text-amber-300 border-0 rounded-full">
                  <Info className="h-3 w-3 mr-1" />
                  Why?
                </Badge>
                <span className="text-xs">
                  Removing items breaks the requisition-to-PO integrity and causes three-way matching failures.
                </span>
              </div>
            </AlertDescription>
          </div>
        </div>
      </Alert>

      {/* Guide Tip: How to remove items */}
      <GuideTip
        step={2}
        title="Want to remove an item from this order?"
        description={`If you don't need some items, you must cancel this requisition and create a new one with only the items you want. The new requisition will go through the full approval process (HOD → Accountant → Principal → Director).`}
        icon={GitBranch}
        variant="purple"
      />

      <Card className="border-0 shadow-sm rounded-xl">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              {isService ? (
                <Briefcase className="h-4 w-4 text-purple-500" />
              ) : (
                <Package className="h-4 w-4 text-muted-foreground" />
              )}
              All Requisition Items
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>All items from the requisition are automatically included</span>
              <Badge variant="outline" className="text-[10px] font-mono bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800">
                <CheckCircle className="h-3 w-3 mr-1 text-emerald-600" />
                Included
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 border-l dark:border-gray-700 pl-2">
              <Button
                variant={viewMode === 'cards' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onViewModeChange('cards')}
                className="h-8 w-8 p-0 rounded-xl"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onViewModeChange('table')}
                className="h-8 w-8 p-0 rounded-xl"
              >
                <TableIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {quotationItems.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-700">
              <Package className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">No items found in this quotation</p>
            </div>
          ) : viewMode === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedItems.map((item: any) => {
                return (
                  <div
                    key={item.id}
                    className="border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 bg-emerald-50/30 dark:bg-emerald-950/10 shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="relative mt-1">
                          <input
                            type="checkbox"
                            checked={true}
                            disabled
                            className="h-4 w-4 rounded border-emerald-300 bg-emerald-100 text-emerald-600 cursor-not-allowed opacity-70"
                          />
                          <Lock className="h-3 w-3 absolute -top-1 -right-1 text-emerald-600 dark:text-emerald-400 opacity-70" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {item.item_name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge
                              className={cn(
                                "text-[10px] rounded-full",
                                isService
                                  ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                                  : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                              )}
                            >
                              {isService ? 'Service' : 'Goods'}
                            </Badge>
                            <Badge variant="outline" className="text-[10px] font-mono">
                              {item.unit_of_measure || 'N/A'}
                            </Badge>
                            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] rounded-full">
                              <CheckCircle className="h-3 w-3 mr-0.5" />
                              Included
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 rounded-full">
                        Locked
                      </Badge>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Qty</p>
                        <p className="font-medium">{parseFloat(item.quantity).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Unit Price</p>
                        <p className="font-medium">{formatCurrency(item.unit_price)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Total</p>
                        <p className="font-medium text-emerald-600">
                          {formatCurrency(parseFloat(item.total_price) || 0)}
                        </p>
                      </div>
                    </div>

                    {item.description && (
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="border rounded-xl overflow-hidden dark:border-gray-700 shadow-sm">
              <ScrollArea className="max-h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 dark:bg-gray-800/50">
                      <TableHead className="w-[50px]">
                        <span className="sr-only">Status</span>
                      </TableHead>
                      <TableHead className="min-w-[180px]">Item</TableHead>
                      <TableHead className="min-w-[120px] hidden md:table-cell">Description</TableHead>
                      <TableHead className="text-center w-[70px]">Qty</TableHead>
                      <TableHead className="text-center w-[110px]">Unit</TableHead>
                      <TableHead className="text-right w-[130px]">Unit Price</TableHead>
                      <TableHead className="text-right w-[130px]">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedItems.map((item: any) => {
                      return (
                        <TableRow
                          key={item.id}
                          className="bg-emerald-50/10 dark:bg-emerald-950/5"
                        >
                          <TableCell>
                            <div className="flex items-center justify-center">
                              <div className="relative">
                                <input
                                  type="checkbox"
                                  checked={true}
                                  disabled
                                  className="h-4 w-4 rounded border-emerald-300 bg-emerald-100 text-emerald-600 cursor-not-allowed opacity-70"
                                />
                                <Lock className="h-3 w-3 absolute -top-1 -right-1 text-emerald-600 dark:text-emerald-400 opacity-70" />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {item.item_name}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <Badge
                                  className={cn(
                                    "text-[10px] rounded-full",
                                    isService
                                      ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                                      : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                  )}
                                >
                                  {isService ? 'Service' : 'Goods'}
                                </Badge>
                                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] rounded-full">
                                  <CheckCircle className="h-3 w-3 mr-0.5" />
                                  Included
                                </Badge>
                                {item.brand && (
                                  <span className="text-xs text-muted-foreground">Brand: {item.brand}</span>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {item.description || '—'}
                            </p>
                            {item.specifications && (
                              <p className="text-xs text-muted-foreground font-mono mt-0.5">
                                {item.specifications}
                              </p>
                            )}
                          </TableCell>
                          <TableCell className="text-center font-medium">
                            {parseFloat(item.quantity).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="font-mono text-sm px-3 py-1 bg-white dark:bg-gray-900">
                              {item.unit_of_measure || 'Not set'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(item.unit_price)}
                          </TableCell>
                          <TableCell className="text-right font-medium text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(parseFloat(item.total_price) || 0)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                  <TableFooter>
                    <TableRow className="bg-muted/50 dark:bg-gray-800/50">
                      <TableCell colSpan={6} className="text-right font-semibold text-base">
                        Total Amount
                      </TableCell>
                      <TableCell className="text-right font-bold text-lg text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(totalAmount)}
                      </TableCell>
                    </TableRow>
                    {totalTax > 0 && (
                      <TableRow className="bg-muted/20 dark:bg-gray-800/20">
                        <TableCell colSpan={6} className="text-right text-sm text-muted-foreground">
                          Tax
                        </TableCell>
                        <TableCell className="text-right text-sm text-amber-600 dark:text-amber-400">
                          {formatCurrency(totalTax)}
                        </TableCell>
                      </TableRow>
                    )}
                    {totalDiscount > 0 && (
                      <TableRow className="bg-muted/20 dark:bg-gray-800/20">
                        <TableCell colSpan={6} className="text-right text-sm text-muted-foreground">
                          Discount
                        </TableCell>
                        <TableCell className="text-right text-sm text-red-500 dark:text-red-400">
                          -{formatCurrency(totalDiscount)}
                        </TableCell>
                      </TableRow>
                    )}
                    <TableRow className="bg-gradient-to-r from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/20">
                      <TableCell colSpan={6} className="text-right font-bold">
                        Grand Total
                      </TableCell>
                      <TableCell className="text-right font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(totalAmount)}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </ScrollArea>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 mt-4 bg-gray-50 dark:bg-gray-800/30 rounded-xl">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, quotationItems.length)} of {quotationItems.length}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="h-8 px-3 rounded-xl dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = (() => {
                      if (totalPages <= 5) return i + 1;
                      if (currentPage <= 3) return i + 1;
                      if (currentPage >= totalPages - 2) return totalPages - 4 + i;
                      return currentPage - 2 + i;
                    })();
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => onPageChange(pageNum)}
                        className={cn(
                          "h-8 w-8 p-0 rounded-xl",
                          currentPage === pageNum && "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700"
                        )}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="h-8 px-3 rounded-xl dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Full Item Count Display */}
          <div className="mt-4 p-4 bg-emerald-50/30 dark:bg-emerald-950/10 rounded-xl border border-emerald-200/50 dark:border-emerald-800/30">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">All {totalItems} items are included</span>
                <Badge className="bg-emerald-200 text-emerald-800 dark:bg-emerald-800/30 dark:text-emerald-300 border-0 rounded-full">
                  <Lock className="h-3 w-3 mr-1" />
                  Locked
                </Badge>
              </div>
              <span className="text-sm text-muted-foreground">
                Total: {formatCurrency(totalAmount)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How to Remove Items Section */}
      <div className="space-y-3 mt-6 p-4 bg-gradient-to-br from-purple-50/50 to-indigo-50/50 dark:from-purple-950/20 dark:to-indigo-950/20 rounded-xl border border-purple-200/50 dark:border-purple-800/30">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/30">
            <GitBranch className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
          <h4 className="text-sm font-semibold text-purple-800 dark:text-purple-300">
            How to Remove Items from This Order
          </h4>
        </div>
        <p className="text-sm text-purple-700 dark:text-purple-300">
          Items cannot be removed from a purchase order once created from an approved requisition.
          To exclude items, you must:
        </p>
        <ol className="list-decimal list-inside text-sm text-purple-700 dark:text-purple-300 space-y-1 ml-2">
          <li>
            <span className="font-medium">Cancel this current purchase order</span>
            <p className="text-xs text-purple-600 dark:text-purple-400 ml-6">This will mark the order as CANCELLED</p>
          </li>
          <li>
            <span className="font-medium">Create a new requisition</span>
            <p className="text-xs text-purple-600 dark:text-purple-400 ml-6">Include only the items you want to purchase</p>
          </li>
          <li>
            <span className="font-medium">Get full approval</span>
            <p className="text-xs text-purple-600 dark:text-purple-400 ml-6">The new requisition must go through all approval stages</p>
          </li>
          <li>
            <span className="font-medium">Generate a new purchase order</span>
            <p className="text-xs text-purple-600 dark:text-purple-400 ml-6">From the new requisition with only the selected items</p>
          </li>
        </ol>
        <div className="flex flex-wrap gap-2 mt-2">
          <Button
            variant="outline"
            size="sm"
            className="border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/20 rounded-xl"
            onClick={onNewRequisition}
          >
            <PlusCircle className="h-4 w-4 mr-1.5" />
            Create New Requisition
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl"
            onClick={onCancelRequisition}
          >
            <XCircle className="h-4 w-4 mr-1.5" />
            Cancel This Order
          </Button>
        </div>
      </div>
    </div>
  );
});

Step2ViewItems.displayName = 'Step2ViewItems';

// ============================================
// STEP 3: ORDER DETAILS
// ============================================

const Step3OrderDetails = memo(({
  deliveryDate,
  setDeliveryDate,
  validityDate,
  setValidityDate,
  deliveryTerms,
  setDeliveryTerms,
  paymentTerms,
  setPaymentTerms,
  warrantyTerms,
  setWarrantyTerms,
  specialInstructions,
  setSpecialInstructions,
  isService,
  requisition,
}: {
  deliveryDate: string;
  setDeliveryDate: (value: string) => void;
  validityDate: string;
  setValidityDate: (value: string) => void;
  deliveryTerms: string;
  setDeliveryTerms: (value: string) => void;
  paymentTerms: string;
  setPaymentTerms: (value: string) => void;
  warrantyTerms: string;
  setWarrantyTerms: (value: string) => void;
  specialInstructions: string;
  setSpecialInstructions: (value: string) => void;
  isService: boolean;
  requisition: any;
}) => {
  const isServiceRequisition = requisition?.is_service_requisition || false;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <ClipboardList className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Step 3: Order Details
        </h3>
        <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full text-[10px] ml-2">
          Optional
        </Badge>
      </div>

      <GuideTip
        step={3}
        title="Add order details and terms"
        description="Specify delivery dates, payment terms, and any special instructions for the supplier."
        icon={Calendar}
      />

      <Alert className="border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl">
        <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <AlertDescription className="text-amber-700 dark:text-amber-300 text-sm">
          Provide additional details about your {isService ? 'service order' : 'purchase order'} including dates and terms.
        </AlertDescription>
      </Alert>

      <Card className="border-0 shadow-sm rounded-xl">
        <CardContent className="p-6 space-y-6">
          {/* Service Details (if service) */}
          {isServiceRequisition && requisition && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Service Details</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {requisition.service_category && (
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-muted-foreground">Service Category</p>
                    <p className="font-medium text-gray-900 dark:text-white">{requisition.service_category_label || requisition.service_category}</p>
                  </div>
                )}
                {requisition.service_estimated_duration_days && (
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-muted-foreground">Estimated Duration</p>
                    <p className="font-medium text-gray-900 dark:text-white">{requisition.service_estimated_duration_days} days</p>
                  </div>
                )}
                {requisition.service_expected_start_date && (
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-muted-foreground">Expected Start Date</p>
                    <p className="font-medium text-gray-900 dark:text-white">{formatDate(requisition.service_expected_start_date)}</p>
                  </div>
                )}
                {requisition.service_expected_end_date && (
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-muted-foreground">Expected End Date</p>
                    <p className="font-medium text-gray-900 dark:text-white">{formatDate(requisition.service_expected_end_date)}</p>
                  </div>
                )}
              </div>
              <Separator />
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="delivery-date" className="text-sm font-medium">
                Expected {isService ? 'Completion' : 'Delivery'} Date <span className="text-red-500">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-11 text-sm rounded-xl dark:bg-gray-900 dark:border-gray-700",
                      !deliveryDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {deliveryDate ? format(new Date(deliveryDate), "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-xl">
                  <CalendarComponent
                    mode="single"
                    selected={deliveryDate ? new Date(deliveryDate) : undefined}
                    onSelect={(date) => setDeliveryDate(date ? format(date, 'yyyy-MM-dd') : '')}
                  />
                </PopoverContent>
              </Popover>
              <p className="text-xs text-muted-foreground">
                {isService
                  ? 'When should the service be completed?'
                  : 'When should the goods be delivered?'}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="validity-date" className="text-sm font-medium">
                Validity Date <span className="text-red-500">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-11 text-sm rounded-xl dark:bg-gray-900 dark:border-gray-700",
                      !validityDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {validityDate ? format(new Date(validityDate), "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-xl">
                  <CalendarComponent
                    mode="single"
                    selected={validityDate ? new Date(validityDate) : undefined}
                    onSelect={(date) => setValidityDate(date ? format(date, 'yyyy-MM-dd') : '')}
                  />
                </PopoverContent>
              </Popover>
              <p className="text-xs text-muted-foreground">
                The date until which this order is valid
              </p>
            </div>
          </div>

          {/* Terms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="delivery-terms" className="text-sm font-medium">
                {isService ? 'Service Terms' : 'Delivery Terms'}
              </Label>
              <Input
                id="delivery-terms"
                placeholder={isService ? "e.g., On-site service, Remote support" : "e.g., FOB, CIF, Ex-Works"}
                value={deliveryTerms}
                onChange={(e) => setDeliveryTerms(e.target.value)}
                className="rounded-xl border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-xs text-muted-foreground">
                {isService
                  ? 'Specify how the service will be delivered'
                  : 'Specify the delivery terms and conditions'}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-terms" className="text-sm font-medium">
                Payment Terms
              </Label>
              <Input
                id="payment-terms"
                placeholder="e.g., 30 days net, 50% advance, Cash on Delivery"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="rounded-xl border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-xs text-muted-foreground">
                Specify the payment terms and conditions
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="warranty-terms" className="text-sm font-medium">
              {isService ? 'Service Warranty' : 'Warranty Terms'}
            </Label>
            <Input
              id="warranty-terms"
              placeholder={isService ? "e.g., 6 months service warranty" : "e.g., 12 months, 2 years"}
              value={warrantyTerms}
              onChange={(e) => setWarrantyTerms(e.target.value)}
              className="rounded-xl border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500"
            />
            <p className="text-xs text-muted-foreground">
              {isService
                ? 'Specify the warranty terms for the service'
                : 'Specify the warranty terms for the goods'}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="special-instructions" className="text-sm font-medium">
              {isService ? 'Service Instructions' : 'Special Instructions'}
            </Label>
            <Textarea
              id="special-instructions"
              placeholder={isService
                ? "Add any special conditions, service requirements, quality standards, or other notes..."
                : "Add any special conditions, delivery instructions, quality requirements, or other notes..."}
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              rows={4}
              className="rounded-xl resize-none border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500"
            />
            <p className="text-xs text-muted-foreground">
              Any additional instructions or requirements for the supplier
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

Step3OrderDetails.displayName = 'Step3OrderDetails';

// ============================================
// STEP 4: REVIEW & SUBMIT
// ============================================

const Step4ReviewSubmit = memo(({
  supplierQuotation,
  supplierDisplayName,
  selectedItemsDetails,
  totalAmount,
  deliveryDate,
  validityDate,
  deliveryTerms,
  paymentTerms,
  warrantyTerms,
  specialInstructions,
  isService,
  requisition,
  selectedItems,
  hasSelectedItems,
  orderType,
  isSubmitting,
  onConfirm,
  onBack,
}: {
  supplierQuotation: any;
  supplierDisplayName: string;
  selectedItemsDetails: any[];
  totalAmount: number;
  deliveryDate: string;
  validityDate: string;
  deliveryTerms: string;
  paymentTerms: string;
  warrantyTerms: string;
  specialInstructions: string;
  isService: boolean;
  requisition: any;
  selectedItems: number[];
  hasSelectedItems: boolean;
  orderType: string;
  isSubmitting: boolean;
  onConfirm: () => void;
  onBack: () => void;
}) => {
  // Calculate totals from selected items
  const itemsTotal = selectedItemsDetails.reduce((sum, item) => sum + (parseFloat(item.total_price) || 0), 0);
  const totalTax = selectedItemsDetails.reduce((sum, item) => sum + (parseFloat(item.tax_amount) || 0), 0);
  const totalDiscount = selectedItemsDetails.reduce((sum, item) => sum + (parseFloat(item.discount_amount) || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <ListChecks className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Step 4: Review & Submit
        </h3>
        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full text-[10px] ml-2">
          Final Step
        </Badge>
      </div>

      <GuideTip
        step={4}
        title="Review before submission"
        description="Double-check all items, dates, terms, and totals before creating the order."
        icon={FileCheck}
      />

      <Alert className="border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl">
        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <AlertDescription className="text-amber-700 dark:text-amber-300 text-sm">
          <strong>Please review your {isService ? 'service order' : 'purchase order'} carefully before submitting.</strong>
          <br />
          Once submitted, the order will be created and sent for approval.
        </AlertDescription>
      </Alert>

      {/* Order Summary Card */}
      <Card className="border-0 shadow-sm rounded-xl overflow-hidden">
        <CardHeader className="pb-3 bg-gradient-to-br from-gray-50/50 to-gray-100/30 dark:from-gray-800/30 dark:to-gray-900/20">
          <CardTitle className="text-base flex items-center gap-2">
            <FileCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            Order Summary
          </CardTitle>
          <CardDescription>
            Review all order details before submission
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Order Header */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-xl",
                isService
                  ? "bg-purple-100 dark:bg-purple-900/30"
                  : "bg-emerald-100 dark:bg-emerald-900/30"
              )}>
                {isService ? (
                  <Briefcase className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                ) : (
                  <Package className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Document Type</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {isService ? 'Local Service Order (LSO)' : 'Local Purchase Order (LPO)'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(totalAmount)}
              </p>
            </div>
          </div>

          <Separator />

          {/* Two Column Grid - Order Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Items & Quantities */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Items ({selectedItems.length})
                </p>
              </div>

              <div className="border rounded-xl overflow-hidden dark:border-gray-700">
                <div className="max-h-[250px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30 dark:bg-gray-800/30 sticky top-0 z-10">
                        <TableHead className="py-2 text-xs font-medium">Item</TableHead>
                        <TableHead className="py-2 text-center text-xs font-medium">Qty</TableHead>
                        <TableHead className="py-2 text-right text-xs font-medium">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedItemsDetails.slice(0, 15).map((item: any) => (
                        <TableRow key={item.id} className="hover:bg-transparent">
                          <TableCell className="py-2 text-sm">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{item.item_name}</p>
                              {item.description && (
                                <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="py-2 text-center text-sm text-gray-600 dark:text-gray-400">
                            {parseFloat(item.quantity).toLocaleString()} {item.unit_of_measure || ''}
                          </TableCell>
                          <TableCell className="py-2 text-right text-sm font-medium text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(parseFloat(item.total_price) || 0)}
                          </TableCell>
                        </TableRow>
                      ))}
                      {selectedItemsDetails.length > 15 && (
                        <TableRow>
                          <TableCell colSpan={3} className="py-2 text-center text-sm text-muted-foreground">
                            +{selectedItemsDetails.length - 15} more items
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                    <TableFooter className="sticky bottom-0">
                      <TableRow className="bg-muted/30 dark:bg-gray-800/30">
                        <TableCell colSpan={2} className="py-2 text-right font-medium">
                          Subtotal
                        </TableCell>
                        <TableCell className="py-2 text-right font-medium text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(itemsTotal)}
                        </TableCell>
                      </TableRow>
                      {totalTax > 0 && (
                        <TableRow className="bg-muted/20 dark:bg-gray-800/20">
                          <TableCell colSpan={2} className="py-2 text-right text-sm text-muted-foreground">
                            Tax
                          </TableCell>
                          <TableCell className="py-2 text-right text-sm text-amber-600 dark:text-amber-400">
                            {formatCurrency(totalTax)}
                          </TableCell>
                        </TableRow>
                      )}
                      {totalDiscount > 0 && (
                        <TableRow className="bg-muted/20 dark:bg-gray-800/20">
                          <TableCell colSpan={2} className="py-2 text-right text-sm text-muted-foreground">
                            Discount
                          </TableCell>
                          <TableCell className="py-2 text-right text-sm text-red-500 dark:text-red-400">
                            -{formatCurrency(totalDiscount)}
                          </TableCell>
                        </TableRow>
                      )}
                      <TableRow className="bg-gradient-to-r from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/20">
                        <TableCell colSpan={2} className="py-2 text-right font-bold">
                          Total
                        </TableCell>
                        <TableCell className="py-2 text-right font-bold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(totalAmount)}
                        </TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </div>
              </div>

              {/* Item count badge */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Showing {Math.min(selectedItemsDetails.length, 15)} of {selectedItemsDetails.length} items</span>
                {selectedItemsDetails.length > 15 && (
                  <span className="text-amber-600 dark:text-amber-400">
                    Scroll for more →
                  </span>
                )}
              </div>

              {/* LPO/LSO Info Tip */}
              <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    <strong>Tip:</strong> {isService
                      ? 'LSOs are used for service-based purchases like consulting, maintenance, training, or installation services.'
                      : 'LPOs are used for purchasing physical goods like equipment, supplies, materials, or inventory items.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Details */}
            <div className="space-y-4">
              {/* Supplier Info */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Supplier</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-700">
                  <p className="font-medium text-gray-900 dark:text-white">{supplierDisplayName}</p>
                  {supplierQuotation?.supplier_reference_no && (
                    <p className="text-xs text-muted-foreground">Ref: {supplierQuotation.supplier_reference_no}</p>
                  )}
                </div>
              </div>

              {/* Dates */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Important Dates</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-700 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Issue Date</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(new Date())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Expected {isService ? 'Completion' : 'Delivery'}</span>
                    <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{formatDate(deliveryDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Valid Until</span>
                    <span className="text-sm font-medium text-amber-600 dark:text-amber-400">{formatDate(validityDate)}</span>
                  </div>
                </div>
              </div>

              {/* Terms */}
              {(deliveryTerms || paymentTerms || warrantyTerms) && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Terms & Conditions</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-700 space-y-1.5">
                    {deliveryTerms && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">{isService ? 'Service' : 'Delivery'} Terms</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{deliveryTerms}</span>
                      </div>
                    )}
                    {paymentTerms && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Payment Terms</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{paymentTerms}</span>
                      </div>
                    )}
                    {warrantyTerms && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">{isService ? 'Service Warranty' : 'Warranty'}</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{warrantyTerms}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Special Instructions */}
              {specialInstructions && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Instructions</p>
                  </div>
                  <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-200/50 dark:border-amber-800/50">
                    <p className="text-sm text-gray-700 dark:text-gray-300">{specialInstructions}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Requisition Reference */}
          {requisition && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1.5">
                  <FileText className="h-4 w-4" />
                  Requisition: {requisition.reference_number || 'N/A'}
                </span>
                {requisition.department && (
                  <span className="flex items-center gap-1.5">
                    <Building2 className="h-4 w-4" />
                    {requisition.department.name}
                  </span>
                )}
                {isService && requisition.service_category && (
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="h-4 w-4" />
                    {requisition.service_category_label || requisition.service_category}
                  </span>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isSubmitting}
          className="rounded-xl px-6 h-11 border-gray-300 dark:border-gray-600"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={onConfirm}
          disabled={!hasSelectedItems || isSubmitting}
          className={cn(
            "rounded-xl px-8 h-11 gap-2 font-medium",
            hasSelectedItems
              ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-600/20 text-white"
              : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
          )}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Create {isService ? 'Service Order' : 'Order'}
            </>
          )}
        </Button>
      </div>
    </div>
  );
});

Step4ReviewSubmit.displayName = 'Step4ReviewSubmit';

// ============================================
// MAIN PAGE
// ============================================

export default function CreatePurchaseOrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const quotationId = searchParams.get('quotation_id');

  // State
  const [currentStep, setCurrentStep] = useState(1);
  const [orderType, setOrderType] = useState<'lpo' | 'lso'>('lpo');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [validityDate, setValidityDate] = useState('');
  const [deliveryTerms, setDeliveryTerms] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [warrantyTerms, setWarrantyTerms] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');

  // Hooks
  const {
    data: supplierQuotation,
    isLoading: isLoadingQuotation,
    error: fetchError,
    refetch
  } = useSupplierQuotation(
    quotationId ? parseInt(quotationId) : 0
  );

  const { useAllSuppliers } = useSuppliers();
  const { data: suppliersData, isLoading: isLoadingSuppliers } = useAllSuppliers();

  const createPurchaseOrder = useCreatePurchaseOrder();

  // Derived data
  const supplierQuotationData = supplierQuotation as any;

  const requisition = useMemo(() => {
    return supplierQuotationData?.quotation_request?.requisition || null;
  }, [supplierQuotationData]);

  const isService = useMemo(() => {
    return requisition?.is_service_requisition === true ||
      requisition?.requisition_type === 'services' ||
      requisition?.order_type === 'LSO';
  }, [requisition]);

  const determinedOrderType = useMemo(() => {
    if (isService) return 'lso';
    return 'lpo';
  }, [isService]);

  useEffect(() => {
    if (determinedOrderType) {
      setOrderType(determinedOrderType);
    }
  }, [determinedOrderType]);

  // ALL ITEMS ARE ALWAYS SELECTED - NO REMOVAL ALLOWED
  const quotationItems = useMemo(() => {
    if (!supplierQuotationData?.items) return [];
    return supplierQuotationData.items;
  }, [supplierQuotationData]);

  // All items are selected by default - this will NEVER change
  const selectedItems = useMemo(() => {
    return quotationItems.map((item: any) => item.id);
  }, [quotationItems]);

  const supplierId = useMemo(() => {
    return supplierQuotationData?.supplier_id || null;
  }, [supplierQuotationData]);

  const supplier = useMemo(() => {
    if (!supplierId || !Array.isArray(suppliersData)) return null;
    return suppliersData.find((s: any) => s.id === supplierId) || null;
  }, [supplierId, suppliersData]);

  // Set default dates
  useEffect(() => {
    if (!deliveryDate) {
      const date = new Date();
      date.setDate(date.getDate() + 30);
      setDeliveryDate(date.toISOString().split('T')[0]);
    }
  }, [deliveryDate]);

  useEffect(() => {
    if (!validityDate) {
      const date = new Date();
      date.setDate(date.getDate() + 30);
      setValidityDate(date.toISOString().split('T')[0]);
    }
  }, [validityDate]);

  // Calculate totals
  const { totalAmount, selectedItemsDetails } = useMemo(() => {
    if (quotationItems.length === 0) {
      return { totalAmount: 0, selectedItemsDetails: [] };
    }

    // All items are always selected
    const total = quotationItems.reduce((sum: number, item: any) => {
      const price = parseFloat(item.total_price) || 0;
      return sum + price;
    }, 0);

    return { totalAmount: total, selectedItemsDetails: quotationItems };
  }, [quotationItems]);

  const hasSelectedItems = selectedItems.length > 0;

  // Paginated items
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return quotationItems.slice(start, end);
  }, [quotationItems, currentPage]);

  const totalPages = Math.ceil(quotationItems.length / ITEMS_PER_PAGE);

  // Step labels
  const stepLabels = useMemo(() => {
    return ['Quotation Info', 'Review Items', 'Order Details', 'Review & Submit'];
  }, []);

  // Handlers - REMOVED item toggle functionality
  // Items cannot be toggled - they are always selected

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];

    // Always validate that all items are included
    if (selectedItems.length !== quotationItems.length) {
      errors.push(`All ${quotationItems.length} items must be included. Currently ${selectedItems.length} selected.`);
    }

    if (!deliveryDate) {
      errors.push('Expected delivery date is required');
    }

    if (!validityDate) {
      errors.push('Validity date is required');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const goToNextStep = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
      return;
    }

    if (currentStep === 2) {
      // No validation needed - all items are always selected
      setCurrentStep(3);
      return;
    }

    if (currentStep === 3) {
      if (!deliveryDate) {
        setValidationErrors(['Expected delivery date is required']);
        return;
      }
      if (!validityDate) {
        setValidationErrors(['Validity date is required']);
        return;
      }
      setValidationErrors([]);
      setCurrentStep(4);
      return;
    }
  };

  const goToPreviousStep = () => {
    setCurrentStep(Math.max(currentStep - 1, 1));
  };

  const handleSubmit = () => {
    if (!supplierQuotationData) return;
    if (!validateForm()) return;

    // ✅ FIXED: Directly submit without confirmation modal
    // Step 4 already has a "Create" button, no need for double confirmation
    handleConfirmSubmit();
  };

  // ✅ FIXED: Removed the separate confirmation modal and validation for requisition_item_id
  const handleConfirmSubmit = async () => {
    if (!supplierQuotationData) return;

    setIsSubmitting(true);

    try {
      const requisitionId = supplierQuotationData.quotation_request?.requisition_id;


      const itemsPayload = selectedItemsDetails.map((item: any) => ({
        // ✅ FIXED: Allow null/undefined requisition_item_id - backend will handle it
        requisition_item_id: item.requisition_item_id || null,
        item_name: item.item_name,
        description: item.description || undefined,
        unit_of_measure: item.unit_of_measure || (isService ? 'Service' : 'pcs'),
        quantity: parseFloat(item.quantity) || 0,
        unit_price: parseFloat(item.unit_price) || 0,
        tax_rate: parseFloat(item.tax_rate) || 0,
        discount_rate: parseFloat(item.discount_rate) || 0,
        delivery_days: item.delivery_days || 30,
        warranty_months: item.warranty_months || 12,
        specifications: item.specifications || undefined,
        brand: item.brand || undefined,
        model: item.model || undefined,
      }));

      // ✅ REMOVED: The validation that was blocking items without requisition_item_id
      // Backend will handle items with null/0 requisition_item_id

      const payload: CreatePurchaseOrderData = {
        requisition_id: requisitionId,
        type: orderType,
        title: `${isService ? 'Service Order' : 'Purchase Order'} from ${supplierQuotationData.quotation_number || 'Quotation'}`,
        description: specialInstructions || undefined,
        issue_date: new Date().toISOString().split('T')[0],
        expected_delivery_date: deliveryDate || undefined,
        delivery_terms: deliveryTerms || undefined,
        payment_terms: paymentTerms || undefined,
        special_conditions: warrantyTerms || undefined,
        validity_period_days: 30,
        currency: CURRENCY,
        items: itemsPayload,
      };

      const result = await createPurchaseOrder.mutateAsync(payload);

      if (result?.id) {
        router.push(`/procurement/purchase-orders/${result.id}`);
      } else {
        router.push('/procurement/purchase-orders');
      }
    } catch (err: any) {
      console.error('Create PO error:', err);
      console.error('Error response:', err?.response?.data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setShowCancelDialog(true);
  };

  const handleConfirmCancel = () => {
    setShowCancelDialog(false);
    router.push('/procurement/approved-quotations');
  };

  const handleBack = () => {
    router.back();
  };

  const handleRefresh = () => {
    refetch();
  };

  const isLoading = isLoadingQuotation || isLoadingSuppliers;

  // Supplier display data
  const supplierDisplayName = supplier?.company_name || supplier?.full_name || supplierQuotationData?.supplier?.full_name || 'Unknown Supplier';
  const supplierEmail = supplier?.company_email || supplier?.email || supplierQuotationData?.supplier?.email || 'No email';
  const supplierPhone = supplier?.company_phone || supplier?.phone || supplierQuotationData?.supplier?.phone || 'N/A';
  const supplierContactPerson = supplier?.contact_person_name || 'N/A';
  const supplierAddress = supplier?.company_address || 'N/A';
  const supplierRegistration = supplier?.company_registration || 'N/A';

  // Error state
  if (fetchError) {
    return (
      <PageTemplate
        title="Create Purchase Order"
        description="Error loading quotation"
        icon={<AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />}
        background="gradient"
        variant="default"
        breadcrumbs={[
          { label: 'Procurement', href: '/procurement' },
          { label: 'Purchase Orders', href: '/procurement/purchase-orders' },
          { label: 'Create' },
        ]}
      >
        <Card className="border-0 shadow-sm rounded-xl">
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
            <h3 className="text-xl font-medium mb-2">Failed to Load Quotation</h3>
            <p className="text-muted-foreground">
              {fetchError?.message || 'Could not load the supplier quotation. Please try again.'}
            </p>
            <Button onClick={() => router.push('/procurement/approved-quotations')} className="mt-4 rounded-xl">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Approved Quotations
            </Button>
          </CardContent>
        </Card>
      </PageTemplate>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <PageTemplate
        title="Create Purchase Order"
        description="Loading quotation details..."
        icon={<FileText className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />}
        background="gradient"
        variant="default"
        breadcrumbs={[
          { label: 'Procurement', href: '/procurement' },
          { label: 'Purchase Orders', href: '/procurement/purchase-orders' },
          { label: 'Create' },
        ]}
      >
        <div className="space-y-6">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      </PageTemplate>
    );
  }

  // Not found
  if (!supplierQuotationData || !quotationId) {
    return (
      <PageTemplate
        title="Create Purchase Order"
        description="Quotation not found"
        icon={<AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />}
        background="gradient"
        variant="default"
        breadcrumbs={[
          { label: 'Procurement', href: '/procurement' },
          { label: 'Purchase Orders', href: '/procurement/purchase-orders' },
          { label: 'Create' },
        ]}
      >
        <Card className="border-0 shadow-sm rounded-xl">
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">Quotation Not Found</h3>
            <p className="text-muted-foreground">
              The supplier quotation you're trying to create a purchase order for doesn't exist.
            </p>
            <Button onClick={() => router.push('/procurement/approved-quotations')} className="mt-4 rounded-xl">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Approved Quotations
            </Button>
          </CardContent>
        </Card>
      </PageTemplate>
    );
  }

  // Check if quotation is accepted
  if (supplierQuotationData.status !== 'accepted') {
    return (
      <PageTemplate
        title="Create Purchase Order"
        description="Quotation not accepted"
        icon={<AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />}
        background="gradient"
        variant="default"
        breadcrumbs={[
          { label: 'Procurement', href: '/procurement' },
          { label: 'Purchase Orders', href: '/procurement/purchase-orders' },
          { label: 'Create' },
        ]}
      >
        <Card className="border-0 shadow-sm rounded-xl">
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-16 w-16 mx-auto text-amber-500 mb-4" />
            <h3 className="text-xl font-medium mb-2">Quotation Not Accepted</h3>
            <p className="text-muted-foreground">
              This quotation ({supplierQuotationData.quotation_number}) has not been accepted yet.
              Only accepted quotations can be converted to purchase orders.
            </p>
            <Button onClick={() => router.push(`/procurement/approved-quotations`)} className="mt-4 rounded-xl">
              <Eye className="h-4 w-4 mr-2" />
              View Approved Quotations
            </Button>
          </CardContent>
        </Card>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title={`Create ${isService ? 'Service Order (LSO)' : 'Purchase Order (LPO)'}`}
      description={`Convert quotation ${supplierQuotationData.quotation_number} to a ${isService ? 'service order' : 'purchase order'}`}
      icon={<FileText className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />}
      background="gradient"
      variant="default"
      breadcrumbs={[
        { label: 'Procurement', href: '/procurement' },
        { label: 'Purchase Orders', href: '/procurement/purchase-orders' },
        { label: 'Create' },
      ]}
      actions={
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={cn(
            "rounded-full px-4 py-1.5",
            isService
              ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
              : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
          )}>
            {isService ? (
              <Briefcase className="h-3.5 w-3.5 mr-1.5" />
            ) : (
              <Package className="h-3.5 w-3.5 mr-1.5" />
            )}
            {isService ? 'LSO' : 'LPO'}
          </Badge>
          <Badge className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 rounded-full px-4 py-1.5">
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            {selectedItems.length} Items
          </Badge>
          <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 rounded-full px-4 py-1.5">
            <Wallet className="h-3.5 w-3.5 mr-1.5" />
            {formatCurrency(totalAmount)}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="gap-2 h-10 rounded-xl dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            Refresh
          </Button>
          <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2 h-10 rounded-xl">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Step Indicator */}
        <StepIndicator
          currentStep={currentStep}
          totalSteps={4}
          labels={stepLabels}
        />

        {/* Step Content */}
        <div className="min-h-[400px]">
          {currentStep === 1 && (
            <Step1QuotationInfo
              supplierQuotation={supplierQuotationData}
              supplierDisplayName={supplierDisplayName}
              supplierEmail={supplierEmail}
              supplierPhone={supplierPhone}
              supplierContactPerson={supplierContactPerson}
              supplierAddress={supplierAddress}
              supplierRegistration={supplierRegistration}
              isService={isService}
              requisition={requisition}
              quotationItems={quotationItems}
            />
          )}

          {currentStep === 2 && (
            <Step2ViewItems
              quotationItems={quotationItems}
              paginatedItems={paginatedItems}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              totalAmount={totalAmount}
              isService={isService}
              requisition={requisition}
              onCancelRequisition={handleCancel}
              onNewRequisition={() => router.push('/procurement/requisitions/create')}
            />
          )}

          {currentStep === 3 && (
            <Step3OrderDetails
              deliveryDate={deliveryDate}
              setDeliveryDate={setDeliveryDate}
              validityDate={validityDate}
              setValidityDate={setValidityDate}
              deliveryTerms={deliveryTerms}
              setDeliveryTerms={setDeliveryTerms}
              paymentTerms={paymentTerms}
              setPaymentTerms={setPaymentTerms}
              warrantyTerms={warrantyTerms}
              setWarrantyTerms={setWarrantyTerms}
              specialInstructions={specialInstructions}
              setSpecialInstructions={setSpecialInstructions}
              isService={isService}
              requisition={requisition}
            />
          )}

          {currentStep === 4 && (
            <Step4ReviewSubmit
              supplierQuotation={supplierQuotationData}
              supplierDisplayName={supplierDisplayName}
              selectedItemsDetails={selectedItemsDetails}
              totalAmount={totalAmount}
              deliveryDate={deliveryDate}
              validityDate={validityDate}
              deliveryTerms={deliveryTerms}
              paymentTerms={paymentTerms}
              warrantyTerms={warrantyTerms}
              specialInstructions={specialInstructions}
              isService={isService}
              requisition={requisition}
              selectedItems={selectedItems}
              hasSelectedItems={hasSelectedItems}
              orderType={orderType}
              isSubmitting={isSubmitting}
              onConfirm={handleSubmit}
              onBack={goToPreviousStep}
            />
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div>
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={goToPreviousStep}
                disabled={isSubmitting}
                className="gap-2 h-10 rounded-xl dark:border-gray-700 dark:hover:bg-gray-800"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {currentStep < 4 && (
              <Button
                type="button"
                onClick={goToNextStep}
                disabled={isSubmitting}
                className="gap-2 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}

            {currentStep === 4 && (
              <Button
                type="button"
                onClick={handleSubmit}
                className="gap-2 px-8 min-w-[160px] h-11 text-base rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-600/20"
                disabled={!hasSelectedItems || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Create {isService ? 'Service Order' : 'Order'}
                  </>
                )}
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="h-10 rounded-xl dark:border-gray-700 dark:hover:bg-gray-800"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>

      {/* Cancel Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent className="max-w-lg rounded-2xl backdrop-blur-xl bg-white/80 dark:bg-gray-900/90 border border-white/20 dark:border-gray-700/50 shadow-2xl p-0 overflow-hidden">
          <div className="p-6 border-b border-white/10 dark:border-gray-700/30 bg-gradient-to-br from-red-50/50 to-rose-50/50 dark:from-red-950/20 dark:to-rose-950/20">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-red-100/50 dark:bg-red-900/30 backdrop-blur-sm border border-white/20 dark:border-gray-700/50">
                <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <AlertDialogTitle className="text-xl font-bold">Cancel Order Creation</AlertDialogTitle>
                <AlertDialogDescription className="text-sm text-gray-500 dark:text-gray-400">
                  Are you sure you want to cancel creating this {isService ? 'service order' : 'purchase order'}?
                </AlertDialogDescription>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="p-4 rounded-xl bg-amber-50/30 dark:bg-amber-950/20 backdrop-blur-sm border border-amber-200/30 dark:border-amber-800/30">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-700 dark:text-amber-300">
                  <p className="font-semibold">Your progress will be lost</p>
                  <p className="text-xs mt-0.5">You'll be returned to the approved quotations page.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-white/10 dark:border-gray-700/30 bg-muted/10 dark:bg-gray-800/10 flex justify-end gap-3">
            <AlertDialogCancel className="rounded-xl px-6">
              Continue Editing
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              className="bg-red-600 hover:bg-red-700 rounded-xl px-6 text-white shadow-lg shadow-red-600/20"
            >
              Yes, Cancel Creation
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </PageTemplate>
  );
}
