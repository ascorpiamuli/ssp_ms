// frontend/src/app/(dashboard)/requisitions/pending/page.tsx

'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
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
  FileText,
  Loader2,
  RefreshCw,
  Search,
  ChevronDown,
  ChevronUp,
  Crown,
  Award,
  CreditCard,
  UserCog,
  Zap,
  Flame,
  Leaf,
  Check,
  X,
  Info,
  ArrowLeft,
  Users,
  UserPlus,
  Calendar as CalendarIcon,
  Sparkles,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  SortAsc,
  SortDesc,
  DollarSign,
  Flag,
  RotateCcw,
  AlertTriangle,
  Minus,
  LayoutGrid,
  Table as TableIcon,
  Mail,
  Bell,
  Clock as ClockIcon,
  Calendar,
  UserCircle,
  Briefcase,
  BarChart3,
  Activity,
  TrendingUp as TrendingUpIcon,
  GripVertical,
  Star,
  TrendingUp,
  TrendingDown,
  Plus,
  Repeat,
  ArrowUpRight,
  ArrowDownRight,
  Sparkle,
  Gem,
  ShieldCheck,
  BadgeCheck,
  CircleCheck,
  CircleX,
  CircleAlert,
  CircleDot,
  Layers,
  GitBranch,
  Target,
  Rocket,
  Medal,
  Trophy,
  Briefcase as BriefcaseIcon,
  ClipboardCheck,
  Hourglass,
  Timer,
  BarChart4,
  PieChart as PieChartIcon,
  Gauge,
  Filter,
  SlidersHorizontal,
  Download,
  Printer,
  Share2,
  Bookmark,
  BookmarkCheck,
  BellRing,
  MessageSquare,
  Phone,
  MailCheck,
  Send,
  Globe,
  Link,
  Copy,
  MoreVertical,
  MoreHorizontal,
  Grid3x3,
  List,
  LayoutPanelTop,
  PanelLeft,
  PanelRight,
  SquareSplitHorizontal,
  SquareSplitVertical,
  Columns2,
  Columns3,
  Columns4,
  Rows2,
  Rows3,
  Rows4,
  GalleryHorizontal,
  GalleryVertical,
  Grid2x2,
  ListChecks,
  ListFilter,
  ListOrdered,
  ListTodo,
  ListX,
  CheckCheck,
  ArrowUpFromLine,
  ArrowDownFromLine,
  ArrowLeftFromLine,
  ArrowRightFromLine,
  MoveHorizontal,
  MoveVertical,
  PanelTop,
  PanelBottom,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  SquareArrowOutUpRight,
  SquareArrowOutDownLeft,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  CircleHelp,
  CircleOff,
  CirclePower,
  CircleSlash,
  CircleEllipsis,
  CircleFadingPlus,
  CircleArrowUp,
  CircleArrowDown,
  CircleUser,
  CircleDollarSign,
  CirclePercent,
  CircleDotDashed,
  CircleDashed,
  CircleArrowOutUpRight,
  CircleArrowOutDownLeft,
  CalendarDays,
  CalendarClock,
  CalendarCheck,
  CalendarPlus,
  CalendarMinus,
  CalendarX,
  CalendarRange,
  CalendarFold,
  CalendarHeart,
  CalendarOff,
  CalendarSearch,
  CalendarCog,
  CalendarPlus2,
  CalendarMinus2,
  CalendarX2,
  CalendarCheck2,
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow, subDays } from 'date-fns';
import { PageTemplate } from '@/components/dashboard/PageTemplate';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Skeleton } from '@/components/ui/skeleton';

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
// Types
import type { RequisitionFilters, RequisitionPriority, RequisitionStatus } from '@/types/requisition.types';
import { useUsers } from '../../../../hooks/useUsers';

// ============================================
// CONSTANTS
// ============================================

const APPROVAL_LEVELS = [
  { key: 'hod', label: 'HOD', icon: UserCog, color: 'blue', fullName: 'Head of Department', gradient: 'from-blue-500 to-blue-600' },
  { key: 'accountant', label: 'Accountant', icon: CreditCard, color: 'indigo', fullName: 'Accountant', gradient: 'from-indigo-500 to-indigo-600' },
  { key: 'head of institution', label: 'Head of Institution', icon: Crown, color: 'purple', fullName: 'Head of Institution', gradient: 'from-purple-500 to-purple-600' },
  { key: 'final', label: 'Final Approver', icon: Award, color: 'green', fullName: 'Final Approver', gradient: 'from-emerald-500 to-emerald-600' },
];

const PRIORITY_CONFIG: Record<string, { color: string; icon: any; label: string; bgColor: string; borderColor: string; gradient: string; progressColor: string }> = {
  low: {
    color: 'text-blue-700 dark:text-blue-400',
    icon: Leaf,
    label: 'Low',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    gradient: 'from-blue-400 to-blue-500',
    progressColor: '#3b82f6'
  },
  medium: {
    color: 'text-yellow-700 dark:text-yellow-400',
    icon: Minus,
    label: 'Medium',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    gradient: 'from-yellow-400 to-yellow-500',
    progressColor: '#eab308'
  },
  high: {
    color: 'text-orange-700 dark:text-orange-400',
    icon: Flame,
    label: 'High',
    bgColor: 'bg-orange-50 dark:bg-orange-950/20',
    borderColor: 'border-orange-200 dark:border-orange-800',
    gradient: 'from-orange-400 to-orange-500',
    progressColor: '#f97316'
  },
  emergency: {
    color: 'text-red-700 dark:text-red-400',
    icon: Zap,
    label: 'Emergency',
    bgColor: 'bg-red-50 dark:bg-red-950/20',
    borderColor: 'border-red-200 dark:border-red-800',
    gradient: 'from-red-400 to-red-500',
    progressColor: '#ef4444'
  },
};

const VIEW_MODES = [
  { id: 'table', label: 'Table', icon: TableIcon },
  { id: 'grid', label: 'Grid', icon: Grid3x3 },
  { id: 'compact', label: 'Compact', icon: List },
  { id: 'detailed', label: 'Detailed', icon: LayoutPanelTop },
];

const ITEMS_PER_PAGE_OPTIONS = [5, 10, 15, 20, 25, 50];

