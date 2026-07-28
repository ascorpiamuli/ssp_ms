// frontend/src/app/(dashboard)/requisitions/manage/page.tsx

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  FileText,
  User,
  Building2,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Loader2,
  Send,
  RotateCcw,
  X,
  UserCheck,
  UserX,
  CreditCard,
  Crown,
  Award,
  FileCheck,
  ShoppingCart,
  Truck,
  Receipt,
  TrendingUp,
  Users,
  Calendar,
  AlertTriangle,
  Info,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { PageTemplate } from '@/components/dashboard/PageTemplate';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Hooks
import { useAuthContext } from '@/contexts/AuthContext';
import {
  useMyRequisitions,
  useMyRequisitionStats,
} from '@/hooks/useRequisitionQueries';
import {
  useDeleteRequisition,
  useSubmitRequisition,
  useReturnRequisition,
  useCancelRequisition,
} from '@/hooks/useRequisitionMutations';
import { useDepartments } from '@/hooks/useDepartments';
import { useSuppliers } from '@/hooks/useSuppliers';

// Types
import type { Requisition, RequisitionFilters, RequisitionStats } from '@/types/requisition.types';

// ============================================
// CONSTANTS
// ============================================

const APPROVER_ROLES = ['hod', 'accountant', 'principal', 'final_approver', 'admin', 'super_admin'];
const APPROVABLE_STATUSES = ['submitted', 'hod_approved', 'accountant_approved', 'principal_approved'];

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  submitted: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  hod_approved: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  hod_declined: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  accountant_approved: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  accountant_declined: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  principal_approved: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  principal_declined: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  final_approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  final_declined: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  returned: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  revised: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  cancelled: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
};

const STATUS_ICONS: Record<string, any> = {
  draft: FileText,
  submitted: Clock,
  hod_approved: UserCheck,
  hod_declined: UserX,
  accountant_approved: CreditCard,
  accountant_declined: CreditCard,
  principal_approved: Crown,
  principal_declined: Crown,
  final_approved: Award,
  final_declined: Award,
  returned: RotateCcw,
  revised: Edit,
  cancelled: X,
};

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  hod_approved: 'HOD Approved',
  hod_declined: 'HOD Declined',
  accountant_approved: 'Accountant Approved',
  accountant_declined: 'Accountant Declined',
  principal_approved: 'Principal Approved',
  principal_declined: 'Principal Declined',
  final_approved: 'Approved',
  final_declined: 'Declined',
  returned: 'Returned',
  revised: 'Revised',
  cancelled: 'Cancelled',
};

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  emergency: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const ITEMS_PER_PAGE = 10;

// ============================================
// HELPER FUNCTIONS
// ============================================

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (date: string | Date): string => {
  if (!date) return 'N/A';
  return format(new Date(date), 'dd/MM/yyyy HH:mm');
};

const getStatusLabel = (status: string): string => {
  return STATUS_LABELS[status] || status;
};

// Check if procurement has started
const hasProcurementStarted = (requisition: Requisition): boolean => {
  return requisition.is_procurement_created === true || requisition.procurement_created_at !== null;
};

// Check if procurement is complete
const isProcurementComplete = (requisition: Requisition): boolean => {
  // Check metadata for payment completion
  return requisition.is_procurement_created === true &&
    requisition.status === 'final_approved' &&
    (requisition.metadata?.payment_completed === true ||
      requisition.metadata?.cheque_issued === true);
};

// ============================================
// STATUS BADGE COMPONENT
// ============================================

const StatusBadge = ({ status }: { status: string }) => {
  const Icon = STATUS_ICONS[status] || FileText;
  const colorClass = STATUS_COLORS[status] || STATUS_COLORS.draft;

  return (
    <Badge className={cn("flex items-center gap-1.5 px-2.5 py-1 font-medium", colorClass)}>
      <Icon className="h-3 w-3" />
      {getStatusLabel(status)}
    </Badge>
  );
};

// ============================================
// PRIORITY BADGE COMPONENT
// ============================================

const PriorityBadge = ({ priority }: { priority: string }) => {
  const colorClass = PRIORITY_COLORS[priority] || PRIORITY_COLORS.medium;
  const labels: Record<string, string> = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    emergency: 'Emergency',
  };

  return (
    <Badge variant="outline" className={cn("text-xs", colorClass)}>
      {labels[priority] || priority}
    </Badge>
  );
};

// ============================================
// PROCUREMENT PROGRESS INDICATOR
// ============================================

