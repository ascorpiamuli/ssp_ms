// frontend/src/app/(dashboard)/requisitions/[id]/components/RequisitionProcurementTab.tsx

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ShoppingCart,
  CheckCircle,
  XCircle,
  Loader2,
  Clock,
  FileCheck,
  Users,
  Truck,
  Receipt,
  Layers,
  History,
  ArrowRight,
  Circle,
  Zap,
  RotateCcw,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Calendar,
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Link2,
  Briefcase,
  CreditCard,
  CalendarDays,
  Timer,
  Target,
  Rocket,
  Star,
  Heart,
  Flame,
  FileText,
  MessageSquare,
  Shield,
  Award,
  Gem,
  Crown,
  Info,
  Activity,
  Package,
  Box,
  Send,
  Check,
  X,
  AlertCircle,
  ChevronRight,
  Clock as ClockIcon,
  Calendar as CalendarIcon,
  UserCheck,
  UserX,
  UserPlus,
  UserMinus,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  RefreshCw,
  FilterX,
  Printer,
  Download,
  Share2,
  Bookmark,
  Flag,
  Camera,
  Video,
  Music,
  Code,
  Cloud,
  Database,
  Server,
  Wifi,
  Bluetooth,
  Battery,
  Lightbulb,
  HeartPulse,
  Brain,
  Cpu,
  HardDrive,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Headphones,
  Speaker,
  Mic,
  Mail as MailIcon,
  Phone as PhoneIcon,
  Globe as GlobeIcon,
  MapPin as MapPinIcon,
  Clock as ClockIcon2,
  User as UserIcon,
  Settings,
  Menu,
  MoreHorizontal,
  MoreVertical as MoreVerticalIcon,
  Bell,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

// Helper functions
const formatDate = (date: string | Date | null): string => {
  if (!date) return 'N/A';
  try {
    return format(new Date(date), 'dd MMM yyyy, HH:mm');
  } catch {
    return 'Invalid Date';
  }
};

const formatDateShort = (date: string | Date | null): string => {
  if (!date) return 'N/A';
  try {
    return format(new Date(date), 'dd MMM yyyy');
  } catch {
    return 'Invalid Date';
  }
};

const formatTime = (date: string | Date | null): string => {
  if (!date) return 'N/A';
  try {
    return format(new Date(date), 'HH:mm');
  } catch {
    return 'Invalid Date';
  }
};

// Helper to get user name from various formats
const getUserName = (user: any): string => {
  if (!user) return 'Unknown';
  if (typeof user === 'string') return user;
  if (user.full_name) return user.full_name;
  if (user.name) return user.name;
  if (user.first_name && user.last_name) return `${user.first_name} ${user.last_name}`;
  if (user.first_name) return user.first_name;
  if (user.email) return user.email;
  return 'Unknown';
};

// Helper to get user email
const getUserEmail = (user: any): string | null => {
  if (!user) return null;
  if (typeof user === 'string') return null;
  if (user.email) return user.email;
  return null;
};

