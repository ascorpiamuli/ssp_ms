// frontend/src/app/(dashboard)/procurement/delivery-notes/goods-received/create/page.tsx

'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Building2,
  User,
  Mail,
  Info,
  Layers,
  ChevronDown,
  ChevronUp,
  Search,
  X,
  Eye,
  FileCheck,
  Sparkles,
  Store,
  BadgeCheck,
  FileText,
  Package,
  DollarSign,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Plus,
  Send,
  TrendingUp,
  Award,
  Shield,
  CreditCard,
  Crown,
  Briefcase,
  Hash,
  MapPin,
  Globe,
  Phone,
  MailCheck,
  Building,
  UserCog,
  Check,
  ChevronRight,
  Edit,
  Bell,
  Truck,
  Scale,
  ClipboardList,
  AlertTriangle,
  ThumbsUp,
  Star,
  Zap,
  Rocket,
  Gem,
  Crown as CrownIcon,
  Flame,
  Leaf,
  Heart,
  Gift,
  Timer,
  Target,
  Database,
  Server,
  Cloud,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Headphones,
  Speaker,
  Mic,
  Phone as PhoneIcon,
  Mail as MailIcon,
  Globe as GlobeIcon,
  MapPin as MapPinIcon,
  Clock as ClockIcon,
  User as UserIcon,
  Settings,
  Menu,
  MoreHorizontal,
  MoreVertical,
  BarChart,
  BarChart2,
  BarChart4,
  ChartBar,
  ChartLine,
  ChartArea,
  ChartPie,
  ChartScatter,
  ChartBarStacked,
  ChartColumnStacked,
  Trash2,
  Edit2,
  Save,
  PlusCircle,
  MinusCircle,
  AlertOctagon,
  ThumbsDown,
  CheckSquare,
  Square as SquareIcon,
  RotateCw,
} from 'lucide-react';

import { format } from 'date-fns';
import { useToast } from '@/components/ui/toast-context';
import { PageTemplate } from '@/components/dashboard/PageTemplate';
import { WrappedCornerTag } from '@/components/ui/wrapped-corner-tag';
import { cn } from '@/lib/utils';

// UI Components
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
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

// Hooks
import { usePurchaseOrders } from '@/hooks/usePurchaseOrder';
import { useCreateGrn } from '@/hooks/useGoodsReceived';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useAuth } from '@/hooks/useAuth';

// Types
import type { PurchaseOrder } from '@/types/purchaseOrder.types';
import type { CreateGoodsReceivedData } from '@/types/goodsReceived.types';

// ============================================
// CONSTANTS
// ============================================

const CURRENCY = 'KES';

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

const getSupplierName = (supplier: any): string => {
  if (!supplier) return 'Unknown Supplier';
  if (typeof supplier === 'string') return supplier;
  if (supplier.company_name) return supplier.company_name;
  if (supplier.full_name) return supplier.full_name;
  if (supplier.name) return supplier.name;
  return 'Unknown Supplier';
};

/**
 * Generate a delivery note number with timestamp
 * Format: DN-YYYYMMDD-XXXX
 */
const generateDeliveryNoteNumber = (): string => {
  const now = new Date();
  const dateStr = format(now, 'yyyyMMdd');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `DN-${dateStr}-${random}`;
};

/**
 * Generate a waybill/tracking number
 * Format: WB-YYYYMMDD-XXXXX
 */
const generateWaybillNumber = (): string => {
  const now = new Date();
  const dateStr = format(now, 'yyyyMMdd');
  const random = Math.floor(10000 + Math.random() * 90000);
  return `WB-${dateStr}-${random}`;
};

/**
 * Generate a reference number
 * Format: REF-YYYYMMDD-XXXX
 */
const generateReferenceNumber = (): string => {
  const now = new Date();
  const dateStr = format(now, 'yyyyMMdd');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `REF-${dateStr}-${random}`;
};

// ============================================
// PO STATUS BADGE
// ============================================

function POStatusBadge({ status }: { status: string }) {
  const statusMap: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    draft: {
      label: 'Draft',
      color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700',
      icon: <FileText className="h-3 w-3" />
    },
    checked: {
      label: 'Checked',
      color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
      icon: <UserCog className="h-3 w-3" />
    },
    endorsed: {
      label: 'Endorsed',
      color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
      icon: <CreditCard className="h-3 w-3" />
    },
    approved: {
      label: 'Approved',
      color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
      icon: <Award className="h-3 w-3" />
    },
    issued: {
      label: 'Issued',
      color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
      icon: <Send className="h-3 w-3" />
    },
    acknowledged: {
      label: 'Acknowledged',
      color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800',
      icon: <CheckCircle className="h-3 w-3" />
    },
    completed: {
      label: 'Completed',
      color: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-800',
      icon: <CheckCircle className="h-3 w-3" />
    },
    cancelled: {
      label: 'Cancelled',
      color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
      icon: <XCircle className="h-3 w-3" />
    },
  };

  const { label, color, icon } = statusMap[status] || {
    label: status,
    color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700',
    icon: <FileText className="h-3 w-3" />
  };

  return (
    <Badge variant="outline" className={`${color} border text-xs font-medium px-2.5 py-1 flex items-center gap-1.5 rounded-full`}>
      {icon}
      {label}
    </Badge>
  );
}

// ============================================
// CUSTOM PO DROPDOWN
// ============================================

interface POCustomDropdownProps {
  options: PurchaseOrder[];
  value: number;
  onChange: (value: number) => void;
  placeholder: string;
  isLoading: boolean;
  disabled?: boolean;
}

