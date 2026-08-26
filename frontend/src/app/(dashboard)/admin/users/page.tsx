// app/(dashboard)/admin/users/page.tsx

'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Users,
  Search,
  MoreVertical,
  Trash2,
  UserCheck,
  UserX,
  Loader2,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  RefreshCw,
  Building2,
  FilterX,
  AlertTriangle,
  Mail,
  Phone,
  Shield,
  Calendar,
  User,
  UserCheck2,
  Activity,
  XCircle,
  Crown,
  Sparkles,
  Tag,
  Info,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowUpRight,
  ArrowDownRight,
  History,
  Key,
  Lock,
  Unlock,
  Check,
  Zap,
  Award,
  Target,
  Rocket,
  Gem,
  Flame,
  Leaf,
  MinusCircle,
  CircleDashed,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  MessageSquare,
  Box,
  DollarSign,
  Package,
  Briefcase,
  Layers,
  Grid,
  List,
  Filter,
  Bell,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Bookmark,
  Flag,
  Camera,
  Video,
  Music,
  Code,
  Cloud,
  Database,
  Server,
  Wifi,
  Bluetooth,
  Battery,
  Lightbulb,
  HeartPulse,
  Brain,
  Cpu,
  HardDrive,
  Monitor as MonitorIcon,
  Smartphone as SmartphoneIcon,
  Tablet as TabletIcon,
  Laptop as LaptopIcon,
  Headphones,
  Speaker,
  Mic,
  Phone as PhoneIcon,
  Mail as MailIcon,
  Globe as GlobeIcon,
  MapPin,
  Clock as ClockIcon,
  User as UserIcon,
  Settings,
  Menu,
  MoreHorizontal,
  MoreVertical as MoreVerticalIcon,
  ChevronRight,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuthContext } from '@/contexts/AuthContext';
import { useAdminContext } from '@/contexts/AdminContext';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageTemplate } from '@/components/dashboard/PageTemplate';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// UI Components
import StatsCards, { type StatCardItem } from '@/components/ui/stat-cards';
import { WrappedCornerTag } from '@/components/ui/wrapped-corner-tag';
import HorizontalCornerTag from '@/components/ui/horizontal-corner-tag';

// ============================================
// TYPES
// ============================================

interface UserFilters {
  search: string;
  role: string;
  status: 'all' | 'active' | 'inactive' | 'pending';
  department: string;
  sort_by: string;
  sort_order: 'asc' | 'desc';
  per_page: number;
  page: number;
}

