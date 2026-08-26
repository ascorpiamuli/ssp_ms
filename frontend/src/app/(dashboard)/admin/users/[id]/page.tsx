// app/(dashboard)/admin/users/[id]/page.tsx

'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Building2,
  BadgeCheck,
  AlertCircle,
  Loader2,
  RefreshCw,
  ArrowLeft,
  UserCheck,
  UserX,
  Shield,
  Crown,
  CreditCard,
  Briefcase,
  MapPin,
  Globe,
  FileText,
  QrCode,
  Signature,
  CheckCircle,
  XCircle,
  Clock,
  Edit,
  Trash2,
  Award,
  TrendingUp,
  Activity,
  Users,
  Building,
  MessageSquare,
  ExternalLink,
  Info,
  Zap,
  ShieldCheck,
  Fingerprint,
  Scan,
  Store,
  Hash,
  ChevronRight,
  Linkedin,
  Twitter,
  Github,
  AlertTriangle,
  ScrollText,
  UserPlus,
  Globe2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge as BadgeComponent } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { PageTemplate } from '@/components/dashboard/PageTemplate';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useUsers } from '@/hooks/useUsers';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useDepartments } from '@/hooks/useDepartments';
import { useRoles } from '@/hooks/useRoles';
import { useSignature } from '@/hooks/useSignature';
import { useAuthContext } from '@/contexts/AuthContext';

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

const ROLE_COLORS: Record<string, { bg: string; text: string; border: string; icon: any }> = {
  ADMIN: { bg: 'bg-purple-50 dark:bg-purple-950/30', text: 'text-purple-700 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800', icon: Shield },
  HOD: { bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800', icon: Crown },
  ACCOUNTANT: { bg: 'bg-indigo-50 dark:bg-indigo-950/30', text: 'text-indigo-700 dark:text-indigo-400', border: 'border-indigo-200 dark:border-indigo-800', icon: CreditCard },
  'HEAD OF INSTITUTION': { bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800', icon: Award },
  FINAL_APPROVER: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800', icon: ShieldCheck },
  PROCUREMENT: { bg: 'bg-cyan-50 dark:bg-cyan-950/30', text: 'text-cyan-700 dark:text-cyan-400', border: 'border-cyan-200 dark:border-cyan-800', icon: TrendingUp },
  SUPPLIER: { bg: 'bg-orange-50 dark:bg-orange-950/30', text: 'text-orange-700 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800', icon: Store },
  AUDITOR: { bg: 'bg-rose-50 dark:bg-rose-950/30', text: 'text-rose-700 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-800', icon: FileText },
  SUPER_ADMIN: { bg: 'bg-red-50 dark:bg-red-950/30', text: 'text-red-700 dark:text-red-400', border: 'border-red-200 dark:border-red-800', icon: Zap },
  STAFF: { bg: 'bg-gray-50 dark:bg-gray-800/50', text: 'text-gray-700 dark:text-gray-400', border: 'border-gray-200 dark:border-gray-700', icon: User },
};

const PERMISSION_COLORS: Record<string, string> = {
  'view': 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  'create': 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  'edit': 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  'update': 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  'delete': 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border-red-200 dark:border-red-800',
  'manage': 'bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400 border-purple-200 dark:border-purple-800',
  'approve': 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
  'assign': 'bg-teal-50 text-teal-700 dark:bg-teal-950/30 dark:text-teal-400 border-teal-200 dark:border-teal-800',
  'revoke': 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border-rose-200 dark:border-rose-800',
  'export': 'bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-400 border-sky-200 dark:border-sky-800',
  'import': 'bg-lime-50 text-lime-700 dark:bg-lime-950/30 dark:text-lime-400 border-lime-200 dark:border-lime-800',
  'submit': 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800',
  'cancel': 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border-rose-200 dark:border-rose-800',
};

// ============================================
// HELPER FUNCTIONS
// ============================================

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
    return format(new Date(date), 'dd MMM yyyy, HH:mm:ss');
  } catch {
    return 'Invalid Date';
  }
};

const formatTimeAgo = (date: string | Date | null): string => {
  if (!date) return 'Never';
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return 'Never';
  }
};