function POCustomDropdown({ options, value, onChange, placeholder, isLoading, disabled }: POCustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.id === value);

  const filteredOptions = options.filter(opt =>
    opt.po_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opt.supplier?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opt.supplier?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opt.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isLoading) {
    return (
      <div className="relative">
        <div className="flex items-center justify-between px-4 py-3 bg-muted/30 rounded-xl border border-border/50 h-[72px]">
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-5 rounded" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <Skeleton className="h-5 w-5" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className={`flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 rounded-xl border-2 transition-all cursor-pointer min-h-[72px] ${isOpen
          ? 'border-primary shadow-lg shadow-primary/20 dark:shadow-primary/10'
          : 'border-border/50 dark:border-gray-700 hover:border-primary/30 dark:hover:border-primary/30'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        {selectedOption ? (
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm truncate text-foreground">{selectedOption.po_number}</span>
                <POStatusBadge status={selectedOption.status} />
              </div>
              <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                <span className="text-sm text-foreground truncate">{getSupplierName(selectedOption.supplier)}</span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatCurrency(selectedOption.total_amount)}
                </span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {selectedOption.items?.length || 0} items
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted/30 dark:bg-muted/20 flex items-center justify-center">
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
            <span className="text-muted-foreground">{placeholder}</span>
          </div>
        )}
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        )}
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-900 rounded-xl border border-border dark:border-gray-700 shadow-xl dark:shadow-2xl overflow-hidden animate-in slide-in-from-top-2 duration-200">
          <div className="p-3 border-b border-border/50 dark:border-gray-700/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search purchase orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-10 bg-muted/20 dark:bg-muted/10 border-0 focus-visible:ring-1 rounded-xl"
                onClick={(e) => e.stopPropagation()}
              />
              {searchTerm && (
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchTerm('');
                  }}
                >
                  <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
          </div>

          <ScrollArea className="max-h-[400px]">
            {filteredOptions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Search className="h-10 w-10 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No purchase orders found</p>
                <p className="text-xs text-muted-foreground/70">Try adjusting your search</p>
              </div>
            ) : (
              <div className="p-2 space-y-1.5">
                {filteredOptions.map((option) => (
                  <div
                    key={option.id}
                    className={`group flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all ${option.id === value
                      ? 'bg-primary/10 dark:bg-primary/20 border-2 border-primary'
                      : 'hover:bg-muted/30 dark:hover:bg-muted/20 border-2 border-transparent'
                      }`}
                    onClick={() => {
                      onChange(option.id);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${option.id === value
                        ? 'bg-primary text-white dark:bg-primary dark:text-white'
                        : 'bg-muted/50 dark:bg-muted/30 text-muted-foreground'
                        }`}>
                        <FileText className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{option.po_number}</span>
                        <POStatusBadge status={option.status} />
                        {option.id === value && (
                          <Badge className="bg-primary/20 dark:bg-primary/30 text-primary border-primary/30 text-[10px] px-2 py-0 rounded-full">
                            Selected
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-foreground truncate">{getSupplierName(option.supplier)}</p>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <Package className="h-3 w-3" />
                          {option.items?.length || 0} items
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {formatCurrency(option.total_amount)}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(option.expected_delivery_date)}
                        </span>
                      </div>
                    </div>
                    {option.id === value && (
                      <div className="flex-shrink-0">
                        <CheckCircle className="h-5 w-5 text-primary" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <div className="p-3 border-t border-border/50 dark:border-gray-700/50 bg-muted/10 dark:bg-muted/5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{filteredOptions.length} purchase order{filteredOptions.length !== 1 ? 's' : ''} available</span>
              <span className="flex items-center gap-1">
                <BadgeCheck className="h-3 w-3 text-emerald-500" />
                Approved for delivery
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// ITEM RECEIVING ROW COMPONENT
// ============================================

interface ItemReceivingRowProps {
  item: any;
  index: number;
  receivedQuantity: number;
  rejectedQuantity: number;
  conditionNotes: string;
  rejectionReason: string;
  onUpdate: (field: string, value: any) => void;
}

function ItemReceivingRow({
  item,
  index,
  receivedQuantity,
  rejectedQuantity,
  conditionNotes,
  rejectionReason,
  onUpdate,
}: ItemReceivingRowProps) {
  const maxQuantity = parseFloat(item.quantity) || 0;
  const totalProcessed = (receivedQuantity || 0) + (rejectedQuantity || 0);
  const isFullyProcessed = totalProcessed >= maxQuantity;
  const remaining = Math.max(0, maxQuantity - totalProcessed);

  // Determine the status color based on received quantity vs requested
  const getReceivedStatus = () => {
    if (receivedQuantity === 0) return 'empty';
    if (receivedQuantity === maxQuantity) return 'full';
    if (receivedQuantity < maxQuantity) return 'partial';
    return 'empty';
  };

  const receivedStatus = getReceivedStatus();

  const statusConfig = {
    empty: {
      border: 'border-gray-300 dark:border-gray-600',
      bg: 'bg-gray-50/30 dark:bg-gray-800/20',
      label: 'Pending',
      labelColor: 'text-gray-500 dark:text-gray-400',
      indicator: <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600" />
    },
    partial: {
      border: 'border-amber-400 dark:border-amber-600',
      bg: 'bg-amber-50/40 dark:bg-amber-950/20',
      label: 'Partial',
      labelColor: 'text-amber-600 dark:text-amber-400',
      indicator: <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
    },
    full: {
      border: 'border-emerald-400 dark:border-emerald-600',
      bg: 'bg-emerald-50/40 dark:bg-emerald-950/20',
      label: 'Full',
      labelColor: 'text-emerald-600 dark:text-emerald-400',
      indicator: <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
    }
  };

  const status = statusConfig[receivedStatus];

  return (
    <div className={cn(
      "p-4 rounded-xl border-2 transition-all duration-300",
      status.border,
      status.bg,
      "hover:shadow-md"
    )}>
      <div className="flex items-start gap-4">
        {/* Item Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm text-foreground dark:text-gray-200">
              {index + 1}. {item.item_name}
            </span>
            <Badge variant="outline" className="text-xs bg-primary/5 dark:bg-primary/10 border-primary/20 dark:border-primary/30 rounded-full">
              {item.quantity} {item.unit_of_measure}
            </Badge>
            {isFullyProcessed && (
              <Badge className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full">
                <CheckCircle className="h-3 w-3 mr-1" />
                Fully Processed
              </Badge>
            )}
            {remaining > 0 && totalProcessed > 0 && (
              <Badge variant="outline" className="text-xs bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/50 text-amber-700 dark:text-amber-400 rounded-full">
                {remaining} remaining
              </Badge>
            )}
            {/* Status Indicator */}
            <div className="flex items-center gap-1.5 ml-auto">
              {status.indicator}
              <span className={cn("text-xs font-medium", status.labelColor)}>
                {status.label}
              </span>
            </div>
          </div>
          {item.specifications && (
            <p className="text-xs text-muted-foreground dark:text-gray-400 mt-1">
              {item.specifications}
            </p>
          )}
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground dark:text-gray-400">
            <span>Unit: {formatCurrency(item.unit_price)}</span>
            <span>•</span>
            <span className="font-medium text-foreground dark:text-gray-200">Total: {formatCurrency(item.total_price)}</span>
          </div>
        </div>
      </div>

      {/* Receiving Fields with Requested Quantity Display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-3">
        {/* Requested Quantity - Display Only */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground flex items-center gap-1">
            <Package className="h-3 w-3" />
            Requested
          </Label>
          <div className="h-9 px-3 py-2 rounded-lg bg-muted/30 dark:bg-muted/20 border border-border/30 dark:border-gray-700 flex items-center">
            <span className="text-sm font-semibold text-foreground dark:text-gray-200">
              {maxQuantity} {item.unit_of_measure}
            </span>
          </div>
        </div>

        {/* Received Quantity - Input */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-emerald-500" />
            Received <span className="text-red-500">*</span>
          </Label>
          <Input
            type="number"
            min="0"
            max={maxQuantity}
            value={receivedQuantity || ''}
            onChange={(e) => {
              const val = parseFloat(e.target.value) || 0;
              const max = parseFloat(item.quantity) || 0;
              if (val <= max) {
                onUpdate('received_quantity', val);
              }
            }}
            className={cn(
              "h-9 text-sm dark:bg-gray-900 dark:border-gray-700 rounded-lg transition-all duration-300",
              receivedQuantity === maxQuantity && receivedQuantity > 0 && "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-1 ring-emerald-500/30",
              receivedQuantity > 0 && receivedQuantity < maxQuantity && "border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 ring-1 ring-amber-500/30",
              receivedQuantity === 0 && "border-gray-300 dark:border-gray-600"
            )}
            placeholder="0"
          />
        </div>

        {/* Rejected Quantity */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground flex items-center gap-1">
            <XCircle className="h-3 w-3 text-red-500" />
            Rejected
          </Label>
          <Input
            type="number"
            min="0"
            max={maxQuantity}
            value={rejectedQuantity || ''}
            onChange={(e) => {
              const val = parseFloat(e.target.value) || 0;
              const max = parseFloat(item.quantity) || 0;
              if (val <= max) {
                onUpdate('rejected_quantity', val);
              }
            }}
            className="h-9 text-sm dark:bg-gray-900 dark:border-gray-700 rounded-lg"
            placeholder="0"
          />
        </div>

        {/* Rejection Reason */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Rejection Reason</Label>
          <Input
            value={rejectionReason || ''}
            onChange={(e) => onUpdate('rejection_reason', e.target.value)}
            placeholder="Reason if rejected"
            className="h-9 text-sm dark:bg-gray-900 dark:border-gray-700 rounded-lg"
            disabled={!rejectedQuantity || rejectedQuantity === 0}
          />
        </div>

        {/* Condition Notes */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Condition Notes</Label>
          <Input
            value={conditionNotes || ''}
            onChange={(e) => onUpdate('condition_notes', e.target.value)}
            placeholder="e.g., Good, Damaged"
            className="h-9 text-sm dark:bg-gray-900 dark:border-gray-700 rounded-lg"
          />
        </div>
      </div>

      {/* Visual Progress Bar */}
      <div className="mt-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-500 rounded-full",
                receivedQuantity === maxQuantity && receivedQuantity > 0 ? "bg-emerald-500" :
                  receivedQuantity > 0 ? "bg-amber-500" : "bg-gray-300 dark:bg-gray-600"
              )}
              style={{
                width: `${maxQuantity > 0 ? Math.min((receivedQuantity / maxQuantity) * 100, 100) : 0}%`
              }}
            />
          </div>
          <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
            {maxQuantity > 0 ? Math.round((receivedQuantity / maxQuantity) * 100) : 0}%
          </span>
        </div>
        {receivedQuantity === maxQuantity && receivedQuantity > 0 && (
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1.5">
            <Info className="h-3 w-3" />
            Full receipt — please verify physical count before submitting
          </p>
        )}
        {receivedQuantity > 0 && receivedQuantity < maxQuantity && (
          <p className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-1.5">
            <AlertTriangle className="h-3 w-3" />
            Partial receipt — {remaining} {item.unit_of_measure} remaining
          </p>
        )}
      </div>
    </div>
  );
}

// ============================================
// CREATE GRN PAGE
// ============================================

export default function CreateGoodsReceivedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { success, error } = useToast();
  const { user } = useAuth();

  const purchaseOrderIdParam = searchParams.get('purchase_order_id');

  // Hooks - ONLY load LPOs (goods), not LSOs (services)
  const {
    data: purchaseOrdersData,
    isLoading: isLoadingPOs,
    refetch: refetchPOs,
  } = usePurchaseOrders({
    status: 'acknowledged' as any,
    type: 'lpo' as any, // 🔥 Only LPOs (goods) for GRN
  });

  const { useAllSuppliers } = useSuppliers();
  const { data: suppliers, isLoading: isLoadingSuppliers } = useAllSuppliers();

  const createGrn = useCreateGrn();

  // Extract the actual array from PaginatedResponse
  const purchaseOrders = useMemo(() => {
    if (!purchaseOrdersData) return [];
    if (Array.isArray(purchaseOrdersData)) return purchaseOrdersData;
    // If it's a PaginatedResponse, extract the data array
    if ('data' in purchaseOrdersData && Array.isArray(purchaseOrdersData.data)) {
      return purchaseOrdersData.data;
    }
    return [];
  }, [purchaseOrdersData]);

  // Build supplier map
  const supplierMap = useMemo(() => {
    const map = new Map<number, any>();
    if (Array.isArray(suppliers)) {
      suppliers.forEach((supplier: any) => {
        map.set(supplier.id, supplier);
      });
    }
    return map;
  }, [suppliers]);

  // Generate auto numbers on component mount
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      delivery_note_number: generateDeliveryNoteNumber(),
      waybill_number: generateWaybillNumber(),
      reference_number: generateReferenceNumber(),
    }));
  }, []);

  // State - includes ALL database fields
  const [formData, setFormData] = useState<CreateGoodsReceivedData & {
    reference_number: string;
    delivery_note_number: string;
    carrier: string;
    waybill_number: string;
    vehicle_number: string;
    delivery_condition: string;
    additional_notes: string;
  }>({
    purchase_order_id: purchaseOrderIdParam ? parseInt(purchaseOrderIdParam) : 0,
    type: 'grn',
    received_date: format(new Date(), 'yyyy-MM-dd'),
    received_time: format(new Date(), 'HH:mm'),
    reference_number: generateReferenceNumber(),
    delivery_note_number: generateDeliveryNoteNumber(),
    carrier: '',
    waybill_number: generateWaybillNumber(),
    vehicle_number: '',
    delivery_condition: '',
    approval_level: 'hod',
    items: [],
    additional_notes: '',
    // Fields that will be auto-populated on submit:
    // requisition_id: from PO
    // received_by: current user
    // total_quantity: calculated from items
    // total_value: calculated from items
    // total_tax: calculated from items
    // total_discount: calculated from items
    // net_total: calculated from items
    // status: 'draft'
    // inspection_result: 'pending'
  });

  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [itemReceivingData, setItemReceivingData] = useState<Map<number, {
    received_quantity: number;
    rejected_quantity: number;
    rejection_reason: string;
    condition_notes: string;
  }>>(new Map());
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    refetchPOs();
  }, []);

  // Auto-select PO if passed via query param
  useEffect(() => {
    if (purchaseOrderIdParam && purchaseOrders.length > 0) {
      const po = purchaseOrders.find((p: any) => p.id === parseInt(purchaseOrderIdParam));
      if (po) {
        handlePOSelect(po);
      }
    }
  }, [purchaseOrders, purchaseOrderIdParam]);

  const handlePOSelect = (purchaseOrder: PurchaseOrder) => {
    setSelectedPO(purchaseOrder);
    setFormData(prev => ({
      ...prev,
      purchase_order_id: purchaseOrder.id,
      // Auto-populate requisition_id from PO
      requisition_id: purchaseOrder.requisition_id,
    }));

    // Auto-select all items and initialize receiving data
    if (purchaseOrder.items) {
      const allItemIds = new Set(purchaseOrder.items.map((item: any) => item.id));
      setSelectedItems(allItemIds);

      // Initialize receiving data for all items
      const receivingMap = new Map();
      purchaseOrder.items.forEach((item: any) => {
        receivingMap.set(item.id, {
          received_quantity: 0,
          rejected_quantity: 0,
          rejection_reason: '',
          condition_notes: '',
        });
      });
      setItemReceivingData(receivingMap);
    }
  };

  const handlePOSelectById = (poId: number) => {
    const po = purchaseOrders.find((p: any) => p.id === poId);
    if (po) {
      handlePOSelect(po);
    } else {
      setSelectedPO(null);
      setSelectedItems(new Set());
      setItemReceivingData(new Map());
      setFormData(prev => ({
        ...prev,
        purchase_order_id: 0,
        requisition_id: undefined,
        items: [],
      }));
    }
  };

  const handleItemToggle = (itemId: number) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleSelectAllItems = () => {
    if (!selectedPO?.items) return;
    if (selectedItems.size === selectedPO.items.length) {
      setSelectedItems(new Set());
    } else {
      const allItemIds = new Set(selectedPO.items.map((item: any) => item.id));
      setSelectedItems(allItemIds);
      // Initialize receiving data for newly selected items
      const receivingMap = new Map(itemReceivingData);
      selectedPO.items.forEach((item: any) => {
        if (!receivingMap.has(item.id)) {
          receivingMap.set(item.id, {
            received_quantity: 0,
            rejected_quantity: 0,
            rejection_reason: '',
            condition_notes: '',
          });
        }
      });
      setItemReceivingData(receivingMap);
    }
  };

  const handleItemReceivingUpdate = (itemId: number, field: string, value: any) => {
    setItemReceivingData(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(itemId) || {
        received_quantity: 0,
        rejected_quantity: 0,
        rejection_reason: '',
        condition_notes: '',
      };
      newMap.set(itemId, { ...current, [field]: value });
      return newMap;
    });
  };

  // Calculate totals from receiving data
  const calculatedTotals = useMemo(() => {
    let totalQuantity = 0;
    let totalValue = 0;
    let totalTax = 0;
    let totalDiscount = 0;

    selectedPO?.items?.forEach((item: any) => {
      const receivingData = itemReceivingData.get(item.id);
      if (receivingData && selectedItems.has(item.id)) {
        const receivedQty = receivingData.received_quantity || 0;
        const unitPrice = parseFloat(item.unit_price) || 0;
        const taxAmount = parseFloat(item.tax_amount) || 0;
        const discountAmount = parseFloat(item.discount_amount) || 0;

        totalQuantity += receivedQty;
        totalValue += receivedQty * unitPrice;
        // Tax and discount proportional to received quantity
        const totalOrderQty = parseFloat(item.quantity) || 1;
        const ratio = receivedQty / totalOrderQty;
        totalTax += (taxAmount || 0) * ratio;
        totalDiscount += (discountAmount || 0) * ratio;
      }
    });

    return {
      totalQuantity,
      totalValue,
      totalTax,
      totalDiscount,
      netTotal: totalValue + totalTax - totalDiscount,
    };
  }, [selectedPO, itemReceivingData, selectedItems]);

  const handleSubmit = async () => {
    if (formData.purchase_order_id === 0) {
      error('Please select a purchase order');
      return;
    }

    if (selectedItems.size === 0) {
      error('Please select at least one item to receive');
      return;
    }

    if (!formData.received_date) {
      error('Please enter the received date');
      return;
    }

    // Build items payload with receiving data
    const items = selectedPO?.items
      ?.filter((item: any) => selectedItems.has(item.id))
      .map((item: any) => {
        const receivingData = itemReceivingData.get(item.id) || {
          received_quantity: 0,
          rejected_quantity: 0,
          rejection_reason: '',
          condition_notes: '',
        };

        return {
          purchase_order_item_id: item.id,
          received_quantity: receivingData.received_quantity || 0,
          rejected_quantity: receivingData.rejected_quantity || 0,
          rejection_reason: receivingData.rejection_reason || '',
          condition_notes: receivingData.condition_notes || '',
        };
      }) || [];

    if (items.length === 0) {
      error('Please select at least one item to receive');
      return;
    }

    // Validate that each selected item has received quantity > 0 or rejected quantity > 0
    const invalidItems = items.filter(
      item => item.received_quantity === 0 && item.rejected_quantity === 0
    );
    if (invalidItems.length > 0) {
      error('Each selected item must have either a received or rejected quantity');
      return;
    }

    setIsSubmitting(true);

    try {
      // Build full payload with all required fields
      const payload = {
        ...formData,
        requisition_id: selectedPO?.requisition_id,
        received_by: user?.id,
        total_quantity: calculatedTotals.totalQuantity,
        total_value: calculatedTotals.totalValue,
        total_tax: calculatedTotals.totalTax,
        total_discount: calculatedTotals.totalDiscount,
        net_total: calculatedTotals.netTotal,
        status: 'draft',
        inspection_result: 'pending',
        items,
      };

      await createGrn.mutateAsync(payload);
      success('Goods Received Note created successfully!');
      router.push('/procurement/delivery-notes/goods-received');
    } catch (err: any) {
      // Error handled by hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/procurement/delivery-notes/goods-received');
  };

  const isLoading = isLoadingPOs || isLoadingSuppliers;
  const poList = purchaseOrders;
  const selectedItemsCount = selectedItems.size;
  const totalItemsCount = selectedPO?.items?.length || 0;

  // Calculate total received and rejected quantities
  const totalReceived = useMemo(() => {
    let total = 0;
    itemReceivingData.forEach((data) => {
      total += data.received_quantity || 0;
    });
    return total;
  }, [itemReceivingData]);

  const totalRejected = useMemo(() => {
    let total = 0;
    itemReceivingData.forEach((data) => {
      total += data.rejected_quantity || 0;
    });
    return total;
  }, [itemReceivingData]);

  // Calculate overall progress percentage
  const overallProgress = useMemo(() => {
    if (totalItemsCount === 0 || selectedItemsCount === 0) return 0;
    let totalRequested = 0;
    let totalReceived = 0;
    selectedPO?.items?.forEach((item: any) => {
      if (selectedItems.has(item.id)) {
        const qty = parseFloat(item.quantity) || 0;
        totalRequested += qty;
        const data = itemReceivingData.get(item.id);
        if (data) {
          totalReceived += data.received_quantity || 0;
        }
      }
    });
    return totalRequested > 0 ? Math.round((totalReceived / totalRequested) * 100) : 0;
  }, [selectedPO, selectedItems, itemReceivingData]);

  return (
    <PageTemplate
      title="Create Goods Received Note"
      description="Record receipt of goods from a supplier against an approved purchase order. Only LPOs (goods) are shown here."
      icon={<Package className="h-5 w-5" />}
      background="gradient"
      variant="default"
      breadcrumbs={[
        { label: 'Procurement', href: '/procurement' },
        { label: 'Delivery Notes', href: '/procurement/delivery-notes' },
        { label: 'Goods Received Notes', href: '/procurement/delivery-notes/goods-received' },
        { label: 'Create' },
      ]}
      actions={
        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 rounded-full whitespace-nowrap">
            <CheckCircle className="h-3 w-3 mr-1" />
            {poList.length} LPOs Available
          </Badge>
          <Button variant="outline" size="sm" onClick={handleCancel} className="dark:border-gray-700 dark:hover:bg-gray-800 rounded-xl">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Instructions Alert */}
          <Alert className="rounded-xl border-blue-200 dark:border-blue-800/50 bg-blue-50/80 dark:bg-blue-950/30">
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/40">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <AlertTitle className="text-blue-700 dark:text-blue-300 font-semibold">How to create a Goods Received Note</AlertTitle>
                <AlertDescription className="text-blue-600 dark:text-blue-400 text-sm mt-0.5">
                  <ol className="list-decimal list-inside space-y-0.5">
                    <li>Select an <strong>acknowledged LPO</strong> from the dropdown below</li>
                    <li>Choose the <strong>items</strong> you are receiving from the purchase order</li>
                    <li>Enter the <strong>received quantity</strong> for each item (or reject with reason)</li>
                    <li>Fill in the <strong>delivery details</strong> (date, time, carrier, etc.)</li>
                    <li>Review and click <strong>"Create GRN"</strong> to complete</li>
                  </ol>
                </AlertDescription>
              </div>
            </div>
          </Alert>

          {/* Step 1: Select Purchase Order */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-950 rounded-xl relative">
            <WrappedCornerTag
              label="STEP 1"
              color="blue"
              position="top-left"
              size="sm"
              animated={true}
            />
            <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/10 rounded-t-xl">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/20 dark:bg-primary/30 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-foreground dark:text-gray-100">Select LPO (Goods)</CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    Choose an acknowledged LPO to record goods receipt against.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground dark:text-gray-200 flex items-center gap-1">
                  LPO <span className="text-red-500">*</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-muted-foreground dark:text-gray-500 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="rounded-xl">
                        <p className="max-w-xs">Select an acknowledged LPO (goods) that has items delivered.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <POCustomDropdown
                  options={poList}
                  value={formData.purchase_order_id}
                  onChange={handlePOSelectById}
                  placeholder="Search and select an LPO..."
                  isLoading={isLoading}
                  disabled={poList.length === 0}
                />
                {poList.length === 0 && !isLoading && (
                  <Alert variant="destructive" className="mt-3 dark:bg-red-950/50 dark:border-red-800 rounded-xl">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>No Available LPOs</AlertTitle>
                    <AlertDescription>
                      No acknowledged LPOs (goods) available for goods receipt. Orders must be acknowledged by suppliers first.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Hidden fields that are auto-populated */}
              {selectedPO && (
                <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground bg-muted/10 dark:bg-muted/5 p-3 rounded-xl border border-border/30 dark:border-gray-700">
                  <div>
                    <span className="font-medium">Requisition ID:</span>
                    <span className="ml-1">{selectedPO.requisition_id || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="font-medium">Received By:</span>
                    <span className="ml-1">{user?.full_name || user?.first_name || 'Current User'}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 2: Select & Receive Items */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-950 rounded-xl relative">
            <WrappedCornerTag
              label="STEP 2"
              color="emerald"
              position="top-left"
              size="sm"
              animated={true}
            />
            <CardHeader className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent dark:from-emerald-500/20 dark:via-emerald-500/10 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 dark:bg-emerald-500/30 flex items-center justify-center">
                    <Package className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div>
                    <CardTitle className="text-foreground dark:text-gray-100">Select & Receive Items</CardTitle>
                    <CardDescription className="dark:text-gray-400">
                      Select items and enter the quantities received or rejected.
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {/* Overall Progress Indicator */}
                  {selectedPO && selectedItemsCount > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full transition-all duration-500 rounded-full",
                            overallProgress === 100 ? "bg-emerald-500" :
                              overallProgress > 0 ? "bg-amber-500" : "bg-gray-300"
                          )}
                          style={{ width: `${overallProgress}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">
                        {overallProgress}%
                      </span>
                    </div>
                  )}
                  <Badge variant="outline" className="bg-primary/5 dark:bg-primary/10 border-primary/20 dark:border-primary/30 text-foreground dark:text-gray-200 rounded-full">
                    {selectedItemsCount} of {totalItemsCount} selected
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {!selectedPO ? (
                <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-border/30 dark:border-gray-700 rounded-xl">
                  <div className="w-16 h-16 rounded-full bg-muted/30 dark:bg-muted/20 flex items-center justify-center mb-4">
                    <Package className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">No LPO Selected</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">Select an LPO above to see its items</p>
                </div>
              ) : selectedPO.items && selectedPO.items.length > 0 ? (
                <>
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-border/30 dark:border-gray-700">
                    <span className="text-xs text-muted-foreground dark:text-gray-400">
                      {totalItemsCount} item{totalItemsCount !== 1 ? 's' : ''} available
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground dark:text-gray-400">
                        Received: <span className="text-emerald-600 dark:text-emerald-400 font-medium">{totalReceived}</span>
                      </span>
                      <span className="text-xs text-muted-foreground dark:text-gray-400">
                        Rejected: <span className="text-red-600 dark:text-red-400 font-medium">{totalRejected}</span>
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs dark:hover:bg-gray-800 rounded-xl"
                        onClick={handleSelectAllItems}
                      >
                        {selectedItemsCount === totalItemsCount ? 'Deselect All' : 'Select All'}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                    {selectedPO.items.map((item: any, index: number) => {
                      const isSelected = selectedItems.has(item.id);
                      const receivingData = itemReceivingData.get(item.id) || {
                        received_quantity: 0,
                        rejected_quantity: 0,
                        rejection_reason: '',
                        condition_notes: '',
                      };

                      return (
                        <div key={item.id} className="relative">
                          <div className="flex items-start gap-2 mb-2">
                            <Checkbox
                              id={`select-item-${item.id}`}
                              checked={isSelected}
                              onCheckedChange={() => handleItemToggle(item.id)}
                              className="mt-0.5 dark:border-gray-600 dark:data-[state=checked]:bg-emerald-500 rounded"
                            />
                            <Label
                              htmlFor={`select-item-${item.id}`}
                              className="text-sm font-medium cursor-pointer text-foreground dark:text-gray-200"
                            >
                              Include this item
                            </Label>
                          </div>

                          {isSelected ? (
                            <ItemReceivingRow
                              item={item}
                              index={index}
                              receivedQuantity={receivingData.received_quantity}
                              rejectedQuantity={receivingData.rejected_quantity}
                              conditionNotes={receivingData.condition_notes}
                              rejectionReason={receivingData.rejection_reason}
                              onUpdate={(field, value) => {
                                handleItemReceivingUpdate(item.id, field, value);
                              }}
                            />
                          ) : (
                            <div className="p-4 rounded-xl border border-border/30 dark:border-gray-700 bg-muted/5 dark:bg-muted/10 opacity-50">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm text-muted-foreground">{item.item_name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {item.quantity} {item.unit_of_measure}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">Not selected for receipt</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/30 dark:border-gray-700">
                    <p className="text-xs text-muted-foreground dark:text-gray-400">
                      <span className="font-medium">{selectedItemsCount}</span> items selected for receipt
                    </p>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-muted-foreground">
                        Total Received: <span className="text-emerald-600 dark:text-emerald-400 font-medium">{totalReceived}</span>
                      </span>
                      <span className="text-muted-foreground">
                        Total Rejected: <span className="text-red-600 dark:text-red-400 font-medium">{totalRejected}</span>
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Package className="h-10 w-10 text-muted-foreground/30 dark:text-gray-700 mb-2" />
                  <p className="text-sm text-muted-foreground dark:text-gray-400">No items found</p>
                  <p className="text-xs text-muted-foreground/70 dark:text-gray-500 mt-1">This LPO has no items</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 3: Delivery Details */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-950 rounded-xl relative">
            <WrappedCornerTag
              label="STEP 3"
              color="purple"
              position="top-left"
              size="sm"
              animated={true}
            />
            <CardHeader className="bg-gradient-to-r from-purple-500/10 via-purple-500/5 to-transparent dark:from-purple-500/20 dark:via-purple-500/10 rounded-t-xl">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 dark:bg-purple-500/30 flex items-center justify-center">
                  <Truck className="h-4 w-4 text-purple-500" />
                </div>
                <div>
                  <CardTitle className="text-foreground dark:text-gray-100">Delivery Details</CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    Enter the delivery information for the goods being received.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="received_date" className="text-sm font-semibold text-foreground dark:text-gray-200">
                    Received Date <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="received_date"
                      type="date"
                      value={formData.received_date || ''}
                      onChange={(e) => setFormData({ ...formData, received_date: e.target.value })}
                      className="pl-10 h-11 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200 rounded-xl"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="received_time" className="text-sm font-semibold text-foreground dark:text-gray-200">
                    Received Time
                  </Label>
                  <div className="relative">
                    <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="received_time"
                      type="time"
                      value={formData.received_time || ''}
                      onChange={(e) => setFormData({ ...formData, received_time: e.target.value })}
                      className="pl-10 h-11 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reference_number" className="text-sm font-semibold text-foreground dark:text-gray-200">
                    Reference Number
                  </Label>
                  <div className="relative">
                    <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="reference_number"
                      value={formData.reference_number || ''}
                      onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                      placeholder="Auto-generated"
                      className="pl-10 h-11 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200 rounded-xl font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground">Optional reference number</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delivery_note_number" className="text-sm font-semibold text-foreground dark:text-gray-200">
                    Delivery Note Number
                  </Label>
                  <div className="relative">
                    <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="delivery_note_number"
                      value={formData.delivery_note_number || ''}
                      onChange={(e) => setFormData({ ...formData, delivery_note_number: e.target.value })}
                      placeholder="Auto-generated"
                      className="pl-10 h-11 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200 rounded-xl font-mono"
                      readOnly
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          delivery_note_number: generateDeliveryNoteNumber(),
                        }));
                      }}
                    >
                      <RotateCw className="h-3.5 w-3.5 mr-1" />
                      Regenerate
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Auto-generated delivery note number</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="carrier" className="text-sm font-semibold text-foreground dark:text-gray-200">
                    Carrier / Transporter
                  </Label>
                  <div className="relative">
                    <Truck className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="carrier"
                      value={formData.carrier || ''}
                      onChange={(e) => setFormData({ ...formData, carrier: e.target.value })}
                      placeholder="Enter carrier name"
                      className="pl-10 h-11 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200 rounded-xl"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="waybill_number" className="text-sm font-semibold text-foreground dark:text-gray-200">
                    Waybill / Tracking Number
                  </Label>
                  <div className="relative">
                    <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="waybill_number"
                      value={formData.waybill_number || ''}
                      onChange={(e) => setFormData({ ...formData, waybill_number: e.target.value })}
                      placeholder="Auto-generated"
                      className="pl-10 h-11 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200 rounded-xl font-mono"
                      readOnly
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          waybill_number: generateWaybillNumber(),
                        }));
                      }}
                    >
                      <RotateCw className="h-3.5 w-3.5 mr-1" />
                      Regenerate
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Auto-generated waybill/tracking number</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vehicle_number" className="text-sm font-semibold text-foreground dark:text-gray-200">
                    Vehicle Number
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="vehicle_number"
                      value={formData.vehicle_number || ''}
                      onChange={(e) => setFormData({ ...formData, vehicle_number: e.target.value })}
                      placeholder="Enter vehicle registration"
                      className="pl-10 h-11 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200 rounded-xl"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delivery_condition" className="text-sm font-semibold text-foreground dark:text-gray-200">
                    Delivery Condition
                  </Label>
                  <Select
                    value={formData.delivery_condition || ''}
                    onValueChange={(value: string) => setFormData({ ...formData, delivery_condition: value })}
                  >
                    <SelectTrigger className="h-11 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200 rounded-xl">
                      <SelectValue placeholder="Select delivery condition" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="damaged">Damaged</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                      <SelectItem value="missing_items">Missing Items</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="additional_notes" className="text-sm font-semibold text-foreground dark:text-gray-200">
                  Additional Notes
                </Label>
                <Textarea
                  id="additional_notes"
                  value={formData.additional_notes || ''}
                  onChange={(e) => setFormData({ ...formData, additional_notes: e.target.value })}
                  placeholder="Enter any additional notes about the delivery..."
                  rows={3}
                  className="resize-none dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200 dark:placeholder:text-gray-500 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground dark:text-gray-200">
                  Approval Level
                </Label>
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="approval_hod"
                      checked={formData.approval_level === 'hod'}
                      onCheckedChange={() => setFormData({ ...formData, approval_level: 'hod' })}
                      className="dark:border-gray-600 dark:data-[state=checked]:bg-primary rounded"
                    />
                    <Label htmlFor="approval_hod" className="text-sm cursor-pointer text-foreground dark:text-gray-200">
                      HOD Approval
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="approval_principal"
                      checked={formData.approval_level === 'principal'}
                      onCheckedChange={() => setFormData({ ...formData, approval_level: 'principal' })}
                      className="dark:border-gray-600 dark:data-[state=checked]:bg-primary rounded"
                    />
                    <Label htmlFor="approval_principal" className="text-sm cursor-pointer text-foreground dark:text-gray-200">
                      Principal Approval
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary & Actions */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-950 rounded-xl">
            <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/10 rounded-t-xl">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/20 dark:bg-primary/30 flex items-center justify-center">
                  <FileCheck className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-foreground dark:text-gray-100">Summary</CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    Review your selections before creating the Goods Received Note.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-muted/5 dark:bg-muted/10 p-3 rounded-xl border border-border/30 dark:border-gray-700">
                  <span className="text-xs text-muted-foreground dark:text-gray-400">LPO Number</span>
                  <p className="font-medium text-foreground dark:text-gray-200 truncate">
                    {selectedPO?.po_number || '—'}
                  </p>
                </div>
                <div className="bg-muted/5 dark:bg-muted/10 p-3 rounded-xl border border-border/30 dark:border-gray-700">
                  <span className="text-xs text-muted-foreground dark:text-gray-400">Items Selected</span>
                  <p className="font-medium text-foreground dark:text-gray-200">
                    {selectedItemsCount} of {totalItemsCount}
                  </p>
                </div>
                <div className="bg-muted/5 dark:bg-muted/10 p-3 rounded-xl border border-border/30 dark:border-gray-700">
                  <span className="text-xs text-muted-foreground dark:text-gray-400">Total Received</span>
                  <p className="font-medium text-emerald-600 dark:text-emerald-400">
                    {totalReceived}
                  </p>
                </div>
                <div className="bg-muted/5 dark:bg-muted/10 p-3 rounded-xl border border-border/30 dark:border-gray-700">
                  <span className="text-xs text-muted-foreground dark:text-gray-400">Total Rejected</span>
                  <p className="font-medium text-red-600 dark:text-red-400">
                    {totalRejected}
                  </p>
                </div>
              </div>

              {/* Calculated Totals */}
              {selectedPO && selectedItemsCount > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-2 bg-muted/5 dark:bg-muted/10 p-3 rounded-xl border border-border/30 dark:border-gray-700">
                  <div>
                    <span className="text-xs text-muted-foreground dark:text-gray-400">Total Qty</span>
                    <p className="font-medium text-foreground dark:text-gray-200 text-sm">{calculatedTotals.totalQuantity}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground dark:text-gray-400">Total Value</span>
                    <p className="font-medium text-emerald-600 dark:text-emerald-400 text-sm">{formatCurrency(calculatedTotals.totalValue)}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground dark:text-gray-400">Tax</span>
                    <p className="font-medium text-foreground dark:text-gray-200 text-sm">{formatCurrency(calculatedTotals.totalTax)}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground dark:text-gray-400">Discount</span>
                    <p className="font-medium text-foreground dark:text-gray-200 text-sm">{formatCurrency(calculatedTotals.totalDiscount)}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground dark:text-gray-400">Net Total</span>
                    <p className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">{formatCurrency(calculatedTotals.netTotal)}</p>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-end gap-2 border-t border-border/50 dark:border-gray-700 pt-4 bg-muted/5 dark:bg-muted/10 rounded-b-xl">
              <Button variant="outline" onClick={handleCancel} className="w-full sm:w-auto dark:border-gray-700 dark:hover:bg-gray-800 rounded-xl">
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || formData.purchase_order_id === 0 || selectedItemsCount === 0}
                className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-600/20 dark:shadow-emerald-600/10 rounded-xl"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Create GRN
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Sidebar - PO Details */}
        <div className="lg:col-span-1">
          <PODetailsCard
            purchaseOrder={selectedPO}
            isLoading={isLoadingPOs}
            supplierMap={supplierMap}
          />
        </div>
      </div>
    </PageTemplate>
  );
}