const ProcurementProgressIndicator = ({ requisition }: { requisition: Requisition }) => {
  const isFullyApproved = requisition.status === 'final_approved';

  if (!isFullyApproved) return null;

  const started = hasProcurementStarted(requisition);
  const complete = isProcurementComplete(requisition);

  if (!started) {
    return (
      <div className="mt-1.5 flex items-center gap-1.5">
        <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800">
          <ShoppingCart className="h-3 w-3 mr-1" />
          Ready for Procurement
        </Badge>
      </div>
    );
  }

  if (complete) {
    return (
      <div className="mt-1.5 flex items-center gap-1.5">
        <Badge variant="outline" className="text-[10px] bg-green-50 text-green-600 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Procurement Complete
        </Badge>
      </div>
    );
  }

  return (
    <div className="mt-1.5 flex items-center gap-1.5">
      <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800">
        <TrendingUp className="h-3 w-3 mr-1" />
        Procurement In Progress
      </Badge>
    </div>
  );
};

// ============================================
// STATS CARDS COMPONENT
// ============================================

interface StatsCardsProps {
  stats: RequisitionStats | undefined;
  isLoading: boolean;
}

const StatsCards = ({ stats, isLoading }: StatsCardsProps) => {
  const statItems = useMemo(() => [
    {
      label: 'Total Requisitions',
      value: stats?.total || 0,
      icon: FileText,
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: 'Pending Approval',
      value: stats?.pending || 0,
      icon: Clock,
      color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20',
    },
    {
      label: 'Approved',
      value: stats?.final_approved || 0,
      icon: CheckCircle,
      color: 'text-green-600 bg-green-50 dark:bg-green-900/20',
    },
    {
      label: 'Declined',
      value: (stats?.final_declined || 0) + (stats?.hod_declined || 0) + (stats?.accountant_declined || 0) + (stats?.principal_declined || 0),
      icon: X,
      color: 'text-red-600 bg-red-50 dark:bg-red-900/20',
    },
    {
      label: 'Returned',
      value: stats?.returned || 0,
      icon: RotateCcw,
      color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
    },
  ], [stats]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-2/3 mb-2" />
              <div className="h-8 bg-gray-200 rounded dark:bg-gray-700 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {statItems.map((item) => (
        <Card key={item.label} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
              <div className={cn("p-2 rounded-lg", item.color)}>
                <item.icon className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-bold mt-2">{item.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// ============================================
// FILTERS COMPONENT
// ============================================

interface FiltersProps {
  filters: RequisitionFilters;
  onFilterChange: (key: keyof RequisitionFilters, value: any) => void;
  onReset: () => void;
  departments: any[];
}

const Filters = ({ filters, onFilterChange, onReset, departments }: FiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Filters</span>
            <Badge variant="secondary" className="ml-2">
              {Object.keys(filters).filter(key => filters[key as keyof RequisitionFilters]).length}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="gap-1"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {isExpanded ? 'Hide' : 'Show'}
            </Button>
            <Button variant="ghost" size="sm" onClick={onReset} className="gap-1">
              <RefreshCw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search your requisitions..."
              value={filters.search || ''}
              onChange={(e) => onFilterChange('search', e.target.value)}
              className="pl-9"
            />
          </div>

          <Select
            value={filters.status as string || 'all'}
            onValueChange={(value) => onFilterChange('status', value === 'all' ? undefined : value as any)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="hod_approved">HOD Approved</SelectItem>
              <SelectItem value="hod_declined">HOD Declined</SelectItem>
              <SelectItem value="accountant_approved">Accountant Approved</SelectItem>
              <SelectItem value="accountant_declined">Accountant Declined</SelectItem>
              <SelectItem value="principal_approved">Principal Approved</SelectItem>
              <SelectItem value="principal_declined">Principal Declined</SelectItem>
              <SelectItem value="final_approved">Approved</SelectItem>
              <SelectItem value="final_declined">Declined</SelectItem>
              <SelectItem value="returned">Returned</SelectItem>
              <SelectItem value="revised">Revised</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.priority as string || 'all'}
            onValueChange={(value) => onFilterChange('priority', value === 'all' ? undefined : value as any)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="emergency">Emergency</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
            <Select
              value={filters.department_id?.toString() || 'all'}
              onValueChange={(value) => onFilterChange('department_id', value === 'all' ? undefined : parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id.toString()}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={filters.date_from || ''}
              onChange={(e) => onFilterChange('date_from', e.target.value || undefined)}
              className="h-10"
            />

            <Input
              type="date"
              value={filters.date_to || ''}
              onChange={(e) => onFilterChange('date_to', e.target.value || undefined)}
              className="h-10"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ============================================
// REQUISITION TABLE COMPONENT
// ============================================

interface RequisitionTableProps {
  data: Requisition[];
  isLoading: boolean;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onSubmit: (id: number) => void;
  onReturn: (id: number) => void;
  onCancel: (id: number) => void;
  onRowClick: (requisition: Requisition) => void;
  userRoles: string[];
  userId?: number;
  onStartProcurement: (id: number) => void;
}

const RequisitionTable = ({
  data,
  isLoading,
  onView,
  onEdit,
  onDelete,
  onSubmit,
  onReturn,
  onCancel,
  onRowClick,
  userRoles,
  userId,
  onStartProcurement,
}: RequisitionTableProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No requisitions found</h3>
        <p className="text-muted-foreground">You haven't created any requisitions yet.</p>
        <Button
          className="mt-4"
          onClick={() => window.location.href = '/requisitions/create'}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Your First Requisition
        </Button>
      </div>
    );
  }

  const isEditable = (status: string) => {
    return status === 'draft' || status === 'returned' || status === 'revised';
  };

  const isSubmittable = (status: string) => {
    return status === 'draft' || status === 'returned' || status === 'revised';
  };

  const isCancellable = (status: string) => {
    return status === 'draft' || status === 'submitted' || status === 'returned' || status === 'revised';
  };

  const isReturnable = (status: string, requisitionUserId?: number) => {
    if (!APPROVABLE_STATUSES.includes(status)) return false;
    const hasApproverRole = userRoles.some(role => APPROVER_ROLES.includes(role));
    if (!hasApproverRole) return false;
    if (requisitionUserId && requisitionUserId === userId) return false;
    return true;
  };

  // Check if user can start procurement (Procurement Officer or Accountant)
  const canStartProcurement = userRoles.some(role =>
    role === 'procurement' || role === 'accountant' || role === 'admin' || role === 'super_admin'
  );

  return (
    <div className="border rounded-lg overflow-hidden">
      <ScrollArea className="w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">#</TableHead>
              <TableHead>Requisition</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="min-w-[120px]">Approval Progress</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((req, index) => {
              const canEdit = isEditable(req.status);
              const canSubmit = isSubmittable(req.status);
              const canCancel = isCancellable(req.status);
              const canReturn = isReturnable(req.status, req.user?.id);
              const isFullyApproved = req.status === 'final_approved';
              const canProcure = isFullyApproved && canStartProcurement;
              const procurementStarted = hasProcurementStarted(req);
              const procurementComplete = isProcurementComplete(req);

              const approvals = req.approvals || [];
              const hasPendingApproval = approvals.some((a: any) => a.status === 'pending');
              const pendingApprovalLevel = approvals.find((a: any) => a.status === 'pending')?.level_label;

              return (
                <TableRow
                  key={req.id}
                  className="hover:bg-muted/50 cursor-pointer group"
                  onClick={() => onRowClick(req)}
                >
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium truncate max-w-[200px] group-hover:text-blue-600 transition-colors">
                        {req.title}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">{req.reference_number}</p>
                      {/* Procurement Progress */}
                      <ProcurementProgressIndicator requisition={req} />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Building2 className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{req.department?.name || 'N/A'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={req.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {hasPendingApproval ? (
                        <div className="flex items-center gap-1.5">
                          <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
                          <span className="text-xs text-yellow-600">
                            {pendingApprovalLevel || 'Pending'}
                          </span>
                        </div>
                      ) : req.status === 'draft' ? (
                        <span className="text-xs text-muted-foreground">Not submitted</span>
                      ) : req.status === 'final_approved' ? (
                        <div className="flex items-center gap-1.5">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-xs text-green-600">Fully Approved</span>
                        </div>
                      ) : req.status === 'cancelled' ? (
                        <span className="text-xs text-muted-foreground">Cancelled</span>
                      ) : approvals.length > 0 ? (
                        <div className="flex items-center gap-1">
                          {approvals.map((approval: any, i: number) => (
                            <div key={i} className="flex items-center">
                              <div className={cn(
                                "w-3 h-3 rounded-full",
                                approval.status === 'approved' ? "bg-green-500" :
                                  approval.status === 'pending' ? "bg-yellow-500 animate-pulse" :
                                    approval.status === 'declined' ? "bg-red-500" :
                                      "bg-gray-300"
                              )} />
                              {i < approvals.length - 1 && (
                                <div className={cn(
                                  "w-4 h-0.5",
                                  approval.status === 'approved' ? "bg-green-500" : "bg-gray-300"
                                )} />
                              )}
                            </div>
                          ))}
                          <span className="text-xs text-muted-foreground ml-1">
                            {approvals.filter((a: any) => a.status === 'approved').length}/{approvals.length}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">No approvals</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <PriorityBadge priority={req.priority} />
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(req.total_amount || 0)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(req.created_at)}
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onView(req.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>

                        {canEdit && (
                          <DropdownMenuItem onClick={() => onEdit(req.id)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                        )}

                        {canSubmit && (
                          <DropdownMenuItem onClick={() => onSubmit(req.id)}>
                            <Send className="h-4 w-4 mr-2" />
                            Submit for Approval
                          </DropdownMenuItem>
                        )}

                        {canReturn && (
                          <DropdownMenuItem onClick={() => onReturn(req.id)} className="text-amber-600">
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Return for Revision
                          </DropdownMenuItem>
                        )}

                        {canCancel && (
                          <DropdownMenuItem onClick={() => onCancel(req.id)} className="text-red-600">
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </DropdownMenuItem>
                        )}

                        {canProcure && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => onStartProcurement(req.id)}
                              className={cn(
                                procurementComplete ? "text-green-600" :
                                  procurementStarted ? "text-amber-600" :
                                    "text-blue-600"
                              )}
                            >
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              {procurementComplete ? 'Procurement Complete' :
                                procurementStarted ? 'Continue Procurement' :
                                  'Start Procurement'}
                            </DropdownMenuItem>
                          </>
                        )}

                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onDelete(req.id)} className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};

// ============================================
// MAIN PAGE COMPONENT
// ============================================

export default function ManageRequisitionsPage() {
  const router = useRouter();
  const { user } = useAuthContext();
  const { useAllDepartments } = useDepartments();
  const { useAllSuppliers } = useSuppliers();

  // Hooks
  const { data: departmentsData, isLoading: departmentsLoading } = useAllDepartments();
  const { data: suppliersData, isLoading: suppliersLoading } = useAllSuppliers();
  const { mutate: deleteRequisition } = useDeleteRequisition();
  const { mutate: submitRequisition } = useSubmitRequisition();
  const { mutate: returnRequisition } = useReturnRequisition();
  const { mutate: cancelRequisition } = useCancelRequisition();

  // State
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<RequisitionFilters>({
    page: 1,
    per_page: ITEMS_PER_PAGE,
  });
  const [selectedRequisition, setSelectedRequisition] = useState<Requisition | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showProcurementDialog, setShowProcurementDialog] = useState(false);
  const [comment, setComment] = useState('');

  // Memoize departments
  const departments = useMemo(() => {
    if (!departmentsData) return [];
    if (Array.isArray(departmentsData)) return departmentsData;
    if (departmentsData?.data && Array.isArray(departmentsData.data)) return departmentsData.data;
    return [];
  }, [departmentsData]);

  // Get user roles
  const userRoles = useMemo(() => {
    const roles: string[] = [];
    if (user?.role) roles.push(user.role.toLowerCase());
    if (user?.roles) {
      user.roles.forEach((r: any) => {
        const roleName = typeof r === 'string' ? r : r.name;
        if (roleName) roles.push(roleName.toLowerCase());
      });
    }
    return roles;
  }, [user]);

  // Determine if user is admin
  const isAdmin = userRoles.some(r => r === 'admin' || r === 'super_admin');

  // Query - only get user's own requisitions
  const myRequisitionsQuery = useMyRequisitions(filters);
  const myStatsQuery = useMyRequisitionStats();

  const responseData = myRequisitionsQuery.data as any;

  // Extract data from response
  let data: Requisition[] = [];
  let meta = { total: 0, per_page: ITEMS_PER_PAGE, current_page: 1, last_page: 1 };

  if (responseData) {
    if (responseData.data && Array.isArray(responseData.data)) {
      data = responseData.data;
      meta = responseData.meta || meta;
    } else if (responseData.items && Array.isArray(responseData.items)) {
      data = responseData.items;
      meta = {
        total: responseData.total || 0,
        per_page: responseData.per_page || ITEMS_PER_PAGE,
        current_page: responseData.current_page || 1,
        last_page: responseData.last_page || 1,
      };
    } else if (Array.isArray(responseData)) {
      data = responseData;
    }
  }

  const isLoading = myRequisitionsQuery.isLoading || departmentsLoading || suppliersLoading;

  // Handle filter changes
  const handleFilterChange = useCallback((key: keyof RequisitionFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
    setCurrentPage(1);
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({
      page: 1,
      per_page: ITEMS_PER_PAGE,
    });
    setCurrentPage(1);
  }, []);

  // Handle pagination
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    setFilters(prev => ({
      ...prev,
      page,
    }));
  }, []);

  // Navigate to requisition details page
  const handleView = useCallback((id: number) => {
    router.push(`/requisitions/${id}`);
  }, [router]);

  const handleRowClick = useCallback((requisition: Requisition) => {
    router.push(`/requisitions/${requisition.id}`);
  }, [router]);

  const handleEdit = useCallback((id: number) => {
    router.push(`/requisitions/${id}/edit`);
  }, [router]);

  const handleDelete = useCallback((id: number) => {
    const requisition = data.find(r => r.id === id);
    if (requisition) {
      setSelectedRequisition(requisition);
      setShowDeleteDialog(true);
    }
  }, [data]);

  const handleConfirmDelete = useCallback(() => {
    if (selectedRequisition) {
      deleteRequisition(selectedRequisition.id, {
        onSuccess: () => {
          setShowDeleteDialog(false);
          setSelectedRequisition(null);
        },
      });
    }
  }, [selectedRequisition, deleteRequisition]);

  const handleSubmit = useCallback((id: number) => {
    const requisition = data.find(r => r.id === id);
    if (requisition) {
      setSelectedRequisition(requisition);
      setShowSubmitDialog(true);
      setComment('');
    }
  }, [data]);

  const handleConfirmSubmit = useCallback(() => {
    if (selectedRequisition) {
      submitRequisition({
        id: selectedRequisition.id,
        data: { comment: comment || undefined },
      }, {
        onSuccess: () => {
          setShowSubmitDialog(false);
          setSelectedRequisition(null);
          setComment('');
        },
      });
    }
  }, [selectedRequisition, comment, submitRequisition]);

  const handleReturn = useCallback((id: number) => {
    const requisition = data.find(r => r.id === id);
    if (requisition) {
      setSelectedRequisition(requisition);
      setShowReturnDialog(true);
      setComment('');
    }
  }, [data]);

  const handleConfirmReturn = useCallback(() => {
    if (selectedRequisition) {
      returnRequisition({
        id: selectedRequisition.id,
        data: { reason: comment || 'Returned for revision' },
      }, {
        onSuccess: () => {
          setShowReturnDialog(false);
          setSelectedRequisition(null);
          setComment('');
        },
      });
    }
  }, [selectedRequisition, comment, returnRequisition]);

  const handleCancel = useCallback((id: number) => {
    const requisition = data.find(r => r.id === id);
    if (requisition) {
      setSelectedRequisition(requisition);
      setShowCancelDialog(true);
      setComment('');
    }
  }, [data]);

  const handleConfirmCancel = useCallback(() => {
    if (selectedRequisition) {
      cancelRequisition({
        id: selectedRequisition.id,
        data: { reason: comment || 'Cancelled by user' },
      }, {
        onSuccess: () => {
          setShowCancelDialog(false);
          setSelectedRequisition(null);
          setComment('');
        },
      });
    }
  }, [selectedRequisition, comment, cancelRequisition]);

  // Handle procurement start
  const handleStartProcurement = useCallback((id: number) => {
    const requisition = data.find(r => r.id === id);
    if (requisition) {
      setSelectedRequisition(requisition);
      setShowProcurementDialog(true);
    }
  }, [data]);

  const handleConfirmProcurement = useCallback(() => {
    if (selectedRequisition) {
      // Navigate to procurement page for this requisition
      router.push(`/requisitions/${selectedRequisition.id}/procurement`);
      setShowProcurementDialog(false);
      setSelectedRequisition(null);
    }
  }, [selectedRequisition, router]);

  const totalItems = meta?.total || 0;
  const totalPages = meta?.last_page || 0;

  // Count approved requisitions that need procurement
  const approvedCount = data.filter(r => r.status === 'final_approved').length;

  // Check if user can manage procurement
  const canManageProcurement = userRoles.some(role =>
    role === 'procurement' || role === 'accountant' || role === 'admin' || role === 'super_admin'
  );

  return (
    <PageTemplate
      title="My Requisitions"
      description="View and manage all your requisitions"
      icon={<FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />}
      actions={
        <div className="flex items-center gap-2 flex-wrap">
          {approvedCount > 0 && canManageProcurement && (
            <Button
              variant="default"
              size="sm"
              onClick={() => router.push('/procurement')}
              className="gap-2 h-9 bg-blue-600 hover:bg-blue-700"
            >
              <ShoppingCart className="h-4 w-4" />
              Procurement ({approvedCount})
            </Button>
          )}
          <Button
            variant="default"
            size="sm"
            onClick={() => router.push('/requisitions/create')}
            className="gap-2 h-9"
          >
            <Plus className="h-4 w-4" />
            New Requisition
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => myRequisitionsQuery.refetch()}
            className="gap-2 h-9"
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      }
    >
      {/* Info Banner - Procurement Reminder */}
      {approvedCount > 0 && (
        <Card className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
                <ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-blue-700 dark:text-blue-300">
                  {approvedCount} Approved Requisition{approvedCount > 1 ? 's' : ''} Ready for Procurement
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Once a requisition is fully approved, the Procurement Officer or Accountant can start
                  the procurement process by generating a Quotation Request (QTN) and sending it to suppliers.
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/30"
                    onClick={() => {
                      // Scroll to and highlight approved requisitions
                      const approvedRows = document.querySelectorAll('[data-status="final_approved"]');
                      if (approvedRows.length > 0) {
                        approvedRows[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }}
                  >
                    <AlertCircle className="h-4 w-4 mr-2" />
                    View Approved Requisitions
                  </Button>
                  {canManageProcurement && (
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => router.push('/procurement')}
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Go to Procurement Dashboard
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <StatsCards stats={myStatsQuery.data} isLoading={myStatsQuery.isLoading} />

      {/* Filters */}
      <div className="mt-6">
        <Filters
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
          departments={departments}
        />
      </div>

      {/* Table */}
      <RequisitionTable
        data={data}
        isLoading={isLoading}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onSubmit={handleSubmit}
        onReturn={handleReturn}
        onCancel={handleCancel}
        onRowClick={handleRowClick}
        userRoles={userRoles}
        userId={user?.id}
        onStartProcurement={handleStartProcurement}
      />

      {/* Pagination */}
      {totalItems > ITEMS_PER_PAGE && (
        <div className="mt-6 flex justify-end items-center gap-4">
          <p className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} of {totalItems}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="h-8 px-3"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="h-8 px-3"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Requisition</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete requisition "{selectedRequisition?.reference_number}"?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Requisition</DialogTitle>
            <DialogDescription>
              Submit "{selectedRequisition?.reference_number}" for approval.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="comment">Comment (Optional)</Label>
              <Textarea
                id="comment"
                placeholder="Add a comment for the approver..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmSubmit}>
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showReturnDialog} onOpenChange={setShowReturnDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Return Requisition</DialogTitle>
            <DialogDescription>
              Return "{selectedRequisition?.reference_number}" for revision.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="return-reason">Reason for Return <span className="text-red-500">*</span></Label>
              <Textarea
                id="return-reason"
                placeholder="Explain why this requisition needs revision..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReturnDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmReturn} disabled={!comment.trim()} className="bg-amber-600 hover:bg-amber-700">
              Return
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Requisition</DialogTitle>
            <DialogDescription>
              Cancel "{selectedRequisition?.reference_number}".
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cancel-reason">Reason for Cancellation <span className="text-red-500">*</span></Label>
              <Textarea
                id="cancel-reason"
                placeholder="Explain why you're cancelling this requisition..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Go Back
            </Button>
            <Button onClick={handleConfirmCancel} disabled={!comment.trim()} variant="destructive">
              Cancel Requisition
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Procurement Dialog */}
      <Dialog open={showProcurementDialog} onOpenChange={setShowProcurementDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Start Procurement Process</DialogTitle>
            <DialogDescription>
              You are about to start the procurement process for requisition "{selectedRequisition?.reference_number}".
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <Info className="h-4 w-4" />
                Procurement Workflow
              </h4>
              <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  Generate Quotation Request (QTN)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  Send to selected suppliers
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  Review supplier quotations
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  Select supplier (system suggests lowest price)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  Generate LPO/LSO
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  Process GRN/SAN and Payment
                </li>
              </ul>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <p className="text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Note:</strong> The QTN will contain <strong>items only</strong> (no estimated prices).
                  Suppliers will provide their own quotations with real prices.
                </span>
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProcurementDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmProcurement} className="bg-blue-600 hover:bg-blue-700">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Start Procurement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTemplate>
  );
}
