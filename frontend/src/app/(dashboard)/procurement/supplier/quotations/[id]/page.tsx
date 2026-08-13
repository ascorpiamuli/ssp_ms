// frontend/src/app/(dashboard)/procurement/supplier/quotations/[id]/page.tsx

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
  Send,
  Ban,
  FileCheck,
  Loader2,
  Calendar,
  DollarSign,
  TrendingUp,
  Award,
  Truck,
  CreditCard,
  FileSignature,
  MessageSquare,
  Info,
  Printer,
  Download,
  Share2,
  Check,
  AlertTriangle,
  Package,
  Users,
  Shield,
  CheckCircle2,
  Scale,
  BadgeCheck,
  Store,
  Phone,
  Mail as MailIcon,
  UserCheck,
  UserX,
  Timer,
  Receipt,
  Percent,
  Crown,
  Star,
  Zap,
  Sparkles,
  TrendingDown,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Copy,
  CalendarDays,
  Briefcase,
  Award as AwardIcon,
  Activity,
  Eye,
  Globe,
  Building,
  User,
  Clock3,
  FileJson,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow, differenceInDays } from 'date-fns';
import { PageTemplate } from '@/components/dashboard/PageTemplate';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Hooks
import { useSuppliers } from '@/hooks/useSuppliers';
import { useSupplierQuotation } from '@/hooks/useSupplierQuotation';

// Types
import type { SupplierQuotation, SupplierQuotationItem } from '@/types/supplierQuotation.types';

// Extended type for supplier data with all possible fields
interface ExtendedSupplier {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
  company_name?: string;
  display_name?: string;
  company_email?: string;
  company_phone?: string;
  company_logo_url?: string;
  company_logo?: string;
  status?: string;
  status_label?: string;
  category_label?: string;
  company_address?: string;
  company_website?: string;
  company_registration?: string;
  tax_id?: string;
  registration_date?: string;
  license_number?: string;
  contact_person_name?: string;
  contact_person_email?: string;
  contact_person_phone?: string;
  banking_summary?: string;
}

// Extended type for quotation with evaluation
interface ExtendedQuotation extends SupplierQuotation {
  evaluation?: {
    score: number;
    notes: string | null;
    evaluated_at: string | null;
    evaluated_by: string | null;
  };
  supplier?: ExtendedSupplier;
}

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

const formatDateFull = (date: string | Date | null): string => {
  if (!date) return 'N/A';
  try {
    return format(new Date(date), 'EEEE, dd MMMM yyyy');
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

const formatTime = (date: string | Date | null): string => {
  if (!date) return 'N/A';
  try {
    return format(new Date(date), 'HH:mm');
  } catch {
    return 'Invalid Date';
  }
};

const formatCurrency = (amount: number | string | null | undefined): string => {
  if (amount === null || amount === undefined) return '0.00';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '0.00';
  return num.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    pending: 'Pending',
    submitted: 'Submitted',
    evaluated: 'Evaluated',
    accepted: 'Accepted',
    rejected: 'Rejected',
    cancelled: 'Cancelled',
  };
  return labels[status] || status;
};

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    submitted: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    evaluated: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    accepted: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
    cancelled: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700',
  };
  return colors[status] || colors.pending;
};

const getStatusIcon = (status: string): React.ElementType => {
  const icons: Record<string, React.ElementType> = {
    pending: Clock,
    submitted: Send,
    evaluated: FileCheck,
    accepted: CheckCircle,
    rejected: XCircle,
    cancelled: Ban,
  };
  return icons[status] || Clock;
};

const getVerificationStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    pending: 'Pending Verification',
    verified: 'Verified',
    rejected: 'Verification Failed',
  };
  return labels[status] || status;
};

const getVerificationStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    verified: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };
  return colors[status] || colors.pending;
};

const getInitials = (name: string): string => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

// ============================================
// STATUS BADGE COMPONENTS
// ============================================

