// frontend/src/app/(dashboard)/procurement/purchase-orders/[id]/check/page.tsx

'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  FileText,
  Building2,
  Loader2,
  Send,
  Truck,
  Calendar,
  DollarSign,
  Package,
  Activity,
  UserCheck,
  FileCheck,
  Search,
  Sparkles,
  Info,
  TrendingUp,
  Award,
  Shield,
  Briefcase,
  Layers,
  User,
  CreditCard,
  Zap,
  Hash,
  Tag,
  Globe,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  Circle,
  CheckCircle2,
  AlertTriangle,
  Ban,
  ChevronRight,
  ArrowRight,
  X,
  Plus,
  Minus,
  ChevronUp,
  Mail,
  Phone,
  MapPin,
  Check,
  ChevronDown,
  LayoutGrid,
  List,
  Grid3x3,
  Table,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { PageTemplate } from '@/components/dashboard/PageTemplate';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Hooks
import {
  usePurchaseOrder,
  useCheckPurchaseOrder,
} from '@/hooks/usePurchaseOrder';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useAuthContext } from '@/contexts/AuthContext';

import type { RequisitionItem } from '@/types/requisition.types';
import { Alert, AlertDescription, AlertTitle } from '../../../../../../components/ui/alert';

// ============================================
// ENHANCED HELPERS
// ============================================

const formatDate = (date: string | Date | null): string => {
  if (!date) return 'N/A';
  try {
    return format(new Date(date), 'dd MMM yyyy');
  } catch {
    return 'Invalid Date';
  }
};

const formatDateTime = (date: string | Date | null | undefined): string => {
  if (!date) return 'N/A';
  try {
    return format(new Date(date), 'dd MMM yyyy, HH:mm');
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

const getSupplierName = (supplier: any): string => {
  if (!supplier) return 'Unknown Supplier';
  if (typeof supplier === 'string') return supplier;
  if (supplier.company_name) return supplier.company_name;
  if (supplier.full_name) return supplier.full_name;
  if (supplier.name) return supplier.name;
  return 'Unknown Supplier';
};

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-700',
    pending_check: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
    pending_endorsement: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
    pending_approval: 'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-400 dark:border-violet-800',
    issued: 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800',
    sent: 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800',
    acknowledged: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
    delivered: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
    partial: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
    completed: 'bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-800',
    cancelled: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800',
    closed: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-700',
  };
  return colors[status] || colors.draft;
};

const getStatusIcon = (status: string) => {
  const icons: Record<string, any> = {
    draft: FileText,
    pending_check: Clock,
    pending_endorsement: UserCheck,
    pending_approval: Shield,
    issued: Send,
    sent: Send,
    acknowledged: CheckCircle,
    delivered: Truck,
    partial: AlertCircle,
    completed: CheckCircle2,
    cancelled: Ban,
    closed: FileCheck,
  };
  return icons[status] || FileText;
};

const getStatusBadgeVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  const variants: Record<string, any> = {
    draft: 'secondary',
    pending_check: 'secondary',
    pending_endorsement: 'secondary',
    pending_approval: 'secondary',
    issued: 'default',
    sent: 'default',
    acknowledged: 'default',
    delivered: 'default',
    partial: 'secondary',
    completed: 'default',
    cancelled: 'destructive',
    closed: 'secondary',
  };
  return variants[status] || 'secondary';
};

// ============================================
// ENHANCED STATUS BADGE
// ============================================

const StatusBadge = ({ status, size = 'default', showIcon = true }: { status: string; size?: 'sm' | 'default' | 'lg'; showIcon?: boolean }) => {
  const colorClass = getStatusColor(status);
  const Icon = getStatusIcon(status);
  const label = PO_STATUS_LABELS[status] || status;
  const variant = getStatusBadgeVariant(status);

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    default: 'px-3 py-1 text-xs',
    lg: 'px-4 py-1.5 text-sm',
  };

  return (
    <Badge
      variant={variant}
      className={cn(
        "font-medium rounded-full border transition-all duration-200",
        sizeClasses[size],
        colorClass,
        "hover:scale-105 cursor-default"
      )}
    >
      {showIcon && <Icon className={cn("inline", size === 'sm' ? 'h-3 w-3 mr-1' : 'h-3.5 w-3.5 mr-1.5')} />}
      {label}
    </Badge>
  );
};

// ============================================
// PO STATUS LABELS
// ============================================

const PO_STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  pending_check: 'Pending Check',
  pending_endorsement: 'Pending Endorsement',
  pending_approval: 'Pending Approval',
  issued: 'Issued',
  sent: 'Sent',
  acknowledged: 'Acknowledged',
  delivered: 'Delivered',
  partial: 'Partial',
  completed: 'Completed',
  cancelled: 'Cancelled',
  closed: 'Closed',
};

const PO_STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700',
  pending_check: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  pending_endorsement: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  pending_approval: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800',
  issued: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
  sent: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
  acknowledged: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800',
  delivered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  partial: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  completed: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 border-teal-200 dark:border-teal-800',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
  closed: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-800',
};

// ============================================
// ENHANCED ITEM COMPARISON COMPONENT
// ============================================

interface ItemComparisonProps {
  poItem: any;
  requisitionItem: RequisitionItem | undefined;
  index: number;
  expanded?: boolean;
  onToggle?: () => void;
}