interface User {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  initials: string;
  email: string;
  phone: string;
  id_number: string | null;
  date_of_birth: string | null;
  profile_photo: string | null;
  avatar_url: string | null;
  role: string | null;
  role_label: string | null;
  role_description: string | null;
  department_id: number | null;
  department: {
    id: number;
    name: string;
    code: string;
    description: string | null;
  } | null;
  profile: {
    id: number;
    gender: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    postal_code: string | null;
    country: string | null;
    bio: string | null;
    preferences: any | null;
    social_links: any | null;
  } | null;
  is_active: boolean;
  is_approved: boolean;
  approved_at: string | null;
  approved_by: number | null;
  rejection_reason: string | null;
  last_login_at: string | null;
  timezone: string;
  roles: string[];
  role_details: {
    id: number;
    name: string;
    label: string | null;
    description: string | null;
    guard_name: string;
    permissions: string[];
    permission_count: number;
    created_at: string;
  }[];
  permissions: string[];
  created_at: string;
  updated_at: string;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

const getRoleDisplayName = (role: string, label?: string | null) => {
  if (label) return label;
  const map: Record<string, string> = {
    'ADMIN': 'Administrator',
    'SUPER_ADMIN': 'Super Admin',
    'HOD': 'Head of Department',
    'ACCOUNTANT': 'Accountant',
    'HEAD OF INSTITUTION': 'Head of Institution',
    'FINAL_APPROVER': 'Final Approver',
    'PROCUREMENT': 'Procurement Officer',
    'SUPPLIER': 'Supplier',
    'AUDITOR': 'Auditor',
    'STAFF': 'Staff',
    'BISHOP': 'Bishop'
  };
  return map[role] || role;
};

const getRoleColor = (roleName: string) => {
  const name = roleName?.toUpperCase() || '';
  const map: Record<string, string> = {
    'ADMIN': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    'SUPER_ADMIN': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
    'HOD': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    'ACCOUNTANT': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
    'HEAD OF INSTITUTION': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    'FINAL_APPROVER': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
    'PROCUREMENT': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800',
    'SUPPLIER': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800',
    'AUDITOR': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400 border-pink-200 dark:border-pink-800',
    'STAFF': 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700',
    'BISHOP': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800'
  };
  return map[name] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700';
};

const getStatusColor = (status: string) => {
  const map: Record<string, string> = {
    'active': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    'inactive': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
    'pending': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'
  };
  return map[status] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700';
};

const formatDate = (date: string | null) => {
  if (!date) return 'Never';
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatTimeAgo = (date: string | null) => {
  if (!date) return 'Never';
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function AdminUsersPage() {
  const router = useRouter();
  const { user: currentUser, hasPermission } = useAuthContext();

  const { departments, availableRoles } = useAuthContext();

  const {
    users,
    usersLoading,
    usersTotal,
    userStats,
    userStatsLoading,
    fetchUsers,
    refetchUsers,
    createUser,
    updateUser,
    deleteUser,
    approveUser,
    rejectUser,
    activateUser,
    deactivateUser,
    resetUserPassword,
    bulkAction,
    roles,
    rolesLoading,
    departmentsLoading,
    isMutating,
  } = useAdminContext();

  // ============================================
  // STATE
  // ============================================
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    role: 'all',
    status: 'all',
    department: 'all',
    sort_by: 'created_at',
    sort_order: 'desc',
    per_page: 10,
    page: 1
  });

  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [showBulkActionDialog, setShowBulkActionDialog] = useState(false);

  const [bulkActionType, setBulkActionType] = useState<'activate' | 'deactivate' | 'approve'>('activate');

  // ============================================
  // COMPUTED STATS FOR STATSCARDS
  // ============================================
  const statsItems: StatCardItem[] = useMemo(() => {
    const total = usersTotal || 0;
    const active = users?.filter((u: User) => u.is_active).length || 0;
    const inactive = users?.filter((u: User) => !u.is_active).length || 0;
    const pending = users?.filter((u: User) => !u.is_approved).length || 0;
    const approved = users?.filter((u: User) => u.is_approved).length || 0;

    return [
      {
        label: "Total Users",
        value: total,
        icon: Users,
        tagLabel: "TOTAL",
        tagColor: "blue",
        subtitle: "All registered users",
      },
      {
        label: "Active",
        value: active,
        icon: UserCheck,
        tagLabel: "ACTIVE",
        tagColor: "emerald",
        subtitle: `${active} active users`,
      },
      {
        label: "Inactive",
        value: inactive,
        icon: UserX,
        tagLabel: "INACTIVE",
        tagColor: "gray",
        subtitle: `${inactive} inactive users`,
      },
      {
        label: "Pending Approval",
        value: pending,
        icon: Clock,
        tagLabel: "PENDING",
        tagColor: "amber",
        subtitle: `${pending} awaiting approval`,
      },
      {
        label: "Approved",
        value: approved,
        icon: CheckCircle,
        tagLabel: "APPROVED",
        tagColor: "emerald",
        subtitle: `${approved} approved users`,
      },
      {
        label: "Departments",
        value: departments?.length || 0,
        icon: Building2,
        tagLabel: "DEPTS",
        tagColor: "purple",
        subtitle: `${departments?.length || 0} departments`,
      },
    ];
  }, [users, usersTotal, departments]);

  // ============================================
  // PERMISSIONS
  // ============================================
  const canCreateUsers = hasPermission('create_users');
  const canEditUsers = hasPermission('edit_users');
  const canDeleteUsers = hasPermission('delete_users');
  const canApproveUsers = hasPermission('approve_users');

  const isSuperAdmin = currentUser?.roles?.includes('SUPER_ADMIN') || false;

  // ============================================
  // EFFECTS
  // ============================================
  useEffect(() => {
    const apiFilters = {
      ...filters,
      status: filters.status === 'all' ? undefined : filters.status,
      role: filters.role === 'all' ? undefined : filters.role,
      department: filters.department === 'all' ? undefined : filters.department,
    };
    fetchUsers(apiFilters);
  }, [filters, fetchUsers]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    const isTargetAdmin = selectedUser.roles?.includes('ADMIN') || selectedUser.roles?.includes('SUPER_ADMIN');
    if (isTargetAdmin) {
      setShowDeleteDialog(false);
      return;
    }

    try {
      await deleteUser(selectedUser.id);
      setShowDeleteDialog(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) return;

    const nonAdminUsers = selectedUsers.filter(id => {
      const user = users.find((u: User) => u.id === id);
      return !(user?.roles?.includes('ADMIN') || user?.roles?.includes('SUPER_ADMIN'));
    });

    if (nonAdminUsers.length === 0) {
      setShowBulkDeleteDialog(false);
      return;
    }

    try {
      await bulkAction({ action: 'delete', user_ids: nonAdminUsers });
      setSelectedUsers([]);
      setShowBulkDeleteDialog(false);
    } catch (error) {
      console.error('Failed to delete users:', error);
    }
  };

  const handleBulkAction = async () => {
    if (selectedUsers.length === 0) return;

    const nonAdminUsers = selectedUsers.filter(id => {
      const user = users.find((u: User) => u.id === id);
      return !(user?.roles?.includes('ADMIN') || user?.roles?.includes('SUPER_ADMIN'));
    });

    if (nonAdminUsers.length === 0) {
      setShowBulkActionDialog(false);
      return;
    }

    try {
      await bulkAction({
        action: bulkActionType,
        user_ids: nonAdminUsers
      });
      setSelectedUsers([]);
      setShowBulkActionDialog(false);
    } catch (error) {
      console.error(`Failed to ${bulkActionType} users:`, error);
    }
  };

  const handleToggleStatus = async (userId: number, action: 'activate' | 'deactivate') => {
    const user = users.find((u: User) => u.id === userId);
    if (user?.roles?.includes('ADMIN') || user?.roles?.includes('SUPER_ADMIN')) {
      return;
    }

    try {
      if (action === 'activate') {
        await activateUser(userId);
      } else {
        await deactivateUser(userId);
      }
    } catch (error) {
      console.error(`Failed to ${action} user:`, error);
    }
  };

  const handleToggleApproval = async (userId: number, action: 'approve' | 'reject') => {
    const user = users.find((u: User) => u.id === userId);
    if (user?.roles?.includes('ADMIN') || user?.roles?.includes('SUPER_ADMIN')) {
      return;
    }

    try {
      if (action === 'approve') {
        await approveUser(userId);
      } else {
        await rejectUser(userId);
      }
    } catch (error) {
      console.error(`Failed to ${action} user:`, error);
    }
  };

  const handleRowClick = (userId: number) => {
    router.push(`/admin/users/${userId}`);
  };

  // ============================================
  // RENDER
  // ============================================
  const isLoading = usersLoading || userStatsLoading || rolesLoading || departmentsLoading;

  if (!hasPermission('view_users')) {
    return (
      <PageTemplate
        title="User Management"
        description="Manage users, roles, and permissions across the system"
        icon={<Users className="h-5 w-5" />}
        background="gradient"
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="max-w-md relative">
            <WrappedCornerTag label="DENIED" color="red" position="top-left" size="lg" />
            <CardContent className="pt-8 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Access Denied
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                You don't have permission to view users. Please contact your administrator.
              </p>
            </CardContent>
          </Card>
        </div>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title="User Management"
      description="Manage users, roles, and permissions across the system"
      icon={<Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />}
      background="gradient"
      variant="default"
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Users' },
      ]}
      actions={
        <div className="flex items-center gap-2 flex-wrap">
          {selectedUsers.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setBulkActionType('activate');
                  setShowBulkActionDialog(true);
                }}
                className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-900/20 rounded-xl"
              >
                <UserCheck className="h-4 w-4 mr-1" />
                Activate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setBulkActionType('deactivate');
                  setShowBulkActionDialog(true);
                }}
                className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20 rounded-xl"
              >
                <UserX className="h-4 w-4 mr-1" />
                Deactivate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBulkDeleteDialog(true)}
                className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20 rounded-xl"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete ({selectedUsers.length})
              </Button>
            </div>
          )}
          {canCreateUsers && (
            <Button onClick={() => router.push('/admin/users/create')} className="gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/20">
              <Users className="h-4 w-4" />
              Add User
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchUsers()}
            className="gap-2 h-10 rounded-xl dark:border-gray-700 dark:hover:bg-gray-800"
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Stats Cards - tagOrientation set to none */}
        <StatsCards
          stats={statsItems}
          isLoading={isLoading}
          columns={6}
          variant="default"
          formatCompact={true}
          tagOrientation="none"
        />

        {/* Filters */}
        <Card className="border-0 shadow-sm rounded-xl bg-white dark:bg-gray-900 relative">
          <HorizontalCornerTag label="FILTERS" color="blue" position="top-left" size="sm" variant="rounded" />
          <CardContent className="p-4 pt-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search users by name, email, or phone..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                    className="pl-9 h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                  />
                </div>
              </div>
              <Select
                value={filters.role}
                onValueChange={(value) => setFilters({ ...filters, role: value, page: 1 })}
              >
                <SelectTrigger className="w-[180px] h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                  <SelectItem value="all">All Roles</SelectItem>
                  {availableRoles?.map((role: any) => (
                    <SelectItem key={role.name} value={role.name}>
                      {role.label || getRoleDisplayName(role.name)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filters.status}
                onValueChange={(value: any) => setFilters({ ...filters, status: value, page: 1 })}
              >
                <SelectTrigger className="w-[160px] h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.department}
                onValueChange={(value) => setFilters({ ...filters, department: value, page: 1 })}
              >
                <SelectTrigger className="w-[180px] h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments?.map((dept: any) => (
                    <SelectItem key={dept.id} value={dept.id.toString()}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({
                    search: '',
                    role: 'all',
                    status: 'all',
                    department: 'all',
                    sort_by: 'created_at',
                    sort_order: 'desc',
                    per_page: 10,
                    page: 1
                  });
                }}
                className="gap-2 h-11 rounded-xl dark:border-gray-700 dark:hover:bg-gray-800"
              >
                <FilterX className="h-4 w-4" />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="border-0 shadow-sm rounded-xl bg-white dark:bg-gray-900 overflow-hidden relative">
          <WrappedCornerTag label="USERS" color="blue" position="top-left" size="lg" />
          <div className="pt-8">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-800/50 hover:bg-transparent">
                    <TableHead className="w-[40px] py-4">
                      <Checkbox
                        checked={selectedUsers.length === users.length && users.length > 0}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedUsers(users.map((u: any) => u.id));
                          } else {
                            setSelectedUsers([]);
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead className="min-w-[220px] py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">User</TableHead>
                    <TableHead className="min-w-[150px] py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Role</TableHead>
                    <TableHead className="min-w-[150px] py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Department</TableHead>
                    <TableHead className="min-w-[110px] py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Status</TableHead>
                    <TableHead className="min-w-[150px] py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Last Login</TableHead>
                    <TableHead className="text-right min-w-[100px] py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <div className="flex flex-col items-center gap-3">
                          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                          <span className="text-sm text-gray-500">Loading users...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <div className="flex flex-col items-center gap-3">
                          <Users className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                          <p className="text-sm font-medium text-gray-500">No users found</p>
                          <p className="text-xs text-gray-400">Try adjusting your filters</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user: User, index: number) => {
                      const primaryRole = user.role_details?.[0]?.name || 'STAFF';
                      const primaryRoleLabel = user.role_details?.[0]?.label || user.role_label || null;
                      const isAdmin = user.roles?.includes('ADMIN') || user.roles?.includes('SUPER_ADMIN');
                      const isTargetCurrentUser = user.id === currentUser?.id;

                      // Determine department display
                      const isHOD = user.roles?.includes('HOD') || user.role?.toUpperCase() === 'HOD';
                      const departmentName = isHOD
                        ? departments?.find((d: any) => d.hod_id === user.id)?.name || user.department?.name || '—'
                        : user.department?.name || '—';
                      const isHODDepartment = isHOD && departments?.find((d: any) => d.hod_id === user.id);

                      return (
                        <motion.tr
                          key={user.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className={cn(
                            "hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors group cursor-pointer border-b dark:border-gray-700/50",
                            isTargetCurrentUser && "bg-blue-50/50 dark:bg-blue-900/10"
                          )}
                          onClick={() => handleRowClick(user.id)}
                        >
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={selectedUsers.includes(user.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedUsers([...selectedUsers, user.id]);
                                } else {
                                  setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                                }
                              }}
                              disabled={isAdmin}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9 ring-2 ring-gray-200 dark:ring-gray-700 flex-shrink-0">
                                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-medium">
                                  {user.first_name?.[0]}{user.last_name?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                    {user.full_name}
                                  </p>
                                  {isAdmin && (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger>
                                          <Crown className="h-3.5 w-3.5 text-yellow-500 flex-shrink-0" />
                                        </TooltipTrigger>
                                        <TooltipContent className="rounded-xl">Administrator</TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  )}
                                  {isTargetCurrentUser && (
                                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 rounded-full flex-shrink-0">
                                      You
                                    </Badge>
                                  )}
                                  <ChevronRight className="h-3.5 w-3.5 text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-auto" />
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Mail className="h-3 w-3 text-gray-400 flex-shrink-0" />
                                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {user.email}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={cn("font-medium border rounded-full text-xs", getRoleColor(primaryRole))}>
                              {primaryRoleLabel || getRoleDisplayName(primaryRole)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {isHOD && isHODDepartment ? (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <span className="text-sm text-blue-600 dark:text-blue-400 underline decoration-blue-400/50 underline-offset-2 flex items-center gap-1 cursor-help">
                                      <Crown className="h-3.5 w-3.5 text-yellow-500" />
                                      {departmentName}
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent className="rounded-xl">
                                    <p>Head of Department</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ) : (
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {departmentName}
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <Badge className={cn("font-medium border text-xs rounded-full w-fit", getStatusColor(user.is_active ? 'active' : 'inactive'))}>
                                {user.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                              {!user.is_approved && (
                                <Badge variant="outline" className="text-xs border-yellow-400 text-yellow-600 dark:text-yellow-400 rounded-full w-fit">
                                  Pending
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {formatTimeAgo(user.last_login_at)}
                              </span>
                              <span className="text-xs text-gray-400">
                                {user.last_login_at ? formatDate(user.last_login_at) : 'Never'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                      onClick={() => handleRowClick(user.id)}
                                    >
                                      <Eye className="h-4 w-4 text-gray-500" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent className="rounded-xl">View Details</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              {!isAdmin && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-48 rounded-xl dark:bg-gray-900 dark:border-gray-700">
                                    <DropdownMenuLabel className="text-sm font-semibold px-3 py-2 text-gray-700 dark:text-gray-200">Actions</DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-gray-200/50 dark:bg-gray-700/50" />
                                    {canApproveUsers && !user.is_approved && (
                                      <>
                                        <DropdownMenuItem onClick={() => handleToggleApproval(user.id, 'approve')} className="text-emerald-600 rounded-xl py-2 px-3 hover:bg-gray-100/50 dark:hover:bg-gray-800/50">
                                          <UserCheck2 className="h-4 w-4 mr-2" />
                                          Approve User
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleToggleApproval(user.id, 'reject')} className="text-red-600 rounded-xl py-2 px-3 hover:bg-gray-100/50 dark:hover:bg-gray-800/50">
                                          <UserX className="h-4 w-4 mr-2" />
                                          Reject User
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator className="bg-gray-200/50 dark:bg-gray-700/50" />
                                      </>
                                    )}
                                    <DropdownMenuItem onClick={() => {
                                      if (user.is_active) {
                                        handleToggleStatus(user.id, 'deactivate');
                                      } else {
                                        handleToggleStatus(user.id, 'activate');
                                      }
                                    }} className="rounded-xl py-2 px-3 hover:bg-gray-100/50 dark:hover:bg-gray-800/50">
                                      {user.is_active ? (
                                        <>
                                          <UserX className="h-4 w-4 mr-2 text-red-600" />
                                          Deactivate
                                        </>
                                      ) : (
                                        <>
                                          <UserCheck className="h-4 w-4 mr-2 text-emerald-600" />
                                          Activate
                                        </>
                                      )}
                                    </DropdownMenuItem>
                                    {canDeleteUsers && (
                                      <>
                                        <DropdownMenuSeparator className="bg-gray-200/50 dark:bg-gray-700/50" />
                                        <DropdownMenuItem
                                          onClick={() => {
                                            setSelectedUser(user);
                                            setShowDeleteDialog(true);
                                          }}
                                          className="text-red-600 rounded-xl py-2 px-3 hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
                                        >
                                          <Trash2 className="h-4 w-4 mr-2" />
                                          Delete User
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}

                              {isAdmin && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl opacity-50 cursor-not-allowed" disabled>
                                        <MoreVertical className="h-4 w-4 text-gray-400" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent className="rounded-xl">Admin users cannot be modified</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                          </TableCell>
                        </motion.tr>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between py-4 px-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 gap-2">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium text-gray-700 dark:text-gray-300">{users.length}</span> of{' '}
              <span className="font-medium text-gray-700 dark:text-gray-300">{usersTotal}</span> users
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={filters.per_page.toString()}
                onValueChange={(value) => setFilters({ ...filters, per_page: parseInt(value), page: 1 })}
              >
                <SelectTrigger className="w-[80px] h-9 rounded-xl dark:bg-gray-900 dark:border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page - 1) })}
                      className={filters.page === 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink isActive>{filters.page}</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                      className={users.length < filters.per_page ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        </Card>
      </div>

      {/* ============================================
          MODALS - Properly Centered
          ============================================ */}

      {/* Delete User Modal */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="z-[9999] rounded-xl dark:bg-gray-900 max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete User
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="py-4">
              <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-red-100 text-red-600">
                    {selectedUser.first_name?.[0]}{selectedUser.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {selectedUser.full_name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedUser.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser} className="gap-2 rounded-xl" disabled={isMutating}>
              {isMutating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Modal */}
      <Dialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <DialogContent className="z-[9999] rounded-xl dark:bg-gray-900 max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete Selected Users
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedUsers.length} selected users?
              <br />
              <span className="text-sm text-yellow-600">Admin users will be automatically skipped.</span>
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkDeleteDialog(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleBulkDelete} className="gap-2 rounded-xl" disabled={isMutating}>
              {isMutating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Delete Users
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Action Modal */}
      <Dialog open={showBulkActionDialog} onOpenChange={setShowBulkActionDialog}>
        <DialogContent className="z-[9999] rounded-xl dark:bg-gray-900 max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {bulkActionType === 'activate' && <UserCheck className="h-5 w-5 text-emerald-600" />}
              {bulkActionType === 'deactivate' && <UserX className="h-5 w-5 text-red-600" />}
              {bulkActionType === 'approve' && <UserCheck2 className="h-5 w-5 text-emerald-600" />}
              {bulkActionType.charAt(0).toUpperCase() + bulkActionType.slice(1)} Users
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to {bulkActionType} {selectedUsers.length} selected users?
              <br />
              <span className="text-sm text-yellow-600">Admin users will be automatically skipped.</span>
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkActionDialog(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={handleBulkAction}
              className="gap-2 rounded-xl"
              disabled={isMutating}
              variant={bulkActionType === 'deactivate' ? 'destructive' : 'default'}
            >
              {isMutating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {bulkActionType === 'activate' && <UserCheck className="h-4 w-4" />}
                  {bulkActionType === 'deactivate' && <UserX className="h-4 w-4" />}
                  {bulkActionType === 'approve' && <UserCheck2 className="h-4 w-4" />}
                </>
              )}
              {bulkActionType.charAt(0).toUpperCase() + bulkActionType.slice(1)} Users
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTemplate>
  );
}
