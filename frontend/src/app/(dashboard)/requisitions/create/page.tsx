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
import { Alert, AlertDescription } from '@/components/ui/alert';
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

// ============================================
// CONSTANTS
// ============================================

const STORAGE_KEY = 'requisition_draft_data';
const STORAGE_TIMESTAMP_KEY = 'requisition_draft_timestamp';
const DEBOUNCE_DELAY = 500;

// HOD role identifiers
const HOD_ROLES = ['hod', 'head_of_department'];

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

// Check if user is HOD
const isUserHOD = (user: any): boolean => {
  if (!user) return false;

  // Check roles array
  if (user.roles && Array.isArray(user.roles)) {
    return user.roles.some((r: any) =>
      HOD_ROLES.includes(r?.toLowerCase?.() || r?.name?.toLowerCase?.() || '')
    );
  }

  // Check single role
  if (user.role) {
    return HOD_ROLES.includes(user.role.toLowerCase());
  }

  return false;
};

// ✅ Find the department where the user is the HOD
const findUserHODDepartment = (user: any, departments: Department[]): Department | null => {
  if (!user || !departments || departments.length === 0) return null;

  // Find the department where hod_id matches the user's ID
  const hodDepartment = departments.find(dept => dept.hod_id === user.id);

  if (hodDepartment) {
    return hodDepartment;
  }

  // Fallback: check if user's department_id matches any department
  if (user.department_id) {
    const dept = departments.find(d => d.id === user.department_id);
    if (dept) return dept;
  }

  return null;
};

// ============================================
// MEMOIZED ITEM ROW COMPONENT
// ============================================

interface ItemRowProps {
  index: number;
  item: any;
  onChange: (index: number, field: string, value: any) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
  suppliers: any[];
}

