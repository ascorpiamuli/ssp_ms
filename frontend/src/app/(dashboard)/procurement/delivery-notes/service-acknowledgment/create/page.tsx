// frontend/src/app/(dashboard)/procurement/delivery-notes/service-acknowledgment/create/page.tsx

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
  ChevronDown,
  ChevronUp,
  Search,
  X,
  FileCheck,
  Sparkles,
  BadgeCheck,
  FileText,
  Package,
  DollarSign,
  Calendar,
  Send,
  Award,
  CreditCard,
  Hash,
  MapPin,
  Phone,
  Building,
  UserCog,
  Check,
  ChevronRight,
  Truck,
  ClipboardList,
  AlertTriangle,
  ThumbsUp,
  Star,
  Zap,
  Timer,
  Target,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Briefcase,
  Crown,
  Shield,
  RotateCw,
  Plus,
  Trash2,
  Minus,
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
import { motion } from 'framer-motion';

// Hooks
import { usePurchaseOrders } from '@/hooks/usePurchaseOrder';
import { useCreateSan, useSans } from '@/hooks/useGoodsReceived';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useAuth } from '@/hooks/useAuth';

// Types
import type { PurchaseOrder } from '@/types/purchaseOrder.types';
import type { CreateServiceAcknowledgmentData, CreateServiceAcknowledgmentItemData } from '@/types/goodsReceived.types';

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

const getSupplierName = (supplier: any): string => {
  if (!supplier) return 'Unknown Supplier';
  if (typeof supplier === 'string') return supplier;
  if (supplier.company_name) return supplier.company_name;
  if (supplier.full_name) return supplier.full_name;
  if (supplier.name) return supplier.name;
  return 'Unknown Supplier';
};

const generateSanNumber = (): string => {
  const now = new Date();
  const dateStr = format(now, 'yyyyMMdd');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `SAN-${dateStr}-${random}`;
};

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
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatCurrency(selectedOption.total_amount)}
                </span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  Service Order
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
                placeholder="Search LSOs..."
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
                <p className="text-sm text-muted-foreground">No LSOs found</p>
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
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground flex-wrap">
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
              <span>{filteredOptions.length} LSO{filteredOptions.length !== 1 ? 's' : ''} available</span>
              <span className="flex items-center gap-1">
                <BadgeCheck className="h-3 w-3 text-emerald-500" />
                Acknowledged
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// SERVICE ITEM DISPLAY - WITH PO ITEM ID
// ============================================

interface ServiceItem {
  purchase_order_item_id: number;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes: string;
  item_name: string;
}

interface ServiceItemDisplayProps {
  item: ServiceItem;
  index: number;
  onQuantityChange?: (index: number, quantity: number) => void;
  readOnly?: boolean;
}

