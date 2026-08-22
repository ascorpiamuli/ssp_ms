// frontend/src/app/(dashboard)/procurement/purchase-orders/create/page.tsx

'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  ShoppingBag,
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
  BarChart3,
  PieChart,
  Activity,
  Box,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  XCircle,
  RefreshCw,
  Search,
  SlidersHorizontal,
  ChevronDown,
  Table as TableIcon,
  LayoutGrid,
  Download,
  FileArchive,
  HardDrive,
  ChevronRight,
  Grid3x3,
  Maximize2,
  Minimize2,
  Scale,
  History,
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
import { useToast } from '@/components/ui/toast-context';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Hooks
import { useSupplierQuotation } from '@/hooks/useSupplierQuotation';
import { useCreatePurchaseOrder } from '@/hooks/usePurchaseOrder';
import { useSuppliers } from '@/hooks/useSuppliers';

// Types
import type { CreatePurchaseOrderData } from '@/types/purchaseOrder.types';

// UI Components
import HorizontalCornerTag from '@/components/ui/horizontal-corner-tag';
import WrappedCornerTag from '../../../../../components/ui/wrapped-corner-tag';

// ============================================
// CONSTANTS
// ============================================

const CURRENCY = 'KES';
const ITEMS_PER_PAGE = 10;

// Service units - items with these units are services
const SERVICE_UNITS = [
  'hours', 'hrs', 'h',
  'days', 'day', 'd',
  'weeks', 'week', 'wk',
  'months', 'month', 'mo',
  'sessions', 'session',
  'consultancy', 'consulting',
  'training', 'workshop',
  'service', 'services',
  'man-days', 'person-days'
];

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

// Determine if an item is a service based on unit_of_measure
const isServiceItem = (unitOfMeasure: string | null | undefined): boolean => {
  if (!unitOfMeasure) return false;
  return SERVICE_UNITS.includes(unitOfMeasure.toLowerCase().trim());
};

// ============================================
// COMPONENTS
// ============================================