const StatusBadge = ({ status, size = 'default' }: { status: string; size?: 'sm' | 'default' | 'lg' }) => {
  const Icon = getStatusIcon(status);
  const colorClass = getStatusColor(status);
  const sizeClasses = {
    sm: 'text-xs px-3 py-1 gap-1.5',
    default: 'text-sm px-4 py-1.5 gap-2',
    lg: 'text-base px-5 py-2 gap-2.5',
  };

  return (
    <Badge className={cn("flex items-center font-medium rounded-full border-0", colorClass, sizeClasses[size])}>
      <Icon className={cn("flex-shrink-0", size === 'sm' ? 'h-3.5 w-3.5' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4')} />
      {getStatusLabel(status)}
    </Badge>
  );
};

const VerificationStatusBadge = ({ status }: { status: string }) => {
  const colorClass = getVerificationStatusColor(status);
  const Icon = status === 'verified' ? CheckCircle2 : status === 'rejected' ? XCircle : Clock;

  return (
    <Badge variant="outline" className={cn("flex items-center gap-2 rounded-full text-xs px-4 py-1.5", colorClass)}>
      <Icon className="h-3.5 w-3.5" />
      {getVerificationStatusLabel(status)}
    </Badge>
  );
};

// ============================================
// STAT CARD COMPONENT
// ============================================

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
  trend?: 'up' | 'down';
  trendValue?: string;
  className?: string;
}

const StatCard = ({ title, value, icon: Icon, description, trend, trendValue, className }: StatCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card
      className={cn(
        "border shadow-sm rounded-2xl transition-all duration-300 overflow-hidden",
        isHovered && "shadow-lg scale-[1.02]",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
            {trend && (
              <div className={cn(
                "flex items-center gap-1 text-xs font-medium",
                trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
              )}>
                {trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {trendValue}
              </div>
            )}
          </div>
          <div className={cn(
            "p-3 rounded-xl transition-all duration-300",
            isHovered && "scale-110 rotate-3"
          )}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================
// QUOTATION ITEMS TABLE
// ============================================

interface QuotationItemsTableProps {
  items: SupplierQuotationItem[];
  isRejected?: boolean;
}

const QuotationItemsTable = ({ items, isRejected = false }: QuotationItemsTableProps) => {
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-16">
        <Package className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
        <p className="text-muted-foreground">No items in this quotation</p>
      </div>
    );
  }

  const totalAmount = items.reduce((sum, item) => sum + (parseFloat(item.total_price as any) || 0), 0);
  const totalTax = items.reduce((sum, item) => sum + (parseFloat(item.tax_amount as any) || 0), 0);
  const totalDiscount = items.reduce((sum, item) => sum + (parseFloat(item.discount_amount as any) || 0), 0);
  const totalNet = items.reduce((sum, item) => sum + (parseFloat(item.net_price as any) || 0), 0);

  return (
    <div className={cn(
      "rounded-2xl overflow-hidden border",
      isRejected ? "border-red-200/50 dark:border-red-800/50 opacity-70" : "border dark:border-gray-700"
    )}>
      <ScrollArea className="w-full">
        <Table>
          <TableHeader>
            <TableRow className={cn(
              "bg-muted/50 dark:bg-gray-800/50",
              isRejected && "bg-red-50/50 dark:bg-red-900/10"
            )}>
              <TableHead className="w-[60px] py-4">#</TableHead>
              <TableHead className="min-w-[220px] py-4">Item Name</TableHead>
              <TableHead className="text-right py-4">Quantity</TableHead>
              <TableHead className="text-right py-4">Unit Price</TableHead>
              <TableHead className="text-right py-4">Tax</TableHead>
              <TableHead className="text-right py-4">Discount</TableHead>
              <TableHead className="text-right py-4">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => (
              <TableRow key={item.id} className={cn(
                "hover:bg-muted/50 dark:hover:bg-gray-800/50 transition-colors",
                isRejected && "hover:bg-red-50/30 dark:hover:bg-red-900/5"
              )}>
                <TableCell className="font-mono text-sm text-muted-foreground py-4">
                  {index + 1}
                </TableCell>
                <TableCell className="py-4">
                  <div className={cn(isRejected && "line-through")}>
                    <p className="font-medium text-base">{item.item_name}</p>
                    {item.description && (
                      <p className="text-sm text-muted-foreground truncate max-w-[300px] mt-1">
                        {item.description}
                      </p>
                    )}
                    {item.brand && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Brand: {item.brand} {item.model && `• ${item.model}`}
                      </p>
                    )}
                    {item.is_alternative && (
                      <Badge variant="outline" className="text-xs mt-2 border-amber-200 text-amber-700 dark:border-amber-800 dark:text-amber-400">
                        Alternative
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className={cn("text-right py-4", isRejected && "line-through")}>
                  <div className="text-sm font-medium">
                    {item.quantity}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {item.unit_of_measure || 'Units'}
                  </div>
                </TableCell>
                <TableCell className={cn("text-right py-4", isRejected && "line-through")}>
                  <div className="text-sm font-medium">
                    KES {formatCurrency(item.unit_price)}
                  </div>
                </TableCell>
                <TableCell className="text-right py-4">
                  <div className={cn("flex flex-col", isRejected && "line-through")}>
                    <span className="text-sm">
                      {item.tax_rate || 0}%
                    </span>
                    <span className="text-xs text-muted-foreground">
                      KES {formatCurrency(item.tax_amount)}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right py-4">
                  <div className={cn("flex flex-col", isRejected && "line-through")}>
                    <span className="text-sm">
                      {item.discount_rate || 0}%
                    </span>
                    <span className="text-xs text-muted-foreground">
                      KES {formatCurrency(item.discount_amount)}
                    </span>
                  </div>
                </TableCell>
                <TableCell className={cn(
                  "text-right py-4",
                  isRejected ? "line-through text-muted-foreground" : "font-bold text-emerald-600 dark:text-emerald-400"
                )}>
                  <div className="text-base">
                    KES {formatCurrency(item.total_price)}
                  </div>
                  {item.delivery_days && (
                    <div className="text-xs text-muted-foreground">
                      Delivers in {item.delivery_days} days
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow className={cn(
              "bg-muted/30 dark:bg-gray-800/30",
              isRejected && "bg-red-50/30 dark:bg-red-900/5"
            )}>
              <TableCell colSpan={4} className="text-right font-medium py-3">
                Subtotal
              </TableCell>
              <TableCell colSpan={2} className="text-right font-medium py-3">
                KES {formatCurrency(totalAmount)}
              </TableCell>
            </TableRow>
            <TableRow className={cn(
              "bg-muted/30 dark:bg-gray-800/30",
              isRejected && "bg-red-50/30 dark:bg-red-900/5"
            )}>
              <TableCell colSpan={4} className="text-right font-medium text-muted-foreground py-3">
                Tax
              </TableCell>
              <TableCell colSpan={2} className="text-right font-medium py-3">
                KES {formatCurrency(totalTax)}
              </TableCell>
            </TableRow>
            <TableRow className={cn(
              "bg-muted/30 dark:bg-gray-800/30",
              isRejected && "bg-red-50/30 dark:bg-red-900/5"
            )}>
              <TableCell colSpan={4} className="text-right font-medium text-muted-foreground py-3">
                Discount
              </TableCell>
              <TableCell colSpan={2} className="text-right font-medium text-red-500 py-3">
                -KES {formatCurrency(totalDiscount)}
              </TableCell>
            </TableRow>
            <TableRow className={cn(
              "bg-primary/5 dark:bg-primary/10",
              isRejected && "bg-red-100/20 dark:bg-red-900/10"
            )}>
              <TableCell colSpan={4} className="text-right font-bold text-lg py-4">
                Total
              </TableCell>
              <TableCell colSpan={2} className={cn(
                "text-right font-bold text-lg py-4",
                isRejected ? "text-muted-foreground" : "text-emerald-600 dark:text-emerald-400"
              )}>
                KES {formatCurrency(totalNet)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </ScrollArea>
    </div>
  );
};

// ============================================
// MAIN PAGE
// ============================================

export default function SupplierQuotationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [activeTab, setActiveTab] = useState('overview');
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);

  // Get supplier profile
  const { useSupplierProfileExists } = useSuppliers();
  const { supplier } = useSupplierProfileExists();

  // Get quotation details
  const { data: quotationData, isLoading, error, refetch } = useSupplierQuotation(
    parseInt(id),
    {
      enabled: !!id && !isNaN(parseInt(id)),
    }
  );

  // Cast the data to our extended type
  const quotation = quotationData as ExtendedQuotation | undefined;

  useEffect(() => {
    if (quotation) {
      console.log('[QuotationDetail] Loaded:', {
        id: quotation.id,
        number: quotation.quotation_number,
        status: quotation.status,
        evaluation: quotation.evaluation,
      });
    }
  }, [quotation]);

  const handleBack = () => {
    router.push('/procurement/supplier/quotations');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleShare = () => {
    setShowShareDialog(true);
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/procurement/supplier/quotations/${quotation?.id}`;
    navigator.clipboard.writeText(url);
    setShowShareDialog(false);
  };

  const handleDownload = () => {
    setShowDownloadDialog(true);
  };

  const handleDownloadPDF = () => {
    window.print();
    setShowDownloadDialog(false);
  };

  const handleDownloadJSON = () => {
    if (quotation) {
      const dataStr = JSON.stringify(quotation, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      const exportFileDefaultName = `quotation-${quotation.quotation_number}.json`;
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    }
    setShowDownloadDialog(false);
  };

  // Calculate values
  const isRejected = quotation?.status === 'rejected' || quotation?.status === 'cancelled';
  const isAccepted = quotation?.status === 'accepted';
  const isPending = quotation?.status === 'pending' || quotation?.status === 'submitted';
  const totalItems = quotation?.items?.length || 0;
  const isValid = quotation?.is_valid;
  const isLowest = quotation?.is_lowest;

  // Get evaluation data safely with optional chaining
  const evaluationScore = quotation?.evaluation?.score || 0;
  const evaluationNotes = quotation?.evaluation?.notes || null;
  const evaluationDate = quotation?.evaluation?.evaluated_at || null;
  const evaluationBy = quotation?.evaluation?.evaluated_by || null;

  // Get supplier data safely with proper fallbacks
  const supplierData = quotation?.supplier || null;
  const supplierName = supplierData?.company_name || supplierData?.display_name || supplierData?.full_name || 'Unknown Supplier';
  const supplierEmail = supplierData?.company_email || supplierData?.email || null;
  const supplierPhone = supplierData?.company_phone || supplierData?.phone || null;
  const supplierLogo = supplierData?.company_logo_url || supplierData?.company_logo || null;

  const validityStatus = (() => {
    if (!quotation?.validity_date) return { text: 'No expiry', color: 'text-muted-foreground' };
    try {
      const now = new Date();
      const validity = new Date(quotation.validity_date);
      const daysRemaining = differenceInDays(validity, now);

      if (daysRemaining < 0) {
        return { text: 'Expired', color: 'text-red-500' };
      } else if (daysRemaining < 7) {
        return { text: `${daysRemaining} days remaining`, color: 'text-amber-500' };
      } else {
        return { text: `${daysRemaining} days remaining`, color: 'text-emerald-500' };
      }
    } catch {
      return { text: 'N/A', color: 'text-muted-foreground' };
    }
  })();

  // Loading state
  if (isLoading) {
    return (
      <PageTemplate
        title="Quotation Details"
        description="Loading quotation information..."
        icon={<FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />}
        background="gradient"
        variant="full"
        breadcrumbs={[
          { label: 'Procurement', href: '/procurement' },
          { label: 'Supplier', href: '/procurement/supplier' },
          { label: 'My Quotations', href: '/procurement/supplier/quotations' },
          { label: 'Details' },
        ]}
        actions={
          <Button variant="outline" size="sm" className="gap-2 h-9 rounded-xl" disabled>
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading...
          </Button>
        }
      >
        <div className="space-y-8">
          <Skeleton className="h-64 rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </PageTemplate>
    );
  }

  // Error state
  if (error || !quotation) {
    return (
      <PageTemplate
        title="Quotation Details"
        description="Error loading quotation"
        icon={<FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />}
        background="gradient"
        variant="full"
        breadcrumbs={[
          { label: 'Procurement', href: '/procurement' },
          { label: 'Supplier', href: '/procurement/supplier' },
          { label: 'My Quotations', href: '/procurement/supplier/quotations' },
          { label: 'Details' },
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="gap-2 h-9 rounded-xl"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        }
      >
        <Card className="border shadow-sm rounded-2xl">
          <CardContent className="text-center py-16">
            <div className="flex flex-col items-center">
              <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full mb-6">
                <AlertCircle className="h-12 w-12 text-red-500 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Failed to Load Quotation</h3>
              <p className="text-muted-foreground max-w-md mb-6">
                The quotation could not be loaded. Please try again or go back to the quotations list.
              </p>
              <div className="flex gap-4">
                <Button variant="outline" onClick={handleBack} className="gap-2 rounded-xl">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Quotations
                </Button>
                <Button onClick={handleRefresh} className="gap-2 rounded-xl">
                  <RefreshCw className="h-4 w-4" />
                  Retry
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title={`Quotation ${quotation.quotation_number}`}
      description={`Submitted on ${formatDateFull(quotation.submission_date)}`}
      icon={<FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />}
      background="gradient"
      variant="full"
      breadcrumbs={[
        { label: 'Procurement', href: '/procurement' },
        { label: 'Supplier', href: '/procurement/supplier' },
        { label: 'My Quotations', href: '/procurement/supplier/quotations' },
        { label: quotation.quotation_number || 'Details' },
      ]}
      actions={
        <div className="flex items-center gap-3 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBack}
            className="gap-2 h-10 rounded-xl"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="gap-2 h-10 rounded-xl"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="gap-2 h-10 rounded-xl"
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="gap-2 h-10 rounded-xl"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="gap-2 h-10 rounded-xl"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      }
    >
      <div className="space-y-8">
        {/* Alerts */}
        {isRejected && (
          <Alert className="rounded-2xl border-red-500/30 bg-red-50 dark:bg-red-950/20 shadow-sm p-6">
            <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            <AlertTitle className="text-red-800 dark:text-red-300 text-base font-semibold ml-3">
              Quotation Not Selected
            </AlertTitle>
            <AlertDescription className="text-red-700 dark:text-red-400 ml-3">
              This quotation was not selected by procurement. You can submit new quotations for future RFQs.
              {evaluationScore > 0 && (
                <span className="block mt-2">
                  <strong>Evaluation Score:</strong> {evaluationScore}%
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}

        {isAccepted && (
          <Alert className="rounded-2xl border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/20 shadow-sm p-6">
            <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            <AlertTitle className="text-emerald-800 dark:text-emerald-300 text-base font-semibold ml-3">
              🎉 Quotation Accepted!
            </AlertTitle>
            <AlertDescription className="text-emerald-700 dark:text-emerald-400 ml-3">
              Congratulations! Your quotation has been accepted by procurement.
              {isLowest && (
                <span className="block mt-2 font-medium">🏆 You submitted the lowest bid!</span>
              )}
            </AlertDescription>
          </Alert>
        )}

        {isPending && (
          <Alert className="rounded-2xl border-amber-500/30 bg-amber-50 dark:bg-amber-950/20 shadow-sm p-6">
            <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            <AlertTitle className="text-amber-800 dark:text-amber-300 text-base font-semibold ml-3">
              Under Review
            </AlertTitle>
            <AlertDescription className="text-amber-700 dark:text-amber-400 ml-3">
              Your quotation is being reviewed by procurement. You'll be notified once a decision is made.
            </AlertDescription>
          </Alert>
        )}

        {/* Header Card */}
        <Card className="border shadow-sm rounded-2xl overflow-hidden">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-2xl">
                  <FileText className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-2xl font-bold">{quotation.quotation_number}</h2>
                    <StatusBadge status={quotation.status} size="sm" />
                    <VerificationStatusBadge status={quotation.verification_status} />
                    {isLowest && (
                      <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 rounded-full px-4 py-1.5">
                        <Crown className="h-4 w-4 mr-1.5" />
                        Lowest Bid
                      </Badge>
                    )}
                    {isValid && !isRejected && (
                      <Badge variant="outline" className="border-emerald-200 text-emerald-700 dark:border-emerald-800 dark:text-emerald-400 rounded-full px-4 py-1.5">
                        <CheckCircle className="h-4 w-4 mr-1.5" />
                        Valid
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                    <span>RFQ: {quotation.quotation_request?.qtn_number || 'N/A'}</span>
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                    <span>{quotation.quotation_request?.title || 'No title'}</span>
                  </div>
                </div>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-950/30 p-6 rounded-2xl border border-emerald-200 dark:border-emerald-800/50">
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  KES {formatCurrency(quotation.total_amount)}
                </p>
                <p className="text-sm text-muted-foreground text-center">
                  {totalItems} item{totalItems > 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="p-4 bg-muted/30 dark:bg-muted/10 rounded-xl">
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Submitted
                </p>
                <p className="text-sm font-medium mt-1.5">{formatDate(quotation.submission_date)}</p>
                <p className="text-xs text-muted-foreground">{formatTime(quotation.submission_date)}</p>
              </div>
              <div className="p-4 bg-muted/30 dark:bg-muted/10 rounded-xl">
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Timer className="h-3.5 w-3.5" />
                  Validity
                </p>
                <p className={cn("text-sm font-medium mt-1.5", validityStatus.color)}>
                  {validityStatus.text}
                </p>
                <p className="text-xs text-muted-foreground">{formatDate(quotation.validity_date)}</p>
              </div>
              <div className="p-4 bg-muted/30 dark:bg-muted/10 rounded-xl">
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Scale className="h-3.5 w-3.5" />
                  Evaluation
                </p>
                {evaluationScore > 0 ? (
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                      {evaluationScore}%
                    </span>
                    <Progress value={evaluationScore} className="h-2 w-20 bg-purple-100 dark:bg-purple-950/30 [&>div]:bg-purple-500" />
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground mt-1.5">Not evaluated</p>
                )}
              </div>
              <div className="p-4 bg-muted/30 dark:bg-muted/10 rounded-xl">
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Package className="h-3.5 w-3.5" />
                  Submission
                </p>
                <p className="text-sm font-medium mt-1.5">
                  {quotation.submission_method_label || 'System'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards - Premium Design */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Total Amount Card */}
          <Card className="border shadow-lg rounded-2xl bg-white dark:bg-gray-900 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 dark:bg-emerald-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4 group-hover:bg-emerald-500/10 transition-colors duration-300" />
            <CardContent className="p-5 relative">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider truncate">
                      Total Amount
                    </p>
                  </div>
                  <div>
                    <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">
                      KES {formatCurrency(quotation.total_amount)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                      Net: KES {formatCurrency(quotation.net_amount)}
                    </p>
                  </div>
                </div>
                <div className="flex-shrink-0 ml-2">
                  <div className="h-10 w-10 rounded-full bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 transition-colors">
                    <TrendingUp className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items Card */}
          <Card className="border shadow-lg rounded-2xl bg-white dark:bg-gray-900 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 dark:bg-blue-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4 group-hover:bg-blue-500/10 transition-colors duration-300" />
            <CardContent className="p-5 relative">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider truncate">
                      Items
                    </p>
                  </div>
                  <div>
                    <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {totalItems}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                      {totalItems} item{totalItems > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="flex-shrink-0 ml-2">
                  <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                    <Package className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Evaluation Score Card */}
          <Card className="border shadow-lg rounded-2xl bg-white dark:bg-gray-900 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 dark:bg-purple-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4 group-hover:bg-purple-500/10 transition-colors duration-300" />
            <CardContent className="p-5 relative">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <Scale className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider truncate">
                      Evaluation Score
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {evaluationScore > 0 ? `${evaluationScore}%` : 'Pending'}
                      </p>
                      {evaluationScore > 0 && (
                        <Badge className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                          evaluationScore >= 80 ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300" :
                            evaluationScore >= 60 ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300" :
                              "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                        )}>
                          {evaluationScore >= 80 ? 'Excellent' : evaluationScore >= 60 ? 'Good' : 'Needs Work'}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                      {evaluationScore > 0 ? `Score: ${evaluationScore}%` : 'Not evaluated yet'}
                    </p>
                  </div>
                </div>
                <div className="flex-shrink-0 ml-2">
                  <div className="h-10 w-10 rounded-full bg-purple-50 dark:bg-purple-950/20 flex items-center justify-center group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 transition-colors">
                    {evaluationScore > 0 ? (
                      <Award className="h-4 w-4 text-purple-500 dark:text-purple-400" />
                    ) : (
                      <Clock className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Validity Card */}
          <Card className="border shadow-lg rounded-2xl bg-white dark:bg-gray-900 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 dark:bg-amber-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4 group-hover:bg-amber-500/10 transition-colors duration-300" />
            <CardContent className="p-5 relative">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <Calendar className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider truncate">
                      Validity
                    </p>
                  </div>
                  <div>
                    <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">
                      {quotation.validity_date ? formatDate(quotation.validity_date) : 'N/A'}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        isValid ? "bg-emerald-500 dark:bg-emerald-400" : "bg-red-500 dark:bg-red-400"
                      )} />
                      <p className={cn(
                        "text-xs font-medium truncate",
                        isValid ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                      )}>
                        {isValid ? 'Valid quotation' : 'Expired'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0 ml-2">
                  <div className="h-10 w-10 rounded-full bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center group-hover:bg-amber-100 dark:group-hover:bg-amber-900/30 transition-colors">
                    {isValid ? (
                      <CheckCircle className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500 dark:text-red-400" />
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-gray-100 dark:bg-gray-800/50 p-1 rounded-lg w-full flex-wrap h-auto border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
            <TabsTrigger
              value="overview"
              className="flex-1 gap-2 py-3 px-4 rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-gray-200 dark:data-[state=active]:border-gray-700 transition-all duration-200 font-medium text-gray-600 dark:text-gray-400 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
            >
              <FileText className="h-4 w-4 flex-shrink-0" />
              <span>Overview</span>
            </TabsTrigger>

            <TabsTrigger
              value="items"
              className="flex-1 gap-2 py-3 px-4 rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-gray-200 dark:data-[state=active]:border-gray-700 transition-all duration-200 font-medium text-gray-600 dark:text-gray-400 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
            >
              <Package className="h-4 w-4 flex-shrink-0" />
              <span>Items</span>
              <Badge className={cn(
                "ml-1.5 rounded-md text-[10px] px-2 py-0.5 font-semibold transition-all duration-200",
                activeTab === 'items'
                  ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
              )}>
                {totalItems}
              </Badge>
            </TabsTrigger>

            <TabsTrigger
              value="details"
              className="flex-1 gap-2 py-3 px-4 rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-gray-200 dark:data-[state=active]:border-gray-700 transition-all duration-200 font-medium text-gray-600 dark:text-gray-400 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
            >
              <Info className="h-4 w-4 flex-shrink-0" />
              <span>Details</span>
            </TabsTrigger>

            <TabsTrigger
              value="supplier"
              className="flex-1 gap-2 py-3 px-4 rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-gray-200 dark:data-[state=active]:border-gray-700 transition-all duration-200 font-medium text-gray-600 dark:text-gray-400 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
            >
              <Building2 className="h-4 w-4 flex-shrink-0" />
              <span>Supplier</span>
            </TabsTrigger>
          </TabsList>
          {/* Overview Tab - Premium Design with Enhanced Visibility */}
          <TabsContent value="overview" className="space-y-8">
            {/* Financial Summary & Terms Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Financial Summary Card - Premium with High Contrast */}
              <Card className="border shadow-xl rounded-3xl bg-gradient-to-br from-white via-emerald-50/40 to-white dark:from-gray-900 dark:via-emerald-950/20 dark:to-gray-900 backdrop-blur-sm overflow-hidden relative">
                {/* Decorative elements - lighter for visibility */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-400/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />

                <CardHeader className="pb-2 relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg shadow-emerald-500/30">
                        <Receipt className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                          Financial Summary
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground mt-0.5">
                          Cost breakdown and totals
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 rounded-full px-3 py-1 text-[10px] font-medium">
                      <DollarSign className="h-3 w-3 mr-1" />
                      {quotation.currency || 'KES'}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 relative">
                  {/* Total Amount - Highlighted with better contrast */}
                  <div className="flex justify-between items-center p-4 bg-emerald-50/80 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800/50">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                      Total Amount
                    </span>
                    <span className="text-lg font-extrabold text-emerald-700 dark:text-emerald-300">
                      KES {formatCurrency(quotation.total_amount)}
                    </span>
                  </div>

                  {/* Tax and Discount - With icons and better contrast */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex justify-between items-center p-3 bg-blue-50/80 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800/50">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                        <Percent className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
                        Tax
                      </span>
                      <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                        KES {formatCurrency(quotation.tax_amount)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-rose-50/80 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-800/50">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                        <TrendingDown className="h-3.5 w-3.5 text-rose-500 dark:text-rose-400" />
                        Discount
                      </span>
                      <span className="text-sm font-semibold text-rose-700 dark:text-rose-300">
                        -KES {formatCurrency(quotation.discount_amount)}
                      </span>
                    </div>
                  </div>

                  {/* Net Amount - Featured with strong contrast */}
                  <div className="flex justify-between items-center p-4 bg-emerald-100/60 dark:bg-emerald-900/30 rounded-2xl border-2 border-emerald-300 dark:border-emerald-700 shadow-inner">
                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      Net Amount
                    </span>
                    <span className="text-2xl font-extrabold text-emerald-800 dark:text-emerald-200">
                      KES {formatCurrency(quotation.net_amount)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Terms & Conditions Card - Premium with High Contrast */}
              <Card className="border shadow-xl rounded-3xl bg-gradient-to-br from-white via-blue-50/40 to-white dark:from-gray-900 dark:via-blue-950/20 dark:to-gray-900 backdrop-blur-sm overflow-hidden relative">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />

                <CardHeader className="pb-2 relative">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/30">
                      <FileSignature className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-blue-700 dark:text-blue-300">
                        Terms & Conditions
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground mt-0.5">
                        Agreement terms and conditions
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 relative">
                  <div className="space-y-3">
                    {/* Delivery Terms */}
                    <div className="group p-4 bg-white/70 dark:bg-gray-800/40 rounded-2xl border border-blue-200/70 dark:border-blue-800/30 hover:border-blue-300 dark:hover:border-blue-700/50 transition-all duration-300 hover:shadow-md">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100/70 dark:bg-blue-900/30 rounded-xl group-hover:scale-105 transition-transform duration-300">
                          <Truck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Delivery Terms</p>
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mt-1 break-words">
                            {quotation.delivery_terms || (
                              <span className="text-gray-400 dark:text-gray-500 italic">Not specified</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Payment Terms */}
                    <div className="group p-4 bg-white/70 dark:bg-gray-800/40 rounded-2xl border border-indigo-200/70 dark:border-indigo-800/30 hover:border-indigo-300 dark:hover:border-indigo-700/50 transition-all duration-300 hover:shadow-md">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-indigo-100/70 dark:bg-indigo-900/30 rounded-xl group-hover:scale-105 transition-transform duration-300">
                          <CreditCard className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Payment Terms</p>
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mt-1 break-words">
                            {quotation.payment_terms || (
                              <span className="text-gray-400 dark:text-gray-500 italic">Not specified</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Warranty Terms */}
                    <div className="group p-4 bg-white/70 dark:bg-gray-800/40 rounded-2xl border border-purple-200/70 dark:border-purple-800/30 hover:border-purple-300 dark:hover:border-purple-700/50 transition-all duration-300 hover:shadow-md">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-purple-100/70 dark:bg-purple-900/30 rounded-xl group-hover:scale-105 transition-transform duration-300">
                          <Shield className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Warranty Terms</p>
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mt-1 break-words">
                            {quotation.warranty_terms || (
                              <span className="text-gray-400 dark:text-gray-500 italic">Not specified</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Notes Card - Premium with High Contrast */}
            {(quotation.notes || quotation.manual_entry_notes) && (
              <Card className="border shadow-xl rounded-3xl bg-gradient-to-br from-white via-amber-50/40 to-white dark:from-gray-900 dark:via-amber-950/20 dark:to-gray-900 backdrop-blur-sm overflow-hidden relative">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />

                <CardHeader className="pb-2 relative">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg shadow-amber-500/30">
                      <MessageSquare className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-amber-700 dark:text-amber-300">
                        Additional Notes
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground mt-0.5">
                        Important remarks and observations
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 relative">
                  {quotation.notes && (
                    <div className="flex items-start gap-3 p-4 bg-white/70 dark:bg-gray-800/40 rounded-2xl border border-amber-200/70 dark:border-amber-800/30">
                      <div className="p-1.5 bg-amber-100/70 dark:bg-amber-900/30 rounded-lg flex-shrink-0 mt-0.5">
                        <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{quotation.notes}</p>
                    </div>
                  )}
                  {quotation.manual_entry_notes && (
                    <div className="flex items-start gap-3 p-4 bg-white/70 dark:bg-gray-800/40 rounded-2xl border border-orange-200/70 dark:border-orange-800/30">
                      <div className="p-1.5 bg-orange-100/70 dark:bg-orange-900/30 rounded-lg flex-shrink-0 mt-0.5">
                        <FileText className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Manual Entry Notes</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{quotation.manual_entry_notes}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Evaluation Details - Ultra Premium with High Contrast */}
            {evaluationScore > 0 && (
              <Card className="border shadow-2xl rounded-3xl bg-gradient-to-br from-purple-50/60 via-white to-purple-50/40 dark:from-purple-950/30 dark:via-gray-900/50 dark:to-purple-950/20 backdrop-blur-sm overflow-hidden relative">
                {/* Animated decorative elements - lighter for visibility */}
                <div className="absolute top-0 right-0 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 animate-pulse" />
                <div className="absolute bottom-0 left-0 w-56 h-56 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

                <CardHeader className="pb-2 relative">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg shadow-purple-500/30 animate-pulse">
                        <AwardIcon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-bold text-purple-700 dark:text-purple-300">
                          Evaluation Score
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                          <BadgeCheck className="h-3 w-3 text-purple-500 dark:text-purple-400" />
                          Performance assessment by procurement team
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 rounded-full px-4 py-1.5 text-xs font-medium backdrop-blur-sm shadow-lg">
                        <Sparkles className="h-3 w-3 mr-1.5 text-purple-500 dark:text-purple-400 animate-pulse" />
                        Final Score
                      </Badge>
                      {evaluationDate && (
                        <Badge variant="outline" className="border-purple-300/50 dark:border-purple-700/30 bg-purple-50/50 dark:bg-purple-950/20 rounded-full px-3 py-1.5 text-[10px] font-medium text-gray-600 dark:text-gray-400">
                          <Calendar className="h-3 w-3 mr-1 text-purple-500 dark:text-purple-400" />
                          {formatDate(evaluationDate)}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="relative">
                  <div className="flex flex-col lg:flex-row items-center gap-8 p-4 lg:p-6">
                    {/* Circular Score - Ultra Premium with better visibility */}
                    <div className="relative group">
                      <div className="absolute -inset-6 bg-gradient-to-r from-purple-400/20 to-purple-600/20 rounded-full blur-3xl group-hover:blur-2xl transition-all duration-700 animate-pulse" />
                      <div className="relative w-36 h-36 flex-shrink-0">
                        <svg className="w-36 h-36 transform -rotate-90">
                          {/* Background circle - better contrast */}
                          <circle
                            className="text-purple-200 dark:text-purple-900/40"
                            strokeWidth="10"
                            stroke="currentColor"
                            fill="transparent"
                            r="62"
                            cx="72"
                            cy="72"
                          />
                          {/* Gradient progress circle */}
                          <defs>
                            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#8b5cf6" />
                              <stop offset="50%" stopColor="#7c3aed" />
                              <stop offset="100%" stopColor="#6d28d9" />
                            </linearGradient>
                            <filter id="glow">
                              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                              <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                              </feMerge>
                            </filter>
                          </defs>
                          <circle
                            className="text-purple-500"
                            strokeWidth="10"
                            strokeDasharray={389.558}
                            strokeDashoffset={389.558 - (389.558 * evaluationScore) / 100}
                            strokeLinecap="round"
                            stroke="url(#scoreGradient)"
                            fill="transparent"
                            r="62"
                            cx="72"
                            cy="72"
                            style={{ transition: 'stroke-dashoffset 1.5s ease-in-out' }}
                            filter="url(#glow)"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-4xl font-extrabold text-purple-800 dark:text-purple-200">
                            {evaluationScore}%
                          </span>
                          <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-0.5">
                            Score
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Evaluation Details - Ultra Premium with High Contrast */}
                    <div className="flex-1 space-y-5 w-full">
                      {/* Status Badge with animation - better contrast */}
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge className={cn(
                          "border-0 rounded-full px-6 py-2.5 text-sm font-semibold shadow-lg transition-all duration-300 hover:scale-105 cursor-default",
                          evaluationScore >= 80
                            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-emerald-500/30 hover:shadow-emerald-500/50'
                            : evaluationScore >= 60
                              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-amber-500/30 hover:shadow-amber-500/50'
                              : 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-red-500/30 hover:shadow-red-500/50'
                        )}>
                          {evaluationScore >= 80 ? (
                            <CheckCircle className="h-4 w-4 mr-2" />
                          ) : evaluationScore >= 60 ? (
                            <TrendingUp className="h-4 w-4 mr-2" />
                          ) : (
                            <AlertCircle className="h-4 w-4 mr-2" />
                          )}
                          {evaluationScore >= 80 ? '🌟 Excellent Performance' : evaluationScore >= 60 ? '👍 Good Performance' : '📈 Needs Improvement'}
                        </Badge>

                        {evaluationDate && (
                          <div className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100/80 dark:bg-gray-800/50 px-4 py-2 rounded-full backdrop-blur-sm border border-gray-200 dark:border-gray-700">
                            <Clock className="h-3.5 w-3.5 text-purple-500 dark:text-purple-400" />
                            <span>Evaluated {formatDistanceToNow(new Date(evaluationDate), { addSuffix: true })}</span>
                          </div>
                        )}
                      </div>

                      {/* Evaluation Notes with icon */}
                      {evaluationNotes && (
                        <div className="flex items-start gap-4 p-4 bg-white/80 dark:bg-gray-800/50 rounded-2xl border border-purple-200/70 dark:border-purple-800/30 backdrop-blur-sm shadow-inner hover:shadow-md transition-shadow duration-300">
                          <div className="p-2 bg-purple-100/80 dark:bg-purple-900/30 rounded-xl flex-shrink-0">
                            <MessageSquare className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wider mb-1">Evaluation Notes</p>
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                              {evaluationNotes}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Evaluator info with avatar */}
                      {evaluationBy && (
                        <div className="flex items-center gap-4 p-3 bg-white/70 dark:bg-gray-800/40 rounded-2xl border border-purple-200/50 dark:border-purple-800/20">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20 ring-2 ring-purple-300/50 dark:ring-purple-700/50">
                              <User className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                {evaluationBy}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <BadgeCheck className="h-3 w-3 text-blue-500 dark:text-blue-400" />
                                Procurement Evaluator
                              </p>
                            </div>
                          </div>
                          <div className="flex-1" />
                          <div className="flex items-center gap-1.5 bg-emerald-50/80 dark:bg-emerald-950/30 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800/50">
                            <BadgeCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Verified</span>
                          </div>
                        </div>
                      )}

                      {/* Score breakdown bars - Premium with High Contrast */}
                      <div className="grid grid-cols-3 gap-3 pt-2">
                        <div className="group p-3 bg-white/80 dark:bg-gray-800/50 rounded-xl border border-purple-200/50 dark:border-purple-800/20 hover:border-purple-300 dark:hover:border-purple-700/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                          <div className="flex items-center justify-between mb-1.5">
                            <p className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Price</p>
                            <DollarSign className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div className="flex items-end justify-between">
                            <p className="text-lg font-extrabold text-emerald-700 dark:text-emerald-300">
                              {Math.round(evaluationScore * 0.4)}%
                            </p>
                            <div className="w-12 h-1.5 bg-emerald-200 dark:bg-emerald-900/30 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-1000"
                                style={{ width: `${Math.round(evaluationScore * 0.4)}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="group p-3 bg-white/80 dark:bg-gray-800/50 rounded-xl border border-purple-200/50 dark:border-purple-800/20 hover:border-purple-300 dark:hover:border-purple-700/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                          <div className="flex items-center justify-between mb-1.5">
                            <p className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Quality</p>
                            <Award className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex items-end justify-between">
                            <p className="text-lg font-extrabold text-blue-700 dark:text-blue-300">
                              {Math.round(evaluationScore * 0.35)}%
                            </p>
                            <div className="w-12 h-1.5 bg-blue-200 dark:bg-blue-900/30 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-1000"
                                style={{ width: `${Math.round(evaluationScore * 0.35)}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="group p-3 bg-white/80 dark:bg-gray-800/50 rounded-xl border border-purple-200/50 dark:border-purple-800/20 hover:border-purple-300 dark:hover:border-purple-700/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                          <div className="flex items-center justify-between mb-1.5">
                            <p className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Delivery</p>
                            <Truck className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div className="flex items-end justify-between">
                            <p className="text-lg font-extrabold text-purple-700 dark:text-purple-300">
                              {Math.round(evaluationScore * 0.25)}%
                            </p>
                            <div className="w-12 h-1.5 bg-purple-200 dark:bg-purple-900/30 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-1000"
                                style={{ width: `${Math.round(evaluationScore * 0.25)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          {/* Items Tab - Premium Design with Dark/Light Mode Compatibility */}
          <TabsContent value="items" className="space-y-6">
            <Card className="border shadow-xl rounded-3xl bg-white dark:bg-gray-900 overflow-hidden relative">
              {/* Decorative elements - subtle for both modes */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 dark:bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/5 dark:bg-indigo-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

              {/* Header with Enhanced Design */}
              <CardHeader className="pb-4 border-b border-gray-200 dark:border-gray-800 relative">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl shadow-lg shadow-blue-500/10 dark:shadow-blue-500/5">
                      <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        Quotation Items
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Detailed breakdown of all items in this quotation
                        </span>
                        {isRejected && (
                          <Badge variant="outline" className="border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 rounded-full px-3 py-0.5 text-[10px]">
                            <XCircle className="h-3 w-3 mr-1" />
                            Rejected
                          </Badge>
                        )}
                        {isAccepted && (
                          <Badge variant="outline" className="border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 rounded-full px-3 py-0.5 text-[10px]">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Accepted
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stats Badges */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full px-4 py-2 shadow-sm">
                      <Package className="h-3.5 w-3.5 mr-1.5" />
                      {totalItems} Items
                    </Badge>
                    {quotation.total_amount && (
                      <Badge variant="outline" className="border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 rounded-full px-4 py-2">
                        <DollarSign className="h-3.5 w-3.5 mr-1.5" />
                        Total: KES {formatCurrency(quotation.total_amount)}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              {/* Table Container with Enhanced Styling */}
              <CardContent className="p-0 relative">
                {(!quotation.items || quotation.items.length === 0) ? (
                  /* Empty State - Premium */
                  <div className="flex flex-col items-center justify-center py-20 px-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-blue-400/10 dark:bg-blue-400/5 rounded-full blur-3xl animate-pulse" />
                      <div className="relative p-6 bg-blue-50 dark:bg-blue-950/20 rounded-full mb-6">
                        <Package className="h-16 w-16 text-blue-400 dark:text-blue-500" />
                      </div>
                    </div>
                    <h4 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No Items Found</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md text-center">
                      This quotation doesn't have any items listed. Items may have been removed or the quotation is still being drafted.
                    </p>
                  </div>
                ) : (
                  /* Table with Premium Styling */
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50 dark:bg-gray-800/50 hover:bg-transparent border-b-2 border-gray-200 dark:border-gray-800">
                          <TableHead className="w-[60px] py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                            #
                          </TableHead>
                          <TableHead className="min-w-[220px] py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                            <div className="flex items-center gap-2">
                              <Package className="h-3.5 w-3.5" />
                              Item Name
                            </div>
                          </TableHead>
                          <TableHead className="text-right py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                            <div className="flex items-center justify-end gap-2">
                              <Scale className="h-3.5 w-3.5" />
                              Quantity
                            </div>
                          </TableHead>
                          <TableHead className="text-right py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                            <div className="flex items-center justify-end gap-2">
                              <DollarSign className="h-3.5 w-3.5" />
                              Unit Price
                            </div>
                          </TableHead>
                          <TableHead className="text-right py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                            <div className="flex items-center justify-end gap-2">
                              <Percent className="h-3.5 w-3.5" />
                              Tax
                            </div>
                          </TableHead>
                          <TableHead className="text-right py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                            <div className="flex items-center justify-end gap-2">
                              <TrendingDown className="h-3.5 w-3.5" />
                              Discount
                            </div>
                          </TableHead>
                          <TableHead className="text-right py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                            <div className="flex items-center justify-end gap-2">
                              <Receipt className="h-3.5 w-3.5" />
                              Total
                            </div>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {quotation.items.map((item, index) => (
                          <TableRow
                            key={item.id}
                            className={cn(
                              "group transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800/50",
                              isRejected && "opacity-70 hover:opacity-90",
                              index % 2 === 0 ? "bg-white dark:bg-gray-900/50" : "bg-transparent"
                            )}
                          >
                            <TableCell className="font-mono text-sm font-semibold text-gray-400 dark:text-gray-500 py-4">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
                                {index + 1}
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              <div className={cn(isRejected && "line-through decoration-red-400/50 dark:decoration-red-400/30")}>
                                <div className="flex items-start gap-3">
                                  <div className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors flex-shrink-0">
                                    <Package className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900 dark:text-gray-100 text-base">
                                      {item.item_name}
                                    </p>
                                    {item.description && (
                                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[300px] mt-0.5">
                                        {item.description}
                                      </p>
                                    )}
                                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                      {item.brand && (
                                        <Badge variant="outline" className="text-[10px] border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 rounded-full px-2.5 py-0.5">
                                          Brand: {item.brand}
                                        </Badge>
                                      )}
                                      {item.model && (
                                        <Badge variant="outline" className="text-[10px] border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-full px-2.5 py-0.5">
                                          Model: {item.model}
                                        </Badge>
                                      )}
                                      {item.is_alternative && (
                                        <Badge className="text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 rounded-full px-2.5 py-0.5">
                                          <AlertCircle className="h-3 w-3 mr-0.5" />
                                          Alternative
                                        </Badge>
                                      )}
                                      {item.delivery_days && (
                                        <Badge variant="outline" className="text-[10px] border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 rounded-full px-2.5 py-0.5">
                                          <Truck className="h-3 w-3 mr-0.5" />
                                          {item.delivery_days} days
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-right py-4">
                              <div className={cn(isRejected && "line-through decoration-red-400/50 dark:decoration-red-400/30")}>
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800">
                                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                    {item.quantity}
                                  </span>
                                  <span className="text-xs text-gray-600 dark:text-gray-400">
                                    {item.unit_of_measure || 'Units'}
                                  </span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-right py-4">
                              <div className={cn(isRejected && "line-through decoration-red-400/50 dark:decoration-red-400/30")}>
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  KES {formatCurrency(item.unit_price)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right py-4">
                              <div className="flex flex-col items-end">
                                <Badge variant="outline" className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 rounded-full px-2.5 py-0.5 text-xs">
                                  {item.tax_rate || 0}%
                                </Badge>
                                <span className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                                  KES {formatCurrency(item.tax_amount)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right py-4">
                              <div className="flex flex-col items-end">
                                <Badge variant="outline" className="border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/30 rounded-full px-2.5 py-0.5 text-xs">
                                  {item.discount_rate || 0}%
                                </Badge>
                                <span className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                                  -KES {formatCurrency(item.discount_amount)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right py-4">
                              <div className={cn(
                                "inline-flex items-center gap-2 px-4 py-2 rounded-xl",
                                isRejected
                                  ? "bg-gray-50 dark:bg-gray-800/30"
                                  : "bg-emerald-50 dark:bg-emerald-950/30 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30"
                              )}>
                                <span className={cn(
                                  "text-base font-bold",
                                  isRejected
                                    ? "text-gray-400 dark:text-gray-500 line-through"
                                    : "text-emerald-700 dark:text-emerald-300"
                                )}>
                                  KES {formatCurrency(item.total_price)}
                                </span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>

                      {/* Premium Footer with Summary */}
                      <TableFooter>
                        {(() => {
                          const totalAmount = quotation.items.reduce((sum, item) => sum + (parseFloat(item.total_price as any) || 0), 0);
                          const totalTax = quotation.items.reduce((sum, item) => sum + (parseFloat(item.tax_amount as any) || 0), 0);
                          const totalDiscount = quotation.items.reduce((sum, item) => sum + (parseFloat(item.discount_amount as any) || 0), 0);
                          const totalNet = quotation.items.reduce((sum, item) => sum + (parseFloat(item.net_price as any) || 0), 0);

                          return (
                            <>
                              <TableRow className="bg-gray-50 dark:bg-gray-800/50 border-t-2 border-gray-200 dark:border-gray-800">
                                <TableCell colSpan={4} className="text-right font-semibold text-gray-700 dark:text-gray-300 py-4">
                                  Subtotal
                                </TableCell>
                                <TableCell colSpan={3} className="text-right font-bold text-gray-900 dark:text-gray-100 py-4">
                                  KES {formatCurrency(totalAmount)}
                                </TableCell>
                              </TableRow>
                              <TableRow className="bg-gray-50/50 dark:bg-gray-800/30">
                                <TableCell colSpan={4} className="text-right text-sm text-gray-600 dark:text-gray-400 py-3">
                                  <div className="flex items-center justify-end gap-2">
                                    <Percent className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                                    Tax
                                  </div>
                                </TableCell>
                                <TableCell colSpan={3} className="text-right font-medium text-blue-700 dark:text-blue-300 py-3">
                                  KES {formatCurrency(totalTax)}
                                </TableCell>
                              </TableRow>
                              <TableRow className="bg-gray-50/50 dark:bg-gray-800/30">
                                <TableCell colSpan={4} className="text-right text-sm text-gray-600 dark:text-gray-400 py-3">
                                  <div className="flex items-center justify-end gap-2">
                                    <TrendingDown className="h-4 w-4 text-rose-500 dark:text-rose-400" />
                                    Discount
                                  </div>
                                </TableCell>
                                <TableCell colSpan={3} className="text-right font-medium text-rose-700 dark:text-rose-300 py-3">
                                  -KES {formatCurrency(totalDiscount)}
                                </TableCell>
                              </TableRow>
                              <TableRow className="bg-emerald-50 dark:bg-emerald-950/20 border-t-2 border-emerald-200 dark:border-emerald-800/50">
                                <TableCell colSpan={4} className="text-right py-5">
                                  <div className="flex items-center justify-end gap-3">
                                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                                      <Receipt className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                      Total
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell colSpan={3} className="text-right py-5">
                                  <div className="flex flex-col items-end">
                                    <span className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-300">
                                      KES {formatCurrency(totalNet)}
                                    </span>
                                    <span className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                                      Net Amount
                                    </span>
                                  </div>
                                </TableCell>
                              </TableRow>
                            </>
                          );
                        })()}
                      </TableFooter>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Details Tab - Premium Design with Dark/Light Mode Compatibility */}
          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quotation Information Card */}
              <Card className="border shadow-xl rounded-3xl bg-white dark:bg-gray-900 overflow-hidden relative">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 dark:bg-blue-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/5 dark:bg-indigo-500/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />

                <CardHeader className="pb-2 relative">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-2xl shadow-lg shadow-blue-500/10 dark:shadow-blue-500/5">
                      <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        Quotation Information
                      </CardTitle>
                      <CardDescription className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                        Key details and dates
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-1 relative">
                  {/* Quotation Number */}
                  <div className="group flex justify-between items-center p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                        <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                      </div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Quotation Number</span>
                    </div>
                    <span className="text-sm font-mono font-semibold text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-lg">
                      {quotation.quotation_number}
                    </span>
                  </div>

                  {/* Supplier Reference */}
                  <div className="group flex justify-between items-center p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 transition-colors">
                        <Building2 className="h-4 w-4 text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                      </div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Supplier Reference</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {quotation.supplier_reference_no || (
                        <span className="text-gray-400 dark:text-gray-500 italic">N/A</span>
                      )}
                    </span>
                  </div>

                  {/* Submission Date */}
                  <div className="group flex justify-between items-center p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 transition-colors">
                        <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                      </div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Submission Date</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {formatDateTime(quotation.submission_date)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {formatDistanceToNow(new Date(quotation.submission_date), { addSuffix: true })}
                      </div>
                    </div>
                  </div>

                  {/* Validity Date */}
                  <div className="group flex justify-between items-center p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/30 transition-colors">
                        <Timer className="h-4 w-4 text-gray-500 dark:text-gray-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors" />
                      </div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Validity Date</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {formatDateTime(quotation.validity_date)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {(() => {
                          try {
                            const now = new Date();
                            const validity = new Date(quotation.validity_date);
                            const daysRemaining = differenceInDays(validity, now);
                            if (daysRemaining < 0) {
                              return <span className="text-red-500 dark:text-red-400">Expired</span>;
                            } else if (daysRemaining < 7) {
                              return <span className="text-amber-500 dark:text-amber-400">{daysRemaining} days remaining</span>;
                            } else {
                              return <span className="text-emerald-500 dark:text-emerald-400">{daysRemaining} days remaining</span>;
                            }
                          } catch {
                            return null;
                          }
                        })()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Verification & Evaluation Card */}
              <Card className="border shadow-xl rounded-3xl bg-white dark:bg-gray-900 overflow-hidden relative">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/5 dark:bg-purple-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-violet-500/5 dark:bg-violet-500/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />

                <CardHeader className="pb-2 relative">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 rounded-2xl shadow-lg shadow-purple-500/10 dark:shadow-purple-500/5">
                      <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        Verification & Evaluation
                      </CardTitle>
                      <CardDescription className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                        Status and assessment details
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-1 relative">
                  {/* Verification Status */}
                  <div className="group flex justify-between items-center p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 transition-colors">
                        <BadgeCheck className="h-4 w-4 text-gray-500 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
                      </div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Verification Status</span>
                    </div>
                    <VerificationStatusBadge status={quotation.verification_status} />
                  </div>

                  {/* Verification Notes */}
                  {quotation.verification_notes && (
                    <div className="group flex justify-between items-center p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                          <MessageSquare className="h-4 w-4 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                        </div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Verification Notes</span>
                      </div>
                      <span className="text-sm text-gray-900 dark:text-gray-100 max-w-[200px] text-right truncate">
                        {quotation.verification_notes}
                      </span>
                    </div>
                  )}

                  {/* Evaluation Score */}
                  <div className="group flex justify-between items-center p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 transition-colors">
                        <Scale className="h-4 w-4 text-gray-500 dark:text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                      </div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Evaluation Score</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {evaluationScore > 0 ? (
                        <>
                          <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all duration-1000",
                                evaluationScore >= 80 ? "bg-emerald-500 dark:bg-emerald-400" :
                                  evaluationScore >= 60 ? "bg-amber-500 dark:bg-amber-400" :
                                    "bg-red-500 dark:bg-red-400"
                              )}
                              style={{ width: `${Math.min(evaluationScore, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm font-bold text-gray-900 dark:text-gray-100 min-w-[45px] text-right">
                            {evaluationScore}%
                          </span>
                        </>
                      ) : (
                        <span className="text-sm text-gray-400 dark:text-gray-500 italic">N/A</span>
                      )}
                    </div>
                  </div>

                  {/* Evaluated At */}
                  {evaluationDate && (
                    <div className="group flex justify-between items-center p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 transition-colors">
                          <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
                        </div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Evaluated At</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {formatDateTime(evaluationDate)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {formatDistanceToNow(new Date(evaluationDate), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Evaluation Notes */}
                  {evaluationNotes && (
                    <div className="group flex justify-between items-start p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/30 transition-colors mt-0.5">
                          <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors" />
                        </div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Evaluation Notes</span>
                      </div>
                      <span className="text-sm text-gray-900 dark:text-gray-100 max-w-[200px] text-right leading-relaxed">
                        {evaluationNotes}
                      </span>
                    </div>
                  )}

                  {/* Empty state for no evaluation */}
                  {evaluationScore === 0 && !evaluationDate && !evaluationNotes && (
                    <div className="flex flex-col items-center justify-center py-8 px-4">
                      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-full mb-4">
                        <Clock className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                        No evaluation data available yet
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-1">
                        The quotation will be evaluated during the review process
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          {/* Supplier Tab - Premium Design with Dark/Light Mode Compatibility */}
          <TabsContent value="supplier" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Supplier Profile Card - Spans 2 columns */}
              <Card className="lg:col-span-2 border shadow-xl rounded-3xl bg-white dark:bg-gray-900 overflow-hidden relative">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 dark:bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/5 dark:bg-indigo-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

                <CardHeader className="pb-2 relative">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-2xl shadow-lg shadow-blue-500/10 dark:shadow-blue-500/5">
                      <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        Supplier Profile
                      </CardTitle>
                      <CardDescription className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                        Company information and contact details
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="relative">
                  {/* Supplier Header with Avatar */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl border border-gray-200 dark:border-gray-800">
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <Avatar className="h-20 w-20 rounded-2xl shadow-lg ring-2 ring-blue-100 dark:ring-blue-900/30 group-hover:ring-blue-300 dark:group-hover:ring-blue-700 transition-all duration-300">
                        {supplierLogo ? (
                          <AvatarImage src={supplierLogo} alt={supplierName} />
                        ) : (
                          <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50 text-blue-700 dark:text-blue-300 text-2xl font-bold">
                            {getInitials(supplierName)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      {supplierData?.status === 'ACTIVE' && (
                        <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-gray-900 flex items-center justify-center">
                          <BadgeCheck className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                          {supplierName}
                        </h3>
                        {supplierData?.status === 'ACTIVE' && (
                          <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 rounded-full px-3 py-1 text-xs">
                            <BadgeCheck className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        )}
                        {supplierData?.status === 'INACTIVE' && (
                          <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 rounded-full px-3 py-1 text-xs">
                            <UserX className="h-3 w-3 mr-1" />
                            Inactive
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Supplier ID:</p>
                        <code className="text-sm font-mono font-semibold text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                          #{quotation.supplier_id}
                        </code>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      {supplierData?.company_website && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 rounded-xl border-gray-300 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-300 dark:hover:border-blue-700"
                          onClick={() => window.open(supplierData.company_website, '_blank')}
                        >
                          <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <span className="hidden sm:inline">Visit Website</span>
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 rounded-xl border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <MailIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        <span className="hidden sm:inline">Contact</span>
                      </Button>
                    </div>
                  </div>

                  {/* Contact Badges */}
                  <div className="flex flex-wrap gap-3 mt-4">
                    {supplierEmail && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors group">
                        <MailIcon className="h-4 w-4 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{supplierEmail}</span>
                      </div>
                    )}
                    {supplierPhone && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors group">
                        <Phone className="h-4 w-4 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{supplierPhone}</span>
                      </div>
                    )}
                    {supplierData?.category_label && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-950/20 rounded-xl border border-purple-200 dark:border-purple-800">
                        <Award className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        <span className="text-sm font-medium text-purple-700 dark:text-purple-300">{supplierData.category_label}</span>
                      </div>
                    )}
                  </div>

                  {/* Address & Website */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                    {supplierData?.company_address && (
                      <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-800">
                        <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
                          <Building className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Address</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">{supplierData.company_address}</p>
                        </div>
                      </div>
                    )}
                    {supplierData?.company_website && (
                      <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-800">
                        <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex-shrink-0">
                          <Globe className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Website</p>
                          <a
                            href={supplierData.company_website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 mt-0.5 truncate"
                          >
                            {supplierData.company_website}
                            <ExternalLink className="h-3 w-3 flex-shrink-0" />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator className="my-6" />

                  {/* Additional Supplier Details - Enhanced Grid */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <FileText className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      </div>
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Additional Information</h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {supplierData?.company_registration && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800 transition-colors group">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                              <FileCheck className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                            </div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Registration</p>
                          </div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{supplierData.company_registration}</p>
                        </div>
                      )}

                      {supplierData?.tax_id && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800 transition-colors group">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                              <Receipt className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                            </div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tax ID</p>
                          </div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{supplierData.tax_id}</p>
                        </div>
                      )}

                      {supplierData?.license_number && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800 transition-colors group">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                              <BadgeCheck className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                            </div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">License</p>
                          </div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{supplierData.license_number}</p>
                        </div>
                      )}

                      {supplierData?.registration_date && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800 transition-colors group">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                              <Calendar className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                            </div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Registered</p>
                          </div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{formatDate(supplierData.registration_date)}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Contact Person Section */}
                  {supplierData?.contact_person_name && (
                    <div className="mt-6 p-4 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/10 dark:to-purple-950/10 rounded-2xl border border-blue-200/50 dark:border-blue-800/30">
                      <div className="flex items-start gap-4">
                        <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                          <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Contact Person</h5>
                          <p className="text-base font-bold text-gray-900 dark:text-gray-100 mt-1">{supplierData.contact_person_name}</p>
                          <div className="flex flex-wrap gap-4 mt-2">
                            {supplierData.contact_person_email && (
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <MailIcon className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
                                <a href={`mailto:${supplierData.contact_person_email}`} className="hover:text-blue-600 dark:hover:text-blue-300 hover:underline">
                                  {supplierData.contact_person_email}
                                </a>
                              </div>
                            )}
                            {supplierData.contact_person_phone && (
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <Phone className="h-3.5 w-3.5 text-green-500 dark:text-green-400" />
                                <a href={`tel:${supplierData.contact_person_phone}`} className="hover:text-green-600 dark:hover:text-green-300 hover:underline">
                                  {supplierData.contact_person_phone}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Banking Summary */}
                  {supplierData?.banking_summary && (
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-gray-200 dark:border-gray-800">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-xl">
                          <CreditCard className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Banking Details</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{supplierData.banking_summary}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Supplier Stats Card */}
              <Card className="border shadow-xl rounded-3xl bg-white dark:bg-gray-900 overflow-hidden relative">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/5 dark:bg-purple-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-violet-500/5 dark:bg-violet-500/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />

                <CardHeader className="pb-2 relative">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 rounded-2xl shadow-lg shadow-purple-500/10 dark:shadow-purple-500/5">
                      <Activity className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        Supplier Stats
                      </CardTitle>
                      <CardDescription className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                        Performance metrics
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 relative">
                  {/* Supplier Since */}
                  <div className="group flex justify-between items-center p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                        <CalendarDays className="h-4 w-4 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                      </div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Supplier Since</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {quotation.created_at ? formatDate(quotation.created_at) : 'N/A'}
                    </span>
                  </div>

                  {/* Total Quotations */}
                  <div className="group flex justify-between items-center p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 transition-colors">
                        <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                      </div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Quotations</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100">--</span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">submitted</span>
                    </div>
                  </div>

                  {/* Acceptance Rate */}
                  <div className="group flex justify-between items-center p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 transition-colors">
                        <TrendingUp className="h-4 w-4 text-gray-500 dark:text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                      </div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Acceptance Rate</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full">
                        <div className="h-full bg-emerald-500 dark:bg-emerald-400 rounded-full" style={{ width: '0%' }} />
                      </div>
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100 min-w-[40px] text-right">--</span>
                    </div>
                  </div>

                  {/* Average Score */}
                  <div className="group flex justify-between items-center p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 transition-colors">
                        <Scale className="h-4 w-4 text-gray-500 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
                      </div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Score</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full">
                        <div className="h-full bg-purple-500 dark:bg-purple-400 rounded-full" style={{ width: '0%' }} />
                      </div>
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100 min-w-[40px] text-right">--</span>
                    </div>
                  </div>

                  {/* Rating Placeholder */}
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-gray-200 dark:border-gray-800 border-dashed">
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Star className="h-4 w-4 text-amber-400" />
                      <span>No data available yet</span>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-1">
                      Statistics will be available after evaluations
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Share Dialog */}
        <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle>Share Quotation</DialogTitle>
              <DialogDescription>
                Share this quotation with others via link or email.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center space-x-3">
              <div className="grid flex-1 gap-2">
                <Label htmlFor="link" className="sr-only">Link</Label>
                <Input
                  id="link"
                  defaultValue={`${window.location.origin}/procurement/supplier/quotations/${quotation.id}`}
                  readOnly
                  className="rounded-xl"
                />
              </div>
              <Button
                type="submit"
                size="sm"
                className="px-4 rounded-xl"
                onClick={handleCopyLink}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <DialogFooter className="sm:justify-start">
              <Button
                variant="outline"
                onClick={() => setShowShareDialog(false)}
                className="rounded-xl"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Download Dialog */}
        <Dialog open={showDownloadDialog} onOpenChange={setShowDownloadDialog}>
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle>Download Quotation</DialogTitle>
              <DialogDescription>
                Choose a format to download this quotation.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-6">
              <Button
                variant="outline"
                className="flex flex-col items-center gap-3 p-8 rounded-xl h-auto hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                onClick={handleDownloadPDF}
              >
                <FileText className="h-10 w-10 text-red-500" />
                <span className="font-medium">PDF</span>
                <span className="text-xs text-muted-foreground">Printable format</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col items-center gap-3 p-8 rounded-xl h-auto hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors"
                onClick={handleDownloadJSON}
              >
                <FileJson className="h-10 w-10 text-blue-500" />
                <span className="font-medium">JSON</span>
                <span className="text-xs text-muted-foreground">Machine-readable</span>
              </Button>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDownloadDialog(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTemplate>
  );
}