function ServiceItemDisplay({ item, index, onQuantityChange, readOnly = false }: ServiceItemDisplayProps) {
  const [quantity, setQuantity] = useState(item.quantity || 1);
  const total = quantity * (item.unit_price || 0);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    setQuantity(newQuantity);
    if (onQuantityChange) {
      onQuantityChange(index, newQuantity);
    }
  };

  return (
    <div className="p-4 rounded-xl border border-border/50 dark:border-gray-700 bg-muted/5 dark:bg-muted/10 hover:shadow-md transition-all">
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
        <div className="sm:col-span-4">
          <Label className="text-xs text-muted-foreground">Service Description</Label>
          <div className="h-9 px-3 py-2 rounded-lg bg-muted/20 dark:bg-muted/20 border border-border/30 dark:border-gray-700 flex items-center">
            <span className="text-sm font-medium text-foreground">{item.description || item.item_name || '—'}</span>
          </div>
        </div>

        <div className="sm:col-span-1">
          <Label className="text-xs text-muted-foreground">PO Item ID</Label>
          <div className="h-9 px-3 py-2 rounded-lg bg-muted/20 dark:bg-muted/20 border border-border/30 dark:border-gray-700 flex items-center">
            <span className="text-sm font-mono text-muted-foreground">#{item.purchase_order_item_id}</span>
          </div>
        </div>

        <div className="sm:col-span-2">
          <Label className="text-xs text-muted-foreground">Quantity</Label>
          {readOnly ? (
            <div className="h-9 px-3 py-2 rounded-lg bg-muted/20 dark:bg-muted/20 border border-border/30 dark:border-gray-700 flex items-center">
              <span className="text-sm font-medium">{item.quantity}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 w-9 p-0 rounded-lg"
                onClick={() => handleQuantityChange(quantity - 1)}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => handleQuantityChange(parseFloat(e.target.value) || 1)}
                className="h-9 text-sm text-center dark:bg-gray-900 dark:border-gray-700 rounded-lg"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 w-9 p-0 rounded-lg"
                onClick={() => handleQuantityChange(quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="sm:col-span-2">
          <Label className="text-xs text-muted-foreground">Unit Price</Label>
          <div className="h-9 px-3 py-2 rounded-lg bg-muted/20 dark:bg-muted/20 border border-border/30 dark:border-gray-700 flex items-center">
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              {formatCurrency(item.unit_price)}
            </span>
          </div>
        </div>

        <div className="sm:col-span-2">
          <Label className="text-xs text-muted-foreground">Total</Label>
          <div className="h-9 px-3 py-2 rounded-lg bg-muted/20 dark:bg-muted/20 border border-border/30 dark:border-gray-700 flex items-center">
            <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(total)}
            </span>
          </div>
        </div>

        <div className="sm:col-span-1">
          <Label className="text-xs text-muted-foreground">Status</Label>
          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 rounded-full">
            <Check className="h-3 w-3 mr-1" />
            Included
          </Badge>
        </div>
      </div>

      {item.notes && (
        <div className="mt-2 sm:col-span-12">
          <Label className="text-xs text-muted-foreground">Notes</Label>
          <div className="h-9 px-3 py-2 rounded-lg bg-muted/20 dark:bg-muted/20 border border-border/30 dark:border-gray-700 flex items-center">
            <span className="text-xs text-muted-foreground">{item.notes}</span>
          </div>
        </div>
      )}
    </div>
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
  const supplier = useMemo(() => {
    if (!purchaseOrder) return null;
    if (purchaseOrder.supplier_id && supplierMap?.has(purchaseOrder.supplier_id)) {
      return supplierMap.get(purchaseOrder.supplier_id);
    }
    if (purchaseOrder.supplier) {
      return purchaseOrder.supplier;
    }
    return null;
  }, [purchaseOrder, supplierMap]);

  const supplierName = getSupplierName(supplier);

  if (isLoading) {
    return (
      <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-950 rounded-xl">
        <CardHeader>
          <CardTitle className="text-sm font-medium">LSO Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-3/4 rounded" />
          <Skeleton className="h-4 w-1/2 rounded" />
          <Skeleton className="h-4 w-2/3 rounded" />
          <Skeleton className="h-20 w-full rounded" />
        </CardContent>
      </Card>
    );
  }

  if (!purchaseOrder) {
    return (
      <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-950 rounded-xl">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">LSO Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted/30 dark:bg-muted/20 flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">No LSO Selected</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Select an LSO from the dropdown above</p>
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
            <CardTitle className="text-sm font-medium">LSO Details</CardTitle>
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
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground bg-primary/5 dark:bg-primary/10 p-2.5 rounded-xl border border-primary/10 dark:border-primary/20 col-span-2">
            <Building2 className="h-3.5 w-3.5 text-primary" />
            <span className="text-foreground dark:text-gray-200 truncate font-medium">
              {supplierName}
            </span>
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

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-muted/5 dark:bg-muted/10 p-2.5 rounded-xl border border-border/30 dark:border-gray-700">
            <span className="text-xs text-muted-foreground dark:text-gray-400">Type</span>
            <span className="font-medium text-foreground dark:text-gray-200 block mt-0.5">
              <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-none rounded-full text-xs">
                LSO (Services)
              </Badge>
            </span>
          </div>
          <div className="bg-muted/5 dark:bg-muted/10 p-2.5 rounded-xl border border-border/30 dark:border-gray-700">
            <span className="text-xs text-muted-foreground dark:text-gray-400">Total Amount</span>
            <p className="font-bold text-base text-blue-600 dark:text-blue-400">{formatCurrency(purchaseOrder.total_amount)}</p>
          </div>
          <div className="bg-muted/5 dark:bg-muted/10 p-2.5 rounded-xl border border-border/30 dark:border-gray-700">
            <span className="text-xs text-muted-foreground dark:text-gray-400">Service Period</span>
            <p className="font-medium text-foreground dark:text-gray-200 text-xs">
              {formatDate(purchaseOrder.expected_delivery_date)}
            </p>
          </div>
          <div className="bg-muted/5 dark:bg-muted/10 p-2.5 rounded-xl border border-border/30 dark:border-gray-700">
            <span className="text-xs text-muted-foreground dark:text-gray-400">Requisition</span>
            <p className="font-medium text-foreground dark:text-gray-200">#{purchaseOrder.requisition_id || 'N/A'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// CREATE SAN PAGE - SERVICE APPROACH
// ============================================

interface FormData {
  purchase_order_id: number;
  san_number: string;
  reference_number: string;
  received_date: string;
  acknowledgment_date: string;
  acknowledgment_time: string;
  service_description: string;
  service_provider: string;
  service_start_date: string;
  service_end_date: string;
  service_deliverables: string;
  quality_rating: number;
  quality_notes: string;
  performance_notes: string;
  approval_level: string;
  items: ServiceItem[];
  additional_notes: string;
}

export default function CreateServiceAcknowledgmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { success, error } = useToast();
  const { user } = useAuth();

  const purchaseOrderIdParam = searchParams.get('purchase_order_id');

  // Hooks - ONLY load LSOs (services), not LPOs (goods)
  const {
    data: purchaseOrdersData,
    isLoading: isLoadingPOs,
    refetch: refetchPOs,
  } = usePurchaseOrders({
    status: 'acknowledged' as any,
    type: 'lso' as any,
  });

  // ✅ Fetch existing SANs to filter out LSOs that already have SANs
  const { data: sansData, isLoading: isLoadingSans } = useSans({
    status: 'draft' as any,
  });

  const { useAllSuppliers } = useSuppliers();
  const { data: suppliers, isLoading: isLoadingSuppliers } = useAllSuppliers();

  const createSan = useCreateSan();

  // Extract the actual array from PaginatedResponse
  const purchaseOrders = useMemo(() => {
    if (!purchaseOrdersData) return [];
    if (Array.isArray(purchaseOrdersData)) return purchaseOrdersData;
    if ('data' in purchaseOrdersData && Array.isArray(purchaseOrdersData.data)) {
      return purchaseOrdersData.data;
    }
    return [];
  }, [purchaseOrdersData]);

  // ✅ Get existing SAN purchase_order_ids to filter out
  const existingSanPoIds = useMemo(() => {
    if (!sansData) return new Set<number>();
    const sans = Array.isArray(sansData) ? sansData : (sansData.data || []);
    return new Set(sans.map((san: any) => san.purchase_order_id).filter(Boolean));
  }, [sansData]);

  // ✅ Filter out LSOs that already have SANs
  const availablePurchaseOrders = useMemo(() => {
    return purchaseOrders.filter((po: PurchaseOrder) => !existingSanPoIds.has(po.id));
  }, [purchaseOrders, existingSanPoIds]);

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
    const today = format(new Date(), 'yyyy-MM-dd');
    setFormData((prev: FormData) => ({
      ...prev,
      san_number: generateSanNumber(),
      reference_number: generateReferenceNumber(),
      received_date: today,
      acknowledgment_date: today,
    }));
  }, []);

  // STATE - Service-specific fields
  const [formData, setFormData] = useState<FormData>({
    purchase_order_id: purchaseOrderIdParam ? parseInt(purchaseOrderIdParam) : 0,
    san_number: generateSanNumber(),
    reference_number: generateReferenceNumber(),
    received_date: format(new Date(), 'yyyy-MM-dd'),
    acknowledgment_date: format(new Date(), 'yyyy-MM-dd'),
    acknowledgment_time: format(new Date(), 'HH:mm'),
    service_description: '',
    service_provider: '',
    service_start_date: format(new Date(), 'yyyy-MM-dd'),
    service_end_date: format(new Date(new Date().setDate(new Date().getDate() + 7)), 'yyyy-MM-dd'),
    service_deliverables: '',
    quality_rating: 5,
    quality_notes: '',
    performance_notes: '',
    approval_level: 'hod',
    items: [],
    additional_notes: '',
  });

  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    refetchPOs();
  }, []);

  // Auto-select PO if passed via query param
  useEffect(() => {
    if (purchaseOrderIdParam && availablePurchaseOrders.length > 0) {
      const po = availablePurchaseOrders.find((p: any) => p.id === parseInt(purchaseOrderIdParam));
      if (po) {
        handlePOSelect(po);
      }
    }
  }, [availablePurchaseOrders, purchaseOrderIdParam]);

  const handlePOSelect = (purchaseOrder: PurchaseOrder) => {
    setSelectedPO(purchaseOrder);

    const supplierName = getSupplierName(purchaseOrder.supplier || purchaseOrder.supplier_id);
    const today = format(new Date(), 'yyyy-MM-dd');

    setFormData((prev: FormData) => ({
      ...prev,
      purchase_order_id: purchaseOrder.id,
      service_provider: supplierName,
      service_start_date: today,
      service_end_date: purchaseOrder.expected_delivery_date
        ? format(new Date(purchaseOrder.expected_delivery_date), 'yyyy-MM-dd')
        : format(new Date(new Date().setDate(new Date().getDate() + 7)), 'yyyy-MM-dd'),
      received_date: today,
      acknowledgment_date: today,
    }));

    // Initialize service items from PO items with purchase_order_item_id
    if (purchaseOrder.items && purchaseOrder.items.length > 0) {
      const serviceItems: ServiceItem[] = purchaseOrder.items.map((item: any) => ({
        purchase_order_item_id: item.id,
        item_name: item.item_name || '',
        description: item.item_name || item.description || '',
        quantity: 1,
        unit_price: parseFloat(item.unit_price) || 0,
        total_price: parseFloat(item.total_price) || 0,
        notes: item.specifications || '',
      }));
      setFormData((prev: FormData) => ({
        ...prev,
        items: serviceItems,
      }));
    } else {
      setFormData((prev: FormData) => ({
        ...prev,
        items: [],
      }));
    }
  };

  const handlePOSelectById = (poId: number) => {
    const po = availablePurchaseOrders.find((p: any) => p.id === poId);
    if (po) {
      handlePOSelect(po);
    } else {
      setSelectedPO(null);
      setFormData((prev: FormData) => ({
        ...prev,
        purchase_order_id: 0,
        items: [],
      }));
    }
  };

  const handleServiceItemQuantityChange = (index: number, quantity: number) => {
    setFormData((prev: FormData) => {
      const updatedItems = [...prev.items];
      const currentItem = updatedItems[index];
      updatedItems[index] = {
        ...currentItem,
        quantity: quantity,
        total_price: quantity * currentItem.unit_price
      };
      return { ...prev, items: updatedItems };
    });
  };

  // Calculate totals
  const calculatedTotals = useMemo(() => {
    const totalValue = formData.items.reduce((sum: number, item: ServiceItem) => {
      return sum + (parseFloat(item.total_price as any) || 0);
    }, 0);

    return {
      totalValue,
      taxAmount: 0,
      discountAmount: 0,
      netTotal: totalValue,
    };
  }, [formData.items]);

  const handleSubmit = async () => {
    // Validation
    if (formData.purchase_order_id === 0) {
      error('Please select a purchase order');
      return;
    }

    if (!formData.service_description) {
      error('Please provide a service description');
      return;
    }

    if (!formData.received_date) {
      error('Please enter the received date');
      return;
    }

    if (!formData.approval_level) {
      error('Please select an approval level');
      return;
    }

    if (formData.items.length === 0) {
      error('No service items to acknowledge');
      return;
    }

    setIsSubmitting(true);

    try {
      // ✅ FIXED: Build payload with correct types - include quantity field
      const itemsPayload: CreateServiceAcknowledgmentItemData[] = formData.items.map((item: ServiceItem) => ({
        purchase_order_item_id: item.purchase_order_item_id,
        quantity: item.quantity,
        received_quantity: item.quantity, // For SAN, received_quantity equals quantity
        unit_price: item.unit_price,
        total_price: item.total_price || (item.quantity * item.unit_price),
        notes: item.notes || '',
        description: item.description || item.item_name,
      }));

      const payload: CreateServiceAcknowledgmentData = {
        purchase_order_id: formData.purchase_order_id,
        san_number: formData.san_number,
        reference_number: formData.reference_number,
        received_date: formData.received_date,
        acknowledgment_date: formData.acknowledgment_date,
        acknowledgment_time: formData.acknowledgment_time,
        service_description: formData.service_description,
        service_provider: formData.service_provider, // ✅ Pass service provider
        service_deliverables: formData.service_deliverables,
        service_start_date: formData.service_start_date,
        service_end_date: formData.service_end_date,
        service_quality_rating: formData.quality_rating,
        service_quality_notes: formData.quality_notes,
        service_performance_notes: formData.performance_notes,
        notes: formData.additional_notes || '',
        supplier_id: selectedPO?.supplier_id || 0,
        requisition_id: selectedPO?.requisition_id || 0,
        status: 'draft',
        approval_level: formData.approval_level,
        items: itemsPayload,
      };

      console.log('Submitting payload:', payload);

      await createSan.mutateAsync(payload);
      success('Service Acknowledgment Note created successfully!');
      router.push('/procurement/delivery-notes/service-acknowledgment');
    } catch (err: any) {
      console.error('Error creating SAN:', err);
      // Error handled by hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/procurement/delivery-notes/service-acknowledgment');
  };

  const isLoading = isLoadingPOs || isLoadingSuppliers || isLoadingSans;
  const poList = availablePurchaseOrders;

  return (
    <PageTemplate
      title="Create Service Acknowledgment Note"
      description="Acknowledge completion of services against an approved LSO. Only LSOs (services) that don't have an existing SAN are shown."
      icon={<Briefcase className="h-5 w-5" />}
      background="gradient"
      variant="default"
      breadcrumbs={[
        { label: 'Procurement', href: '/procurement' },
        { label: 'Delivery Notes', href: '/procurement/delivery-notes' },
        { label: 'Service Acknowledgment', href: '/procurement/delivery-notes/service-acknowledgment' },
        { label: 'Create' },
      ]}
      actions={
        <div className="flex items-center gap-2">
          <Badge className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800 rounded-full whitespace-nowrap">
            <CheckCircle className="h-3 w-3 mr-1" />
            {poList.length} LSOs Available
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
                <AlertTitle className="text-blue-700 dark:text-blue-300 font-semibold">Service Acknowledgment Process</AlertTitle>
                <AlertDescription className="text-blue-600 dark:text-blue-400 text-sm mt-0.5">
                  <ol className="list-decimal list-inside space-y-0.5">
                    <li>Select the <strong>acknowledged LSO</strong> for the service</li>
                    <li>Review the <strong>service items</strong> from the LSO</li>
                    <li>Confirm the <strong>received quantities</strong> for each item</li>
                    <li>Rate the <strong>quality of service</strong> (1-5)</li>
                    <li>Review and click <strong>"Create SAN"</strong> to complete</li>
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
                  <CardTitle className="text-foreground dark:text-gray-100">Select LSO (Services)</CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    Choose an acknowledged LSO to record service acknowledgment against.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground dark:text-gray-200 flex items-center gap-1">
                  LSO <span className="text-red-500">*</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-muted-foreground dark:text-gray-500 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="rounded-xl">
                        <p className="max-w-xs">Select an acknowledged LSO (services) that has been completed.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <POCustomDropdown
                  options={poList}
                  value={formData.purchase_order_id}
                  onChange={handlePOSelectById}
                  placeholder="Search and select an LSO..."
                  isLoading={isLoading}
                  disabled={poList.length === 0}
                />
                {poList.length === 0 && !isLoading && (
                  <Alert variant="destructive" className="mt-3 dark:bg-red-950/50 dark:border-red-800 rounded-xl">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>No Available LSOs</AlertTitle>
                    <AlertDescription>
                      No acknowledged LSOs (services) available for service acknowledgment. All LSOs may already have SANs or orders must be acknowledged first.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {selectedPO && (
                <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground bg-muted/10 dark:bg-muted/5 p-3 rounded-xl border border-border/30 dark:border-gray-700">
                  <div>
                    <span className="font-medium">Requisition ID:</span>
                    <span className="ml-1">{selectedPO.requisition_id || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="font-medium">Acknowledged By:</span>
                    <span className="ml-1">{user?.full_name || user?.first_name || 'Current User'}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 2: Service Details */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-950 rounded-xl relative">
            <WrappedCornerTag
              label="STEP 2"
              color="emerald"
              position="top-left"
              size="sm"
              animated={true}
            />
            <CardHeader className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent dark:from-emerald-500/20 dark:via-emerald-500/10 rounded-t-xl">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 dark:bg-emerald-500/30 flex items-center justify-center">
                  <ClipboardList className="h-4 w-4 text-emerald-500" />
                </div>
                <div>
                  <CardTitle className="text-foreground dark:text-gray-100">Service Details</CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    Describe the service provided and confirm receipt details.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {/* Service Description */}
              <div className="space-y-2">
                <Label htmlFor="service_description" className="text-sm font-semibold text-foreground dark:text-gray-200">
                  Service Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="service_description"
                  value={formData.service_description || ''}
                  onChange={(e) => setFormData({ ...formData, service_description: e.target.value } as FormData)}
                  placeholder="Describe the service that was provided (e.g., CCTV camera installation at Admin Block)"
                  rows={3}
                  className="resize-none dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200 dark:placeholder:text-gray-500 rounded-xl"
                />
              </div>

              {/* Service Provider - Now required and passed in payload */}
              <div className="space-y-2">
                <Label htmlFor="service_provider" className="text-sm font-semibold text-foreground dark:text-gray-200">
                  Service Provider <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="service_provider"
                    value={formData.service_provider || ''}
                    onChange={(e) => setFormData({ ...formData, service_provider: e.target.value } as FormData)}
                    placeholder="Name of the service provider"
                    className="pl-10 h-11 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200 rounded-xl"
                    readOnly
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">Auto-populated from the selected LSO supplier</p>
              </div>

              {/* Received Date */}
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
                    onChange={(e) => setFormData({ ...formData, received_date: e.target.value } as FormData)}
                    className="pl-10 h-11 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200 rounded-xl"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">Date when the service was completed/received</p>
              </div>

              {/* Service Period */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="service_start_date" className="text-sm font-semibold text-foreground dark:text-gray-200">
                    Service Start Date
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="service_start_date"
                      type="date"
                      value={formData.service_start_date || ''}
                      onChange={(e) => setFormData({ ...formData, service_start_date: e.target.value } as FormData)}
                      className="pl-10 h-11 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200 rounded-xl"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="service_end_date" className="text-sm font-semibold text-foreground dark:text-gray-200">
                    Service End Date
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="service_end_date"
                      type="date"
                      value={formData.service_end_date || ''}
                      onChange={(e) => setFormData({ ...formData, service_end_date: e.target.value } as FormData)}
                      className="pl-10 h-11 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* Service Deliverables */}
              <div className="space-y-2">
                <Label htmlFor="service_deliverables" className="text-sm font-semibold text-foreground dark:text-gray-200">
                  Service Deliverables
                </Label>
                <Textarea
                  id="service_deliverables"
                  value={formData.service_deliverables || ''}
                  onChange={(e) => setFormData({ ...formData, service_deliverables: e.target.value } as FormData)}
                  placeholder="What was delivered/installed? (e.g., 8 CCTV cameras installed, NVR configured, cabling done)"
                  rows={2}
                  className="resize-none dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200 dark:placeholder:text-gray-500 rounded-xl"
                />
              </div>
            </CardContent>
          </Card>

          {/* Step 3: Service Items (From LSO) */}
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
                  <Package className="h-4 w-4 text-purple-500" />
                </div>
                <div>
                  <CardTitle className="text-foreground dark:text-gray-100">Service Items (From LSO)</CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    These items are auto-loaded from the selected LSO. Confirm the received quantities.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {!selectedPO ? (
                <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-border/30 dark:border-gray-700 rounded-xl">
                  <div className="w-16 h-16 rounded-full bg-muted/30 dark:bg-muted/20 flex items-center justify-center mb-4">
                    <Package className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">No LSO Selected</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">Select an LSO above to load service items</p>
                </div>
              ) : formData.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed border-border/30 dark:border-gray-700 rounded-xl">
                  <div className="w-12 h-12 rounded-full bg-muted/30 dark:bg-muted/20 flex items-center justify-center mb-3">
                    <AlertCircle className="h-6 w-6 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">No Service Items Found</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">This LSO doesn't have any line items</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {formData.items.map((item: ServiceItem, index: number) => (
                      <ServiceItemDisplay
                        key={item.purchase_order_item_id || index}
                        item={item}
                        index={index}
                        readOnly={false}
                        onQuantityChange={handleServiceItemQuantityChange}
                      />
                    ))}
                  </div>

                  <div className="flex items-center justify-end pt-3 border-t border-border/30 dark:border-gray-700">
                    <div className="space-y-1 text-right">
                      <p className="text-xs text-muted-foreground">Total Service Value</p>
                      <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(calculatedTotals.totalValue)}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Step 4: Quality & Performance Assessment */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-950 rounded-xl relative">
            <WrappedCornerTag
              label="STEP 4"
              color="orange"
              position="top-left"
              size="sm"
              animated={true}
            />
            <CardHeader className="bg-gradient-to-r from-orange-500/10 via-orange-500/5 to-transparent dark:from-orange-500/20 dark:via-orange-500/10 rounded-t-xl">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-500/20 dark:bg-orange-500/30 flex items-center justify-center">
                  <Star className="h-4 w-4 text-orange-500" />
                </div>
                <div>
                  <CardTitle className="text-foreground dark:text-gray-100">Quality & Performance Assessment</CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    Rate the quality of service and provide feedback.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {/* Quality Rating */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground dark:text-gray-200">
                  Quality Rating
                </Label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Button
                      key={rating}
                      type="button"
                      variant={formData.quality_rating === rating ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFormData({ ...formData, quality_rating: rating } as FormData)}
                      className={cn(
                        "h-10 w-10 rounded-lg transition-all",
                        formData.quality_rating === rating && "bg-orange-500 hover:bg-orange-600 text-white"
                      )}
                    >
                      <Star className={cn(
                        "h-4 w-4",
                        formData.quality_rating === rating ? "fill-current" : "text-muted-foreground"
                      )} />
                    </Button>
                  ))}
                  <span className="ml-2 text-sm font-medium text-foreground">
                    {formData.quality_rating === 5 ? 'Excellent' :
                      formData.quality_rating === 4 ? 'Very Good' :
                        formData.quality_rating === 3 ? 'Good' :
                          formData.quality_rating === 2 ? 'Fair' :
                            formData.quality_rating === 1 ? 'Poor' : 'Not Rated'}
                  </span>
                </div>
              </div>

              {/* Quality Notes */}
              <div className="space-y-2">
                <Label htmlFor="quality_notes" className="text-sm font-semibold text-foreground dark:text-gray-200">
                  Quality Notes
                </Label>
                <Textarea
                  id="quality_notes"
                  value={formData.quality_notes || ''}
                  onChange={(e) => setFormData({ ...formData, quality_notes: e.target.value } as FormData)}
                  placeholder="Describe the quality of work, materials used, etc."
                  rows={2}
                  className="resize-none dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200 dark:placeholder:text-gray-500 rounded-xl"
                />
              </div>

              {/* Performance Notes */}
              <div className="space-y-2">
                <Label htmlFor="performance_notes" className="text-sm font-semibold text-foreground dark:text-gray-200">
                  Performance Notes
                </Label>
                <Textarea
                  id="performance_notes"
                  value={formData.performance_notes || ''}
                  onChange={(e) => setFormData({ ...formData, performance_notes: e.target.value } as FormData)}
                  placeholder="Any issues with timeliness, professionalism, communication, etc."
                  rows={2}
                  className="resize-none dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200 dark:placeholder:text-gray-500 rounded-xl"
                />
              </div>
            </CardContent>
          </Card>

          {/* Step 5: Acknowledgment Details */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-950 rounded-xl relative">
            <WrappedCornerTag
              label="STEP 5"
              color="teal"
              position="top-left"
              size="sm"
              animated={true}
            />
            <CardHeader className="bg-gradient-to-r from-teal-500/10 via-teal-500/5 to-transparent dark:from-teal-500/20 dark:via-teal-500/10 rounded-t-xl">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-500/20 dark:bg-teal-500/30 flex items-center justify-center">
                  <FileCheck className="h-4 w-4 text-teal-500" />
                </div>
                <div>
                  <CardTitle className="text-foreground dark:text-gray-100">Acknowledgment Details</CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    Finalize the service acknowledgment with date and reference numbers.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="acknowledgment_date" className="text-sm font-semibold text-foreground dark:text-gray-200">
                    Acknowledgment Date
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="acknowledgment_date"
                      type="date"
                      value={formData.acknowledgment_date || ''}
                      onChange={(e) => setFormData({ ...formData, acknowledgment_date: e.target.value } as FormData)}
                      className="pl-10 h-11 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200 rounded-xl"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="acknowledgment_time" className="text-sm font-semibold text-foreground dark:text-gray-200">
                    Acknowledgment Time
                  </Label>
                  <div className="relative">
                    <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="acknowledgment_time"
                      type="time"
                      value={formData.acknowledgment_time || ''}
                      onChange={(e) => setFormData({ ...formData, acknowledgment_time: e.target.value } as FormData)}
                      className="pl-10 h-11 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="san_number" className="text-sm font-semibold text-foreground dark:text-gray-200">
                    SAN Number
                  </Label>
                  <div className="relative">
                    <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="san_number"
                      value={formData.san_number || ''}
                      onChange={(e) => setFormData({ ...formData, san_number: e.target.value } as FormData)}
                      className="pl-10 h-11 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200 rounded-xl font-mono"
                      readOnly
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        setFormData((prev: FormData) => ({
                          ...prev,
                          san_number: generateSanNumber(),
                        }));
                      }}
                    >
                      <RotateCw className="h-3.5 w-3.5 mr-1" />
                      Regenerate
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Auto-generated SAN number</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reference_number" className="text-sm font-semibold text-foreground dark:text-gray-200">
                    Reference Number
                  </Label>
                  <div className="relative">
                    <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="reference_number"
                      value={formData.reference_number || ''}
                      onChange={(e) => setFormData({ ...formData, reference_number: e.target.value } as FormData)}
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
                        setFormData((prev: FormData) => ({
                          ...prev,
                          reference_number: generateReferenceNumber(),
                        }));
                      }}
                    >
                      <RotateCw className="h-3.5 w-3.5 mr-1" />
                      Regenerate
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Optional reference number</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground dark:text-gray-200">
                  Approval Level <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      id="approval_hod"
                      name="approval_level"
                      checked={formData.approval_level === 'hod'}
                      onChange={() => setFormData({ ...formData, approval_level: 'hod' } as FormData)}
                      className="h-4 w-4 text-primary border-gray-300 focus:ring-primary dark:border-gray-600 dark:bg-gray-800"
                    />
                    <span className="text-sm text-foreground dark:text-gray-200">HOD Approval</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      id="approval_principal"
                      name="approval_level"
                      checked={formData.approval_level === 'principal'}
                      onChange={() => setFormData({ ...formData, approval_level: 'principal' } as FormData)}
                      className="h-4 w-4 text-primary border-gray-300 focus:ring-primary dark:border-gray-600 dark:bg-gray-800"
                    />
                    <span className="text-sm text-foreground dark:text-gray-200">Principal Approval</span>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="additional_notes" className="text-sm font-semibold text-foreground dark:text-gray-200">
                  Additional Notes
                </Label>
                <Textarea
                  id="additional_notes"
                  value={formData.additional_notes || ''}
                  onChange={(e) => setFormData({ ...formData, additional_notes: e.target.value } as FormData)}
                  placeholder="Any additional notes about the service acknowledgment..."
                  rows={2}
                  className="resize-none dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200 dark:placeholder:text-gray-500 rounded-xl"
                />
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
                    Review before creating the Service Acknowledgment Note.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-muted/5 dark:bg-muted/10 p-3 rounded-xl border border-border/30 dark:border-gray-700">
                  <span className="text-xs text-muted-foreground dark:text-gray-400">LSO Number</span>
                  <p className="font-medium text-foreground dark:text-gray-200 truncate">
                    {selectedPO?.po_number || '—'}
                  </p>
                </div>
                <div className="bg-muted/5 dark:bg-muted/10 p-3 rounded-xl border border-border/30 dark:border-gray-700">
                  <span className="text-xs text-muted-foreground dark:text-gray-400">Service Provider</span>
                  <p className="font-medium text-foreground dark:text-gray-200 truncate">
                    {formData.service_provider || '—'}
                  </p>
                </div>
                <div className="bg-muted/5 dark:bg-muted/10 p-3 rounded-xl border border-border/30 dark:border-gray-700">
                  <span className="text-xs text-muted-foreground dark:text-gray-400">Quality Rating</span>
                  <p className="font-medium text-foreground dark:text-gray-200">
                    {formData.quality_rating ? `${formData.quality_rating} ⭐` : '—'}
                  </p>
                </div>
                <div className="bg-muted/5 dark:bg-muted/10 p-3 rounded-xl border border-border/30 dark:border-gray-700">
                  <span className="text-xs text-muted-foreground dark:text-gray-400">Total Value</span>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(calculatedTotals.totalValue)}
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-end gap-2 border-t border-border/50 dark:border-gray-700 pt-4 bg-muted/5 dark:bg-muted/10 rounded-b-xl">
              <Button variant="outline" onClick={handleCancel} className="w-full sm:w-auto dark:border-gray-700 dark:hover:bg-gray-800 rounded-xl">
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || formData.purchase_order_id === 0 || !formData.service_description || !formData.approval_level || formData.items.length === 0}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-600/20 dark:shadow-blue-600/10 rounded-xl"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Create SAN
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