const ItemComparison = ({ poItem, requisitionItem, index, expanded = false, onToggle }: ItemComparisonProps) => {
  // ✅ Check if this is a supplier-added item (no requisition_item_id)
  const isSupplierAdded = !poItem?.requisition_item_id || !requisitionItem;

  // For supplier-added items, we consider them as "match" by default
  const itemNameMatch = isSupplierAdded ? true : poItem?.item_name?.toLowerCase() === requisitionItem?.item_name?.toLowerCase();
  const quantityMatch = isSupplierAdded ? true : poItem?.quantity === requisitionItem?.quantity;
  const unitMatch = isSupplierAdded ? true : poItem?.unit_of_measure === requisitionItem?.unit_of_measure;

  const estimatedPrice = requisitionItem?.estimated_unit_cost || 0;
  const actualPrice = poItem?.unit_price || 0;
  const priceDifference = actualPrice - estimatedPrice;
  const pricePercentChange = estimatedPrice > 0 ? (priceDifference / estimatedPrice) * 100 : 0;

  let statusBadge;
  let statusColor;
  let statusIcon;
  let statusDescription;

  if (isSupplierAdded) {
    // ✅ Supplier-added items get a special purple badge
    statusBadge = 'Supplier Added';
    statusColor = 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
    statusIcon = <Sparkles className="h-4 w-4" />;
    statusDescription = 'Item added by supplier during quotation';
  } else if (!requisitionItem) {
    statusBadge = 'Not in Requisition';
    statusColor = 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
    statusIcon = <XCircle className="h-4 w-4" />;
    statusDescription = 'Item not found in the original requisition';
  } else if (!itemNameMatch) {
    statusBadge = 'Name Mismatch';
    statusColor = 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
    statusIcon = <AlertCircle className="h-4 w-4" />;
    statusDescription = 'Item name does not match requisition';
  } else if (!quantityMatch) {
    statusBadge = 'Quantity Mismatch';
    statusColor = 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    statusIcon = <AlertCircle className="h-4 w-4" />;
    statusDescription = 'Quantity differs from requisition';
  } else if (!unitMatch) {
    statusBadge = 'Unit Mismatch';
    statusColor = 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    statusIcon = <AlertCircle className="h-4 w-4" />;
    statusDescription = 'Unit of measure differs from requisition';
  } else {
    statusBadge = 'Verified';
    statusColor = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    statusIcon = <CheckCircle className="h-4 w-4" />;
    statusDescription = 'Matches requisition';
  }

  // ✅ Supplier-added items are considered acceptable for HOD check
  const isAcceptable = isSupplierAdded || statusBadge === 'Verified';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "rounded-xl border transition-all duration-300 overflow-hidden",
        isSupplierAdded
          ? "bg-purple-50/30 dark:bg-purple-950/20 border-purple-200/50 dark:border-purple-800/50 hover:border-purple-300 dark:hover:border-purple-700"
          : statusBadge === 'Verified'
            ? "bg-emerald-50/30 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-800/50 hover:border-emerald-300 dark:hover:border-emerald-700"
            : statusBadge === 'Name Mismatch' || statusBadge === 'Not in Requisition'
              ? "bg-rose-50/30 dark:bg-rose-950/20 border-rose-200/50 dark:border-rose-800/50 hover:border-rose-300 dark:hover:border-rose-700"
              : "bg-amber-50/30 dark:bg-amber-950/20 border-amber-200/50 dark:border-amber-800/50 hover:border-amber-300 dark:hover:border-amber-700"
      )}
    >
      <div
        className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-start gap-4">
          <div className={cn(
            "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm",
            isSupplierAdded ? "bg-gradient-to-br from-purple-400 to-purple-600" :
              statusBadge === 'Verified' ? "bg-gradient-to-br from-emerald-400 to-emerald-600" :
                "bg-gradient-to-br from-amber-400 to-amber-600"
          )}>
            {index + 1}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-medium text-sm text-gray-900 dark:text-white">
                {poItem?.item_name || '—'}
              </p>
              <Badge className={cn("text-[10px] rounded-full border-0", statusColor)}>
                {statusIcon}
                <span className="ml-1">{statusBadge}</span>
              </Badge>
              {isSupplierAdded && (
                <Badge className="text-[10px] rounded-full bg-purple-200/50 text-purple-800 dark:bg-purple-800/30 dark:text-purple-300 border-0">
                  <Sparkles className="h-3 w-3 mr-0.5" />
                  New Item
                </Badge>
              )}
            </div>

            {isSupplierAdded && (
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-0.5">
                This item was added by the supplier during quotation
              </p>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2 text-sm">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Quantity</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={cn(
                    "font-semibold",
                    isSupplierAdded ? "text-purple-600 dark:text-purple-400" :
                      quantityMatch && requisitionItem ? "text-emerald-600 dark:text-emerald-400" :
                        requisitionItem ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400"
                  )}>
                    {poItem?.formatted_quantity || poItem?.quantity || '—'}
                  </span>
                  {requisitionItem && !isSupplierAdded && (
                    <>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground text-sm">
                        Req: {requisitionItem.formatted_quantity || requisitionItem.quantity}
                      </span>
                    </>
                  )}
                  {isSupplierAdded && (
                    <span className="text-purple-500 text-xs font-medium">(Supplier added)</span>
                  )}
                  {!requisitionItem && !isSupplierAdded && (
                    <span className="text-rose-500 text-xs font-medium">(Not requested)</span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground font-medium">Unit</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={cn(
                    "font-semibold",
                    isSupplierAdded ? "text-purple-600 dark:text-purple-400" :
                      unitMatch && requisitionItem ? "text-emerald-600 dark:text-emerald-400" :
                        requisitionItem ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400"
                  )}>
                    {poItem?.unit_of_measure || '—'}
                  </span>
                  {requisitionItem && !isSupplierAdded && (
                    <>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground text-sm">
                        Req: {requisitionItem.unit_of_measure || '—'}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground font-medium">Est. Price (Req)</p>
                <p className="font-semibold text-gray-700 dark:text-gray-300 mt-0.5">
                  {requisitionItem ? formatCurrency(requisitionItem.estimated_unit_cost) :
                    isSupplierAdded ? '—' : '—'}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground font-medium">Actual Price (PO)</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={cn(
                    "font-semibold",
                    isSupplierAdded ? "text-purple-600 dark:text-purple-400" :
                      "text-blue-600 dark:text-blue-400"
                  )}>
                    {poItem ? formatCurrency(poItem.unit_price) : '—'}
                  </span>
                  {requisitionItem && !isSupplierAdded && priceDifference !== 0 && (
                    <span className={cn(
                      "text-xs font-medium px-1.5 py-0.5 rounded-full",
                      priceDifference < 0 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                    )}>
                      {priceDifference < 0 ? '▼' : '▲'} {Math.abs(Math.round(pricePercentChange))}%
                    </span>
                  )}
                </div>
              </div>
            </div>

            {requisitionItem && !isSupplierAdded && priceDifference !== 0 && (
              <div className={cn(
                "mt-2 text-xs p-2 rounded-lg flex items-center gap-2",
                priceDifference < 0 ? "bg-emerald-50/80 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300" :
                  "bg-amber-50/80 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300"
              )}>
                <Info className="h-3.5 w-3.5 flex-shrink-0" />
                <span>
                  Supplier price is {priceDifference < 0 ? 'lower' : 'higher'} than estimate by {formatCurrency(Math.abs(priceDifference))} per unit
                  {priceDifference < 0 && ' Cost saving!'}
                </span>
              </div>
            )}

            {isSupplierAdded && (
              <div className="mt-2 text-xs p-2 rounded-lg bg-purple-50/80 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 flex items-center gap-2">
                <Info className="h-3.5 w-3.5 flex-shrink-0" />
                <span>
                  This item was not in the original requisition but is required for the complete solution.
                  Please verify the item and price.
                </span>
              </div>
            )}
          </div>

          <div className="flex-shrink-0 flex items-center gap-2">
            {isSupplierAdded ? (
              <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30">
                <Sparkles className="h-5 w-5 text-purple-500" />
              </div>
            ) : statusBadge === 'Verified' ? (
              <div className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
              </div>
            ) : statusBadge === 'Name Mismatch' || statusBadge === 'Not in Requisition' ? (
              <div className="p-2 rounded-full bg-rose-100 dark:bg-rose-900/30">
                <XCircle className="h-5 w-5 text-rose-500" />
              </div>
            ) : (
              <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/30">
                <AlertCircle className="h-5 w-5 text-amber-500" />
              </div>
            )}
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 border-t border-gray-200/50 dark:border-gray-700/50">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground font-medium">Item Code</p>
                  <p className="text-sm font-medium mt-0.5">{poItem?.item_code || '—'}</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground font-medium">Category</p>
                  <p className="text-sm font-medium mt-0.5">{poItem?.category || '—'}</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground font-medium">Total Price</p>
                  <p className="text-sm font-medium mt-0.5 text-blue-600 dark:text-blue-400">
                    {formatCurrency((poItem?.unit_price || 0) * (poItem?.quantity || 0))}
                  </p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground font-medium">Tax Rate</p>
                  <p className="text-sm font-medium mt-0.5">{poItem?.tax_rate || 0}%</p>
                </div>
              </div>
              {isSupplierAdded && (
                <div className="mt-3 p-3 bg-purple-50/50 dark:bg-purple-950/20 rounded-lg border border-purple-200/50 dark:border-purple-800/50">
                  <p className="text-xs text-purple-700 dark:text-purple-300 flex items-center gap-2">
                    <Info className="h-3.5 w-3.5" />
                    <span>This item was added by the supplier. It has been approved as part of the quotation.</span>
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ============================================
// MAIN CHECK PAGE
// ============================================

export default function PurchaseOrderCheckPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);
  const { user } = useAuthContext();

  // State
  const [checkComment, setCheckComment] = useState('');
  const [showCheckDialog, setShowCheckDialog] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'table'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'verified' | 'supplier_added' | 'mismatch' | 'missing'>('all');

  // Hooks
  const { data: po, isLoading, refetch } = usePurchaseOrder(id);
  const { useAllSuppliers } = useSuppliers();
  const { data: suppliersData } = useAllSuppliers();
  const checkMutation = useCheckPurchaseOrder();

  // User department
  const userDepartmentId = useMemo(() => {
    const userAny = user as any;
    return userAny?.effective_department?.id ||
      userAny?.hod_department?.id ||
      user?.department_id ||
      userAny?.department?.id ||
      null;
  }, [user]);

  const userDepartmentName = useMemo(() => {
    const userAny = user as any;
    return userAny?.effective_department?.name ||
      userAny?.hod_department?.name ||
      userAny?.department?.name ||
      null;
  }, [user]);

  const isUserHOD = useMemo(() => {
    const userAny = user as any;
    return userAny?.is_hod || false;
  }, [user]);

  // Supplier info
  const supplier = useMemo(() => {
    if (!po?.supplier_id || !Array.isArray(suppliersData)) return null;
    return suppliersData.find((s: any) => s.id === po.supplier_id) || po.supplier;
  }, [po, suppliersData]);

  const supplierName = getSupplierName(supplier || po?.supplier);

  // ✅ FIXED: Comparison stats - supplier-added items count as verified
  const comparisonStats = useMemo(() => {
    if (!po?.items || !po?.requisition?.items) {
      return {
        total: 0,
        verified: 0,
        quantityMismatch: 0,
        nameMismatch: 0,
        missing: 0,
        supplierAdded: 0,
        matchRate: 0,
        canCheck: false,
        hasIssues: false,
        message: ''
      };
    }

    const poItems = po.items || [];
    const reqItems = po.requisition.items || [];
    const total = poItems.length;

    let verified = 0;
    let quantityMismatch = 0;
    let nameMismatch = 0;
    let missing = 0;
    let supplierAdded = 0;

    poItems.forEach((item: any) => {
      // ✅ Supplier-added items - no requisition_item_id
      if (!item.requisition_item_id) {
        supplierAdded++;
        verified++; // ✅ Count as verified for approval
        return;
      }

      const reqItem = reqItems.find((ri: any) => ri.id === item.requisition_item_id);
      if (!reqItem) {
        missing++;
        return;
      }
      const itemNameMatch = item.item_name?.toLowerCase() === reqItem.item_name?.toLowerCase();
      const quantityMatch = item.quantity === reqItem.quantity;
      const unitMatch = item.unit_of_measure === reqItem.unit_of_measure;

      if (!itemNameMatch) {
        nameMismatch++;
      } else if (!quantityMatch || !unitMatch) {
        quantityMismatch++;
      } else {
        verified++;
      }
    });

    const totalAcceptable = verified;
    const totalItems = total > 0 ? total : 1;

    // ✅ Can check if there are no missing items and no name mismatches
    const canCheck = missing === 0 && nameMismatch === 0;
    const hasIssues = !canCheck;

    let message = '';
    if (missing > 0 && nameMismatch > 0) {
      message = `${missing} items not found in requisition and ${nameMismatch} items have name mismatches.`;
    } else if (missing > 0) {
      message = `${missing} items are not in the requisition. These items must be added to the requisition first.`;
    } else if (nameMismatch > 0) {
      message = `${nameMismatch} items have name mismatches. Please correct the item names.`;
    } else if (quantityMismatch > 0) {
      message = `${quantityMismatch} items have quantity mismatches. Please review the quantities.`;
    } else {
      message = 'All items are verified. You can proceed with checking.';
    }

    return {
      total,
      verified,
      quantityMismatch,
      nameMismatch,
      missing,
      supplierAdded,
      matchRate: Math.round((totalAcceptable / totalItems) * 100),
      canCheck,
      hasIssues,
      message
    };
  }, [po]);

  // Financial comparison
  const financialComparison = useMemo(() => {
    if (!po?.items || !po?.requisition?.items) {
      return { estimatedTotal: 0, actualTotal: 0, difference: 0, savings: 0 };
    }

    const poItems = po.items || [];
    const reqItems = po.requisition.items || [];

    let estimatedTotal = 0;
    let actualTotal = 0;

    poItems.forEach((item: any) => {
      const reqItem = reqItems.find((ri: any) => ri.id === item.requisition_item_id);
      if (reqItem) {
        estimatedTotal += (reqItem.estimated_unit_cost || 0) * (item.quantity || 0);
      }
      actualTotal += (item.unit_price || 0) * (item.quantity || 0);
    });

    const difference = actualTotal - estimatedTotal;
    const savings = difference < 0 ? Math.abs(difference) : 0;

    return {
      estimatedTotal,
      actualTotal,
      difference,
      savings,
      isSaving: difference < 0,
    };
  }, [po]);

  // Filtered items
  const filteredItems = useMemo(() => {
    if (!po?.items) return [];

    let items = po.items;

    // Filter by search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      items = items.filter((item: any) =>
        item.item_name?.toLowerCase().includes(term) ||
        item.item_code?.toLowerCase().includes(term)
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      items = items.filter((item: any) => {
        const isSupplierAddedItem = !item.requisition_item_id;

        if (filterStatus === 'supplier_added') {
          return isSupplierAddedItem;
        }

        const reqItem = po.requisition?.items?.find((ri: any) => ri.id === item.requisition_item_id);
        if (!reqItem) return filterStatus === 'missing';

        const nameMatch = item.item_name?.toLowerCase() === reqItem.item_name?.toLowerCase();
        const qtyMatch = item.quantity === reqItem.quantity;
        const unitMatch = item.unit_of_measure === reqItem.unit_of_measure;

        if (filterStatus === 'verified') return nameMatch && qtyMatch && unitMatch && !isSupplierAddedItem;
        if (filterStatus === 'mismatch') return (!nameMatch || !qtyMatch || !unitMatch) && !isSupplierAddedItem;

        return true;
      });
    }

    return items;
  }, [po, searchTerm, filterStatus]);

  // Handlers
  const handleBack = () => router.push('/procurement/purchase-orders/pending-check');

  const handleCheck = () => {
    if (comparisonStats.canCheck) {
      setShowCheckDialog(true);
    }
  };

  const handleConfirmCheck = () => {
    if (po) {
      checkMutation.mutate(
        { id: po.id, comment: checkComment || undefined },
        {
          onSuccess: () => {
            setShowCheckDialog(false);
            router.push('/procurement/purchase-orders/pending-check');
          }
        }
      );
    }
  };

  const toggleItem = (index: number) => {
    const newSet = new Set(expandedItems);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setExpandedItems(newSet);
  };

  const expandAll = () => {
    if (!po?.items) return;
    const all = new Set(po.items.map((_: any, i: number) => i));
    setExpandedItems(all);
  };

  const collapseAll = () => {
    setExpandedItems(new Set());
  };

  // Check permissions
  const poDepartmentId = po?.requisition?.department_id;
  const canCheck = userDepartmentId === poDepartmentId;

  // Loading state
  if (isLoading) {
    return (
      <PageTemplate
        title="Review Purchase Order"
        description="Loading..."
        icon={<UserCheck className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />}
        background="gradient"
        variant="default"
        breadcrumbs={[
          { label: 'Procurement', href: '/procurement' },
          { label: 'Purchase Orders', href: '/procurement/purchase-orders/manage-orders' },
          { label: 'Pending Check', href: '/procurement/purchase-orders/pending-check' },
          { label: 'Review' },
        ]}
      >
        <div className="space-y-6">
          <Card className="border-0 shadow-sm rounded-xl overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </PageTemplate>
    );
  }

  // Not found
  if (!po) {
    return (
      <PageTemplate
        title="Review Purchase Order"
        description="Not found"
        icon={<UserCheck className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />}
        background="gradient"
        variant="default"
        breadcrumbs={[
          { label: 'Procurement', href: '/procurement' },
          { label: 'Purchase Orders', href: '/procurement/purchase-orders/manage-orders' },
          { label: 'Pending Check', href: '/procurement/purchase-orders/pending-check' },
          { label: 'Review' },
        ]}
      >
        <Card className="border-0 shadow-sm rounded-xl">
          <CardContent className="p-12 text-center">
            <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-full w-fit mx-auto mb-4">
              <AlertTriangle className="h-12 w-12 text-amber-500" />
            </div>
            <h3 className="text-xl font-medium mb-2 text-gray-900 dark:text-white">Purchase Order Not Found</h3>
            <p className="text-muted-foreground">The purchase order you&apos;re looking for doesn&apos;t exist.</p>
            <Button onClick={handleBack} className="mt-4 rounded-xl">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Pending Checks
            </Button>
          </CardContent>
        </Card>
      </PageTemplate>
    );
  }

  // No requisition
  if (!po.requisition) {
    return (
      <PageTemplate
        title="Review Purchase Order"
        description="Invalid Data"
        icon={<UserCheck className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />}
        background="gradient"
        variant="default"
        breadcrumbs={[
          { label: 'Procurement', href: '/procurement' },
          { label: 'Purchase Orders', href: '/procurement/purchase-orders/manage-orders' },
          { label: 'Pending Check', href: '/procurement/purchase-orders/pending-check' },
          { label: 'Review' },
        ]}
      >
        <Card className="border-0 shadow-sm rounded-xl">
          <CardContent className="p-12 text-center">
            <div className="p-4 bg-rose-50 dark:bg-rose-950/20 rounded-full w-fit mx-auto mb-4">
              <AlertCircle className="h-12 w-12 text-rose-500" />
            </div>
            <h3 className="text-xl font-medium mb-2 text-gray-900 dark:text-white">Invalid Purchase Order</h3>
            <p className="text-muted-foreground">This purchase order has no associated requisition data.</p>
            <Button onClick={handleBack} className="mt-4 rounded-xl">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Pending Checks
            </Button>
          </CardContent>
        </Card>
      </PageTemplate>
    );
  }

  // No department assigned
  if (isUserHOD && !userDepartmentId) {
    return (
      <PageTemplate
        title="Review Purchase Order"
        description="No department assigned"
        icon={<UserCheck className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />}
        background="gradient"
        variant="default"
        breadcrumbs={[
          { label: 'Procurement', href: '/procurement' },
          { label: 'Purchase Orders', href: '/procurement/purchase-orders/manage-orders' },
          { label: 'Pending Check', href: '/procurement/purchase-orders/pending-check' },
          { label: 'Review' },
        ]}
      >
        <Card className="border-0 shadow-sm rounded-xl">
          <CardContent className="p-12 text-center">
            <div className="p-4 bg-rose-50 dark:bg-rose-950/20 rounded-full w-fit mx-auto mb-4">
              <AlertCircle className="h-12 w-12 text-rose-500" />
            </div>
            <h3 className="text-xl font-medium mb-2 text-gray-900 dark:text-white">No Department Assigned</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              You are listed as a Head of Department but no department has been assigned to you.
              Please contact the system administrator to assign your department.
            </p>
            <Button onClick={handleBack} className="mt-4 rounded-xl">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Pending Checks
            </Button>
          </CardContent>
        </Card>
      </PageTemplate>
    );
  }

  // Access denied
  if (!canCheck) {
    return (
      <PageTemplate
        title="Review Purchase Order"
        description="Access Denied"
        icon={<UserCheck className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />}
        background="gradient"
        variant="default"
        breadcrumbs={[
          { label: 'Procurement', href: '/procurement' },
          { label: 'Purchase Orders', href: '/procurement/purchase-orders/manage-orders' },
          { label: 'Pending Check', href: '/procurement/purchase-orders/pending-check' },
          { label: 'Review' },
        ]}
      >
        <Card className="border-0 shadow-sm rounded-xl">
          <CardContent className="p-12 text-center">
            <div className="p-4 bg-rose-50 dark:bg-rose-950/20 rounded-full w-fit mx-auto mb-4">
              <Ban className="h-12 w-12 text-rose-500" />
            </div>
            <h3 className="text-xl font-medium mb-2 text-gray-900 dark:text-white">Access Denied</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {isUserHOD
                ? `You are the HOD of ${userDepartmentName || 'your department'}, but this PO belongs to "${po.requisition?.department?.name || 'another department'}".`
                : "You don't have permission to review this purchase order."}
            </p>
            <Button onClick={handleBack} className="mt-4 rounded-xl">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Pending Checks
            </Button>
          </CardContent>
        </Card>
      </PageTemplate>
    );
  }

  const supplierEmail = supplier?.company_email || supplier?.email || po?.supplier?.email || 'No email';
  const supplierPhone = supplier?.company_phone || supplier?.phone || po?.supplier?.phone || 'N/A';
  const supplierAddress = supplier?.company_address || 'N/A';

  return (
    <PageTemplate
      title={`Review: ${po.po_number}`}
      description={`Verify and check this purchase order from ${po.requisition?.department?.name || userDepartmentName || 'your department'}`}
      icon={<UserCheck className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />}
      background="gradient"
      variant="default"
      breadcrumbs={[
        { label: 'Procurement', href: '/procurement' },
        { label: 'Purchase Orders', href: '/procurement/purchase-orders/manage-orders' },
        { label: 'Pending Check', href: '/procurement/purchase-orders/pending-check' },
        { label: po.po_number },
      ]}
      actions={
        <div className="flex items-center gap-2 flex-wrap">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 rounded-full px-3 py-1.5">
                  <Building2 className="h-3.5 w-3.5 mr-1.5" />
                  {userDepartmentName}
                  {isUserHOD && (
                    <span className="ml-1 text-[10px] font-medium text-amber-600 dark:text-amber-400">(HOD)</span>
                  )}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>Your department</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* ✅ Show supplier-added items count */}
          {comparisonStats.supplierAdded > 0 && (
            <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 rounded-full px-3 py-1.5">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              {comparisonStats.supplierAdded} Supplier-Added Items
            </Badge>
          )}

          {/* ✅ Show missing items warning */}
          {comparisonStats.missing > 0 && (
            <Badge className="bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 rounded-full px-3 py-1.5">
              <XCircle className="h-3.5 w-3.5 mr-1.5" />
              {comparisonStats.missing} Missing Items
            </Badge>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleBack}
            className="gap-2 h-10 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <Button
            className={cn(
              "h-10 rounded-xl transition-all duration-300",
              comparisonStats.canCheck
                ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50"
                : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            )}
            onClick={handleCheck}
            disabled={checkMutation.isPending || !comparisonStats.canCheck}
          >
            {checkMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <UserCheck className="h-4 w-4 mr-2" />
            )}
            {comparisonStats.canCheck ? 'Check & Approve' : 'Fix Issues First'}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* ============================================ */}
        {/* MATCH RATE & SUMMARY CARD - ENHANCED */}
        {/* ============================================ */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-0 shadow-sm rounded-xl overflow-hidden bg-gradient-to-r from-amber-50/80 to-orange-50/80 dark:from-amber-950/20 dark:to-orange-950/20">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl shadow-lg shadow-amber-500/20">
                    <UserCheck className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Review Summary</h3>
                    <p className="text-sm text-muted-foreground">
                      {comparisonStats.total} items • {comparisonStats.verified} verified •
                      {comparisonStats.supplierAdded > 0 && ` ${comparisonStats.supplierAdded} supplier-added`}
                      {comparisonStats.quantityMismatch > 0 && ` • ${comparisonStats.quantityMismatch} qty mismatches`}
                      {comparisonStats.nameMismatch > 0 && ` • ${comparisonStats.nameMismatch} name mismatches`}
                      {comparisonStats.missing > 0 && ` • ${comparisonStats.missing} missing`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground font-medium">Match Rate:</span>
                    <div className="w-32">
                      <Progress
                        value={comparisonStats.matchRate}
                        className={cn(
                          "h-2.5 rounded-full",
                          comparisonStats.matchRate >= 80 ? "bg-emerald-200 dark:bg-emerald-800" :
                            comparisonStats.matchRate >= 50 ? "bg-amber-200 dark:bg-amber-800" :
                              "bg-rose-200 dark:bg-rose-800"
                        )}
                      />
                    </div>
                    <span className={cn(
                      "text-sm font-bold",
                      comparisonStats.matchRate >= 80 ? "text-emerald-600 dark:text-emerald-400" :
                        comparisonStats.matchRate >= 50 ? "text-amber-600 dark:text-amber-400" :
                          "text-rose-600 dark:text-rose-400"
                    )}>
                      {comparisonStats.matchRate}%
                    </span>
                  </div>
                  <StatusBadge status={po.status} size="lg" />
                </div>
              </div>

              <Separator className="my-4 bg-gray-200/50 dark:bg-gray-700/50" />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-white/50 dark:bg-gray-800/30 rounded-lg">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Estimated Total</p>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-0.5">
                    {formatCurrency(financialComparison.estimatedTotal)}
                  </p>
                </div>
                <div className="p-3 bg-white/50 dark:bg-gray-800/30 rounded-lg">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Actual Total</p>
                  <p className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                    {formatCurrency(financialComparison.actualTotal)}
                  </p>
                </div>
                <div className="p-3 bg-white/50 dark:bg-gray-800/30 rounded-lg">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Difference</p>
                  <p className={cn(
                    "text-sm font-bold mt-0.5",
                    financialComparison.isSaving ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                  )}>
                    {financialComparison.isSaving ? '▼' : '▲'} {formatCurrency(Math.abs(financialComparison.difference))}
                  </p>
                </div>
                <div className="p-3 bg-white/50 dark:bg-gray-800/30 rounded-lg">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Status</p>
                  <Badge className={cn(
                    "text-xs rounded-full border-0 mt-1",
                    financialComparison.isSaving ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                      financialComparison.difference === 0 ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" :
                        "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                  )}>
                    {financialComparison.isSaving ? 'Cost Saving' :
                      financialComparison.difference === 0 ? 'On Budget' : 'Above Estimate'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ============================================ */}
        {/* STATUS ALERTS - ENHANCED */}
        {/* ============================================ */}
        <AnimatePresence>
          {comparisonStats.canCheck && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Alert className={cn(
                "rounded-xl shadow-sm",
                comparisonStats.supplierAdded > 0
                  ? "bg-purple-50/80 dark:bg-purple-950/30 border-purple-200/50 dark:border-purple-800/50"
                  : "bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200/50 dark:border-emerald-800/50"
              )}>
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    comparisonStats.supplierAdded > 0
                      ? "bg-purple-100 dark:bg-purple-900/40"
                      : "bg-emerald-100 dark:bg-emerald-900/40"
                  )}>
                    {comparisonStats.supplierAdded > 0 ? (
                      <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <AlertTitle className={cn(
                      "font-semibold",
                      comparisonStats.supplierAdded > 0
                        ? "text-purple-700 dark:text-purple-300"
                        : "text-emerald-700 dark:text-emerald-300"
                    )}>
                      {comparisonStats.supplierAdded > 0
                        ? `${comparisonStats.supplierAdded} Supplier-Added Items Included`
                        : 'All Items Verified'
                      }
                    </AlertTitle>
                    <AlertDescription className={cn(
                      comparisonStats.supplierAdded > 0
                        ? "text-purple-600 dark:text-purple-400"
                        : "text-emerald-600 dark:text-emerald-400"
                    )}>
                      {comparisonStats.supplierAdded > 0
                        ? `${comparisonStats.supplierAdded} item(s) were added by the supplier during quotation. These items have been reviewed and accepted as part of the complete solution.`
                        : `All ${comparisonStats.total} items in this purchase order match the requisition. You can proceed to check and approve this order.`
                      }
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            </motion.div>
          )}

          {!comparisonStats.canCheck && comparisonStats.total > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Alert className="rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border-amber-200/50 dark:border-amber-800/50 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/40">
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <AlertTitle className="text-amber-700 dark:text-amber-300 font-semibold">Items Need Review</AlertTitle>
                    <AlertDescription className="text-amber-600 dark:text-amber-400">
                      {comparisonStats.missing > 0 && `${comparisonStats.missing} item(s) are not in the requisition. `}
                      {comparisonStats.nameMismatch > 0 && `${comparisonStats.nameMismatch} item(s) have name mismatches. `}
                      {comparisonStats.quantityMismatch > 0 && `${comparisonStats.quantityMismatch} item(s) have quantity mismatches. `}
                      Please review and correct these issues before checking.
                      <strong>Note:</strong> Supplier-added items are automatically approved.
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ============================================ */}
        {/* PO HEADER CARD */}
        {/* ============================================ */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-0 shadow-sm rounded-xl overflow-hidden">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">PO Number</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-sm font-bold text-gray-900 dark:text-white font-mono">{po.po_number}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Type</p>
                  <div className="mt-0.5">
                    <Badge variant="outline" className="text-xs rounded-full">
                      {po.type === 'lpo' ? 'LPO (Goods)' : 'LSO (Services)'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Amount</p>
                  <p className="text-sm font-bold mt-0.5 text-emerald-600 dark:text-emerald-400">{formatCurrency(po.total_amount)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Department</p>
                  <p className="text-sm font-semibold mt-0.5 text-gray-900 dark:text-white">{po.requisition?.department?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Status</p>
                  <div className="mt-0.5">
                    <StatusBadge status={po.status} size="sm" />
                  </div>
                </div>
              </div>

              <Separator className="my-4 bg-gray-200/50 dark:bg-gray-700/50" />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Issue Date</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(po.issue_date)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Expected Delivery</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Truck className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(po.expected_delivery_date)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Items</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Package className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{po.items?.length || 0}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Requisition</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white font-mono">{po.requisition?.reference_number || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ============================================ */}
        {/* SUPPLIER CARD */}
        {/* ============================================ */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="border-0 shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="pb-3 border-b bg-gradient-to-r from-gray-50/50 to-gray-100/50 dark:from-gray-900/30 dark:to-gray-800/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  Supplier Information
                </CardTitle>
                <Badge variant="outline" className="rounded-full text-xs">
                  <Award className="h-3 w-3 mr-1" />
                  Verified Supplier
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex items-start gap-4 flex-1">
                  <Avatar className="h-14 w-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex-shrink-0 shadow-lg">
                    <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white text-base font-bold">
                      {getInitials(supplierName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white text-lg">{supplierName}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5" />
                        <span>{supplierEmail}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5" />
                        <span>{supplierPhone}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{supplierAddress}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 md:pl-6 md:border-l border-gray-200 dark:border-gray-700">
                  {(supplier as any)?.company_registration && (
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Registration</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">{(supplier as any).company_registration}</p>
                    </div>
                  )}
                  {(supplier as any)?.tax_id && (
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Tax ID</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">{(supplier as any).tax_id}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ============================================ */}
        {/* ITEMS COMPARISON SECTION - ENHANCED */}
        {/* ============================================ */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="pb-3 border-b bg-gradient-to-r from-gray-50/50 to-gray-100/50 dark:from-gray-900/30 dark:to-gray-800/30">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                    <Package className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <CardTitle className="text-base">Requisition vs PO Comparison</CardTitle>
                  <Badge variant="outline" className="text-xs rounded-full">
                    {filteredItems.length} items
                  </Badge>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {/* View mode */}
                  <div className="flex items-center gap-1 p-1 bg-muted/30 rounded-lg">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={cn("h-8 w-8 p-0 rounded-md", viewMode === 'list' && "bg-background shadow-sm")}
                            onClick={() => setViewMode('list')}
                          >
                            <List className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>List view</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={cn("h-8 w-8 p-0 rounded-md", viewMode === 'grid' && "bg-background shadow-sm")}
                            onClick={() => setViewMode('grid')}
                          >
                            <Grid3x3 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Grid view</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={cn("h-8 w-8 p-0 rounded-md", viewMode === 'table' && "bg-background shadow-sm")}
                            onClick={() => setViewMode('table')}
                          >
                            <Table className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Table view</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  <Separator orientation="vertical" className="h-6" />

                  {/* Expand/Collapse */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-md" onClick={expandAll}>
                          <Maximize2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Expand all</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-md" onClick={collapseAll}>
                          <Minimize2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Collapse all</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <Separator orientation="vertical" className="h-6" />

                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Search items..."
                      className="h-8 w-[150px] pl-8 rounded-lg text-xs bg-muted/30 border-0 focus-visible:ring-1"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                        onClick={() => setSearchTerm('')}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>

                  {/* Filter - Updated with supplier_added option */}
                  <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
                    <SelectTrigger className="h-8 w-[130px] text-xs rounded-lg bg-muted/30 border-0">
                      <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="text-xs">All items</SelectItem>
                      <SelectItem value="verified" className="text-xs">Verified</SelectItem>
                      <SelectItem value="supplier_added" className="text-xs">Supplier Added</SelectItem>
                      <SelectItem value="mismatch" className="text-xs">Mismatch</SelectItem>
                      <SelectItem value="missing" className="text-xs">Missing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Legend - Updated with supplier added */}
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Verified</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  <span>Supplier Added</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span>Review</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>Mismatch</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-4">
              {!po.items || po.items.length === 0 ? (
                <div className="text-center py-12">
                  <div className="p-4 bg-muted/30 rounded-full w-fit mx-auto mb-4">
                    <Package className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <p className="text-muted-foreground font-medium">No items found in this order</p>
                  <p className="text-xs text-muted-foreground/70">This purchase order has no line items</p>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-12">
                  <div className="p-4 bg-muted/30 rounded-full w-fit mx-auto mb-4">
                    <Search className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <p className="text-muted-foreground font-medium">No matching items</p>
                  <p className="text-xs text-muted-foreground/70">Try adjusting your search or filter</p>
                </div>
              ) : (
                <>
                  {/* List View */}
                  {viewMode === 'list' && (
                    <div className="space-y-2">
                      {filteredItems.map((item: any, index: number) => {
                        const reqItem = po.requisition?.items?.find(
                          (ri: any) => ri.id === item.requisition_item_id
                        );
                        return (
                          <ItemComparison
                            key={item.id}
                            poItem={item}
                            requisitionItem={reqItem}
                            index={index}
                            expanded={expandedItems.has(index)}
                            onToggle={() => toggleItem(index)}
                          />
                        );
                      })}
                    </div>
                  )}

                  {/* Grid View */}
                  {viewMode === 'grid' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {filteredItems.map((item: any, index: number) => {
                        const reqItem = po.requisition?.items?.find(
                          (ri: any) => ri.id === item.requisition_item_id);
                        const isSupplierAdded = !item.requisition_item_id;
                        const nameMatch = isSupplierAdded ? true : item.item_name?.toLowerCase() === reqItem?.item_name?.toLowerCase();
                        const qtyMatch = isSupplierAdded ? true : item.quantity === reqItem?.quantity;
                        const unitMatch = isSupplierAdded ? true : item.unit_of_measure === reqItem?.unit_of_measure;
                        const isMatch = nameMatch && qtyMatch && unitMatch;

                        return (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.03 }}
                            className={cn(
                              "p-4 rounded-xl border transition-all duration-300",
                              isSupplierAdded
                                ? "bg-purple-50/30 dark:bg-purple-950/20 border-purple-200/50 dark:border-purple-800/50"
                                : isMatch
                                  ? "bg-emerald-50/30 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-800/50"
                                  : !reqItem || !nameMatch
                                    ? "bg-rose-50/30 dark:bg-rose-950/20 border-rose-200/50 dark:border-rose-800/50"
                                    : "bg-amber-50/30 dark:bg-amber-950/20 border-amber-200/50 dark:border-amber-800/50"
                            )}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-muted-foreground">#{index + 1}</span>
                                <h4 className="font-medium text-sm text-gray-900 dark:text-white truncate max-w-[150px]">
                                  {item.item_name}
                                </h4>
                              </div>
                              {isSupplierAdded ? (
                                <Sparkles className="h-4 w-4 text-purple-500" />
                              ) : isMatch ? (
                                <CheckCircle className="h-4 w-4 text-emerald-500" />
                              ) : (
                                <XCircle className="h-4 w-4 text-rose-500" />
                              )}
                            </div>
                            {isSupplierAdded && (
                              <Badge className="mt-1 text-[10px] rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                                <Sparkles className="h-3 w-3 mr-0.5" />
                                Supplier Added
                              </Badge>
                            )}
                            <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                              <div>
                                <p className="text-muted-foreground">Qty</p>
                                <p className="font-medium">{item.quantity}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Price</p>
                                <p className="font-medium text-blue-600 dark:text-blue-400">{formatCurrency(item.unit_price)}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Unit</p>
                                <p className="font-medium">{item.unit_of_measure || '—'}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Total</p>
                                <p className="font-medium">{formatCurrency((item.unit_price || 0) * (item.quantity || 0))}</p>
                              </div>
                            </div>
                            {reqItem && !isSupplierAdded && (
                              <div className="mt-2 pt-2 border-t border-gray-200/50 dark:border-gray-700/50 text-xs text-muted-foreground">
                                <p>Req: {reqItem.quantity} × {formatCurrency(reqItem.estimated_unit_cost)}</p>
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  )}

                  {/* Table View */}
                  {viewMode === 'table' && (
                    <div className="rounded-lg border overflow-hidden">
                      <UITable>
                        <TableHeader className="bg-muted/30">
                          <TableRow>
                            <TableHead className="w-12 text-center">#</TableHead>
                            <TableHead>Item Name</TableHead>
                            <TableHead className="text-center">PO Qty</TableHead>
                            <TableHead className="text-center">Req Qty</TableHead>
                            <TableHead className="text-center">Unit</TableHead>
                            <TableHead className="text-right">PO Price</TableHead>
                            <TableHead className="text-right">Req Price</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredItems.map((item: any, index: number) => {
                            const reqItem = po.requisition?.items?.find(
                              (ri: any) => ri.id === item.requisition_item_id
                            );
                            const isSupplierAdded = !item.requisition_item_id;
                            const nameMatch = isSupplierAdded ? true : item.item_name?.toLowerCase() === reqItem?.item_name?.toLowerCase();
                            const qtyMatch = isSupplierAdded ? true : item.quantity === reqItem?.quantity;
                            const unitMatch = isSupplierAdded ? true : item.unit_of_measure === reqItem?.unit_of_measure;
                            const isMatch = nameMatch && qtyMatch && unitMatch;

                            let statusText = 'Verified';
                            let statusColor = 'text-emerald-600 dark:text-emerald-400';

                            if (isSupplierAdded) {
                              statusText = 'Supplier Added';
                              statusColor = 'text-purple-600 dark:text-purple-400';
                            } else if (!reqItem) {
                              statusText = 'Missing';
                              statusColor = 'text-rose-600 dark:text-rose-400';
                            } else if (!nameMatch) {
                              statusText = 'Name Mismatch';
                              statusColor = 'text-rose-600 dark:text-rose-400';
                            } else if (!qtyMatch || !unitMatch) {
                              statusText = 'Mismatch';
                              statusColor = 'text-amber-600 dark:text-amber-400';
                            }

                            return (
                              <TableRow key={item.id} className={cn(
                                isSupplierAdded ? "bg-purple-50/20 dark:bg-purple-950/10" :
                                  isMatch ? "bg-emerald-50/20 dark:bg-emerald-950/10" : "bg-amber-50/20 dark:bg-amber-950/10"
                              )}>
                                <TableCell className="text-center text-xs text-muted-foreground font-medium">{index + 1}</TableCell>
                                <TableCell className="font-medium">{item.item_name}</TableCell>
                                <TableCell className="text-center">{item.quantity}</TableCell>
                                <TableCell className="text-center">{isSupplierAdded ? '—' : (reqItem?.quantity || '—')}</TableCell>
                                <TableCell className="text-center">{item.unit_of_measure || '—'}</TableCell>
                                <TableCell className="text-right font-medium text-blue-600 dark:text-blue-400">
                                  {formatCurrency(item.unit_price)}
                                </TableCell>
                                <TableCell className="text-right text-muted-foreground">
                                  {isSupplierAdded ? '—' : (reqItem ? formatCurrency(reqItem.estimated_unit_cost) : '—')}
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                  {formatCurrency((item.unit_price || 0) * (item.quantity || 0))}
                                </TableCell>
                                <TableCell className="text-center">
                                  <span className={cn("text-xs font-medium", statusColor)}>
                                    {statusText}
                                  </span>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </UITable>
                    </div>
                  )}
                </>
              )}
            </CardContent>

            <CardFooter className="border-t bg-muted/20 px-6 py-3">
              <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="rounded-full">
                    {comparisonStats.total} total
                  </Badge>
                  <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full">
                    {comparisonStats.verified} verified
                  </Badge>
                  {comparisonStats.supplierAdded > 0 && (
                    <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded-full">
                      <Sparkles className="h-3 w-3 mr-1" />
                      {comparisonStats.supplierAdded} added
                    </Badge>
                  )}
                  <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full">
                    {comparisonStats.quantityMismatch + comparisonStats.nameMismatch} mismatches
                  </Badge>
                  <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 rounded-full">
                    {comparisonStats.missing} missing
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span>Match rate: {comparisonStats.matchRate}%</span>
                  <div className="w-24">
                    <Progress
                      value={comparisonStats.matchRate}
                      className={cn(
                        "h-1.5",
                        comparisonStats.matchRate >= 80 ? "bg-emerald-200 dark:bg-emerald-800" :
                          comparisonStats.matchRate >= 50 ? "bg-amber-200 dark:bg-amber-800" :
                            "bg-rose-200 dark:bg-rose-800"
                      )}
                    />
                  </div>
                </div>
              </div>
            </CardFooter>
          </Card>
        </motion.div>

        {/* ============================================ */}
        {/* TERMS & CONDITIONS */}
        {/* ============================================ */}
        {(po.delivery_terms || po.payment_terms || po.special_conditions) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card className="border-0 shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="pb-3 border-b bg-gradient-to-r from-gray-50/50 to-gray-100/50 dark:from-gray-900/30 dark:to-gray-800/30">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                    <Shield className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  Terms & Conditions
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {po.delivery_terms && (
                    <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-xl">
                      <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex-shrink-0">
                        <Truck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Delivery Terms</p>
                        <p className="text-sm text-gray-900 dark:text-white mt-0.5">{po.delivery_terms}</p>
                      </div>
                    </div>
                  )}
                  {po.payment_terms && (
                    <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-xl">
                      <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex-shrink-0">
                        <CreditCard className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Payment Terms</p>
                        <p className="text-sm text-gray-900 dark:text-white mt-0.5">{po.payment_terms}</p>
                      </div>
                    </div>
                  )}
                  {po.special_conditions && (
                    <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-xl md:col-span-2">
                      <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex-shrink-0">
                        <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Special Conditions</p>
                        <p className="text-sm text-gray-900 dark:text-white mt-0.5">{po.special_conditions}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ============================================ */}
        {/* COST SUMMARY */}
        {/* ============================================ */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="pb-3 border-b bg-gradient-to-r from-gray-50/50 to-gray-100/50 dark:from-gray-900/30 dark:to-gray-800/30">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-teal-100 dark:bg-teal-900/30">
                  <Layers className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                </div>
                Cost Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-muted/30 rounded-xl">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Subtotal</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">{formatCurrency(po.total_amount || 0)}</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-xl">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Tax Amount</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">{formatCurrency(po.tax_amount || 0)}</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-xl">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Discount</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">{formatCurrency(0)}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-emerald-50/80 to-teal-50/80 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-xl border border-emerald-200/50 dark:border-emerald-800/50">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total</p>
                  <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{formatCurrency(po.total_amount || 0)}</p>
                </div>
              </div>

              <Separator className="my-4 bg-gray-200/50 dark:bg-gray-700/50" />

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>On budget</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>Above estimate</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-rose-500" />
                    <span>Over budget</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span>Estimated: {formatCurrency(financialComparison.estimatedTotal)}</span>
                  <ArrowRight className="h-3 w-3" />
                  <span>Actual: {formatCurrency(financialComparison.actualTotal)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ============================================ */}
      {/* CHECK DIALOG - ENHANCED */}
      {/* ============================================ */}
      <Dialog open={showCheckDialog} onOpenChange={setShowCheckDialog}>
        <DialogContent className="rounded-xl dark:bg-gray-900 max-w-lg border-0 shadow-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30">
                <UserCheck className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-gray-900 dark:text-gray-100 text-xl">
                  Confirm Check
                </DialogTitle>
                <DialogDescription className="text-gray-600 dark:text-gray-400">
                  You are about to check &quot;{po?.po_number}&quot;
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="grid grid-cols-2 gap-3 p-4 bg-muted/30 rounded-xl">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">PO Number</p>
                <p className="font-semibold text-gray-900 dark:text-white font-mono">{po?.po_number}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Supplier</p>
                <p className="font-semibold text-gray-900 dark:text-white">{supplierName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Match Rate</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={cn(
                    "font-bold",
                    comparisonStats.matchRate >= 80 ? "text-emerald-600" :
                      comparisonStats.matchRate >= 50 ? "text-amber-600" : "text-rose-600"
                  )}>
                    {comparisonStats.matchRate}%
                  </span>
                  <div className="w-20">
                    <Progress
                      value={comparisonStats.matchRate}
                      className={cn(
                        "h-1.5",
                        comparisonStats.matchRate >= 80 ? "bg-emerald-200" :
                          comparisonStats.matchRate >= 50 ? "bg-amber-200" : "bg-rose-200"
                      )}
                    />
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Amount</p>
                <p className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(po?.total_amount)}</p>
              </div>
            </div>

            {comparisonStats.supplierAdded > 0 && (
              <div className="flex items-center gap-2 p-3 bg-purple-50/50 dark:bg-purple-950/20 rounded-xl text-xs text-purple-700 dark:text-purple-300">
                <Sparkles className="h-4 w-4 text-purple-500 flex-shrink-0" />
                <span>{comparisonStats.supplierAdded} supplier-added items are included and approved.</span>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-sm font-medium">Comment (Optional)</Label>
              <Textarea
                placeholder="Add any notes about this check..."
                value={checkComment}
                onChange={(e) => setCheckComment(e.target.value)}
                rows={3}
                className="rounded-xl resize-none dark:bg-gray-800 dark:border-gray-700 focus-visible:ring-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl text-xs text-muted-foreground">
              <Info className="h-4 w-4 text-blue-500 flex-shrink-0" />
              <span>After checking, this PO will proceed to the Accountant for endorsement.</span>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowCheckDialog(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={handleConfirmCheck}
              disabled={checkMutation.isPending}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-xl shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 text-white transition-all duration-300"
            >
              {checkMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <UserCheck className="h-4 w-4 mr-2" />
              )}
              Confirm Check
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTemplate>
  );
}
