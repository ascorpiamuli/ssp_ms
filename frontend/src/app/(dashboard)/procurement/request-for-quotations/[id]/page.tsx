// frontend/src/app/(dashboard)/procurement/request-for-quotations/[id]/page.tsx

'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Send,
  X,
  FileText,
  MoreVertical,
  RefreshCw,
  ShoppingCart,
  CheckCircle,
  TrendingUp,
  FileCheck,
  AlertCircle,
  Users,
  Mail,
  Ban,
  Download,
  Eye,
  Calendar,
  Clock,
  User,
  Building2,
  DollarSign,
  Package,
  Truck,
  Receipt,
  MessageSquare,
  Info,
  Award,
  Crown,
  CreditCard,
  Loader2,
  AlertTriangle,
  History,
  XCircle,
  Check,
  Search,
  TrendingDown,
  Scale,
  Wallet,
  ChevronRight,
  ExternalLink,
  Phone,
  MapPin,
  Globe,
  Building,
  Briefcase,
  Target,
  Rocket,
  Timer,
  BarChart3,
  ListChecks,
  ClipboardList,
  Calculator,
  BookOpen,
  Compass,
  ClipboardCheck,
  UserCog,
  Shield,
  FileSpreadsheet,
  Hourglass,
  RotateCcw,
  Construction,
  Wrench,
  HardHat,
  PenTool,
  Settings,
  Toolbox,
  CalendarDays,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { PageTemplate } from '@/components/dashboard/PageTemplate';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';

// Hooks
import { useAuthContext } from '@/contexts/AuthContext';
import {
  useQuotation,
  useSendQuotation,
  useCloseQuotation,
  useCancelQuotation,
  useSendQuotationReminder,
  useDownloadPDF,
  usePreviewPDF,
  useSharePDFViaEmail,
  useSelectSupplier,
} from '@/hooks/useQuotation';
import {
  useSupplierQuotationsByQtn,
  useVerifySupplierQuotation,
  useEvaluateSupplierQuotation,
} from '@/hooks/useSupplierQuotation';
import { useProcurementSummary } from '@/hooks/useProcurement';
import { useSuppliers } from '@/hooks/useSuppliers';

// Types
import type { QuotationRequest } from '@/types/quotations.types';
import type { SupplierQuotation } from '@/types/supplierQuotation.types';
import type { Supplier } from '@/services/supplier.service';
import type { Requisition } from '@/types/requisition.types';

// ============================================
// CONSTANTS
// ============================================

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  sent: 'Sent',
  responded: 'Responded',
  evaluating: 'Evaluating',
  closed: 'Closed',
  cancelled: 'Cancelled',
  expired: 'Expired',
};

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700',
  sent: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  responded: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
  evaluating: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800',
  closed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
  expired: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
};

const STATUS_ICONS: Record<string, any> = {
  draft: Edit,
  sent: Send,
  responded: Users,
  evaluating: Clock,
  closed: CheckCircle,
  cancelled: XCircle,
  expired: AlertCircle,
};

const VERIFICATION_ALLOWED_ROLES = ['ADMIN', 'ACCOUNTANT', 'FINANCE_ADMIN', 'PROCUREMENT'];

// Service category labels
const SERVICE_CATEGORY_LABELS: Record<string, string> = {
  consultancy: 'Consultancy Services',
  maintenance: 'Maintenance & Repair',
  training: 'Training & Development',
  installation: 'Installation Services',
  cleaning: 'Cleaning & Sanitation',
  security: 'Security Services',
  transport: 'Transport & Logistics',
  construction: 'Construction & Renovation',
  professional_services: 'Professional Services',
  it_services: 'IT Services',
  other: 'Other Services',
};

// ============================================
// HELPERS
// ============================================

const formatDate = (date: string | Date | number | null): string => {
  if (!date) return 'N/A';
  try {
    let dateObj: Date;
    if (typeof date === 'number') {
      const timestamp = date;
      if (timestamp.toString().length === 10) {
        dateObj = new Date(timestamp * 1000);
      } else {
        dateObj = new Date(timestamp);
      }
    } else if (typeof date === 'string') {
      const numDate = parseFloat(date);
      if (!isNaN(numDate) && date.match(/^\d+$/)) {
        if (numDate.toString().length === 10) {
          dateObj = new Date(numDate * 1000);
        } else {
          dateObj = new Date(numDate);
        }
      } else {
        dateObj = new Date(date);
      }
    } else {
      dateObj = new Date(date);
    }
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
    if (dateObj.getFullYear() < 2000) {
      return 'Invalid Date';
    }
    return format(dateObj, 'dd MMM yyyy');
  } catch {
    return 'Invalid Date';
  }
};

const formatDateTime = (date: string | Date | number | null): string => {
  if (!date) return 'N/A';
  try {
    let dateObj: Date;
    if (typeof date === 'number') {
      const timestamp = date;
      if (timestamp.toString().length === 10) {
        dateObj = new Date(timestamp * 1000);
      } else {
        dateObj = new Date(timestamp);
      }
    } else if (typeof date === 'string') {
      const numDate = parseFloat(date);
      if (!isNaN(numDate) && date.match(/^\d+$/)) {
        if (numDate.toString().length === 10) {
          dateObj = new Date(numDate * 1000);
        } else {
          dateObj = new Date(numDate);
        }
      } else {
        dateObj = new Date(date);
      }
    } else {
      dateObj = new Date(date);
    }
    if (isNaN(dateObj.getTime()) || dateObj.getFullYear() < 2000) {
      return 'Invalid Date';
    }
    return format(dateObj, 'dd MMM yyyy, HH:mm');
  } catch {
    return 'Invalid Date';
  }
};

