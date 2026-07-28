// frontend/src/app/(dashboard)/requisitions/pending/page.tsx

'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Eye,
  User,
  Building2,
  Package,
  Calendar,
  FileText,
  Loader2,
  RefreshCw,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  UserCheck,
  UserX,
  Crown,
  Award,
  CreditCard,
  UserCog,
  Mail,
  Box,
  Hash,
  MinusCircle,
  Layers,
  Zap,
  Flame,
  Leaf,
  Check,
  X,
  Info,
  ArrowLeft,
  UserCircle,
  Users,
  UserPlus,
  Clock as ClockIcon,
  Calendar as CalendarIcon,
  UserPlus as DelegateIcon,
  BellRing,
  Sparkles,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  SortAsc,
  SortDesc,
  Star,
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  GripVertical,
  LayoutGrid,
  Table as TableIcon,
  DollarSign,
  Flag,
  RotateCcw,
  Repeat,
  AlertTriangle,
  TriangleAlert,
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
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { PageTemplate } from '@/components/dashboard/PageTemplate';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';

// Hooks
import { useAuthContext } from '@/contexts/AuthContext';
import {
  usePendingApprovals,
  useDelegatedApprovals,
  useProcessApproval,
  useDelegateApproval,
  useApprovalStats,
} from '@/hooks/useApprovals';
import { useDepartments } from '@/hooks/useDepartments';
import { useUsers } from '@/hooks/useUsers';

// Types
import type { RequisitionFilters } from '@/types/requisition.types';

// ============================================
// CONSTANTS
// ============================================

const APPROVAL_LEVELS = [
  { key: 'hod', label: 'HOD', icon: UserCog, color: 'blue', fullName: 'Head of Department' },
  { key: 'accountant', label: 'Accountant', icon: CreditCard, color: 'indigo', fullName: 'Accountant' },
  { key: 'head of institution', label: 'Head of Institution', icon: Crown, color: 'purple', fullName: 'Head of Institution' },
  { key: 'final', label: 'Final Approver', icon: Award, color: 'green', fullName: 'Final Approver' },
];

const PRIORITY_CONFIG: Record<string, { color: string; icon: any; label: string; bgColor: string; borderColor: string }> = {
  low: {
    color: 'text-blue-700 dark:text-blue-400',
    icon: Leaf,
    label: 'Low',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    borderColor: 'border-blue-200 dark:border-blue-800'
  },
  medium: {
    color: 'text-yellow-700 dark:text-yellow-400',
    icon: MinusCircle,
    label: 'Medium',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
    borderColor: 'border-yellow-200 dark:border-yellow-800'
  },
  high: {
    color: 'text-orange-700 dark:text-orange-400',
    icon: Flame,
    label: 'High',
    bgColor: 'bg-orange-50 dark:bg-orange-950/20',
    borderColor: 'border-orange-200 dark:border-orange-800'
  },
  emergency: {
    color: 'text-red-700 dark:text-red-400',
    icon: Zap,
    label: 'Emergency',
    bgColor: 'bg-red-50 dark:bg-red-950/20',
    borderColor: 'border-red-200 dark:border-red-800'
  },
};

const ITEMS_PER_PAGE = 10;

// ============================================
// LOGGING UTILITY
// ============================================

const log = {
  info: (message: string, data?: any) => {
    console.log(`[PendingApprovals] ℹ️ ${message}`, data || '');
  },
  warn: (message: string, data?: any) => {
    console.warn(`[PendingApprovals] ⚠️ ${message}`, data || '');
  },
  error: (message: string, data?: any) => {
    console.error(`[PendingApprovals] ❌ ${message}`, data || '');
  },
  debug: (message: string, data?: any) => {
    console.debug(`[PendingApprovals] 🔍 ${message}`, data || '');
  },
  returnDetected: (requisitionId: number, data?: any) => {
    console.log(
      `[PendingApprovals] 🔄 RETURN DETECTED: Requisition #${requisitionId} has been returned`,
      data || ''
    );
  },
};

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

const formatDate = (date: string | Date | null): string => {
  if (!date) return 'N/A';
  try {
    return format(new Date(date), 'dd MMM yyyy, HH:mm');
  } catch {
    return 'Invalid Date';
  }
};

const formatRelativeTime = (date: string | Date | null): string => {
  if (!date) return 'N/A';
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return 'Invalid Date';
  }
};

const getInitials = (name: string): string => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const getFullName = (user: any): string => {
  if (!user) return 'Unknown';
  if (user.full_name) return user.full_name;
  const firstName = user.first_name || '';
  const lastName = user.last_name || '';
  return [firstName, lastName].filter(Boolean).join(' ') || 'Unknown';
};

const getPriorityInfo = (priority: string) => {
  return PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.medium;
};

// ============================================
// RETURN INDICATOR COMPONENTS
// ============================================

interface ReturnedBadgeProps {
  className?: string;
  size?: 'sm' | 'md';
}

