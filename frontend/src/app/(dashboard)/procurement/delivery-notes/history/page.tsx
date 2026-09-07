// frontend/src/app/(dashboard)/procurement/delivery-notes/history/page.tsx

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Eye,
  FileText,
  Package,
  Calendar,
  Building2,
  Download,
  RefreshCw,
  Loader2,
  Clock,
  CheckCircle,
  FileCheck,
  DollarSign,
  Hash,
  Users,
  Briefcase,
  Award,
  BadgeCheck,
  XCircle,
  ChevronRight,
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
import { Badge } from '@/components/ui/badge';
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

// Components
import StatsCards, { type StatCardItem } from '@/components/ui/stat-cards';
import { WrappedCornerTag } from '@/components/ui/wrapped-corner-tag';

// Hooks - ONLY using existing hooks
import {
  useGrns,
  useSans,
} from '@/hooks/useGoodsReceived';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useAuthContext } from '@/contexts/AuthContext';

// Types
import type {
  GoodsReceivedNote,
  ServiceAcknowledgmentNote,
} from '@/types/goodsReceived.types';

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

const getSupplierCompanyName = (supplier: any): string => {
  if (!supplier) return 'Unknown Supplier';
  if (typeof supplier === 'string') return supplier;
  if (supplier.company_name) return supplier.company_name;
  if (supplier.full_name) return supplier.full_name;
  if (supplier.name) return supplier.name;
  return 'Unknown Supplier';
};

const getDepartmentName = (item: any): string => {
  const dept = item.department || item.requisition?.department || null;
  return dept?.name || 'N/A';
};

