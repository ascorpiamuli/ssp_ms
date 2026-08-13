// frontend/src/app/(dashboard)/procurement/request-for-quotations/[id]/edit/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Building2,
  User,
  Mail,
  Info,
  Layers,
  FileCheck,
  Sparkles,
  FileText,
  Package,
  DollarSign,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Send,
  Award,
  Shield,
  CreditCard,
  Crown,
  Edit,
  Bell,
  Save,
  RotateCcw,
} from 'lucide-react';

import { format } from 'date-fns';
import { useToast } from '@/components/ui/toast-context';
import { PageTemplate } from '@/components/dashboard/PageTemplate';

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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Hooks
import { useQuotation, useUpdateQuotation, useSendQuotation } from '@/hooks/useQuotation';

// Types
import type { QuotationRequest } from '@/types/quotations.types';

// ============================================
// HELPERS
// ============================================

const formatDate = (date: string | Date | null): string => {
  if (!date) return '';
  try {
    return format(new Date(date), 'yyyy-MM-dd');
  } catch {
    return '';
  }
};

const formatTime = (date: string | Date | null): string => {
  if (!date) return '17:00';
  try {
    return format(new Date(date), 'HH:mm');
  } catch {
    return '17:00';
  }
};

// ============================================
// STATUS BADGE
// ============================================

