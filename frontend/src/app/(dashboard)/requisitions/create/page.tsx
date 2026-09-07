// frontend/src/app/(dashboard)/requisitions/create/page.tsx

'use client';

import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  FileText,
  Hash,
  Briefcase,
  CheckCircle,
  AlertCircle,
  Loader2,
  Shield,
  Save,
  X,
  Plus,
  Trash2,
  CalendarIcon,
  ArrowLeft,
  Package,
  DollarSign,
  Tag,
  Box,
  Info,
  List,
  User,
  Mail,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Layers,
  Clock,
  Lightbulb,
  FileCheck,
  Wrench,
  Truck,
  MapPin,
  Calendar,
  UserCog,
  CreditCard,
  Construction,
  Laptop,
  Flame,
  Target as TargetIcon,
  ChevronRight,
  InfoIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format, differenceInDays } from 'date-fns';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Hooks & Services
import { useAuthContext } from '@/contexts/AuthContext';
import { useCreateRequisition } from '@/hooks/useRequisitionMutations';
import { useDepartments } from '@/hooks/useDepartments';
import { useSuppliers } from '@/hooks/useSuppliers';
import { PageTemplate } from '@/components/dashboard/PageTemplate';

// Types
import type { Department } from '@/types/common.types';
import type { CreateRequisitionData, RequisitionTypeEnum, ServiceCategory } from '@/types/requisition.types';

// UI Components
import { WrappedCornerTag } from '@/components/ui/wrapped-corner-tag';

// ============================================
// CONSTANTS
// ============================================

const STORAGE_KEY = 'requisition_draft_data';
const STORAGE_TIMESTAMP_KEY = 'requisition_draft_timestamp';
const DEBOUNCE_DELAY = 500;

// HOD role identifiers
const HOD_ROLES = ['hod', 'head_of_department'];
const STAFF_ROLES = ['staff'];

// Requisition Type Options
const REQUISITION_TYPE_OPTIONS = [
  {
    value: 'goods' as const,
    label: 'Goods Requisition',
    description: 'For physical items, materials, equipment, or supplies you need to purchase',
    badge: 'LPO',
    color: 'blue',
  },
  {
    value: 'services' as const,
    label: 'Service Requisition',
    description: 'For professional services, contracts, installations, or maintenance work',
    badge: 'LSO',
    color: 'purple',
  },
];

// Service Categories - SIMPLE
const SERVICE_CATEGORIES: ServiceCategory[] = [
  'consultancy',
  'maintenance',
  'training',
  'installation',
  'cleaning',
  'security',
  'transport',
  'construction',
  'professional_services',
  'it_services',
  'other',
];

const SERVICE_CATEGORY_LABELS: Record<ServiceCategory, string> = {
  consultancy: 'Consultancy',
  maintenance: 'Maintenance',
  training: 'Training',
  installation: 'Installation',
  cleaning: 'Cleaning',
  security: 'Security',
  transport: 'Transport',
  construction: 'Construction',
  professional_services: 'Professional Services',
  it_services: 'IT Services',
  other: 'Other',
};

// Goods Categories - SIMPLE
const GOODS_CATEGORIES = [
  'office_supplies',
  'equipment',
  'furniture',
  'it_hardware',
  'vehicles',
  'consumables',
  'raw_materials',
  'other',
];

const GOODS_CATEGORY_LABELS: Record<string, string> = {
  office_supplies: 'Office Supplies',
  equipment: 'Equipment',
  furniture: 'Furniture',
  it_hardware: 'IT Hardware',
  vehicles: 'Vehicles',
  consumables: 'Consumables',
  raw_materials: 'Raw Materials',
  other: 'Other',
};

// Priority options
const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low - Routine request, can wait' },
  { value: 'medium', label: 'Medium - Important, process in time' },
  { value: 'high', label: 'High - Urgent, needs prompt attention' },
  { value: 'emergency', label: 'Emergency - Immediate action required' },
];

const TYPE_OPTIONS = [
  { value: 'normal', label: 'Normal - Standard requisition' },
  { value: 'emergency', label: 'Emergency - Needs accelerated processing' },
];

const URGENCY_OPTIONS = [
  { value: 'routine', label: 'Routine - Regular processing' },
  { value: 'urgent', label: 'Urgent - Faster than routine' },
  { value: 'critical', label: 'Critical - Immediate attention' },
];

// ============================================
// HELPERS
// ============================================

const generateRequisitionNumber = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  return `REQ-${year}${month}${day}-${random}`;
};

const saveToLocalStorage = (data: any) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      localStorage.setItem(STORAGE_TIMESTAMP_KEY, new Date().toISOString());
    }
  } catch (error) {
    // Silent fail
  }
};

const loadFromLocalStorage = () => {
  try {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    }
    return null;
  } catch {
    return null;
  }
};

const clearLocalStorage = () => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_TIMESTAMP_KEY);
    }
  } catch {
    // Silent fail
  }
};

const getDraftTimestamp = (): string | null => {
  try {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_TIMESTAMP_KEY);
    }
    return null;
  } catch {
    return null;
  }
};

const isUserHOD = (user: any): boolean => {
  if (!user) return false;
  if (user.roles && Array.isArray(user.roles)) {
    return user.roles.some((r: any) =>
      HOD_ROLES.includes(r?.toLowerCase?.() || r?.name?.toLowerCase?.() || '')
    );
  }
  if (user.role) {
    return HOD_ROLES.includes(user.role.toLowerCase());
  }
  return false;
};

const isUserStaff = (user: any): boolean => {
  if (!user) return false;
  if (user.roles && Array.isArray(user.roles)) {
    return user.roles.some((r: any) =>
      STAFF_ROLES.includes(r?.toLowerCase?.() || r?.name?.toLowerCase?.() || '')
    );
  }
  if (user.role) {
    return STAFF_ROLES.includes(user.role.toLowerCase());
  }
  return false;
};

const findUserHODDepartment = (user: any, departments: Department[]): Department | null => {
  if (!user || !departments || departments.length === 0) return null;
  const hodDepartment = departments.find(dept => dept.hod_id === user.id);
  if (hodDepartment) {
    return hodDepartment;
  }
  if (user.department_id) {
    const dept = departments.find(d => d.id === user.department_id);
    if (dept) return dept;
  }
  return null;
};

// ============================================
// TOOLTIP WRAPPER
// ============================================

