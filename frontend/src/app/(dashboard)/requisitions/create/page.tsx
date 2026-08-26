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
  Star,
  TrendingUp,
  Award,
  Zap,
  Heart,
  Target,
  Globe,
  ShieldCheck,
  BookOpen,
  PenTool,
  Coffee,
  Home,
  Users,
  Briefcase as BriefcaseIcon,
  Calendar as CalendarIcon2,
  ShoppingCart,
  RefreshCw,
  Minus,
  Plus as PlusIcon,
  Edit,
  Eye,
  Printer,
  Download,
  Share2,
  Copy,
  HelpCircle,
  AlertTriangle,
  Info as InfoIcon,
  ChevronRight,
  Lightbulb,
  FileCheck,
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
import { format } from 'date-fns';

// Hooks & Services
import { useAuthContext } from '@/contexts/AuthContext';
import { useCreateRequisition } from '@/hooks/useRequisitionMutations';
import { useDepartments } from '@/hooks/useDepartments';
import { useSuppliers } from '@/hooks/useSuppliers';
import { PageTemplate } from '@/components/dashboard/PageTemplate';

// Types
import type { Department } from '@/types/common.types';
import type { CreateRequisitionData } from '@/types/requisition.types';

// UI Components
import { WrappedCornerTag } from '@/components/ui/wrapped-corner-tag';
import HorizontalCornerTag from '@/components/ui/horizontal-corner-tag';

// ============================================
// CONSTANTS
// ============================================

const STORAGE_KEY = 'requisition_draft_data';
const STORAGE_TIMESTAMP_KEY = 'requisition_draft_timestamp';
const DEBOUNCE_DELAY = 500;

// HOD role identifiers
const HOD_ROLES = ['hod', 'head_of_department'];
const STAFF_ROLES = ['staff'];