const ItemRow = memo(({ index, item, onChange, onRemove, canRemove, suppliers }: ItemRowProps) => {
  const total = (item.quantity || 0) * (item.estimated_unit_cost || 0);

  const handleChange = useCallback((field: string, value: any) => {
    onChange(index, field, value);
  }, [index, onChange]);

  const handleRemove = useCallback(() => {
    onRemove(index);
  }, [index, onRemove]);

  return (
    <div className="border rounded-lg p-4 bg-card relative hover:shadow-sm transition-shadow">
      <div className="absolute top-2 right-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleRemove}
          disabled={!canRemove}
          className="h-7 w-7 p-0"
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-3 items-end">
        {/* Item Name */}
        <div className="col-span-12 md:col-span-3 space-y-1">
          <Label htmlFor={`item-${index}-name`} className="text-xs font-medium">
            Item Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id={`item-${index}-name`}
            placeholder="Enter item name"
            value={item.item_name || ''}
            onChange={(e) => handleChange('item_name', e.target.value)}
            className="h-10 text-sm"
          />
        </div>

        {/* Description */}
        <div className="col-span-12 md:col-span-3 space-y-1">
          <Label htmlFor={`item-${index}-desc`} className="text-xs font-medium">
            Description
          </Label>
          <Input
            id={`item-${index}-desc`}
            placeholder="Item description"
            value={item.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            className="h-10 text-sm"
          />
        </div>

        {/* Quantity */}
        <div className="col-span-4 md:col-span-1 space-y-1">
          <Label htmlFor={`item-${index}-qty`} className="text-xs font-medium">
            Qty <span className="text-red-500">*</span>
          </Label>
          <Input
            id={`item-${index}-qty`}
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0"
            value={item.quantity || ''}
            onChange={(e) => handleChange('quantity', parseFloat(e.target.value) || 0)}
            className="h-10 text-sm"
          />
        </div>

        {/* Unit of Measure */}
        <div className="col-span-4 md:col-span-1 space-y-1">
          <Label htmlFor={`item-${index}-unit`} className="text-xs font-medium">
            Unit <span className="text-red-500">*</span>
          </Label>
          <Input
            id={`item-${index}-unit`}
            placeholder="e.g., Each, Kg, L"
            value={item.unit_of_measure || ''}
            onChange={(e) => handleChange('unit_of_measure', e.target.value)}
            className="h-10 text-sm"
          />
        </div>

        {/* Unit Cost */}
        <div className="col-span-4 md:col-span-1 space-y-1">
          <Label htmlFor={`item-${index}-cost`} className="text-xs font-medium">
            Unit Cost <span className="text-red-500">*</span>
          </Label>
          <Input
            id={`item-${index}-cost`}
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={item.estimated_unit_cost || ''}
            onChange={(e) => handleChange('estimated_unit_cost', parseFloat(e.target.value) || 0)}
            className="h-10 text-sm"
          />
        </div>

        {/* Tax Rate */}
        <div className="col-span-3 md:col-span-1 space-y-1">
          <Label htmlFor={`item-${index}-tax`} className="text-xs font-medium">
            Tax %
          </Label>
          <Input
            id={`item-${index}-tax`}
            type="number"
            step="0.01"
            min="0"
            max="100"
            placeholder="0"
            value={item.tax_rate || 0}
            onChange={(e) => handleChange('tax_rate', parseFloat(e.target.value) || 0)}
            className="h-10 text-sm"
          />
        </div>

        {/* Discount */}
        <div className="col-span-3 md:col-span-1 space-y-1">
          <Label htmlFor={`item-${index}-discount`} className="text-xs font-medium">
            Discount %
          </Label>
          <Input
            id={`item-${index}-discount`}
            type="number"
            step="0.01"
            min="0"
            max="100"
            placeholder="0"
            value={item.discount_percentage || 0}
            onChange={(e) => handleChange('discount_percentage', parseFloat(e.target.value) || 0)}
            className="h-10 text-sm"
          />
        </div>

        {/* Total */}
        <div className="col-span-2 md:col-span-1 space-y-1">
          <Label className="text-xs font-medium text-muted-foreground">Total</Label>
          <div className="h-10 flex items-center text-sm font-semibold text-blue-600">
            KES {total.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Expandable details */}
      <details className="mt-3">
        <summary className="text-xs text-muted-foreground cursor-pointer hover:text-blue-600">
          More options
        </summary>
        <div className="mt-3 grid grid-cols-12 gap-3">
          <div className="col-span-12 md:col-span-4 space-y-1">
            <Label className="text-xs font-medium">Specifications</Label>
            <Input
              placeholder="Specifications"
              value={item.specifications || ''}
              onChange={(e) => handleChange('specifications', e.target.value)}
              className="h-10 text-sm"
            />
          </div>
          <div className="col-span-4 md:col-span-2 space-y-1">
            <Label className="text-xs font-medium">Catalog #</Label>
            <Input
              placeholder="Catalog"
              value={item.catalog_number || ''}
              onChange={(e) => handleChange('catalog_number', e.target.value)}
              className="h-10 text-sm"
            />
          </div>
          <div className="col-span-4 md:col-span-2 space-y-1">
            <Label className="text-xs font-medium">Manufacturer</Label>
            <Input
              placeholder="Manufacturer"
              value={item.manufacturer || ''}
              onChange={(e) => handleChange('manufacturer', e.target.value)}
              className="h-10 text-sm"
            />
          </div>
          <div className="col-span-4 md:col-span-2 space-y-1">
            <Label className="text-xs font-medium">Model</Label>
            <Input
              placeholder="Model"
              value={item.model_number || ''}
              onChange={(e) => handleChange('model_number', e.target.value)}
              className="h-10 text-sm"
            />
          </div>
          <div className="col-span-12 md:col-span-2 space-y-1">
            <Label className="text-xs font-medium">Supplier</Label>
            <Select
              value={item.supplier_id?.toString() || undefined}
              onValueChange={(value) => handleChange('supplier_id', value && value !== 'none' ? parseInt(value) : null)}
            >
              <SelectTrigger className="h-10 text-sm">
                <SelectValue placeholder="Supplier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {suppliers && suppliers.length > 0 && suppliers.map((s: any) => (
                  <SelectItem key={s.id} value={s.id.toString()}>
                    {s.company_name || s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-6 md:col-span-2 space-y-1 flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id={`item-${index}-inventory`}
              checked={item.is_inventory_item || false}
              onChange={(e) => handleChange('is_inventory_item', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <Label htmlFor={`item-${index}-inventory`} className="text-xs font-medium cursor-pointer">
              Inventory
            </Label>
          </div>
          {item.is_inventory_item && (
            <div className="col-span-6 md:col-span-2 space-y-1">
              <Label className="text-xs font-medium">Inventory Code</Label>
              <Input
                placeholder="Inv code"
                value={item.inventory_code || ''}
                onChange={(e) => handleChange('inventory_code', e.target.value)}
                className="h-10 text-sm"
              />
            </div>
          )}
        </div>
      </details>
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
    <Alert className="mb-6 border-amber-500 bg-amber-50 dark:bg-amber-950/20">
      <div className="flex items-start gap-3">
        <div className="p-1 rounded-full bg-amber-100 dark:bg-amber-900/30 mt-0.5">
          <RotateCcw className="h-4 w-4 text-amber-600" />
        </div>
        <div className="flex-1">
          <AlertDescription className="text-amber-800 dark:text-amber-300">
            <span className="font-medium">Draft found!</span> You have an unsaved requisition draft from{' '}
            <span className="font-medium">{timeString}</span>.
          </AlertDescription>
          <div className="flex gap-3 mt-2">
            <Button
              size="sm"
              variant="default"
              onClick={onRestore}
              className="gap-1.5 h-8"
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
              className="h-8"
            >
              Discard Draft
            </Button>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsVisible(false)}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Alert>
  );
});

DraftRestoreAlert.displayName = 'DraftRestoreAlert';

// ============================================
// MAIN COMPONENT
// ============================================

export default function CreateRequisitionPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthContext();
  const { mutate: createRequisition, isPending: isCreating } = useCreateRequisition();

  // Use the hooks correctly
  const { useAllDepartments } = useDepartments();
  const { useAllSuppliers } = useSuppliers();

  const { data: departmentsData, isLoading: departmentsLoading } = useAllDepartments();
  const { data: suppliersData, isLoading: suppliersLoading } = useAllSuppliers();

  // Memoize departments and suppliers - handle both array and object responses
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

  // ✅ Check if user is HOD
  const isHOD = useMemo(() => isUserHOD(user), [user]);

  // ✅ Find the department where the user is the HOD (via hod_id in departments)
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

  // Auto-generate requisition number
  const [requisitionNumber] = useState(generateRequisitionNumber);

  // ✅ Get user's department ID - for HOD, use the department where they are hod_id
  const userDepartmentId = useMemo(() => {
    if (isHOD && hodDepartment) {
      return hodDepartment.id.toString();
    }
    if (user?.department_id) {
      return user.department_id.toString();
    }
    return '';
  }, [isHOD, hodDepartment, user]);

  // ✅ Get the department name for display
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

  // Default form state - memoized
  const getDefaultFormState = useCallback(() => ({
    requester_name: user?.full_name || user?.email || '',
    requester_email: user?.email || '',
    requisition_number: requisitionNumber,
    title: '',
    description: '',
    // ✅ For HOD users, lock to their department (found via hod_id)
    department_id: isHOD ? userDepartmentId : '',
    supplier_id: '',
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
        supplier_id: null as number | null,
        is_inventory_item: false,
        inventory_code: '',
        tax_rate: 0,
        discount_percentage: 0,
      },
    ],
  }), [user, requisitionNumber, isHOD, userDepartmentId]);

  // Form state
  const [formData, setFormData] = useState(getDefaultFormState);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Check authentication
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    setIsPageLoading(false);
  }, [authLoading, isAuthenticated, router]);

  // ✅ FIXED: Only show error if HOD, departments are loaded, AND no department found
  useEffect(() => {
    // Only run this check after departments have finished loading
    if (!isPageLoading && user && isHOD && !departmentsLoading) {
      if (!userDepartmentId) {
        setError('You are not assigned as HOD to any department. Please contact your administrator.');
      } else {
        // Clear error if department is found
        setError(null);
      }
    }
  }, [isPageLoading, user, isHOD, userDepartmentId, departmentsLoading]);

  // Load draft from localStorage on mount
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

  // Debounced save to localStorage
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

  // Restore draft
  const restoreDraft = useCallback(() => {
    const savedData = loadFromLocalStorage();
    if (savedData) {
      // ✅ For HOD users, ensure department is set correctly
      if (isHOD && userDepartmentId) {
        savedData.department_id = userDepartmentId;
      }
      setFormData(savedData);
      setHasDraft(false);
    }
  }, [isHOD, userDepartmentId]);

  // Discard draft
  const discardDraft = useCallback(() => {
    clearLocalStorage();
    setHasDraft(false);
    setDraftTimestamp(null);
    setFormData(getDefaultFormState());
  }, [getDefaultFormState]);

  // Update form data with preloaded user info
  useEffect(() => {
    if (user && isInitialLoad) {
      setFormData(prev => ({
        ...prev,
        requester_name: user.full_name || user.email || '',
        requester_email: user.email || '',
        // ✅ For HOD users, lock to their department
        department_id: isHOD ? userDepartmentId : prev.department_id,
      }));
    }
  }, [user, isInitialLoad, isHOD, userDepartmentId]);

  // Memoized handlers
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
          supplier_id: null,
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

  // Memoized total amount calculation
  const totalAmount = useMemo(() => {
    return formData.items.reduce((sum, item) => {
      return sum + ((item.quantity || 0) * (item.estimated_unit_cost || 0));
    }, 0);
  }, [formData.items]);

  // Validate form
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

  // Submit handler
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
      supplier_id: formData.supplier_id ? parseInt(formData.supplier_id) : undefined,
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
          supplier_id: item.supplier_id || undefined,
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

  // Loading state
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

  // Redirect if no user
  if (!user) {
    return null;
  }

  // ✅ If HOD and no department (after loading is complete), show error
  if (isHOD && !departmentsLoading && !userDepartmentId) {
    return (
      <PageTemplate
        title="Create New Requisition"
        description="Fill in the details below to create a new requisition request"
        icon={<List className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />}
      >
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You are not assigned as HOD to any department. Please contact your administrator to set up your department.
              </AlertDescription>
            </Alert>
            <div className="flex justify-center mt-6">
              <Button onClick={() => router.push('/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
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
      actions={
        <div className="flex items-center gap-2">
          {hasDraft && (
            <Badge variant="warning" className="gap-1.5">
              <RotateCcw className="h-3 w-3" />
              Draft Available
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/requisitions')}
            className="gap-2 h-9"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Requisitions
          </Button>
        </div>
      }
    >
      {/* Form Card */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4 border-b">
          <CardTitle className="flex items-center gap-2.5 text-xl">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            Requisition Details
          </CardTitle>
          <CardDescription className="text-sm">
            Enter all required information for your requisition request
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 border-green-500 bg-green-50 dark:bg-green-900/20">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-700 dark:text-green-300 font-medium">
                Requisition created successfully! Redirecting...
              </AlertDescription>
            </Alert>
          )}

          {/* Draft Restore Alert */}
          {hasDraft && !success && (
            <DraftRestoreAlert
              onRestore={restoreDraft}
              onDiscard={discardDraft}
              timestamp={draftTimestamp}
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ============================================
                REQUESTER INFORMATION - Preloaded
                ============================================ */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg border">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Requisition Number</Label>
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <Input
                    value={formData.requisition_number}
                    readOnly
                    className="h-10 text-sm font-mono bg-muted/50 border-muted-foreground/20"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Requester Name</Label>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <Input
                    value={formData.requester_name}
                    readOnly
                    className="h-10 text-sm bg-muted/50 border-muted-foreground/20"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Requester Email</Label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Input
                    value={formData.requester_email}
                    readOnly
                    className="h-10 text-sm bg-muted/50 border-muted-foreground/20"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* ============================================
                BASIC INFORMATION
                ============================================ */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-500" />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title - Full width */}
                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="title" className="flex items-center gap-2 text-sm font-medium">
                    Requisition Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="Enter a clear and descriptive requisition title (e.g., 'Office Supplies for Q4 2024')"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    disabled={isSubmitting || success || isCreating}
                    className={cn(
                      "h-11 text-base",
                      formErrors.title && "border-red-500 focus-visible:ring-red-500"
                    )}
                  />
                  {formErrors.title && <p className="text-sm text-red-500">{formErrors.title}</p>}
                </div>

                {/* Department - HOD users have this locked */}
                <div className="space-y-1.5">
                  <Label htmlFor="department_id" className="flex items-center gap-2 text-sm font-medium">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    Department <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.department_id || undefined}
                    onValueChange={(value) => {
                      // ✅ For HOD users, prevent changing department
                      if (isHOD) {
                        return;
                      }
                      handleChange('department_id', value);
                    }}
                    disabled={isHOD || isSubmitting || success || isCreating}
                  >
                    <SelectTrigger className={cn(
                      "h-11 text-base",
                      isHOD && "bg-muted/50 cursor-not-allowed opacity-80",
                      formErrors.department_id && "border-red-500"
                    )}>
                      <SelectValue placeholder={isHOD ? `${userDepartmentName} (locked)` : "Select department"} />
                    </SelectTrigger>
                    <SelectContent>
                      {isHOD && userDepartmentId && departments.find(d => d.id.toString() === userDepartmentId) && (
                        <SelectItem value={userDepartmentId}>
                          {departments.find(d => d.id.toString() === userDepartmentId)?.name || 'Your Department'}
                          <Badge variant="secondary" className="ml-2 text-[10px]">HOD</Badge>
                        </SelectItem>
                      )}
                      {!isHOD && departments.length > 0 && departments.map((dept: Department) => (
                        <SelectItem key={dept.id} value={dept.id.toString()}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isHOD && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      As HOD, you can only create requisitions for your department: <strong>{userDepartmentName}</strong>
                    </p>
                  )}
                  {formErrors.department_id && <p className="text-sm text-red-500">{formErrors.department_id}</p>}
                </div>

                {/* Preferred Supplier */}
                <div className="space-y-1.5">
                  <Label htmlFor="supplier_id" className="flex items-center gap-2 text-sm font-medium">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    Preferred Supplier
                  </Label>
                  <Select
                    value={formData.supplier_id || undefined}
                    onValueChange={(value) => handleChange('supplier_id', value)}
                    disabled={isSubmitting || success || isCreating}
                  >
                    <SelectTrigger className="h-11 text-base">
                      <SelectValue placeholder="Select supplier (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {suppliers.length > 0 && suppliers.map((supplier: any) => (
                        <SelectItem key={supplier.id} value={supplier.id.toString()}>
                          {supplier.company_name || supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Priority */}
                <div className="space-y-1.5">
                  <Label htmlFor="priority" className="flex items-center gap-2 text-sm font-medium">
                    <AlertCircle className="h-4 w-4 text-gray-400" />
                    Priority
                  </Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => handleChange('priority', value)}
                    disabled={isSubmitting || success || isCreating}
                  >
                    <SelectTrigger className="h-11 text-base">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Type */}
                <div className="space-y-1.5">
                  <Label htmlFor="type" className="flex items-center gap-2 text-sm font-medium">
                    <Tag className="h-4 w-4 text-gray-400" />
                    Type
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleChange('type', value)}
                    disabled={isSubmitting || success || isCreating}
                  >
                    <SelectTrigger className="h-11 text-base">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Urgency */}
                <div className="space-y-1.5">
                  <Label htmlFor="urgency" className="flex items-center gap-2 text-sm font-medium">
                    <AlertCircle className="h-4 w-4 text-gray-400" />
                    Urgency
                  </Label>
                  <Select
                    value={formData.urgency}
                    onValueChange={(value) => handleChange('urgency', value)}
                    disabled={isSubmitting || success || isCreating}
                  >
                    <SelectTrigger className="h-11 text-base">
                      <SelectValue placeholder="Select urgency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="routine">Routine</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Required By Date */}
                <div className="space-y-1.5">
                  <Label htmlFor="required_by_date" className="flex items-center gap-2 text-sm font-medium">
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                    Required By Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal h-11 text-base",
                          !formData.required_by_date && "text-muted-foreground"
                        )}
                        disabled={isSubmitting || success || isCreating}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.required_by_date ? format(new Date(formData.required_by_date), "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={formData.required_by_date ? new Date(formData.required_by_date) : undefined}
                        onSelect={(date) => handleChange('required_by_date', date ? format(date, 'yyyy-MM-dd') : '')}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Required Delivery Date */}
                <div className="space-y-1.5">
                  <Label htmlFor="required_delivery_date" className="flex items-center gap-2 text-sm font-medium">
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                    Required Delivery Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal h-11 text-base",
                          !formData.required_delivery_date && "text-muted-foreground"
                        )}
                        disabled={isSubmitting || success || isCreating}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.required_delivery_date ? format(new Date(formData.required_delivery_date), "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={formData.required_delivery_date ? new Date(formData.required_delivery_date) : undefined}
                        onSelect={(date) => handleChange('required_delivery_date', date ? format(date, 'yyyy-MM-dd') : '')}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor="description" className="flex items-center gap-2 text-sm font-medium">
                  <Info className="h-4 w-4 text-gray-400" />
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Enter detailed description of the requisition..."
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  disabled={isSubmitting || success || isCreating}
                  className="min-h-[100px] resize-none text-base"
                  rows={4}
                />
              </div>

              {/* Justification */}
              <div className="space-y-1.5">
                <Label htmlFor="justification" className="flex items-center gap-2 text-sm font-medium">
                  <FileText className="h-4 w-4 text-gray-400" />
                  Justification
                </Label>
                <Textarea
                  id="justification"
                  placeholder="Explain why this requisition is needed..."
                  value={formData.justification}
                  onChange={(e) => handleChange('justification', e.target.value)}
                  disabled={isSubmitting || success || isCreating}
                  className="min-h-[80px] resize-none text-base"
                  rows={3}
                />
              </div>
            </div>

            <Separator />

            {/* ============================================
                ITEMS SECTION
                ============================================ */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold">Requisition Items</h3>
                  <Badge variant="secondary" className="ml-2">
                    {formData.items.filter(i => i.item_name.trim()).length} items
                  </Badge>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                  disabled={isSubmitting || success || isCreating}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Item
                </Button>
              </div>

              {/* Column Headers */}
              <div className="grid grid-cols-12 gap-3 px-1 text-xs font-medium text-muted-foreground">
                <div className="col-span-12 md:col-span-3">Item Name *</div>
                <div className="col-span-12 md:col-span-3">Description</div>
                <div className="col-span-4 md:col-span-1">Qty *</div>
                <div className="col-span-4 md:col-span-1">Unit *</div>
                <div className="col-span-4 md:col-span-1">Unit Cost *</div>
                <div className="col-span-3 md:col-span-1">Tax %</div>
                <div className="col-span-3 md:col-span-1">Discount %</div>
                <div className="col-span-2 md:col-span-1 text-right">Total</div>
              </div>

              <div className="space-y-3">
                {formData.items.map((item, index) => (
                  <ItemRow
                    key={index}
                    index={index}
                    item={item}
                    onChange={handleItemChange}
                    onRemove={removeItem}
                    canRemove={formData.items.length > 1}
                    suppliers={suppliers}
                  />
                ))}
              </div>

              {formErrors.items && (
                <p className="text-sm text-red-500">{formErrors.items}</p>
              )}

              {/* Total Summary */}
              <div className="flex justify-between items-center pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Items: <span className="font-medium">{formData.items.filter(i => i.item_name.trim()).length}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Grand Total</p>
                  <p className="text-2xl font-bold text-blue-600">
                    KES {totalAmount.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* ============================================
                ADVANCED OPTIONS
                ============================================ */}
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full h-11 text-base"
              disabled={isSubmitting || success || isCreating}
            >
              {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options'}
            </Button>

            {showAdvanced && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                {/* Budget Code */}
                <div className="space-y-1.5">
                  <Label htmlFor="budget_code" className="flex items-center gap-2 text-sm font-medium">
                    <Hash className="h-4 w-4 text-gray-400" />
                    Budget Code
                  </Label>
                  <Input
                    id="budget_code"
                    placeholder="Enter budget code"
                    value={formData.budget_code}
                    onChange={(e) => handleChange('budget_code', e.target.value)}
                    disabled={isSubmitting || success || isCreating}
                    className="h-11 text-base"
                  />
                </div>

                {/* Budget Source */}
                <div className="space-y-1.5">
                  <Label htmlFor="budget_source" className="flex items-center gap-2 text-sm font-medium">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    Budget Source
                  </Label>
                  <Select
                    value={formData.budget_source || undefined}
                    onValueChange={(value) => handleChange('budget_source', value)}
                    disabled={isSubmitting || success || isCreating}
                  >
                    <SelectTrigger className="h-11 text-base">
                      <SelectValue placeholder="Select budget source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recurrent">Recurrent</SelectItem>
                      <SelectItem value="development">Development</SelectItem>
                      <SelectItem value="donor">Donor Funded</SelectItem>
                      <SelectItem value="internal">Internal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Funding Source */}
                <div className="space-y-1.5">
                  <Label htmlFor="funding_source" className="flex items-center gap-2 text-sm font-medium">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    Funding Source
                  </Label>
                  <Select
                    value={formData.funding_source || undefined}
                    onValueChange={(value) => handleChange('funding_source', value)}
                    disabled={isSubmitting || success || isCreating}
                  >
                    <SelectTrigger className="h-11 text-base">
                      <SelectValue placeholder="Select funding source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="government">Government</SelectItem>
                      <SelectItem value="donor">Donor</SelectItem>
                      <SelectItem value="internal">Internal</SelectItem>
                      <SelectItem value="private">Private Sector</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Project Code */}
                <div className="space-y-1.5">
                  <Label htmlFor="project_code" className="flex items-center gap-2 text-sm font-medium">
                    <Hash className="h-4 w-4 text-gray-400" />
                    Project Code
                  </Label>
                  <Input
                    id="project_code"
                    placeholder="Enter project code"
                    value={formData.project_code}
                    onChange={(e) => handleChange('project_code', e.target.value)}
                    disabled={isSubmitting || success || isCreating}
                    className="h-11 text-base"
                  />
                </div>

                {/* Procurement Method */}
                <div className="space-y-1.5">
                  <Label htmlFor="procurement_method" className="flex items-center gap-2 text-sm font-medium">
                    <Briefcase className="h-4 w-4 text-gray-400" />
                    Procurement Method
                  </Label>
                  <Select
                    value={formData.procurement_method || undefined}
                    onValueChange={(value) => handleChange('procurement_method', value)}
                    disabled={isSubmitting || success || isCreating}
                  >
                    <SelectTrigger className="h-11 text-base">
                      <SelectValue placeholder="Select procurement method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="direct_purchase">Direct Purchase</SelectItem>
                      <SelectItem value="request_for_quotation">Request for Quotation</SelectItem>
                      <SelectItem value="tender">Tender</SelectItem>
                      <SelectItem value="framework_agreement">Framework Agreement</SelectItem>
                      <SelectItem value="emergency_procurement">Emergency Procurement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Framework Agreement */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3 pt-2">
                    <input
                      type="checkbox"
                      id="framework_agreement"
                      checked={formData.is_framework_agreement}
                      onChange={(e) => handleChange('is_framework_agreement', e.target.checked)}
                      disabled={isSubmitting || success || isCreating}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="framework_agreement" className="text-sm font-medium cursor-pointer">
                      Framework Agreement
                    </Label>
                  </div>
                </div>

                {/* Framework Agreement ID */}
                {formData.is_framework_agreement && (
                  <div className="space-y-1.5">
                    <Label htmlFor="framework_agreement_id" className="flex items-center gap-2 text-sm font-medium">
                      <Hash className="h-4 w-4 text-gray-400" />
                      Framework Agreement ID
                    </Label>
                    <Input
                      id="framework_agreement_id"
                      placeholder="Enter framework agreement ID"
                      value={formData.framework_agreement_id}
                      onChange={(e) => handleChange('framework_agreement_id', e.target.value)}
                      disabled={isSubmitting || success || isCreating}
                      className="h-11 text-base"
                    />
                  </div>
                )}

                {/* Risk Level */}
                <div className="space-y-1.5">
                  <Label htmlFor="risk_level" className="flex items-center gap-2 text-sm font-medium">
                    <AlertCircle className="h-4 w-4 text-gray-400" />
                    Risk Level
                  </Label>
                  <Select
                    value={formData.risk_level}
                    onValueChange={(value) => handleChange('risk_level', value)}
                    disabled={isSubmitting || success || isCreating}
                  >
                    <SelectTrigger className="h-11 text-base">
                      <SelectValue placeholder="Select risk level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Risk Mitigation */}
                <div className="space-y-1.5">
                  <Label htmlFor="risk_mitigation" className="flex items-center gap-2 text-sm font-medium">
                    <Shield className="h-4 w-4 text-gray-400" />
                    Risk Mitigation
                  </Label>
                  <Textarea
                    id="risk_mitigation"
                    placeholder="Describe risk mitigation measures..."
                    value={formData.risk_mitigation}
                    onChange={(e) => handleChange('risk_mitigation', e.target.value)}
                    disabled={isSubmitting || success || isCreating}
                    className="min-h-[60px] resize-none text-base"
                    rows={2}
                  />
                </div>

                {/* Compliance Notes */}
                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="compliance_notes" className="flex items-center gap-2 text-sm font-medium">
                    <CheckCircle className="h-4 w-4 text-gray-400" />
                    Compliance Notes
                  </Label>
                  <Textarea
                    id="compliance_notes"
                    placeholder="Enter compliance notes..."
                    value={formData.compliance_notes}
                    onChange={(e) => handleChange('compliance_notes', e.target.value)}
                    disabled={isSubmitting || success || isCreating}
                    className="min-h-[60px] resize-none text-base"
                    rows={2}
                  />
                </div>
              </div>
            )}

            <Separator />

            {/* Submit Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                type="submit"
                className="gap-2 px-8 min-w-[160px] h-11 text-base"
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
                className="gap-2 h-11"
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
                  className="text-xs text-muted-foreground h-7 px-2"
                >
                  Clear Draft
                </Button>
              )}
            </div>
          </form>
        </CardContent>
        <CardFooter className="border-t border-gray-200 dark:border-gray-700 py-4 px-6 bg-gray-50 dark:bg-gray-800/50 rounded-b-xl">
          <div className="flex justify-between items-center w-full">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              <span className="text-red-500">*</span> Required fields. All requisitions go through an approval workflow.
            </p>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Badge variant="outline" className="text-[10px]">
                  Auto-save
                </Badge>
              </span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </PageTemplate>
  );
}