const ReturnedBadge = ({ className, size = 'sm' }: ReturnedBadgeProps) => {
  const sizeClasses = size === 'sm' ? 'text-[8px] px-1.5 py-0.5' : 'text-xs px-2 py-1';
  const iconSize = size === 'sm' ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={cn(
              "flex items-center gap-1 font-medium bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
              sizeClasses,
              className
            )}
          >
            <RotateCcw className={iconSize} />
            Returned
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="font-medium">🔄 Requisition Returned for Revision</p>
          <p className="text-xs text-muted-foreground mt-1">
            This requisition has been returned for revision. Please review changes carefully before approving.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// ============================================
// RETURN WARNING BANNER
// ============================================

interface ReturnWarningBannerProps {
  requisitionId?: number;
  requisitionTitle?: string;
  className?: string;
}

const ReturnWarningBanner = ({
  requisitionId,
  requisitionTitle,
  className
}: ReturnWarningBannerProps) => {
  return (
    <Alert className={cn("bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800", className)}>
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <AlertTitle className="font-semibold flex items-center gap-2 text-amber-800 dark:text-amber-300">
            <RotateCcw className="h-4 w-4" />
            Previously Returned for Revision
          </AlertTitle>
          <AlertDescription className="text-amber-700 dark:text-amber-400 text-sm">
            <p>
              {requisitionTitle ? `"${requisitionTitle}"` : 'This requisition'} has been returned for revision.
            </p>
            <p className="text-xs mt-1 opacity-80">
              ⚠️ Please carefully review all changes made since the return before approving.
            </p>
            {requisitionId && (
              <p className="text-xs mt-1 opacity-60 font-mono">
                Requisition ID: {requisitionId}
              </p>
            )}
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
};

// ============================================
// COMPONENTS
// ============================================

const PriorityBadge = ({ priority }: { priority: string }) => {
  const config = getPriorityInfo(priority);
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={cn("flex items-center gap-1.5 text-sm font-medium", config.color, config.bgColor, config.borderColor)}>
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </Badge>
  );
};

// ============================================
// COMMENT CARD COMPONENT
// ============================================

interface CommentCardProps {
  comment: string;
  levelLabel: string;
  timestamp: string;
  isLatest?: boolean;
  status?: string;
}

const CommentCard = ({ comment, levelLabel, timestamp, isLatest = false, status }: CommentCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLong = comment.length > 200;

  const levelInfo = APPROVAL_LEVELS.find(l => l.fullName === levelLabel || l.label === levelLabel);
  const LevelIcon = levelInfo?.icon || Shield;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "p-4 rounded-xl border transition-all duration-200",
        isLatest ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800 shadow-sm" : "bg-gray-50/50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700"
      )}
    >
      <div className="flex items-start gap-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex-shrink-0 border-2 border-gray-200 dark:border-gray-600">
          <LevelIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm flex items-center gap-1.5">
              <LevelIcon className="h-4 w-4" />
              {levelLabel}
            </span>
            {isLatest && (
              <Badge className="bg-blue-500 text-white hover:bg-blue-600 text-xs">Latest</Badge>
            )}
            {status === 'approved' && (
              <Badge className="bg-green-500 text-white hover:bg-green-600 text-xs">Approved</Badge>
            )}
            {status === 'declined' && (
              <Badge variant="destructive" className="text-xs">Declined</Badge>
            )}
            <span className="text-xs text-muted-foreground">{formatRelativeTime(timestamp)}</span>
          </div>
          <div className="mt-1.5">
            <p className={cn(
              "text-sm leading-relaxed text-gray-700 dark:text-gray-300",
              !isExpanded && isLong && "line-clamp-3"
            )}>
              {comment}
            </p>
            {isLong && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-3 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? 'Show less' : 'Read more'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================
// STATUS BADGE COMPONENT
// ============================================

const StatusBadge = ({ status }: { status: string }) => {
  const variants: Record<string, { variant: 'default' | 'success' | 'destructive' | 'warning' | 'outline'; label: string }> = {
    pending: { variant: 'default', label: 'Pending' },
    approved: { variant: 'success', label: 'Approved' },
    declined: { variant: 'destructive', label: 'Declined' },
    delegated: { variant: 'warning', label: 'Delegated' },
    returned: { variant: 'outline', label: 'Returned' },
    cancelled: { variant: 'outline', label: 'Cancelled' },
  };

  const config = variants[status] || variants.pending;

  return (
    <Badge variant={config.variant} className="text-sm font-medium px-3 py-1">
      {config.label}
    </Badge>
  );
};

// ============================================
// DELEGATION MODAL COMPONENT
// ============================================

interface DelegateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  approval: any;
  users: any[];
  isDelegating: boolean;
  onDelegate: (approvalId: number, delegateId: number, comment: string) => void;
}