// ============================================
// HELPERS
// ============================================

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatRelativeTime = (date: string | Date | null): string => {
  if (!date) return 'N/A';
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
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

const getStatusVariant = (status: string): {
  label: string;
  icon: any;
  bg: string;
  text: string;
  border: string;
  dotColor: string;
} => {
  const variants: Record<string, any> = {
    pending: {
      label: 'Pending',
      icon: Clock,
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      text: 'text-amber-700 dark:text-amber-400',
      border: 'border-amber-200 dark:border-amber-800',
      dotColor: 'bg-amber-500'
    },
    approved: {
      label: 'Approved',
      icon: CheckCircle,
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      text: 'text-emerald-700 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-800',
      dotColor: 'bg-emerald-500'
    },
    declined: {
      label: 'Declined',
      icon: XCircle,
      bg: 'bg-red-50 dark:bg-red-950/30',
      text: 'text-red-700 dark:text-red-400',
      border: 'border-red-200 dark:border-red-800',
      dotColor: 'bg-red-500'
    },
    delegated: {
      label: 'Delegated',
      icon: UserPlus,
      bg: 'bg-purple-50 dark:bg-purple-950/30',
      text: 'text-purple-700 dark:text-purple-400',
      border: 'border-purple-200 dark:border-purple-800',
      dotColor: 'bg-purple-500'
    },
    returned: {
      label: 'Returned',
      icon: RotateCcw,
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      text: 'text-amber-700 dark:text-amber-400',
      border: 'border-amber-200 dark:border-amber-800',
      dotColor: 'bg-amber-500'
    },
    cancelled: {
      label: 'Cancelled',
      icon: XCircle,
      bg: 'bg-gray-50 dark:bg-gray-800/50',
      text: 'text-gray-600 dark:text-gray-400',
      border: 'border-gray-200 dark:border-gray-700',
      dotColor: 'bg-gray-500'
    },
  };
  return variants[status] || variants.pending;
};

// Check if requisition has been declined at any level
const hasBeenDeclined = (approval: any): boolean => {
  if (!approval?.requisition?.approvals) return false;
  return approval.requisition.approvals.some((a: any) =>
    a.status === 'declined' || a.status === 'cancelled'
  );
};

// Check if requisition status is a declined status
const isDeclinedStatus = (status: string): boolean => {
  const declinedStatuses = ['hod_declined', 'accountant_declined', 'principal_declined', 'final_declined'];
  return declinedStatuses.includes(status);
};

// Get the declined level info
const getDeclinedLevel = (approval: any): string | null => {
  if (!approval?.requisition?.approvals) return null;
  const declined = approval.requisition.approvals.find((a: any) =>
    a.status === 'declined' || a.status === 'cancelled'
  );
  if (!declined) return null;

  const levelInfo = APPROVAL_LEVELS.find(l => l.key === declined.level);
  return levelInfo?.fullName || declined.level;
};

// ============================================
// PREMIUM COMPONENTS
// ============================================

const StatusBadge = ({ status }: { status: string }) => {
  const config = getStatusVariant(status);
  const Icon = config.icon;

  return (
    <div className={cn(
      "flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border",
      config.bg, config.text, config.border
    )}>
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dotColor)} />
      <Icon className="h-3 w-3" />
      {config.label}
    </div>
  );
};

const PriorityBadge = ({ priority }: { priority: string }) => {
  const config = getPriorityInfo(priority);
  const Icon = config.icon;

  return (
    <div className={cn(
      "flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border",
      config.color, config.bgColor, config.borderColor
    )}>
      <Icon className="h-3 w-3" />
      {config.label}
    </div>
  );
};

// ============================================
// SKELETON LOADER
// ============================================

const TableSkeleton = () => (
  <div className="w-full p-4 space-y-4">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex items-center gap-4">
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-24 ml-auto" />
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-48 ml-auto" />
      </div>
    ))}
  </div>
);

// ============================================
// MAIN PAGE
// ============================================

