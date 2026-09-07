// frontend/src/app/(dashboard)/procurement/supplier/rfq-invitations/[id]/submit/page.tsx

'use client';

import React, { useState, useEffect, useMemo, memo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Send,
  Loader2,
  Package,
  DollarSign,
  Calendar,
  Truck,
  Shield,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  AlertCircle,
  FileText,
  Building2,
  User,
  Lock,
  FileCheck,
  MessageSquare,
  CreditCard,
  Briefcase,
  Plus,
  Trash2,
  Save,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Lightbulb,
  ListChecks,
  CalendarIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { PageTemplate } from '@/components/dashboard/PageTemplate';
import { useQuotation } from '@/hooks/useQuotation';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useCreateSupplierQuotation } from '@/hooks/useSupplierQuotation';
import type { CreateSupplierQuotationData } from '@/types/supplierQuotation.types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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

const formatDateTime = (date: string | Date | null): string => {
  if (!date) return 'N/A';
  try {
    return format(new Date(date), 'dd MMM yyyy HH:mm');
  } catch {
    return 'Invalid Date';
  }
};

const formatCurrency = (amount: number | string | null | undefined): string => {
  if (amount === null || amount === undefined) return 'N/A';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return 'N/A';
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: CURRENCY,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

const getInitials = (name: string): string => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const getUserName = (user: { full_name?: string; first_name?: string; last_name?: string } | number | null | undefined): string => {
  if (!user) return 'Unknown';
  if (typeof user === 'number') return 'User ' + user;
  if (typeof user === 'object') {
    return user.full_name || [user.first_name, user.last_name].filter(Boolean).join(' ') || 'Unknown';
  }
  return 'Unknown';
};

const isServiceRequisition = (requisition: any): boolean => {
  if (!requisition) return false;
  if (requisition.is_service_requisition === true) return true;
  if (requisition.is_goods_requisition === true) return false;
  return requisition.requisition_type === 'services';
};

// ============================================
// STATUS BADGE COMPONENT
// ============================================

const StatusBadge = ({ status, isExpired }: { status: string; isExpired?: boolean }) => {
  const statusMap: Record<string, { label: string; color: string }> = {
    draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
    sent: { label: 'Open for Bidding', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    responded: { label: 'Bids Received', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' },
    evaluating: { label: 'Under Evaluation', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
    closed: { label: 'Closed', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    expired: { label: 'Expired', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  };

  const key = isExpired ? 'expired' : status;
  const { label, color } = statusMap[key] || statusMap.draft;

  return (
    <Badge className={cn("px-3 py-1.5 font-medium rounded-full text-sm", color)}>
      {label}
    </Badge>
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
// WARNING BADGE
// ============================================

const WarningBadge = ({ show, children }: { show: boolean; children: React.ReactNode }) => {
  if (!show) return null;
  return (
    <div className="mt-4 flex items-center gap-2 text-amber-700 dark:text-amber-400 text-sm bg-amber-50 dark:bg-amber-950/30 p-3 rounded-xl border border-amber-200 dark:border-amber-800/50">
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      <span>{children}</span>
    </div>
  );
};

// ============================================
// MAIN PAGE
// ============================================

export default function SubmitQuotationPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);

  // State
  const [currentStep, setCurrentStep] = useState(1);
  const [items, setItems] = useState<Array<{
    id?: string;
    requisition_item_id?: number;
    item_name: string;
    description: string | null;
    quantity: number;
    unit_of_measure: string;
    unit_price: number;
    delivery_days?: number;
    warranty_months?: number;
    notes?: string;
    is_custom?: boolean;
    is_alternative?: boolean;
  }>>([]);
  const [notes, setNotes] = useState('');
  const [validityDate, setValidityDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Hooks
  const { useSupplierProfileExists } = useSuppliers();
  const { supplier } = useSupplierProfileExists();
  const { data: quotation, isLoading } = useQuotation(id);
  const createQuotation = useCreateSupplierQuotation();

  // Check if requisition is for services
  const isService = useMemo(() => {
    return isServiceRequisition(quotation?.requisition);
  }, [quotation]);

  // Initialize items from quotation (for goods) or empty (for services)
  useEffect(() => {
    if (quotation?.requisition?.items) {
      if (isService) {
        // Services: Start with empty items list - supplier adds their own items
        setItems([]);
      } else {
        // Goods: Preload items from requisition
        setItems(
          quotation.requisition.items.map((item: any) => ({
            requisition_item_id: item.id,
            item_name: item.item_name,
            description: item.description || null,
            quantity: parseFloat(item.quantity) || 1,
            unit_of_measure: item.unit_of_measure || 'Unit',
            unit_price: 0,
            delivery_days: 30,
            warranty_months: 12,
            notes: '',
            is_custom: false,
            is_alternative: false,
          }))
        );
      }
    }
  }, [quotation, isService]);

  // Handlers
  const handlePriceChange = (index: number, value: number) => {
    const newItems = [...items];
    newItems[index].unit_price = value;
    setItems(newItems);
  };

  const handleItemNoteChange = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index].notes = value;
    setItems(newItems);
  };

  const handleQuantityChange = (index: number, value: number) => {
    const newItems = [...items];
    newItems[index].quantity = value;
    setItems(newItems);
  };

  const handleUnitChange = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index].unit_of_measure = value;
    setItems(newItems);
  };

  const handleItemNameChange = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index].item_name = value;
    setItems(newItems);
  };

  const handleItemDescriptionChange = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index].description = value;
    setItems(newItems);
  };

  // Add custom item (for both goods and services)
  const addItem = () => {
    const item = {
      id: `custom_${Date.now()}`,
      requisition_item_id: undefined,
      item_name: '',
      description: null,
      quantity: 1,
      unit_of_measure: isService ? 'Unit' : 'Unit',
      unit_price: 0,
      delivery_days: 30,
      warranty_months: 12,
      notes: '',
      is_custom: true,
      is_alternative: !isService, // For goods, custom items are alternatives
    };
    setItems([...items, item]);
  };

  // Only allow removal of custom items (not requisition items)
  const removeItem = (index: number) => {
    const item = items[index];
    // Only allow deletion if it's a custom item AND there's more than 1 item
    if (item.is_custom && items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
    }
  };

  const handleSubmit = () => {
    if (!quotation || !supplier) return;

    const supplierId = (supplier as any)?.id;
    if (!supplierId) return;

    // Validate items have prices
    const hasAllPrices = items.every(item => item.unit_price > 0);
    if (items.length === 0 || !hasAllPrices) {
      setError('Please enter prices for all items before submitting.');
      return;
    }

    // Prepare items with proper typing
    const quotationItems: any[] = items.map(item => {
      const baseItem = {
        item_name: item.item_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        unit_of_measure: item.unit_of_measure || (isService ? 'Unit' : 'pcs'),
        description: item.description || undefined,
        delivery_days: item.delivery_days,
        warranty_months: item.warranty_months,
        is_alternative: item.is_alternative || false,
        is_custom: item.is_custom || false,
        alternative_notes: item.is_custom && !isService ? 'Custom alternative item' : undefined,
      };

      // For custom items, send 0 for requisition_item_id (backend will convert to null)
      if (item.is_custom) {
        return {
          ...baseItem,
          requisition_item_id: 0,
        };
      } else {
        return {
          ...baseItem,
          requisition_item_id: item.requisition_item_id || 0,
        };
      }
    });

    const submitData: CreateSupplierQuotationData = {
      quotation_request_id: quotation.id,
      supplier_id: supplierId,
      validity_date: validityDate || undefined,
      delivery_time: deliveryTime || undefined,
      payment_terms: paymentTerms || undefined,
      items: quotationItems,
      notes: notes || undefined,
    };

    createQuotation.mutate(submitData, {
      onSuccess: () => {
        router.push(`/procurement/supplier/rfq-invitations/${id}`);
      },
      onError: (err: any) => {
        setError(err?.response?.data?.message || err.message || 'Failed to submit quotation');
      },
    });
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  const pricedItems = items.filter(item => item.unit_price > 0).length;
  const totalItems = items.length;
  const hasAllPrices = totalItems > 0 && pricedItems === totalItems;

  const handleBack = () => router.back();

  const goToNextStep = () => {
    if (currentStep === 1) {
      if (items.length === 0) {
        setError('Please add at least one item.');
        return;
      }
      const hasAllPrices = items.every(item => item.unit_price > 0);
      if (!hasAllPrices) {
        setError('Please enter prices for all items before proceeding.');
        return;
      }
      setError(null);
    }
    setCurrentStep(Math.min(currentStep + 1, 3));
  };

  const goToPreviousStep = () => {
    setCurrentStep(Math.max(currentStep - 1, 1));
  };

  const stepLabels = useMemo(() => {
    return ['Items & Pricing', 'Quotation Details', 'Review & Submit'];
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <PageTemplate
        title="Submit Quotation"
        description="Loading..."
        icon={<Send className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />}
        background="gradient"
        variant="default"
        breadcrumbs={[
          { label: 'Procurement', href: '/procurement' },
          { label: 'Supplier', href: '/procurement/supplier' },
          { label: 'RFQ Invitations', href: '/procurement/supplier/rfq-invitations' },
          { label: 'Submit Quotation' },
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
  if (!quotation) {
    return (
      <PageTemplate
        title="Submit Quotation"
        description="RFQ not found"
        icon={<AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />}
        background="gradient"
        variant="default"
        breadcrumbs={[
          { label: 'Procurement', href: '/procurement' },
          { label: 'Supplier', href: '/procurement/supplier' },
          { label: 'RFQ Invitations', href: '/procurement/supplier/rfq-invitations' },
          { label: 'Submit Quotation' },
        ]}
      >
        <Card className="border-0 shadow-sm rounded-xl">
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">RFQ Not Found</h3>
            <p className="text-muted-foreground">The RFQ you're trying to quote on doesn't exist.</p>
            <Button onClick={handleBack} className="mt-4 rounded-xl">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </PageTemplate>
    );
  }

  const isExpired = quotation.is_expired;
  const isClosingSoon = quotation.is_closing_soon;
  const generatedByName = getUserName(quotation.generated_by);

  return (
    <PageTemplate
      title="Submit Quotation"
      description={`Submit your quotation for ${quotation.qtn_number}`}
      icon={<Send className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />}
      background="gradient"
      variant="default"
      breadcrumbs={[
        { label: 'Procurement', href: '/procurement' },
        { label: 'Supplier', href: '/procurement/supplier' },
        { label: 'RFQ Invitations', href: '/procurement/supplier/rfq-invitations' },
        { label: quotation.qtn_number, href: `/procurement/supplier/rfq-invitations/${id}` },
        { label: 'Submit Quotation' },
      ]}
      actions={
        <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2 h-9 rounded-xl">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      }
    >
      <div className="space-y-6">
        {/* ============================================ */}
        {/* 1. RFQ SUMMARY HEADER */}
        {/* ============================================ */}
        <Card className={`border-0 shadow-sm rounded-xl overflow-hidden ${isService
            ? 'bg-gradient-to-br from-purple-50/80 to-indigo-50/80 dark:from-purple-950/20 dark:to-indigo-950/20'
            : 'bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-950/20 dark:to-indigo-950/20'
          }`}>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className={cn(
                    "p-2 rounded-xl",
                    isService ? "bg-purple-100 dark:bg-purple-900/30" : "bg-blue-100 dark:bg-blue-900/30"
                  )}>
                    {isService ? (
                      <Briefcase className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    ) : (
                      <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                  <h2 className="text-xl font-bold">{quotation.qtn_number}</h2>
                  <Badge className={cn(
                    "rounded-full px-3 py-1",
                    isService
                      ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800"
                      : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                  )}>
                    {isService ? 'Services (LSO)' : 'Goods (LPO)'}
                  </Badge>
                  <StatusBadge status={quotation.status} isExpired={isExpired} />
                  {isClosingSoon && !isExpired && (
                    <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 animate-pulse rounded-full">
                      <Clock className="h-3.5 w-3.5 mr-1.5" />
                      Closing Soon
                    </Badge>
                  )}
                </div>

                <h3 className="text-lg font-semibold text-muted-foreground">{quotation.title}</h3>

                <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    {quotation.requisition?.department?.name || 'N/A'}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {generatedByName}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Closes: {formatDateTime(quotation.closing_date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Package className="h-4 w-4" />
                    {items.length} items
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-start lg:items-end gap-2">
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Time Remaining</p>
                    <p className={cn(
                      "text-lg font-bold",
                      isExpired ? "text-red-500" :
                        isClosingSoon ? "text-amber-500" :
                          "text-emerald-500"
                    )}>
                      {isExpired ? 'Expired' :
                        isClosingSoon ? 'Closing Soon' :
                          'Open for Bidding'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ============================================ */}
        {/* 2. STEP INDICATOR */}
        {/* ============================================ */}
        <StepIndicator
          currentStep={currentStep}
          totalSteps={3}
          labels={stepLabels}
        />

        {/* ============================================ */}
        {/* 3. STEP CONTENT */}
        {/* ============================================ */}
        <div className="min-h-[400px]">
          {/* Step 1: Items & Pricing */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                {isService ? (
                  <Briefcase className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                ) : (
                  <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                )}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {isService ? 'Items for Service' : 'Items & Pricing'}
                </h3>
                <Badge className={cn(
                  "rounded-full text-[10px] ml-2",
                  isService
                    ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                    : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                )}>
                  {isService ? 'Add items manually' : 'Pre-loaded + Add custom items'}
                </Badge>
              </div>

              <Alert className="border-blue-200 dark:border-blue-800/50 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl">
                <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-blue-700 dark:text-blue-300 text-sm">
                  {isService
                    ? 'Add the items required for this service and enter your prices. Click "Add Item" to add more items.'
                    : 'Enter your unit price for each item. Click "Add Item" to add alternative items not in the requisition.'}
                </AlertDescription>
              </Alert>

              {error && (
                <Alert variant="destructive" className="rounded-lg border-red-200 dark:border-red-800">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Items Table */}
              <Card className="border-0 shadow-sm rounded-xl">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      {isService ? (
                        <Briefcase className="h-4 w-4 text-purple-500" />
                      ) : (
                        <Package className="h-4 w-4 text-muted-foreground" />
                      )}
                      Items to Quote
                    </CardTitle>
                    <CardDescription>
                      {isService
                        ? 'Add the items required for this service'
                        : 'Enter your prices for each item. Add custom items for alternatives.'}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="rounded-full">
                      {items.length} items
                    </Badge>
                    <Button
                      size="sm"
                      onClick={addItem}
                      className="gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <Plus className="h-4 w-4" />
                      Add Item
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {items.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-700">
                      {isService ? (
                        <>
                          <Briefcase className="h-12 w-12 mx-auto text-purple-300 dark:text-purple-600 mb-3" />
                          <h3 className="text-lg font-semibold mb-2">No Items Added</h3>
                          <p className="text-muted-foreground mb-4">
                            Click the "Add Item" button to add items required for this service
                          </p>
                          <Button
                            onClick={addItem}
                            className="gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white"
                          >
                            <Plus className="h-4 w-4" />
                            Add Item
                          </Button>
                        </>
                      ) : (
                        <>
                          <Package className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                          <p className="text-muted-foreground">No items found for this RFQ</p>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="border rounded-xl overflow-hidden dark:border-gray-700 shadow-sm">
                      <ScrollArea className="max-h-[500px]">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/50 dark:bg-gray-800/50">
                              <TableHead className="min-w-[180px]">Item Name</TableHead>
                              <TableHead className="min-w-[150px]">Description</TableHead>
                              <TableHead className="text-center w-[80px]">Qty</TableHead>
                              <TableHead className="text-center w-[100px]">Unit</TableHead>
                              <TableHead className="text-right w-[160px]">Unit Price ({CURRENCY})</TableHead>
                              <TableHead className="text-right w-[140px]">Total ({CURRENCY})</TableHead>
                              <TableHead className="min-w-[100px]">Notes</TableHead>
                              <TableHead className="text-center w-[60px]">Action</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {items.map((item, index) => {
                              const total = item.quantity * item.unit_price;
                              const isPriced = item.unit_price > 0;
                              const isCustom = item.is_custom;

                              return (
                                <TableRow
                                  key={index}
                                  className={cn(
                                    "hover:bg-muted/50 dark:hover:bg-gray-800/50 transition-colors",
                                    !isPriced && isCustom && "border-l-2 border-l-amber-400",
                                    isCustom && "bg-purple-50/30 dark:bg-purple-950/20"
                                  )}
                                >
                                  <TableCell>
                                    {isCustom ? (
                                      <Input
                                        placeholder="Item name"
                                        value={item.item_name}
                                        onChange={(e) => handleItemNameChange(index, e.target.value)}
                                        className="h-9 text-sm rounded-xl dark:bg-gray-900 dark:border-gray-700"
                                      />
                                    ) : (
                                      <div>
                                        <p className="font-medium flex items-center gap-2">
                                          {item.item_name}
                                          <Badge className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0">
                                            From Requisition
                                          </Badge>
                                        </p>
                                      </div>
                                    )}
                                    {isCustom && (
                                      <Badge className="text-[10px] mt-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-0">
                                        Custom
                                      </Badge>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {isCustom ? (
                                      <Input
                                        placeholder="Description (optional)"
                                        value={item.description || ''}
                                        onChange={(e) => handleItemDescriptionChange(index, e.target.value)}
                                        className="h-9 text-sm rounded-xl dark:bg-gray-900 dark:border-gray-700"
                                      />
                                    ) : (
                                      <p className="text-sm text-muted-foreground">
                                        {item.description || '—'}
                                      </p>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {isCustom ? (
                                      <Input
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => handleQuantityChange(index, parseFloat(e.target.value) || 1)}
                                        className="w-16 h-9 text-center rounded-xl dark:bg-gray-900 dark:border-gray-700"
                                        min={1}
                                        step={1}
                                      />
                                    ) : (
                                      <Badge variant="secondary" className="font-mono bg-transparent">
                                        {item.quantity.toLocaleString()}
                                      </Badge>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {isCustom ? (
                                      <Input
                                        type="text"
                                        value={item.unit_of_measure}
                                        onChange={(e) => handleUnitChange(index, e.target.value)}
                                        className="w-24 h-9 text-center rounded-xl dark:bg-gray-900 dark:border-gray-700"
                                        placeholder="Unit"
                                      />
                                    ) : (
                                      <span className="text-sm text-muted-foreground">
                                        {item.unit_of_measure || 'Unit'}
                                      </span>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      <Input
                                        type="number"
                                        value={item.unit_price || ''}
                                        onChange={(e) => handlePriceChange(index, parseFloat(e.target.value) || 0)}
                                        className={cn(
                                          "w-32 h-9 text-right rounded-xl dark:bg-gray-900 dark:border-gray-700",
                                          !isPriced && "border-amber-300 dark:border-amber-700"
                                        )}
                                        min={0}
                                        step={0.01}
                                        placeholder="0.00"
                                      />
                                      {!isPriced && (
                                        <div className="w-4 h-4 rounded-full bg-amber-400/30 border-2 border-amber-400 flex-shrink-0" />
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-right font-medium">
                                    {isPriced ? (
                                      <span className="text-emerald-600 dark:text-emerald-400">
                                        {formatCurrency(total)}
                                      </span>
                                    ) : (
                                      <span className="text-muted-foreground">—</span>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      type="text"
                                      placeholder="Notes..."
                                      value={item.notes || ''}
                                      onChange={(e) => handleItemNoteChange(index, e.target.value)}
                                      className="h-9 text-xs rounded-xl dark:bg-gray-900 dark:border-gray-700"
                                    />
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {isCustom ? (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeItem(index)}
                                        className="h-8 w-8 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                        disabled={items.length <= 1}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    ) : (
                                      <div className="flex items-center justify-center" title="Requisition items cannot be removed">
                                        <Lock className="h-4 w-4 text-muted-foreground/50" />
                                      </div>
                                    )}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                          <TableFooter>
                            <TableRow className="bg-muted/50 dark:bg-gray-800/50">
                              <TableCell colSpan={6} className="text-right font-bold text-base">
                                Total Quotation Amount
                              </TableCell>
                              <TableCell className="text-right font-bold text-lg text-emerald-600 dark:text-emerald-400">
                                {totalAmount > 0 ? formatCurrency(totalAmount) : '—'}
                              </TableCell>
                              <TableCell />
                            </TableRow>
                          </TableFooter>
                        </Table>
                      </ScrollArea>
                    </div>
                  )}

                  {/* Missing prices warning */}
                  {items.length > 0 && !items.every(item => item.unit_price > 0) && (
                    <WarningBadge show={true}>
                      Please enter prices for all items before proceeding.
                    </WarningBadge>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 2: Quotation Details */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <FileCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Quotation Details
                </h3>
                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-[10px] ml-2">
                  Optional
                </Badge>
              </div>

              <Alert className="border-blue-200 dark:border-blue-800/50 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl">
                <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-blue-700 dark:text-blue-300 text-sm">
                  Provide additional details about your quotation including validity, delivery timeline, and payment terms.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-0 shadow-sm rounded-xl">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      Validity & Delivery
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="validity-date">Validity Date</Label>
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
                      <p className="text-xs text-muted-foreground">Date until which your quotation is valid</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="delivery-time">Delivery / Service Completion Time</Label>
                      <Input
                        id="delivery-time"
                        placeholder="e.g., 30 days, 2 weeks, 5-7 business days"
                        value={deliveryTime}
                        onChange={(e) => setDeliveryTime(e.target.value)}
                        className="h-11 text-sm rounded-xl dark:bg-gray-900 dark:border-gray-700"
                      />
                      <p className="text-xs text-muted-foreground">
                        {isService ? 'Expected timeline for service delivery' : 'Expected delivery timeline after order'}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm rounded-xl">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      Payment Terms
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label htmlFor="payment-terms">Payment Terms</Label>
                      <Input
                        id="payment-terms"
                        placeholder="e.g., 30 days net, 50% advance, Cash on Delivery"
                        value={paymentTerms}
                        onChange={(e) => setPaymentTerms(e.target.value)}
                        className="h-11 text-sm rounded-xl dark:bg-gray-900 dark:border-gray-700"
                      />
                      <p className="text-xs text-muted-foreground">Your proposed payment terms</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-0 shadow-sm rounded-xl">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    Additional Notes
                  </CardTitle>
                  <CardDescription>Any extra information you'd like to share with procurement</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Add any additional information about your quotation, special conditions, or clarifications..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    className="rounded-xl resize-none dark:bg-gray-900 dark:border-gray-700"
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 3: Review & Submit */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <ListChecks className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Review & Submit
                </h3>
                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full text-[10px] ml-2">
                  Final Step
                </Badge>
              </div>

              <Alert className="border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <AlertDescription className="text-amber-700 dark:text-amber-300 text-sm">
                  <strong>Please review your quotation carefully before submitting.</strong>
                  <br />
                  Once submitted, you cannot modify your quotation. All prices are binding.
                </AlertDescription>
              </Alert>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-0 shadow-sm rounded-xl bg-gradient-to-br from-emerald-50/80 to-teal-50/80 dark:from-emerald-950/30 dark:to-teal-950/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Items</p>
                        <p className="text-2xl font-bold">{items.length}</p>
                      </div>
                      <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                        <Package className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm rounded-xl bg-gradient-to-br from-purple-50/80 to-indigo-50/80 dark:from-purple-950/30 dark:to-indigo-950/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Amount</p>
                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(totalAmount)}
                        </p>
                      </div>
                      <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                        <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm rounded-xl bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-950/30 dark:to-indigo-950/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Validity</p>
                        <p className="text-lg font-semibold">
                          {validityDate ? formatDate(validityDate) : 'Not set'}
                        </p>
                      </div>
                      <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                        <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Item Summary Table */}
              <Card className="border-0 shadow-sm rounded-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ListChecks className="h-4 w-4 text-muted-foreground" />
                    Items Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="border rounded-xl overflow-hidden dark:border-gray-700">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50 dark:bg-gray-800/50">
                          <TableHead>Item</TableHead>
                          <TableHead className="text-center">Qty</TableHead>
                          <TableHead className="text-center">Unit</TableHead>
                          <TableHead className="text-right">Unit Price</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{item.item_name}</p>
                                {item.description && (
                                  <p className="text-xs text-muted-foreground">{item.description}</p>
                                )}
                                {item.is_custom && (
                                  <Badge className="text-[10px] ml-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-0">
                                    Custom
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">{item.quantity}</TableCell>
                            <TableCell className="text-center">{item.unit_of_measure}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                            <TableCell className="text-right font-medium text-emerald-600 dark:text-emerald-400">
                              {formatCurrency(item.quantity * item.unit_price)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                      <TableFooter>
                        <TableRow className="bg-muted/50 dark:bg-gray-800/50">
                          <TableCell colSpan={3} className="text-right font-bold text-base">
                            Total
                          </TableCell>
                          <TableCell className="text-right font-bold text-base">
                            {formatCurrency(totalAmount)}
                          </TableCell>
                          <TableCell />
                        </TableRow>
                      </TableFooter>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {error && (
                <Alert variant="destructive" className="rounded-lg border-red-200 dark:border-red-800">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>

        {/* ============================================ */}
        {/* 4. NAVIGATION BUTTONS */}
        {/* ============================================ */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div>
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={goToPreviousStep}
                disabled={createQuotation.isPending}
                className="gap-2 h-10 rounded-xl dark:border-gray-700 dark:hover:bg-gray-800"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {currentStep < 3 && (
              <Button
                type="button"
                onClick={goToNextStep}
                disabled={createQuotation.isPending}
                className="gap-2 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}

            {currentStep === 3 && (
              <Button
                type="button"
                onClick={handleSubmit}
                className="gap-2 px-8 min-w-[160px] h-11 text-base rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-600/20"
                disabled={createQuotation.isPending}
              >
                {createQuotation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit Quotation
                  </>
                )}
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={createQuotation.isPending}
              className="h-10 rounded-xl dark:border-gray-700 dark:hover:bg-gray-800"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </PageTemplate>
  );
}
