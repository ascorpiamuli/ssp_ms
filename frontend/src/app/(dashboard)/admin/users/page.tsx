// app/(dashboard)/admin/users/page.tsx

'use client';

import { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
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
import { useToast } from '@/components/ui/toast-context';
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
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

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
// VIEW USER MODAL
// ============================================

const ViewUserModal = ({
  isOpen,
  onClose,
  user
}: {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}) => {
  if (!isOpen || !user) return null;

  const primaryRole = user.role_details?.[0]?.name || 'STAFF';
  const primaryRoleLabel = user.role_details?.[0]?.label || user.role_label || null;
  const primaryRoleDescription = user.role_details?.[0]?.description || user.role_description || null;
  const isAdmin = user.roles?.includes('ADMIN') || user.roles?.includes('SUPER_ADMIN');

  const modalContent = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-2 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white dark:bg-gray-900 rounded-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto shadow-2xl relative"
        onClick={e => e.stopPropagation()}
      >
        <WrappedCornerTag label="USER" color="blue" position="top-left" size="lg" />
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm z-10 rounded-t-2xl pt-8">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User Details</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl border border-blue-200/30 dark:border-blue-800/30 mb-6">
            <Avatar className="h-16 w-16 ring-4 ring-white dark:ring-gray-700">
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xl font-medium">
                {user.first_name?.[0]}{user.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {user.full_name}
                </h3>
                <Badge className={cn("font-medium border", getRoleColor(primaryRole))}>
                  {primaryRoleLabel || getRoleDisplayName(primaryRole)}
                </Badge>
                {primaryRoleDescription && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">{primaryRoleDescription}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                {isAdmin && (
                  <Badge variant="secondary" className="border-purple-300 text-purple-700 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-300">
                    <Crown className="h-3 w-3 mr-1" />
                    Admin
                  </Badge>
                )}
                <Badge className={cn("font-medium border", getStatusColor(user.is_active ? 'active' : 'inactive'))}>
                  {user.is_active ? 'Active' : 'Inactive'}
                </Badge>
                {!user.is_approved && (
                  <Badge variant="outline" className="border-yellow-400 text-yellow-600">
                    Pending Approval
                  </Badge>
                )}
              </div>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">{user.phone}</span>
                  </div>
                )}
                {user.department && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">{user.department.name}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">Joined {formatDate(user.created_at)}</span>
                </div>
              </div>
            </div>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
              <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">Overview</TabsTrigger>
              <TabsTrigger value="permissions" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">Permissions</TabsTrigger>
              <TabsTrigger value="roles" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">Roles</TabsTrigger>
              <TabsTrigger value="activity" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <h4 className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Personal Information
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between py-1.5 border-b border-gray-200 dark:border-gray-700"><span className="text-gray-500">Full Name</span><span className="font-medium">{user.full_name}</span></div>
                    <div className="flex justify-between py-1.5 border-b border-gray-200 dark:border-gray-700"><span className="text-gray-500">Email</span><span className="font-medium">{user.email}</span></div>
                    <div className="flex justify-between py-1.5 border-b border-gray-200 dark:border-gray-700"><span className="text-gray-500">Phone</span><span className="font-medium">{user.phone || 'Not set'}</span></div>
                    <div className="flex justify-between py-1.5"><span className="text-gray-500">ID Number</span><span className="font-medium">{user.id_number || 'Not set'}</span></div>
                  </div>
                </div>
                <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <h4 className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Account Information
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between py-1.5 border-b border-gray-200 dark:border-gray-700"><span className="text-gray-500">Primary Role</span><span className="font-medium">{primaryRoleLabel || getRoleDisplayName(primaryRole)}</span></div>
                    {primaryRoleDescription && (
                      <div className="flex justify-between py-1.5 border-b border-gray-200 dark:border-gray-700"><span className="text-gray-500">Role Description</span><span className="font-medium text-xs text-gray-600 dark:text-gray-400">{primaryRoleDescription}</span></div>
                    )}
                    <div className="flex justify-between py-1.5 border-b border-gray-200 dark:border-gray-700"><span className="text-gray-500">Department</span><span className="font-medium">{user.department?.name || 'Not assigned'}</span></div>
                    <div className="flex justify-between py-1.5 border-b border-gray-200 dark:border-gray-700"><span className="text-gray-500">Status</span><Badge className={cn("text-xs", getStatusColor(user.is_active ? 'active' : 'inactive'))}>{user.is_active ? 'Active' : 'Inactive'}</Badge></div>
                    <div className="flex justify-between py-1.5"><span className="text-gray-500">Last Login</span><span className="font-medium">{formatDate(user.last_login_at) || 'Never'}</span></div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="permissions" className="pt-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-500">All Permissions ({user.permissions?.length || 0})</h4>
                {user.permissions && user.permissions.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {user.permissions.map((permission: string) => (
                      <Badge key={permission} variant="secondary" className="text-xs px-2.5 py-1 rounded-full">
                        {permission}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No permissions assigned</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="roles" className="pt-4">
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-500">Role Details ({user.role_details?.length || 0})</h4>
                {user.role_details && user.role_details.length > 0 ? (
                  user.role_details.map((role) => (
                    <div key={role.id} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-l-4 border-l-blue-500">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge className={cn("font-medium border", getRoleColor(role.name))}>
                            {role.label || getRoleDisplayName(role.name)}
                          </Badge>
                          {role.description && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Info className="h-3 w-3 text-gray-400 hover:text-gray-600" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="max-w-xs">{role.description}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">({role.permission_count} permissions)</span>
                      </div>
                      {role.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{role.description}</p>
                      )}
                      <div className="flex flex-wrap gap-1">
                        {role.permissions.map((permission: string) => (
                          <Badge key={permission} variant="outline" className="text-xs px-2 py-0.5 rounded-full">
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No roles assigned</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="activity" className="pt-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <div className="mt-1 rounded-full bg-blue-100 dark:bg-blue-900/30 p-1.5">
                    <User className="h-3 w-3 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Account Created</p>
                    <p className="text-xs text-gray-500">{formatDate(user.created_at)}</p>
                  </div>
                </div>
                {user.approved_at && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    <div className="mt-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 p-1.5">
                      <CheckCircle className="h-3 w-3 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Account Approved</p>
                      <p className="text-xs text-gray-500">{formatDate(user.approved_at)}</p>
                    </div>
                  </div>
                )}
                {user.last_login_at && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    <div className="mt-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 p-1.5">
                      <Activity className="h-3 w-3 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Last Login</p>
                      <p className="text-xs text-gray-500">{formatDate(user.last_login_at)}</p>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <button
            onClick={onClose}
            className="w-full mt-6 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg shadow-blue-600/20"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(
      <AnimatePresence>
        {isOpen && modalContent}
      </AnimatePresence>,
      document.body
    );
  }

  return null;
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function AdminUsersPage() {
  const { user: currentUser, hasPermission } = useAuthContext();
  const { success, error: toastError } = useToast();

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

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false);
  const [showBulkActionDialog, setShowBulkActionDialog] = useState(false);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [resetPasswordErrors, setResetPasswordErrors] = useState<Record<string, string>>({});
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
  const handleCreateUser = async (data: any) => {
    try {
      await createUser({
        ...data,
        department_id: data.department_id && data.department_id !== 'none' ? parseInt(data.department_id) : null
      });
      success('User created successfully');
      setShowCreateDialog(false);
      setFormErrors({});
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors);
      } else {
        toastError('Failed to create user');
      }
    }
  };

  const handleUpdateUser = async (data: any) => {
    if (!selectedUser) return;

    const isTargetAdmin = selectedUser.roles?.includes('ADMIN') || selectedUser.roles?.includes('SUPER_ADMIN');
    if (isTargetAdmin && !isSuperAdmin) {
      toastError('Cannot edit admin users');
      setShowEditDialog(false);
      return;
    }

    try {
      await updateUser(selectedUser.id, {
        ...data,
        department_id: data.department_id && data.department_id !== 'none' ? parseInt(data.department_id) : null
      });
      success('User updated successfully');
      setShowEditDialog(false);
      setSelectedUser(null);
      setFormErrors({});
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors);
      } else {
        toastError('Failed to update user');
      }
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    const isTargetAdmin = selectedUser.roles?.includes('ADMIN') || selectedUser.roles?.includes('SUPER_ADMIN');
    if (isTargetAdmin) {
      toastError('Cannot delete admin users');
      setShowDeleteDialog(false);
      return;
    }

    try {
      await deleteUser(selectedUser.id);
      success('User deleted successfully');
      setShowDeleteDialog(false);
      setSelectedUser(null);
    } catch (error) {
      toastError('Failed to delete user');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) return;

    const nonAdminUsers = selectedUsers.filter(id => {
      const user = users.find((u: User) => u.id === id);
      return !(user?.roles?.includes('ADMIN') || user?.roles?.includes('SUPER_ADMIN'));
    });

    if (nonAdminUsers.length === 0) {
      toastError('Cannot delete admin users');
      setShowBulkDeleteDialog(false);
      return;
    }

    if (nonAdminUsers.length < selectedUsers.length) {
      toastError(`Skipping ${selectedUsers.length - nonAdminUsers.length} admin user(s)`);
    }

    try {
      await bulkAction({ action: 'delete', user_ids: nonAdminUsers });
      success(`${nonAdminUsers.length} users deleted successfully`);
      setSelectedUsers([]);
      setShowBulkDeleteDialog(false);
    } catch (error) {
      toastError('Failed to delete users');
    }
  };

  const handleBulkAction = async () => {
    if (selectedUsers.length === 0) return;

    const nonAdminUsers = selectedUsers.filter(id => {
      const user = users.find((u: User) => u.id === id);
      return !(user?.roles?.includes('ADMIN') || user?.roles?.includes('SUPER_ADMIN'));
    });

    if (nonAdminUsers.length === 0) {
      toastError(`Cannot ${bulkActionType} admin users`);
      setShowBulkActionDialog(false);
      return;
    }

    if (nonAdminUsers.length < selectedUsers.length) {
      toastError(`Skipping ${selectedUsers.length - nonAdminUsers.length} admin user(s)`);
    }

    try {
      await bulkAction({
        action: bulkActionType,
        user_ids: nonAdminUsers
      });
      success(`${nonAdminUsers.length} users ${bulkActionType}d successfully`);
      setSelectedUsers([]);
      setShowBulkActionDialog(false);
    } catch (error) {
      toastError(`Failed to ${bulkActionType} users`);
    }
  };

  const handleToggleStatus = async (userId: number, action: 'activate' | 'deactivate') => {
    const user = users.find((u: User) => u.id === userId);
    if (user?.roles?.includes('ADMIN') || user?.roles?.includes('SUPER_ADMIN')) {
      toastError(`Cannot ${action} admin users`);
      return;
    }

    try {
      if (action === 'activate') {
        await activateUser(userId);
        success('User activated successfully');
      } else {
        await deactivateUser(userId);
        success('User deactivated successfully');
      }
    } catch (error) {
      toastError(`Failed to ${action} user`);
    }
  };

  const handleToggleApproval = async (userId: number, action: 'approve' | 'reject') => {
    const user = users.find((u: User) => u.id === userId);
    if (user?.roles?.includes('ADMIN') || user?.roles?.includes('SUPER_ADMIN')) {
      toastError(`Cannot ${action} admin users`);
      return;
    }

    try {
      if (action === 'approve') {
        await approveUser(userId);
        success('User approved successfully');
      } else {
        await rejectUser(userId);
        success('User rejected successfully');
      }
    } catch (error) {
      toastError(`Failed to ${action} user`);
    }
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
            <Button onClick={() => setShowCreateDialog(true)} className="gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/20">
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
        {/* Stats Cards */}
        <StatsCards
          stats={statsItems}
          isLoading={isLoading}
          columns={6}
          variant="default"
          formatCompact={true}
          tagOrientation="wrapped"
          tagPosition="top-left"
        />

        {/* Filters */}
        <Card className="border-0 shadow-sm rounded-xl bg-white dark:bg-gray-900 relative">
        
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
                    <TableHead className="min-w-[130px] py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Department</TableHead>
                    <TableHead className="min-w-[110px] py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Status</TableHead>
                    <TableHead className="min-w-[150px] py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Last Login</TableHead>
                    <TableHead className="min-w-[200px] py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Permissions</TableHead>
                    <TableHead className="text-right min-w-[130px] py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                        <div className="flex flex-col items-center gap-3">
                          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                          <span className="text-sm text-gray-500">Loading users...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                        <div className="flex flex-col items-center gap-3">
                          <Users className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                          <p className="text-sm font-medium text-gray-500">No users found</p>
                          <p className="text-xs text-gray-400">Try adjusting your filters</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user: User) => {
                      const primaryRole = user.role_details?.[0]?.name || 'STAFF';
                      const primaryRoleLabel = user.role_details?.[0]?.label || user.role_label || null;
                      const primaryRoleDescription = user.role_details?.[0]?.description || user.role_description || null;
                      const displayPermissions = user.permissions?.slice(0, 4) || [];
                      const hasMorePermissions = (user.permissions?.length || 0) > 4;
                      const isAdmin = user.roles?.includes('ADMIN') || user.roles?.includes('SUPER_ADMIN');
                      const isTargetCurrentUser = user.id === currentUser?.id;

                      return (
                        <TableRow key={user.id} className={cn(
                          "hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors group",
                          isTargetCurrentUser && "bg-blue-50/50 dark:bg-blue-900/10"
                        )}>
                          <TableCell>
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
                              <Avatar className="h-9 w-9 ring-2 ring-gray-200 dark:ring-gray-700">
                                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-medium">
                                  {user.first_name?.[0]}{user.last_name?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                    {user.full_name}
                                  </p>
                                  {isAdmin && (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger>
                                          <Crown className="h-3.5 w-3.5 text-yellow-500" />
                                        </TooltipTrigger>
                                        <TooltipContent className="rounded-xl">Administrator</TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  )}
                                  {isTargetCurrentUser && (
                                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 rounded-full">
                                      You
                                    </Badge>
                                  )}
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
                            <div className="flex flex-col gap-1">
                              <Badge className={cn("font-medium border rounded-full", getRoleColor(primaryRole))}>
                                {primaryRoleLabel || getRoleDisplayName(primaryRole)}
                              </Badge>
                              {primaryRoleDescription && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <span className="text-[10px] text-gray-400 hover:text-gray-600 cursor-help flex items-center gap-0.5">
                                        <Info className="h-2.5 w-2.5" />
                                        <span>info</span>
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent className="rounded-xl">
                                      <p className="max-w-xs text-xs">{primaryRoleDescription}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                              {user.roles && user.roles.length > 1 && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <Badge variant="outline" className="text-xs rounded-full">
                                        +{user.roles.length - 1}
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent className="rounded-xl">
                                      <p>Additional roles: {user.roles.slice(1).join(', ')}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {user.department?.name || '—'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <Badge className={cn("font-medium border text-xs rounded-full", getStatusColor(user.is_active ? 'active' : 'inactive'))}>
                                {user.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                              {!user.is_approved && (
                                <Badge variant="outline" className="text-xs border-yellow-400 text-yellow-600 dark:text-yellow-400 rounded-full">
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
                            <div className="flex flex-wrap items-center gap-1">
                              {displayPermissions.map((permission: string) => (
                                <Badge key={permission} variant="secondary" className="text-xs whitespace-nowrap rounded-full">
                                  {permission}
                                </Badge>
                              ))}
                              {hasMorePermissions && (
                                <Badge variant="outline" className="text-xs cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                                  +{user.permissions.length - 4} more
                                </Badge>
                              )}
                              {user.permissions?.length === 0 && (
                                <span className="text-xs text-gray-400">No permissions</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-1">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                      onClick={() => {
                                        setSelectedUser(user);
                                        setShowViewDialog(true);
                                      }}
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
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="flex items-center justify-between py-4 px-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30">
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
          MODALS
          ============================================ */}

      {/* View User Modal */}
      <ViewUserModal
        isOpen={showViewDialog}
        onClose={() => {
          setShowViewDialog(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
      />

      {/* Delete User Modal - Using Portal */}
      {showDeleteDialog && typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogContent className="z-[9999] rounded-xl dark:bg-gray-900 relative">
              <WrappedCornerTag label="DELETE" color="red" position="top-left" size="sm" />
              <DialogHeader className="pt-6">
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
        </AnimatePresence>,
        document.body
      )}

      {/* Bulk Delete Modal */}
      {showBulkDeleteDialog && typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          <Dialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
            <DialogContent className="z-[9999] rounded-xl dark:bg-gray-900 relative">
              <WrappedCornerTag label="BULK DELETE" color="red" position="top-left" size="sm" />
              <DialogHeader className="pt-6">
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
        </AnimatePresence>,
        document.body
      )}

      {/* Bulk Action Modal */}
      {showBulkActionDialog && typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          <Dialog open={showBulkActionDialog} onOpenChange={setShowBulkActionDialog}>
            <DialogContent className="z-[9999] rounded-xl dark:bg-gray-900 relative">
              <WrappedCornerTag label="BULK ACTION" color="blue" position="top-left" size="sm" />
              <DialogHeader className="pt-6">
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
        </AnimatePresence>,
        document.body
      )}
    </PageTemplate>
  );
}