const StatusBadge = ({ status }: { status: string }) => {
  const statusMap: Record<string, { label: string; color: string }> = {
    draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
    pending_approval: { label: 'Pending Approval', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    approved: { label: 'Approved', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    issued: { label: 'Issued', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    acknowledged: { label: 'Acknowledged', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' },
    partially_delivered: { label: 'Partially Delivered', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
    fully_delivered: { label: 'Fully Delivered', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' },
    completed: { label: 'Completed', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  };

  const { label, color } = statusMap[status] || statusMap.draft;

  return (
    <Badge className={cn("px-3 py-1.5 font-medium rounded-full text-sm", color)}>
      {label}
    </Badge>
  );
};


// ============================================
// MAIN PAGE
// ============================================

export default function CreatePurchaseOrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const quotationId = searchParams.get('quotation_id');
  const { success, error } = useToast();

  // State
  const [orderType, setOrderType] = useState<'lpo' | 'lso' | 'both_separate' | 'combined'>('lpo');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
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
  const quotationItems = useMemo(() => {
    if (!supplierQuotation?.items) return [];
    return supplierQuotation.items;
  }, [supplierQuotation]);

  const supplierId = useMemo(() => {
    return supplierQuotation?.supplier_id || null;
  }, [supplierQuotation]);

  const supplier = useMemo(() => {
    if (!supplierId || !Array.isArray(suppliersData)) return null;
    return suppliersData.find((s: any) => s.id === supplierId) || null;
  }, [supplierId, suppliersData]);

  // Analyze items
  const { goodsItems, serviceItems, hasGoods, hasServices, isMixed } = useMemo(() => {
    const goods: any[] = [];
    const services: any[] = [];

    quotationItems.forEach((item: any) => {
      if (isServiceItem(item.unit_of_measure)) {
        services.push(item);
      } else {
        goods.push(item);
      }
    });

    return {
      goodsItems: goods,
      serviceItems: services,
      hasGoods: goods.length > 0,
      hasServices: services.length > 0,
      isMixed: goods.length > 0 && services.length > 0,
    };
  }, [quotationItems]);

  // Select all items by default
  useEffect(() => {
    if (quotationItems.length > 0 && selectedItems.length === 0) {
      setSelectedItems(quotationItems.map((item: any) => item.id));
    }
  }, [quotationItems]);

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

    const selected = quotationItems.filter((item: any) =>
      selectedItems.includes(item.id)
    );

    const total = selected.reduce((sum: number, item: any) => {
      const price = parseFloat(item.total_price) || 0;
      return sum + price;
    }, 0);

    return { totalAmount: total, selectedItemsDetails: selected };
  }, [quotationItems, selectedItems]);

  const hasSelectedItems = selectedItems.length > 0;

  // Paginated items
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return quotationItems.slice(start, end);
  }, [quotationItems, currentPage]);

  const totalPages = Math.ceil(quotationItems.length / ITEMS_PER_PAGE);

  // Handlers
  const handleItemToggle = (itemId: number) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  const handleSelectAll = () => {
    if (quotationItems.length === 0) return;
    if (selectedItems.length === quotationItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(quotationItems.map((item: any) => item.id));
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!hasSelectedItems) {
      errors.push('Please select at least one item');
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

  const handleSubmit = () => {
    if (!supplierQuotation) return;
    if (!validateForm()) return;
    setShowConfirmation(true);
  };

  // ============================================
  // UPDATED: handleConfirmSubmit - Now uses requisition_item_id from API
  // ============================================
  const handleConfirmSubmit = async () => {
    if (!supplierQuotation) return;

    setIsSubmitting(true);

    try {
      // Get requisition_id from the quotation request
      const requisitionId = supplierQuotation.quotation_request?.requisition_id;

      // Validate requisition_id exists
      if (!requisitionId) {
        error('Requisition ID not found. Please contact support.');
        setIsSubmitting(false);
        return;
      }

      // Build items payload using requisition_item_id from the API
      // The API now returns requisition_item_id for each item
      const itemsPayload = selectedItemsDetails.map((item: any) => ({
        // ✅ Use requisition_item_id directly from the API response
        requisition_item_id: item.requisition_item_id,
        item_name: item.item_name,
        description: item.description || undefined,
        unit_of_measure: item.unit_of_measure || 'pcs',
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

      // Validate all items have requisition_item_id
      const invalidItems = itemsPayload.filter(item => !item.requisition_item_id);
      if (invalidItems.length > 0) {
        console.error('Items missing requisition_item_id:', invalidItems);
        error('Some items are missing requisition item IDs. Please contact support.');
        setIsSubmitting(false);
        return;
      }

      const payload: CreatePurchaseOrderData = {
        requisition_id: requisitionId,
        type: orderType === 'lpo' || orderType === 'lso' ? orderType : 'lpo',
        title: `Order from ${supplierQuotation.quotation_number || 'Quotation'}`,
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

      // Debug: Log the payload to verify requisition_item_id
      console.log('Purchase Order Payload:', JSON.stringify(payload, null, 2));

      const result = await createPurchaseOrder.mutateAsync(payload);
      setShowConfirmation(false);

      if (result?.id) {
        router.push(`/procurement/purchase-orders/${result.id}`);
      } else {
        router.push('/procurement/purchase-orders');
      }
    } catch (err: any) {
      console.error('Create PO error:', err);
      console.error('Error response:', err?.response?.data);
      error(err?.response?.data?.message || 'Failed to create purchase order');
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
  const supplierDisplayName = supplier?.company_name || supplier?.full_name || supplierQuotation?.supplier?.full_name || 'Unknown Supplier';
  const supplierEmail = supplier?.company_email || supplier?.email || supplierQuotation?.supplier?.email || 'No email';
  const supplierPhone = supplier?.company_phone || supplier?.phone || supplierQuotation?.supplier?.phone || 'N/A';
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
  if (!supplierQuotation || !quotationId) {
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
  if (supplierQuotation.status !== 'accepted') {
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
              This quotation ({supplierQuotation.quotation_number}) has not been accepted yet.
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
      title="Create Purchase Order"
      description={`Convert quotation ${supplierQuotation.quotation_number} to a purchase order`}
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
          <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 rounded-full px-4 py-1.5">
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            {selectedItems.length} Selected
          </Badge>
          <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 rounded-full px-4 py-1.5">
            <Wallet className="h-3.5 w-3.5 mr-1.5" />
            {formatCurrency(totalAmount)}
          </Badge>
          <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 rounded-full px-4 py-1.5">
            <Package className="h-3.5 w-3.5 mr-1.5" />
            {orderType === 'lpo' ? 'LPO' : orderType === 'lso' ? 'LSO' : orderType === 'both_separate' ? 'LPO + LSO' : 'Combined'}
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
        {/* ============================================ */}
        {/* 1. QUOTATION SUMMARY - Premium Card */}
        {/* ============================================ */}
        <Card className="border-0 shadow-sm rounded-xl overflow-hidden bg-gradient-to-br from-emerald-50/80 to-teal-50/80 dark:from-emerald-950/20 dark:to-teal-950/20">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                    <Award className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h2 className="text-xl font-bold">{supplierQuotation.quotation_number}</h2>
                  <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 rounded-full">
                    <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                    Accepted
                  </Badge>
                  {supplierQuotation.is_lowest && (
                    <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800 rounded-full">
                      <Star className="h-3.5 w-3.5 mr-1.5" />
                      Lowest Price
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="h-4 w-4" />
                    {supplierDisplayName}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    Submitted: {formatDate(supplierQuotation.submission_date)}
                  </span>
                  <span className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                    <Wallet className="h-4 w-4" />
                    Total: {formatCurrency(supplierQuotation.total_amount)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-start lg:items-end gap-2">
                <div className="flex items-center gap-3">
                  {hasGoods && (
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 rounded-full px-3 py-1.5">
                      <Package className="h-3.5 w-3.5 mr-1.5" />
                      {goodsItems.length} Goods
                    </Badge>
                  )}
                  {hasServices && (
                    <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800 rounded-full px-3 py-1.5">
                      <Briefcase className="h-3.5 w-3.5 mr-1.5" />
                      {serviceItems.length} Services
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ============================================ */}
        {/* 2. DOCUMENT TYPE SELECTION - Premium Cards */}
        {/* ============================================ */}
        <Card className="border-0 shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-muted-foreground" />
              Select Document Type
            </CardTitle>
            <CardDescription>
              Choose the type of order to generate. LPO for goods, LSO for services.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* LPO Option - Active */}
              <div
                className={cn(
                  "group flex items-start space-x-3 space-y-0 rounded-xl border-2 p-4 hover:shadow-md transition-all duration-200 cursor-pointer relative",
                  orderType === 'lpo'
                    ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-sm"
                    : "border-gray-200 dark:border-gray-700 hover:border-emerald-200 dark:hover:border-emerald-800"
                )}
                onClick={() => setOrderType('lpo')}
              >
                <input
                  type="radio"
                  checked={orderType === 'lpo'}
                  onChange={() => setOrderType('lpo')}
                  className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                />
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-emerald-500" />
                    <span className="font-medium">LPO</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Local Purchase Order
                  </p>
                  <p className="text-xs text-muted-foreground">For goods items</p>
                  {hasGoods && (
                    <Badge className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full">
                      {goodsItems.length} goods available
                    </Badge>
                  )}
                </div>
              </div>

              {/* LSO Option - Active */}
              <div
                className={cn(
                  "group flex items-start space-x-3 space-y-0 rounded-xl border-2 p-4 hover:shadow-md transition-all duration-200 cursor-pointer relative",
                  orderType === 'lso'
                    ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 shadow-sm"
                    : "border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800"
                )}
                onClick={() => setOrderType('lso')}
              >
                <input
                  type="radio"
                  checked={orderType === 'lso'}
                  onChange={() => setOrderType('lso')}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">LSO</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Local Service Order
                  </p>
                  <p className="text-xs text-muted-foreground">For service items</p>
                  {hasServices && (
                    <Badge className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                      {serviceItems.length} services available
                    </Badge>
                  )}
                </div>
              </div>

              {/* Both Separate Option - Coming Soon */}
              <div
                className={cn(
                  "group flex items-start space-x-3 space-y-0 rounded-xl border-2 p-4 relative opacity-60 cursor-not-allowed",
                  orderType === 'both_separate'
                    ? "border-purple-500 bg-purple-50/50 dark:bg-purple-950/20 shadow-sm"
                    : "border-gray-200 dark:border-gray-700"
                )}
                onClick={() => {
                  // Disabled - Coming Soon
                }}
              >

                <div className="mt-1 h-4 w-4 flex items-center justify-center opacity-50">
                  <div className="h-4 w-4 rounded-full border-2 border-gray-300 dark:border-gray-600" />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-gray-400" />
                    <span className="font-medium text-gray-400">Both (Separate)</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Generate separate documents
                  </p>
                  <p className="text-xs text-muted-foreground">LPO + LSO</p>
                  <Badge className="text-[10px] bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 rounded-full">
                    Coming Soon
                  </Badge>
                </div>
              </div>

              {/* Combined Option - Coming Soon */}
              <div
                className={cn(
                  "group flex items-start space-x-3 space-y-0 rounded-xl border-2 p-4 relative opacity-60 cursor-not-allowed",
                  orderType === 'combined'
                    ? "border-gray-500 bg-gray-50/50 dark:bg-gray-800/20 shadow-sm"
                    : "border-gray-200 dark:border-gray-700"
                )}
                onClick={() => {
                  // Disabled - Coming Soon
                }}
              >
                <div className="mt-1 h-4 w-4 flex items-center justify-center opacity-50">
                  <div className="h-4 w-4 rounded-full border-2 border-gray-300 dark:border-gray-600" />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="font-medium text-gray-400">Combined</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Single document
                  </p>
                  <p className="text-xs text-muted-foreground">All items together</p>
                  <Badge className="text-[10px] bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 rounded-full">
                    Coming Soon
                  </Badge>
                </div>
              </div>
            </div>

            {/* Info about disabled options */}
            <div className="mt-4 flex items-center gap-3 text-amber-600 dark:text-amber-400 text-sm bg-amber-50 dark:bg-amber-950/30 p-4 rounded-xl border border-amber-200 dark:border-amber-800/50">
              <Info className="h-5 w-5 flex-shrink-0" />
              <div>
                <p className="font-medium">Coming Soon Features</p>
                <p className="text-xs mt-0.5">
                  <strong>Both (Separate)</strong> and <strong>Combined</strong> document types are currently in development.
                  Please use <strong>LPO</strong> for goods or <strong>LSO</strong> for services.
                </p>
              </div>
            </div>

            {quotationItems.length === 0 && (
              <div className="mt-4 flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm bg-amber-50 dark:bg-amber-950/30 p-3 rounded-xl border border-amber-200 dark:border-amber-800/50">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                <span>No items found in this quotation. Please verify the quotation has items.</span>
              </div>
            )}

            {isMixed && (
              <div className="mt-4 flex items-center gap-3 text-blue-600 dark:text-blue-400 text-sm bg-blue-50 dark:bg-blue-950/30 p-4 rounded-xl border border-blue-200 dark:border-blue-800/50">
                <Info className="h-5 w-5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Mixed Items Detected</p>
                  <p className="text-xs mt-0.5">
                    This quotation contains both goods and services. Choose how you want to process them:
                  </p>
                  <ul className="text-xs mt-1 space-y-0.5 list-disc list-inside">
                    <li><strong>LPO</strong> - Only goods items</li>
                    <li><strong>LSO</strong> - Only service items</li>
                    <li className="text-amber-600 dark:text-amber-400">
                      <strong>Both (Separate)</strong> - Coming soon
                    </li>
                    <li className="text-amber-600 dark:text-amber-400">
                      <strong>Combined</strong> - Coming soon
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ============================================ */}
        {/* 3. ORDER DETAILS - Premium Cards */}
        {/* ============================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-sm rounded-xl">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
                Order Details
              </CardTitle>
              <CardDescription>
                Order number will be auto-generated by the system upon creation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="delivery-date" className="text-sm font-medium">
                    Expected Delivery Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="delivery-date"
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="rounded-xl border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="validity-date" className="text-sm font-medium">
                    Validity Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="validity-date"
                    type="date"
                    value={validityDate}
                    onChange={(e) => setValidityDate(e.target.value)}
                    className="rounded-xl border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="delivery-terms" className="text-sm font-medium">
                  Delivery Terms
                </Label>
                <Input
                  id="delivery-terms"
                  placeholder="e.g., FOB, CIF, Ex-Works"
                  value={deliveryTerms}
                  onChange={(e) => setDeliveryTerms(e.target.value)}
                  className="rounded-xl border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment-terms" className="text-sm font-medium">
                  Payment Terms
                </Label>
                <Input
                  id="payment-terms"
                  placeholder="e.g., 30 days net, 50% advance"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="rounded-xl border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="warranty-terms" className="text-sm font-medium">
                  Warranty Terms
                </Label>
                <Input
                  id="warranty-terms"
                  placeholder="e.g., 12 months, 2 years"
                  value={warrantyTerms}
                  onChange={(e) => setWarrantyTerms(e.target.value)}
                  className="rounded-xl border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm rounded-xl">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                Supplier Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-lg">
                    {getInitials(supplierDisplayName)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{supplierDisplayName}</p>
                  <p className="text-xs text-muted-foreground truncate">{supplierEmail}</p>
                  {supplierRegistration && (
                    <p className="text-xs text-muted-foreground">Reg: {supplierRegistration}</p>
                  )}
                </div>
                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full flex-shrink-0">
                  Active
                </Badge>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Contact Person</p>
                  <p className="font-medium">{supplierContactPerson}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="font-medium">{supplierPhone}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Address</p>
                  <p className="font-medium">{supplierAddress}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ============================================ */}
        {/* 4. ITEMS SELECTION - Premium Table */}
        {/* ============================================ */}
        <Card className="border-0 shadow-sm rounded-xl">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Package className="h-5 w-5 text-muted-foreground" />
                  Select Items
                </CardTitle>
                <CardDescription>
                  Choose which items to include in this order. <strong>{selectedItems.length}</strong> of <strong>{quotationItems.length}</strong> selected
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 border-l dark:border-gray-700 pl-2">
                  <Button
                    variant={viewMode === 'cards' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('cards')}
                    className="h-10 w-10 p-0 rounded-xl"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                    className="h-10 w-10 p-0 rounded-xl"
                  >
                    <TableIcon className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  className="rounded-xl border-gray-200 dark:border-gray-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:border-emerald-200"
                >
                  {selectedItems.length === quotationItems.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {viewMode === 'cards' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedItems.map((item: any) => {
                  const isSelected = selectedItems.includes(item.id);
                  const isService = isServiceItem(item.unit_of_measure);

                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "border rounded-xl p-4 hover:shadow-md transition-all duration-200 cursor-pointer group",
                        isSelected
                          ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-emerald-200 dark:hover:border-emerald-800"
                      )}
                      onClick={() => handleItemToggle(item.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleItemToggle(item.id)}
                            className="mt-1 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div>
                            <p className="font-medium group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                              {item.item_name}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge
                                className={cn(
                                  "text-[10px] rounded-full",
                                  isService
                                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                )}
                              >
                                {isService ? 'Service' : 'Goods'}
                              </Badge>
                              <Badge variant="outline" className="text-[10px] font-mono">
                                {item.unit_of_measure || 'N/A'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        {isSelected && (
                          <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                        )}
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
                          <span className="sr-only">Select</span>
                        </TableHead>
                        <TableHead className="min-w-[180px]">Item</TableHead>
                        <TableHead className="min-w-[120px] hidden md:table-cell">Description</TableHead>
                        <TableHead className="text-center w-[70px]">Qty</TableHead>
                        <TableHead className="text-center w-[110px]">
                          <div className="flex items-center justify-center gap-1.5">
                            <Ruler className="h-3.5 w-3.5" />
                            Unit
                          </div>
                        </TableHead>
                        <TableHead className="text-right w-[130px]">Unit Price</TableHead>
                        <TableHead className="text-right w-[130px]">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedItems.map((item: any) => {
                        const isSelected = selectedItems.includes(item.id);
                        const isService = isServiceItem(item.unit_of_measure);

                        return (
                          <TableRow
                            key={item.id}
                            className={cn(
                              "hover:bg-muted/50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group",
                              isSelected && "bg-emerald-50/30 dark:bg-emerald-950/10"
                            )}
                            onClick={() => handleItemToggle(item.id)}
                          >
                            <TableCell>
                              <div className="flex items-center justify-center">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleItemToggle(item.id)}
                                  className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                  {item.item_name}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <Badge
                                    className={cn(
                                      "text-[10px] rounded-full",
                                      isService
                                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                    )}
                                  >
                                    {isService ? 'Service' : 'Goods'}
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
                            <TableCell className="text-right font-medium">
                              {isSelected ? (
                                <span className="text-emerald-600 dark:text-emerald-400">
                                  {formatCurrency(parseFloat(item.total_price) || 0)}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">{formatCurrency(parseFloat(item.total_price) || 0)}</span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                    <TableFooter>
                      <TableRow className="bg-muted/50 dark:bg-gray-800/50">
                        <TableCell colSpan={6} className="text-right font-semibold text-base">
                          Total Selected Amount
                        </TableCell>
                        <TableCell className="text-right font-bold text-lg text-emerald-600 dark:text-emerald-400">
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
                <p className="text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, quotationItems.length)} of {quotationItems.length}
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
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
                          onClick={() => handlePageChange(pageNum)}
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
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="h-8 px-3 rounded-xl dark:border-gray-700 dark:hover:bg-gray-800"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}

            {!hasSelectedItems && (
              <div className="mt-4 flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm bg-amber-50 dark:bg-amber-950/30 p-3 rounded-xl border border-amber-200 dark:border-amber-800/50">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                <span>Please select at least one item to create a purchase order.</span>
              </div>
            )}

            {validationErrors.length > 0 && (
              <div className="mt-4 space-y-1">
                {validationErrors.map((err, index) => (
                  <div key={index} className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-950/30 p-3 rounded-xl border border-red-200 dark:border-red-800/50">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{err}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ============================================ */}
        {/* 5. SPECIAL INSTRUCTIONS */}
        {/* ============================================ */}
        <Card className="border-0 shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <PenTool className="h-4 w-4 text-muted-foreground" />
              Special Instructions
            </CardTitle>
            <CardDescription>
              Any extra information about this purchase order
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Add any special conditions, delivery instructions, quality requirements, or other notes..."
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              rows={4}
              className="rounded-xl resize-none border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500"
            />
          </CardContent>
        </Card>

        {/* ============================================ */}
        {/* 6. SUMMARY & ACTIONS - Premium Action Bar */}
        {/* ============================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="border-0 shadow-sm rounded-xl lg:col-span-2">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Document Type:</span>
                  <Badge className={cn(
                    "rounded-full px-3 py-1",
                    orderType === 'lpo' && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
                    orderType === 'lso' && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                    orderType === 'both_separate' && "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
                    orderType === 'combined' && "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                  )}>
                    {orderType === 'lpo' && 'LPO (Goods)'}
                    {orderType === 'lso' && 'LSO (Services)'}
                    {orderType === 'both_separate' && 'Both (Separate) [Coming Soon]'}
                    {orderType === 'combined' && 'Combined [Coming Soon]'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Items:</span>
                  <span className="font-medium">{selectedItems.length} selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-bold text-lg text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex-1 rounded-xl h-12 border-gray-200 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!hasSelectedItems || isSubmitting || (orderType !== 'lpo' && orderType !== 'lso')}
              className={cn(
                "flex-1 rounded-xl h-12 gap-2 font-medium",
                hasSelectedItems && (orderType === 'lpo' || orderType === 'lso')
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
                  Create Order
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Disabled document type warning */}
        {(orderType === 'both_separate' || orderType === 'combined') && (
          <Alert className="rounded-xl border-amber-200 dark:border-amber-800/50 bg-amber-50/80 dark:bg-amber-950/30">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertTitle className="text-amber-700 dark:text-amber-300">Feature Not Available</AlertTitle>
            <AlertDescription className="text-amber-600 dark:text-amber-400">
              {orderType === 'both_separate'
                ? 'Both (Separate) document type is currently in development. Please use LPO or LSO.'
                : 'Combined document type is currently in development. Please use LPO or LSO.'}
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* ============================================ */}
      {/* 7. CONFIRMATION MODAL - Glassmorphic Design */}
      {/* ============================================ */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="max-w-3xl rounded-2xl backdrop-blur-xl bg-white/80 dark:bg-gray-900/90 border border-white/20 dark:border-gray-700/50 shadow-2xl p-0 overflow-hidden">
          {/* Header with gradient */}
          <div className="p-6 border-b border-white/10 dark:border-gray-700/30 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/20">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-100/50 dark:bg-emerald-900/30 backdrop-blur-sm border border-white/20 dark:border-gray-700/50">
                <FileCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
                  Confirm Purchase Order
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
                  Review the order details before confirming. Order number will be auto-generated.
                </DialogDescription>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-muted/30 dark:bg-gray-800/30 backdrop-blur-sm border border-white/10 dark:border-gray-700/30">
                <p className="text-xs text-muted-foreground">Document Type</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {orderType === 'lpo' && 'LPO (Goods)'}
                  {orderType === 'lso' && 'LSO (Services)'}
                  {orderType === 'both_separate' && 'Both (Separate) [Coming Soon]'}
                  {orderType === 'combined' && 'Combined [Coming Soon]'}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-muted/30 dark:bg-gray-800/30 backdrop-blur-sm border border-white/10 dark:border-gray-700/30">
                <p className="text-xs text-muted-foreground">Supplier</p>
                <p className="font-semibold text-gray-900 dark:text-white truncate">{supplierDisplayName}</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50/30 dark:bg-emerald-950/20 backdrop-blur-sm border border-emerald-200/30 dark:border-emerald-800/30">
                <p className="text-xs text-muted-foreground">Total Amount</p>
                <p className="font-bold text-lg text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(totalAmount)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-muted/30 dark:bg-gray-800/30 backdrop-blur-sm border border-white/10 dark:border-gray-700/30">
                <p className="text-xs text-muted-foreground">Items</p>
                <p className="font-semibold text-gray-900 dark:text-white">{selectedItems.length} selected</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/30 dark:bg-gray-800/30 backdrop-blur-sm border border-white/10 dark:border-gray-700/30">
                <p className="text-xs text-muted-foreground">Expected Delivery</p>
                <p className="font-semibold text-gray-900 dark:text-white">{formatDate(deliveryDate)}</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/30 dark:bg-gray-800/30 backdrop-blur-sm border border-white/10 dark:border-gray-700/30">
                <p className="text-xs text-muted-foreground">Valid Until</p>
                <p className="font-semibold text-gray-900 dark:text-white">{formatDate(validityDate)}</p>
              </div>
            </div>

            <Separator className="bg-white/10 dark:bg-gray-700/30" />

            {/* Items List */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-muted-foreground">
                  Items ({selectedItems.length})
                </p>
                <Badge variant="outline" className="text-xs border-white/20 dark:border-gray-700/50 text-gray-600 dark:text-gray-300 backdrop-blur-sm">
                  {selectedItems.length} items
                </Badge>
              </div>
              <div className="max-h-48 overflow-auto rounded-xl border border-white/10 dark:border-gray-700/30 backdrop-blur-sm">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/20 dark:bg-gray-800/30 hover:bg-transparent border-b border-white/10 dark:border-gray-700/30">
                      <TableHead className="py-2 text-xs font-medium text-muted-foreground">Item</TableHead>
                      <TableHead className="py-2 text-center text-xs font-medium text-muted-foreground">Qty</TableHead>
                      <TableHead className="py-2 text-center text-xs font-medium text-muted-foreground">Unit</TableHead>
                      <TableHead className="py-2 text-right text-xs font-medium text-muted-foreground">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedItemsDetails.slice(0, 10).map((item: any) => (
                      <TableRow key={item.id} className="hover:bg-transparent border-b border-white/5 dark:border-gray-700/20">
                        <TableCell className="py-2 text-sm font-medium text-gray-900 dark:text-white">{item.item_name}</TableCell>
                        <TableCell className="py-2 text-center text-sm text-muted-foreground">
                          {parseFloat(item.quantity).toLocaleString()}
                        </TableCell>
                        <TableCell className="py-2 text-center">
                          <Badge variant="outline" className="text-xs font-mono bg-white/20 dark:bg-gray-800/30 border-white/20 dark:border-gray-700/50">
                            {item.unit_of_measure || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-2 text-right font-medium text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(parseFloat(item.total_price) || 0)}
                        </TableCell>
                      </TableRow>
                    ))}
                    {selectedItemsDetails.length > 10 && (
                      <TableRow>
                        <TableCell colSpan={4} className="py-2 text-center text-sm text-muted-foreground">
                          +{selectedItemsDetails.length - 10} more items
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {specialInstructions && (
              <>
                <Separator className="bg-white/10 dark:bg-gray-700/30" />
                <div className="p-3 rounded-xl bg-muted/20 dark:bg-gray-800/20 backdrop-blur-sm border border-white/10 dark:border-gray-700/30">
                  <p className="text-xs text-muted-foreground">Special Instructions</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">{specialInstructions}</p>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10 dark:border-gray-700/30 bg-muted/10 dark:bg-gray-800/10 backdrop-blur-sm flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowConfirmation(false)}
              className="rounded-xl px-6 border-white/20 dark:border-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-gray-800/50 backdrop-blur-sm"
            >
              Go Back
            </Button>
            <Button
              onClick={handleConfirmSubmit}
              disabled={isSubmitting || (orderType !== 'lpo' && orderType !== 'lso')}
              className={cn(
                "rounded-xl px-6",
                (orderType === 'lpo' || orderType === 'lso')
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-600/20 text-white"
                  : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <FileCheck className="h-4 w-4 mr-2" />
                  Confirm & Create
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ============================================ */}
      {/* 8. CANCEL CONFIRMATION MODAL - Glassmorphic Design */}
      {/* ============================================ */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent className="max-w-lg rounded-2xl backdrop-blur-xl bg-white/80 dark:bg-gray-900/90 border border-white/20 dark:border-gray-700/50 shadow-2xl p-0 overflow-hidden">
          <div className="p-6 border-b border-white/10 dark:border-gray-700/30 bg-gradient-to-br from-red-50/50 to-rose-50/50 dark:from-red-950/20 dark:to-rose-950/20">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-red-100/50 dark:bg-red-900/30 backdrop-blur-sm border border-white/20 dark:border-gray-700/50">
                <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <AlertDialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
                  Cancel Order Creation
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm text-gray-500 dark:text-gray-400">
                  Are you sure you want to cancel creating this purchase order?
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

          <div className="p-6 border-t border-white/10 dark:border-gray-700/30 bg-muted/10 dark:bg-gray-800/10 backdrop-blur-sm flex justify-end gap-3">
            <AlertDialogCancel className="rounded-xl px-6 border-white/20 dark:border-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-gray-800/50 backdrop-blur-sm">
              Continue Editing
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              className="bg-red-600 hover:bg-red-700 rounded-xl px-6 shadow-lg shadow-red-600/20 text-white"
            >
              Yes, Cancel Creation
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </PageTemplate>
  );
}