const DelegateModal = ({
  open,
  onOpenChange,
  approval,
  users,
  isDelegating,
  onDelegate,
}: DelegateModalProps) => {
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [comment, setComment] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  );

  const handleDelegate = () => {
    if (!selectedUser || !approval) return;
    onDelegate(approval.id, parseInt(selectedUser), comment);
  };

  const availableUsers = users.filter((u: any) => {
    if (u.id === approval?.approver_id) return false;
    const userRoles = u.roles?.map((r: any) => r.toLowerCase?.() || r.toLowerCase?.()) || [];
    const userRole = u.role?.toLowerCase?.() || '';
    const approvalRoles = ['hod', 'accountant', 'head of institution', 'final_approver', 'admin', 'super_admin'];
    const hasApprovalRole = userRoles.some((r: string) => approvalRoles.includes(r)) ||
      approvalRoles.includes(userRole);
    const isSupplier = userRoles.includes('supplier') || userRole === 'supplier';
    return hasApprovalRole && !isSupplier;
  });

  const PLACEHOLDER_VALUE = 'none';
  const hasAvailableUsers = availableUsers.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Users className="h-5 w-5 text-blue-600" />
            Delegate Approval
          </DialogTitle>
          <DialogDescription className="text-base">
            Delegate "{approval?.requisition?.reference_number}" to another approver
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          <div className="bg-muted/30 p-4 rounded-xl border">
            <p className="text-sm text-muted-foreground">Current Approver</p>
            <div className="flex items-center gap-3 mt-2">
              <Avatar className="h-8 w-8 border">
                <AvatarFallback className="text-xs bg-blue-50 dark:bg-blue-900/30">
                  {getInitials(getFullName(approval?.approver))}
                </AvatarFallback>
              </Avatar>
              <div>
                <span className="font-medium">{getFullName(approval?.approver)}</span>
                {approval?.approver?.email && (
                  <p className="text-xs text-muted-foreground">{approval.approver.email}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="delegate-user" className="text-sm font-medium">
              Delegate To <span className="text-red-500">*</span>
            </Label>
            <Select
              value={selectedUser || PLACEHOLDER_VALUE}
              onValueChange={(value) => setSelectedUser(value === PLACEHOLDER_VALUE ? '' : value)}
            >
              <SelectTrigger id="delegate-user" className="h-11">
                <SelectValue placeholder="Select an approver..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={PLACEHOLDER_VALUE} disabled>
                  Select an approver...
                </SelectItem>
                {!hasAvailableUsers ? (
                  <SelectItem value="no-users" disabled>
                    No available approvers found
                  </SelectItem>
                ) : (
                  availableUsers.map((user: any) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-7 w-7 border">
                          <AvatarFallback className="text-[10px] bg-blue-50">
                            {getInitials(getFullName(user))}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{getFullName(user)}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {!hasAvailableUsers && (
              <p className="text-sm text-amber-600 flex items-center gap-2 mt-2">
                <AlertCircle className="h-4 w-4" />
                No other approvers available
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal h-11">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal h-11">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="delegate-comment" className="text-sm">Reason for Delegation (Optional)</Label>
            <Textarea
              id="delegate-comment"
              placeholder="E.g., I will be on leave from next week..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="bg-muted/30 p-4 rounded-xl border">
            <p className="text-sm text-muted-foreground">Requisition</p>
            <p className="font-medium mt-1">{approval?.requisition?.title}</p>
            <p className="text-sm text-muted-foreground">
              {formatCurrency(approval?.requisition?.total_amount || 0)} • {approval?.requisition?.items?.length || 0} items
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="h-11">Cancel</Button>
          <Button onClick={handleDelegate} disabled={!selectedUser || isDelegating} className="bg-blue-600 hover:bg-blue-700 h-11 px-6">
            {isDelegating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Delegating...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Delegate
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ============================================
// STATS CARDS COMPONENT
// ============================================

interface StatsCardsProps {
  stats: any;
  isLoading: boolean;
  userRole: string;
  delegatedCount?: number;
  pendingCount?: number;
  returnedCount?: number;
}

const StatsCards = ({ stats, isLoading, userRole, delegatedCount = 0, pendingCount = 0, returnedCount = 0 }: StatsCardsProps) => {
  const levelInfo = APPROVAL_LEVELS.find(l => l.key === userRole);
  const Icon = levelInfo?.icon || Shield;

  const statItems = useMemo(() => [
    {
      label: 'Pending Approvals',
      value: pendingCount || stats?.pending || 0,
      icon: Clock,
      color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20',
    },
    {
      label: 'Delegated to You',
      value: delegatedCount || stats?.delegated_to_you || 0,
      icon: DelegateIcon,
      color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
    },
    {
      label: 'Returned Requisitions',
      value: returnedCount || 0,
      icon: RotateCcw,
      color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
    },
    {
      label: 'Approved by You',
      value: stats?.approved || 0,
      icon: CheckCircle,
      color: 'text-green-600 bg-green-50 dark:bg-green-900/20',
    },
  ], [stats, delegatedCount, pendingCount, returnedCount]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-5">
              <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-2/3 mb-2" />
              <div className="h-8 bg-gray-200 rounded dark:bg-gray-700 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statItems.map((item) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-800">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
                <div className={cn("p-2.5 rounded-xl", item.color)}>
                  <item.icon className="h-5 w-5" />
                </div>
              </div>
              <motion.p
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="text-3xl font-bold mt-2 bg-gradient-to-r bg-clip-text text-transparent from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400"
              >
                {item.value}
              </motion.p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

// ============================================
// MAIN PAGE COMPONENT - FULL SPLIT VIEW
// ============================================

export default function PendingApprovalsPage() {
  const router = useRouter();
  const { user } = useAuthContext();
  const { useAllDepartments } = useDepartments();
  const { useGetUsers } = useUsers();

  const { data: departmentsData, isLoading: departmentsLoading } = useAllDepartments();
  const { data: usersData, isLoading: usersLoading } = useGetUsers({});

  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<RequisitionFilters & { approval_level?: string }>({
    page: 1,
    per_page: ITEMS_PER_PAGE,
  });
  const [selectedApprovalId, setSelectedApprovalId] = useState<number | null>(null);
  const [selectedApproval, setSelectedApproval] = useState<any>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);
  const [showDelegateDialog, setShowDelegateDialog] = useState(false);
  const [comment, setComment] = useState('');
  const [reason, setReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'created_at',
    direction: 'desc',
  });
  const [showFilters, setShowFilters] = useState(false);

  const departments = useMemo(() => {
    if (!departmentsData) return [];
    if (Array.isArray(departmentsData)) return departmentsData;
    if (departmentsData?.data && Array.isArray(departmentsData.data)) return departmentsData.data;
    return [];
  }, [departmentsData]);

  const users = useMemo(() => {
    if (!usersData) return [];
    if (Array.isArray(usersData)) return usersData;
    if (usersData?.data && Array.isArray(usersData.data)) return usersData.data;
    if (usersData?.users && Array.isArray(usersData.users)) return usersData.users;
    return [];
  }, [usersData]);

  const userRole = useMemo(() => {
    if (!user) return '';
    if (user.roles && user.roles.length > 0) {
      const role = user.roles.find((r: any) =>
        ['hod', 'accountant', 'head of institution', 'final_approver'].includes(r.toLowerCase())
      );
      if (role) return role.toLowerCase();
    }
    if (user.role) {
      const role = user.role.toLowerCase();
      if (['hod', 'accountant', 'head of institution', 'final_approver'].includes(role)) {
        return role;
      }
    }
    return '';
  }, [user]);

  const isAdmin = user?.roles?.some((r: any) =>
    r.toLowerCase() === 'admin' || r.toLowerCase() === 'super_admin'
  );

  log.info('PendingApprovalsPage mounted', {
    userRole,
    userId: user?.id,
    isAdmin
  });

  // Queries
  const pendingApprovalsQuery = usePendingApprovals({
    level: userRole || undefined,
    page: currentPage,
    per_page: ITEMS_PER_PAGE,
  });

  const delegatedApprovalsQuery = useDelegatedApprovals({
    status: 'pending',
    page: currentPage,
    per_page: ITEMS_PER_PAGE,
  });

  const statsQuery = useApprovalStats();

  const { mutate: processApproval, isPending: isProcessing } = useProcessApproval();
  const { mutate: delegateApproval, isPending: isDelegating } = useDelegateApproval();

  // Helper function to extract data from response
  const extractData = (response: any) => {
    if (!response) return { data: [], total: 0, per_page: 10, current_page: 1, last_page: 1 };

    if (response.data && Array.isArray(response.data)) {
      return {
        data: response.data,
        total: response.total || response.data.length,
        per_page: response.per_page || 10,
        current_page: response.current_page || 1,
        last_page: response.last_page || 1,
      };
    }

    if (Array.isArray(response)) {
      return {
        data: response,
        total: response.length,
        per_page: 10,
        current_page: 1,
        last_page: 1,
      };
    }

    if (response.items && Array.isArray(response.items)) {
      return {
        data: response.items,
        total: response.total || response.items.length,
        per_page: response.per_page || 10,
        current_page: response.current_page || 1,
        last_page: response.last_page || 1,
      };
    }

    return { data: [], total: 0, per_page: 10, current_page: 1, last_page: 1 };
  };

  // Get all approvals (merge both queries)
  const pendingExtracted = extractData(pendingApprovalsQuery.data);
  const delegatedExtracted = extractData(delegatedApprovalsQuery.data);

  const allApprovals = useMemo(() => {
    const merged = [...pendingExtracted.data, ...delegatedExtracted.data];
    return merged.filter((item, index, self) =>
      index === self.findIndex((a) => a.id === item.id)
    );
  }, [pendingExtracted.data, delegatedExtracted.data]);

  // Filter by search term
  const filteredApprovals = useMemo(() => {
    let result = allApprovals;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter((a: any) => {
        const ref = a.requisition?.reference_number?.toLowerCase() || '';
        const title = a.requisition?.title?.toLowerCase() || '';
        const requester = getFullName(a.requisition?.user).toLowerCase();
        return ref.includes(term) || title.includes(term) || requester.includes(term);
      });
    }

    // Sort
    const sorted = [...result];
    const { key, direction } = sortConfig;

    sorted.sort((a: any, b: any) => {
      let aVal, bVal;

      switch (key) {
        case 'reference_number':
          aVal = a.requisition?.reference_number || '';
          bVal = b.requisition?.reference_number || '';
          break;
        case 'title':
          aVal = a.requisition?.title || '';
          bVal = b.requisition?.title || '';
          break;
        case 'total_amount':
          aVal = parseFloat(a.requisition?.total_amount) || 0;
          bVal = parseFloat(b.requisition?.total_amount) || 0;
          break;
        case 'status':
          aVal = a.status || '';
          bVal = b.status || '';
          break;
        case 'priority':
          const priorityOrder = { emergency: 0, high: 1, medium: 2, low: 3 };
          aVal = priorityOrder[a.requisition?.priority as keyof typeof priorityOrder] ?? 4;
          bVal = priorityOrder[b.requisition?.priority as keyof typeof priorityOrder] ?? 4;
          break;
        case 'requester':
          aVal = getFullName(a.requisition?.user);
          bVal = getFullName(b.requisition?.user);
          break;
        default:
          aVal = a.created_at || '';
          bVal = b.created_at || '';
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return direction === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      } else {
        return direction === 'asc'
          ? (aVal as number) - (bVal as number)
          : (bVal as number) - (aVal as number);
      }
    });

    return sorted;
  }, [allApprovals, searchTerm, sortConfig]);

  // Calculate returned count
  const returnedCount = useMemo(() => {
    return filteredApprovals.filter((a: any) => (a?.requisition?.return_count || 0) > 0).length;
  }, [filteredApprovals]);

  // Log returned requisitions
  useEffect(() => {
    const returnedRequisitions = filteredApprovals.filter((a: any) => (a?.requisition?.return_count || 0) > 0);
    if (returnedRequisitions.length > 0) {
      log.warn(`${returnedRequisitions.length} returned requisition(s) detected`, {
        returnedRequisitions: returnedRequisitions.map((a: any) => ({
          approvalId: a.id,
          requisitionId: a?.requisition?.id,
          title: a?.requisition?.title,
        })),
      });
    }
  }, [filteredApprovals]);

  // Set selected approval when data changes or selected ID changes
  useEffect(() => {
    if (selectedApprovalId) {
      const found = filteredApprovals.find((a: any) => a.id === selectedApprovalId);
      setSelectedApproval(found || null);
      // Log if the selected approval is returned
      if (found && (found?.requisition?.return_count || 0) > 0) {
        log.returnDetected(found.requisition.id, { approvalId: found.id, title: found.requisition.title });
      }
    } else if (filteredApprovals.length > 0) {
      setSelectedApprovalId(filteredApprovals[0].id);
      setSelectedApproval(filteredApprovals[0]);
    } else {
      setSelectedApproval(null);
    }
  }, [filteredApprovals, selectedApprovalId]);

  const isLoading = pendingApprovalsQuery.isLoading ||
    delegatedApprovalsQuery.isLoading ||
    departmentsLoading ||
    usersLoading;

  const stats = statsQuery.data;
  const delegatedCount = delegatedExtracted.total || 0;
  const pendingCount = pendingExtracted.total || 0;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSelectApproval = (approval: any) => {
    setSelectedApprovalId(approval.id);
    setSelectedApproval(approval);
  };

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleFilterChange = useCallback((key: keyof (RequisitionFilters & { approval_level?: string }), value: any) => {
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

  const handleApplyFilters = useCallback(() => {
    pendingApprovalsQuery.refetch();
    delegatedApprovalsQuery.refetch();
    statsQuery.refetch();
    setShowFilters(false);
  }, [pendingApprovalsQuery, delegatedApprovalsQuery, statsQuery]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    setFilters(prev => ({
      ...prev,
      page,
    }));
  }, []);

  const handleView = useCallback((requisitionId: number) => {
    router.push(`/requisitions/${requisitionId}`);
  }, [router]);

  const handleApprove = useCallback((approval: any, commentText: string) => {
    setSelectedApproval(approval);
    setComment(commentText || '');
    setShowApproveDialog(true);
  }, []);

  const handleConfirmApprove = useCallback(() => {
    if (selectedApproval) {
      const requisitionId = selectedApproval.requisition?.id;
      const level = selectedApproval.level;

      if (!requisitionId || !level) {
        console.error('Missing requisition ID or level');
        return;
      }

      processApproval({
        requisitionId,
        level,
        data: {
          action: 'approved',
          comment: comment || undefined,
        },
      }, {
        onSuccess: () => {
          setShowApproveDialog(false);
          setSelectedApproval(null);
          setComment('');
          pendingApprovalsQuery.refetch();
          delegatedApprovalsQuery.refetch();
          statsQuery.refetch();
        },
        onError: (error: any) => {
          console.error('Approval failed:', error);
        }
      });
    }
  }, [selectedApproval, comment, processApproval, pendingApprovalsQuery, delegatedApprovalsQuery, statsQuery]);

  const handleDecline = useCallback((approval: any, reasonText: string) => {
    setSelectedApproval(approval);
    setReason(reasonText || '');
    setShowDeclineDialog(true);
  }, []);

  const handleConfirmDecline = useCallback(() => {
    if (selectedApproval && reason.trim()) {
      const requisitionId = selectedApproval.requisition?.id;
      const level = selectedApproval.level;

      if (!requisitionId || !level) {
        console.error('Missing requisition ID or level');
        return;
      }

      processApproval({
        requisitionId,
        level,
        data: {
          action: 'declined',
          reason: reason.trim(),
        },
      }, {
        onSuccess: () => {
          setShowDeclineDialog(false);
          setSelectedApproval(null);
          setReason('');
          pendingApprovalsQuery.refetch();
          delegatedApprovalsQuery.refetch();
          statsQuery.refetch();
        },
        onError: (error: any) => {
          console.error('Decline failed:', error);
        }
      });
    }
  }, [selectedApproval, reason, processApproval, pendingApprovalsQuery, delegatedApprovalsQuery, statsQuery]);

  const handleDelegate = useCallback((approval: any) => {
    setSelectedApproval(approval);
    setShowDelegateDialog(true);
  }, []);

  const handleConfirmDelegate = useCallback((approvalId: number, delegateId: number, commentText: string) => {
    delegateApproval({
      approvalId,
      data: {
        delegate_id: delegateId,
        comment: commentText || undefined,
      },
    }, {
      onSuccess: () => {
        setShowDelegateDialog(false);
        setSelectedApproval(null);
        pendingApprovalsQuery.refetch();
        delegatedApprovalsQuery.refetch();
        statsQuery.refetch();
      },
      onError: (error: any) => {
        console.error('Delegation failed:', error);
      }
    });
  }, [delegateApproval, pendingApprovalsQuery, delegatedApprovalsQuery, statsQuery]);

  if (!isAdmin && !userRole) {
    return (
      <PageTemplate
        title="Pending Approvals"
        description="You do not have permission to view this page"
        icon={<Shield className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />}
      >
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You do not have the required permissions to view pending approvals.
            Please contact your administrator if you believe this is an error.
          </AlertDescription>
        </Alert>
        <div className="flex justify-center mt-6">
          <Button onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Return to Dashboard
          </Button>
        </div>
      </PageTemplate>
    );
  }

  const levelInfo = APPROVAL_LEVELS.find(l => l.key === userRole);
  const totalItems = filteredApprovals.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) return <ChevronDown className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100" />;
    return sortConfig.direction === 'asc'
      ? <SortAsc className="h-3.5 w-3.5" />
      : <SortDesc className="h-3.5 w-3.5" />;
  };

  // Check if selected is returned
  const selectedIsReturned = (selectedApproval?.requisition?.return_count || 0) > 0;

  return (
    <PageTemplate
      title={`${levelInfo?.label || 'Pending'} Approvals`}
      description={`Review and approve requisitions waiting for your ${levelInfo?.label?.toLowerCase() || 'approval'}`}
      icon={<Shield className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />}
      actions={
        <div className="flex items-center gap-2 flex-wrap">
          {returnedCount > 0 && (
            <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 gap-1.5 px-3 py-1.5">
              <RotateCcw className="h-3.5 w-3.5" />
              {returnedCount} Returned
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              pendingApprovalsQuery.refetch();
              delegatedApprovalsQuery.refetch();
              statsQuery.refetch();
            }}
            className="gap-2 h-9"
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            Refresh
          </Button>
          <Badge variant="default" className="gap-1.5 h-9 px-3">
            <Clock className="h-4 w-4" />
            {pendingCount} Pending
          </Badge>
          {delegatedCount > 0 && (
            <Badge variant="secondary" className="gap-1.5 h-9 px-3 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
              <DelegateIcon className="h-4 w-4" />
              {delegatedCount} Delegated
            </Badge>
          )}
        </div>
      }
    >
      <StatsCards
        stats={stats}
        isLoading={statsQuery.isLoading}
        userRole={userRole}
        delegatedCount={delegatedCount}
        pendingCount={pendingCount}
        returnedCount={returnedCount}
      />

      {/* Return Count Summary Banner */}
      {returnedCount > 0 && (
        <Alert className="mt-4 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertTitle className="text-amber-800 dark:text-amber-300 text-sm font-semibold">
            {returnedCount} Requisition{returnedCount > 1 ? 's' : ''} Previously Returned
          </AlertTitle>
          <AlertDescription className="text-amber-700 dark:text-amber-400 text-sm">
            {returnedCount} requisition{returnedCount > 1 ? 's' : ''} in your pending list {returnedCount > 1 ? 'have' : 'has'} been returned for revision.
            Please review changes carefully before approving.
          </AlertDescription>
        </Alert>
      )}

      {/* Full Split View */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-480px)] min-h-[600px]">
        {/* LEFT PANEL - Table with Filters */}
        <Card className="border-2 shadow-xl overflow-hidden flex flex-col bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-950/50">
          {/* Toolbar - Search + Filters */}
          <div className="p-4 border-b bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by reference, title or requester..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="pl-9 h-10 bg-background"
                  />
                </div>
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-10 px-3 flex-shrink-0"
                    onClick={() => setSearchTerm('')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <Button
                variant={showFilters ? "default" : "outline"}
                size="sm"
                className="h-10 gap-2 flex-shrink-0"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" />
                {showFilters ? 'Hide Filters' : 'Filters'}
              </Button>
              <Badge variant="secondary" className="text-sm px-3 py-1 flex-shrink-0">
                {filteredApprovals.length} results
              </Badge>
            </div>

            {/* Expanded Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <Select
                        value={filters.status as string || 'all'}
                        onValueChange={(value) => handleFilterChange('status', value === 'all' ? undefined : value)}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="delegated">Delegated</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="declined">Declined</SelectItem>
                          <SelectItem value="returned">Returned</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select
                        value={filters.priority as string || 'all'}
                        onValueChange={(value) => handleFilterChange('priority', value === 'all' ? undefined : value)}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Priorities</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="emergency">Emergency</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select
                        value={filters.department_id?.toString() || 'all'}
                        onValueChange={(value) => handleFilterChange('department_id', value === 'all' ? undefined : parseInt(value))}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Departments</SelectItem>
                          {departments.map((dept: any) => (
                            <SelectItem key={dept.id} value={dept.id.toString()}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={filters.approval_level as string || 'all'}
                        onValueChange={(value) => handleFilterChange('approval_level', value === 'all' ? undefined : value)}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Levels</SelectItem>
                          {APPROVAL_LEVELS.map((level) => (
                            <SelectItem key={level.key} value={level.key}>
                              {level.fullName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 flex-1">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="h-10 gap-2">
                              <CalendarIcon className="h-4 w-4" />
                              {filters.date_from ? format(new Date(filters.date_from), 'dd/MM/yyyy') : 'From'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <CalendarComponent
                              mode="single"
                              selected={filters.date_from ? new Date(filters.date_from) : undefined}
                              onSelect={(date) => handleFilterChange('date_from', date ? format(date, 'yyyy-MM-dd') : undefined)}
                            />
                          </PopoverContent>
                        </Popover>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="h-10 gap-2">
                              <CalendarIcon className="h-4 w-4" />
                              {filters.date_to ? format(new Date(filters.date_to), 'dd/MM/yyyy') : 'To'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <CalendarComponent
                              mode="single"
                              selected={filters.date_to ? new Date(filters.date_to) : undefined}
                              onSelect={(date) => handleFilterChange('date_to', date ? format(date, 'yyyy-MM-dd') : undefined)}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-10"
                        onClick={handleResetFilters}
                      >
                        Reset
                      </Button>
                      <Button
                        size="sm"
                        className="h-10 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                        onClick={handleApplyFilters}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Apply
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Table Container - Scrollable */}
          <div className="flex-1 overflow-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
              </div>
            ) : filteredApprovals.length === 0 ? (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/20 mb-4">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">All Caught Up!</h3>
                <p className="text-muted-foreground">No pending approvals found</p>
                <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="min-w-full">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-muted/95 backdrop-blur">
                    <TableRow className="hover:bg-transparent">
                      <TableHead
                        className="cursor-pointer group hover:text-blue-600 transition-colors min-w-[140px] whitespace-nowrap text-sm font-semibold"
                        onClick={() => handleSort('reference_number')}
                      >
                        <div className="flex items-center gap-2">
                          <Hash className="h-3.5 w-3.5" />
                          Reference
                          {getSortIcon('reference_number')}
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer group hover:text-blue-600 transition-colors min-w-[160px] whitespace-nowrap text-sm font-semibold"
                        onClick={() => handleSort('title')}
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="h-3.5 w-3.5" />
                          Title
                          {getSortIcon('title')}
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer group hover:text-blue-600 transition-colors min-w-[120px] whitespace-nowrap text-sm font-semibold"
                        onClick={() => handleSort('requester')}
                      >
                        <div className="flex items-center gap-2">
                          <User className="h-3.5 w-3.5" />
                          Requester
                          {getSortIcon('requester')}
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer group hover:text-blue-600 transition-colors text-right min-w-[120px] whitespace-nowrap text-sm font-semibold"
                        onClick={() => handleSort('total_amount')}
                      >
                        <div className="flex items-center justify-end gap-2">
                          <DollarSign className="h-3.5 w-3.5" />
                          Amount
                          {getSortIcon('total_amount')}
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer group hover:text-blue-600 transition-colors min-w-[100px] whitespace-nowrap text-sm font-semibold"
                        onClick={() => handleSort('status')}
                      >
                        <div className="flex items-center gap-2">
                          <Shield className="h-3.5 w-3.5" />
                          Status
                          {getSortIcon('status')}
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer group hover:text-blue-600 transition-colors min-w-[80px] whitespace-nowrap text-sm font-semibold"
                        onClick={() => handleSort('priority')}
                      >
                        <div className="flex items-center gap-2">
                          <Flag className="h-3.5 w-3.5" />
                          Priority
                          {getSortIcon('priority')}
                        </div>
                      </TableHead>
                      <TableHead className="w-[50px]">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApprovals.map((approval: any) => {
                      const isSelected = selectedApprovalId === approval.id;
                      const requisition = approval.requisition;
                      const isDelegated = approval.delegate_id && approval.delegate_id !== approval.approver_id;
                      const hasBeenDeclined = requisition?.approvals?.some((a: any) =>
                        a.status === 'declined' || a.status === 'cancelled'
                      );
                      const isPending = approval.status === 'pending' || approval.status === 'delegated';
                      const isReturned = (requisition?.return_count || 0) > 0;

                      return (
                        <TableRow
                          key={approval.id}
                          className={cn(
                            "cursor-pointer transition-all duration-200 hover:bg-muted/50",
                            isSelected && "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-l-4 border-l-blue-500 shadow-sm",
                            hasBeenDeclined && "bg-red-50/30 dark:bg-red-950/10 opacity-60",
                            isReturned && "border-l-4 border-l-amber-400 bg-amber-50/20 dark:bg-amber-950/20"
                          )}
                          onClick={() => handleSelectApproval(approval)}
                        >
                          <TableCell className="font-mono text-sm whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {isReturned && <RotateCcw className="h-3.5 w-3.5 text-amber-500" />}
                              {requisition?.reference_number || 'N/A'}
                              {isReturned && <ReturnedBadge size="sm" />}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium truncate max-w-[140px]">
                                {requisition?.title || 'Untitled'}
                              </span>
                              {isDelegated && !hasBeenDeclined && (
                                <Badge variant="outline" className="text-xs px-2 py-0 bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800 flex-shrink-0">
                                  <DelegateIcon className="h-3 w-3 mr-1" />
                                  Delegated
                                </Badge>
                              )}
                              {isReturned && (
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800 flex-shrink-0">
                                  Returned
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm whitespace-nowrap">
                            {getFullName(requisition?.user)}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                            {formatCurrency(requisition?.total_amount || 0)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              {hasBeenDeclined ? (
                                <Badge variant="destructive" className="text-sm whitespace-nowrap">
                                  Declined
                                </Badge>
                              ) : isPending ? (
                                <Badge variant="default" className="text-sm bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 whitespace-nowrap">
                                  {isDelegated ? 'Delegated' : 'Pending'}
                                </Badge>
                              ) : (
                                <StatusBadge status={approval.status} />
                              )}
                              {isReturned && (
                                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                                  (Returned)
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <PriorityBadge priority={requisition?.priority || 'medium'} />
                          </TableCell>
                          <TableCell>
                            {isPending && !hasBeenDeclined && (
                              <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse" />
                                {isReturned && (
                                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                )}
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* Pagination - Fixed */}
          {totalItems > ITEMS_PER_PAGE && (
            <div className="p-3 border-t flex justify-between items-center bg-muted/10 flex-shrink-0">
              <p className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} of {totalItems}
              </p>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-3"
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-3"
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* RIGHT PANEL - Details & Actions - Scrollable */}
        <Card className="border-2 shadow-xl overflow-hidden flex flex-col bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-950/50">
          {selectedApproval ? (
            <>
              {/* Header - Fixed */}
              <div className={cn(
                "p-5 border-b flex-shrink-0",
                selectedIsReturned ? "bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800" : "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30"
              )}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-lg font-bold truncate">
                        {selectedIsReturned && <RotateCcw className="h-4 w-4 inline mr-1.5 text-amber-500" />}
                        {selectedApproval.requisition?.title || 'Untitled'}
                      </h3>
                      <Badge variant="outline" className="text-sm font-mono px-3 py-1 flex-shrink-0">
                        {selectedApproval.requisition?.reference_number}
                      </Badge>
                      {selectedIsReturned && <ReturnedBadge size="md" />}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1.5 whitespace-nowrap">
                        <User className="h-4 w-4" />
                        {getFullName(selectedApproval.requisition?.user)}
                      </span>
                      <span className="flex items-center gap-1.5 whitespace-nowrap">
                        <Building2 className="h-4 w-4" />
                        {selectedApproval.requisition?.department?.name || 'N/A'}
                      </span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400 whitespace-nowrap text-base">
                        {formatCurrency(selectedApproval.requisition?.total_amount || 0)}
                      </span>
                      {selectedIsReturned && (
                        <span className="text-amber-600 dark:text-amber-400 text-sm font-medium flex items-center gap-1">
                          <RotateCcw className="h-3 w-3" />
                          Returned
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant="default" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-3 py-1.5 text-sm">
                      <UserCog className="h-4 w-4 mr-1.5" />
                      {levelInfo?.label || userRole || 'Approver'}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-0 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30"
                      onClick={() => handleView(selectedApproval.requisition?.id)}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-auto p-5">
                <div className="space-y-5">
                  {/* RETURN WARNING BANNER - PROMINENT at top of details */}
                  {selectedIsReturned && (
                    <ReturnWarningBanner
                      requisitionId={selectedApproval.requisition?.id}
                      requisitionTitle={selectedApproval.requisition?.title}
                      className="mb-2"
                    />
                  )}

                  {/* Status Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/30 rounded-xl p-4 border">
                      <p className="text-sm text-muted-foreground font-medium">Status</p>
                      <div className="mt-2 flex items-center gap-2">
                        <StatusBadge status={selectedApproval.status} />
                        {selectedIsReturned && <ReturnedBadge size="sm" />}
                      </div>
                    </div>
                    <div className="bg-muted/30 rounded-xl p-4 border">
                      <p className="text-sm text-muted-foreground font-medium">Priority</p>
                      <div className="mt-2">
                        <PriorityBadge priority={selectedApproval.requisition?.priority || 'medium'} />
                      </div>
                    </div>
                  </div>

                  {/* Approval Progress */}
                  <div className="bg-muted/30 rounded-xl p-4 border">
                    <p className="text-sm text-muted-foreground font-medium mb-3">Approval Progress</p>
                    <div className="flex items-center gap-3 overflow-x-auto pb-2">
                      {APPROVAL_LEVELS.map((level, index) => {
                        const approvalItem = selectedApproval.requisition?.approvals?.find((a: any) => a.level === level.key);
                        const status = approvalItem?.status || 'pending';
                        const isCompleted = status === 'approved';
                        const isPendingStatus = status === 'pending';
                        const isDeclinedStatus = status === 'declined' || status === 'returned' || status === 'cancelled';
                        const isDelegatedStatus = status === 'delegated';

                        return (
                          <div key={level.key} className="flex items-center flex-shrink-0">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className={cn(
                                    "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200",
                                    isCompleted && "bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/30",
                                    isPendingStatus && "bg-yellow-500 border-yellow-500 text-white animate-pulse shadow-lg shadow-yellow-500/30",
                                    isDeclinedStatus && "bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/30",
                                    isDelegatedStatus && "bg-purple-500 border-purple-500 text-white shadow-lg shadow-purple-500/30",
                                    !isCompleted && !isPendingStatus && !isDeclinedStatus && !isDelegatedStatus && "bg-gray-200 border-gray-300 text-gray-400 dark:bg-gray-700 dark:border-gray-600"
                                  )}>
                                    {isCompleted ? (
                                      <CheckCircle className="h-5 w-5" />
                                    ) : isPendingStatus ? (
                                      <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : isDeclinedStatus ? (
                                      <XCircle className="h-5 w-5" />
                                    ) : isDelegatedStatus ? (
                                      <DelegateIcon className="h-5 w-5" />
                                    ) : (
                                      <level.icon className="h-5 w-5" />
                                    )}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="text-sm">
                                  <p className="font-semibold">{level.fullName}</p>
                                  <p className="text-xs">
                                    {isCompleted ? '✅ Approved' :
                                      isPendingStatus ? '⏳ Pending' :
                                        isDeclinedStatus ? '❌ Declined' :
                                          isDelegatedStatus ? '🔄 Delegated' :
                                            '⏸ Not Started'}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            {index < APPROVAL_LEVELS.length - 1 && (
                              <div className={cn(
                                "w-6 h-0.5",
                                isCompleted ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
                              )} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-3">
                      <Progress
                        value={(selectedApproval.requisition?.approvals?.filter((a: any) => a.status === 'approved').length || 0) / APPROVAL_LEVELS.length * 100}
                        className="h-2"
                      />
                      <p className="text-sm text-muted-foreground mt-2 font-medium">
                        {selectedApproval.requisition?.approvals?.filter((a: any) => a.status === 'approved').length || 0} of {APPROVAL_LEVELS.length} completed
                      </p>
                    </div>
                  </div>

                  {/* Requisition Details */}
                  <div className="bg-muted/30 rounded-xl p-4 border">
                    <p className="text-sm text-muted-foreground font-medium mb-3 flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      Requisition Details
                    </p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Type</p>
                        <p className="font-medium capitalize">{selectedApproval.requisition?.type || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Urgency</p>
                        <p className="font-medium capitalize">{selectedApproval.requisition?.urgency || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Risk Level</p>
                        <p className="font-medium capitalize">{selectedApproval.requisition?.risk_level || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Items</p>
                        <p className="font-medium">{selectedApproval.requisition?.items?.length || 0}</p>
                      </div>
                      {selectedApproval.requisition?.budget_code && (
                        <div className="col-span-2">
                          <p className="text-muted-foreground">Budget Code</p>
                          <p className="font-medium font-mono">{selectedApproval.requisition.budget_code}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Comments */}
                  {selectedApproval.requisition?.approvals?.filter((a: any) => a.comment || a.reason || a.decline_reason).length > 0 && (
                    <div className="bg-muted/30 rounded-xl p-4 border">
                      <p className="text-sm text-muted-foreground font-medium mb-3 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Approval Comments ({selectedApproval.requisition.approvals.filter((a: any) => a.comment || a.reason || a.decline_reason).length})
                      </p>
                      <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2">
                        {selectedApproval.requisition.approvals
                          .filter((a: any) => a.comment || a.reason || a.decline_reason)
                          .sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
                          .map((a: any, index: number) => {
                            const levelInfo = APPROVAL_LEVELS.find(l => l.key === a.level);
                            return (
                              <CommentCard
                                key={a.id}
                                comment={a.comment || a.reason || a.decline_reason}
                                levelLabel={levelInfo?.fullName || a.level}
                                timestamp={a.updated_at}
                                status={a.status}
                                isLatest={index === 0}
                              />
                            );
                          })}
                      </div>
                    </div>
                  )}

                  {/* Delegation Info */}
                  {selectedApproval.delegate_id && selectedApproval.delegate_id !== selectedApproval.approver_id && (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                      <p className="text-sm text-muted-foreground font-medium mb-2 flex items-center gap-2">
                        <DelegateIcon className="h-4 w-4 text-purple-500" />
                        Delegation Info
                      </p>
                      <div className="flex items-center gap-3 text-sm flex-wrap">
                        <span className="text-muted-foreground">Delegated by:</span>
                        <span className="font-medium">{getFullName(selectedApproval.approver)}</span>
                        <span className="text-muted-foreground">→</span>
                        <span className="font-medium text-purple-600 dark:text-purple-400">{getFullName(selectedApproval.delegate)}</span>
                        <Badge variant="default" className="bg-purple-500 text-white text-xs">You</Badge>
                      </div>
                      {selectedApproval.delegated_at && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {formatRelativeTime(selectedApproval.delegated_at)}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Declined Alert */}
                  {selectedApproval.requisition?.approvals?.some((a: any) =>
                    a.status === 'declined' || a.status === 'cancelled'
                  ) && (
                      <Alert variant="destructive" className="border-2">
                        <AlertCircle className="h-5 w-5" />
                        <AlertTitle className="text-base font-semibold">Requisition Declined</AlertTitle>
                        <AlertDescription className="text-sm">
                          This requisition has been declined and cannot be processed further.
                          {selectedApproval.requisition.approvals.find((a: any) => a.status === 'declined')?.decline_reason && (
                            <span className="block mt-2 p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
                              <strong>Reason:</strong> {selectedApproval.requisition.approvals.find((a: any) => a.status === 'declined')?.decline_reason}
                            </span>
                          )}
                        </AlertDescription>
                      </Alert>
                    )}

                  {/* Action Buttons */}
                  {!selectedApproval.requisition?.approvals?.some((a: any) =>
                    a.status === 'declined' || a.status === 'cancelled'
                  ) && (selectedApproval.status === 'pending' || selectedApproval.status === 'delegated') && (
                      <div className="flex flex-col gap-3 pt-2">
                        {selectedIsReturned && (
                          <Alert className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
                            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            <AlertTitle className="text-amber-800 dark:text-amber-300 text-sm font-semibold">
                              Previously Returned
                            </AlertTitle>
                            <AlertDescription className="text-amber-700 dark:text-amber-400 text-sm">
                              This requisition has been returned for revision.
                              Please review all changes carefully before making a decision.
                            </AlertDescription>
                          </Alert>
                        )}
                        <div className="grid grid-cols-3 gap-3">
                          <Button
                            variant="outline"
                            className="h-12 text-purple-600 hover:text-purple-700 hover:bg-purple-50 border-purple-200 dark:border-purple-800 dark:hover:bg-purple-950/30 gap-2 text-base font-medium"
                            onClick={() => handleDelegate(selectedApproval)}
                            disabled={isProcessing}
                          >
                            <UserPlus className="h-5 w-5" />
                            Delegate
                          </Button>
                          <Button
                            variant="destructive"
                            className="h-12 gap-2 text-base font-medium"
                            onClick={() => handleDecline(selectedApproval, '')}
                            disabled={isProcessing}
                          >
                            {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : <X className="h-5 w-5" />}
                            Decline
                          </Button>
                          <Button
                            variant="default"
                            className={cn(
                              "h-12 gap-2 text-base font-medium shadow-lg",
                              selectedIsReturned
                                ? "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-amber-600/30"
                                : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-green-600/30"
                            )}
                            onClick={() => handleApprove(selectedApproval, '')}
                            disabled={isProcessing}
                          >
                            {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
                            {selectedIsReturned ? 'Approve with Caution' : 'Approve'}
                          </Button>
                        </div>
                      </div>
                    )}

                  {!selectedApproval.requisition?.approvals?.some((a: any) =>
                    a.status === 'declined' || a.status === 'cancelled'
                  ) && selectedApproval.status !== 'pending' && selectedApproval.status !== 'delegated' && (
                      <div className="text-center py-6 bg-muted/30 rounded-xl border">
                        <Info className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm font-medium text-muted-foreground">This approval has already been processed</p>
                      </div>
                    )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-sm">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                  <FileText className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Selection</h3>
                <p className="text-muted-foreground">Select a requisition from the list to view details and take action</p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Dialogs */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Approve Requisition</DialogTitle>
            <DialogDescription className="text-base">
              Approve "{selectedApproval?.requisition?.reference_number}" - {selectedApproval?.requisition?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="approve-comment" className="text-sm font-medium">Comment (Optional)</Label>
              <Textarea
                id="approve-comment"
                placeholder="Add any comments about this approval..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>
            <div className="bg-muted/30 p-4 rounded-xl border">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Amount</span>
                <span className="font-semibold">{formatCurrency(selectedApproval?.requisition?.total_amount || 0)}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-muted-foreground">Items</span>
                <span className="font-semibold">{selectedApproval?.requisition?.items?.length || 0}</span>
              </div>
              {selectedApproval?.requisition?.return_count > 0 && (
                <div className="flex justify-between text-sm mt-2 pt-2 border-t border-amber-200 dark:border-amber-800">
                  <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                    <RotateCcw className="h-3 w-3" />
                    Returned
                  </span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400">
                    Yes
                  </span>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)} className="h-11">Cancel</Button>
            <Button
              onClick={handleConfirmApprove}
              className={cn(
                "h-11 px-6",
                selectedApproval?.requisition?.return_count > 0
                  ? "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                  : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              )}
              disabled={isProcessing}
            >
              {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
              {selectedApproval?.requisition?.return_count > 0 ? 'Approve with Caution' : 'Approve'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeclineDialog} onOpenChange={setShowDeclineDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Decline Requisition</DialogTitle>
            <DialogDescription className="text-base">
              Decline "{selectedApproval?.requisition?.reference_number}" - {selectedApproval?.requisition?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="decline-reason" className="text-sm font-medium">
                Reason for Decline <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="decline-reason"
                placeholder="Provide a clear reason for declining this requisition..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>
            <div className="bg-muted/30 p-4 rounded-xl border">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Amount</span>
                <span className="font-semibold">{formatCurrency(selectedApproval?.requisition?.total_amount || 0)}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-muted-foreground">Items</span>
                <span className="font-semibold">{selectedApproval?.requisition?.items?.length || 0}</span>
              </div>
              {selectedApproval?.requisition?.return_count > 0 && (
                <div className="flex justify-between text-sm mt-2 pt-2 border-t border-amber-200 dark:border-amber-800">
                  <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                    <RotateCcw className="h-3 w-3" />
                    Returned
                  </span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400">
                    Yes
                  </span>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeclineDialog(false)} className="h-11">Cancel</Button>
            <Button
              onClick={handleConfirmDecline}
              disabled={!reason.trim() || isProcessing}
              variant="destructive"
              className="h-11 px-6"
            >
              {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <X className="h-4 w-4 mr-2" />}
              Decline
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DelegateModal
        open={showDelegateDialog}
        onOpenChange={setShowDelegateDialog}
        approval={selectedApproval}
        users={users}
        isDelegating={isDelegating}
        onDelegate={handleConfirmDelegate}
      />
    </PageTemplate>
  );
}