const formatCurrency = (amount: number | string | null | undefined): string => {
  if (amount === null || amount === undefined) return 'KES 0.00';
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return 'KES 0.00';
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 2,
  }).format(numAmount);
};

const getStatusLabel = (status: string): string => {
  return STATUS_LABELS[status] || status;
};

const getInitials = (name: string | null | undefined): string => {
  if (!name) return '?';
  return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
};

const getFullName = (user: any): string => {
  if (!user) return 'Unknown';
  if (typeof user === 'string') return user;
  if (user.full_name) return user.full_name;
  if (user.first_name && user.last_name) return `${user.first_name} ${user.last_name}`;
  if (user.first_name) return user.first_name;
  if (user.name) return user.name;
  if (user.company_name) return user.company_name;
  return 'Unknown';
};

const getUserEmail = (user: any): string => {
  if (!user) return 'No email';
  if (typeof user === 'string') return user;
  if (user.email) return user.email;
  if (user.company_email) return user.company_email;
  return 'No email';
};

const getServiceCategoryLabel = (category: string | null): string => {
  if (!category) return 'N/A';
  return SERVICE_CATEGORY_LABELS[category] || category.replace(/_/g, ' ');
};

// ============================================
// COMPONENTS
// ============================================

const StatusBadge = ({ status, size = 'default' }: { status: string; size?: 'sm' | 'default' | 'lg' }) => {
  const Icon = STATUS_ICONS[status] || FileText;
  const colorClass = STATUS_COLORS[status] || STATUS_COLORS.draft;
  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 gap-1.5',
    default: 'text-sm px-3.5 py-1.5 gap-2',
    lg: 'text-base px-4.5 py-2 gap-2.5',
  };

  return (
    <span className={cn("inline-flex items-center font-medium rounded-full border", colorClass, sizeClasses[size])}>
      <Icon className={cn(
        "flex-shrink-0",
        size === 'sm' ? 'h-3.5 w-3.5' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'
      )} />
      {getStatusLabel(status)}
    </span>
  );
};

const InfoRow = ({
  icon: Icon,
  label,
  value,
  className,
  valueClassName,
  badge,
}: {
  icon: any;
  label: string;
  value: string | React.ReactNode;
  className?: string;
  valueClassName?: string;
  badge?: React.ReactNode;
}) => (
  <div className={cn("flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors", className)}>
    <div className="p-1.5 rounded-lg bg-primary/10 text-primary mt-0.5">
      <Icon className="h-4 w-4" />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
        {badge}
      </div>
      <div className={cn("text-base font-medium mt-0.5", valueClassName)}>{value || 'N/A'}</div>
    </div>
  </div>
);

const ExpandableText = ({ text, maxLines = 3 }: { text: string | null | undefined; maxLines?: number }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!text) return <p className="text-muted-foreground italic">No information provided</p>;

  const lines = text.split('\n') || [];
  const shouldTruncate = lines.length > maxLines || text.length > 300;

  return (
    <div className="space-y-2">
      <div className={cn(
        "text-base leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap",
        !isExpanded && "line-clamp-3"
      )}>
        {text}
      </div>
      {shouldTruncate && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-0 h-auto font-medium"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-1" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" />
              Read More
            </>
          )}
        </Button>
      )}
    </div>
  );
};

// ============================================
// SUPPLIER SELECTION COMPONENT
// ============================================

interface SupplierSelectionProps {
  suppliers: Supplier[];
  selectedIds: number[];
  onToggle: (id: number) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  isLoading?: boolean;
}

const SupplierSelection = ({
  suppliers,
  selectedIds,
  onToggle,
  onSelectAll,
  onDeselectAll,
  searchTerm,
  onSearchChange,
  isLoading = false,
}: SupplierSelectionProps) => {
  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.company_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contact_person_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    );
  }

  if (suppliers.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 dark:bg-gray-800/30 mb-4">
          <Users className="h-8 w-8 text-muted-foreground dark:text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold mb-1">No Suppliers Found</h3>
        <p className="text-muted-foreground dark:text-gray-400">Please add suppliers before sending this RFQ.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-gray-400" />
          <Input placeholder="Search suppliers..." value={searchTerm} onChange={(e) => onSearchChange(e.target.value)} className="pl-9 rounded-xl dark:bg-gray-800 dark:border-gray-700" />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onSelectAll} className="rounded-xl dark:border-gray-700 dark:text-gray-300"><Check className="h-4 w-4 mr-1.5" />All</Button>
          <Button variant="outline" size="sm" onClick={onDeselectAll} className="rounded-xl dark:border-gray-700 dark:text-gray-300"><X className="h-4 w-4 mr-1.5" />None</Button>
        </div>
      </div>
      <ScrollArea className="max-h-[350px] pr-4">
        <div className="space-y-2">
          {filteredSuppliers.map((supplier) => (
            <div
              key={supplier.id}
              className={cn(
                "flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer hover:bg-muted/50 dark:hover:bg-gray-800/50",
                selectedIds.includes(supplier.id) ? "border-blue-500 bg-blue-50/30 dark:bg-blue-950/20 dark:border-blue-700" : "border-border dark:border-gray-700"
              )}
              onClick={() => onToggle(supplier.id)}
            >
              <Checkbox checked={selectedIds.includes(supplier.id)} onCheckedChange={() => onToggle(supplier.id)} className="rounded-md h-4 w-4 dark:border-gray-600" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold dark:text-gray-200 truncate">{supplier.company_name || 'Unnamed Supplier'}</p>
                <div className="flex items-center gap-3 text-sm text-muted-foreground dark:text-gray-400">
                  <span>{supplier.company_email || 'No email'}</span>
                  {supplier.contact_person_name && <span>• Contact: {supplier.contact_person_name}</span>}
                </div>
              </div>
              <span className={cn("text-sm px-3 py-1 rounded-full border", supplier.is_blacklisted ? "border-red-200 text-red-600 dark:border-red-800 dark:text-red-400" : "border-emerald-200 text-emerald-600 dark:border-emerald-800 dark:text-emerald-400")}>
                {supplier.is_blacklisted ? 'Blacklisted' : 'Active'}
              </span>
            </div>
          ))}
          {filteredSuppliers.length === 0 && <div className="text-center py-4 text-muted-foreground dark:text-gray-400">No suppliers match your search</div>}
        </div>
      </ScrollArea>
      <div className="flex items-center justify-between pt-3 border-t dark:border-gray-700">
        <span className="text-sm text-muted-foreground dark:text-gray-400">{selectedIds.length} of {suppliers.length} suppliers selected</span>
        <span className="text-sm font-medium dark:text-gray-200">{selectedIds.length > 0 ? `${selectedIds.length} supplier${selectedIds.length > 1 ? 's' : ''} will receive this RFQ` : 'No suppliers selected'}</span>
      </div>
    </div>
  );
};

