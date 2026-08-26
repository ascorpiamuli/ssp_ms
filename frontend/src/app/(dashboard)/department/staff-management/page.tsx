// frontend/src/app/(dashboard)/department/staff-management/page.tsx

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  UserPlus,
  UserMinus,
  Search,
  Loader2,
  RefreshCw,
  Building2,
  User,
  Phone,
  BadgeCheck,
  Eye,
  AlertCircle,
  Users as UsersIcon,
  UserCheck,
  UserX,
  AlertTriangle,
  Mail,
  Calendar,
  Clock,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  Filter,
  Download,
  Printer,
  Sparkles,
  TrendingUp,
  Activity,
  Briefcase,
  Award,
  Star,
  Info,
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
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { PageTemplate } from '@/components/dashboard/PageTemplate';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Hooks
import { useAuthContext } from '@/contexts/AuthContext';
import { useDepartments } from '@/hooks/useDepartments';

// Types
import type { User as UserType } from '@/types/common.types';

// UI Components
import StatsCards, { type StatCardItem } from '@/components/ui/stat-cards';
import { WrappedCornerTag } from '@/components/ui/wrapped-corner-tag';
import HorizontalCornerTag from '@/components/ui/horizontal-corner-tag';

// ============================================
// CONSTANTS
// ============================================

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrator',
  HOD: 'Head of Department',
  ACCOUNTANT: 'Accountant/Finance',
  'HEAD OF INSTITUTION': 'Principal/Head of Institution',
  FINAL_APPROVER: 'Director/Finance Administrator',
  PROCUREMENT: 'Procurement Officer',
  SUPPLIER: 'Supplier/Vendor',
  AUDITOR: 'Auditorial Staff Officer',
  SUPER_ADMIN: 'Super Administrator',
  STAFF: 'Staff Member',
};