const getStatusBadge = (isActive: boolean, isApproved: boolean) => {
  if (!isApproved) {
    return { label: 'Pending Approval', color: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800', icon: Clock };
  }
  if (isActive) {
    return { label: 'Active', color: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800', icon: CheckCircle };
  }
  return { label: 'Inactive', color: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800', icon: XCircle };
};

const getPermissionColor = (permission: string): string => {
  for (const [key, value] of Object.entries(PERMISSION_COLORS)) {
    if (permission.includes(key)) {
      return value;
    }
  }
  return 'bg-gray-50 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400 border-gray-200 dark:border-gray-700';
};

// ============================================
// COMPONENTS
// ============================================

const InfoCard = ({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: any;
  label: string;
  value: string | React.ReactNode;
  className?: string;
}) => (
  <div className={cn("flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border dark:border-gray-700 hover:shadow-md transition-shadow", className)}>
    <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20 text-primary flex-shrink-0">
      <Icon className="h-4 w-4" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="text-sm font-medium dark:text-gray-100 truncate">{value || 'N/A'}</p>
    </div>
  </div>
);

const PermissionBadge = ({ permission }: { permission: string }) => {
  const color = getPermissionColor(permission);
  return (
    <BadgeComponent className={cn("text-xs rounded-full border", color)}>
      {permission}
    </BadgeComponent>
  );
};

const StatCard = ({
  icon: Icon,
  label,
  value,
  subtitle,
  color = 'blue',
}: {
  icon: any;
  label: string;
  value: string | number;
  subtitle?: string;
  color?: 'blue' | 'emerald' | 'amber' | 'red' | 'purple' | 'indigo' | 'pink' | 'teal' | 'cyan';
}) => {
  const colorMap = {
    blue: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    amber: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    red: 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800',
    purple: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    indigo: 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
    pink: 'bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400 border-pink-200 dark:border-pink-800',
    teal: 'bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800',
    cyan: 'bg-cyan-50 dark:bg-cyan-950/30 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800',
  };

  return (
    <div className={cn("p-4 rounded-xl border", colorMap[color])}>
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-white/50 dark:bg-gray-800/50">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
          {subtitle && <p className="text-xs opacity-70">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
};

// ============================================
// SIGNATURE SECTION
// ============================================

const SignatureSection = ({ userId }: { userId: number }) => {
  const {
    effectiveSignature,
    isLoading,
    getImageUrl,
    getQRCodeImage,
    getUserName,
  } = useSignature();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (!effectiveSignature) {
    return (
      <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl">
        <CardContent className="p-6 text-center">
          <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-800 mx-auto w-16 h-16 flex items-center justify-center mb-3">
            <Signature className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-muted-foreground font-medium">No Signature Uploaded</p>
          <p className="text-sm text-muted-foreground">This user hasn't uploaded a signature specimen yet</p>
        </CardContent>
      </Card>
    );
  }

  const imageUrl = getImageUrl();
  const qrCodeImage = getQRCodeImage();
  const status = effectiveSignature.status || 'pending';
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
    approved: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
    rejected: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Signature Specimen */}
      <Card className="border-0 shadow-sm rounded-xl overflow-hidden">
        <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Signature className="h-4 w-4 text-blue-600" />
              Signature Specimen
            </CardTitle>
            <BadgeComponent className={cn("text-xs rounded-full", statusColors[status as keyof typeof statusColors] || statusColors.pending)}>
              {status === 'approved' && <CheckCircle className="h-3 w-3 mr-1" />}
              {status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
              {status === 'rejected' && <XCircle className="h-3 w-3 mr-1" />}
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </BadgeComponent>
          </div>
          <CardDescription>
            Uploaded by {getUserName()} • {formatDate(effectiveSignature.created_at)}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-4">
          {imageUrl ? (
            <div className="relative rounded-xl overflow-hidden border dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
              <img
                src={imageUrl}
                alt="Signature"
                className="max-h-32 mx-auto object-contain"
              />
              <div className="absolute bottom-2 right-2">
                <BadgeComponent variant="outline" className="text-[10px] bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                  <Fingerprint className="h-3 w-3 mr-1" />
                  Verified
                </BadgeComponent>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 border-2 border-dashed rounded-xl dark:border-gray-700">
              <Signature className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No signature image available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* QR Code */}
      <Card className="border-0 shadow-sm rounded-xl overflow-hidden">
        <CardHeader className="pb-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <QrCode className="h-4 w-4 text-purple-600" />
              QR Verification Code
            </CardTitle>
            {effectiveSignature.qr_code && (
              <BadgeComponent variant="outline" className="text-xs rounded-full border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400">
                <Scan className="h-3 w-3 mr-1" />
                Active
              </BadgeComponent>
            )}
          </div>
          <CardDescription>
            Scan to verify signature authenticity
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-4">
          {qrCodeImage ? (
            <div className="relative rounded-xl overflow-hidden border dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
              <img
                src={qrCodeImage}
                alt="QR Code"
                className="max-h-32 mx-auto object-contain"
              />
              <div className="absolute bottom-2 right-2">
                <BadgeComponent variant="outline" className="text-[10px] bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                  <Scan className="h-3 w-3 mr-1" />
                  Scan to Verify
                </BadgeComponent>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 border-2 border-dashed rounded-xl dark:border-gray-700">
              <QrCode className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No QR code generated</p>
              <p className="text-xs text-muted-foreground">QR code will be generated upon signature verification</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = parseInt(params.id as string);

  // Hooks
  const { useGetUser, activateUser, deactivateUser, deleteUser } = useUsers();
  const { useAllDepartments } = useDepartments();
  const { useSupplierByUserId } = useSuppliers();
  const { user: currentUser } = useAuthContext();

  // Queries
  const { data: userData, isLoading: userLoading, refetch: refetchUser } = useGetUser(userId);
  const { data: departmentsData } = useAllDepartments();
  const { data: supplierData, isLoading: supplierLoading } = useSupplierByUserId();

  // Mutations
  const activateMutation = activateUser;
  const deactivateMutation = deactivateUser;
  const deleteMutation = deleteUser;

  // Extract user from response
  let user = null;
  if (userData) {
    if (userData.user) {
      user = userData.user;
    } else if (userData.data && userData.data.user) {
      user = userData.data.user;
    } else if (userData.id) {
      user = userData;
    } else if (userData.data && userData.data.id) {
      user = userData.data;
    }
  }

  const userRoles = user?.roles || [];
  const isSupplier = user?.role?.toUpperCase() === 'SUPPLIER' || userRoles.includes('SUPPLIER');
  const isHOD = user?.role?.toUpperCase() === 'HOD' || userRoles.includes('HOD');
  const isAdmin = userRoles.includes('ADMIN') || userRoles.includes('SUPER_ADMIN');

  const supplierId = supplierData?.data?.id  || null;

  const roleColor = getRoleColor(user?.role);
  const RoleIcon = roleColor.icon;

  const departments = useMemo(() => {
    if (!departmentsData) return [];
    return Array.isArray(departmentsData) ? departmentsData : departmentsData?.data || [];
  }, [departmentsData]);

  const department = user?.department || user?.effective_department || null;

  const hodDepartment = useMemo(() => {
    if (!isHOD || !departments.length || !user) return null;
    return departments.find((d: any) => d.hod_id === user.id);
  }, [isHOD, departments, user]);

  // Get all permissions from user's roles
  const allPermissions = useMemo(() => {
    const perms = new Set<string>();
    if (user?.permissions) {
      user.permissions.forEach((p: string) => perms.add(p));
    }
    if (user?.role_details) {
      user.role_details.forEach((role: any) => {
        if (role.permissions) {
          role.permissions.forEach((p: string) => perms.add(p));
        }
      });
    }
    return Array.from(perms);
  }, [user]);

  // Group permissions by module
  const groupedPermissions = useMemo(() => {
    const groups: Record<string, string[]> = {};
    allPermissions.forEach((permission: string) => {
      const parts = permission.split('.');
      const module = parts.length > 1 ? parts[0] : 'general';
      if (!groups[module]) {
        groups[module] = [];
      }
      groups[module].push(permission);
    });
    return groups;
  }, [allPermissions]);

  // Activity logs
  const activityLogs = useMemo(() => {
    const logs = [];

    if (user?.created_at) {
      logs.push({
        icon: UserPlus,
        title: 'Account Created',
        description: `User ${getFullName(user)} registered an account`,
        time: user.created_at,
        color: 'blue',
        details: `User ID: #${user.id}`
      });
    }

    if (user?.approved_at) {
      logs.push({
        icon: BadgeCheck,
        title: 'Account Approved',
        description: `User account was approved${user.approved_by ? ` by User #${user.approved_by}` : ''}`,
        time: user.approved_at,
        color: 'emerald',
        details: user.approved_by ? `Approved by: User #${user.approved_by}` : undefined
      });
    }

    if (user?.rejection_reason) {
      logs.push({
        icon: XCircle,
        title: 'Account Rejected',
        description: `User account was rejected: ${user.rejection_reason}`,
        time: user.updated_at,
        color: 'red',
        details: `Reason: ${user.rejection_reason}`
      });
    }

    if (user?.last_login_at) {
      logs.push({
        icon: Activity,
        title: 'Last Login',
        description: 'User last logged into the system',
        time: user.last_login_at,
        color: 'indigo',
        details: `IP: Unknown`
      });
    }

    if (user?.role_details) {
      user.role_details.forEach((role: any) => {
        logs.push({
          icon: Shield,
          title: `Role: ${role.label || role.name}`,
          description: `Assigned role with ${role.permission_count || role.permissions?.length || 0} permissions`,
          time: role.created_at || user.updated_at,
          color: 'purple',
          details: `Role ID: #${role.id}`
        });
      });
    }

    return logs.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  }, [user]);

  const isLoading = userLoading || supplierLoading;

  // Handlers
  const handleActivate = () => {
    if (!userId) return;
    activateMutation.mutate(userId);
  };

  const handleDeactivate = () => {
    if (!userId) return;
    deactivateMutation.mutate(userId);
  };

  const handleDelete = () => {
    if (!userId) return;
    deleteMutation.mutate(userId);
  };

  const handleRefresh = () => {
    refetchUser();
  };

  if (isLoading) {
    return (
      <PageTemplate
        title="User Profile"
        description="Loading user information..."
        icon={<User className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />}
        background="gradient"
        variant="default"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
          <Skeleton className="h-64 rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
        </div>
      </PageTemplate>
    );
  }

  if (!user) {
    return (
      <PageTemplate
        title="User Profile"
        description="User data could not be loaded"
        icon={<User className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />}
        background="gradient"
        variant="default"
      >
        <Card className="border-0 shadow-sm rounded-xl">
          <CardContent className="p-12 text-center">
            <div className="p-4 rounded-full bg-red-100 dark:bg-red-900/30 mx-auto w-16 h-16 flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">User Data Not Available</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              The user data could not be loaded. Please try again.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                onClick={handleRefresh}
                className="rounded-xl"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/admin/users')}
                className="rounded-xl"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Users
              </Button>
            </div>
          </CardContent>
        </Card>
      </PageTemplate>
    );
  }

  const isActive = user.is_active !== false;
  const isApproved = user.is_approved !== false;
  const statusInfo = getStatusBadge(isActive, isApproved);
  const StatusIcon = statusInfo.icon;

  return (
    <PageTemplate
      title="User Profile"
      description={`Viewing ${getFullName(user)}'s profile`}
      icon={<User className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />}
      background="gradient"
      variant="default"
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Users', href: '/admin/users' },
        { label: getFullName(user) },
      ]}
      actions={
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="gap-2 h-9 rounded-xl dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          {currentUser?.id !== user.id && !isAdmin && (
            <>
              {isActive ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeactivate}
                  className="gap-2 h-9 rounded-xl border-amber-200 text-amber-600 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-950/30"
                  disabled={deactivateMutation.isPending}
                >
                  {deactivateMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UserX className="h-4 w-4" />
                  )}
                  Deactivate
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleActivate}
                  className="gap-2 h-9 rounded-xl border-green-200 text-green-600 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-950/30"
                  disabled={activateMutation.isPending}
                >
                  {activateMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UserCheck className="h-4 w-4" />
                  )}
                  Activate
                </Button>
              )}
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                className="gap-2 h-9 rounded-xl"
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Delete
              </Button>
            </>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {/* Profile Header */}
        <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30 rounded-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-200/20 to-indigo-200/20 dark:from-blue-400/10 dark:to-indigo-400/10 rounded-full blur-3xl -mr-32 -mt-32" />
          <CardContent className="p-6 relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="h-24 w-24 border-4 border-white dark:border-gray-800 shadow-lg flex-shrink-0">
                <AvatarImage src={user.avatar || user.avatar_url || user.profile_photo || undefined} />
                <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                  {getInitials(getFullName(user))}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold dark:text-gray-100">{getFullName(user)}</h1>
                  <BadgeComponent className={cn("text-sm rounded-full", roleColor.bg, roleColor.text, roleColor.border)}>
                    <RoleIcon className="h-3.5 w-3.5 mr-1.5" />
                    {user.role_label || getRoleLabel(user.role)}
                  </BadgeComponent>
                  <BadgeComponent className={cn("text-sm rounded-full", statusInfo.color)}>
                    <StatusIcon className="h-3.5 w-3.5 mr-1.5" />
                    {statusInfo.label}
                  </BadgeComponent>
                  {isSupplier && (
                    <BadgeComponent className="text-sm rounded-full bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800">
                      <Store className="h-3.5 w-3.5 mr-1.5" />
                      Supplier
                    </BadgeComponent>
                  )}
                  {isHOD && hodDepartment && (
                    <BadgeComponent className="text-sm rounded-full bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800">
                      <Crown className="h-3.5 w-3.5 mr-1.5" />
                      HOD: {hodDepartment.name}
                    </BadgeComponent>
                  )}
                </div>

                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {user.email}
                  </span>
                  {user.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {user.phone}
                    </span>
                  )}
                  {department && (
                    <span className="flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      {department.name} ({department.code})
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Joined {formatDate(user.created_at)}
                  </span>
                </div>

                {user.id_number && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Hash className="h-4 w-4" />
                      ID: {user.id_number}
                    </span>
                  </div>
                )}

                {/* Supplier Link */}
                {isSupplier && supplierId && (
                  <div className="mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/admin/suppliers/${supplierId}`)}
                      className="gap-2 rounded-xl border-orange-200 text-orange-600 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-400 dark:hover:bg-orange-950/30"
                    >
                      <Store className="h-4 w-4" />
                      View Supplier Profile
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            icon={User}
            label="User ID"
            value={`#${user.id}`}
            subtitle="Unique identifier"
            color="blue"
          />
          <StatCard
            icon={Users}
            label="Roles"
            value={user.role_details?.length || 0}
            subtitle={`${userRoles.length} total roles`}
            color="purple"
          />
          <StatCard
            icon={Shield}
            label="Permissions"
            value={allPermissions.length}
            subtitle="Across all roles"
            color="indigo"
          />
          <StatCard
            icon={Clock}
            label="Last Login"
            value={formatTimeAgo(user.last_login_at)}
            subtitle={user.last_login_at ? formatDateTime(user.last_login_at) : 'Never'}
            color="amber"
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Personal Information */}
          <div className="space-y-4">
            <Card className="border-0 shadow-sm rounded-xl">
              <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-t-xl">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Basic user information and account details
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <InfoCard icon={User} label="Full Name" value={getFullName(user)} />
                <InfoCard icon={Mail} label="Email" value={user.email} />
                <InfoCard icon={Phone} label="Phone" value={user.phone || 'N/A'} />
                <InfoCard icon={Shield} label="Primary Role" value={user.role_label || getRoleLabel(user.role)} />
                <InfoCard icon={Building2} label="Department" value={department?.name || (isHOD && hodDepartment ? `${hodDepartment.name} (HOD)` : 'N/A')} />
                {user.id_number && <InfoCard icon={Hash} label="ID Number" value={user.id_number} />}
                {user.date_of_birth && <InfoCard icon={Calendar} label="Date of Birth" value={formatDate(user.date_of_birth)} />}
                {user.timezone && <InfoCard icon={Globe} label="Timezone" value={user.timezone} />}
              </CardContent>
            </Card>

            {/* Profile Details */}
            {user.profile && (
              <Card className="border-0 shadow-sm rounded-xl">
                <CardHeader className="pb-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-t-xl">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5 text-purple-600" />
                    Profile Details
                  </CardTitle>
                  <CardDescription>
                    Additional profile information
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  {user.profile.gender && <InfoCard icon={User} label="Gender" value={user.profile.gender} />}
                  {user.profile.bio && <InfoCard icon={MessageSquare} label="Bio" value={user.profile.bio} />}
                  {user.profile.address && <InfoCard icon={MapPin} label="Address" value={user.profile.address} />}
                  {user.profile.city && <InfoCard icon={Building} label="City" value={user.profile.city} />}
                  {user.profile.state && <InfoCard icon={Globe} label="State/Province" value={user.profile.state} />}
                  {user.profile.country && <InfoCard icon={Globe2} label="Country" value={user.profile.country} />}
                  {user.profile.postal_code && <InfoCard icon={Hash} label="Postal Code" value={user.profile.postal_code} />}
                  {user.profile.social_links && (
                    <div className="mt-2 space-y-2">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Social Links</p>
                      <div className="flex flex-wrap gap-2">
                        {user.profile.social_links.github && (
                          <a href={user.profile.social_links.github} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                            <Github className="h-3.5 w-3.5" /> GitHub
                          </a>
                        )}
                        {user.profile.social_links.twitter && (
                          <a href={user.profile.social_links.twitter} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                            <Twitter className="h-3.5 w-3.5" /> Twitter
                          </a>
                        )}
                        {user.profile.social_links.linkedin && (
                          <a href={user.profile.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                            <Linkedin className="h-3.5 w-3.5" /> LinkedIn
                          </a>
                        )}
                        {user.profile.social_links.website && (
                          <a href={user.profile.social_links.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                            <Globe className="h-3.5 w-3.5" /> Website
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Roles, Permissions */}
          <div className="space-y-4">
            {/* Roles Card */}
            <Card className="border-0 shadow-sm rounded-xl">
              <CardHeader className="pb-3 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 rounded-t-xl">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-amber-600" />
                  Roles & Permissions
                  <BadgeComponent className="ml-2 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800">
                    {user.role_details?.length || 0}
                  </BadgeComponent>
                </CardTitle>
                <CardDescription>
                  Roles assigned and their permissions
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                {!user.role_details || user.role_details.length === 0 ? (
                  <div className="text-center py-6">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No roles assigned</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {user.role_details.map((role: any) => {
                      const roleColor = getRoleColor(role.name);
                      const RoleIcon = roleColor.icon;
                      return (
                        <div
                          key={role.id}
                          className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-l-4 border-l-amber-500 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <BadgeComponent className={cn("font-medium border rounded-full", roleColor.bg, roleColor.text, roleColor.border)}>
                                <RoleIcon className="h-3 w-3 mr-1" />
                                {role.label || getRoleDisplayName(role.name)}
                              </BadgeComponent>
                              {role.description && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <Info className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600" />
                                    </TooltipTrigger>
                                    <TooltipContent className="rounded-xl max-w-xs">
                                      <p>{role.description}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {role.permission_count || role.permissions?.length || 0} permissions
                            </span>
                          </div>
                          {role.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{role.description}</p>
                          )}
                          <div className="flex flex-wrap gap-1">
                            {(role.permissions || []).slice(0, 8).map((permission: string) => (
                              <PermissionBadge key={permission} permission={permission} />
                            ))}
                            {(role.permissions?.length || 0) > 8 && (
                              <BadgeComponent variant="outline" className="text-[10px] px-1.5 py-0 rounded-full">
                                +{(role.permissions?.length || 0) - 8} more
                              </BadgeComponent>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* All Permissions Card */}
            <Card className="border-0 shadow-sm rounded-xl">
              <CardHeader className="pb-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-t-xl">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5 text-emerald-600" />
                  All Permissions
                  <BadgeComponent className="ml-2 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                    {allPermissions.length}
                  </BadgeComponent>
                </CardTitle>
                <CardDescription>
                  All permissions across all roles
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                {allPermissions.length === 0 ? (
                  <div className="text-center py-6">
                    <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No permissions assigned</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(groupedPermissions).map(([module, permissions]) => (
                      <div key={module} className="space-y-2">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 capitalize flex items-center gap-2">
                          <BadgeComponent variant="outline" className="text-xs rounded-full">
                            {module}
                          </BadgeComponent>
                          <span className="text-xs text-muted-foreground">
                            ({permissions.length} permissions)
                          </span>
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {permissions.map((permission: string) => (
                            <PermissionBadge key={permission} permission={permission} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Signature Section - Full Width */}
        <Card className="border-0 shadow-sm rounded-xl">
          <CardHeader className="pb-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 rounded-t-xl">
            <CardTitle className="text-lg flex items-center gap-2">
              <Signature className="h-5 w-5 text-indigo-600" />
              Signature & QR Code
            </CardTitle>
            <CardDescription>
              Digital signature specimen and QR verification code
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <SignatureSection userId={userId} />
          </CardContent>
        </Card>

        {/* Activity Logs Section - Full Width */}
        <Card className="border-0 shadow-sm rounded-xl">
          <CardHeader className="pb-3 bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/20 rounded-t-xl">
            <CardTitle className="text-lg flex items-center gap-2">
              <ScrollText className="h-5 w-5 text-rose-600" />
              Activity Logs
              <BadgeComponent className="ml-2 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800">
                {activityLogs.length}
              </BadgeComponent>
            </CardTitle>
            <CardDescription>
              Complete activity history and events for this user
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {activityLogs.length === 0 ? (
              <div className="text-center py-8">
                <ScrollText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No activity recorded</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activityLogs.map((log, index) => {
                  const ItemIcon = log.icon;
                  const colorMap = {
                    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
                    emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
                    amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
                    red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
                    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
                    indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
                    pink: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400',
                  };
                  const colorClass = colorMap[log.color as keyof typeof colorMap] || colorMap.blue;

                  return (
                    <div key={index} className="flex items-start gap-4 p-3 bg-gray-50 dark:bg-gray-800/30 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors border border-gray-200/50 dark:border-gray-700/50">
                      <div className={cn("p-2 rounded-lg flex-shrink-0", colorClass)}>
                        <ItemIcon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{log.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{log.description}</p>
                        {log.details && (
                          <p className="text-[10px] text-gray-400 mt-0.5">{log.details}</p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400">{formatTimeAgo(log.time)}</p>
                        <p className="text-[10px] text-gray-400">{formatDateTime(log.time)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Details - Full Width */}
        <Card className="border-0 shadow-sm rounded-xl bg-gray-50/50 dark:bg-gray-800/30">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span>Created: <span className="font-medium text-gray-700 dark:text-gray-300">{formatDateTime(user.created_at)}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                <span>Updated: <span className="font-medium text-gray-700 dark:text-gray-300">{formatDateTime(user.updated_at)}</span></span>
              </div>
              {user.approved_at && (
                <div className="flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4 text-emerald-500" />
                  <span>Approved: <span className="font-medium text-gray-700 dark:text-gray-300">{formatDateTime(user.approved_at)}</span></span>
                </div>
              )}
              {user.rejection_reason && (
                <div className="flex items-center gap-2 text-red-600">
                  <XCircle className="h-4 w-4" />
                  <span>Rejected: <span className="font-medium">{user.rejection_reason}</span></span>
                </div>
              )}
              {user.approved_by && (
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-indigo-500" />
                  <span>Approved By: <span className="font-medium text-gray-700 dark:text-gray-300">User #{user.approved_by}</span></span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-purple-500" />
                <span>User ID: <span className="font-medium text-gray-700 dark:text-gray-300">#{user.id}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-cyan-500" />
                <span>Department: <span className="font-medium text-gray-700 dark:text-gray-300">{department?.name || 'Not assigned'}</span></span>
              </div>
              {user.timezone && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-teal-500" />
                  <span>Timezone: <span className="font-medium text-gray-700 dark:text-gray-300">{user.timezone}</span></span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ============================================
          MODALS
          ============================================ */}

      {/* Delete Confirmation */}
      <Dialog open={deleteMutation.isPending} onOpenChange={() => { }}>
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
          <DialogFooter>
            <Button variant="outline" onClick={() => deleteMutation.reset()} className="rounded-xl">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} className="gap-2 rounded-xl">
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTemplate>
  );
}