// ============================================
// PO DETAILS CARD
// ============================================

interface PODetailsCardProps {
  purchaseOrder: PurchaseOrder | null;
  isLoading: boolean;
  supplierMap?: Map<number, any>;
}

function PODetailsCard({ purchaseOrder, isLoading, supplierMap }: PODetailsCardProps) {
  const supplier = purchaseOrder?.supplier_id && supplierMap?.get(purchaseOrder.supplier_id) || purchaseOrder?.supplier;
  const supplierName = getSupplierName(supplier);

  if (isLoading) {
    return (
      <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-950 rounded-xl">
        <CardHeader>
          <CardTitle className="text-sm font-medium">LPO Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-3/4 rounded" />
          <Skeleton className="h-4 w-1/2 rounded" />
          <Skeleton className="h-4 w-2/3 rounded" />
          <Skeleton className="h-20 w-full rounded" />
          <Skeleton className="h-4 w-1/2 rounded" />
          <Skeleton className="h-4 w-1/3 rounded" />
        </CardContent>
      </Card>
    );
  }

  if (!purchaseOrder) {
    return (
      <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-950 rounded-xl">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">LPO Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted/30 dark:bg-muted/20 flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">No LPO Selected</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Select an LPO from the dropdown above</p>
            <p className="text-xs text-muted-foreground/50 mt-4">All details will appear here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-950 rounded-xl sticky top-4 shadow-lg shadow-primary/5 dark:shadow-primary/10">
      <CardHeader className="pb-3 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/10 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 dark:bg-primary/30 flex items-center justify-center">
              <FileCheck className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-sm font-medium">LPO Details</CardTitle>
          </div>
          <POStatusBadge status={purchaseOrder.status} />
        </div>
        <CardDescription className="text-xs flex items-center gap-2 mt-1">
          <span className="font-mono font-semibold text-foreground dark:text-gray-200">{purchaseOrder.po_number}</span>
          <span className="text-muted-foreground/50">•</span>
          <span>{formatDate(purchaseOrder.issue_date)}</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        {/* Supplier Info */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground bg-primary/5 dark:bg-primary/10 p-2.5 rounded-xl border border-primary/10 dark:border-primary/20 col-span-2">
            <Building2 className="h-3.5 w-3.5 text-primary" />
            <span className="text-foreground dark:text-gray-200 truncate font-medium">{supplierName}</span>
          </div>
          {supplier?.email && (
            <div className="flex items-center gap-2 text-muted-foreground bg-blue-500/5 dark:bg-blue-500/10 p-2.5 rounded-xl border border-blue-500/10 dark:border-blue-500/20 col-span-2">
              <Mail className="h-3.5 w-3.5 text-blue-500" />
              <span className="text-xs truncate text-foreground dark:text-gray-200 font-medium">{supplier.email}</span>
            </div>
          )}
          {supplier?.phone && (
            <div className="flex items-center gap-2 text-muted-foreground bg-emerald-500/5 dark:bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/10 dark:border-emerald-500/20 col-span-2">
              <Phone className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-xs truncate text-foreground dark:text-gray-200 font-medium">{supplier.phone}</span>
            </div>
          )}
        </div>

        <Separator className="dark:bg-gray-700" />

        {/* PO Info */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-muted/5 dark:bg-muted/10 p-2.5 rounded-xl border border-border/30 dark:border-gray-700">
            <span className="text-xs text-muted-foreground dark:text-gray-400">Type</span>
            <span className="font-medium text-foreground dark:text-gray-200 block mt-0.5">
              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-none rounded-full text-xs">
                LPO (Goods)
              </Badge>
            </span>
          </div>
          <div className="bg-muted/5 dark:bg-muted/10 p-2.5 rounded-xl border border-border/30 dark:border-gray-700">
            <span className="text-xs text-muted-foreground dark:text-gray-400">Total Amount</span>
            <p className="font-bold text-base text-emerald-600 dark:text-emerald-400">{formatCurrency(purchaseOrder.total_amount)}</p>
          </div>
          <div className="bg-muted/5 dark:bg-muted/10 p-2.5 rounded-xl border border-border/30 dark:border-gray-700">
            <span className="text-xs text-muted-foreground dark:text-gray-400">Expected Delivery</span>
            <p className="font-medium text-foreground dark:text-gray-200">{formatDate(purchaseOrder.expected_delivery_date)}</p>
          </div>
          <div className="bg-muted/5 dark:bg-muted/10 p-2.5 rounded-xl border border-border/30 dark:border-gray-700">
            <span className="text-xs text-muted-foreground dark:text-gray-400">Items</span>
            <p className="font-medium text-foreground dark:text-gray-200">{purchaseOrder.items?.length || 0} items</p>
          </div>
        </div>

        <Separator className="dark:bg-gray-700" />

        {/* Items Summary */}
        {purchaseOrder.items && purchaseOrder.items.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-muted-foreground dark:text-gray-400 flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5 text-primary" />
                Items ({purchaseOrder.items.length})
              </p>
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {purchaseOrder.items.map((item: any, index: number) => (
                <div key={index} className="bg-muted/5 dark:bg-muted/10 p-2 rounded-xl border border-border/30 dark:border-gray-700 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground dark:text-gray-200 truncate max-w-[120px]">{item.item_name}</span>
                    <Badge variant="outline" className="text-[10px] bg-primary/5 dark:bg-primary/10 border-primary/20 dark:border-primary/30 rounded-full">
                      {item.quantity} {item.unit_of_measure}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mt-0.5 text-muted-foreground dark:text-gray-400">
                    <span>Unit: {formatCurrency(item.unit_price)}</span>
                    <span>Total: {formatCurrency(item.total_price)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