const ROLE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  ADMIN: { bg: 'bg-purple-50 dark:bg-purple-950/30', text: 'text-purple-700 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800' },
  HOD: { bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800' },
  ACCOUNTANT: { bg: 'bg-indigo-50 dark:bg-indigo-950/30', text: 'text-indigo-700 dark:text-indigo-400', border: 'border-indigo-200 dark:border-indigo-800' },
  'HEAD OF INSTITUTION': { bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800' },
  FINAL_APPROVER: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800' },
  PROCUREMENT: { bg: 'bg-cyan-50 dark:bg-cyan-950/30', text: 'text-cyan-700 dark:text-cyan-400', border: 'border-cyan-200 dark:border-cyan-800' },
  SUPPLIER: { bg: 'bg-orange-50 dark:bg-orange-950/30', text: 'text-orange-700 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800' },
  AUDITOR: { bg: 'bg-rose-50 dark:bg-rose-950/30', text: 'text-rose-700 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-800' },
  SUPER_ADMIN: { bg: 'bg-red-50 dark:bg-red-950/30', text: 'text-red-700 dark:text-red-400', border: 'border-red-200 dark:border-red-800' },
  STAFF: { bg: 'bg-gray-50 dark:bg-gray-800/50', text: 'text-gray-700 dark:text-gray-400', border: 'border-gray-200 dark:border-gray-700' },
};

const getRoleLabel = (roleName?: string): string => {
  if (!roleName) return 'Unknown Role';
  const upperRole = roleName.toUpperCase();
  return ROLE_LABELS[upperRole] || roleName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const getRoleColor = (roleName?: string) => {
  if (!roleName) return ROLE_COLORS.STAFF;
  const upperRole = roleName.toUpperCase();
  return ROLE_COLORS[upperRole] || ROLE_COLORS.STAFF;
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

const getStatusBadge = (isActive: boolean) => {
  if (isActive) {
    return (
      <Badge className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800 rounded-full">
        <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5" />
        Active
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-700 rounded-full">
      <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-1.5" />
      Inactive
    </Badge>
  );
};

// ============================================
// TYPES
// ============================================

interface StaffMember {
  id: number;
  first_name: string;
  last_name: string;
  full_name?: string;
  email: string;
  phone?: string | null;
  role?: string;
  role_label?: string;
  department_id?: number | null;
  is_active?: boolean;
  initials?: string;
}

interface StaffManagementStats {
  total: number;
  active: number;
  inactive: number;
  assigned: number;
  unassigned: number;
}

// ============================================
// COMPONENTS
// ============================================

// ============================================
// AVAILABLE STAFF CARD (Compact)
// ============================================

const AvailableStaffCard = ({
  staff,
  onAssign,
  isAssigning,
}: {
  staff: StaffMember;
  onAssign: (id: number) => void;
  isAssigning: boolean;
}) => {
  const roleLabel = staff.role_label || getRoleLabel(staff.role);
  const roleColor = getRoleColor(staff.role);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className="flex items-center justify-between p-3 rounded-xl border bg-white dark:bg-gray-900 dark:border-gray-700 hover:shadow-md transition-all"
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Avatar className="h-10 w-10 border-2 border-green-200 dark:border-green-800 flex-shrink-0">
          <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white text-sm">
            {staff.initials || getInitials(getFullName(staff))}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm dark:text-gray-100 truncate">
              {getFullName(staff)}
            </span>
            <Badge className={cn("text-xs rounded-full", roleColor.bg, roleColor.text, roleColor.border)}>
              {roleLabel}
            </Badge>
            <Badge variant="outline" className="text-xs rounded-full border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30">
              <User className="h-2.5 w-2.5 mr-1" />
              Available
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {staff.email || 'No email'}
            </span>
            {staff.phone && (
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {staff.phone}
              </span>
            )}
          </div>
        </div>
      </div>
      <Button
        size="sm"
        className="gap-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/20 rounded-xl flex-shrink-0 ml-2"
        onClick={() => onAssign(staff.id)}
        disabled={isAssigning}
      >
        {isAssigning ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <UserPlus className="h-4 w-4" />
            Assign
          </>
        )}
      </Button>
    </motion.div>
  );
};

// ============================================
// STAFF TABLE ROW
// ============================================

const StaffTableRow = ({
  staff,
  onRemove,
  isRemoving,
  index,
}: {
  staff: StaffMember;
  onRemove: (id: number) => void;
  isRemoving: boolean;
  index: number;
}) => {
  const isActive = staff.is_active !== false;
  const roleLabel = staff.role_label || getRoleLabel(staff.role);
  const roleColor = getRoleColor(staff.role);

  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className={cn(
        "border-b dark:border-gray-700 hover:bg-muted/30 transition-colors",
        !isActive && "bg-gray-50/50 dark:bg-gray-800/30"
      )}
    >
      <TableCell className="py-3 px-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border border-gray-200 dark:border-gray-700 flex-shrink-0">
            <AvatarFallback className={cn(
              "text-white text-sm",
              isActive
                ? "bg-gradient-to-br from-blue-500 to-indigo-600"
                : "bg-gray-400 dark:bg-gray-600"
            )}>
              {staff.initials || getInitials(getFullName(staff))}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-sm dark:text-gray-100">
              {getFullName(staff)}
            </div>
            <div className="text-xs text-muted-foreground">
              {staff.email || 'No email'}
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell className="py-3 px-4">
        <Badge className={cn("text-xs rounded-full", roleColor.bg, roleColor.text, roleColor.border)}>
          {roleLabel}
        </Badge>
      </TableCell>
      <TableCell className="py-3 px-4">
        {staff.phone ? (
          <span className="text-sm text-muted-foreground">{staff.phone}</span>
        ) : (
          <span className="text-sm text-muted-foreground/50">—</span>
        )}
      </TableCell>
      <TableCell className="py-3 px-4">
        {getStatusBadge(isActive)}
      </TableCell>
      <TableCell className="py-3 px-4">
        <div className="flex items-center gap-1 justify-end">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-xl hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                  onClick={() => onRemove(staff.id)}
                  disabled={isRemoving}
                >
                  {isRemoving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UserMinus className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent className="rounded-xl">Remove from Department</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </TableCell>
    </motion.tr>
  );
};

// ============================================
// BULK ASSIGN DIALOG
// ============================================

interface BulkAssignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableStaff: StaffMember[];
  onBulkAssign: (userIds: number[]) => void;
  isAssigning: boolean;
}

const BulkAssignDialog = ({
  open,
  onOpenChange,
  availableStaff,
  onBulkAssign,
  isAssigning,
}: BulkAssignDialogProps) => {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const handleToggleAll = () => {
    if (selectedIds.length === availableStaff.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(availableStaff.map(s => s.id));
    }
  };

  const handleToggle = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleConfirm = () => {
    if (selectedIds.length > 0) {
      onBulkAssign(selectedIds);
      setSelectedIds([]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl dark:bg-gray-900 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <UsersIcon className="h-6 w-6 text-blue-600" />
            Bulk Assign Staff
          </DialogTitle>
          <DialogDescription>
            Select multiple staff members to assign to your department.
            {availableStaff.length === 0 && " No available staff found."}
          </DialogDescription>
        </DialogHeader>

        {availableStaff.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="select-all"
                  checked={selectedIds.length === availableStaff.length}
                  onCheckedChange={handleToggleAll}
                />
                <Label htmlFor="select-all" className="text-sm font-medium">
                  Select All ({availableStaff.length})
                </Label>
              </div>
              <span className="text-sm text-muted-foreground bg-white dark:bg-gray-800 px-2 py-0.5 rounded-full border dark:border-gray-700">
                {selectedIds.length} selected
              </span>
            </div>

            <ScrollArea className="h-60 rounded-xl border dark:border-gray-700">
              <div className="p-2 space-y-1">
                {availableStaff.map((staff) => (
                  <div
                    key={staff.id}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors",
                      selectedIds.includes(staff.id) && "bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800"
                    )}
                  >
                    <Checkbox
                      id={`staff-${staff.id}`}
                      checked={selectedIds.includes(staff.id)}
                      onCheckedChange={() => handleToggle(staff.id)}
                    />
                    <Label htmlFor={`staff-${staff.id}`} className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white text-xs">
                            {staff.initials || getInitials(getFullName(staff))}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{getFullName(staff)}</p>
                          <p className="text-xs text-muted-foreground">{staff.email || 'No email'}</p>
                        </div>
                      </div>
                    </Label>
                    <Badge className="text-xs rounded-full bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800">
                      {staff.role_label || getRoleLabel(staff.role)}
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/20 rounded-xl"
                onClick={handleConfirm}
                disabled={selectedIds.length === 0 || isAssigning}
              >
                {isAssigning ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    Assign {selectedIds.length} Staff
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="text-center py-8">
            <UsersIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No available staff members to assign</p>
            <p className="text-sm text-muted-foreground">All staff members are already assigned to departments</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// ============================================
// MAIN PAGE
// ============================================

export default function StaffManagementPage() {
  const router = useRouter();
  const { user } = useAuthContext();

  // Hooks
  const {
    useAvailableStaff,
    useDepartmentStaffList,
    assignStaffToDepartment,
    removeStaffFromDepartment,
    bulkAssignStaffToDepartment,
    useAllDepartments,
  } = useDepartments();

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [staffToRemove, setStaffToRemove] = useState<number | null>(null);
  const [removeStaffName, setRemoveStaffName] = useState<string>('');

  // Get HOD's department
  const userRole = user?.role?.toLowerCase() || '';
  const isHod = userRole === 'hod';

  // Fetch departments to find HOD's department
  const { data: departmentsData, isLoading: departmentsLoading } = useAllDepartments();

  // Find HOD's department
  const hodDepartment = useMemo(() => {
    if (!departmentsData || !user) return null;
    const depts = Array.isArray(departmentsData) ? departmentsData : departmentsData?.data || [];
    return depts.find((d: any) => d.hod_id === user.id) || null;
  }, [departmentsData, user]);

  const departmentId = hodDepartment?.id;

  // Fetch staff data
  const {
    data: staffListData,
    isLoading: staffListLoading,
    refetch: refetchStaffList,
  } = useDepartmentStaffList(departmentId || 0);

  const {
    data: availableStaffData,
    isLoading: availableLoading,
    refetch: refetchAvailable,
  } = useAvailableStaff(departmentId || 0);

  // Mutations
  const assignMutation = assignStaffToDepartment;
  const removeMutation = removeStaffFromDepartment;
  const bulkAssignMutation = bulkAssignStaffToDepartment;

  // Memoized data
  const staffList = useMemo(() => {
    if (!staffListData) return [];
    return Array.isArray(staffListData) ? staffListData : staffListData?.data || [];
  }, [staffListData]);

  const availableStaff = useMemo(() => {
    if (!availableStaffData) return [];
    return Array.isArray(availableStaffData) ? availableStaffData : availableStaffData?.data || [];
  }, [availableStaffData]);

  // Filter staff list
  const filteredStaffList = useMemo(() => {
    let filtered = staffList;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((s: StaffMember) =>
        getFullName(s).toLowerCase().includes(term) ||
        (s.email && s.email.toLowerCase().includes(term)) ||
        (s.phone && s.phone.includes(searchTerm))
      );
    }

    if (filterRole !== 'all') {
      filtered = filtered.filter((s: StaffMember) =>
        s.role?.toLowerCase() === filterRole
      );
    }

    if (filterStatus !== 'all') {
      const isActive = filterStatus === 'active';
      filtered = filtered.filter((s: StaffMember) =>
        s.is_active === isActive
      );
    }

    return filtered;
  }, [staffList, searchTerm, filterRole, filterStatus]);

  // Filter available staff
  const filteredAvailable = useMemo(() => {
    let filtered = availableStaff;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((s: StaffMember) =>
        getFullName(s).toLowerCase().includes(term) ||
        (s.email && s.email.toLowerCase().includes(term)) ||
        (s.phone && s.phone.includes(searchTerm))
      );
    }

    if (filterRole !== 'all') {
      filtered = filtered.filter((s: StaffMember) =>
        s.role?.toLowerCase() === filterRole
      );
    }

    return filtered;
  }, [availableStaff, searchTerm, filterRole]);

  // Stats
  const stats: StaffManagementStats = useMemo(() => {
    const total = staffList.length;
    const active = staffList.filter((s: StaffMember) => s.is_active !== false).length;
    const inactive = staffList.filter((s: StaffMember) => s.is_active === false).length;
    const assigned = staffList.filter((s: StaffMember) => s.department_id).length;
    const unassigned = availableStaff.length;

    return { total, active, inactive, assigned, unassigned };
  }, [staffList, availableStaff]);

  const statsItems: StatCardItem[] = useMemo(() => [
    {
      label: "Total Staff",
      value: stats.total,
      icon: Users,
      tagLabel: "TOTAL",
      tagColor: "blue",
      subtitle: "All staff in your department",
    },
    {
      label: "Active Staff",
      value: stats.active,
      icon: UserCheck,
      tagLabel: "ACTIVE",
      tagColor: "emerald",
      subtitle: "Currently active members",
    },
    {
      label: "Inactive Staff",
      value: stats.inactive,
      icon: UserX,
      tagLabel: "INACTIVE",
      tagColor: "gray",
      subtitle: "Inactive members",
    },
    {
      label: "Available to Assign",
      value: stats.unassigned,
      icon: UserPlus,
      tagLabel: "AVAILABLE",
      tagColor: "amber",
      subtitle: "Staff not in any department",
    },
  ], [stats]);

  // Handlers
  const handleAssign = (userId: number) => {
    if (!departmentId) return;
    assignMutation.mutate({ id: departmentId, user_id: userId });
  };

  const handleRemoveClick = (userId: number, staffName: string) => {
    setStaffToRemove(userId);
    setRemoveStaffName(staffName);
    setIsRemoveDialogOpen(true);
  };

  const confirmRemove = () => {
    if (!departmentId || !staffToRemove) return;
    removeMutation.mutate({ id: departmentId, user_id: staffToRemove });
  };

  const handleBulkAssign = (userIds: number[]) => {
    if (!departmentId) return;
    bulkAssignMutation.mutate({ id: departmentId, user_ids: userIds });
  };

  const handleRefresh = () => {
    refetchStaffList();
    refetchAvailable();
  };

  // Loading state
  const isLoading = staffListLoading || availableLoading || departmentsLoading;

  // Not HOD or no department
  if (!isHod) {
    return (
      <PageTemplate
        title="Staff Management"
        description="Manage staff members in your department"
        icon={<Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />}
        background="gradient"
        variant="default"
      >
        <Card className="border-0 shadow-sm rounded-xl">
          <CardContent className="p-12 text-center">
            <div className="p-4 rounded-full bg-red-100 dark:bg-red-900/30 mx-auto w-16 h-16 flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">Access Restricted</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              This page is only accessible to Heads of Department (HODs).
              Please contact your administrator if you believe you should have access.
            </p>
          </CardContent>
        </Card>
      </PageTemplate>
    );
  }

  if (!departmentId && !isLoading) {
    return (
      <PageTemplate
        title="Staff Management"
        description="Manage staff members in your department"
        icon={<Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />}
        background="gradient"
        variant="default"
      >
        <Card className="border-0 shadow-sm rounded-xl">
          <CardContent className="p-12 text-center">
            <div className="p-4 rounded-full bg-amber-100 dark:bg-amber-900/30 mx-auto w-16 h-16 flex items-center justify-center mb-4">
              <Building2 className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">No Department Assigned</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              You are not currently assigned as the Head of any department.
              Please contact your administrator to set up your department.
            </p>
          </CardContent>
        </Card>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title="Staff Management"
      description="Manage staff members assigned to your department"
      icon={<Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />}
      background="gradient"
      variant="default"
      breadcrumbs={[
        { label: 'Department', href: '/department' },
        { label: 'Staff Management' },
      ]}
      actions={
        <div className="flex items-center gap-2 flex-wrap">
          {stats.unassigned > 0 && (
            <Button
              variant="default"
              size="sm"
              onClick={() => setIsBulkDialogOpen(true)}
              className="gap-2 h-9 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/20 rounded-xl"
            >
              <UsersIcon className="h-4 w-4" />
              Bulk Assign ({stats.unassigned})
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="gap-2 h-9 rounded-xl dark:border-gray-700 dark:hover:bg-gray-800"
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      }
    >
      {/* Department Info Banner */}
      {hodDepartment && (
        <Card className="mb-6 border-blue-200 dark:border-blue-800/50 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/20 to-indigo-200/20 dark:from-blue-400/10 dark:to-indigo-400/10 rounded-full blur-2xl -mr-16 -mt-16" />
          <HorizontalCornerTag label="DEPARTMENT" color="blue" position="top-left" size="sm" variant="rounded" />
          <CardContent className="p-4 pt-6 relative z-10">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex-shrink-0">
                <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <p className="font-semibold text-blue-700 dark:text-blue-300">
                    {hodDepartment.name}
                  </p>
                  <Badge className="bg-blue-200/50 text-blue-700 dark:bg-blue-800/30 dark:text-blue-300 border-blue-200 dark:border-blue-700 rounded-full text-xs">
                    {hodDepartment.code}
                  </Badge>
                </div>
                <p className="text-sm text-blue-600 dark:text-blue-400/80 mt-0.5">
                  You are the Head of Department. Manage staff members assigned to your department below.
                  {hodDepartment.description && ` — ${hodDepartment.description}`}
                </p>
                <div className="flex items-center gap-4 mt-1.5 text-xs text-blue-600 dark:text-blue-400/70">
                  <span className="flex items-center gap-1 bg-blue-100/50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full">
                    <Users className="h-3 w-3" />
                    {stats.total} staff
                  </span>
                  <span className="flex items-center gap-1 bg-green-100/50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                    <UserCheck className="h-3 w-3" />
                    {stats.active} active
                  </span>
                  {stats.unassigned > 0 && (
                    <span className="flex items-center gap-1 bg-amber-100/50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full text-amber-700 dark:text-amber-400">
                      <UserPlus className="h-3 w-3" />
                      {stats.unassigned} available
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <StatsCards
        stats={statsItems}
        isLoading={isLoading}
        columns={4}
        variant="default"
        formatCompact={true}
        tagOrientation="none"
      />

      {/* Filters */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10 rounded-xl dark:bg-gray-900 dark:border-gray-700"
          />
        </div>

        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-[160px] h-10 rounded-xl dark:bg-gray-900 dark:border-gray-700">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="staff">Staff</SelectItem>
            <SelectItem value="hod">HOD</SelectItem>
            <SelectItem value="accountant">Accountant</SelectItem>
            <SelectItem value="procurement">Procurement</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[160px] h-10 rounded-xl dark:bg-gray-900 dark:border-gray-700">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Available Staff Section */}
      <div className="mt-6">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-950 rounded-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-200/10 dark:bg-amber-400/5 rounded-full blur-3xl -mr-32 -mt-32" />
          <HorizontalCornerTag label="AVAILABLE" color="amber" position="top-left" size="sm" variant="rounded" />
          <CardHeader className="pb-3 pt-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <UserPlus className="h-5 w-5 text-amber-600" />
                  Available Staff
                  <Badge className="ml-2 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800">
                    {filteredAvailable.length}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Staff members not assigned to any department. Assign them to your department.
                </CardDescription>
              </div>
              {filteredAvailable.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsBulkDialogOpen(true)}
                  className="gap-2 rounded-xl border-amber-200 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                >
                  <UsersIcon className="h-4 w-4" />
                  Bulk Assign
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0 relative z-10">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
              </div>
            ) : filteredAvailable.length === 0 ? (
              <div className="text-center py-8">
                <div className="p-4 rounded-full bg-amber-50 dark:bg-amber-950/20 mx-auto w-16 h-16 flex items-center justify-center mb-3">
                  <UserPlus className="h-8 w-8 text-amber-400" />
                </div>
                <p className="text-muted-foreground font-medium">No available staff members</p>
                <p className="text-sm text-muted-foreground">All staff members are already assigned to departments</p>
              </div>
            ) : (
              <ScrollArea className="max-h-72">
                <div className="space-y-2 pr-2">
                  {filteredAvailable.map((staff: StaffMember) => (
                    <AvailableStaffCard
                      key={staff.id}
                      staff={staff}
                      onAssign={handleAssign}
                      isAssigning={assignMutation.isPending && assignMutation.variables?.user_id === staff.id}
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Current Staff Table */}
      <div className="mt-6">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-950 rounded-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-200/10 dark:bg-blue-400/5 rounded-full blur-3xl -mr-32 -mt-32" />
          <WrappedCornerTag label="STAFF" color="blue" position="top-left" size="lg" />
          <CardHeader className="pb-3 pt-8 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                  Department Staff
                  <Badge className="ml-2 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                    {filteredStaffList.length}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Staff members currently assigned to your department
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground bg-muted/30 px-3 py-1 rounded-full">
                  <span className="font-medium text-green-600 dark:text-green-400">
                    {filteredStaffList.filter((s: StaffMember) => s.is_active !== false).length}
                  </span> active
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 relative z-10">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : filteredStaffList.length === 0 ? (
              <div className="text-center py-12">
                <div className="p-4 rounded-full bg-blue-50 dark:bg-blue-950/20 mx-auto w-16 h-16 flex items-center justify-center mb-3">
                  <Users className="h-8 w-8 text-blue-400" />
                </div>
                <p className="text-muted-foreground font-medium">No staff members assigned</p>
                <p className="text-sm text-muted-foreground">Assign staff from the available list above</p>
              </div>
            ) : (
              <ScrollArea className="w-full">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 dark:bg-gray-800/50 hover:bg-muted/30">
                      <TableHead className="py-3 px-4 font-semibold text-xs uppercase tracking-wider">
                        Staff Member
                      </TableHead>
                      <TableHead className="py-3 px-4 font-semibold text-xs uppercase tracking-wider">
                        Role
                      </TableHead>
                      <TableHead className="py-3 px-4 font-semibold text-xs uppercase tracking-wider">
                        Contact
                      </TableHead>
                      <TableHead className="py-3 px-4 font-semibold text-xs uppercase tracking-wider">
                        Status
                      </TableHead>
                      <TableHead className="py-3 px-4 font-semibold text-xs uppercase tracking-wider text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStaffList.map((staff: StaffMember, index: number) => (
                      <StaffTableRow
                        key={staff.id}
                        staff={staff}
                        onRemove={() => handleRemoveClick(staff.id, getFullName(staff))}
                        isRemoving={removeMutation.isPending && removeMutation.variables?.user_id === staff.id}
                        index={index}
                      />
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Remove Confirmation Dialog */}
      <AlertDialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <AlertDialogContent className="dark:bg-gray-900 rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Remove Staff Member
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-1">
              <p>
                Are you sure you want to remove <span className="font-semibold text-foreground">{removeStaffName}</span> from your department?
              </p>
              <p className="text-sm text-muted-foreground">
                They will be unassigned and available to be assigned to other departments.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 rounded-xl"
              onClick={confirmRemove}
              disabled={removeMutation.isPending}
            >
              {removeMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Removing...
                </>
              ) : (
                'Remove Staff'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Assign Dialog */}
      <BulkAssignDialog
        open={isBulkDialogOpen}
        onOpenChange={setIsBulkDialogOpen}
        availableStaff={filteredAvailable}
        onBulkAssign={handleBulkAssign}
        isAssigning={bulkAssignMutation.isPending}
      />
    </PageTemplate>
  );
}
