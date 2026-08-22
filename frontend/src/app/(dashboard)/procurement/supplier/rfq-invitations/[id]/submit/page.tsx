// frontend/src/app/(dashboard)/procurement/supplier/rfq-invitations/[id]/submit/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
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
  EyeOff,
  Sparkles,
  FileCheck,
  MessageSquare,
  CreditCard,
  Wallet,
  ShoppingCart,
  Gauge,
  Target,
  Rocket,
  Gem,
  Crown,
  Award,
  Star,
  Zap,
  Flame,
  Leaf,
  TrendingUp,
  Users,
  Briefcase,
  CalendarDays,
  Hourglass,
  ShieldCheck,
  BadgeCheck,
  FileCheck2,
  ClipboardList,
  Layers,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Box,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { PageTemplate } from '@/components/dashboard/PageTemplate';
import { useQuotation } from '@/hooks/useQuotation';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useCreateSupplierQuotation } from '@/hooks/useSupplierQuotation';
import type { CreateSupplierQuotationData } from '@/types/supplierQuotation.types';

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

// Helper to safely get user name from QuotationUser | number
const getUserName = (user: { full_name?: string; first_name?: string; last_name?: string } | number | null | undefined): string => {
  if (!user) return 'Unknown';
  if (typeof user === 'number') return 'User ' + user;
  if (typeof user === 'object') {
    return user.full_name || [user.first_name, user.last_name].filter(Boolean).join(' ') || 'Unknown';
  }
  return 'Unknown';
};

// ============================================
// SUB-COMPONENTS
// ============================================

interface StatusBadgeProps {
  status: string;
  isExpired?: boolean;
}