// Priority options with colors
const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: 'text-gray-400', bg: 'bg-gray-100 dark:bg-gray-800' },
  { value: 'medium', label: 'Medium', color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  { value: 'high', label: 'High', color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  { value: 'emergency', label: 'Emergency', color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' },
];

const TYPE_OPTIONS = [
  { value: 'normal', label: 'Normal', color: 'text-blue-500' },
  { value: 'emergency', label: 'Emergency', color: 'text-red-500' },
];

const URGENCY_OPTIONS = [
  { value: 'routine', label: 'Routine', color: 'text-gray-400' },
  { value: 'urgent', label: 'Urgent', color: 'text-amber-500' },
  { value: 'critical', label: 'Critical', color: 'text-red-500' },
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
// ITEM ROW COMPONENT
// ============================================

interface ItemRowProps {
  index: number;
  item: any;
  onChange: (index: number, field: string, value: any) => void;
  onRemove: (index: number) => void;
  onAdd: () => void;
  canRemove: boolean;
  isFirst: boolean;
}

const ItemRow = memo(({
  index,
  item,
  onChange,
  onRemove,
  onAdd,
  canRemove,
  isFirst
}: ItemRowProps) => {
  const total = (item.quantity || 0) * (item.estimated_unit_cost || 0);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleChange = useCallback((field: string, value: any) => {
    onChange(index, field, value);
  }, [index, onChange]);

  const handleRemove = useCallback(() => {
    onRemove(index);
  }, [index, onRemove]);

  const handleAdd = useCallback(() => {
    onAdd();
  }, [onAdd]);

  const toggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  return (
    <div className={cn(
      "border-b border-gray-200 dark:border-gray-700 py-2 px-2 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors",
      isFirst && "bg-blue-50/30 dark:bg-blue-900/10"
    )}>
      {/* Main Row */}
      <div className="grid grid-cols-12 gap-2 items-center">
        {/* Item Number */}
        <div className="col-span-1">
          <span className="text-xs font-medium text-muted-foreground">{index + 1}.</span>
        </div>

        {/* Item Name */}
        <div className="col-span-3">
          <Input
            placeholder="Item name"
            value={item.item_name || ''}
            onChange={(e) => handleChange('item_name', e.target.value)}
            className={cn(
              "h-8 text-sm dark:bg-gray-900 dark:border-gray-700 rounded-lg",
              isFirst && "border-blue-300 dark:border-blue-700"
            )}
          />
        </div>

        {/* Description */}
        <div className="col-span-3">
          <Input
            placeholder="Description"
            value={item.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            className="h-8 text-sm dark:bg-gray-900 dark:border-gray-700 rounded-lg"
          />
        </div>

        {/* Quantity */}
        <div className="col-span-1">
          <Input
            type="number"
            step="1"
            min="1"
            placeholder="Qty"
            value={item.quantity || ''}
            onChange={(e) => handleChange('quantity', parseFloat(e.target.value) || 1)}
            className="h-8 text-sm dark:bg-gray-900 dark:border-gray-700 rounded-lg text-center"
          />
        </div>

        {/* Unit */}
        <div className="col-span-1">
          <Input
            placeholder="Unit"
            value={item.unit_of_measure || ''}
            onChange={(e) => handleChange('unit_of_measure', e.target.value)}
            className="h-8 text-sm dark:bg-gray-900 dark:border-gray-700 rounded-lg"
          />
        </div>

        {/* Unit Cost */}
        <div className="col-span-1">
          <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">KES</span>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={item.estimated_unit_cost || ''}
              onChange={(e) => handleChange('estimated_unit_cost', parseFloat(e.target.value) || 0)}
              className="pl-8 h-8 text-sm dark:bg-gray-900 dark:border-gray-700 rounded-lg"
            />
          </div>
        </div>

        {/* Total */}
        <div className="col-span-1">
          <div className="h-8 flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg px-2">
            {total.toFixed(2)}
          </div>
        </div>

        {/* Actions */}
        <div className="col-span-1 flex items-center justify-end gap-1">
          {/* Expand/Collapse Button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={toggleExpand}
            className="h-7 w-7 p-0 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-muted-foreground"
            title={isExpanded ? "Hide details" : "Show details"}
          >
            <ChevronDown className={cn(
              "h-4 w-4 transition-transform duration-200",
              isExpanded && "rotate-180"
            )} />
          </Button>

          {/* Add Item Button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleAdd}
            className="h-7 w-7 p-0 rounded-lg hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/20 text-muted-foreground"
            title="Add new item"
          >
            <Plus className="h-4 w-4" />
          </Button>

          {/* Remove Item Button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            disabled={!canRemove}
            className="h-7 w-7 p-0 rounded-lg hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 disabled:opacity-30"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Expanded Details Row */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-dashed border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-12 gap-3 items-end">
            <div className="col-span-3 space-y-1">
              <Label className="text-xs text-muted-foreground">Specifications</Label>
              <Input
                placeholder="Specifications"
                value={item.specifications || ''}
                onChange={(e) => handleChange('specifications', e.target.value)}
                className="h-8 text-sm dark:bg-gray-900 dark:border-gray-700 rounded-lg"
              />
            </div>
            <div className="col-span-2 space-y-1">
              <Label className="text-xs text-muted-foreground">Catalog Number</Label>
              <Input
                placeholder="Catalog #"
                value={item.catalog_number || ''}
                onChange={(e) => handleChange('catalog_number', e.target.value)}
                className="h-8 text-sm dark:bg-gray-900 dark:border-gray-700 rounded-lg"
              />
            </div>
            <div className="col-span-2 space-y-1">
              <Label className="text-xs text-muted-foreground">Manufacturer</Label>
              <Input
                placeholder="Manufacturer"
                value={item.manufacturer || ''}
                onChange={(e) => handleChange('manufacturer', e.target.value)}
                className="h-8 text-sm dark:bg-gray-900 dark:border-gray-700 rounded-lg"
              />
            </div>
            <div className="col-span-2 space-y-1">
              <Label className="text-xs text-muted-foreground">Model</Label>
              <Input
                placeholder="Model"
                value={item.model_number || ''}
                onChange={(e) => handleChange('model_number', e.target.value)}
                className="h-8 text-sm dark:bg-gray-900 dark:border-gray-700 rounded-lg"
              />
            </div>
            <div className="col-span-2 space-y-1">
              <Label className="text-xs text-muted-foreground">Inventory Item</Label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`item-${index}-inventory`}
                  checked={item.is_inventory_item || false}
                  onChange={(e) => handleChange('is_inventory_item', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <Label htmlFor={`item-${index}-inventory`} className="text-xs cursor-pointer">
                  Track inventory
                </Label>
                {item.is_inventory_item && (
                  <Input
                    placeholder="Inventory code"
                    value={item.inventory_code || ''}
                    onChange={(e) => handleChange('inventory_code', e.target.value)}
                    className="h-8 text-sm dark:bg-gray-900 dark:border-gray-700 rounded-lg flex-1"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

ItemRow.displayName = 'ItemRow';

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
// INFO ALERTS
// ============================================

const InfoAlerts = memo(() => (
  <div className="space-y-3 mb-6">
    <Alert className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20 rounded-xl">
      <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      <AlertTitle className="text-blue-800 dark:text-blue-300 text-sm font-medium">How to Create a Requisition</AlertTitle>
      <AlertDescription className="text-blue-700 dark:text-blue-400 text-sm">
        Fill in the requisition details below. Start by adding items to your requisition.
        Each item requires a name, quantity, unit of measure, and estimated cost.
        You can add multiple items by clicking the plus button on each row.
      </AlertDescription>
    </Alert>

    <Alert className="border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl">
      <FileCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
      <AlertTitle className="text-emerald-800 dark:text-emerald-300 text-sm font-medium">Approval Workflow</AlertTitle>
      <AlertDescription className="text-emerald-700 dark:text-emerald-400 text-sm">
        Once submitted, your requisition will go through the approval workflow:
        HOD Review, Accountant Review, Principal Review, and Director / Finance Administrator's Approval.
        You can track the status of your requisition in the Requisitions Dashboard.
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
));

InfoAlerts.displayName = 'InfoAlerts';

// ============================================
// SELECT COMPONENT
// ============================================

interface SimpleSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  options: { value: string; label: string; color?: string; bg?: string }[];
  disabled?: boolean;
  className?: string;
}

const SimpleSelect = memo(({ value, onValueChange, placeholder, options, disabled, className }: SimpleSelectProps) => {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={cn("h-10 text-sm dark:bg-gray-900 dark:border-gray-700 rounded-lg", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value} className="py-2">
            <div className="flex items-center gap-2">
              {option.color && <span className={cn("h-2 w-2 rounded-full", option.color.replace('text-', 'bg-'))} />}
              <span>{option.label}</span>
              {option.bg && (
                <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", option.bg)}>
                  {option.value}
                </Badge>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
});

SimpleSelect.displayName = 'SimpleSelect';

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
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [hasDraft, setHasDraft] = useState(false);
  const [draftTimestamp, setDraftTimestamp] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    title: '',
    description: '',
    department_id: isHOD || isStaff ? userDepartmentId : '',
    priority: 'medium' as const,
    type: 'normal' as const,
    urgency: 'routine' as const,
    justification: '',
    required_by_date: '',
    required_delivery_date: '',
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

  const validateForm = useCallback(() => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }
    if (!formData.department_id) {
      errors.department_id = 'Department is required';
    }

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

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    const procurementMethod = formData.procurement_method || undefined;

    const submitData: CreateRequisitionData = {
      reference_number: formData.requisition_number,
      title: formData.title,
      description: formData.description || undefined,
      department_id: parseInt(formData.department_id),
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
      items: formData.items
        .filter(item => item.item_name.trim() !== '')
        .map(item => ({
          item_name: item.item_name,
          description: item.description || undefined,
          unit_of_measure: item.unit_of_measure,
          quantity: item.quantity,
          estimated_unit_cost: item.estimated_unit_cost,
          specifications: item.specifications || undefined,
          catalog_number: item.catalog_number || undefined,
          manufacturer: item.manufacturer || undefined,
          model_number: item.model_number || undefined,
          is_inventory_item: item.is_inventory_item,
          inventory_code: item.inventory_code || undefined,
          tax_rate: item.tax_rate,
          discount_percentage: item.discount_percentage,
        })),
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
  }, [formData, validateForm, createRequisition, router]);

  // Sort items: empty items first, then filled items
  const sortedItems = useMemo(() => {
    const emptyItems = formData.items.filter(item => !item.item_name.trim());
    const filledItems = formData.items.filter(item => item.item_name.trim());
    return [...emptyItems, ...filledItems];
  }, [formData.items]);

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
                Requisition Details
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Enter all required information for your requisition request
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
          <InfoAlerts />

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
            {/* Requester Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Hash className="h-3.5 w-3.5" />
                  Requisition Number
                </Label>
                <div className="px-3 py-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <span className="text-sm font-mono font-medium text-gray-700 dark:text-gray-300">{formData.requisition_number}</span>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  Requester Name
                </Label>
                <div className="px-3 py-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{formData.requester_name}</span>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  Requester Email
                </Label>
                <div className="px-3 py-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{formData.requester_email}</span>
                </div>
              </div>
            </div>

            <Separator className="dark:border-gray-700" />

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Basic Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-1">
                  <Label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Requisition Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="Enter a clear and descriptive requisition title"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    disabled={isSubmitting || success || isCreating}
                    className={cn(
                      "h-11 text-base rounded-lg dark:bg-gray-900 dark:border-gray-700",
                      formErrors.title && "border-red-500"
                    )}
                  />
                  {formErrors.title && <p className="text-sm text-red-500 mt-1">{formErrors.title}</p>}
                </div>

                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    Department <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.department_id || undefined}
                    onValueChange={(value) => {
                      if (isHOD || isStaff) return;
                      handleChange('department_id', value);
                    }}
                    disabled={isHOD || isStaff || isSubmitting || success || isCreating}
                  >
                    <SelectTrigger className={cn(
                      "h-11 text-sm rounded-lg dark:bg-gray-900 dark:border-gray-700",
                      (isHOD || isStaff) && "bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed opacity-80",
                      formErrors.department_id && "border-red-500"
                    )}>
                      <SelectValue placeholder={isHOD ? `${userDepartmentName} (HOD)` : isStaff ? `${userDepartmentName} (Staff)` : "Select department"} />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                      {(isHOD || isStaff) && userDepartmentId && departments.find(d => d.id.toString() === userDepartmentId) && (
                        <SelectItem value={userDepartmentId}>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-blue-500" />
                            {departments.find(d => d.id.toString() === userDepartmentId)?.name}
                            <Badge className="ml-2 text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                              {isHOD ? 'HOD' : 'Staff'}
                            </Badge>
                          </div>
                        </SelectItem>
                      )}
                      {!isHOD && !isStaff && departments.length > 0 && departments.map((dept: Department) => (
                        <SelectItem key={dept.id} value={dept.id.toString()}>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            {dept.name}
                          </div>
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
                  {formErrors.department_id && <p className="text-sm text-red-500 mt-1">{formErrors.department_id}</p>}
                </div>

                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    Priority
                  </Label>
                  <SimpleSelect
                    value={formData.priority}
                    onValueChange={(value) => handleChange('priority', value)}
                    placeholder="Select priority"
                    options={PRIORITY_OPTIONS}
                    disabled={isSubmitting || success || isCreating}
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    Type
                  </Label>
                  <SimpleSelect
                    value={formData.type}
                    onValueChange={(value) => handleChange('type', value)}
                    placeholder="Select type"
                    options={TYPE_OPTIONS}
                    disabled={isSubmitting || success || isCreating}
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    Urgency
                  </Label>
                  <SimpleSelect
                    value={formData.urgency}
                    onValueChange={(value) => handleChange('urgency', value)}
                    placeholder="Select urgency"
                    options={URGENCY_OPTIONS}
                    disabled={isSubmitting || success || isCreating}
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    Required By Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal h-11 text-sm rounded-lg dark:bg-gray-900 dark:border-gray-700",
                          !formData.required_by_date && "text-muted-foreground"
                        )}
                        disabled={isSubmitting || success || isCreating}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.required_by_date ? format(new Date(formData.required_by_date), "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 rounded-lg">
                      <CalendarComponent
                        mode="single"
                        selected={formData.required_by_date ? new Date(formData.required_by_date) : undefined}
                        onSelect={(date) => handleChange('required_by_date', date ? format(date, 'yyyy-MM-dd') : '')}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    Required Delivery Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal h-11 text-sm rounded-lg dark:bg-gray-900 dark:border-gray-700",
                          !formData.required_delivery_date && "text-muted-foreground"
                        )}
                        disabled={isSubmitting || success || isCreating}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.required_delivery_date ? format(new Date(formData.required_delivery_date), "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 rounded-lg">
                      <CalendarComponent
                        mode="single"
                        selected={formData.required_delivery_date ? new Date(formData.required_delivery_date) : undefined}
                        onSelect={(date) => handleChange('required_delivery_date', date ? format(date, 'yyyy-MM-dd') : '')}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <InfoIcon className="h-4 w-4 text-muted-foreground" />
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Enter detailed description of the requisition..."
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  disabled={isSubmitting || success || isCreating}
                  className="min-h-[80px] resize-none text-base rounded-lg dark:bg-gray-900 dark:border-gray-700"
                  rows={3}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="justification" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  Justification
                </Label>
                <Textarea
                  id="justification"
                  placeholder="Explain why this requisition is needed..."
                  value={formData.justification}
                  onChange={(e) => handleChange('justification', e.target.value)}
                  disabled={isSubmitting || success || isCreating}
                  className="min-h-[60px] resize-none text-base rounded-lg dark:bg-gray-900 dark:border-gray-700"
                  rows={2}
                />
              </div>
            </div>

            <Separator className="dark:border-gray-700" />

            {/* Items Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Requisition Items</h3>
                <Badge variant="secondary" className="ml-1 rounded-full px-3 py-0.5">
                  {formData.items.filter(i => i.item_name.trim()).length}
                </Badge>
              </div>

              {/* Items Table Header */}
              <div className="grid grid-cols-12 gap-2 px-2 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-medium text-muted-foreground">
                <div className="col-span-1">#</div>
                <div className="col-span-3">Item Name <span className="text-red-500">*</span></div>
                <div className="col-span-3">Description</div>
                <div className="col-span-1 text-center">Qty <span className="text-red-500">*</span></div>
                <div className="col-span-1 text-center">Unit <span className="text-red-500">*</span></div>
                <div className="col-span-1 text-center">Unit Cost <span className="text-red-500">*</span></div>
                <div className="col-span-1 text-center">Total</div>
                <div className="col-span-1 text-right">Actions</div>
              </div>

              <div className="space-y-0">
                {sortedItems.map((item, index) => {
                  const realIndex = formData.items.indexOf(item);
                  const isFirst = index === 0 && !item.item_name.trim();
                  return (
                    <ItemRow
                      key={realIndex}
                      index={realIndex}
                      item={item}
                      onChange={handleItemChange}
                      onRemove={removeItem}
                      onAdd={addItem}
                      canRemove={formData.items.length > 1}
                      isFirst={isFirst}
                    />
                  );
                })}
              </div>

              {formErrors.items && (
                <p className="text-sm text-red-500">{formErrors.items}</p>
              )}

              {/* Total Summary */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Items: <span className="font-medium text-gray-700 dark:text-gray-300">{formData.items.filter(i => i.item_name.trim()).length}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Total Quantity: <span className="font-medium text-gray-700 dark:text-gray-300">
                      {formData.items.reduce((sum, i) => sum + (i.quantity || 0), 0)}
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Grand Total</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    KES {totalAmount.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <Separator className="dark:border-gray-700" />

            {/* Advanced Options Toggle */}
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full h-10 text-sm rounded-lg dark:border-gray-700 dark:hover:bg-gray-800 border-dashed hover:border-solid transition-all"
              disabled={isSubmitting || success || isCreating}
            >
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options'}
                {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </Button>

            {showAdvanced && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 p-4 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    Budget Code
                  </Label>
                  <Input
                    placeholder="Enter budget code"
                    value={formData.budget_code}
                    onChange={(e) => handleChange('budget_code', e.target.value)}
                    disabled={isSubmitting || success || isCreating}
                    className="h-10 text-sm rounded-lg dark:bg-gray-900 dark:border-gray-700"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    Budget Source
                  </Label>
                  <SimpleSelect
                    value={formData.budget_source || ''}
                    onValueChange={(value) => handleChange('budget_source', value)}
                    placeholder="Select budget source"
                    options={[
                      { value: 'recurrent', label: 'Recurrent' },
                      { value: 'development', label: 'Development' },
                      { value: 'donor', label: 'Donor Funded' },
                      { value: 'internal', label: 'Internal' },
                    ]}
                    disabled={isSubmitting || success || isCreating}
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    Funding Source
                  </Label>
                  <SimpleSelect
                    value={formData.funding_source || ''}
                    onValueChange={(value) => handleChange('funding_source', value)}
                    placeholder="Select funding source"
                    options={[
                      { value: 'government', label: 'Government' },
                      { value: 'donor', label: 'Donor' },
                      { value: 'internal', label: 'Internal' },
                      { value: 'private', label: 'Private Sector' },
                    ]}
                    disabled={isSubmitting || success || isCreating}
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    Project Code
                  </Label>
                  <Input
                    placeholder="Enter project code"
                    value={formData.project_code}
                    onChange={(e) => handleChange('project_code', e.target.value)}
                    disabled={isSubmitting || success || isCreating}
                    className="h-10 text-sm rounded-lg dark:bg-gray-900 dark:border-gray-700"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    Procurement Method
                  </Label>
                  <SimpleSelect
                    value={formData.procurement_method || ''}
                    onValueChange={(value) => handleChange('procurement_method', value)}
                    placeholder="Select procurement method"
                    options={[
                      { value: 'direct_purchase', label: 'Direct Purchase' },
                      { value: 'request_for_quotation', label: 'Request for Quotation' },
                      { value: 'tender', label: 'Tender' },
                      { value: 'framework_agreement', label: 'Framework Agreement' },
                      { value: 'emergency_procurement', label: 'Emergency Procurement' },
                    ]}
                    disabled={isSubmitting || success || isCreating}
                  />
                </div>

                <div className="space-y-1 flex items-end gap-3 pt-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="framework_agreement"
                      checked={formData.is_framework_agreement}
                      onChange={(e) => handleChange('is_framework_agreement', e.target.checked)}
                      disabled={isSubmitting || success || isCreating}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="framework_agreement" className="text-sm font-medium cursor-pointer text-gray-700 dark:text-gray-300">
                      Framework Agreement
                    </Label>
                  </div>
                  {formData.is_framework_agreement && (
                    <div className="flex-1">
                      <Input
                        placeholder="Framework ID"
                        value={formData.framework_agreement_id}
                        onChange={(e) => handleChange('framework_agreement_id', e.target.value)}
                        disabled={isSubmitting || success || isCreating}
                        className="h-10 text-sm rounded-lg dark:bg-gray-900 dark:border-gray-700"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    Risk Level
                  </Label>
                  <SimpleSelect
                    value={formData.risk_level}
                    onValueChange={(value) => handleChange('risk_level', value)}
                    placeholder="Select risk level"
                    options={[
                      { value: 'low', label: 'Low', color: 'text-emerald-500' },
                      { value: 'medium', label: 'Medium', color: 'text-amber-500' },
                      { value: 'high', label: 'High', color: 'text-red-500' },
                      { value: 'critical', label: 'Critical', color: 'text-red-600' },
                    ]}
                    disabled={isSubmitting || success || isCreating}
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    Risk Mitigation
                  </Label>
                  <Textarea
                    placeholder="Describe risk mitigation measures..."
                    value={formData.risk_mitigation}
                    onChange={(e) => handleChange('risk_mitigation', e.target.value)}
                    disabled={isSubmitting || success || isCreating}
                    className="min-h-[50px] resize-none text-sm rounded-lg dark:bg-gray-900 dark:border-gray-700"
                    rows={2}
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    Compliance Notes
                  </Label>
                  <Textarea
                    placeholder="Enter compliance notes..."
                    value={formData.compliance_notes}
                    onChange={(e) => handleChange('compliance_notes', e.target.value)}
                    disabled={isSubmitting || success || isCreating}
                    className="min-h-[50px] resize-none text-sm rounded-lg dark:bg-gray-900 dark:border-gray-700"
                    rows={2}
                  />
                </div>
              </div>
            )}

            <Separator className="dark:border-gray-700" />

            {/* Submit Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                type="submit"
                className="gap-2 px-8 min-w-[160px] h-11 text-base rounded-lg bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20"
                disabled={isSubmitting || success || isCreating}
              >
                {isSubmitting || isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Create Requisition
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/requisitions')}
                disabled={isSubmitting || success || isCreating}
                className="gap-2 h-11 rounded-lg dark:border-gray-700 dark:hover:bg-gray-800"
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
                  className="text-xs text-muted-foreground h-8 px-3 rounded-lg hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  Clear Draft
                </Button>
              )}
            </div>
          </form>
        </CardContent>

        <CardFooter className="border-t border-gray-200 dark:border-gray-700 py-3 px-6 bg-gray-50 dark:bg-gray-800/30 rounded-b-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-2">
            <p className="text-xs text-muted-foreground">
              <span className="text-red-500">*</span> Required fields. All requisitions go through an approval workflow.
            </p>
            <Badge variant="outline" className="text-[10px] rounded-full px-2.5 py-0 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400">
              <Shield className="h-3 w-3 mr-1" />
              Secure
            </Badge>
          </div>
        </CardFooter>
      </Card>
    </PageTemplate>
  );
}