const FieldTooltip = ({ children, content }: { children?: React.ReactNode; content: string }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center gap-1 cursor-help">
          {children}
          <InfoIcon className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground transition-colors" />
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs rounded-xl p-3 bg-gray-900 text-white dark:bg-gray-800">
        <p className="text-xs leading-relaxed">{content}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

// ============================================
// REQUISITION TYPE SELECTOR
// ============================================

const RequisitionTypeSelector = memo(({
  value,
  onChange,
  disabled,
}: {
  value: RequisitionTypeEnum;
  onChange: (value: RequisitionTypeEnum) => void;
  disabled?: boolean;
}) => {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {REQUISITION_TYPE_OPTIONS.map((option) => {
          const isSelected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => !disabled && onChange(option.value)}
              disabled={disabled}
              className={cn(
                "relative flex items-start gap-3 p-4 rounded-xl border-2 transition-all text-left",
                isSelected
                  ? `border-${option.color}-500 bg-${option.color}-50/50 dark:bg-${option.color}-900/20 shadow-lg shadow-${option.color}-500/10`
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-900",
                disabled && "opacity-60 cursor-not-allowed"
              )}
            >
              <div className={cn(
                "p-2 rounded-lg shrink-0",
                isSelected
                  ? `bg-${option.color}-100 dark:bg-${option.color}-900/30 text-${option.color}-600 dark:text-${option.color}-400`
                  : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500"
              )}>
                {option.value === 'goods' ? (
                  <Package className="h-5 w-5" />
                ) : (
                  <Briefcase className="h-5 w-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "font-semibold text-sm",
                    isSelected ? `text-${option.color}-700 dark:text-${option.color}-300` : "text-gray-700 dark:text-gray-300"
                  )}>
                    {option.label}
                  </span>
                  <Badge className={cn(
                    "text-[10px] rounded-full px-2 py-0",
                    isSelected
                      ? `bg-${option.color}-100 text-${option.color}-700 dark:bg-${option.color}-900/30 dark:text-${option.color}-400`
                      : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                  )}>
                    {option.badge}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{option.description}</p>
              </div>
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <CheckCircle className={cn("h-5 w-5", `text-${option.color}-500`)} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
});

RequisitionTypeSelector.displayName = 'RequisitionTypeSelector';

// ============================================
// STEP INDICATOR
// ============================================

const StepIndicator = memo(({ currentStep, totalSteps, labels }: {
  currentStep: number;
  totalSteps: number;
  labels: string[];
}) => {
  return (
    <div className="flex items-center gap-2 mb-6">
      {Array.from({ length: totalSteps }).map((_, index) => {
        const step = index + 1;
        const isActive = step === currentStep;
        const isCompleted = step < currentStep;
        const isUpcoming = step > currentStep;

        return (
          <div key={index} className="flex items-center gap-2">
            <div className={cn(
              "flex items-center gap-2",
              isActive && "text-blue-600 dark:text-blue-400",
              isCompleted && "text-emerald-600 dark:text-emerald-400",
              isUpcoming && "text-gray-400 dark:text-gray-600"
            )}>
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                isActive && "bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500",
                isCompleted && "bg-emerald-100 dark:bg-emerald-900/30 border-2 border-emerald-500",
                isUpcoming && "bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600"
              )}>
                {isCompleted ? <CheckCircle className="h-4 w-4" /> : step}
              </div>
              <span className={cn(
                "text-xs font-medium hidden sm:inline",
                isActive && "text-blue-600 dark:text-blue-400",
                isCompleted && "text-emerald-600 dark:text-emerald-400",
                isUpcoming && "text-gray-400 dark:text-gray-500"
              )}>
                {labels[index]}
              </span>
            </div>
            {index < totalSteps - 1 && (
              <div className={cn(
                "w-8 h-0.5",
                step <= currentStep ? "bg-blue-400 dark:bg-blue-500" : "bg-gray-300 dark:bg-gray-600"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
});

StepIndicator.displayName = 'StepIndicator';

// ============================================
// STEP 1: BASIC INFORMATION (Includes Type Selection)
// ============================================

const BasicInfoStep = memo(({
  formData,
  handleChange,
  departments,
  isHOD,
  isStaff,
  userDepartmentName,
  userDepartmentId,
  disabled,
  errors,
}: {
  formData: any;
  handleChange: (field: string, value: any) => void;
  departments: Department[];
  isHOD: boolean;
  isStaff: boolean;
  userDepartmentName: string;
  userDepartmentId: string;
  disabled: boolean;
  errors: Record<string, string>;
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Step 1: Basic Information</h3>
        <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-[10px] ml-2">
          Required
        </Badge>
      </div>

      {/* Requisition Type Selection */}
      <div className="p-4 bg-gradient-to-br from-gray-50/80 to-white dark:from-gray-900/50 dark:to-gray-950/50 rounded-xl border-2 border-dashed border-blue-200/50 dark:border-blue-800/30">
        <div className="flex items-center gap-2 mb-3">
          <FileCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Requisition Type <span className="text-red-500">*</span>
          </Label>
          <FieldTooltip content="Choose 'Goods' if you need physical items (LPO). Choose 'Services' if you need work done (LSO)." />
        </div>

        <RequisitionTypeSelector
          value={formData.requisition_type}
          onChange={(value) => {
            handleChange('requisition_type', value);
            // Reset type-specific fields when switching
            if (value === 'services') {
              handleChange('goods_category', '');
              handleChange('goods_warehouse_location', '');
              handleChange('goods_storage_requirements', '');
              handleChange('goods_expected_delivery_date', '');
            } else {
              handleChange('service_category', '');
              handleChange('service_scope_of_work', '');
              handleChange('service_deliverables_expected', '');
              handleChange('service_expected_start_date', '');
              handleChange('service_expected_end_date', '');
              handleChange('service_estimated_duration_days', '');
              handleChange('service_requires_onsite_visit', false);
              handleChange('service_special_requirements', '');
              handleChange('service_qualifications_required', '');
            }
          }}
          disabled={disabled}
        />
        {errors.requisition_type && <p className="text-sm text-red-500 mt-1">{errors.requisition_type}</p>}

        <div className="mt-3 p-2.5 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-200/50 dark:border-blue-800/30">
          <div className="flex items-start gap-2">
            <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700 dark:text-blue-300">
              <strong>Tip:</strong> Choose <strong>Goods</strong> for physical items like stationery, equipment, or supplies.
              Choose <strong>Services</strong> for work like installation, maintenance, consultancy, or training.
            </p>
          </div>
        </div>
      </div>

      <Separator className="dark:border-gray-700/50" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Title */}
        <div className="md:col-span-2 space-y-1.5">
          <Label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
            Requisition Title <span className="text-red-500">*</span>
            <FieldTooltip content="Give your requisition a clear, descriptive title that summarizes what you need." />
          </Label>
          <Input
            id="title"
            placeholder="e.g., Supply of Office Stationery, CCTV Installation, IT Equipment"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            disabled={disabled}
            className={cn(
              "h-11 text-base rounded-xl dark:bg-gray-900 dark:border-gray-700",
              errors.title && "border-red-500"
            )}
          />
          <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <Lightbulb className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
            <span>Tip: Be specific. Instead of "Stationery", use "Office Stationery for Admin Department".</span>
          </div>
          {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
        </div>

        {/* Department */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            Department <span className="text-red-500">*</span>
            <FieldTooltip content="Select the department that will be responsible for this requisition." />
          </Label>
          <Select
            value={formData.department_id || undefined}
            onValueChange={(value) => {
              if (isHOD || isStaff) return;
              handleChange('department_id', value);
            }}
            disabled={isHOD || isStaff || disabled}
          >
            <SelectTrigger className={cn(
              "h-11 text-sm rounded-xl dark:bg-gray-900 dark:border-gray-700",
              (isHOD || isStaff) && "bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed opacity-80",
              errors.department_id && "border-red-500"
            )}>
              <SelectValue placeholder={isHOD ? `${userDepartmentName} (HOD)` : isStaff ? `${userDepartmentName} (Staff)` : "Select department"} />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
              {(isHOD || isStaff) && userDepartmentId && departments.find(d => d.id.toString() === userDepartmentId) && (
                <SelectItem value={userDepartmentId}>
                  {departments.find(d => d.id.toString() === userDepartmentId)?.name}
                  <Badge className="ml-2 text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                    {isHOD ? 'HOD' : 'Staff'}
                  </Badge>
                </SelectItem>
              )}
              {!isHOD && !isStaff && departments.length > 0 && departments.map((dept: Department) => (
                <SelectItem key={dept.id} value={dept.id.toString()}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(isHOD || isStaff) && (
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
              <Shield className="h-3 w-3 text-blue-500" />
              As {isHOD ? 'HOD' : 'Staff'}, you can only create requisitions for <strong className="text-gray-700 dark:text-gray-300">{userDepartmentName}</strong>
            </p>
          )}
          {errors.department_id && <p className="text-sm text-red-500 mt-1">{errors.department_id}</p>}
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
            <InfoIcon className="h-4 w-4 text-muted-foreground" />
            Description
            <FieldTooltip content="Provide a detailed description of what you need. This helps approvers understand the requisition." />
          </Label>
          <Textarea
            id="description"
            placeholder="Describe what you need and why..."
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            disabled={disabled}
            className="min-h-[80px] resize-none text-sm rounded-xl dark:bg-gray-900 dark:border-gray-700"
            rows={2}
          />
        </div>

        {/* Justification */}
        <div className="md:col-span-2 space-y-1.5">
          <Label htmlFor="justification" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
            <TargetIcon className="h-4 w-4 text-muted-foreground" />
            Justification
            <FieldTooltip content="Explain why this requisition is necessary. Strong justification helps with approval." />
          </Label>
          <Textarea
            id="justification"
            placeholder="Why do you need this? What problem does it solve?"
            value={formData.justification}
            onChange={(e) => handleChange('justification', e.target.value)}
            disabled={disabled}
            className="min-h-[60px] resize-none text-sm rounded-xl dark:bg-gray-900 dark:border-gray-700"
            rows={2}
          />
          <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <Lightbulb className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
            <span>Tip: Include benefits, urgency, and consequences if not approved.</span>
          </div>
        </div>

        {/* Priority, Type, Urgency */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
            Priority
            <FieldTooltip content="Set the priority level. Emergency requests will be fast-tracked." />
          </Label>
          <Select
            value={formData.priority}
            onValueChange={(value) => handleChange('priority', value)}
            disabled={disabled}
          >
            <SelectTrigger className="h-11 text-sm rounded-xl dark:bg-gray-900 dark:border-gray-700">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
              {PRIORITY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
            <Tag className="h-4 w-4 text-muted-foreground" />
            Type
            <FieldTooltip content="Choose 'Normal' for standard requisitions or 'Emergency' for urgent needs." />
          </Label>
          <Select
            value={formData.type}
            onValueChange={(value) => handleChange('type', value)}
            disabled={disabled}
          >
            <SelectTrigger className="h-11 text-sm rounded-xl dark:bg-gray-900 dark:border-gray-700">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
              {TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-muted-foreground" />
            Urgency
            <FieldTooltip content="How urgent is this requisition? This affects processing speed." />
          </Label>
          <Select
            value={formData.urgency}
            onValueChange={(value) => handleChange('urgency', value)}
            disabled={disabled}
          >
            <SelectTrigger className="h-11 text-sm rounded-xl dark:bg-gray-900 dark:border-gray-700">
              <SelectValue placeholder="Select urgency" />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
              {URGENCY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Dates */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            Required By Date
            <FieldTooltip content="When do you need this requisition to be completed?" />
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-11 text-sm rounded-xl dark:bg-gray-900 dark:border-gray-700",
                  !formData.required_by_date && "text-muted-foreground"
                )}
                disabled={disabled}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.required_by_date ? format(new Date(formData.required_by_date), "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-xl">
              <CalendarComponent
                mode="single"
                selected={formData.required_by_date ? new Date(formData.required_by_date) : undefined}
                onSelect={(date) => handleChange('required_by_date', date ? format(date, 'yyyy-MM-dd') : '')}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            Required Delivery Date
            <FieldTooltip content="When do you need delivery? This helps suppliers plan." />
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-11 text-sm rounded-xl dark:bg-gray-900 dark:border-gray-700",
                  !formData.required_delivery_date && "text-muted-foreground"
                )}
                disabled={disabled}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.required_delivery_date ? format(new Date(formData.required_delivery_date), "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-xl">
              <CalendarComponent
                mode="single"
                selected={formData.required_delivery_date ? new Date(formData.required_delivery_date) : undefined}
                onSelect={(date) => handleChange('required_delivery_date', date ? format(date, 'yyyy-MM-dd') : '')}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
});

BasicInfoStep.displayName = 'BasicInfoStep';

// ============================================
// STEP 2: TYPE-SPECIFIC DETAILS
// ============================================

const TypeDetailsStep = memo(({
  formData,
  handleChange,
  disabled,
  isService,
  errors,
}: {
  formData: any;
  handleChange: (field: string, value: any) => void;
  disabled: boolean;
  isService: boolean;
  errors: Record<string, string>;
}) => {
  // Auto-calculate duration when dates change
  useEffect(() => {
    if (formData.service_expected_start_date && formData.service_expected_end_date) {
      const start = new Date(formData.service_expected_start_date);
      const end = new Date(formData.service_expected_end_date);
      const days = differenceInDays(end, start);
      if (days > 0) {
        handleChange('service_estimated_duration_days', days);
      }
    }
  }, [formData.service_expected_start_date, formData.service_expected_end_date]);

  if (isService) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Briefcase className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Step 2: Service Details</h3>
          <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded-full text-[10px] ml-2">
            LSO
          </Badge>
        </div>

        <Alert className="border-purple-200 dark:border-purple-800/50 bg-purple-50/50 dark:bg-purple-950/20 rounded-xl">
          <Lightbulb className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          <AlertDescription className="text-purple-700 dark:text-purple-300 text-sm">
            <strong>Don't worry about technical details!</strong> Just describe what you want done.
            Suppliers will provide the technical breakdown in their quotations.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Service Category */}
          <div className="md:col-span-2 space-y-1.5">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              Service Category <span className="text-red-500">*</span>
              <FieldTooltip content="Select the type of service you need." />
            </Label>
            <Select
              value={formData.service_category || ''}
              onValueChange={(value) => handleChange('service_category', value as ServiceCategory)}
              disabled={disabled}
            >
              <SelectTrigger className={cn(
                "h-11 text-sm rounded-xl dark:bg-gray-900 dark:border-gray-700",
                errors.service_category && "border-red-500"
              )}>
                <SelectValue placeholder="What type of service do you need?" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                {SERVICE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {SERVICE_CATEGORY_LABELS[cat]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.service_category && <p className="text-sm text-red-500 mt-1">{errors.service_category}</p>}
          </div>

          {/* Service Description */}
          <div className="md:col-span-2 space-y-1.5">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              Service Description <span className="text-red-500">*</span>
              <FieldTooltip content="Describe what you want the service provider to do. Include tasks, deliverables, and any special requirements." />
            </Label>
            <div className="relative">
              <Textarea
                placeholder="Describe the service you need. What work should be done? What are the deliverables? Any special requirements?"
                value={formData.service_scope_of_work || ''}
                onChange={(e) => handleChange('service_scope_of_work', e.target.value)}
                disabled={disabled}
                className="min-h-[120px] resize-none text-sm rounded-xl dark:bg-gray-900 dark:border-gray-700 pr-20"
                rows={4}
              />
              <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
                {(formData.service_scope_of_work || '').length} characters
              </div>
            </div>
            <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
              <Lightbulb className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
              <span>Tip: Include specific tasks, deliverables, quality standards, and any special requirements. The more detail, the better suppliers can quote.</span>
            </div>
            {errors.service_scope_of_work && <p className="text-sm text-red-500 mt-1">{errors.service_scope_of_work}</p>}
          </div>

          {/* Expected Deliverables */}
          <div className="md:col-span-2 space-y-1.5">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              Expected Deliverables
              <FieldTooltip content="What will the service provider deliver?" />
            </Label>
            <div className="relative">
              <Textarea
                placeholder="List what you expect to receive (e.g., reports, installations, training, etc.)"
                value={formData.service_deliverables_expected || ''}
                onChange={(e) => handleChange('service_deliverables_expected', e.target.value)}
                disabled={disabled}
                className="min-h-[80px] resize-none text-sm rounded-xl dark:bg-gray-900 dark:border-gray-700 pr-20"
                rows={2}
              />
              <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
                {(formData.service_deliverables_expected || '').length} characters
              </div>
            </div>
          </div>

          {/* Service Period */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Service Start Date
              <FieldTooltip content="When should work begin?" />
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-11 text-sm rounded-xl dark:bg-gray-900 dark:border-gray-700",
                    !formData.service_expected_start_date && "text-muted-foreground"
                  )}
                  disabled={disabled}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.service_expected_start_date ? format(new Date(formData.service_expected_start_date), "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-xl">
                <CalendarComponent
                  mode="single"
                  selected={formData.service_expected_start_date ? new Date(formData.service_expected_start_date) : undefined}
                  onSelect={(date) => handleChange('service_expected_start_date', date ? format(date, 'yyyy-MM-dd') : '')}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Service End Date
              <FieldTooltip content="When should work be completed?" />
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-11 text-sm rounded-xl dark:bg-gray-900 dark:border-gray-700",
                    !formData.service_expected_end_date && "text-muted-foreground"
                  )}
                  disabled={disabled}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.service_expected_end_date ? format(new Date(formData.service_expected_end_date), "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-xl">
                <CalendarComponent
                  mode="single"
                  selected={formData.service_expected_end_date ? new Date(formData.service_expected_end_date) : undefined}
                  onSelect={(date) => handleChange('service_expected_end_date', date ? format(date, 'yyyy-MM-dd') : '')}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Estimated Duration - Auto-calculated */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Estimated Duration (Days)
              <FieldTooltip content="Auto-calculated from start and end dates." />
            </Label>
            <div className="h-11 px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {formData.service_estimated_duration_days || '—'} days
              </span>
              {formData.service_estimated_duration_days && (
                <span className="text-xs text-muted-foreground ml-2">
                  (auto-calculated)
                </span>
              )}
            </div>
          </div>

          {/* Requires Onsite Visit */}
          <div className="space-y-1.5 flex items-end">
            <div className="flex items-center gap-2 p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
              <input
                type="checkbox"
                id="onsite_visit"
                checked={formData.service_requires_onsite_visit || false}
                onChange={(e) => handleChange('service_requires_onsite_visit', e.target.checked)}
                disabled={disabled}
                className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <Label htmlFor="onsite_visit" className="text-sm font-medium cursor-pointer text-gray-700 dark:text-gray-300">
                Requires Onsite Visit
              </Label>
              <FieldTooltip content="Check this if the service provider needs to visit your location." />
            </div>
          </div>

          {/* Special Requirements */}
          <div className="md:col-span-2 space-y-1.5">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              Special Requirements
              <FieldTooltip content="Any special requirements the service provider must meet." />
            </Label>
            <div className="relative">
              <Textarea
                placeholder="Special requirements (e.g., security clearances, certifications, specific equipment, etc.)"
                value={formData.service_special_requirements || ''}
                onChange={(e) => handleChange('service_special_requirements', e.target.value)}
                disabled={disabled}
                className="min-h-[60px] resize-none text-sm rounded-xl dark:bg-gray-900 dark:border-gray-700 pr-20"
                rows={2}
              />
              <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
                {(formData.service_special_requirements || '').length} characters
              </div>
            </div>
          </div>

          {/* Qualifications Required */}
          <div className="md:col-span-2 space-y-1.5">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <UserCog className="h-4 w-4 text-muted-foreground" />
              Qualifications Required
              <FieldTooltip content="What qualifications, certifications, or experience should the service provider have?" />
            </Label>
            <Input
              placeholder="e.g., ISO Certified, Licensed, 5+ years experience"
              value={formData.service_qualifications_required || ''}
              onChange={(e) => handleChange('service_qualifications_required', e.target.value)}
              disabled={disabled}
              className="h-11 text-sm rounded-xl dark:bg-gray-900 dark:border-gray-700"
            />
          </div>
        </div>
      </div>
    );
  }

  // Goods details
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Step 2: Goods Details</h3>
        <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-[10px] ml-2">
          LPO
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Goods Category */}
        <div className="md:col-span-2 space-y-1.5">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
            Goods Category <span className="text-red-500">*</span>
            <FieldTooltip content="Select the category that best describes the goods you need." />
          </Label>
          <Select
            value={formData.goods_category || ''}
            onValueChange={(value) => handleChange('goods_category', value)}
            disabled={disabled}
          >
            <SelectTrigger className={cn(
              "h-11 text-sm rounded-xl dark:bg-gray-900 dark:border-gray-700",
              errors.goods_category && "border-red-500"
            )}>
              <SelectValue placeholder="What type of goods do you need?" />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
              {GOODS_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {GOODS_CATEGORY_LABELS[cat]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.goods_category && <p className="text-sm text-red-500 mt-1">{errors.goods_category}</p>}
        </div>

        {/* Warehouse Location */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            Warehouse Location
            <FieldTooltip content="Where should the goods be delivered or stored?" />
          </Label>
          <Input
            placeholder="e.g., Main Store, Room 101, Warehouse A"
            value={formData.goods_warehouse_location || ''}
            onChange={(e) => handleChange('goods_warehouse_location', e.target.value)}
            disabled={disabled}
            className="h-11 text-sm rounded-xl dark:bg-gray-900 dark:border-gray-700"
          />
        </div>

        {/* Storage Requirements */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
            <Box className="h-4 w-4 text-muted-foreground" />
            Storage Requirements
            <FieldTooltip content="Special storage conditions required." />
          </Label>
          <Input
            placeholder="e.g., Temperature controlled, Dry storage"
            value={formData.goods_storage_requirements || ''}
            onChange={(e) => handleChange('goods_storage_requirements', e.target.value)}
            disabled={disabled}
            className="h-11 text-sm rounded-xl dark:bg-gray-900 dark:border-gray-700"
          />
          <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <Lightbulb className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
            <span>Tip: Specify storage conditions to ensure goods arrive in good condition.</span>
          </div>
        </div>

        {/* Expected Delivery Date */}
        <div className="md:col-span-2 space-y-1.5">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            Expected Delivery Date
            <FieldTooltip content="When do you expect the goods to be delivered?" />
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-11 text-sm rounded-xl dark:bg-gray-900 dark:border-gray-700",
                  !formData.goods_expected_delivery_date && "text-muted-foreground"
                )}
                disabled={disabled}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.goods_expected_delivery_date ? format(new Date(formData.goods_expected_delivery_date), "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-xl">
              <CalendarComponent
                mode="single"
                selected={formData.goods_expected_delivery_date ? new Date(formData.goods_expected_delivery_date) : undefined}
                onSelect={(date) => handleChange('goods_expected_delivery_date', date ? format(date, 'yyyy-MM-dd') : '')}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <Alert className="border-blue-200 dark:border-blue-800/50 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl">
        <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertDescription className="text-blue-700 dark:text-blue-300 text-sm">
          <strong>Don't know exact specifications?</strong> Just provide what you know.
          Procurement will work with suppliers to get the right items.
        </AlertDescription>
      </Alert>
    </div>
  );
});

TypeDetailsStep.displayName = 'TypeDetailsStep';

// ============================================
// STEP 3: ITEMS / SERVICE COMPONENTS
// ============================================

const ItemsStep = memo(({
  formData,
  items,
  handleItemChange,
  addItem,
  removeItem,
  totalAmount,
  isService,
  disabled,
}: {
  formData: any;
  items: any[];
  handleItemChange: (index: number, field: string, value: any) => void;
  addItem: () => void;
  removeItem: (index: number) => void;
  totalAmount: number;
  isService: boolean;
  disabled: boolean;
}) => {
  // For services, show the auto-generated info instead of items table
  if (isService) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Briefcase className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Step 3: Service Components
          </h3>
          <Badge variant="secondary" className="ml-1 rounded-full px-3 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
            Auto-generated
          </Badge>
        </div>

        <Alert className="border-purple-200 dark:border-purple-800/50 bg-purple-50/50 dark:bg-purple-950/20 rounded-xl">
          <Lightbulb className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          <AlertDescription className="text-purple-700 dark:text-purple-300 text-sm">
            <strong>Service components will be auto-created when you submit this requisition.</strong>
            <br />
            <br />
            You don't need to specify any items or components. The supplier will provide
            the detailed breakdown of what's needed in their quotation.
            <br />
            <br />
            <span className="text-xs">
              The system will automatically create a service item:
              <br />
              • <strong>Item:</strong> Service: {formData.title || 'Service Requisition'}
              <br />
              • <strong>Quantity:</strong> 1 Lot
              <br />
              • <strong>Unit Cost:</strong> 0.00 (supplier will quote)
            </span>
          </AlertDescription>
        </Alert>

        <div className="p-6 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="p-4 rounded-full bg-purple-100 dark:bg-purple-900/20">
              <Briefcase className="h-10 w-10 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Service Item (Auto-created)
              </p>
              <p className="text-sm text-muted-foreground">
                Service: {formData.title || 'Service Requisition'}
              </p>
              <div className="flex items-center justify-center gap-4 mt-2 text-sm">
                <span className="text-muted-foreground">Quantity: <strong className="text-gray-700 dark:text-gray-300">1 Lot</strong></span>
                <span className="text-muted-foreground">|</span>
                <span className="text-muted-foreground">Unit Cost: <strong className="text-gray-700 dark:text-gray-300">To be quoted by supplier</strong></span>
              </div>
            </div>
            <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded-full">
              No user input required
            </Badge>
          </div>
        </div>
      </div>
    );
  }

  // Goods: Show items table
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Package className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Step 3: Items
        </h3>
        <Badge variant="secondary" className="ml-1 rounded-full px-3 py-0.5">
          {items.filter(i => i.item_name.trim()).length}
        </Badge>
      </div>

      <Alert className="border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl">
        <Lightbulb className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        <AlertDescription className="text-emerald-700 dark:text-emerald-300 text-sm">
          <strong>Don't know exact prices?</strong> Leave as 0 or provide estimates.
          Suppliers will provide accurate pricing in their quotations.
        </AlertDescription>
      </Alert>

      {/* Items Table Header */}
      <div className="grid grid-cols-12 gap-2 px-2 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-medium text-muted-foreground">
        <div className="col-span-1">#</div>
        <div className="col-span-3">Item Name <span className="text-red-500">*</span></div>
        <div className="col-span-3">Description</div>
        <div className="col-span-1 text-center">Qty <span className="text-red-500">*</span></div>
        <div className="col-span-1 text-center">Unit</div>
        <div className="col-span-1 text-center">Est. Cost <span className="text-red-500">*</span></div>
        <div className="col-span-1 text-center">Total</div>
        <div className="col-span-1 text-right">Actions</div>
      </div>

      {/* Items Rows */}
      {items.map((item, index) => {
        const total = (item.quantity || 0) * (item.estimated_unit_cost || 0);
        const isFirst = index === 0 && !item.item_name.trim();
        return (
          <div
            key={index}
            className={cn(
              "border-b border-gray-200 dark:border-gray-700 py-2 px-2 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors",
              isFirst && "bg-blue-50/30 dark:bg-blue-900/10"
            )}
          >
            <div className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-1">
                <span className="text-xs font-medium text-muted-foreground">{index + 1}.</span>
              </div>

              <div className="col-span-3">
                <Input
                  placeholder="Item name"
                  value={item.item_name || ''}
                  onChange={(e) => handleItemChange(index, 'item_name', e.target.value)}
                  disabled={disabled}
                  className="h-8 text-sm dark:bg-gray-900 dark:border-gray-700 rounded-lg"
                />
              </div>

              <div className="col-span-3">
                <Input
                  placeholder="Description"
                  value={item.description || ''}
                  onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                  disabled={disabled}
                  className="h-8 text-sm dark:bg-gray-900 dark:border-gray-700 rounded-lg"
                />
              </div>

              <div className="col-span-1">
                <Input
                  type="number"
                  step="1"
                  min="1"
                  placeholder="Qty"
                  value={item.quantity || ''}
                  onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 1)}
                  disabled={disabled}
                  className="h-8 text-sm dark:bg-gray-900 dark:border-gray-700 rounded-lg text-center"
                />
              </div>

              <div className="col-span-1">
                <Input
                  placeholder="Unit"
                  value={item.unit_of_measure || ''}
                  onChange={(e) => handleItemChange(index, 'unit_of_measure', e.target.value)}
                  disabled={disabled}
                  className="h-8 text-sm dark:bg-gray-900 dark:border-gray-700 rounded-lg"
                />
              </div>

              <div className="col-span-1">
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">KES</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={item.estimated_unit_cost || ''}
                    onChange={(e) => handleItemChange(index, 'estimated_unit_cost', parseFloat(e.target.value) || 0)}
                    disabled={disabled}
                    className="pl-8 h-8 text-sm dark:bg-gray-900 dark:border-gray-700 rounded-lg"
                  />
                </div>
              </div>

              <div className="col-span-1">
                <div className="h-8 flex items-center text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg px-2">
                  {total.toFixed(2)}
                </div>
              </div>

              <div className="col-span-1 flex items-center justify-end gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addItem}
                  disabled={disabled}
                  className="h-7 w-7 p-0 rounded-lg hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/20 text-muted-foreground"
                  title="Add new item"
                >
                  <Plus className="h-4 w-4" />
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(index)}
                  disabled={items.length <= 1 || disabled}
                  className="h-7 w-7 p-0 rounded-lg hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 disabled:opacity-30"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        );
      })}

      {/* Total Summary */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div>
          <p className="text-sm text-muted-foreground">
            Items: <span className="font-medium text-gray-700 dark:text-gray-300">{items.filter(i => i.item_name.trim()).length}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Total Quantity: <span className="font-medium text-gray-700 dark:text-gray-300">
              {items.reduce((sum, i) => sum + (i.quantity || 0), 0)}
            </span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Estimated Total</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            KES {totalAmount.toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground">* Estimates only - final cost from suppliers may vary</p>
        </div>
      </div>
    </div>
  );
});

ItemsStep.displayName = 'ItemsStep';

// ============================================
// STEP 4: ADVANCED OPTIONS
// ============================================

const AdvancedOptionsStep = memo(({
  formData,
  handleChange,
  disabled,
}: {
  formData: any;
  handleChange: (field: string, value: any) => void;
  disabled: boolean;
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Layers className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Step 4: Advanced Options</h3>
        <Badge variant="outline" className="rounded-full text-[10px]">
          Optional
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
            <Hash className="h-4 w-4 text-muted-foreground" />
            Budget Code
            <FieldTooltip content="Enter the budget code if you have one." />
          </Label>
          <Input
            placeholder="Enter budget code"
            value={formData.budget_code}
            onChange={(e) => handleChange('budget_code', e.target.value)}
            disabled={disabled}
            className="h-10 text-sm rounded-xl dark:bg-gray-900 dark:border-gray-700"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            Budget Source
            <FieldTooltip content="Where is this requisition budget coming from?" />
          </Label>
          <Select
            value={formData.budget_source || ''}
            onValueChange={(value) => handleChange('budget_source', value)}
            disabled={disabled}
          >
            <SelectTrigger className="h-10 text-sm rounded-xl dark:bg-gray-900 dark:border-gray-700">
              <SelectValue placeholder="Select budget source" />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
              <SelectItem value="recurrent">Recurrent</SelectItem>
              <SelectItem value="development">Development</SelectItem>
              <SelectItem value="donor">Donor Funded</SelectItem>
              <SelectItem value="internal">Internal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            Funding Source
            <FieldTooltip content="What is the source of funding?" />
          </Label>
          <Select
            value={formData.funding_source || ''}
            onValueChange={(value) => handleChange('funding_source', value)}
            disabled={disabled}
          >
            <SelectTrigger className="h-10 text-sm rounded-xl dark:bg-gray-900 dark:border-gray-700">
              <SelectValue placeholder="Select funding source" />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
              <SelectItem value="government">Government</SelectItem>
              <SelectItem value="donor">Donor</SelectItem>
              <SelectItem value="internal">Internal</SelectItem>
              <SelectItem value="private">Private Sector</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
            <Hash className="h-4 w-4 text-muted-foreground" />
            Project Code
            <FieldTooltip content="If this is for a specific project, enter the code." />
          </Label>
          <Input
            placeholder="Enter project code"
            value={formData.project_code}
            onChange={(e) => handleChange('project_code', e.target.value)}
            disabled={disabled}
            className="h-10 text-sm rounded-xl dark:bg-gray-900 dark:border-gray-700"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            Procurement Method
            <FieldTooltip content="How should procurement handle this?" />
          </Label>
          <Select
            value={formData.procurement_method || ''}
            onValueChange={(value) => handleChange('procurement_method', value)}
            disabled={disabled}
          >
            <SelectTrigger className="h-10 text-sm rounded-xl dark:bg-gray-900 dark:border-gray-700">
              <SelectValue placeholder="Select procurement method" />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
              <SelectItem value="direct_purchase">Direct Purchase</SelectItem>
              <SelectItem value="request_for_quotation">Request for Quotation</SelectItem>
              <SelectItem value="tender">Tender</SelectItem>
              <SelectItem value="framework_agreement">Framework Agreement</SelectItem>
              <SelectItem value="emergency_procurement">Emergency Procurement</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5 flex items-end gap-3 pt-1">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="framework_agreement"
              checked={formData.is_framework_agreement}
              onChange={(e) => handleChange('is_framework_agreement', e.target.checked)}
              disabled={disabled}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <Label htmlFor="framework_agreement" className="text-sm font-medium cursor-pointer text-gray-700 dark:text-gray-300">
              Framework Agreement
            </Label>
            <FieldTooltip content="Is this covered under an existing framework agreement?" />
          </div>
          {formData.is_framework_agreement && (
            <div className="flex-1">
              <Input
                placeholder="Framework ID"
                value={formData.framework_agreement_id}
                onChange={(e) => handleChange('framework_agreement_id', e.target.value)}
                disabled={disabled}
                className="h-10 text-sm rounded-xl dark:bg-gray-900 dark:border-gray-700"
              />
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
            Risk Level
            <FieldTooltip content="What is the risk level of this requisition?" />
          </Label>
          <Select
            value={formData.risk_level}
            onValueChange={(value) => handleChange('risk_level', value)}
            disabled={disabled}
          >
            <SelectTrigger className="h-10 text-sm rounded-xl dark:bg-gray-900 dark:border-gray-700">
              <SelectValue placeholder="Select risk level" />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
            <Shield className="h-4 w-4 text-muted-foreground" />
            Risk Mitigation
            <FieldTooltip content="How will you mitigate the risks?" />
          </Label>
          <Textarea
            placeholder="Describe risk mitigation measures..."
            value={formData.risk_mitigation}
            onChange={(e) => handleChange('risk_mitigation', e.target.value)}
            disabled={disabled}
            className="min-h-[50px] resize-none text-sm rounded-xl dark:bg-gray-900 dark:border-gray-700"
            rows={2}
          />
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
            Compliance Notes
            <FieldTooltip content="Any compliance or regulatory notes." />
          </Label>
          <Textarea
            placeholder="Enter compliance notes..."
            value={formData.compliance_notes}
            onChange={(e) => handleChange('compliance_notes', e.target.value)}
            disabled={disabled}
            className="min-h-[50px] resize-none text-sm rounded-xl dark:bg-gray-900 dark:border-gray-700"
            rows={2}
          />
        </div>
      </div>
    </div>
  );
});

AdvancedOptionsStep.displayName = 'AdvancedOptionsStep';

// ============================================
// DRAFT RESTORE ALERT
// ============================================

const DraftRestoreAlert = memo(({
  onRestore,
  onDiscard,
  timestamp
}: {
  onRestore: () => void;
  onDiscard: () => void;
  timestamp: string | null;
}) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const timeString = timestamp ? new Date(timestamp).toLocaleString() : '';

  return (
    <Alert className="mb-6 border-amber-500/50 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-xl">
      <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
      <AlertTitle className="text-amber-800 dark:text-amber-300">Draft Found</AlertTitle>
      <AlertDescription className="text-amber-700 dark:text-amber-400">
        You have an unsaved requisition draft from {timeString}.
        <div className="flex gap-3 mt-3">
          <Button
            size="sm"
            onClick={onRestore}
            className="gap-1.5 h-8 bg-amber-600 hover:bg-amber-700 text-white rounded-lg"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Restore Draft
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              onDiscard();
              setIsVisible(false);
            }}
            className="h-8 rounded-lg"
          >
            Discard Draft
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
});

DraftRestoreAlert.displayName = 'DraftRestoreAlert';

// ============================================
// INFO ALERTS COMPONENT
// ============================================

const InfoAlerts = memo(({ requisitionType }: { requisitionType: RequisitionTypeEnum }) => {
  const isServices = requisitionType === 'services';

  return (
    <div className="space-y-3 mb-6">
      <Alert className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20 rounded-xl">
        <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <AlertTitle className="text-blue-800 dark:text-blue-300 text-sm font-medium">
          How to Create a {isServices ? 'Service' : 'Goods'} Requisition
        </AlertTitle>
        <AlertDescription className="text-blue-700 dark:text-blue-400 text-sm">
          {isServices ? (
            <>
              Fill in the service details below. Describe the scope of work, deliverables, and timeline.
              Suppliers will provide quotations based on your service description.
              <div className="flex items-start gap-1.5 mt-1">
                <Lightbulb className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span>Be specific about what you need - the more detail, the better the quotations!</span>
              </div>
            </>
          ) : (
            <>
              Fill in the requisition details below. Start by adding items to your requisition.
              Each item requires a name, quantity, unit of measure, and estimated cost.
              <div className="flex items-start gap-1.5 mt-1">
                <Lightbulb className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span>Be specific about quantities and specifications for accurate quotations.</span>
              </div>
            </>
          )}
        </AlertDescription>
      </Alert>

      <Alert className="border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl">
        <FileCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        <AlertTitle className="text-emerald-800 dark:text-emerald-300 text-sm font-medium">Approval Workflow</AlertTitle>
        <AlertDescription className="text-emerald-700 dark:text-emerald-400 text-sm">
          Once submitted, your requisition will go through the approval workflow:
          HOD Review → Accountant Review → Principal Review → Director / Finance Administrator's Approval.
          {isServices && (
            <span className="block mt-1">
              Service requisitions (LSO) follow the same approval process as goods requisitions.
            </span>
          )}
        </AlertDescription>
      </Alert>

      <Alert className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 rounded-xl">
        <InfoIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        <AlertTitle className="text-amber-800 dark:text-amber-300 text-sm font-medium">Draft Auto-Save</AlertTitle>
        <AlertDescription className="text-amber-700 dark:text-amber-400 text-sm">
          Your progress is automatically saved as a draft. If you leave the page,
          you can restore your draft when you return. Drafts are stored locally in your browser.
        </AlertDescription>
      </Alert>
    </div>
  );
});

InfoAlerts.displayName = 'InfoAlerts';

// ============================================
// MAIN COMPONENT
// ============================================

export default function CreateRequisitionPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthContext();
  const { mutate: createRequisition, isPending: isCreating } = useCreateRequisition();

  const { useAllDepartments } = useDepartments();
  const { useAllSuppliers } = useSuppliers();

  const { data: departmentsData, isLoading: departmentsLoading } = useAllDepartments();
  const { data: suppliersData, isLoading: suppliersLoading } = useAllSuppliers();

  const departments = useMemo((): Department[] => {
    if (!departmentsData) return [];
    if (Array.isArray(departmentsData)) return departmentsData;
    if (departmentsData && typeof departmentsData === 'object' && 'data' in departmentsData && Array.isArray((departmentsData as any).data)) {
      return (departmentsData as any).data;
    }
    return [];
  }, [departmentsData]);

  const suppliers = useMemo((): any[] => {
    if (!suppliersData) return [];
    if (Array.isArray(suppliersData)) return suppliersData;
    if (suppliersData && typeof suppliersData === 'object' && 'data' in suppliersData && Array.isArray((suppliersData as any).data)) {
      return (suppliersData as any).data;
    }
    return [];
  }, [suppliersData]);

  const isHOD = useMemo(() => isUserHOD(user), [user]);
  const isStaff = useMemo(() => isUserStaff(user), [user]);

  const hodDepartment = useMemo(() => {
    if (!isHOD || !user || departments.length === 0) return null;
    return findUserHODDepartment(user, departments);
  }, [isHOD, user, departments]);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [hasDraft, setHasDraft] = useState(false);
  const [draftTimestamp, setDraftTimestamp] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [requisitionNumber] = useState(generateRequisitionNumber);

  const userDepartmentId = useMemo(() => {
    if (isHOD && hodDepartment) {
      return hodDepartment.id.toString();
    }
    if (user?.department_id) {
      return user.department_id.toString();
    }
    return '';
  }, [isHOD, hodDepartment, user]);

  const userDepartmentName = useMemo(() => {
    if (isHOD && hodDepartment) {
      return hodDepartment.name;
    }
    if (user?.department_id) {
      const dept = departments.find(d => d.id === user.department_id);
      return dept?.name || '';
    }
    return '';
  }, [isHOD, hodDepartment, user, departments]);

  const getDefaultFormState = useCallback(() => ({
    requester_name: user?.full_name || user?.email || '',
    requester_email: user?.email || '',
    requisition_number: requisitionNumber,
    requisition_type: 'goods' as RequisitionTypeEnum,
    title: '',
    description: '',
    department_id: isHOD || isStaff ? userDepartmentId : '',
    priority: 'medium' as const,
    type: 'normal' as const,
    urgency: 'routine' as const,
    justification: '',
    required_by_date: '',
    required_delivery_date: '',
    // Service fields
    service_category: '' as ServiceCategory | '',
    service_scope_of_work: '',
    service_deliverables_expected: '',
    service_expected_start_date: '',
    service_expected_end_date: '',
    service_estimated_duration_days: '',
    service_requires_onsite_visit: false,
    service_special_requirements: '',
    service_qualifications_required: '',
    // Goods fields
    goods_category: '',
    goods_warehouse_location: '',
    goods_storage_requirements: '',
    goods_expected_delivery_date: '',
    // Advanced fields
    budget_code: '',
    budget_source: '',
    funding_source: '',
    project_code: '',
    procurement_method: '',
    is_framework_agreement: false,
    framework_agreement_id: '',
    risk_level: 'low' as const,
    risk_mitigation: '',
    is_compliant: true,
    compliance_notes: '',
    currency: 'KES',
    exchange_rate: 1,
    items: [
      {
        item_name: '',
        description: '',
        unit_of_measure: '',
        quantity: 1,
        estimated_unit_cost: 0,
        specifications: '',
        catalog_number: '',
        manufacturer: '',
        model_number: '',
        is_inventory_item: false,
        inventory_code: '',
        tax_rate: 0,
        discount_percentage: 0,
      },
    ],
  }), [user, requisitionNumber, isHOD, isStaff, userDepartmentId]);

  const [formData, setFormData] = useState(getDefaultFormState);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const stepLabels = useMemo(() => {
    const isService = formData.requisition_type === 'services';
    if (isService) {
      return ['Basic Info', 'Service Details', 'Components (Auto)', 'Advanced'];
    }
    return ['Basic Info', 'Goods Details', 'Items', 'Advanced'];
  }, [formData.requisition_type]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    setIsPageLoading(false);
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isPageLoading && user && (isHOD || isStaff) && !departmentsLoading) {
      if (!userDepartmentId) {
        setError('You are not assigned to any department. Please contact your administrator.');
      } else {
        setError(null);
      }
    }
  }, [isPageLoading, user, isHOD, isStaff, userDepartmentId, departmentsLoading]);

  useEffect(() => {
    if (!isPageLoading && user) {
      const savedData = loadFromLocalStorage();
      const timestamp = getDraftTimestamp();

      if (savedData && timestamp) {
        const hasContent = savedData.title?.trim() ||
          savedData.items?.some((item: any) => item.item_name?.trim()) ||
          savedData.description?.trim();

        if (hasContent) {
          setHasDraft(true);
          setDraftTimestamp(timestamp);
        } else {
          clearLocalStorage();
        }
      }
      setIsInitialLoad(false);
    }
  }, [isPageLoading, user]);

  useEffect(() => {
    if (isInitialLoad || !user) return;

    const timer = setTimeout(() => {
      const hasContent = formData.title?.trim() ||
        formData.items?.some((item: any) => item.item_name?.trim()) ||
        formData.description?.trim();

      if (hasContent) {
        saveToLocalStorage(formData);
      }
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(timer);
  }, [formData, isInitialLoad, user]);

  const restoreDraft = useCallback(() => {
    const savedData = loadFromLocalStorage();
    if (savedData) {
      if ((isHOD || isStaff) && userDepartmentId) {
        savedData.department_id = userDepartmentId;
      }
      setFormData(savedData);
      setHasDraft(false);
    }
  }, [isHOD, isStaff, userDepartmentId]);

  const discardDraft = useCallback(() => {
    clearLocalStorage();
    setHasDraft(false);
    setDraftTimestamp(null);
    setFormData(getDefaultFormState());
  }, [getDefaultFormState]);

  useEffect(() => {
    if (user && isInitialLoad) {
      setFormData(prev => ({
        ...prev,
        requester_name: user.full_name || user.email || '',
        requester_email: user.email || '',
        department_id: (isHOD || isStaff) ? userDepartmentId : prev.department_id,
      }));
    }
  }, [user, isInitialLoad, isHOD, isStaff, userDepartmentId]);

  const handleItemChange = useCallback((index: number, field: string, value: any) => {
    setFormData(prev => {
      const updatedItems = [...prev.items];
      updatedItems[index] = { ...updatedItems[index], [field]: value };
      return { ...prev, items: updatedItems };
    });
  }, []);

  const addItem = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          item_name: '',
          description: '',
          unit_of_measure: '',
          quantity: 1,
          estimated_unit_cost: 0,
          specifications: '',
          catalog_number: '',
          manufacturer: '',
          model_number: '',
          is_inventory_item: false,
          inventory_code: '',
          tax_rate: 0,
          discount_percentage: 0,
        },
      ],
    }));
  }, []);

  const removeItem = useCallback((index: number) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      }));
    }
  }, [formData.items.length]);

  const handleChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [formErrors]);

  const totalAmount = useMemo(() => {
    return formData.items.reduce((sum, item) => {
      return sum + ((item.quantity || 0) * (item.estimated_unit_cost || 0));
    }, 0);
  }, [formData.items]);

  const validateStep = useCallback((step: number): boolean => {
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.requisition_type) {
        errors.requisition_type = 'Requisition type is required';
      }
      if (!formData.title.trim()) {
        errors.title = 'Title is required';
      }
      if (!formData.department_id) {
        errors.department_id = 'Department is required';
      }
    }

    if (step === 2) {
      if (formData.requisition_type === 'services') {
        if (!formData.service_category) {
          errors.service_category = 'Service category is required';
        }
        if (!formData.service_scope_of_work?.trim()) {
          errors.service_scope_of_work = 'Scope of work is required';
        }
      } else if (formData.requisition_type === 'goods') {
        if (!formData.goods_category) {
          errors.goods_category = 'Goods category is required';
        }
      }
    }

    if (step === 3) {
      // Only validate items for goods
      if (formData.requisition_type === 'goods') {
        const itemErrors: string[] = [];
        formData.items.forEach((item, index) => {
          if (!item.item_name.trim()) {
            itemErrors.push(`Item ${index + 1}: Name is required`);
          }
          if (!item.unit_of_measure.trim()) {
            itemErrors.push(`Item ${index + 1}: Unit of measure is required`);
          }
          if (item.quantity <= 0) {
            itemErrors.push(`Item ${index + 1}: Quantity must be greater than 0`);
          }
          if (item.estimated_unit_cost < 0) {
            itemErrors.push(`Item ${index + 1}: Unit cost must be 0 or greater`);
          }
        });
        if (itemErrors.length > 0) {
          errors.items = itemErrors.join('; ');
        }
      }
      // For services, no validation needed - items auto-created
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const goToNextStep = useCallback(() => {
    if (validateStep(currentStep)) {
      setCurrentStep(Math.min(currentStep + 1, 4));
    }
  }, [currentStep, validateStep]);

  const goToPreviousStep = useCallback(() => {
    setCurrentStep(Math.max(currentStep - 1, 1));
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(3) || !validateStep(2) || !validateStep(1)) {
      return;
    }

    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    const procurementMethod = formData.procurement_method || undefined;
    const isService = formData.requisition_type === 'services';

    // Prepare items
    let items: any[] = [];

    if (isService) {
      // For services: Auto-create a single item
      let description = formData.service_scope_of_work || formData.description || 'Service to be quoted by supplier';
      if (description.length > 1000) {
        description = description.substring(0, 997) + '...';
      }

      items = [{
        item_name: `Service: ${formData.title || 'Service Requisition'}`,
        description: description,
        unit_of_measure: 'Lot',
        quantity: 1,
        estimated_unit_cost: 0,
        specifications: null,
        catalog_number: null,
        manufacturer: null,
        model_number: null,
        supplier_id: null,
        is_inventory_item: false,
        inventory_code: null,
        tax_rate: 0,
        discount_percentage: 0,
      }];
    } else {
      // For goods: Use the user-defined items
      items = formData.items
        .filter(item => item.item_name.trim() !== '')
        .map((item: any) => ({
          item_name: item.item_name,
          description: item.description || undefined,
          unit_of_measure: item.unit_of_measure || 'Unit',
          quantity: item.quantity,
          estimated_unit_cost: item.estimated_unit_cost,
          specifications: item.specifications || undefined,
          catalog_number: item.catalog_number || undefined,
          manufacturer: item.manufacturer || undefined,
          model_number: item.model_number || undefined,
          supplier_id: item.supplier_id || undefined,
          is_inventory_item: item.is_inventory_item,
          inventory_code: item.inventory_code || undefined,
          tax_rate: item.tax_rate || 0,
          discount_percentage: item.discount_percentage || 0,
        }));
    }

    const submitData: CreateRequisitionData = {
      reference_number: formData.requisition_number,
      title: formData.title,
      description: formData.description || undefined,
      department_id: parseInt(formData.department_id),
      requisition_type: formData.requisition_type,
      // Service fields
      service_category: formData.service_category as ServiceCategory || undefined,
      service_scope_of_work: formData.service_scope_of_work || undefined,
      service_deliverables_expected: formData.service_deliverables_expected || undefined,
      service_expected_start_date: formData.service_expected_start_date || undefined,
      service_expected_end_date: formData.service_expected_end_date || undefined,
      service_estimated_duration_days: formData.service_estimated_duration_days ? parseInt(formData.service_estimated_duration_days) : undefined,
      service_requires_onsite_visit: formData.service_requires_onsite_visit,
      service_special_requirements: formData.service_special_requirements || undefined,
      service_qualifications_required: formData.service_qualifications_required || undefined,
      // Goods fields
      goods_category: formData.goods_category || undefined,
      goods_warehouse_location: formData.goods_warehouse_location || undefined,
      goods_storage_requirements: formData.goods_storage_requirements || undefined,
      goods_expected_delivery_date: formData.goods_expected_delivery_date || undefined,
      // Advanced fields
      priority: formData.priority as any,
      type: formData.type as any,
      urgency: formData.urgency as any,
      justification: formData.justification || undefined,
      required_by_date: formData.required_by_date || undefined,
      required_delivery_date: formData.required_delivery_date || undefined,
      budget_code: formData.budget_code || undefined,
      budget_source: formData.budget_source || undefined,
      funding_source: formData.funding_source || undefined,
      project_code: formData.project_code || undefined,
      procurement_method: procurementMethod as any,
      is_framework_agreement: formData.is_framework_agreement,
      framework_agreement_id: formData.framework_agreement_id || undefined,
      risk_level: formData.risk_level as any,
      risk_mitigation: formData.risk_mitigation || undefined,
      is_compliant: formData.is_compliant,
      compliance_notes: formData.compliance_notes || undefined,
      currency: formData.currency,
      exchange_rate: formData.exchange_rate,
      items: items,
    };

    createRequisition(submitData, {
      onSuccess: () => {
        setSuccess(true);
        clearLocalStorage();
        setIsSubmitting(false);
        setTimeout(() => {
          router.push('/requisitions/manage');
        }, 1500);
      },
      onError: (err: any) => {
        const errorMessage = err?.response?.data?.message || err.message || 'Failed to create requisition';
        setError(errorMessage);
        setIsSubmitting(false);
      },
    });
  }, [formData, validateStep, createRequisition, router]);

  const isService = formData.requisition_type === 'services';

  if (authLoading || isPageLoading || departmentsLoading || suppliersLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <span className="text-sm text-gray-500">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if ((isHOD || isStaff) && !departmentsLoading && !userDepartmentId) {
    return (
      <PageTemplate
        title="Create New Requisition"
        description="Fill in the details below to create a new requisition request"
        icon={<List className="h-5 w-5 text-blue-600" />}
        background="gradient"
      >
        <Card className="shadow-sm border-0 bg-white dark:bg-gray-900 rounded-xl relative">
          <WrappedCornerTag label="ERROR" color="red" position="top-left" size="lg" />
          <CardContent className="pt-8">
            <Alert variant="destructive" className="rounded-lg border-red-200 dark:border-red-800">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You are not assigned to any department. Please contact your administrator.
              </AlertDescription>
            </Alert>
            <div className="flex justify-center mt-6">
              <Button onClick={() => router.push('/dashboard')} className="gap-2 rounded-lg bg-blue-600 hover:bg-blue-700">
                <ArrowLeft className="h-4 w-4" />
                Return to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title="Create New Requisition"
      description="Fill in the details below to create a new requisition request"
      icon={<List className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />}
      background="gradient"
      variant="default"
      breadcrumbs={[
        { label: 'Requisitions', href: '/requisitions' },
        { label: 'Create' },
      ]}
      actions={
        <div className="flex items-center gap-2">
          {hasDraft && (
            <Badge className="gap-1.5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800 rounded-full px-3 py-1">
              <RotateCcw className="h-3 w-3" />
              Draft Available
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/requisitions/manage')}
            className="gap-2 h-9 rounded-lg dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </Button>
        </div>
      }
    >
      <Card className="shadow-lg border-0 bg-white dark:bg-gray-900 rounded-xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
        <WrappedCornerTag label="NEW" color="blue" position="top-left" size="lg" />

        <CardHeader className="pb-4 pt-8 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20">
              <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                Create Requisition
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Complete all steps to submit your requisition for approval
              </CardDescription>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] rounded-full px-3 py-1 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400">
                <Clock className="h-3 w-3 mr-1" />
                Auto-save
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {/* Info Alerts */}
          <InfoAlerts requisitionType={formData.requisition_type} />

          {error && (
            <Alert variant="destructive" className="mb-6 rounded-lg border-red-200 dark:border-red-800">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 rounded-lg border-green-500/50 bg-green-50 dark:bg-green-950/20">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-700 dark:text-green-300 font-medium">
                Requisition created successfully. Redirecting...
              </AlertDescription>
            </Alert>
          )}

          {hasDraft && !success && (
            <DraftRestoreAlert
              onRestore={restoreDraft}
              onDiscard={discardDraft}
              timestamp={draftTimestamp}
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step Indicator */}
            <StepIndicator
              currentStep={currentStep}
              totalSteps={4}
              labels={stepLabels}
            />

            {/* Step Content */}
            <div className="min-h-[400px]">
              {currentStep === 1 && (
                <BasicInfoStep
                  formData={formData}
                  handleChange={handleChange}
                  departments={departments}
                  isHOD={isHOD}
                  isStaff={isStaff}
                  userDepartmentName={userDepartmentName}
                  userDepartmentId={userDepartmentId}
                  disabled={isSubmitting || success || isCreating}
                  errors={formErrors}
                />
              )}

              {currentStep === 2 && (
                <TypeDetailsStep
                  formData={formData}
                  handleChange={handleChange}
                  disabled={isSubmitting || success || isCreating}
                  isService={isService}
                  errors={formErrors}
                />
              )}

              {currentStep === 3 && (
                <ItemsStep
                  formData={formData}
                  items={formData.items}
                  handleItemChange={handleItemChange}
                  addItem={addItem}
                  removeItem={removeItem}
                  totalAmount={totalAmount}
                  isService={isService}
                  disabled={isSubmitting || success || isCreating}
                />
              )}

              {currentStep === 4 && (
                <AdvancedOptionsStep
                  formData={formData}
                  handleChange={handleChange}
                  disabled={isSubmitting || success || isCreating}
                />
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div>
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={goToPreviousStep}
                    disabled={isSubmitting || success || isCreating}
                    className="gap-2 h-10 rounded-xl dark:border-gray-700 dark:hover:bg-gray-800"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Previous
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-3">
                {currentStep < 4 && (
                  <Button
                    type="button"
                    onClick={goToNextStep}
                    disabled={isSubmitting || success || isCreating}
                    className="gap-2 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}

                {currentStep === 4 && (
                  <Button
                    type="submit"
                    className="gap-2 px-8 min-w-[160px] h-11 text-base rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-600/20"
                    disabled={isSubmitting || success || isCreating}
                  >
                    {isSubmitting || isCreating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Create Requisition
                      </>
                    )}
                  </Button>
                )}

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/requisitions')}
                  disabled={isSubmitting || success || isCreating}
                  className="h-10 rounded-xl dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>

                {hasDraft && !success && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={discardDraft}
                    className="text-xs text-muted-foreground h-8 px-3 rounded-xl hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    Clear Draft
                  </Button>
                )}
              </div>
            </div>
          </form>
        </CardContent>

        <CardFooter className="border-t border-gray-200 dark:border-gray-700 py-3 px-6 bg-gray-50 dark:bg-gray-800/30 rounded-b-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-2">
            <p className="text-xs text-muted-foreground">
              <span className="text-red-500">*</span> Required fields. All requisitions go through an approval workflow.
            </p>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-[10px] rounded-full px-2.5 py-0 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400">
                <Shield className="h-3 w-3 mr-1" />
                Secure
              </Badge>
              {formData.requisition_type === 'services' ? (
                <Badge className="text-[10px] rounded-full px-2.5 py-0 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                  <Briefcase className="h-3 w-3 mr-1" />
                  LSO
                </Badge>
              ) : (
                <Badge className="text-[10px] rounded-full px-2.5 py-0 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  <Package className="h-3 w-3 mr-1" />
                  LPO
                </Badge>
              )}
            </div>
          </div>
        </CardFooter>
      </Card>
    </PageTemplate>
  );
}