// Color palette for timeline items
const getColorForAction = (action: string): { bg: string; border: string; dot: string; badge: string } => {
  const colorMap: Record<string, { bg: string; border: string; dot: string; badge: string }> = {
    'procurement_started': { bg: 'bg-blue-500', border: 'border-blue-500', dot: 'bg-blue-500', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800' },
    'procurement_completed': { bg: 'bg-emerald-500', border: 'border-emerald-500', dot: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' },
    'procurement_cancelled': { bg: 'bg-red-500', border: 'border-red-500', dot: 'bg-red-500', badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800' },
    'qtn_generated': { bg: 'bg-indigo-500', border: 'border-indigo-500', dot: 'bg-indigo-500', badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800' },
    'qtn_sent': { bg: 'bg-blue-400', border: 'border-blue-400', dot: 'bg-blue-400', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800' },
    'qtn_reminder_sent': { bg: 'bg-amber-400', border: 'border-amber-400', dot: 'bg-amber-400', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800' },
    'quotation_submitted': { bg: 'bg-green-500', border: 'border-green-500', dot: 'bg-green-500', badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800' },
    'quotation_verified': { bg: 'bg-emerald-400', border: 'border-emerald-400', dot: 'bg-emerald-400', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' },
    'quotation_evaluated': { bg: 'bg-amber-500', border: 'border-amber-500', dot: 'bg-amber-500', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800' },
    'qtn_closed': { bg: 'bg-purple-500', border: 'border-purple-500', dot: 'bg-purple-500', badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800' },
    'supplier_selected': { bg: 'bg-amber-600', border: 'border-amber-600', dot: 'bg-amber-600', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800' },
    'po_generated': { bg: 'bg-purple-600', border: 'border-purple-600', dot: 'bg-purple-600', badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800' },
    'grn_generated': { bg: 'bg-teal-600', border: 'border-teal-600', dot: 'bg-teal-600', badge: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 border-teal-200 dark:border-teal-800' },
    'payment_voucher': { bg: 'bg-rose-500', border: 'border-rose-500', dot: 'bg-rose-500', badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800' },
  };

  if (colorMap[action]) return colorMap[action];

  // Fallback based on keywords
  if (action.includes('qtn') || action.includes('quotation')) {
    return { bg: 'bg-indigo-500', border: 'border-indigo-500', dot: 'bg-indigo-500', badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800' };
  }
  if (action.includes('po') || action.includes('purchase') || action.includes('order')) {
    return { bg: 'bg-purple-500', border: 'border-purple-500', dot: 'bg-purple-500', badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800' };
  }
  if (action.includes('grn') || action.includes('delivery') || action.includes('receive')) {
    return { bg: 'bg-teal-500', border: 'border-teal-500', dot: 'bg-teal-500', badge: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 border-teal-200 dark:border-teal-800' };
  }
  if (action.includes('payment') || action.includes('cheque') || action.includes('voucher')) {
    return { bg: 'bg-rose-500', border: 'border-rose-500', dot: 'bg-rose-500', badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800' };
  }
  if (action.includes('select') || action.includes('supplier')) {
    return { bg: 'bg-amber-500', border: 'border-amber-500', dot: 'bg-amber-500', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800' };
  }
  if (action.includes('complete')) {
    return { bg: 'bg-emerald-500', border: 'border-emerald-500', dot: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' };
  }
  if (action.includes('start')) {
    return { bg: 'bg-blue-500', border: 'border-blue-500', dot: 'bg-blue-500', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800' };
  }
  if (action.includes('cancel')) {
    return { bg: 'bg-red-500', border: 'border-red-500', dot: 'bg-red-500', badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800' };
  }
  if (action.includes('reminder')) {
    return { bg: 'bg-amber-400', border: 'border-amber-400', dot: 'bg-amber-400', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800' };
  }

  return { bg: 'bg-gray-500', border: 'border-gray-500', dot: 'bg-gray-500', badge: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700' };
};

// Get icon for action
const getIconForAction = (action: string): any => {
  const iconMap: Record<string, any> = {
    'procurement_started': ShoppingCart,
    'procurement_completed': CheckCircle,
    'procurement_cancelled': XCircle,
    'qtn_generated': FileCheck,
    'qtn_sent': Send,
    'qtn_reminder_sent': Bell,
    'qtn_viewed': Eye,
    'qtn_responded': MessageSquare,
    'quotation_submitted': Users,
    'quotation_verified': CheckCircle,
    'quotation_evaluated': Star,
    'qtn_closed': Check,
    'supplier_selected': Target,
    'po_generated': ShoppingCart,
    'grn_generated': Truck,
    'payment_voucher': Receipt,
    'delivery_scheduled': Calendar,
    'goods_received': Package,
  };

  if (iconMap[action]) return iconMap[action];

  // Fallback based on keywords
  if (action.includes('qtn') || action.includes('quotation')) return FileCheck;
  if (action.includes('po') || action.includes('purchase') || action.includes('order')) return ShoppingCart;
  if (action.includes('grn') || action.includes('delivery') || action.includes('receive')) return Truck;
  if (action.includes('payment') || action.includes('cheque') || action.includes('voucher')) return Receipt;
  if (action.includes('select') || action.includes('supplier')) return Target;
  if (action.includes('complete')) return CheckCircle;
  if (action.includes('start')) return ShoppingCart;
  if (action.includes('cancel')) return XCircle;
  if (action.includes('reminder')) return Bell;

  return Clock;
};

// Get label for action
const getLabelForAction = (action: string, defaultLabel?: string): string => {
  const labelMap: Record<string, string> = {
    'procurement_started': 'Procurement Started',
    'procurement_completed': 'Procurement Completed',
    'procurement_cancelled': 'Procurement Cancelled',
    'qtn_generated': 'QTN Generated',
    'qtn_sent': 'QTN Sent',
    'qtn_reminder_sent': 'QTN Reminder Sent',
    'qtn_viewed': 'QTN Viewed',
    'qtn_responded': 'QTN Responded',
    'quotation_submitted': 'Quotation Submitted',
    'quotation_verified': 'Quotation Verified',
    'quotation_evaluated': 'Quotation Evaluated',
    'qtn_closed': 'QTN Closed',
    'supplier_selected': 'Supplier Selected',
    'po_generated': 'PO Generated',
    'grn_generated': 'GRN Generated',
    'payment_voucher': 'Payment Voucher',
    'delivery_scheduled': 'Delivery Scheduled',
    'goods_received': 'Goods Received',
  };

  return labelMap[action] || defaultLabel || action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export interface RequisitionProcurementTabProps {
  requisition: any;
  isDeclined: boolean;
  isReturned: boolean;
  isEmergency: boolean;
  isProcurementComplete: boolean;
  hasProcurementStarted: boolean;
  procurementProgress: number;
  currentProcurementStatus: string | null;
  qtnDetails: any;
  poDetails: any;
  grnDetails: any;
  paymentDetails: any;
  hasSupplierSelected: boolean;
  quotesCount: number;
  procurementSummary: any;
  procurementTimeline: any[];
  canViewProcurement: boolean;
  canStartProcurement: boolean;
  canContinueProcurement: boolean;
  canCompleteProcurement: boolean;
  canCancelProcurement: boolean;
  isStartingProcurement: boolean;
  isCompletingProcurement: boolean;
  isCancellingProcurement: boolean;
  onStartProcurement: () => void;
  onCompleteProcurement: () => void;
  onNavigateToProcurement: () => void;
  onCancelProcurement: () => void;
}

export const RequisitionProcurementTab: React.FC<RequisitionProcurementTabProps> = ({
  requisition,
  isDeclined,
  isReturned,
  isEmergency,
  isProcurementComplete,
  hasProcurementStarted,
  procurementProgress,
  currentProcurementStatus,
  qtnDetails,
  poDetails,
  grnDetails,
  paymentDetails,
  hasSupplierSelected,
  quotesCount,
  procurementSummary,
  procurementTimeline,
  canViewProcurement,
  canStartProcurement,
  canContinueProcurement,
  canCompleteProcurement,
  canCancelProcurement,
  isStartingProcurement,
  isCompletingProcurement,
  isCancellingProcurement,
  onStartProcurement,
  onCompleteProcurement,
  onNavigateToProcurement,
  onCancelProcurement,
}) => {
  // Only show if requisition is approved or has procurement started
  if (requisition?.status !== 'final_approved' && !hasProcurementStarted) {
    return (
      <Card className="shadow-sm border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-950 rounded-xl">
        <CardContent>
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-4">
              <ShoppingCart className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-1">Procurement Not Available</h3>
            <p className="text-sm text-muted-foreground">
              This requisition must be fully approved before procurement can begin.
            </p>
            <Badge variant="outline" className="mt-4 rounded-full">
              Status: {requisition?.status_label || requisition?.status}
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card - Status Overview */}
      <Card className={cn(
        "border-0 shadow-lg rounded-2xl",
        isProcurementComplete ? "bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20" :
          hasProcurementStarted ? "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/20" :
            "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/20"
      )}>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={cn(
                "p-3 rounded-xl",
                isProcurementComplete ? "bg-emerald-100 dark:bg-emerald-900/30" :
                  hasProcurementStarted ? "bg-blue-100 dark:bg-blue-900/30" :
                    "bg-blue-100 dark:bg-blue-900/30"
              )}>
                <ShoppingCart className={cn(
                  "h-8 w-8",
                  isProcurementComplete ? "text-emerald-600 dark:text-emerald-400" :
                    hasProcurementStarted ? "text-blue-600 dark:text-blue-400" :
                      "text-blue-600 dark:text-blue-400"
                )} />
              </div>
              <div>
                <h3 className="text-xl font-bold">
                  {isProcurementComplete ? 'Procurement Complete' :
                    hasProcurementStarted ? `Procurement In Progress (${Math.round(procurementProgress)}%)` :
                      'Ready for Procurement'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isProcurementComplete ? 'All procurement activities have been completed successfully.' :
                    hasProcurementStarted ? `Current status: ${currentProcurementStatus || 'In Progress'}.` :
                      'Start the procurement process for this approved requisition.'}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {canStartProcurement && (
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm rounded-xl"
                  onClick={onStartProcurement}
                  disabled={isStartingProcurement}
                >
                  {isStartingProcurement ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <ShoppingCart className="h-4 w-4 mr-2" />
                  )}
                  Start Procurement
                </Button>
              )}
              {canContinueProcurement && (
                <Button
                  className={cn(
                    "shadow-sm text-white rounded-xl",
                    isProcurementComplete ? "bg-emerald-600 hover:bg-emerald-700" :
                      "bg-blue-600 hover:bg-blue-700"
                  )}
                  onClick={onNavigateToProcurement}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {isProcurementComplete ? 'View Procurement' : 'Continue Procurement'}
                </Button>
              )}
              {canCompleteProcurement && (
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm rounded-xl"
                  onClick={onCompleteProcurement}
                  disabled={isCompletingProcurement}
                >
                  {isCompletingProcurement ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Complete
                </Button>
              )}
              {canCancelProcurement && (
                <Button
                  variant="destructive"
                  className="rounded-xl"
                  onClick={onCancelProcurement}
                  disabled={isCancellingProcurement}
                >
                  {isCancellingProcurement ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-2" />
                  )}
                  Cancel
                </Button>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          {(hasProcurementStarted || isProcurementComplete) && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-muted-foreground">Overall Progress</span>
                <span className="font-medium">{Math.round(procurementProgress)}%</span>
              </div>
              <div className="relative h-2.5 w-full bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    isProcurementComplete ? "bg-emerald-600 dark:bg-emerald-400" :
                      "bg-blue-600 dark:bg-blue-400"
                  )}
                  style={{ width: `${procurementProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Quick Stats Chips */}
          <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-200/30 dark:border-gray-700/30">
            {qtnDetails.hasQtn && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/50 dark:bg-gray-900/50 rounded-full border border-indigo-200 dark:border-indigo-800">
                <FileCheck className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">QTN: {qtnDetails.number}</span>
              </div>
            )}
            {quotesCount > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/50 dark:bg-gray-900/50 rounded-full border border-blue-200 dark:border-blue-800">
                <Users className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-medium">{quotesCount} quotes</span>
              </div>
            )}
            {hasSupplierSelected && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/50 dark:bg-gray-900/50 rounded-full border border-amber-200 dark:border-amber-800">
                <Target className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-medium">Supplier Selected</span>
              </div>
            )}
            {poDetails.hasPo && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/50 dark:bg-gray-900/50 rounded-full border border-purple-200 dark:border-purple-800">
                <ShoppingCart className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-medium">{poDetails.type || 'PO'}: {poDetails.number}</span>
              </div>
            )}
            {grnDetails.hasGrn && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/50 dark:bg-gray-900/50 rounded-full border border-teal-200 dark:border-teal-800">
                <Truck className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                <span className="text-xs font-medium">GRN: {grnDetails.number}</span>
              </div>
            )}
            {paymentDetails.hasPayment && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/50 dark:bg-gray-900/50 rounded-full border border-rose-200 dark:border-rose-800">
                <Receipt className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                <span className="text-xs font-medium">Voucher: {paymentDetails.number}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card className="shadow-sm border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-950 rounded-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <History className="h-5 w-5 text-muted-foreground" />
            Procurement Timeline
          </CardTitle>
          <CardDescription>
            {hasProcurementStarted
              ? 'Complete history of all procurement activities'
              : 'Timeline will appear once procurement starts'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!hasProcurementStarted && !isProcurementComplete ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No procurement activities yet</p>
              <p className="text-sm text-muted-foreground">Start procurement to begin the timeline</p>
            </div>
          ) : procurementTimeline && procurementTimeline.length > 0 ? (
            <div className="relative">
              {/* Vertical Line - Full height with gradient */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-indigo-500 to-purple-500 rounded-full" />

              <div className="space-y-6">
                {procurementTimeline.map((item: any, index: number) => {
                  const action = item.action || 'unknown';
                  const Icon = getIconForAction(action);
                  const label = getLabelForAction(action, item.action_label);
                  const color = getColorForAction(action);
                  const isLatest = index === 0;
                  const userName = getUserName(item.user);
                  const userEmail = getUserEmail(item.user);

                  return (
                    <motion.div
                      key={item.id || index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="relative pl-12"
                    >
                      {/* Timeline Dot */}
                      <div className={cn(
                        "absolute left-0 top-1 w-8 h-8 rounded-full flex items-center justify-center shadow-lg ring-4 ring-white dark:ring-gray-900",
                        color.bg,
                        color.border
                      )}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>

                      {/* Timeline Card */}
                      <div className={cn(
                        "bg-white dark:bg-gray-900 rounded-xl border p-4 hover:shadow-md transition-all duration-200",
                        isLatest ? "border-blue-300 dark:border-blue-700 shadow-lg shadow-blue-500/10" : "border-gray-200 dark:border-gray-700"
                      )}>
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge className={cn(
                                "text-xs font-medium rounded-full border",
                                color.badge
                              )}>
                                {label}
                              </Badge>
                              {isLatest && (
                                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800 text-[10px] rounded-full">
                                  Latest
                                </Badge>
                              )}
                            </div>

                            {/* Comment/Description */}
                            {item.comment && (
                              <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mt-1.5 leading-relaxed">
                                {item.comment}
                              </p>
                            )}

                            {/* User Info - Fixed to show name correctly */}
                            <div className="mt-2 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                              <UserIcon className="h-3 w-3" />
                              <span className="font-medium text-gray-700 dark:text-gray-300">
                                {userName}
                              </span>
                              {userEmail && (
                                <>
                                  <span className="text-gray-400 dark:text-gray-500">•</span>
                                  <span className="text-gray-500 dark:text-gray-400">{userEmail}</span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Date and Time */}
                          <div className="flex-shrink-0 text-right">
                            <div className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300 justify-end">
                              <CalendarIcon className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                              <span className="font-medium">{formatDateShort(item.created_at)}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 justify-end">
                              <ClockIcon className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                              <span>{formatTime(item.created_at)}</span>
                            </div>
                            {item.ip_address && (
                              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 justify-end">
                                <Globe className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                                <span>{item.ip_address}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No timeline events available</p>
              <p className="text-sm text-muted-foreground">Events will appear as procurement progresses</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RequisitionProcurementTab;