// ============================================
// MAIN PAGE
// ============================================

export default function RFQDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);
  const { user } = useAuthContext();

  // State
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [showReminderDialog, setShowReminderDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [comment, setComment] = useState('');
  const [shareEmail, setShareEmail] = useState('');
  const [selectedSupplierIds, setSelectedSupplierIds] = useState<number[]>([]);
  const [supplierSearchTerm, setSupplierSearchTerm] = useState('');

  // Hooks
  const { data: quotation, isLoading, refetch } = useQuotation(id, { enabled: !!id });
  const { data: supplierQuotations, isLoading: isLoadingQuotes } = useSupplierQuotationsByQtn(id, { enabled: !!id });
  const { data: procurementSummary, isLoading: isLoadingProcurement } = useProcurementSummary(
    quotation?.requisition_id || 0,
    { enabled: !!quotation?.requisition_id }
  );

  const suppliersHook = useSuppliers();
  const { data: allSuppliers, isLoading: isLoadingSuppliers } = suppliersHook.useAllSuppliers();

  // Mutations
  const sendQuotation = useSendQuotation();
  const closeQuotation = useCloseQuotation();
  const cancelQuotation = useCancelQuotation();
  const sendReminder = useSendQuotationReminder();
  const { mutate: downloadPDF, isPending: isDownloading } = useDownloadPDF();
  const { previewPDF } = usePreviewPDF();
  const { sharePDFViaEmail } = useSharePDFViaEmail();

  // User roles for permissions
  const userRoles = useMemo(() => {
    const roles: string[] = [];
    if (user?.role) roles.push(user.role.toUpperCase());
    if (user?.roles) {
      user.roles.forEach((r: any) => {
        const roleName = typeof r === 'string' ? r.toUpperCase() : r.name?.toUpperCase();
        if (roleName) roles.push(roleName);
      });
    }
    return roles;
  }, [user]);

  // Supplier map
  const supplierMap = useMemo(() => {
    const map = new Map<number, Supplier>();
    if (allSuppliers) allSuppliers.forEach(s => map.set(s.id, s));
    return map;
  }, [allSuppliers]);

  // Check if requisition is for services
  const isServiceRequisition = useMemo(() => {
    return quotation?.requisition?.requisition_type === 'services' ||
      quotation?.requisition?.procurement_type === 'services';
  }, [quotation]);

  // Get requisition data with null check
  const requisition = quotation?.requisition;

  // Navigation
  const handleBack = () => router.push('/procurement/request-for-quotations');
  const handleEdit = () => router.push(`/procurement/request-for-quotations/${id}/edit`);
  const handleRefresh = () => refetch();
  const handleDownload = () => downloadPDF({ id });
  const handlePreview = () => previewPDF(id);
  const handleShare = () => setShowShareDialog(true);

  const handleSendShareEmail = () => {
    if (!shareEmail.trim()) return;
    sharePDFViaEmail({
      id,
      email: shareEmail,
      subject: `QTN Document: ${quotation?.qtn_number}`,
      body: `Please find the QTN document for your review.\n\nQTN Number: ${quotation?.qtn_number}\nTitle: ${quotation?.title}\n\nRegards,\nProcurement Department`
    });
    setShowShareDialog(false);
    setShareEmail('');
  };

  const handleSend = () => {
    setSelectedSupplierIds([]);
    setSupplierSearchTerm('');
    setShowSendDialog(true);
    setComment('');
  };

  const handleToggleSupplier = (supplierId: number) => {
    setSelectedSupplierIds(prev => prev.includes(supplierId) ? prev.filter(id => id !== supplierId) : [...prev, supplierId]);
  };

  const handleSelectAllSuppliers = () => {
    if (allSuppliers) setSelectedSupplierIds(allSuppliers.map(s => s.id));
  };

  const handleDeselectAllSuppliers = () => setSelectedSupplierIds([]);

  const handleConfirmSend = () => {
    if (!quotation || selectedSupplierIds.length === 0) return;
    sendQuotation.mutate({ id: quotation.id, data: { supplier_ids: selectedSupplierIds } }, {
      onSuccess: () => { setShowSendDialog(false); setSelectedSupplierIds([]); refetch(); },
    });
  };

  const handleClose = () => { setShowCloseDialog(true); setComment(''); };
  const handleConfirmClose = () => {
    if (quotation) closeQuotation.mutate(quotation.id, { onSuccess: () => { setShowCloseDialog(false); refetch(); } });
  };

  const handleCancel = () => { setShowCancelDialog(true); setComment(''); };
  const handleConfirmCancel = () => {
    if (quotation) cancelQuotation.mutate({ id: quotation.id, data: { reason: comment || 'Cancelled by user' } }, {
      onSuccess: () => { setShowCancelDialog(false); refetch(); },
    });
  };

  const handleReminder = () => { setShowReminderDialog(true); setComment(''); };
  const handleConfirmReminder = () => {
    if (quotation) sendReminder.mutate(quotation.id, { onSuccess: () => { setShowReminderDialog(false); refetch(); } });
  };

  const handleDelete = () => setShowDeleteDialog(true);
  const handleConfirmDelete = () => { setShowDeleteDialog(false); router.push('/procurement/request-for-quotations'); };

  // Navigate to full bid comparison page
  const handleViewAllBids = () => {
    router.push(`/procurement/request-for-quotations/${id}/bids`);
  };

  // Navigate to requisition
  const handleViewRequisition = () => {
    if (requisition?.id) {
      router.push(`/requisitions/${requisition.id}`);
    }
  };

  const generatedByName = getFullName(quotation?.generated_by);
  const responseCount = quotation?.response_count || 0;
  const responseRate = quotation?.response_rate || 0;

  const canSend = quotation?.status === 'draft';
  const canEdit = quotation?.status === 'draft';
  const canClose = ['sent', 'responded', 'evaluating'].includes(quotation?.status || '');
  const canCancel = ['draft', 'sent', 'responded'].includes(quotation?.status || '');
  const canRemind = ['sent', 'responded'].includes(quotation?.status || '');
  const canShare = quotation?.status !== 'draft' && quotation?.status !== 'cancelled';
  const canDelete = quotation?.status === 'draft' || quotation?.status === 'cancelled';

  const filteredSuppliers = useMemo(() => {
    if (!allSuppliers) return [];
    return allSuppliers.filter(s => !s.is_blacklisted);
  }, [allSuppliers]);

  const estimatedTotal = useMemo(() => {
    if (!requisition?.items) return 0;
    return requisition.items.reduce((sum, item) => {
      const cost = typeof item.total_cost === 'string' ? parseFloat(item.total_cost) : Number(item.total_cost) || 0;
      return sum + cost;
    }, 0);
  }, [requisition]);

  const bestBid = useMemo(() => {
    if (!supplierQuotations || supplierQuotations.length === 0) return 0;
    return supplierQuotations.reduce((min, sq) => {
      const amount = parseFloat(sq.net_amount?.toString() || '0');
      return amount < min ? amount : min;
    }, Infinity);
  }, [supplierQuotations]);

  if (isLoading) {
    return (
      <PageTemplate
        title="Request for Quotation"
        description="Loading RFQ details..."
        icon={<FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
        background="gradient"
        variant="default"
      >
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 dark:text-blue-400" />
        </div>
      </PageTemplate>
    );
  }

  if (!quotation) {
    return (
      <PageTemplate
        title="Request for Quotation"
        description="RFQ not found"
        icon={<FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
        background="gradient"
        variant="default"
      >
        <Alert variant="destructive" className="rounded-2xl bg-white/60 dark:bg-gray-900/80 border border-red-200/50 dark:border-red-800/50 shadow-xl">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          <AlertTitle className="text-lg text-red-700 dark:text-red-300">RFQ Not Found</AlertTitle>
          <AlertDescription className="text-red-600 dark:text-red-400">
            The Request for Quotation you're looking for doesn't exist or has been removed.
          </AlertDescription>
        </Alert>
        <Button onClick={handleBack} className="mt-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-600/20">
          <ArrowLeft className="h-4 w-4 mr-2" />Back to RFQs
        </Button>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title={quotation.qtn_number}
      description={quotation.title}
      icon={<FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
      background="gradient"
      variant="default"
      breadcrumbs={[
        { label: 'Procurement', href: '/procurement' },
        { label: 'Request for Quotations', href: '/procurement/request-for-quotations' },
        { label: quotation.qtn_number },
      ]}
      actions={
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-1.5 h-9 rounded-xl border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleBack} className="gap-1.5 h-9 rounded-xl border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
            <ArrowLeft className="h-3.5 w-3.5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default" size="sm" className="gap-1.5 h-9 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/20 text-white">
                <MoreVertical className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-2xl bg-white/80 dark:bg-gray-900/90 border border-gray-200 dark:border-gray-700 shadow-2xl p-1">
              <DropdownMenuLabel className="text-sm font-semibold px-3 py-2 text-gray-700 dark:text-gray-200">Actions</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-200/50 dark:bg-gray-700/50" />
              {canEdit && (
                <DropdownMenuItem onClick={handleEdit} className="rounded-xl py-2 px-3 text-gray-700 dark:text-gray-300">
                  <Edit className="h-4 w-4 mr-3" />Edit RFQ
                </DropdownMenuItem>
              )}
              {canSend && (
                <DropdownMenuItem onClick={handleSend} className="text-blue-600 dark:text-blue-400 rounded-xl py-2 px-3">
                  <Send className="h-4 w-4 mr-3" />Send to Suppliers
                </DropdownMenuItem>
              )}
              {canRemind && (
                <DropdownMenuItem onClick={handleReminder} className="text-amber-600 dark:text-amber-400 rounded-xl py-2 px-3">
                  <Mail className="h-4 w-4 mr-3" />Send Reminder
                </DropdownMenuItem>
              )}
              {canClose && (
                <DropdownMenuItem onClick={handleClose} className="text-purple-600 dark:text-purple-400 rounded-xl py-2 px-3">
                  <CheckCircle className="h-4 w-4 mr-3" />Close RFQ
                </DropdownMenuItem>
              )}
              {canCancel && (
                <DropdownMenuItem onClick={handleCancel} className="text-red-600 dark:text-red-400 rounded-xl py-2 px-3">
                  <Ban className="h-4 w-4 mr-3" />Cancel RFQ
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator className="bg-gray-200/50 dark:bg-gray-700/50" />
              {canShare && (
                <>
                  <DropdownMenuItem onClick={handlePreview} className="rounded-xl py-2 px-3 text-gray-700 dark:text-gray-300">
                    <Eye className="h-4 w-4 mr-3" />Preview PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDownload} disabled={isDownloading} className="rounded-xl py-2 px-3 text-gray-700 dark:text-gray-300">
                    {isDownloading ? <Loader2 className="h-4 w-4 mr-3 animate-spin" /> : <Download className="h-4 w-4 mr-3" />}
                    {isDownloading ? 'Downloading...' : 'Download PDF'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleShare} className="rounded-xl py-2 px-3 text-gray-700 dark:text-gray-300">
                    <Mail className="h-4 w-4 mr-3" />Share via Email
                  </DropdownMenuItem>
                </>
              )}
              {canDelete && (
                <>
                  <DropdownMenuSeparator className="bg-gray-200/50 dark:bg-gray-700/50" />
                  <DropdownMenuItem onClick={handleDelete} className="text-red-600 dark:text-red-400 rounded-xl py-2 px-3">
                    <Trash2 className="h-4 w-4 mr-3" />Delete RFQ
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      }
    >
      {/* Main Content - No Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* RFQ Info Card */}
          <Card className="border shadow-lg rounded-2xl bg-white dark:bg-gray-900 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800">
                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{quotation.title}</h2>
                    <StatusBadge status={quotation.status} size="sm" />
                  </div>
                  {quotation.description && (
                    <ExpandableText text={quotation.description} maxLines={2} />
                  )}
                  <div className="flex items-center gap-4 mt-3 flex-wrap text-sm">
                    <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Created: {formatDate(quotation.created_at)}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Closing: {formatDate(quotation.closing_date)}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {responseCount} responses ({responseRate}%)
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Requisition Details with Service/Goods support */}
          {requisition && (
            <Card className="border shadow-lg rounded-2xl bg-white dark:bg-gray-900 overflow-hidden">
              <CardHeader className="pb-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                    <ClipboardList className="h-4 w-4 text-gray-500" />
                    {isServiceRequisition ? 'Service Requisition (LSO) Details' : 'Requisition (LPO) Details'}
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleViewRequisition}
                    className="rounded-xl border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <Eye className="h-3.5 w-3.5 mr-1.5" />
                    View Requisition
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {/* Basic Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Reference</p>
                    <p className="font-semibold font-mono text-sm text-gray-900 dark:text-white">
                      {requisition.reference_number}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{isServiceRequisition ? 'Service Category' : 'Category'}</p>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">
                      {isServiceRequisition
                        ? getServiceCategoryLabel(requisition.service_category || null)
                        : requisition.goods_category?.replace(/_/g, ' ') || 'N/A'
                      }
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Department</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {requisition.department?.name || 'N/A'}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                    <StatusBadge status={requisition.status} size="sm" />
                  </div>
                </div>

                {/* Service-Specific Details */}
                {isServiceRequisition && (
                  <div className="mt-4 space-y-3">
                    <Separator className="my-4" />
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-purple-500" />
                      Service Details
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {requisition.service_scope_of_work && (
                        <div className="col-span-2">
                          <InfoRow
                            icon={ClipboardList}
                            label="Scope of Work"
                            value={<ExpandableText text={requisition.service_scope_of_work} maxLines={2} />}
                          />
                        </div>
                      )}
                      {requisition.service_deliverables_expected && (
                        <div className="col-span-2">
                          <InfoRow
                            icon={Target}
                            label="Expected Deliverables"
                            value={<ExpandableText text={requisition.service_deliverables_expected} maxLines={2} />}
                          />
                        </div>
                      )}
                      {requisition.service_expected_start_date && (
                        <InfoRow
                          icon={Calendar}
                          label="Service Start Date"
                          value={formatDate(requisition.service_expected_start_date)}
                        />
                      )}
                      {requisition.service_expected_end_date && (
                        <InfoRow
                          icon={CalendarDays}
                          label="Service End Date"
                          value={formatDate(requisition.service_expected_end_date)}
                        />
                      )}
                      {requisition.service_estimated_duration_days && (
                        <InfoRow
                          icon={Timer}
                          label="Estimated Duration"
                          value={`${requisition.service_estimated_duration_days} days`}
                        />
                      )}
                      {requisition.service_requires_onsite_visit !== undefined && requisition.service_requires_onsite_visit !== null && (
                        <InfoRow
                          icon={MapPin}
                          label="Requires Onsite Visit"
                          value={requisition.service_requires_onsite_visit ? 'Yes' : 'No'}
                          valueClassName={requisition.service_requires_onsite_visit ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-muted-foreground"}
                        />
                      )}
                      {requisition.service_special_requirements && (
                        <div className="col-span-2">
                          <InfoRow
                            icon={AlertTriangle}
                            label="Special Requirements"
                            value={<ExpandableText text={requisition.service_special_requirements} maxLines={2} />}
                          />
                        </div>
                      )}
                      {requisition.service_qualifications_required && (
                        <div className="col-span-2">
                          <InfoRow
                            icon={UserCog}
                            label="Qualifications Required"
                            value={<ExpandableText text={requisition.service_qualifications_required} maxLines={2} />}
                          />
                        </div>
                      )}
                      {requisition.service_experience_required && (
                        <div className="col-span-2">
                          <InfoRow
                            icon={Award}
                            label="Experience Required"
                            value={<ExpandableText text={requisition.service_experience_required} maxLines={2} />}
                          />
                        </div>
                      )}
                      {requisition.service_certifications_required && (
                        <div className="col-span-2">
                          <InfoRow
                            icon={FileCheck}
                            label="Certifications Required"
                            value={<ExpandableText text={requisition.service_certifications_required} maxLines={2} />}
                          />
                        </div>
                      )}
                      {requisition.service_insurance_required !== undefined && requisition.service_insurance_required !== null && (
                        <InfoRow
                          icon={Shield}
                          label="Insurance Required"
                          value={requisition.service_insurance_required ? 'Yes' : 'No'}
                          valueClassName={requisition.service_insurance_required ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-muted-foreground"}
                        />
                      )}
                      {requisition.service_insurance_details && (
                        <div className="col-span-2">
                          <InfoRow
                            icon={Shield}
                            label="Insurance Details"
                            value={<ExpandableText text={requisition.service_insurance_details} maxLines={2} />}
                          />
                        </div>
                      )}
                      {requisition.service_contract_type && (
                        <InfoRow
                          icon={FileSpreadsheet}
                          label="Contract Type"
                          value={requisition.service_contract_type.replace(/_/g, ' ')}
                        />
                      )}
                      {requisition.service_contract_duration && (
                        <InfoRow
                          icon={Hourglass}
                          label="Contract Duration"
                          value={requisition.service_contract_duration}
                        />
                      )}
                      {requisition.service_renewal_options && (
                        <InfoRow
                          icon={RotateCcw}
                          label="Renewal Options"
                          value={requisition.service_renewal_options}
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* Goods-Specific Details */}
                {!isServiceRequisition && requisition.goods_category && (
                  <div className="mt-4 space-y-3">
                    <Separator className="my-4" />
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Package className="h-4 w-4 text-blue-500" />
                      Goods Details
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {requisition.goods_warehouse_location && (
                        <InfoRow
                          icon={MapPin}
                          label="Warehouse Location"
                          value={requisition.goods_warehouse_location}
                        />
                      )}
                      {requisition.goods_storage_requirements && (
                        <InfoRow
                          icon={Shield}
                          label="Storage Requirements"
                          value={requisition.goods_storage_requirements}
                        />
                      )}
                      {requisition.goods_expected_delivery_date && (
                        <InfoRow
                          icon={Truck}
                          label="Expected Delivery Date"
                          value={formatDate(requisition.goods_expected_delivery_date)}
                        />
                      )}
                      {requisition.goods_delivery_terms && (
                        <InfoRow
                          icon={FileCheck}
                          label="Delivery Terms"
                          value={requisition.goods_delivery_terms}
                        />
                      )}
                      {requisition.goods_warranty_required !== undefined && requisition.goods_warranty_required !== null && (
                        <InfoRow
                          icon={Shield}
                          label="Warranty Required"
                          value={requisition.goods_warranty_required ? 'Yes' : 'No'}
                          valueClassName={requisition.goods_warranty_required ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-muted-foreground"}
                        />
                      )}
                      {requisition.goods_warranty_period && (
                        <InfoRow
                          icon={Clock}
                          label="Warranty Period"
                          value={requisition.goods_warranty_period}
                        />
                      )}
                      {requisition.goods_specifications && (
                        <div className="col-span-2">
                          <InfoRow
                            icon={FileText}
                            label="Specifications"
                            value={<ExpandableText text={requisition.goods_specifications} maxLines={2} />}
                          />
                        </div>
                      )}
                      {requisition.goods_quality_requirements && (
                        <div className="col-span-2">
                          <InfoRow
                            icon={Award}
                            label="Quality Requirements"
                            value={<ExpandableText text={requisition.goods_quality_requirements} maxLines={2} />}
                          />
                        </div>
                      )}
                      {requisition.goods_installation_required !== undefined && requisition.goods_installation_required !== null && (
                        <InfoRow
                          icon={Construction}
                          label="Installation Required"
                          value={requisition.goods_installation_required ? 'Yes' : 'No'}
                          valueClassName={requisition.goods_installation_required ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-muted-foreground"}
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* Requisition Items Summary */}
                {requisition.items && requisition.items.length > 0 && (
                  <div className="mt-4">
                    <Separator className="my-4" />
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      {isServiceRequisition ? 'Service Items' : 'Requisition Items'} ({requisition.items.length})
                    </p>
                    <div className="space-y-2">
                      {requisition.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {item.item_name || item.service_name || `Item ${idx + 1}`}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {item.description || item.unit_of_measure || (isServiceRequisition ? 'Service' : 'Item')}
                            </p>
                          </div>
                          <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Qty: {parseFloat(item.quantity).toLocaleString()}
                            </span>
                            {!isServiceRequisition && (
                              <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                                {formatCurrency(item.total_cost)}
                              </span>
                            )}
                            {isServiceRequisition && (
                              <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                                Service Item
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Total Amount - Different for Services */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {isServiceRequisition ? 'Estimated Budget' : 'Total Amount'}
                    </span>
                    {isServiceRequisition ? (
                      <span className="text-base font-semibold text-amber-600 dark:text-amber-400">
                        {formatCurrency(estimatedTotal)} (Estimated)
                      </span>
                    ) : (
                      <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(requisition.total_amount)}
                      </span>
                    )}
                  </div>
                  {isServiceRequisition && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Final amount will be determined by supplier quotations
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Terms & Conditions */}
          {(quotation.delivery_terms || quotation.payment_terms || quotation.special_conditions) && (
            <Card className="border shadow-lg rounded-2xl bg-white dark:bg-gray-900 overflow-hidden">
              <CardHeader className="pb-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                  <BookOpen className="h-4 w-4 text-gray-500" />
                  Terms & Conditions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quotation.delivery_terms && (
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                      <Truck className="h-5 w-5 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Delivery Terms</p>
                        <p className="text-sm text-gray-900 dark:text-white">{quotation.delivery_terms}</p>
                      </div>
                    </div>
                  )}
                  {quotation.payment_terms && (
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                      <CreditCard className="h-5 w-5 text-emerald-500 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Payment Terms</p>
                        <p className="text-sm text-gray-900 dark:text-white">{quotation.payment_terms}</p>
                      </div>
                    </div>
                  )}
                  {quotation.special_conditions && (
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 md:col-span-2">
                      <AlertCircle className="h-5 w-5 text-amber-500 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Special Conditions</p>
                        <p className="text-sm text-gray-900 dark:text-white">{quotation.special_conditions}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* RFQ Status Card */}
          <Card className="border shadow-lg rounded-2xl bg-white dark:bg-gray-900 overflow-hidden">
            <CardHeader className="pb-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <CardTitle className="text-base font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                <Info className="h-4 w-4 text-gray-500" />
                RFQ Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between items-center p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <span className="text-sm text-gray-500 dark:text-gray-400">Status</span>
                <StatusBadge status={quotation.status} size="sm" />
              </div>
              <div className="flex justify-between items-center p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <span className="text-sm text-gray-500 dark:text-gray-400">Issue Date</span>
                <span className="font-semibold text-sm text-gray-900 dark:text-white">{formatDate(quotation.issue_date)}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <span className="text-sm text-gray-500 dark:text-gray-400">Closing Date</span>
                <span className="font-semibold text-sm text-gray-900 dark:text-white">{formatDate(quotation.closing_date)}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <span className="text-sm text-gray-500 dark:text-gray-400">Responses</span>
                <span className="font-semibold text-sm text-gray-900 dark:text-white">{responseCount} / {quotation.sent_to_suppliers?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <span className="text-sm text-gray-500 dark:text-gray-400">Response Rate</span>
                <span className="font-semibold text-sm text-gray-900 dark:text-white">{responseRate}%</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <span className="text-sm text-gray-500 dark:text-gray-400">Requisition Type</span>
                <Badge className={cn(
                  "rounded-full px-3 py-1",
                  isServiceRequisition
                    ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800"
                    : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                )}>
                  {isServiceRequisition ? 'Services (LSO)' : 'Goods (LPO)'}
                </Badge>
              </div>
              {bestBid > 0 && (
                <div className="flex justify-between items-center p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                  <span className="text-sm text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                    <Crown className="h-4 w-4" />
                    Best Bid
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(bestBid)}</span>
                </div>
              )}
              <div className="flex justify-between items-center p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <span className="text-sm text-gray-500 dark:text-gray-400">Budget</span>
                <span className="font-semibold text-sm text-amber-600 dark:text-amber-400">{formatCurrency(estimatedTotal)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Generated By */}
          <Card className="border shadow-lg rounded-2xl bg-white dark:bg-gray-900 overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 border border-gray-200 dark:border-gray-700">
                  <AvatarFallback className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-base font-semibold">
                    {getInitials(generatedByName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Generated By</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{generatedByName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{getUserEmail(quotation.generated_by)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border shadow-lg rounded-2xl bg-white dark:bg-gray-900 overflow-hidden">
            <CardHeader className="pb-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <CardTitle className="text-base font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                <Rocket className="h-4 w-4 text-gray-500" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              {/* View Bids Button */}
              {supplierQuotations && supplierQuotations.length > 0 && (
                <Button
                  className="w-full gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl h-11 shadow-lg shadow-emerald-600/20"
                  onClick={handleViewAllBids}
                >
                  <Scale className="h-4 w-4" />
                  View & Compare Supplier Bids
                  <Badge className="ml-auto bg-white/20 text-white border-0">
                    {supplierQuotations.length}
                  </Badge>
                </Button>
              )}

              {canSend && (
                <Button
                  className="w-full gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl h-11 shadow-lg shadow-blue-600/20"
                  onClick={handleSend}
                >
                  <Send className="h-4 w-4" />Send to Suppliers
                </Button>
              )}
              {canEdit && (
                <Button
                  className="w-full gap-2 rounded-xl h-11 border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  variant="outline"
                  onClick={handleEdit}
                >
                  <Edit className="h-4 w-4" />Edit RFQ
                </Button>
              )}
              {canRemind && (
                <Button
                  className="w-full gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl h-11 shadow-lg shadow-amber-600/20"
                  onClick={handleReminder}
                >
                  <Mail className="h-4 w-4" />Send Reminder
                </Button>
              )}
              {canClose && (
                <Button
                  className="w-full gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl h-11 shadow-lg shadow-purple-600/20"
                  onClick={handleClose}
                >
                  <CheckCircle className="h-4 w-4" />Close RFQ
                </Button>
              )}
              {canCancel && (
                <Button
                  className="w-full gap-2 rounded-xl h-11 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-lg shadow-red-600/20"
                  variant="destructive"
                  onClick={handleCancel}
                >
                  <Ban className="h-4 w-4" />Cancel RFQ
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl text-gray-900 dark:text-white">Delete RFQ</AlertDialogTitle>
            <AlertDialogDescription className="text-base text-gray-600 dark:text-gray-400">
              Are you sure you want to delete RFQ "{quotation.qtn_number}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl px-6 border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700 rounded-xl px-6">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent className="max-w-2xl rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl text-gray-900 dark:text-white">Send RFQ to Suppliers</DialogTitle>
            <DialogDescription className="text-base text-gray-600 dark:text-gray-400">
              Select suppliers to send "{quotation.qtn_number}" to.
              {selectedSupplierIds.length > 0 && (
                <span className="block mt-1 text-blue-600 dark:text-blue-400 font-medium">
                  {selectedSupplierIds.length} supplier{selectedSupplierIds.length > 1 ? 's' : ''} selected
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-3">
              <Label className="text-base text-gray-700 dark:text-gray-300">Select Suppliers</Label>
              <SupplierSelection
                suppliers={filteredSuppliers}
                selectedIds={selectedSupplierIds}
                onToggle={handleToggleSupplier}
                onSelectAll={handleSelectAllSuppliers}
                onDeselectAll={handleDeselectAllSuppliers}
                searchTerm={supplierSearchTerm}
                onSearchChange={setSupplierSearchTerm}
                isLoading={isLoadingSuppliers}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="send-comment" className="text-base text-gray-700 dark:text-gray-300">Comment (Optional)</Label>
              <Textarea
                id="send-comment"
                placeholder="Add any additional instructions for suppliers..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="rounded-xl resize-none bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSendDialog(false)} className="rounded-xl px-6 border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300">Cancel</Button>
            <Button
              onClick={handleConfirmSend}
              disabled={selectedSupplierIds.length === 0 || sendQuotation.isPending}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/20 px-6 text-white"
            >
              {sendQuotation.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending...</>
              ) : (
                <><Send className="h-4 w-4 mr-2" />Send to {selectedSupplierIds.length} Supplier{selectedSupplierIds.length > 1 ? 's' : ''}</>
              )}
            </Button>
          </DialogFooter>
          {selectedSupplierIds.length === 0 && (
            <p className="text-sm text-amber-500 dark:text-amber-400 text-center -mt-2">
              Please select at least one supplier to send this RFQ.
            </p>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
        <DialogContent className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl text-gray-900 dark:text-white">Close RFQ</DialogTitle>
            <DialogDescription className="text-base text-gray-600 dark:text-gray-400">Close "{quotation.qtn_number}" for further responses.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="close-comment" className="text-base text-gray-700 dark:text-gray-300">Closing Notes (Optional)</Label>
              <Textarea
                id="close-comment"
                placeholder="Add any closing notes..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="rounded-xl resize-none bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCloseDialog(false)} className="rounded-xl px-6 border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300">Cancel</Button>
            <Button onClick={handleConfirmClose} className="bg-purple-600 hover:bg-purple-700 rounded-xl px-6 shadow-lg shadow-purple-600/20 text-white">
              <CheckCircle className="h-4 w-4 mr-2" />Close RFQ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl text-gray-900 dark:text-white">Cancel RFQ</DialogTitle>
            <DialogDescription className="text-base text-gray-600 dark:text-gray-400">Cancel "{quotation.qtn_number}".</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cancel-reason" className="text-base text-gray-700 dark:text-gray-300">Reason for Cancellation <span className="text-red-500">*</span></Label>
              <Textarea
                id="cancel-reason"
                placeholder="Explain why you're cancelling this RFQ..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="rounded-xl resize-none bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)} className="rounded-xl px-6 border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300">Go Back</Button>
            <Button onClick={handleConfirmCancel} disabled={!comment.trim()} variant="destructive" className="rounded-xl px-6">
              Cancel RFQ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showReminderDialog} onOpenChange={setShowReminderDialog}>
        <DialogContent className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl text-gray-900 dark:text-white">Send Reminder</DialogTitle>
            <DialogDescription className="text-base text-gray-600 dark:text-gray-400">Send a reminder to suppliers for "{quotation.qtn_number}".</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reminder-comment" className="text-base text-gray-700 dark:text-gray-300">Reminder Message (Optional)</Label>
              <Textarea
                id="reminder-comment"
                placeholder="Add any additional message..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="rounded-xl resize-none bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReminderDialog(false)} className="rounded-xl px-6 border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300">Cancel</Button>
            <Button onClick={handleConfirmReminder} className="bg-amber-600 hover:bg-amber-700 rounded-xl px-6 shadow-lg shadow-amber-600/20 text-white">
              <Mail className="h-4 w-4 mr-2" />Send Reminder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl text-gray-900 dark:text-white">Share QTN via Email</DialogTitle>
            <DialogDescription className="text-base text-gray-600 dark:text-gray-400">Enter the email address to share this QTN document.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="email"
              placeholder="Enter email address"
              value={shareEmail}
              onChange={(e) => setShareEmail(e.target.value)}
              className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShareDialog(false)} className="rounded-xl px-6 border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300">Cancel</Button>
            <Button onClick={handleSendShareEmail} className="rounded-xl px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/20 text-white">
              <Mail className="h-4 w-4 mr-2" />Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTemplate>
  );
}