export default function PendingApprovalsPage() {
  const router = useRouter();
  const { user } = useAuthContext();
  const { useAllDepartments } = useDepartments();
  const { useGetUsers } = useUsers();

  const [viewMode, setViewMode] = useState<'table' | 'grid' | 'compact' | 'detailed'>('table');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedApprovals, setSelectedApprovals] = useState<number[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  const { data: departmentsData, isLoading: departmentsLoading } = useAllDepartments();
  const { data: usersData, isLoading: usersLoading } = useGetUsers({});

  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<RequisitionFilters & {
    approval_level?: string;
    date_from?: string;
    date_to?: string;
    min_amount?: number;
    max_amount?: number;
  }>({
    page: 1,
    per_page: itemsPerPage,
  });
  const [selectedApprovalId, setSelectedApprovalId] = useState<number | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);
  const [showDelegateDialog, setShowDelegateDialog] = useState(false);
  const [showBulkApproveDialog, setShowBulkApproveDialog] = useState(false);
  const [showBulkDeclineDialog, setShowBulkDeclineDialog] = useState(false);
  const [comment, setComment] = useState('');
  const [reason, setReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'created_at',
    direction: 'desc',
  });
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'delegated' | 'returned' | 'high-priority' | 'declined'>('all');
  const [selectedDelegate, setSelectedDelegate] = useState<string>('');
  const [delegateComment, setDelegateComment] = useState('');
  const [bookmarkedItems, setBookmarkedItems] = useState<number[]>([]);

  const tableRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  // Queries
  const pendingApprovalsQuery = usePendingApprovals({
    level: userRole || undefined,
    page: currentPage,
    per_page: itemsPerPage,
  });

  const delegatedApprovalsQuery = useDelegatedApprovals({
    status: 'pending',
    page: currentPage,
    per_page: itemsPerPage,
  });

  const statsQuery = useApprovalStats();

  const { mutate: processApproval, isPending: isProcessing } = useProcessApproval();
  const { mutate: delegateApproval, isPending: isDelegating } = useDelegateApproval();

  // Extract data
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
      return { data: response, total: response.length, per_page: 10, current_page: 1, last_page: 1 };
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

  const pendingExtracted = extractData(pendingApprovalsQuery.data);
  const delegatedExtracted = extractData(delegatedApprovalsQuery.data);

  const allApprovals = useMemo(() => {
    const merged = [...pendingExtracted.data, ...delegatedExtracted.data];
    // Remove duplicates
    return merged.filter((item, index, self) =>
      index === self.findIndex((a) => a.id === item.id)
    );
  }, [pendingExtracted.data, delegatedExtracted.data]);

  const filteredApprovals = useMemo(() => {
    let result = allApprovals;

    if (activeTab === 'pending') {
      result = result.filter((a: any) => a.status === 'pending' && !hasBeenDeclined(a) && !isDeclinedStatus(a?.requisition?.status));
    } else if (activeTab === 'delegated') {
      result = result.filter((a: any) => a.status === 'delegated' && !hasBeenDeclined(a) && !isDeclinedStatus(a?.requisition?.status));
    } else if (activeTab === 'returned') {
      result = result.filter((a: any) => (a?.requisition?.return_count || 0) > 0 && !hasBeenDeclined(a) && !isDeclinedStatus(a?.requisition?.status));
    } else if (activeTab === 'high-priority') {
      result = result.filter((a: any) =>
        ['high', 'emergency'].includes(a?.requisition?.priority) &&
        !hasBeenDeclined(a) &&
        !isDeclinedStatus(a?.requisition?.status)
      );
    } else if (activeTab === 'declined') {
      result = result.filter((a: any) => hasBeenDeclined(a) || isDeclinedStatus(a?.requisition?.status));
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter((a: any) => {
        const ref = a.requisition?.reference_number?.toLowerCase() || '';
        const title = a.requisition?.title?.toLowerCase() || '';
        const requester = getFullName(a.requisition?.user).toLowerCase();
        const dept = a.requisition?.department?.name?.toLowerCase() || '';
        return ref.includes(term) || title.includes(term) || requester.includes(term) || dept.includes(term);
      });
    }

    if (dateRange.from) {
      const from = new Date(dateRange.from);
      from.setHours(0, 0, 0, 0);
      result = result.filter((a: any) => {
        const created = new Date(a.created_at);
        return created >= from;
      });
    }
    if (dateRange.to) {
      const to = new Date(dateRange.to);
      to.setHours(23, 59, 59, 999);
      result = result.filter((a: any) => {
        const created = new Date(a.created_at);
        return created <= to;
      });
    }

    const sorted = [...result];
    const { key, direction } = sortConfig;

    sorted.sort((a: any, b: any) => {
      let aVal: any, bVal: any;

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
        case 'created_at':
        default:
          aVal = new Date(a.created_at).getTime();
          bVal = new Date(b.created_at).getTime();
          break;
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return direction === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return sorted;
  }, [allApprovals, searchTerm, sortConfig, activeTab, dateRange]);

  const returnedCount = useMemo(() => {
    return allApprovals.filter((a: any) => (a?.requisition?.return_count || 0) > 0 && !hasBeenDeclined(a) && !isDeclinedStatus(a?.requisition?.status)).length;
  }, [allApprovals]);

  const highPriorityCount = useMemo(() => {
    return allApprovals.filter((a: any) =>
      ['high', 'emergency'].includes(a?.requisition?.priority) &&
      !hasBeenDeclined(a) &&
      !isDeclinedStatus(a?.requisition?.status)
    ).length;
  }, [allApprovals]);

  const declinedCount = useMemo(() => {
    return allApprovals.filter((a: any) => hasBeenDeclined(a) || isDeclinedStatus(a?.requisition?.status)).length;
  }, [allApprovals]);

  const isLoading = pendingApprovalsQuery.isLoading ||
    delegatedApprovalsQuery.isLoading ||
    departmentsLoading ||
    usersLoading;

  const stats = statsQuery.data;
  const delegatedCount = delegatedExtracted.total || 0;
  const pendingCount = pendingExtracted.total || 0;

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      pendingApprovalsQuery.refetch();
      delegatedApprovalsQuery.refetch();
      statsQuery.refetch();
      setLastRefreshed(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, [autoRefresh, pendingApprovalsQuery, delegatedApprovalsQuery, statsQuery]);

  const handleRefresh = useCallback(() => {
    pendingApprovalsQuery.refetch();
    delegatedApprovalsQuery.refetch();
    statsQuery.refetch();
    setLastRefreshed(new Date());
  }, [pendingApprovalsQuery, delegatedApprovalsQuery, statsQuery]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleRowClick = (requisitionId: number) => {
    router.push(`/requisitions/${requisitionId}`);
  };

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setFilters(prev => ({ ...prev, page }));
    tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSelectApproval = (approvalId: number) => {
    setSelectedApprovals(prev =>
      prev.includes(approvalId)
        ? prev.filter(id => id !== approvalId)
        : [...prev, approvalId]
    );
  };

  const handleSelectAll = () => {
    if (selectedApprovals.length === filteredApprovals.length) {
      setSelectedApprovals([]);
    } else {
      setSelectedApprovals(filteredApprovals.map((a: any) => a.id));
    }
  };

  const handleApprove = (approval: any) => {
    // Prevent approval if declined
    if (hasBeenDeclined(approval) || isDeclinedStatus(approval?.requisition?.status)) {
      return;
    }
    setSelectedApprovalId(approval.id);
    setComment('');
    setShowApproveDialog(true);
  };

  const handleConfirmApprove = () => {
    const approval = allApprovals.find(a => a.id === selectedApprovalId);
    if (approval) {
      // Prevent approval if declined
      if (hasBeenDeclined(approval) || isDeclinedStatus(approval?.requisition?.status)) {
        return;
      }
      const requisitionId = approval.requisition?.id;
      const level = approval.level;

      if (!requisitionId || !level) return;

      processApproval({
        requisitionId,
        level,
        data: { action: 'approved', comment: comment || undefined },
      }, {
        onSuccess: () => {
          setShowApproveDialog(false);
          setSelectedApprovalId(null);
          setComment('');
          pendingApprovalsQuery.refetch();
          delegatedApprovalsQuery.refetch();
          statsQuery.refetch();
        },
        onError: (err: any) => {
          console.error(err);
        }
      });
    }
  };

  const handleDecline = (approval: any) => {
    // Prevent decline if already declined
    if (hasBeenDeclined(approval) || isDeclinedStatus(approval?.requisition?.status)) {
      return;
    }
    setSelectedApprovalId(approval.id);
    setReason('');
    setShowDeclineDialog(true);
  };

  const handleConfirmDecline = () => {
    const approval = allApprovals.find(a => a.id === selectedApprovalId);
    if (approval && reason.trim()) {
      // Prevent decline if already declined
      if (hasBeenDeclined(approval) || isDeclinedStatus(approval?.requisition?.status)) {
        return;
      }
      const requisitionId = approval.requisition?.id;
      const level = approval.level;

      if (!requisitionId || !level) return;

      processApproval({
        requisitionId,
        level,
        data: { action: 'declined', reason: reason.trim() },
      }, {
        onSuccess: () => {
          setShowDeclineDialog(false);
          setSelectedApprovalId(null);
          setReason('');
          pendingApprovalsQuery.refetch();
          delegatedApprovalsQuery.refetch();
          statsQuery.refetch();

        },
        onError: (err: any) => {
          console.error(err);
        }
      });
    }
  };

  const handleDelegate = (approval: any) => {
    // Prevent delegation if declined
    if (hasBeenDeclined(approval) || isDeclinedStatus(approval?.requisition?.status)) {
      return;
    }
    setSelectedApprovalId(approval.id);
    setSelectedDelegate('');
    setDelegateComment('');
    setShowDelegateDialog(true);
  };

  const handleConfirmDelegate = () => {
    const approval = allApprovals.find(a => a.id === selectedApprovalId);
    if (approval && selectedDelegate) {
      // Prevent delegation if declined
      if (hasBeenDeclined(approval) || isDeclinedStatus(approval?.requisition?.status)) {
        return;
      }
      delegateApproval({
        approvalId: approval.id,
        data: {
          delegate_id: parseInt(selectedDelegate),
          comment: delegateComment || undefined,
        },
      }, {
        onSuccess: () => {
          setShowDelegateDialog(false);
          setSelectedApprovalId(null);
          setSelectedDelegate('');
          setDelegateComment('');
          pendingApprovalsQuery.refetch();
          delegatedApprovalsQuery.refetch();
          statsQuery.refetch();

        },
        onError: (err: any) => {
          console.error(err)
        }
      });
    }
  };

  const handleBulkApprove = () => {
    // Filter out declined approvals from bulk selection
    const validApprovals = allApprovals.filter((a: any) =>
      selectedApprovals.includes(a.id) &&
      !hasBeenDeclined(a) &&
      !isDeclinedStatus(a?.requisition?.status)
    );
    if (validApprovals.length === 0) return;
    setShowBulkApproveDialog(true);
  };

  const handleConfirmBulkApprove = () => {
    const approvals = allApprovals.filter((a: any) =>
      selectedApprovals.includes(a.id) &&
      !hasBeenDeclined(a) &&
      !isDeclinedStatus(a?.requisition?.status)
    );
    const promises = approvals.map((approval: any) => {
      return new Promise((resolve, reject) => {
        processApproval({
          requisitionId: approval.requisition?.id,
          level: approval.level,
          data: { action: 'approved', comment: 'Bulk approval' },
        }, {
          onSuccess: resolve,
          onError: reject,
        });
      });
    });

    Promise.all(promises)
      .then(() => {
        setShowBulkApproveDialog(false);
        setSelectedApprovals([]);
        pendingApprovalsQuery.refetch();
        delegatedApprovalsQuery.refetch();
        statsQuery.refetch();
      })
      .catch((err) => {
        console.error(err)
      });
  };

  const handleBookmark = (approvalId: number) => {
    setBookmarkedItems(prev =>
      prev.includes(approvalId)
        ? prev.filter(id => id !== approvalId)
        : [...prev, approvalId]
    );
  };

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) return <ChevronDown className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100" />;
    return sortConfig.direction === 'asc' ? <SortAsc className="h-3.5 w-3.5" /> : <SortDesc className="h-3.5 w-3.5" />;
  };

  const levelInfo = APPROVAL_LEVELS.find(l => l.key === userRole);
  const totalItems = filteredApprovals.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const selectedApproval = allApprovals.find(a => a.id === selectedApprovalId);
  const selectedIsReturned = (selectedApproval?.requisition?.return_count || 0) > 0;
  const selectedIsDeclined = selectedApproval ? hasBeenDeclined(selectedApproval) || isDeclinedStatus(selectedApproval?.requisition?.status) : false;
  const selectedDeclinedLevel = selectedApproval ? getDeclinedLevel(selectedApproval) : null;

  const availableDelegates = useMemo(() => {
    return users.filter((u: any) => {
      if (u.id === selectedApproval?.approver_id) return false;
      const userRoles = u.roles?.map((r: any) => r.toLowerCase?.() || r.toLowerCase?.()) || [];
      const userRole = u.role?.toLowerCase?.() || '';
      const approvalRoles = ['hod', 'accountant', 'head of institution', 'final_approver', 'admin', 'super_admin'];
      const hasApprovalRole = userRoles.some((r: string) => approvalRoles.includes(r)) ||
        approvalRoles.includes(userRole);
      const isSupplier = userRoles.includes('supplier') || userRole === 'supplier';
      return hasApprovalRole && !isSupplier;
    });
  }, [users, selectedApproval]);

  const totalAmount = useMemo(() => {
    return filteredApprovals.reduce((acc: number, a: any) => acc + (parseFloat(a.requisition?.total_amount) || 0), 0);
  }, [filteredApprovals]);

  // Handle view mode toggle
  const handleViewModeChange = (mode: 'table' | 'grid' | 'compact' | 'detailed') => {
    setViewMode(mode);
  };

  if (!isAdmin && !userRole) {
    return (
      <PageTemplate
        title="Pending Approvals"
        description="You do not have permission to view this page"
        icon={<Shield className="h-5 w-5 text-blue-600" />}
        background="gradient"
      >
        <Alert variant="destructive" className="max-w-2xl mx-auto rounded-xl">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>You do not have the required permissions to view pending approvals.</AlertDescription>
        </Alert>
        <div className="flex justify-center mt-6">
          <Button onClick={() => router.push('/dashboard')} className="rounded-xl">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Return to Dashboard
          </Button>
        </div>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title={`${levelInfo?.label || 'Pending'} Approvals`}
      description={`Review and approve requisitions waiting for your ${levelInfo?.label?.toLowerCase() || 'approval'}`}
      icon={<Shield className="h-5 w-5 text-blue-600" />}
      background="gradient"
      variant="default"
      breadcrumbs={[
        { label: 'Requisitions', href: '/requisitions' },
        { label: 'Pending Approvals' },
      ]}
      actions={
        <div className="flex items-center gap-2 flex-wrap">
          {selectedApprovals.length > 0 && (
            <Button
              variant="default"
              size="sm"
              className="gap-2 h-9 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/20 rounded-xl text-white"
              onClick={handleBulkApprove}
            >
              <Check className="h-4 w-4" />
              Approve Selected ({selectedApprovals.length})
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="gap-2 h-9 rounded-xl border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 h-9 rounded-xl border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            Refresh
          </Button>
          {lastRefreshed && (
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              Updated {formatRelativeTime(lastRefreshed)}
            </span>
          )}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/30 rounded-full border border-amber-200 dark:border-amber-800">
            <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span className="text-sm font-medium text-amber-700 dark:text-amber-400">{pendingCount} Pending</span>
          </div>
          {delegatedCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 dark:bg-purple-950/30 rounded-full border border-purple-200 dark:border-purple-800">
              <UserPlus className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-purple-700 dark:text-purple-400">{delegatedCount} Delegated</span>
            </div>
          )}
          {returnedCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/30 rounded-full border border-amber-200 dark:border-amber-800">
              <RotateCcw className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-medium text-amber-700 dark:text-amber-400">{returnedCount} Returned</span>
            </div>
          )}
          {highPriorityCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-950/30 rounded-full border border-red-200 dark:border-red-800">
              <Zap className="h-4 w-4 text-red-600 dark:text-red-400" />
              <span className="text-sm font-medium text-red-700 dark:text-red-400">{highPriorityCount} High Priority</span>
            </div>
          )}
          {declinedCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-950/30 rounded-full border border-red-200 dark:border-red-800">
              <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <span className="text-sm font-medium text-red-700 dark:text-red-400">{declinedCount} Declined</span>
            </div>
          )}
        </div>
      }
    >
      {/* Premium Stats Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
        {[
          {
            label: 'Pending',
            value: pendingCount,
            icon: Clock,
            gradient: 'from-amber-500 to-orange-500',
            bg: 'bg-amber-50 dark:bg-amber-950/30',
            border: 'border-amber-200 dark:border-amber-800',
            textColor: 'text-amber-700 dark:text-amber-400',
            description: 'Awaiting your review'
          },
          {
            label: 'Delegated',
            value: delegatedCount,
            icon: UserPlus,
            gradient: 'from-purple-500 to-indigo-500',
            bg: 'bg-purple-50 dark:bg-purple-950/30',
            border: 'border-purple-200 dark:border-purple-800',
            textColor: 'text-purple-700 dark:text-purple-400',
            description: 'Assigned to you'
          },
          {
            label: 'Returned',
            value: returnedCount,
            icon: RotateCcw,
            gradient: 'from-amber-500 to-yellow-500',
            bg: 'bg-amber-50 dark:bg-amber-950/30',
            border: 'border-amber-200 dark:border-amber-800',
            textColor: 'text-amber-700 dark:text-amber-400',
            description: 'Needs re-review'
          },
          {
            label: 'High Priority',
            value: highPriorityCount,
            icon: Zap,
            gradient: 'from-red-500 to-rose-500',
            bg: 'bg-red-50 dark:bg-red-950/30',
            border: 'border-red-200 dark:border-red-800',
            textColor: 'text-red-700 dark:text-red-400',
            description: 'Urgent attention needed'
          },
          {
            label: 'Declined',
            value: declinedCount,
            icon: XCircle,
            gradient: 'from-red-500 to-rose-500',
            bg: 'bg-red-50 dark:bg-red-950/30',
            border: 'border-red-200 dark:border-red-800',
            textColor: 'text-red-700 dark:text-red-400',
            description: 'Previously declined'
          },
          {
            label: 'Total Amount',
            value: formatCurrency(totalAmount),
            icon: DollarSign,
            gradient: 'from-emerald-500 to-teal-500',
            bg: 'bg-emerald-50 dark:bg-emerald-950/30',
            border: 'border-emerald-200 dark:border-emerald-800',
            textColor: 'text-emerald-700 dark:text-emerald-400',
            description: 'Pending approvals total'
          },
          {
            label: 'Approved by You',
            value: stats?.approved || 0,
            icon: CheckCircle,
            gradient: 'from-blue-500 to-cyan-500',
            bg: 'bg-blue-50 dark:bg-blue-950/30',
            border: 'border-blue-200 dark:border-blue-800',
            textColor: 'text-blue-700 dark:text-blue-400',
            description: 'Lifetime approvals'
          },
        ].map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card className={cn(
              "border shadow-sm rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
              item.border, item.bg
            )}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className={cn("text-xs font-medium", item.textColor)}>{item.label}</p>
                  <div className={cn(
                    "p-2 rounded-xl bg-gradient-to-br text-white",
                    item.gradient,
                    "shadow-lg"
                  )}>
                    <item.icon className="h-4 w-4" />
                  </div>
                </div>
                <p className="text-xl font-bold mt-1.5 text-gray-900 dark:text-white">
                  {item.value}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{item.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Returned Warning Banner */}
      {returnedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Alert className="mt-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800 rounded-xl shadow-sm">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <AlertTitle className="text-amber-800 dark:text-amber-300 text-sm font-semibold flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              {returnedCount} Requisition{returnedCount > 1 ? 's' : ''} Previously Returned
            </AlertTitle>
            <AlertDescription className="text-amber-700 dark:text-amber-400 text-sm">
              Please review changes carefully before approving.
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Advanced Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <Card className="mt-4 border shadow-sm rounded-2xl bg-gray-50/50 dark:bg-gray-800/30">
              <CardContent className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Department</Label>
                    <Select
                      value={filters.department_id?.toString() || 'all'}
                      onValueChange={(value) => {
                        setFilters(prev => ({
                          ...prev,
                          department_id: value === 'all' ? undefined : parseInt(value),
                          page: 1,
                        }));
                      }}
                    >
                      <SelectTrigger className="h-10 rounded-xl dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300">
                        <SelectValue placeholder="All Departments" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                        <SelectItem value="all" className="dark:text-gray-300">All Departments</SelectItem>
                        {departments.map((dept: any) => (
                          <SelectItem key={dept.id} value={dept.id.toString()} className="dark:text-gray-300">
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Priority</Label>
                    <Select
                      value={filters.priority as string || 'all'}
                      onValueChange={(value) => {
                        setFilters(prev => ({
                          ...prev,
                          priority: value === 'all' ? undefined : value as RequisitionPriority,
                          page: 1,
                        }));
                      }}
                    >
                      <SelectTrigger className="h-10 rounded-xl dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300">
                        <SelectValue placeholder="All Priorities" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                        <SelectItem value="all" className="dark:text-gray-300">All Priorities</SelectItem>
                        <SelectItem value="low" className="dark:text-gray-300">Low</SelectItem>
                        <SelectItem value="medium" className="dark:text-gray-300">Medium</SelectItem>
                        <SelectItem value="high" className="dark:text-gray-300">High</SelectItem>
                        <SelectItem value="emergency" className="dark:text-gray-300">Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Approval Level</Label>
                    <Select
                      value={filters.approval_level as string || 'all'}
                      onValueChange={(value) => {
                        setFilters(prev => ({
                          ...prev,
                          approval_level: value === 'all' ? undefined : value,
                          page: 1,
                        }));
                      }}
                    >
                      <SelectTrigger className="h-10 rounded-xl dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300">
                        <SelectValue placeholder="All Levels" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                        <SelectItem value="all" className="dark:text-gray-300">All Levels</SelectItem>
                        {APPROVAL_LEVELS.map((level) => (
                          <SelectItem key={level.key} value={level.key} className="dark:text-gray-300">
                            {level.fullName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Date Range</Label>
                    <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full h-10 justify-start text-left font-normal rounded-xl dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange.from && dateRange.to ? (
                            `${format(dateRange.from, 'dd/MM/yyyy')} - ${format(dateRange.to, 'dd/MM/yyyy')}`
                          ) : (
                            <span>Pick a date range</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 rounded-xl dark:bg-gray-900 dark:border-gray-700" align="start">
                        <CalendarComponent
                          mode="range"
                          selected={{ from: dateRange.from || undefined, to: dateRange.to || undefined }}
                          onSelect={(range) => {
                            setDateRange({
                              from: range?.from || null,
                              to: range?.to || null,
                            });
                            if (range?.from && range?.to) {
                              setShowDatePicker(false);
                            }
                          }}
                          numberOfMonths={2}
                          className="dark:bg-gray-900"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {filteredApprovals.length} results
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                      onClick={() => {
                        setFilters({ page: 1, per_page: itemsPerPage });
                        setDateRange({ from: null, to: null });
                      }}
                    >
                      Clear filters
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    className="h-9 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/20 rounded-xl text-white"
                    onClick={() => {
                      pendingApprovalsQuery.refetch();
                      delegatedApprovalsQuery.refetch();
                      setShowFilters(false);
                    }}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Apply Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <motion.div
        ref={tableRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {/* Main Content */}
        <Card className="mt-4 border shadow-sm rounded-2xl bg-white dark:bg-gray-900 overflow-hidden">
          {/* Search and Filter Bar */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50/50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-800/50">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  placeholder="Search by reference, title, requester or department..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-10 h-10 bg-white dark:bg-gray-900 rounded-xl dark:border-gray-700 focus:ring-2 focus:ring-blue-500/20 transition-all dark:text-white dark:placeholder:text-gray-400"
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 p-0 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => setSearchTerm('')}
                  >
                    <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                {/* Dropdown instead of Tabs */}
                <Select
                  value={activeTab}
                  onValueChange={(value) => setActiveTab(value as any)}
                >
                  <SelectTrigger className="h-10 w-[180px] rounded-xl dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                    <SelectItem value="all" className="dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-gray-400" />
                        All
                      </div>
                    </SelectItem>
                    <SelectItem value="pending" className="dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-amber-500" />
                        Pending
                      </div>
                    </SelectItem>
                    <SelectItem value="delegated" className="dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-purple-500" />
                        Delegated
                      </div>
                    </SelectItem>
                    <SelectItem value="returned" className="dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-amber-500" />
                        Returned
                      </div>
                    </SelectItem>
                    <SelectItem value="high-priority" className="dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <Zap className="h-3.5 w-3.5 text-red-500" />
                        High Priority
                      </div>
                    </SelectItem>
                    <SelectItem value="declined" className="dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-3.5 w-3.5 text-red-500" />
                        Declined
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-10 w-10 p-0 rounded-xl border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800">
                      <MoreVertical className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl dark:bg-gray-900 dark:border-gray-700">
                    <DropdownMenuLabel className="text-gray-700 dark:text-gray-300">View Options</DropdownMenuLabel>
                    <DropdownMenuSeparator className="dark:bg-gray-700" />
                    <DropdownMenuItem
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-300"
                      onClick={() => handleViewModeChange('table')}
                    >
                      <TableIcon className="h-4 w-4 mr-2" /> Table View
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-300"
                      onClick={() => handleViewModeChange('grid')}
                    >
                      <Grid3x3 className="h-4 w-4 mr-2" /> Grid View
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-300"
                      onClick={() => handleViewModeChange('compact')}
                    >
                      <List className="h-4 w-4 mr-2" /> Compact View
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-300"
                      onClick={() => handleViewModeChange('detailed')}
                    >
                      <LayoutPanelTop className="h-4 w-4 mr-2" /> Detailed View
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="dark:bg-gray-700" />
                    <DropdownMenuItem
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-300"
                      onClick={() => setAutoRefresh(!autoRefresh)}
                    >
                      {autoRefresh ? (
                        <BellRing className="h-4 w-4 mr-2" />
                      ) : (
                        <Bell className="h-4 w-4 mr-2" />
                      )}
                      {autoRefresh ? 'Auto-refresh On' : 'Auto-refresh Off'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Bulk Actions Bar */}
          <AnimatePresence>
            {selectedApprovals.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedApprovals.length === filteredApprovals.length && filteredApprovals.length > 0}
                      onCheckedChange={handleSelectAll}
                      className="border-gray-300 dark:border-gray-600"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {selectedApprovals.length} selected
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Total: {formatCurrency(
                        filteredApprovals
                          .filter((a: any) => selectedApprovals.includes(a.id))
                          .reduce((acc: number, a: any) => acc + (parseFloat(a.requisition?.total_amount) || 0), 0)
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/30 border-red-200 dark:border-red-800"
                      onClick={() => setShowBulkDeclineDialog(true)}
                    >
                      <X className="h-3.5 w-3.5" />
                      Decline
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className="h-8 gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-lg shadow-lg shadow-emerald-600/20 text-white"
                      onClick={handleBulkApprove}
                    >
                      <Check className="h-3.5 w-3.5" />
                      Approve All
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => setSelectedApprovals([])}
                    >
                      <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Table */}
          <ScrollArea className="h-[calc(100vh-580px)] min-h-[400px]">
            {isLoading ? (
              <TableSkeleton />
            ) : filteredApprovals.length === 0 ? (
              <div className="text-center py-20">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-900/20 mb-4"
                >
                  <CheckCircle className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
                </motion.div>
                <h3 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">All Caught Up! 🎉</h3>
                <p className="text-muted-foreground">No pending approvals found</p>
                <p className="text-sm text-muted-foreground mt-1">Everything is approved and up to date</p>
                <Button
                  variant="outline"
                  className="mt-4 rounded-xl dark:border-gray-700 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                  onClick={() => {
                    setSearchTerm('');
                    setActiveTab('all');
                    setDateRange({ from: null, to: null });
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset Filters
                </Button>
              </div>
            ) : (
              <div className="w-full">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-gray-50/95 dark:bg-gray-800/95 backdrop-blur">
                    <TableRow className="hover:bg-transparent border-b border-gray-200 dark:border-gray-700">
                      <TableHead className="w-10">
                        <Checkbox
                          checked={selectedApprovals.length === filteredApprovals.length && filteredApprovals.length > 0}
                          onCheckedChange={handleSelectAll}
                          className="border-gray-300 dark:border-gray-600"
                        />
                      </TableHead>
                      <TableHead
                        className="cursor-pointer group hover:text-blue-600 transition-colors whitespace-nowrap text-xs font-semibold py-4 min-w-[140px] text-gray-700 dark:text-gray-300"
                        onClick={() => handleSort('reference_number')}
                      >
                        <div className="flex items-center gap-1.5">
                          <FileText className="h-3.5 w-3.5" />
                          Reference {getSortIcon('reference_number')}
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer group hover:text-blue-600 transition-colors whitespace-nowrap text-xs font-semibold py-4 min-w-[160px] text-gray-700 dark:text-gray-300"
                        onClick={() => handleSort('title')}
                      >
                        <div className="flex items-center gap-1.5">
                          <Briefcase className="h-3.5 w-3.5" />
                          Title {getSortIcon('title')}
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer group hover:text-blue-600 transition-colors whitespace-nowrap text-xs font-semibold py-4 min-w-[140px] text-gray-700 dark:text-gray-300"
                        onClick={() => handleSort('requester')}
                      >
                        <div className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5" />
                          Requester {getSortIcon('requester')}
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer group hover:text-blue-600 transition-colors text-right whitespace-nowrap text-xs font-semibold py-4 min-w-[130px] text-gray-700 dark:text-gray-300"
                        onClick={() => handleSort('total_amount')}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <DollarSign className="h-3.5 w-3.5" />
                          Amount {getSortIcon('total_amount')}
                        </div>
                      </TableHead>
                      <TableHead className="whitespace-nowrap text-xs font-semibold py-4 min-w-[110px] text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-1.5">
                          <Shield className="h-3.5 w-3.5" />
                          Status
                        </div>
                      </TableHead>
                      <TableHead className="whitespace-nowrap text-xs font-semibold py-4 min-w-[90px] text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-1.5">
                          <Flag className="h-3.5 w-3.5" />
                          Priority
                        </div>
                      </TableHead>
                      <TableHead className="whitespace-nowrap text-xs font-semibold py-4 min-w-[120px] text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-1.5">
                          <Target className="h-3.5 w-3.5" />
                          Progress
                        </div>
                      </TableHead>
                      <TableHead className="whitespace-nowrap text-xs font-semibold text-right py-4 min-w-[260px] text-gray-700 dark:text-gray-300">
                        <div className="flex items-center justify-end gap-1.5">
                          <Zap className="h-3.5 w-3.5" />
                          Actions
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApprovals.map((approval: any, index: number) => {
                      const requisition = approval.requisition;
                      const isReturned = (requisition?.return_count || 0) > 0;
                      const isDelegated = approval.status === 'delegated';
                      const isPending = approval.status === 'pending';
                      const isDeclined = hasBeenDeclined(approval) || isDeclinedStatus(requisition?.status);
                      const isBookmarked = bookmarkedItems.includes(approval.id);
                      const isSelected = selectedApprovals.includes(approval.id);
                      const declinedLevel = isDeclined ? getDeclinedLevel(approval) : null;

                      const totalLevels = APPROVAL_LEVELS.length;
                      const completedLevels = requisition?.approvals?.filter((a: any) => a.status === 'approved').length || 0;
                      const progressPercentage = (completedLevels / totalLevels) * 100;

                      const priorityConfig = getPriorityInfo(requisition?.priority || 'medium');

                      return (
                        <motion.tr
                          key={approval.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.02 }}
                          className={cn(
                            "transition-all duration-200 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 group",
                            isReturned && "border-l-4 border-l-amber-400 bg-amber-50/10 dark:bg-amber-950/10",
                            isDelegated && "border-l-4 border-l-purple-400",
                            isDeclined && "border-l-4 border-l-red-400 bg-red-50/10 dark:bg-red-950/10 opacity-75",
                            isSelected && "bg-blue-50/30 dark:bg-blue-950/20"
                          )}
                        >
                          <TableCell className="py-3">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => handleSelectApproval(approval.id)}
                              onClick={(e) => e.stopPropagation()}
                              className="border-gray-300 dark:border-gray-600"
                              disabled={isDeclined}
                            />
                          </TableCell>
                          <TableCell className="font-mono text-sm py-3" onClick={() => handleRowClick(requisition?.id)}>
                            <div className="flex items-center gap-2 cursor-pointer">
                              {isReturned && <RotateCcw className="h-3.5 w-3.5 text-amber-500" />}
                              {isDeclined && <XCircle className="h-3.5 w-3.5 text-red-500" />}
                              <span className={cn(
                                "font-medium",
                                isDeclined && "text-red-600 dark:text-red-400 line-through"
                              )}>
                                {requisition?.reference_number || 'N/A'}
                              </span>
                              {isBookmarked && (
                                <BookmarkCheck className="h-3.5 w-3.5 text-blue-500" />
                              )}
                              {isDeclined && (
                                <Badge variant="destructive" className="text-[10px] rounded-full">
                                  Declined
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell onClick={() => handleRowClick(requisition?.id)}>
                            <div className="flex items-center gap-2 cursor-pointer">
                              <span className={cn(
                                "text-sm font-medium truncate max-w-[150px]",
                                isDeclined && "text-red-600 dark:text-red-400 line-through"
                              )}>
                                {requisition?.title || 'Untitled'}
                              </span>
                              {isDelegated && !isDeclined && (
                                <Badge className="text-[10px] bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded-full border-0">
                                  <UserPlus className="h-2.5 w-2.5 mr-1" />
                                  Delegated
                                </Badge>
                              )}
                              {isReturned && !isDeclined && (
                                <Badge className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full border-0">
                                  <RotateCcw className="h-2.5 w-2.5 mr-1" />
                                  Returned
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm" onClick={() => handleRowClick(requisition?.id)}>
                            <div className="flex items-center gap-2.5 cursor-pointer">
                              <Avatar className="h-8 w-8 border-2 border-gray-200 dark:border-gray-700 group-hover:border-blue-300 dark:group-hover:border-blue-700 transition-colors">
                                <AvatarFallback className="text-xs font-medium bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
                                  {getInitials(getFullName(requisition?.user))}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <span className={cn(
                                  "font-medium",
                                  isDeclined && "text-red-600 dark:text-red-400 line-through"
                                )}>
                                  {getFullName(requisition?.user)}
                                </span>
                                <p className="text-xs text-muted-foreground">
                                  {requisition?.department?.name || 'N/A'}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap" onClick={() => handleRowClick(requisition?.id)}>
                            {formatCurrency(requisition?.total_amount || 0)}
                          </TableCell>
                          <TableCell onClick={() => handleRowClick(requisition?.id)}>
                            <StatusBadge status={approval.status} />
                          </TableCell>
                          <TableCell onClick={() => handleRowClick(requisition?.id)}>
                            <PriorityBadge priority={requisition?.priority || 'medium'} />
                          </TableCell>
                          <TableCell onClick={() => handleRowClick(requisition?.id)}>
                            <div className="flex items-center gap-3 min-w-[100px] cursor-pointer">
                              <div className="flex-1">
                                <Progress
                                  value={progressPercentage}
                                  className="h-2 bg-gray-100 dark:bg-gray-800"
                                  style={{
                                    '--progress-background': priorityConfig.progressColor,
                                  } as React.CSSProperties}
                                />
                              </div>
                              <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                                {completedLevels}/{totalLevels}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-950/30 transition-all"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleBookmark(approval.id);
                                      }}
                                    >
                                      {isBookmarked ? (
                                        <BookmarkCheck className="h-4 w-4 text-yellow-500" />
                                      ) : (
                                        <Bookmark className="h-4 w-4 text-muted-foreground" />
                                      )}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="dark:bg-gray-800 dark:border-gray-700">
                                    {isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              {isDeclined ? (
                                <div className="flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                  <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                                  <span className="text-xs font-medium text-red-600 dark:text-red-400">
                                    Declined by {declinedLevel || 'Unknown'}
                                  </span>
                                </div>
                              ) : (isPending || isDelegated) && (
                                <>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-8 px-2.5 text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:text-purple-400 dark:hover:text-purple-300 dark:hover:bg-purple-950/30 rounded-lg text-xs font-medium transition-all"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelegate(approval);
                                          }}
                                          disabled={isProcessing}
                                        >
                                          <UserPlus className="h-3.5 w-3.5 mr-1" />
                                          Delegate
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent side="top" className="dark:bg-gray-800 dark:border-gray-700">Delegate to another approver</TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>

                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-8 px-2.5 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/30 rounded-lg text-xs font-medium transition-all"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDecline(approval);
                                          }}
                                          disabled={isProcessing}
                                        >
                                          <X className="h-3.5 w-3.5 mr-1" />
                                          Decline
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent side="top" className="dark:bg-gray-800 dark:border-gray-700">Decline this requisition</TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>

                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className={cn(
                                            "h-8 px-2.5 rounded-lg text-xs font-medium transition-all",
                                            isReturned
                                              ? "text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:text-amber-300 dark:hover:bg-amber-950/30"
                                              : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:text-emerald-300 dark:hover:bg-emerald-950/30"
                                          )}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleApprove(approval);
                                          }}
                                          disabled={isProcessing}
                                        >
                                          <Check className="h-3.5 w-3.5 mr-1" />
                                          Approve
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent side="top" className="dark:bg-gray-800 dark:border-gray-700">
                                        {isReturned ? 'Approve with caution (previously returned)' : 'Approve this requisition'}
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </>
                              )}

                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRowClick(requisition?.id);
                                      }}
                                    >
                                      <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-blue-600 transition-colors" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="dark:bg-gray-800 dark:border-gray-700">View requisition details</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </TableCell>
                        </motion.tr>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          {/* Pagination */}
          {totalItems > 0 && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-3 bg-gray-50/50 dark:bg-gray-800/30">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span>
                  Showing <span className="font-semibold text-gray-900 dark:text-white">
                    {((currentPage - 1) * itemsPerPage) + 1}
                  </span> -{' '}
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {Math.min(currentPage * itemsPerPage, totalItems)}
                  </span> of{' '}
                  <span className="font-semibold text-gray-900 dark:text-white">{totalItems}</span>
                </span>
                <Separator orientation="vertical" className="h-5 bg-gray-300 dark:bg-gray-600" />
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => {
                    setItemsPerPage(parseInt(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="h-8 w-[70px] rounded-lg text-xs dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                    {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option.toString()} className="dark:text-gray-300">
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span>per page</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-3.5 rounded-xl border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-300"
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    const isActive = page === currentPage;
                    return (
                      <Button
                        key={page}
                        variant={isActive ? 'default' : 'outline'}
                        size="sm"
                        className={cn(
                          "h-9 w-9 p-0 rounded-xl transition-all",
                          isActive && "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/20 text-white"
                        )}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    );
                  })}
                  {totalPages > 5 && (
                    <>
                      <span className="text-muted-foreground">...</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 w-9 p-0 rounded-xl dark:border-gray-700 dark:text-gray-300"
                        onClick={() => handlePageChange(totalPages)}
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-3.5 rounded-xl border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-300"
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
      </motion.div>

      {/* Dialogs */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent className="max-w-md rounded-2xl dark:bg-gray-900 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
              <CheckCircle className="h-6 w-6 text-emerald-500" />
              Approve Requisition
            </DialogTitle>
            <DialogDescription className="text-base dark:text-gray-400">
              {selectedApproval?.requisition?.reference_number} - {selectedApproval?.requisition?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="approve-comment" className="text-sm font-medium text-gray-700 dark:text-gray-300">Comment (Optional)</Label>
              <Textarea
                id="approve-comment"
                placeholder="Add any comments about this approval..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="resize-none rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-800/30 p-4 rounded-xl border dark:border-gray-700">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Amount</span>
                <span className="font-semibold dark:text-white">{formatCurrency(selectedApproval?.requisition?.total_amount || 0)}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-muted-foreground">Items</span>
                <span className="font-semibold dark:text-white">{selectedApproval?.requisition?.items?.length || 0}</span>
              </div>
              {selectedApproval?.requisition?.return_count > 0 && (
                <div className="flex justify-between text-sm mt-2 pt-2 border-t border-amber-200 dark:border-amber-800">
                  <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                    <RotateCcw className="h-3 w-3" />
                    Previously Returned
                  </span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400">Yes</span>
                </div>
              )}
              {selectedApproval && hasBeenDeclined(selectedApproval) && (
                <div className="flex justify-between text-sm mt-2 pt-2 border-t border-red-200 dark:border-red-800">
                  <span className="text-red-600 dark:text-red-400 font-medium flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    Previously Declined
                  </span>
                  <span className="font-semibold text-red-600 dark:text-red-400">Yes</span>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)} className="h-11 rounded-xl dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">Cancel</Button>
            <Button
              onClick={handleConfirmApprove}
              className={cn(
                "h-11 px-6 rounded-xl font-medium shadow-lg text-white",
                selectedApproval?.requisition?.return_count > 0
                  ? "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-amber-600/30"
                  : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-600/30"
              )}
              disabled={isProcessing || (selectedApproval && hasBeenDeclined(selectedApproval))}
            >
              {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeclineDialog} onOpenChange={setShowDeclineDialog}>
        <DialogContent className="max-w-md rounded-2xl dark:bg-gray-900 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
              <XCircle className="h-6 w-6 text-red-500" />
              Decline Requisition
            </DialogTitle>
            <DialogDescription className="text-base dark:text-gray-400">
              {selectedApproval?.requisition?.reference_number} - {selectedApproval?.requisition?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="decline-reason" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Reason for Decline <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="decline-reason"
                placeholder="Provide a clear reason for declining this requisition..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="resize-none rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-400 focus:ring-2 focus:ring-red-500/20"
              />
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-800/30 p-4 rounded-xl border dark:border-gray-700">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Amount</span>
                <span className="font-semibold dark:text-white">{formatCurrency(selectedApproval?.requisition?.total_amount || 0)}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-muted-foreground">Items</span>
                <span className="font-semibold dark:text-white">{selectedApproval?.requisition?.items?.length || 0}</span>
              </div>
              {selectedApproval && hasBeenDeclined(selectedApproval) && (
                <div className="flex justify-between text-sm mt-2 pt-2 border-t border-red-200 dark:border-red-800">
                  <span className="text-red-600 dark:text-red-400 font-medium flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    Previously Declined
                  </span>
                  <span className="font-semibold text-red-600 dark:text-red-400">Yes</span>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeclineDialog(false)} className="h-11 rounded-xl dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">Cancel</Button>
            <Button
              onClick={handleConfirmDecline}
              disabled={!reason.trim() || isProcessing || (selectedApproval && hasBeenDeclined(selectedApproval))}
              variant="destructive"
              className="h-11 px-6 rounded-xl shadow-lg shadow-red-600/30 text-white"
            >
              {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <X className="h-4 w-4 mr-2" />}
              Decline
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDelegateDialog} onOpenChange={setShowDelegateDialog}>
        <DialogContent className="max-w-md rounded-2xl dark:bg-gray-900 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
              <UserPlus className="h-6 w-6 text-purple-500" />
              Delegate Approval
            </DialogTitle>
            <DialogDescription className="text-base dark:text-gray-400">
              Delegate {selectedApproval?.requisition?.reference_number} to another approver
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="delegate-user" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Select Delegate <span className="text-red-500">*</span>
              </Label>
              <Select value={selectedDelegate} onValueChange={setSelectedDelegate}>
                <SelectTrigger className="h-11 rounded-xl focus:ring-2 focus:ring-purple-500/20 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300">
                  <SelectValue placeholder="Select an approver..." />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                  {availableDelegates.length === 0 ? (
                    <SelectItem value="none" disabled className="dark:text-gray-400">No available approvers</SelectItem>
                  ) : (
                    availableDelegates.map((u: any) => (
                      <SelectItem key={u.id} value={u.id.toString()} className="dark:text-gray-300">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-[10px]">{getInitials(getFullName(u))}</AvatarFallback>
                          </Avatar>
                          <span>{getFullName(u)}</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="delegate-comment" className="text-sm font-medium text-gray-700 dark:text-gray-300">Comment (Optional)</Label>
              <Textarea
                id="delegate-comment"
                placeholder="Reason for delegation..."
                value={delegateComment}
                onChange={(e) => setDelegateComment(e.target.value)}
                rows={3}
                className="resize-none rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDelegateDialog(false)} className="h-11 rounded-xl dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">Cancel</Button>
            <Button
              onClick={handleConfirmDelegate}
              disabled={!selectedDelegate || isDelegating || (selectedApproval && hasBeenDeclined(selectedApproval))}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 h-11 px-6 rounded-xl shadow-lg shadow-purple-600/30 font-medium text-white"
            >
              {isDelegating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UserPlus className="h-4 w-4 mr-2" />}
              Delegate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showBulkApproveDialog} onOpenChange={setShowBulkApproveDialog}>
        <DialogContent className="max-w-md rounded-2xl dark:bg-gray-900 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
              <CheckCircle className="h-6 w-6 text-emerald-500" />
              Bulk Approve Requisitions
            </DialogTitle>
            <DialogDescription className="text-base dark:text-gray-400">
              You are about to approve {selectedApprovals.filter(id => {
                const a = allApprovals.find(ap => ap.id === id);
                return a && !hasBeenDeclined(a) && !isDeclinedStatus(a?.requisition?.status);
              }).length} requisitions
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Alert className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 rounded-xl">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <AlertTitle className="text-amber-800 dark:text-amber-300">Confirm Bulk Action</AlertTitle>
              <AlertDescription className="text-amber-700 dark:text-amber-400 text-sm">
                This will approve all selected requisitions that haven't been declined. This action cannot be undone.
              </AlertDescription>
            </Alert>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-800/30 p-4 rounded-xl border dark:border-gray-700">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Amount</span>
                <span className="font-semibold dark:text-white">
                  {formatCurrency(
                    filteredApprovals
                      .filter((a: any) => selectedApprovals.includes(a.id) && !hasBeenDeclined(a) && !isDeclinedStatus(a?.requisition?.status))
                      .reduce((acc: number, a: any) => acc + (parseFloat(a.requisition?.total_amount) || 0), 0)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-muted-foreground">Items</span>
                <span className="font-semibold dark:text-white">
                  {filteredApprovals
                    .filter((a: any) => selectedApprovals.includes(a.id) && !hasBeenDeclined(a) && !isDeclinedStatus(a?.requisition?.status))
                    .reduce((acc: number, a: any) => acc + (a.requisition?.items?.length || 0), 0)}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkApproveDialog(false)} className="h-11 rounded-xl dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">Cancel</Button>
            <Button
              onClick={handleConfirmBulkApprove}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 h-11 px-6 rounded-xl shadow-lg shadow-emerald-600/30 font-medium text-white"
            >
              <Check className="h-4 w-4 mr-2" />
              Approve All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showBulkDeclineDialog} onOpenChange={setShowBulkDeclineDialog}>
        <DialogContent className="max-w-md rounded-2xl dark:bg-gray-900 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
              <XCircle className="h-6 w-6 text-red-500" />
              Bulk Decline Requisitions
            </DialogTitle>
            <DialogDescription className="text-base dark:text-gray-400">
              You are about to decline {selectedApprovals.filter(id => {
                const a = allApprovals.find(ap => ap.id === id);
                return a && !hasBeenDeclined(a) && !isDeclinedStatus(a?.requisition?.status);
              }).length} requisitions
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Alert className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 rounded-xl">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertTitle className="text-red-800 dark:text-red-300">Confirm Bulk Action</AlertTitle>
              <AlertDescription className="text-red-700 dark:text-red-400 text-sm">
                This will decline all selected requisitions that haven't been declined. This action cannot be undone.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label htmlFor="bulk-decline-reason" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Reason for Decline <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="bulk-decline-reason"
                placeholder="Provide a reason for declining these requisitions..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="resize-none rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-400 focus:ring-2 focus:ring-red-500/20"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkDeclineDialog(false)} className="h-11 rounded-xl dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">Cancel</Button>
            <Button
              onClick={() => {
                const approvals = allApprovals.filter((a: any) =>
                  selectedApprovals.includes(a.id) &&
                  !hasBeenDeclined(a) &&
                  !isDeclinedStatus(a?.requisition?.status)
                );
                const promises = approvals.map((approval: any) => {
                  return new Promise((resolve, reject) => {
                    processApproval({
                      requisitionId: approval.requisition?.id,
                      level: approval.level,
                      data: { action: 'declined', reason: reason.trim() },
                    }, {
                      onSuccess: resolve,
                      onError: reject,
                    });
                  });
                });

                Promise.all(promises)
                  .then(() => {
                    setShowBulkDeclineDialog(false);
                    setSelectedApprovals([]);
                    pendingApprovalsQuery.refetch();
                    delegatedApprovalsQuery.refetch();
                    statsQuery.refetch();
                  })
                  .catch((err) => {
                   console.error(err)
                  });
              }}
              disabled={!reason.trim()}
              variant="destructive"
              className="h-11 px-6 rounded-xl shadow-lg shadow-red-600/30 text-white"
            >
              <X className="h-4 w-4 mr-2" />
              Decline All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTemplate>
  );
}
