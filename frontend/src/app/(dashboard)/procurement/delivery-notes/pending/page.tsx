// frontend/src/app/(dashboard)/procurement/delivery-notes/pending/page.tsx

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Eye,
  Check,
  X,
  AlertCircle,
  Info,
  Package,
  Calendar,
  Building2,
  FileText,
  Download,
  RefreshCw,
  Loader2,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileCheck,
  Send,
  Star,
  ThumbsUp,
  Scale,
  SlidersHorizontal,
  DollarSign,
  ChevronDown,
  Hash,
  Users,
  Briefcase,
  BadgeCheck,
  XCircle,
  Award,
  Filter,
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { PageTemplate } from '@/components/dashboard/PageTemplate';
import { useToast } from '@/components/ui/toast-context';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';

// Components
import StatsCards, { type StatCardItem } from '@/components/ui/stat-cards';
import { WrappedCornerTag } from '@/components/ui/wrapped-corner-tag';

// Hooks
import {
  usePendingGrns,
  usePendingSans,
  useApproveGrn,
  useRejectGrn,
  useApproveSan,
  useRejectSan,
} from '@/hooks/useGoodsReceived';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useAuthContext } from '@/contexts/AuthContext';

// Types
import type {
  GoodsReceivedNote,
  ServiceAcknowledgmentNote,
} from '@/types/goodsReceived.types';
import { Textarea } from '../../../../../components/ui/textarea';

// ============================================
// CONSTANTS
// ============================================

const ITEMS_PER_PAGE = 10;

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

const getUserName = (user: any): string => {
  if (!user) return 'System';
  if (typeof user === 'string') return user;
  if (typeof user === 'number') return `User ${user}`;
  if (typeof user === 'object') {
    if (user.full_name) return user.full_name;
    if (user.first_name || user.last_name) {
      return [user.first_name, user.last_name].filter(Boolean).join(' ');
    }
    if (user.name) return user.name;
    if (user.id) return `User ${user.id}`;
  }
  return 'System';
};

const getSupplierCompanyName = (supplier: any): string => {
  if (!supplier) return 'Unknown Supplier';
  if (typeof supplier === 'string') return supplier;
  if (supplier.company_name) return supplier.company_name;
  if (supplier.full_name) return supplier.full_name;
  if (supplier.name) return supplier.name;
  return 'Unknown Supplier';
};

const getStatusColor = (status: string): string => {
  const map: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700',
    submitted: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    hod_approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    principal_approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    completed: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 border-teal-200 dark:border-teal-800',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
  };
  return map[status] || map.draft;
};

const getStatusLabel = (status: string): string => {
  const map: Record<string, string> = {
    draft: 'Draft',
    submitted: 'Submitted',
    hod_approved: 'HOD Approved',
    principal_approved: 'Approved',
    completed: 'Completed',
    rejected: 'Rejected',
  };
  return map[status] || status;
};

const getStatusIcon = (status: string): React.ReactNode => {
  const map: Record<string, React.ReactNode> = {
    draft: <FileText className="h-4 w-4" />,
    submitted: <Clock className="h-4 w-4" />,
    hod_approved: <CheckCircle className="h-4 w-4" />,
    principal_approved: <BadgeCheck className="h-4 w-4" />,
    completed: <Award className="h-4 w-4" />,
    rejected: <XCircle className="h-4 w-4" />,
  };
  return map[status] || <FileText className="h-4 w-4" />;
};

const getDepartmentName = (item: any): string => {
  const dept = item.department || item.requisition?.department || null;
  return dept?.name || 'N/A';
};

const getDepartmentId = (item: any): number | null => {
  const dept = item.department || item.requisition?.department || null;
  return dept?.id || item.requisition?.department_id || null;
};

// ============================================
// COMPONENTS
// ============================================

const StatusBadge = ({ status }: { status: string }) => {
  const color = getStatusColor(status);
  const label = getStatusLabel(status);
  const icon = getStatusIcon(status);

  return (
    <Badge className={cn("px-3 py-1.5 font-medium rounded-full text-sm border flex items-center gap-1.5", color)}>
      {icon}
      {label}
    </Badge>
  );
};

// ============================================
// MAIN PAGE
// ============================================