const StatusBadge = ({ status, isExpired }: StatusBadgeProps) => {
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
// MAIN PAGE
// ============================================

export default function SubmitQuotationPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);

  // State
  const [items, setItems] = useState<Array<{
    requisition_item_id: number;
    item_name: string;
    description: string | null;
    quantity: number;
    unit_of_measure: string;
    unit_price: number;
    delivery_days?: number;
    warranty_months?: number;
    notes?: string;
  }>>([]);
  const [notes, setNotes] = useState('');
  const [validityDate, setValidityDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');

  // Hooks
  const { useSupplierProfileExists } = useSuppliers();
  const { supplier } = useSupplierProfileExists();
  const { data: quotation, isLoading } = useQuotation(id);
  const createQuotation = useCreateSupplierQuotation();

  // Initialize items from quotation
  useEffect(() => {
    if (quotation?.requisition?.items) {
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
        }))
      );
    }
  }, [quotation]);

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

  const handleSubmit = () => {
    if (!quotation || !supplier) return;

    // Get supplier ID safely
    const supplierId = (supplier as any)?.id;
    if (!supplierId) return;

    const submitData: CreateSupplierQuotationData = {
      quotation_request_id: quotation.id,
      supplier_id: supplierId,
      validity_date: validityDate || undefined,
      delivery_time: deliveryTime || undefined,
      payment_terms: paymentTerms || undefined,
      items: items.map(item => ({
        requisition_item_id: item.requisition_item_id,
        item_name: item.item_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        unit_of_measure: item.unit_of_measure || 'pcs', // ✅ ADD THIS!
        delivery_days: item.delivery_days,
        warranty_months: item.warranty_months,
      })),
      notes: notes || undefined,
    };

    createQuotation.mutate(submitData, {
      onSuccess: () => {
        router.push(`/procurement/supplier/rfq-invitations/${id}`);
      },
    });
  };
  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  const pricedItems = items.filter(item => item.unit_price > 0).length;
  const totalItems = items.length;
  const hasAllPrices = pricedItems === totalItems && totalItems > 0;
  const progressPercentage = totalItems > 0 ? (pricedItems / totalItems) * 100 : 0;

  const handleBack = () => router.back();

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
        {/* 1. INSTRUCTIONS & RFQ SUMMARY */}
        {/* ============================================ */}
        <Card className="border-0 shadow-sm rounded-xl overflow-hidden bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-950/20 dark:to-indigo-950/20">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-xl font-bold">{quotation.qtn_number}</h2>
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

            <Separator className="my-4" />

            {/* Instructions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg mt-0.5">
                  <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="font-medium text-sm">Step 1: Enter Prices</p>
                  <p className="text-xs text-muted-foreground">Enter your unit price for each item below</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg mt-0.5">
                  <FileCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-sm">Step 2: Review & Confirm</p>
                  <p className="text-xs text-muted-foreground">Review all prices and add any notes</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg mt-0.5">
                  <Send className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="font-medium text-sm">Step 3: Submit</p>
                  <p className="text-xs text-muted-foreground">Submit your quotation - binding once submitted</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ============================================ */}
        {/* 2. PROGRESS INDICATOR */}
        {/* ============================================ */}
        <Card className="border-0 shadow-sm rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Completion Progress</span>
                <Badge className={cn(
                  "rounded-full",
                  hasAllPrices ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                )}>
                  {hasAllPrices ? 'All priced' : `${pricedItems}/${totalItems} priced`}
                </Badge>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">
                  Total: {totalAmount > 0 ? formatCurrency(totalAmount) : '—'}
                </span>
                <div className="w-32">
                  <Progress
                    value={progressPercentage}
                    className="h-2 rounded-full"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ============================================ */}
        {/* 3. ITEMS TABLE - READONLY EXCEPT PRICES */}
        {/* ============================================ */}
        <Card className="border-0 shadow-sm rounded-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-muted-foreground" />
                  Items & Pricing
                </CardTitle>
                <CardDescription>
                  Enter your prices for each item. Quantities and specifications are fixed.
                </CardDescription>
              </div>
              <Badge variant="outline" className="rounded-full">
                {items.length} items
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-xl overflow-hidden dark:border-gray-700 shadow-sm">
              <ScrollArea className="max-h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 dark:bg-gray-800/50">
                      <TableHead className="min-w-[180px]">Item</TableHead>
                      <TableHead className="min-w-[150px]">Description</TableHead>
                      <TableHead className="text-center w-[80px]">Qty</TableHead>
                      <TableHead className="text-center w-[100px]">Unit</TableHead>
                      <TableHead className="text-right w-[160px]">Your Unit Price ({CURRENCY})</TableHead>
                      <TableHead className="text-right w-[140px]">Total ({CURRENCY})</TableHead>
                      <TableHead className="min-w-[120px]">Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, index) => {
                      const total = item.quantity * item.unit_price;
                      const isPriced = item.unit_price > 0;

                      return (
                        <TableRow
                          key={index}
                          className={cn(
                            "hover:bg-muted/50 dark:hover:bg-gray-800/50 transition-colors",
                            !isPriced && "border-l-2 border-l-amber-400"
                          )}
                        >
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.item_name}</p>
                              {item.unit_of_measure && (
                                <p className="text-xs text-muted-foreground">
                                  Unit: {item.unit_of_measure}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm text-muted-foreground">
                              {item.description || '—'}
                            </p>
                          </TableCell>
                          <TableCell className="text-center font-medium">
                            <Badge variant="secondary" className="font-mono bg-transparent">
                              {item.quantity.toLocaleString()}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center text-sm text-muted-foreground">
                            {item.unit_of_measure || 'Unit'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Input
                                type="number"
                                value={item.unit_price || ''}
                                onChange={(e) => handlePriceChange(index, parseFloat(e.target.value) || 0)}
                                className={cn(
                                  "w-32 h-9 text-right rounded-xl",
                                  !isPriced && "border-amber-300 dark:border-amber-700 focus-visible:ring-amber-500"
                                )}
                                min={0}
                                step={0.01}
                                placeholder="0.00"
                              />
                              {!isPriced && (
                                <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
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
                              placeholder="Item notes..."
                              value={item.notes || ''}
                              onChange={(e) => handleItemNoteChange(index, e.target.value)}
                              className="h-8 text-xs rounded-xl"
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                  <TableFooter>
                    <TableRow className="bg-muted/50 dark:bg-gray-800/50">
                      <TableCell colSpan={4} className="text-right font-bold text-base">
                        Total Quotation Amount
                      </TableCell>
                      <TableCell className="text-right font-bold text-lg text-emerald-600 dark:text-emerald-400">
                        {totalAmount > 0 ? formatCurrency(totalAmount) : '—'}
                      </TableCell>
                      <TableCell colSpan={2} />
                    </TableRow>
                  </TableFooter>
                </Table>
              </ScrollArea>
            </div>

            {/* Missing prices warning */}
            {!hasAllPrices && (
              <div className="mt-4 flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm bg-amber-50 dark:bg-amber-950/30 p-3 rounded-xl border border-amber-200 dark:border-amber-800/50">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                <span>Please enter prices for all items before submitting.</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ============================================ */}
        {/* 4. QUOTATION DETAILS */}
        {/* ============================================ */}
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
                <Input
                  id="validity-date"
                  type="date"
                  value={validityDate}
                  onChange={(e) => setValidityDate(e.target.value)}
                  className="rounded-xl"
                />
                <p className="text-xs text-muted-foreground">Date until which your quotation is valid</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="delivery-time">Delivery Time</Label>
                <Input
                  id="delivery-time"
                  placeholder="e.g., 30 days, 2 weeks, 5-7 business days"
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  className="rounded-xl"
                />
                <p className="text-xs text-muted-foreground">Expected delivery timeline after order</p>
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
                  className="rounded-xl"
                />
                <p className="text-xs text-muted-foreground">Your proposed payment terms</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ============================================ */}
        {/* 5. ADDITIONAL NOTES */}
        {/* ============================================ */}
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
              className="rounded-xl resize-none"
            />
          </CardContent>
        </Card>

        {/* ============================================ */}
        {/* 6. WARNING & ACTIONS */}
        {/* ============================================ */}
        <Card className="border-amber-200 dark:border-amber-800/50 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-xl shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-xl flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="text-sm text-amber-700 dark:text-amber-300">
                  <p className="font-medium">Important: Binding Submission</p>
                  <ul className="list-disc list-inside mt-1 space-y-0.5 text-xs text-amber-600 dark:text-amber-400/80">
                    <li>All prices are binding once submitted</li>
                    <li>You cannot modify your quotation after submission</li>
                    <li>Ensure delivery terms and timelines are accurate</li>
                    <li>Late submissions will not be accepted</li>
                  </ul>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={createQuotation.isPending || !hasAllPrices}
                  className={cn(
                    "rounded-xl px-8 gap-2",
                    hasAllPrices
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-600/20"
                      : "bg-gray-400 dark:bg-gray-600"
                  )}
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
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTemplate>
  );
}