const getDepartmentId = (item: any): number | null => {
  const dept = item.department || item.requisition?.department || null;
  return dept?.id || item.requisition?.department_id || null;
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

export default function DeliveryHistoryPage() {
  const router = useRouter();
  const { success, error } = useToast();

  // Auth context
  const { isHOD, user } = useAuthContext();

  // State
  const [filters, setFilters] = useState<{
    search?: string;
    type?: 'all' | 'grn' | 'san';
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }>({});
  const [currentPage, setCurrentPage] = useState(1);

  // ✅ Fetch ALL GRNs (no status filter)
  const {
    data: grnsResponse,
    isLoading: isLoadingGrns,
    refetch: refetchGrns,
  } = useGrns({});

  // ✅ Fetch ALL SANs (no status filter)
  const {
    data: sansResponse,
    isLoading: isLoadingSans,
    refetch: refetchSans,
  } = useSans({});

  // Suppliers hook
  const { useAllSuppliers } = useSuppliers();
  const { data: suppliersData, isLoading: isLoadingSuppliers } = useAllSuppliers();

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

  // Extract data from responses
  const allGrns = useMemo(() => {
    if (!grnsResponse) return [];
    if (Array.isArray(grnsResponse)) return grnsResponse;
    if (grnsResponse && typeof grnsResponse === 'object' && 'data' in grnsResponse && Array.isArray((grnsResponse as any).data)) {
      return (grnsResponse as any).data;
    }
    return [];
  }, [grnsResponse]);

  const allSans = useMemo(() => {
    if (!sansResponse) return [];
    if (Array.isArray(sansResponse)) return sansResponse;
    if (sansResponse && typeof sansResponse === 'object' && 'data' in sansResponse && Array.isArray((sansResponse as any).data)) {
      return (sansResponse as any).data;
    }
    return [];
  }, [sansResponse]);

  // Build combined history items
  const allHistoryItems = useMemo(() => {
    const grns = allGrns.map((g: any) => ({
      ...g,
      _type: 'grn' as const,
      _date: g.completed_at || g.updated_at || g.created_at,
    }));

    const sans = allSans.map((s: any) => ({
      ...s,
      _type: 'san' as const,
      _date: s.completed_at || s.updated_at || s.created_at,
    }));

    return [...grns, ...sans];
  }, [allGrns, allSans]);

  // Filter items
  const filteredItems = useMemo(() => {
    let items = allHistoryItems;

    // Filter by type
    if (filters.type === 'grn') {
      items = items.filter((item) => item._type === 'grn');
    } else if (filters.type === 'san') {
      items = items.filter((item) => item._type === 'san');
    }

    // Filter by status
    if (filters.status && filters.status !== 'all') {
      items = items.filter((item) => item.status === filters.status);
    }

    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      items = items.filter((item) => {
        const number = item.grn_number || item.san_number || '';
        const provider = item.service_provider || getSupplierCompanyName(item.purchase_order?.supplier || item.supplier) || '';
        const ref = item.reference_number || '';
        return number.toLowerCase().includes(searchLower) ||
          provider.toLowerCase().includes(searchLower) ||
          ref.toLowerCase().includes(searchLower);
      });
    }

    // Filter by date range
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      items = items.filter((item) => {
        const itemDate = new Date(item._date);
        return itemDate >= fromDate;
      });
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      items = items.filter((item) => {
        const itemDate = new Date(item._date);
        return itemDate <= toDate;
      });
    }

    // Filter by department for HODs
    if (isHOD() && user?.department_id) {
      items = items.filter((item) => {
        const deptId = getDepartmentId(item);
        return deptId === user.department_id;
      });
    }

    // Sort by date (newest first)
    items.sort((a, b) => {
      const dateA = new Date(a._date);
      const dateB = new Date(b._date);
      return dateB.getTime() - dateA.getTime();
    });

    return items;
  }, [allHistoryItems, filters, isHOD, user]);

  // Pagination
  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Stats - Using all items (not filtered)
  const statsItems: StatCardItem[] = useMemo(() => {
    const totalItems = allGrns.length + allSans.length;
    const totalGrns = allGrns.length;
    const totalSans = allSans.length;

    // Calculate total value
    const totalValue = [...allGrns, ...allSans].reduce(
      (sum: number, item: any) => sum + (parseFloat(item.total_value || item.net_total || 0) || 0),
      0
    );

    // Count completed
    const completedGrns = allGrns.filter((g: any) => g.status === 'completed').length;
    const completedSans = allSans.filter((s: any) => s.status === 'completed').length;

    return [
      {
        label: "Total Records",
        value: totalItems,
        icon: FileText,
        tagLabel: "TOTAL",
        tagColor: "blue",
        subtitle: `${totalGrns} GRNs, ${totalSans} SANs`,
      },
      {
        label: "Total Value",
        value: totalValue,
        icon: DollarSign,
        tagLabel: "VALUE",
        tagColor: "emerald",
        subtitle: formatCurrency(totalValue),
      },
      {
        label: "Completed",
        value: completedGrns + completedSans,
        icon: CheckCircle,
        tagLabel: "DONE",
        tagColor: "teal",
        subtitle: `${completedGrns} GRNs, ${completedSans} SANs`,
      },
      {
        label: "Pending",
        value: allGrns.filter((g: any) => g.status === 'submitted').length + allSans.filter((s: any) => s.status === 'submitted').length,
        icon: Clock,
        tagLabel: "PENDING",
        tagColor: "amber",
        subtitle: "Awaiting approval",
      },
    ];
  }, [allGrns, allSans]);

  // Status filter options
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'hod_approved', label: 'HOD Approved' },
    { value: 'principal_approved', label: 'Approved' },
    { value: 'completed', label: 'Completed' },
    { value: 'rejected', label: 'Rejected' },
  ];

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
    success('History refreshed');
  }, [refetchGrns, refetchSans, success]);

  // ✅ Click to view details - navigates to the detail page with the ID
  const handleViewDetails = (item: any) => {
    const path = item._type === 'grn'
      ? `/procurement/delivery-notes/goods-received/${item.id}`
      : `/procurement/delivery-notes/service-acknowledgment/${item.id}`;
    router.push(path);
  };

  const handleDownloadPdf = (item: any, e: React.MouseEvent) => {
    e.stopPropagation();
    success(`Downloading ${item._type.toUpperCase()} PDF...`);
  };

  const handleRowClick = (item: any) => {
    handleViewDetails(item);
  };

  const isLoadingData = isLoadingGrns || isLoadingSans || isLoadingSuppliers;

  return (
    <PageTemplate
      title="Delivery History"
      description="View all goods received notes and service acknowledgment notes."
      icon={<FileText className="h-5 w-5 sm:h-6 sm:w-6 text-teal-600" />}
      background="gradient"
      variant="default"
      breadcrumbs={[
        { label: 'Procurement', href: '/procurement' },
        { label: 'Delivery Notes', href: '/procurement/delivery-notes' },
        { label: 'History' },
      ]}
      actions={
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800 rounded-full px-4 py-1.5">
            <FileText className="h-3.5 w-3.5 mr-1.5" />
            {allGrns.length + allSans.length} Records
          </Badge>
          <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 rounded-full px-4 py-1.5">
            <Package className="h-3.5 w-3.5 mr-1.5" />
            {allGrns.length} GRNs
          </Badge>
          <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800 rounded-full px-4 py-1.5">
            <FileCheck className="h-3.5 w-3.5 mr-1.5" />
            {allSans.length} SANs
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
                <SelectTrigger className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700 w-full sm:w-[150px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="grn">GRN Only</SelectItem>
                  <SelectItem value="san">SAN Only</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700 w-full sm:w-[150px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
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
          <span className="font-medium text-gray-900 dark:text-gray-100">{totalItems}</span> records
        </p>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">
            <span className="font-medium text-emerald-600 dark:text-emerald-400">
              {allGrns.length} GRNs
            </span>
          </span>
          <span className="text-muted-foreground">
            <span className="font-medium text-blue-600 dark:text-blue-400">
              {allSans.length} SANs
            </span>
          </span>
        </div>
      </div>

      {/* ============================================ */}
      {/* HISTORY TABLE - ALL ROWS CLICKABLE */}
      {/* ============================================ */}
      <div className="border rounded-xl overflow-hidden dark:border-gray-700 shadow-sm bg-white dark:bg-gray-900 relative">
        {isLoadingData ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-teal-600 dark:text-teal-400" />
          </div>
        ) : paginatedItems.length === 0 ? (
          <div className="text-center py-16 bg-gray-50/50 dark:bg-gray-800/20">
            <WrappedCornerTag label="Empty" color="gray" position="top-left" size="sm" />
            <div className="inline-flex p-4 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
              <FileText className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-gray-100">No Records Found</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              No delivery records found. GRNs and SANs will appear here once created.
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
                      Date
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
                  const itemDate = item.completed_at || item.updated_at || item.created_at;
                  const status = item.status;

                  return (
                    <TableRow
                      key={`${item._type}-${item.id}`}
                      className="hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-colors cursor-pointer group border-b dark:border-gray-700/50 last:border-0"
                      onClick={() => handleRowClick(item)}
                    >
                      <TableCell className="py-3.5 text-center">
                        <span className="text-sm font-medium text-gray-400 dark:text-gray-500">
                          {((currentPage - 1) * ITEMS_PER_PAGE) + index + 1}
                        </span>
                      </TableCell>
                      <TableCell className="py-3.5">
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
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
                          <Avatar className="h-9 w-9 rounded-full bg-gradient-to-br from-teal-500/20 to-emerald-500/20 dark:from-teal-500/30 dark:to-emerald-500/30 flex-shrink-0 border border-teal-200/30 dark:border-teal-800/30">
                            <AvatarFallback className="bg-gradient-to-br from-teal-500 to-emerald-500 text-white text-xs font-medium">
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
                            {formatDate(itemDate)}
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
                                  onClick={() => handleViewDetails(item)}
                                  className="h-8 w-8 p-0 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/20 text-gray-500 hover:text-teal-600"
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
                                  onClick={(e) => handleDownloadPdf(item, e)}
                                  className="h-8 w-8 p-0 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="rounded-xl">Download PDF</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <ChevronRight className="h-4 w-4 text-gray-300 dark:text-gray-600 group-hover:text-teal-500 dark:group-hover:text-teal-400 transition-colors" />
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
    </PageTemplate>
  );
}