export default function PendingApprovalsPage() {
  const router = useRouter();
  const { success, error } = useToast();

  // Auth context for role checking
  const { isHOD, isPrincipal, isAdmin, isAccountant, user } = useAuthContext();

  // State
  const [filters, setFilters] = useState<{
    search?: string;
    type?: 'all' | 'grn' | 'san';
    department?: string;
  }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedType, setSelectedType] = useState<'grn' | 'san'>('grn');
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [approvalComment, setApprovalComment] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  // Hooks
  const {
    data: pendingGrnsResponse,
    isLoading: isLoadingGrns,
    refetch: refetchGrns,
  } = usePendingGrns();

  const {
    data: pendingSansResponse,
    isLoading: isLoadingSans,
    refetch: refetchSans,
  } = usePendingSans();

  // Suppliers hook
  const { useAllSuppliers } = useSuppliers();
  const { data: suppliersData, isLoading: isLoadingSuppliers } = useAllSuppliers();

  // Mutations
  const approveGrn = useApproveGrn();
  const rejectGrn = useRejectGrn();
  const approveSan = useApproveSan();
  const rejectSan = useRejectSan();

  // Build supplier map
  const suppliersMap = useMemo(() => {
    const map = new Map<number, any>();
    if (Array.isArray(suppliersData)) {
      suppliersData.forEach((supplier: any) => {
        if (supplier?.id) {
          map.set(supplier.id, supplier);
        }
      });
    }
    return map;
  }, [suppliersData]);

  // Extract GRNs and SANs from responses
  const pendingGrns = useMemo(() => {
    if (!pendingGrnsResponse) return [];
    if (Array.isArray(pendingGrnsResponse)) return pendingGrnsResponse;
    if (pendingGrnsResponse && typeof pendingGrnsResponse === 'object' && 'data' in pendingGrnsResponse && Array.isArray((pendingGrnsResponse as any).data)) {
      return (pendingGrnsResponse as any).data;
    }
    return [];
  }, [pendingGrnsResponse]);

  const pendingSans = useMemo(() => {
    if (!pendingSansResponse) return [];
    if (Array.isArray(pendingSansResponse)) return pendingSansResponse;
    if (pendingSansResponse && typeof pendingSansResponse === 'object' && 'data' in pendingSansResponse && Array.isArray((pendingSansResponse as any).data)) {
      return (pendingSansResponse as any).data;
    }
    return [];
  }, [pendingSansResponse]);

  // Filter items
  const filteredItems = useMemo(() => {
    let grns = pendingGrns.map((g: any) => ({ ...g, _type: 'grn' as const }));
    let sans = pendingSans.map((s: any) => ({ ...s, _type: 'san' as const }));

    // Filter by type
    if (filters.type === 'grn') {
      sans = [];
    } else if (filters.type === 'san') {
      grns = [];
    }

    let allItems = [...grns, ...sans];

    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      allItems = allItems.filter((item) => {
        const number = item.grn_number || item.san_number || '';
        const provider = item.service_provider || '';
        const ref = item.reference_number || '';
        return number.toLowerCase().includes(searchLower) ||
          provider.toLowerCase().includes(searchLower) ||
          ref.toLowerCase().includes(searchLower);
      });
    }

    // Filter by department (for HODs)
    if (isHOD() && user?.department_id) {
      allItems = allItems.filter((item) => {
        const deptId = getDepartmentId(item);
        return deptId === user.department_id;
      });
    }

    // Sort by date (newest first)
    allItems.sort((a, b) => {
      const dateA = a.created_at || a.acknowledgment_date || '';
      const dateB = b.created_at || b.acknowledgment_date || '';
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });

    return allItems;
  }, [pendingGrns, pendingSans, filters, isHOD, user]);

  // Pagination
  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Stats
  const statsItems: StatCardItem[] = useMemo(() => {
    const totalPending = pendingGrns.length + pendingSans.length;
    const grnPending = pendingGrns.length;
    const sanPending = pendingSans.length;

    // Calculate total value
    const totalValue = [...pendingGrns, ...pendingSans].reduce(
      (sum, item) => sum + (parseFloat(item.total_value || item.net_total || 0) || 0),
      0
    );

    return [
      {
        label: "Total Pending",
        value: totalPending,
        icon: Clock,
        tagLabel: "PENDING",
        tagColor: "amber",
        subtitle: `${totalPending} awaiting approval`,
      },
      {
        label: "GRNs Pending",
        value: grnPending,
        icon: Package,
        tagLabel: "GRNS",
        tagColor: "emerald",
        subtitle: "Goods received notes",
      },
      {
        label: "SANs Pending",
        value: sanPending,
        icon: FileCheck,
        tagLabel: "SANS",
        tagColor: "blue",
        subtitle: "Service acknowledgments",
      },
      {
        label: "Total Value",
        value: totalValue,
        icon: DollarSign,
        tagLabel: "VALUE",
        tagColor: "purple",
        subtitle: formatCurrency(totalValue),
      },
    ];
  }, [pendingGrns, pendingSans]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleFilterChange = useCallback((key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({});
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleRefresh = useCallback(() => {
    refetchGrns();
    refetchSans();
    success('Pending approvals refreshed');
  }, [refetchGrns, refetchSans, success]);

  const handleView = (item: any) => {
    const path = item._type === 'grn'
      ? `/procurement/delivery-notes/goods-received/${item.id}`
      : `/procurement/delivery-notes/service-acknowledgment/${item.id}`;
    router.push(path);
  };

  const handleApprove = (item: any) => {
    setSelectedItem(item);
    setSelectedType(item._type);
    setApprovalComment('');
    setShowApproveDialog(true);
  };

  const handleReject = (item: any) => {
    setSelectedItem(item);
    setSelectedType(item._type);
    setRejectionReason('');
    setShowRejectDialog(true);
  };

  const handleConfirmApprove = async () => {
    if (!selectedItem) return;
    setIsSubmitting(true);
    try {
      if (selectedType === 'grn') {
        await approveGrn.mutateAsync({
          id: selectedItem.id,
          comment: approvalComment || undefined,
        });
      } else {
        await approveSan.mutateAsync({
          id: selectedItem.id,
          comment: approvalComment || undefined,
        });
      }
      setShowApproveDialog(false);
      refetchGrns();
      refetchSans();
      success(`${selectedType.toUpperCase()} approved successfully`);
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to approve');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!selectedItem) return;
    setIsSubmitting(true);
    try {
      if (selectedType === 'grn') {
        await rejectGrn.mutateAsync({
          id: selectedItem.id,
          reason: rejectionReason,
        });
      } else {
        await rejectSan.mutateAsync({
          id: selectedItem.id,
          reason: rejectionReason,
        });
      }
      setShowRejectDialog(false);
      refetchGrns();
      refetchSans();
      success(`${selectedType.toUpperCase()} rejected`);
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to reject');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoadingData = isLoadingGrns || isLoadingSans || isLoadingSuppliers;

  return (
    <PageTemplate
      title="Pending Approvals"
      description="Review and approve pending goods received notes and service acknowledgment notes."
      icon={<Clock className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />}
      background="gradient"
      variant="default"
      breadcrumbs={[
        { label: 'Procurement', href: '/procurement' },
        { label: 'Delivery Notes', href: '/procurement/delivery-notes' },
        { label: 'Pending Approvals' },
      ]}
      actions={
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 rounded-full px-4 py-1.5">
            <Clock className="h-3.5 w-3.5 mr-1.5" />
            {pendingGrns.length + pendingSans.length} Pending
          </Badge>
          <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 rounded-full px-4 py-1.5">
            <Package className="h-3.5 w-3.5 mr-1.5" />
            {pendingGrns.length} GRNs
          </Badge>
          <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800 rounded-full px-4 py-1.5">
            <FileCheck className="h-3.5 w-3.5 mr-1.5" />
            {pendingSans.length} SANs
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoadingData}
            className="gap-2 h-10 rounded-xl dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <RefreshCw className={cn("h-4 w-4", isLoadingData && "animate-spin")} />
            Refresh
          </Button>
        </div>
      }
    >
      {/* Stats Cards */}
      <StatsCards
        stats={statsItems}
        isLoading={isLoadingData}
        columns={4}
        variant="default"
        tagOrientation='none'
        formatCompact={true}
      />

      {/* ============================================ */}
      {/* FILTERS */}
      {/* ============================================ */}
      <div className="mt-6 mb-6">
        <Card className="border-0 shadow-sm rounded-xl bg-white dark:bg-gray-900">
          <CardContent className="p-4 pt-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by number, provider, reference..."
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-9 h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700 w-full"
                />
              </div>
              <Select
                value={filters.type || 'all'}
                onValueChange={(value) => handleFilterChange('type', value === 'all' ? undefined : value)}
              >
                <SelectTrigger className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700 w-full sm:w-[160px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="grn">GRN Only</SelectItem>
                  <SelectItem value="san">SAN Only</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  className="gap-1 rounded-xl shrink-0 h-11 px-4"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-gray-900 dark:text-gray-100">{paginatedItems.length}</span> of{' '}
          <span className="font-medium text-gray-900 dark:text-gray-100">{totalItems}</span> pending approvals
        </p>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">
            <span className="font-medium text-emerald-600 dark:text-emerald-400">
              {pendingGrns.length} GRNs
            </span>
          </span>
          <span className="text-muted-foreground">
            <span className="font-medium text-blue-600 dark:text-blue-400">
              {pendingSans.length} SANs
            </span>
          </span>
        </div>
      </div>

      {/* ============================================ */}
      {/* PENDING APPROVALS TABLE */}
      {/* ============================================ */}
      <div className="border rounded-xl overflow-hidden dark:border-gray-700 shadow-sm bg-white dark:bg-gray-900 relative">
        {isLoadingData ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-amber-600 dark:text-amber-400" />
          </div>
        ) : paginatedItems.length === 0 ? (
          <div className="text-center py-16 bg-gray-50/50 dark:bg-gray-800/20">
            <WrappedCornerTag label="Empty" color="gray" position="top-left" size="sm" />
            <div className="inline-flex p-4 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
              <Clock className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-gray-100">No Pending Approvals</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {isHOD()
                ? "No pending approvals for your department. All caught up!"
                : "No pending approvals to review."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/80 dark:bg-gray-800/50 hover:bg-transparent border-b dark:border-gray-700">
                  <TableHead className="w-[50px] py-3.5 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">#</TableHead>
                  <TableHead className="min-w-[160px] py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5" />
                      Number
                    </div>
                  </TableHead>
                  <TableHead className="min-w-[160px] py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Hash className="h-3.5 w-3.5" />
                      Reference
                    </div>
                  </TableHead>
                  <TableHead className="min-w-[180px] py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-3.5 w-3.5" />
                      Supplier / Provider
                    </div>
                  </TableHead>
                  <TableHead className="min-w-[140px] py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5" />
                      Department
                    </div>
                  </TableHead>
                  <TableHead className="py-3.5 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <div className="flex items-center justify-center gap-2">
                      <Briefcase className="h-3.5 w-3.5" />
                      Type
                    </div>
                  </TableHead>
                  <TableHead className="py-3.5 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <div className="flex items-center justify-end gap-2">
                      <DollarSign className="h-3.5 w-3.5" />
                      Amount
                    </div>
                  </TableHead>
                  <TableHead className="py-3.5 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" />
                      Submitted
                    </div>
                  </TableHead>
                  <TableHead className="py-3.5 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</TableHead>
                  <TableHead className="py-3.5 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedItems.map((item, index) => {
                  const isGRN = item._type === 'grn';
                  const number = isGRN ? item.grn_number : item.san_number;
                  const provider = isGRN
                    ? getSupplierCompanyName(item.purchase_order?.supplier || item.supplier)
                    : item.service_provider || '—';
                  const departmentName = getDepartmentName(item);
                  const amount = isGRN ? item.total_value : item.total_value;
                  const submittedDate = item.created_at || item.acknowledgment_date;
                  const status = item.status;

                  return (
                    <TableRow
                      key={`${item._type}-${item.id}`}
                      className="hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-colors group border-b dark:border-gray-700/50 last:border-0"
                    >
                      <TableCell className="py-3.5 text-center">
                        <span className="text-sm font-medium text-gray-400 dark:text-gray-500">
                          {((currentPage - 1) * ITEMS_PER_PAGE) + index + 1}
                        </span>
                      </TableCell>
                      <TableCell className="py-3.5">
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                            {number}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {isGRN ? 'GRN' : 'SAN'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3.5">
                        <span className="text-sm font-mono text-gray-600 dark:text-gray-400">
                          {item.reference_number || '—'}
                        </span>
                      </TableCell>
                      <TableCell className="py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 dark:from-amber-500/30 dark:to-orange-500/30 flex-shrink-0 border border-amber-200/30 dark:border-amber-800/30">
                            <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-500 text-white text-xs font-medium">
                              {getInitials(provider)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col min-w-0">
                            <span className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[140px]">
                              {provider}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[100px]">
                            {departmentName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3.5 text-center">
                        <Badge className={cn(
                          "rounded-full text-[10px] px-2.5 py-0.5 font-medium",
                          isGRN
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                        )}>
                          {isGRN ? 'GRN' : 'SAN'}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3.5 text-right">
                        <span className="font-bold text-gray-900 dark:text-gray-100">
                          {formatCurrency(amount)}
                        </span>
                      </TableCell>
                      <TableCell className="py-3.5 text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-xs text-muted-foreground">
                            {formatDate(submittedDate)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3.5 text-center">
                        <StatusBadge status={status} />
                      </TableCell>
                      <TableCell className="py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-0.5">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleView(item)}
                                  className="h-8 w-8 p-0 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 text-gray-500 hover:text-amber-600"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="rounded-xl">View Details</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleApprove(item)}
                                  className="h-8 w-8 p-0 rounded-lg text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="rounded-xl">Approve</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleReject(item)}
                                  className="h-8 w-8 p-0 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="rounded-xl">Reject</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {totalItems > ITEMS_PER_PAGE && (
          <div className="flex items-center justify-between px-4 py-3 border-t dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/20">
            <p className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} of {totalItems}
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
              <span className="text-sm text-muted-foreground px-3">
                Page {currentPage} of {totalPages}
              </span>
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
      </div>

      {/* ============================================ */}
      {/* APPROVE DIALOG */}
      {/* ============================================ */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent className="max-w-md rounded-2xl dark:bg-gray-900 dark:border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              Approve {selectedType?.toUpperCase()}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
              {selectedItem?.[selectedType === 'grn' ? 'grn_number' : 'san_number']} will be approved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="approval-comment" className="text-gray-700 dark:text-gray-300">Comment (Optional)</Label>
              <Textarea
                id="approval-comment"
                placeholder="Add any approval notes..."
                value={approvalComment}
                onChange={(e) => setApprovalComment(e.target.value)}
                rows={3}
                className="rounded-xl resize-none dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-500"
              />
            </div>
            <div className="p-4 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/50">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-emerald-700 dark:text-emerald-300">
                  <p className="font-semibold">Confirm Approval</p>
                  <p className="text-xs mt-0.5">
                    This will approve the {selectedType?.toUpperCase()} and mark it as acknowledged.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmApprove}
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 rounded-xl text-white dark:bg-emerald-600 dark:hover:bg-emerald-700"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
              {isSubmitting ? 'Approving...' : 'Approve'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ============================================ */}
      {/* REJECT DIALOG */}
      {/* ============================================ */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent className="max-w-md rounded-2xl dark:bg-gray-900 dark:border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <XCircle className="h-5 w-5" />
              Reject {selectedType?.toUpperCase()}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
              {selectedItem?.[selectedType === 'grn' ? 'grn_number' : 'san_number']} will be rejected. A reason is required.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rejection-reason" className="text-gray-700 dark:text-gray-300">Reason for Rejection <span className="text-red-500">*</span></Label>
              <Textarea
                id="rejection-reason"
                placeholder="Provide a reason for rejecting this..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="rounded-xl resize-none dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-500"
              />
            </div>
            <div className="p-4 rounded-xl bg-red-50/80 dark:bg-red-950/30 border border-red-200/50 dark:border-red-800/50">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-700 dark:text-red-300">
                  <p className="font-semibold">Confirm Rejection</p>
                  <p className="text-xs mt-0.5">The supplier will be notified and can make corrections.</p>
                </div>
              </div>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmReject}
              disabled={isSubmitting || !rejectionReason.trim()}
              className="bg-red-600 hover:bg-red-700 rounded-xl text-white dark:bg-red-600 dark:hover:bg-red-700 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <X className="h-4 w-4 mr-2" />}
              {isSubmitting ? 'Rejecting...' : 'Reject'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageTemplate>
  );
}