function StatusBadge({ status }: { status: string }) {
  const statusMap: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    draft: {
      label: 'Draft',
      color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700',
      icon: <Edit className="h-3 w-3" />
    },
    sent: {
      label: 'Sent',
      color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
      icon: <Send className="h-3 w-3" />
    },
    responded: {
      label: 'Responded',
      color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
      icon: <Users className="h-3 w-3" />
    },
    evaluating: {
      label: 'Evaluating',
      color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800',
      icon: <Clock className="h-3 w-3" />
    },
    closed: {
      label: 'Closed',
      color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
      icon: <CheckCircle className="h-3 w-3" />
    },
    cancelled: {
      label: 'Cancelled',
      color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
      icon: <XCircle className="h-3 w-3" />
    },
    expired: {
      label: 'Expired',
      color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
      icon: <AlertCircle className="h-3 w-3" />
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
// REQUISITION DETAILS CARD
// ============================================

interface RequisitionDetailsCardProps {
  requisition: any;
  isLoading: boolean;
}

function RequisitionDetailsCard({ requisition, isLoading }: RequisitionDetailsCardProps) {
  if (isLoading) {
    return (
      <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-950 rounded-xl">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Requisition Details</CardTitle>
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

  if (!requisition) {
    return (
      <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-950 rounded-xl">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">Requisition Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted/30 dark:bg-muted/20 flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">No Requisition Linked</p>
            <p className="text-xs text-muted-foreground/70 mt-1">This quotation is not linked to a requisition</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-950 rounded-xl">
      <CardHeader className="pb-3 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/10 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 dark:bg-primary/30 flex items-center justify-center">
              <FileCheck className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-sm font-medium">Requisition Details</CardTitle>
          </div>
          <StatusBadge status={requisition.status} />
        </div>
        <CardDescription className="text-xs flex items-center gap-2 mt-1">
          <span className="font-mono font-semibold text-foreground dark:text-gray-200">{requisition.reference_number}</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground bg-primary/5 dark:bg-primary/10 p-2.5 rounded-xl border border-primary/10 dark:border-primary/20">
            <User className="h-3.5 w-3.5 text-primary" />
            <span className="text-foreground dark:text-gray-200 truncate font-medium">{requisition.user?.full_name || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground bg-blue-500/5 dark:bg-blue-500/10 p-2.5 rounded-xl border border-blue-500/10 dark:border-blue-500/20">
            <Building2 className="h-3.5 w-3.5 text-blue-500" />
            <span className="text-foreground dark:text-gray-200 font-medium">{requisition.department?.name || 'N/A'}</span>
          </div>
        </div>

        <Separator className="dark:bg-gray-700" />

        <div>
          <p className="text-sm font-semibold text-foreground dark:text-gray-100">{requisition.title}</p>
          {requisition.description && (
            <p className="text-sm text-muted-foreground dark:text-gray-400 mt-1 leading-relaxed">{requisition.description}</p>
          )}
        </div>

        <Separator className="dark:bg-gray-700" />

        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground dark:text-gray-400 flex items-center gap-1.5">
            <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
            Financial Summary
          </p>
          <div className="bg-gradient-to-br from-primary/5 via-blue-500/5 to-emerald-500/5 dark:from-primary/10 dark:via-blue-500/10 dark:to-emerald-500/10 p-3 rounded-xl border border-primary/10 dark:border-primary/20">
            <div className="bg-white/50 dark:bg-black/20 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-800/50">
              <span className="text-xs text-muted-foreground dark:text-gray-400">Total Amount</span>
              <p className="font-bold text-base text-emerald-600 dark:text-emerald-400">KES {requisition.total_amount?.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>

        {requisition.items && requisition.items.length > 0 && (
          <>
            <Separator className="dark:bg-gray-700" />
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-muted-foreground dark:text-gray-400 flex items-center gap-1.5">
                  <Package className="h-3.5 w-3.5 text-primary" />
                  Items ({requisition.items.length})
                </p>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                {requisition.items.map((item: any, index: number) => (
                  <div key={index} className="bg-muted/5 dark:bg-muted/10 p-2 rounded-lg border border-border/30 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm text-foreground dark:text-gray-200">{item.item_name}</span>
                      <Badge variant="outline" className="text-xs bg-primary/5 dark:bg-primary/10 border-primary/20 dark:border-primary/30 rounded-full">
                        {item.quantity} {item.unit_of_measure}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground dark:text-gray-400">
                      <span>Unit: KES {item.estimated_unit_cost?.toLocaleString() || 0}</span>
                      <span className="font-medium text-foreground dark:text-gray-200">Total: KES {item.total_cost?.toLocaleString() || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================
// EDIT QUOTATION PAGE
// ============================================

export default function EditQuotationPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);
  const { success, error: toastError } = useToast();

  // Queries
  const { data: quotation, isLoading, refetch } = useQuotation(id, { enabled: !!id });

  // Mutations
  const updateQuotation = useUpdateQuotation();
  const sendQuotation = useSendQuotation();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    issue_date: '',
    closing_date: '',
    closing_time: '17:00',
    delivery_terms: '',
    payment_terms: '',
    special_conditions: '',
    instructions: '',
    is_automated: false,
    is_tender: false,
    reminder_days: 2,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);

  // Load quotation data when available
  useEffect(() => {
    if (quotation) {
      setFormData({
        title: quotation.title || '',
        description: quotation.description || '',
        issue_date: formatDate(quotation.issue_date),
        closing_date: formatDate(quotation.closing_date),
        closing_time: formatTime(quotation.closing_time),
        delivery_terms: quotation.delivery_terms || '',
        payment_terms: quotation.payment_terms || '',
        special_conditions: quotation.special_conditions || '',
        instructions: quotation.instructions || '',
        is_automated: quotation.is_automated || false,
        is_tender: quotation.is_tender || false,
        reminder_days: quotation.reminder_days || 2,
      });
    }
  }, [quotation]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!quotation) return;

    setIsSubmitting(true);

    try {
      const data = {
        title: formData.title,
        description: formData.description,
        issue_date: formData.issue_date,
        closing_date: formData.closing_date,
        closing_time: formData.closing_time,
        delivery_terms: formData.delivery_terms,
        payment_terms: formData.payment_terms,
        special_conditions: formData.special_conditions,
        instructions: formData.instructions,
        is_automated: formData.is_automated,
        is_tender: formData.is_tender,
        reminder_days: formData.reminder_days,
      };
      await updateQuotation.mutateAsync({ id: quotation.id, data });
      success('Quotation updated successfully!');
      router.push(`/procurement/request-for-quotations/${id}`);
    } catch (error) {
      // Error handled by hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSend = async () => {
    if (!quotation) return;

    try {
      // SendQuotationData only expects supplier_ids
      await sendQuotation.mutateAsync({
        id: quotation.id,
        data: { supplier_ids: [] }
      });
      success('Quotation sent successfully!');
      setShowSendDialog(false);
      router.push(`/procurement/request-for-quotations/${id}`);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleCancel = () => {
    router.push(`/procurement/request-for-quotations/${id}`);
  };

  const handleReset = () => {
    if (quotation) {
      setFormData({
        title: quotation.title || '',
        description: quotation.description || '',
        issue_date: formatDate(quotation.issue_date),
        closing_date: formatDate(quotation.closing_date),
        closing_time: formatTime(quotation.closing_time),
        delivery_terms: quotation.delivery_terms || '',
        payment_terms: quotation.payment_terms || '',
        special_conditions: quotation.special_conditions || '',
        instructions: quotation.instructions || '',
        is_automated: quotation.is_automated || false,
        is_tender: quotation.is_tender || false,
        reminder_days: quotation.reminder_days || 2,
      });
    }
  };

  // Get the requisition from the quotation
  const requisition = quotation?.requisition || null;

  // Only allow editing if status is draft
  const canEdit = quotation?.status === 'draft';
  const canSend = quotation?.status === 'draft';

  if (isLoading) {
    return (
      <PageTemplate
        title="Edit Quotation Request"
        description="Loading quotation details..."
        icon={<FileText className="h-5 w-5 text-blue-600" />}
        background="gradient"
        variant="default"
      >
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </PageTemplate>
    );
  }

  if (!quotation) {
    return (
      <PageTemplate
        title="Edit Quotation Request"
        description="Quotation not found"
        icon={<FileText className="h-5 w-5 text-blue-600" />}
        background="gradient"
        variant="default"
      >
        <Alert variant="destructive" className="rounded-xl">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Quotation Not Found</AlertTitle>
          <AlertDescription>
            The quotation request you're trying to edit doesn't exist or has been removed.
          </AlertDescription>
        </Alert>
        <Button onClick={handleCancel} className="mt-4 rounded-xl">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Quotation
        </Button>
      </PageTemplate>
    );
  }

  if (!canEdit) {
    return (
      <PageTemplate
        title="Edit Quotation Request"
        description="Quotation cannot be edited"
        icon={<FileText className="h-5 w-5 text-blue-600" />}
        background="gradient"
        variant="default"
      >
        <Alert variant="destructive" className="rounded-xl">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Cannot Edit</AlertTitle>
          <AlertDescription>
            This quotation has already been sent, closed, or cancelled. Only draft quotations can be edited.
          </AlertDescription>
        </Alert>
        <Button onClick={handleCancel} className="mt-4 rounded-xl">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Quotation
        </Button>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title={`Edit: ${quotation.qtn_number}`}
      description="Update the quotation request details"
      icon={<FileText className="h-5 w-5 text-blue-600" />}
      background="gradient"
      variant="default"
      breadcrumbs={[
        { label: 'Procurement', href: '/procurement' },
        { label: 'Request for Quotations', href: '/procurement/request-for-quotations' },
        { label: quotation.qtn_number, href: `/procurement/request-for-quotations/${id}` },
        { label: 'Edit' },
      ]}
      actions={
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={quotation.status} />
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="gap-2 h-9 rounded-xl dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            className="gap-2 h-9 rounded-xl dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Cancel
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-950 rounded-xl">
            <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/10 rounded-t-xl">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/20 dark:bg-primary/30 flex items-center justify-center">
                  <Edit className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-foreground dark:text-gray-100">Edit Quotation Details</CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    Update the quotation request details. All fields marked with <span className="text-red-500">*</span> are required.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {/* Requisition Info - Read Only */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground dark:text-gray-200 flex items-center gap-1">
                  Requisition <span className="text-blue-500 text-xs">(Read Only)</span>
                </Label>
                <div className="flex items-center gap-3 p-4 bg-muted/20 dark:bg-muted/10 rounded-xl border border-border/50 dark:border-gray-700">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-foreground dark:text-gray-200">{quotation.requisition?.reference_number || 'N/A'}</span>
                      <Badge className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full">
                        {quotation.requisition?.status || 'N/A'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground dark:text-gray-400">{quotation.requisition?.title || 'No title'}</p>
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-semibold text-foreground dark:text-gray-200">
                  Quotation Title <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter quotation title"
                    className="pl-10 h-11 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200 dark:placeholder:text-gray-500 rounded-xl"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-semibold text-foreground dark:text-gray-200">
                  Quotation Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter a detailed description of the quotation request..."
                  rows={3}
                  className="resize-none dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200 dark:placeholder:text-gray-500 rounded-xl"
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="issue_date" className="text-sm font-semibold text-foreground dark:text-gray-200">
                    Issue Date
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="issue_date"
                      type="date"
                      value={formData.issue_date}
                      onChange={(e) => handleInputChange('issue_date', e.target.value)}
                      className="pl-10 h-11 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200 rounded-xl"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="closing_date" className="text-sm font-semibold text-foreground dark:text-gray-200 flex items-center gap-1">
                    Closing Date <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="closing_date"
                      type="date"
                      value={formData.closing_date}
                      onChange={(e) => handleInputChange('closing_date', e.target.value)}
                      className="pl-10 h-11 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200 rounded-xl"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Closing Time & Reminder Days */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="closing_time" className="text-sm font-semibold text-foreground dark:text-gray-200">
                    Closing Time
                  </Label>
                  <div className="relative">
                    <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="closing_time"
                      type="time"
                      value={formData.closing_time}
                      onChange={(e) => handleInputChange('closing_time', e.target.value)}
                      className="pl-10 h-11 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200 rounded-xl"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reminder_days" className="text-sm font-semibold text-foreground dark:text-gray-200">
                    Reminder Days
                  </Label>
                  <div className="relative">
                    <Bell className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="reminder_days"
                      type="number"
                      min="1"
                      max="10"
                      value={formData.reminder_days}
                      onChange={(e) => handleInputChange('reminder_days', parseInt(e.target.value) || 2)}
                      className="pl-10 h-11 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* Terms */}
              <div className="space-y-2">
                <Label htmlFor="delivery_terms" className="text-sm font-semibold text-foreground dark:text-gray-200">
                  Delivery Terms
                </Label>
                <Textarea
                  id="delivery_terms"
                  value={formData.delivery_terms || ''}
                  onChange={(e) => handleInputChange('delivery_terms', e.target.value)}
                  placeholder="Enter delivery terms and conditions..."
                  rows={2}
                  className="resize-none dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200 dark:placeholder:text-gray-500 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment_terms" className="text-sm font-semibold text-foreground dark:text-gray-200">
                  Payment Terms
                </Label>
                <Textarea
                  id="payment_terms"
                  value={formData.payment_terms || ''}
                  onChange={(e) => handleInputChange('payment_terms', e.target.value)}
                  placeholder="Enter payment terms and conditions..."
                  rows={2}
                  className="resize-none dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200 dark:placeholder:text-gray-500 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="special_conditions" className="text-sm font-semibold text-foreground dark:text-gray-200">
                  Special Conditions
                </Label>
                <Textarea
                  id="special_conditions"
                  value={formData.special_conditions || ''}
                  onChange={(e) => handleInputChange('special_conditions', e.target.value)}
                  placeholder="Enter any special conditions..."
                  rows={2}
                  className="resize-none dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200 dark:placeholder:text-gray-500 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions" className="text-sm font-semibold text-foreground dark:text-gray-200">
                  Instructions for Suppliers
                </Label>
                <Textarea
                  id="instructions"
                  value={formData.instructions || ''}
                  onChange={(e) => handleInputChange('instructions', e.target.value)}
                  placeholder="Enter instructions for suppliers..."
                  rows={2}
                  className="resize-none dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200 dark:placeholder:text-gray-500 rounded-xl"
                />
              </div>

              {/* Options */}
              <div className="flex flex-wrap items-center gap-6 pt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_automated"
                    checked={formData.is_automated}
                    onCheckedChange={(checked) => handleInputChange('is_automated', checked as boolean)}
                    className="dark:border-gray-600 dark:data-[state=checked]:bg-primary rounded"
                  />
                  <Label htmlFor="is_automated" className="text-sm cursor-pointer text-foreground dark:text-gray-200">
                    Automated QTN
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_tender"
                    checked={formData.is_tender}
                    onCheckedChange={(checked) => handleInputChange('is_tender', checked as boolean)}
                    className="dark:border-gray-600 dark:data-[state=checked]:bg-primary rounded"
                  />
                  <Label htmlFor="is_tender" className="text-sm cursor-pointer text-foreground dark:text-gray-200">
                    Tender
                  </Label>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-end gap-2 border-t border-border/50 dark:border-gray-700 pt-4 bg-muted/5 dark:bg-muted/10 rounded-b-xl">
              <Button variant="outline" onClick={handleCancel} className="w-full sm:w-auto dark:border-gray-700 dark:hover:bg-gray-800 rounded-xl">
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-600/20 dark:shadow-blue-600/10 rounded-xl"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
              {canSend && (
                <Button
                  onClick={() => setShowSendDialog(true)}
                  className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-600/20 dark:shadow-emerald-600/10 rounded-xl"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Send to Suppliers
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>

        {/* Sidebar - Requisition Details */}
        <div className="lg:col-span-1">
          <RequisitionDetailsCard
            requisition={requisition}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Send Dialog */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent className="rounded-xl">
          <DialogHeader>
            <DialogTitle>Send RFQ to Suppliers</DialogTitle>
            <DialogDescription>
              Send "{quotation.qtn_number}" to selected suppliers.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSendDialog(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button onClick={handleSend} className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              <Send className="h-4 w-4 mr-2" />
              Send RFQ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTemplate>
  );
}
