// frontend/src/app/(dashboard)/requisitions/[id]/edit/page.tsx

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  X,
  Plus,
  Trash2,
  Package,
  Building2,
  FileText,
  Hash,
  DollarSign,
  User,
  Mail,
  Calendar as CalendarIcon,
  Info,
  AlertCircle,
  Loader2,
  CheckCircle,
  Tag,
  Box,
  Truck,
  Layers,
  Briefcase,
  Shield,
  HelpCircle,
  MinusCircle,
  Flame,
  Leaf,
  Zap,
  Clock,
  TrendingUp,
  RefreshCw,
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
import { PageTemplate } from '@/components/dashboard/PageTemplate';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

// Hooks
import { useAuthContext } from '@/contexts/AuthContext';
import { useRequisition } from '@/hooks/useRequisitionQueries';
import { useUpdateRequisition } from '@/hooks/useRequisitionMutations';
import { useDepartments } from '@/hooks/useDepartments';
import { useSuppliers } from '@/hooks/useSuppliers';

// Types
import type { Department } from '@/types/common.types';
import type { UpdateRequisitionData } from '@/types/requisition.types';

// ============================================
// CONSTANTS
// ============================================

const UNITS = [
  { value: 'each', label: 'Each' },
  { value: 'box', label: 'Box' },
  { value: 'carton', label: 'Carton' },
  { value: 'kg', label: 'Kilogram (kg)' },
  { value: 'g', label: 'Gram (g)' },
  { value: 'l', label: 'Litre (L)' },
  { value: 'ml', label: 'Millilitre (ml)' },
  { value: 'm', label: 'Metre (m)' },
  { value: 'cm', label: 'Centimetre (cm)' },
  { value: 'piece', label: 'Piece' },
  { value: 'set', label: 'Set' },
  { value: 'pack', label: 'Pack' },
  { value: 'roll', label: 'Roll' },
  { value: 'ream', label: 'Ream' },
  { value: 'dozen', label: 'Dozen' },
  { value: 'pair', label: 'Pair' },
  { value: 'bundle', label: 'Bundle' },
  { value: 'case', label: 'Case' },
  { value: 'bottle', label: 'Bottle' },
  { value: 'tin', label: 'Tin' },
  { value: 'bag', label: 'Bag' },
  { value: 'sack', label: 'Sack' },
  { value: 'drum', label: 'Drum' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', icon: Leaf },
  { value: 'medium', label: 'Medium', icon: MinusCircle },
  { value: 'high', label: 'High', icon: Flame },
  { value: 'emergency', label: 'Emergency', icon: Zap },
];

const URGENCY_OPTIONS = [
  { value: 'routine', label: 'Routine' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'critical', label: 'Critical' },
];

const TYPE_OPTIONS = [
  { value: 'normal', label: 'Normal' },
  { value: 'emergency', label: 'Emergency' },
];

const RISK_LEVELS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

const BUDGET_SOURCES = [
  { value: 'recurrent', label: 'Recurrent' },
  { value: 'development', label: 'Development' },
  { value: 'donor', label: 'Donor Funded' },
  { value: 'internal', label: 'Internal' },
];

const FUNDING_SOURCES = [
  { value: 'government', label: 'Government' },
  { value: 'donor', label: 'Donor' },
  { value: 'internal', label: 'Internal' },
  { value: 'private', label: 'Private Sector' },
];

const PROCUREMENT_METHODS = [
  { value: 'direct_purchase', label: 'Direct Purchase' },
  { value: 'request_for_quotation', label: 'Request for Quotation' },
  { value: 'tender', label: 'Tender' },
  { value: 'framework_agreement', label: 'Framework Agreement' },
  { value: 'emergency_procurement', label: 'Emergency Procurement' },
];

// ============================================
// ITEM ROW COMPONENT
// ============================================

interface ItemRowProps {
  index: number;
  item: any;
  onChange: (index: number, field: string, value: any) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
  suppliers: any[];
}

const ItemRow = ({ index, item, onChange, onRemove, canRemove, suppliers }: ItemRowProps) => {
  const total = (item.quantity || 0) * (item.estimated_unit_cost || 0);

  return (
    <div className="border rounded-lg p-4 bg-card relative hover:shadow-sm transition-shadow group">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onRemove(index)}
        disabled={!canRemove}
        className="absolute top-2 right-2 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>

      <div className="grid grid-cols-12 gap-3 items-end">
        <div className="col-span-12 md:col-span-3 space-y-1">
          <Label className="text-xs font-medium">
            Item Name <span className="text-red-500">*</span>
          </Label>
          <Input
            placeholder="Enter item name"
            value={item.item_name || ''}
            onChange={(e) => onChange(index, 'item_name', e.target.value)}
            className="h-10 text-sm"
          />
        </div>

        <div className="col-span-12 md:col-span-3 space-y-1">
          <Label className="text-xs font-medium">Description</Label>
          <Input
            placeholder="Item description"
            value={item.description || ''}
            onChange={(e) => onChange(index, 'description', e.target.value)}
            className="h-10 text-sm"
          />
        </div>

        <div className="col-span-3 md:col-span-1 space-y-1">
          <Label className="text-xs font-medium">
            Qty <span className="text-red-500">*</span>
          </Label>
          <Input
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0"
            value={item.quantity || ''}
            onChange={(e) => onChange(index, 'quantity', parseFloat(e.target.value) || 0)}
            className="h-10 text-sm"
          />
        </div>

        <div className="col-span-3 md:col-span-1 space-y-1">
          <Label className="text-xs font-medium">
            Unit <span className="text-red-500">*</span>
          </Label>
          <Select
            value={item.unit_of_measure || undefined}
            onValueChange={(value) => onChange(index, 'unit_of_measure', value)}
          >
            <SelectTrigger className="h-10 text-sm">
              <SelectValue placeholder="Unit" />
            </SelectTrigger>
            <SelectContent>
              {UNITS.map((unit) => (
                <SelectItem key={unit.value} value={unit.value}>
                  {unit.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-3 md:col-span-1 space-y-1">
          <Label className="text-xs font-medium">
            Unit Cost <span className="text-red-500">*</span>
          </Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={item.estimated_unit_cost || ''}
            onChange={(e) => onChange(index, 'estimated_unit_cost', parseFloat(e.target.value) || 0)}
            className="h-10 text-sm"
          />
        </div>

        <div className="col-span-3 md:col-span-1 space-y-1">
          <Label className="text-xs font-medium">Tax %</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            max="100"
            placeholder="0"
            value={item.tax_rate || 0}
            onChange={(e) => onChange(index, 'tax_rate', parseFloat(e.target.value) || 0)}
            className="h-10 text-sm"
          />
        </div>

        <div className="col-span-3 md:col-span-1 space-y-1">
          <Label className="text-xs font-medium">Discount %</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            max="100"
            placeholder="0"
            value={item.discount_percentage || 0}
            onChange={(e) => onChange(index, 'discount_percentage', parseFloat(e.target.value) || 0)}
            className="h-10 text-sm"
          />
        </div>

        <div className="col-span-2 md:col-span-1 space-y-1">
          <Label className="text-xs font-medium text-muted-foreground">Total</Label>
          <div className="h-10 flex items-center text-sm font-semibold text-blue-600">
            {total.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Expandable details */}
      <details className="mt-3">
        <summary className="text-xs text-muted-foreground cursor-pointer hover:text-blue-600 transition-colors">
          More options
        </summary>
        <div className="mt-3 grid grid-cols-12 gap-3">
          <div className="col-span-12 md:col-span-3 space-y-1">
            <Label className="text-xs font-medium">Specifications</Label>
            <Input
              placeholder="Specifications"
              value={item.specifications || ''}
              onChange={(e) => onChange(index, 'specifications', e.target.value)}
              className="h-9 text-sm"
            />
          </div>
          <div className="col-span-4 md:col-span-2 space-y-1">
            <Label className="text-xs font-medium">Catalog #</Label>
            <Input
              placeholder="Catalog"
              value={item.catalog_number || ''}
              onChange={(e) => onChange(index, 'catalog_number', e.target.value)}
              className="h-9 text-sm"
            />
          </div>
          <div className="col-span-4 md:col-span-2 space-y-1">
            <Label className="text-xs font-medium">Manufacturer</Label>
            <Input
              placeholder="Manufacturer"
              value={item.manufacturer || ''}
              onChange={(e) => onChange(index, 'manufacturer', e.target.value)}
              className="h-9 text-sm"
            />
          </div>
          <div className="col-span-4 md:col-span-2 space-y-1">
            <Label className="text-xs font-medium">Model</Label>
            <Input
              placeholder="Model"
              value={item.model_number || ''}
              onChange={(e) => onChange(index, 'model_number', e.target.value)}
              className="h-9 text-sm"
            />
          </div>
          <div className="col-span-12 md:col-span-2 space-y-1">
            <Label className="text-xs font-medium">Supplier</Label>
            <Select
              value={item.supplier_id?.toString() || undefined}
              onValueChange={(value) => onChange(index, 'supplier_id', value && value !== 'none' ? parseInt(value) : null)}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Supplier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {suppliers.map((s: any) => (
                  <SelectItem key={s.id} value={s.id.toString()}>
                    {s.company_name || s.name || 'Unknown'}
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
              onChange={(e) => onChange(index, 'is_inventory_item', e.target.checked)}
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
                onChange={(e) => onChange(index, 'inventory_code', e.target.value)}
                className="h-9 text-sm"
              />
            </div>
          )}
        </div>
      </details>
    </div>
  );
};

// ============================================
// MAIN PAGE COMPONENT
// ============================================

export default function EditRequisitionPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);
  const { user } = useAuthContext();

  // Hooks
  const { data: requisition, isLoading, error, refetch } = useRequisition(id);
  const { mutate: updateRequisition, isPending: isUpdating } = useUpdateRequisition();
  const { useAllDepartments } = useDepartments();
  const { useAllSuppliers } = useSuppliers();

  const { data: departmentsData, isLoading: departmentsLoading } = useAllDepartments();
  const { data: suppliersData, isLoading: suppliersLoading } = useAllSuppliers();

  // Memoize departments and suppliers
  const departments = useMemo(() => {
    if (!departmentsData) return [];
    if (Array.isArray(departmentsData)) return departmentsData;
    // @ts-ignore - handle different response shapes
    if (departmentsData?.data && Array.isArray(departmentsData.data)) return departmentsData.data;
    // @ts-ignore
    if (departmentsData?.items && Array.isArray(departmentsData.items)) return departmentsData.items;
    return [];
  }, [departmentsData]);

  const suppliers = useMemo(() => {
    if (!suppliersData) return [];
    if (Array.isArray(suppliersData)) return suppliersData;
    // @ts-ignore - handle different response shapes
    if (suppliersData?.data && Array.isArray(suppliersData.data)) return suppliersData.data;
    // @ts-ignore
    if (suppliersData?.items && Array.isArray(suppliersData.items)) return suppliersData.items;
    return [];
  }, [suppliersData]);

  // State
  const [formData, setFormData] = useState<any>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [success, setSuccess] = useState(false);

  // Initialize form data from requisition
  useEffect(() => {
    if (requisition) {
      // Check if requisition is editable
      if (!requisition.is_editable) {
        router.push(`/requisitions/${id}`);
        return;
      }

      setFormData({
        title: requisition.title || '',
        description: requisition.description || '',
        department_id: requisition.department?.id?.toString() || '',
        supplier_id: requisition.supplier?.id?.toString() || '',
        priority: requisition.priority || 'medium',
        type: requisition.type || 'normal',
        urgency: requisition.urgency || 'routine',
        justification: requisition.justification || '',
        required_by_date: requisition.required_by_date || '',
        required_delivery_date: requisition.required_delivery_date || '',
        budget_code: requisition.budget_code || '',
        budget_source: requisition.budget_source || '',
        funding_source: requisition.funding_source || '',
        project_code: requisition.project_code || '',
        procurement_method: requisition.procurement_method || '',
        is_framework_agreement: requisition.is_framework_agreement || false,
        framework_agreement_id: requisition.framework_agreement_id || '',
        risk_level: requisition.risk_level || 'low',
        risk_mitigation: requisition.risk_mitigation || '',
        is_compliant: requisition.is_compliant ?? true,
        compliance_notes: requisition.compliance_notes || '',
        currency: requisition.currency || 'KES',
        exchange_rate: requisition.exchange_rate || 1,
        items: requisition.items?.map((item: any) => ({
          id: item.id,
          item_name: item.item_name || '',
          description: item.description || '',
          unit_of_measure: item.unit_of_measure || '',
          quantity: item.quantity || 1,
          estimated_unit_cost: item.estimated_unit_cost || 0,
          specifications: item.specifications || '',
          catalog_number: item.catalog_number || '',
          manufacturer: item.manufacturer || '',
          model_number: item.model_number || '',
          supplier_id: item.supplier_id || null,
          is_inventory_item: item.is_inventory_item || false,
          inventory_code: item.inventory_code || '',
          tax_rate: item.tax_rate || 0,
          discount_percentage: item.discount_percentage || 0,
        })) || [
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
      });
    }
  }, [requisition, id, router]);

  // Handle form field changes
  const handleChange = useCallback((field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: '' }));
    }
  }, [formErrors]);

  // Handle item changes
  const handleItemChange = useCallback((index: number, field: string, value: any) => {
    setFormData((prev: any) => {
      const updatedItems = [...prev.items];
      updatedItems[index] = { ...updatedItems[index], [field]: value };
      return { ...prev, items: updatedItems };
    });
  }, []);

  // Add item
  const addItem = useCallback(() => {
    setFormData((prev: any) => ({
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

  // Remove item
  const removeItem = useCallback((index: number) => {
    setFormData((prev: any) => {
      if (prev.items.length <= 1) return prev;
      const updatedItems = prev.items.filter((_: any, i: number) => i !== index);
      return { ...prev, items: updatedItems };
    });
  }, []);

  // Calculate total amount
  const totalAmount = useMemo(() => {
    if (!formData?.items) return 0;
    return formData.items.reduce((sum: number, item: any) => {
      return sum + ((item.quantity || 0) * (item.estimated_unit_cost || 0));
    }, 0);
  }, [formData]);

  // Validate form
  const validateForm = useCallback(() => {
    const errors: Record<string, string> = {};

    if (!formData?.title?.trim()) {
      errors.title = 'Title is required';
    }
    if (!formData?.department_id) {
      errors.department_id = 'Department is required';
    }

    const itemErrors: string[] = [];
    formData?.items?.forEach((item: any, index: number) => {
      if (!item.item_name?.trim()) {
        itemErrors.push(`Item ${index + 1}: Name is required`);
      }
      if (!item.unit_of_measure?.trim()) {
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

  // Handle submit
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSuccess(false);

    const submitData: UpdateRequisitionData = {
      title: formData.title,
      description: formData.description || undefined,
      department_id: parseInt(formData.department_id),
      supplier_id: formData.supplier_id ? parseInt(formData.supplier_id) : undefined,
      priority: formData.priority,
      type: formData.type,
      urgency: formData.urgency,
      justification: formData.justification || undefined,
      required_by_date: formData.required_by_date || undefined,
      required_delivery_date: formData.required_delivery_date || undefined,
      budget_code: formData.budget_code || undefined,
      budget_source: formData.budget_source || undefined,
      funding_source: formData.funding_source || undefined,
      project_code: formData.project_code || undefined,
      procurement_method: formData.procurement_method || undefined,
      is_framework_agreement: formData.is_framework_agreement,
      framework_agreement_id: formData.framework_agreement_id || undefined,
      risk_level: formData.risk_level,
      risk_mitigation: formData.risk_mitigation || undefined,
      is_compliant: formData.is_compliant,
      compliance_notes: formData.compliance_notes || undefined,
      currency: formData.currency,
      exchange_rate: formData.exchange_rate,
      items: formData.items
        .filter((item: any) => item.item_name?.trim() !== '')
        .map((item: any) => ({
          id: item.id,
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

    updateRequisition(
      { id, data: submitData },
      {
        onSuccess: () => {
          setSuccess(true);
          setIsSubmitting(false);
          setTimeout(() => {
            router.push(`/requisitions/${id}`);
          }, 1500);
        },
        onError: () => {
          setIsSubmitting(false);
        },
      }
    );
  }, [formData, validateForm, updateRequisition, id, router]);

  // Loading state
  if (isLoading || departmentsLoading || suppliersLoading) {
    return (
      <PageTemplate
        title="Edit Requisition"
        description="Loading requisition data..."
        icon={<FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />}
        actions={<div className="h-9 w-24" />}
      >
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-48" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageTemplate>
    );
  }

  // Error or not found
  if (error || !requisition) {
    return (
      <PageTemplate
        title="Edit Requisition"
        description="Error loading requisition"
        icon={<FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />}
        actions={
          <Button variant="outline" size="sm" onClick={() => router.push('/requisitions/manage')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        }
      >
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Requisition</AlertTitle>
          <AlertDescription>
            {error?.message || 'Requisition not found or you do not have permission to edit it.'}
          </AlertDescription>
        </Alert>
        <div className="flex justify-center gap-4 mt-6">
          <Button onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
          <Button variant="outline" onClick={() => router.push('/requisitions/manage')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </PageTemplate>
    );
  }

  // Check if editable
  if (!requisition.is_editable) {
    return (
      <PageTemplate
        title="Edit Requisition"
        description="This requisition cannot be edited"
        icon={<FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />}
        actions={
          <Button variant="outline" size="sm" onClick={() => router.push(`/requisitions/${id}`)} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Details
          </Button>
        }
      >
        <Alert className="max-w-2xl mx-auto border-amber-500 bg-amber-50 dark:bg-amber-950/20">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800 dark:text-amber-300">Not Editable</AlertTitle>
          <AlertDescription className="text-amber-700 dark:text-amber-400">
            This requisition has been submitted for approval and cannot be edited.
            Only draft or returned requisitions can be edited.
          </AlertDescription>
        </Alert>
        <div className="flex justify-center mt-6">
          <Button onClick={() => router.push(`/requisitions/${id}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            View Requisition Details
          </Button>
        </div>
      </PageTemplate>
    );
  }

  if (!formData) {
    return (
      <PageTemplate
        title="Edit Requisition"
        description="Loading..."
        icon={<FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />}
        actions={<div className="h-9 w-24" />}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        </div>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title="Edit Requisition"
      description={`Editing: ${requisition.reference_number} - ${requisition.title}`}
      icon={<FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />}
      actions={
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="gap-1.5">
            <FileText className="h-3 w-3" />
            {requisition.reference_number}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/requisitions/${id}`)}
            className="gap-2 h-9"
            disabled={isSubmitting || isUpdating}
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleSubmit}
            className="gap-2 h-9"
            disabled={isSubmitting || isUpdating || success}
          >
            {isSubmitting || isUpdating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : success ? (
              <>
                <CheckCircle className="h-4 w-4" />
                Saved!
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      }
    >
      {success && (
        <Alert className="mb-6 border-green-500 bg-green-50 dark:bg-green-950/20">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-700 dark:text-green-300 font-medium">
            Requisition updated successfully! Redirecting...
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-4 border-b">
            <CardTitle className="flex items-center gap-2.5 text-xl">
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              Requisition Details
            </CardTitle>
            <CardDescription>
              Edit the requisition details below. All fields marked with <span className="text-red-500">*</span> are required.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            {/* Requester Info - Read Only */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg border mb-6">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Requisition Number</Label>
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <Input value={requisition.reference_number} readOnly className="h-10 text-sm font-mono bg-muted/50" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Requester</Label>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <Input value={requisition.user?.full_name || 'Unknown'} readOnly className="h-10 text-sm bg-muted/50" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Status</Label>
                <div className="flex items-center gap-2">
                  <div className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 text-xs font-medium">
                    {requisition.status_label || requisition.status}
                  </div>
                </div>
              </div>
            </div>

            <Separator className="mb-6" />

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-500" />
                Basic Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="title" className="flex items-center gap-2 text-sm font-medium">
                    Requisition Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="Enter a clear and descriptive requisition title"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    className={cn("h-11 text-base", formErrors.title && "border-red-500")}
                    disabled={isSubmitting || isUpdating || success}
                  />
                  {formErrors.title && <p className="text-sm text-red-500">{formErrors.title}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="department_id" className="flex items-center gap-2 text-sm font-medium">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    Department <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.department_id || undefined}
                    onValueChange={(value) => handleChange('department_id', value)}
                    disabled={isSubmitting || isUpdating || success}
                  >
                    <SelectTrigger className={cn("h-11 text-base", formErrors.department_id && "border-red-500")}>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept: any) => (
                        <SelectItem key={dept.id} value={dept.id.toString()}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.department_id && <p className="text-sm text-red-500">{formErrors.department_id}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="supplier_id" className="flex items-center gap-2 text-sm font-medium">
                    <Truck className="h-4 w-4 text-gray-400" />
                    Preferred Supplier
                  </Label>
                  <Select
                    value={formData.supplier_id || undefined}
                    onValueChange={(value) => handleChange('supplier_id', value)}
                    disabled={isSubmitting || isUpdating || success}
                  >
                    <SelectTrigger className="h-11 text-base">
                      <SelectValue placeholder="Select supplier (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((supplier: any) => (
                        <SelectItem key={supplier.id} value={supplier.id.toString()}>
                          {supplier.company_name || supplier.name || 'Unknown Supplier'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="priority" className="flex items-center gap-2 text-sm font-medium">
                    Priority
                  </Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => handleChange('priority', value)}
                    disabled={isSubmitting || isUpdating || success}
                  >
                    <SelectTrigger className="h-11 text-base">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITY_OPTIONS.map((option) => {
                        const Icon = option.icon;
                        return (
                          <SelectItem key={option.value} value={option.value}>
                            <span className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              {option.label}
                            </span>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="type" className="flex items-center gap-2 text-sm font-medium">
                    <Tag className="h-4 w-4 text-gray-400" />
                    Type
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleChange('type', value)}
                    disabled={isSubmitting || isUpdating || success}
                  >
                    <SelectTrigger className="h-11 text-base">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="urgency" className="flex items-center gap-2 text-sm font-medium">
                    <Clock className="h-4 w-4 text-gray-400" />
                    Urgency
                  </Label>
                  <Select
                    value={formData.urgency}
                    onValueChange={(value) => handleChange('urgency', value)}
                    disabled={isSubmitting || isUpdating || success}
                  >
                    <SelectTrigger className="h-11 text-base">
                      <SelectValue placeholder="Select urgency" />
                    </SelectTrigger>
                    <SelectContent>
                      {URGENCY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

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
                        disabled={isSubmitting || isUpdating || success}
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

                <div className="space-y-1.5">
                  <Label htmlFor="required_delivery_date" className="flex items-center gap-2 text-sm font-medium">
                    <TrendingUp className="h-4 w-4 text-gray-400" />
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
                        disabled={isSubmitting || isUpdating || success}
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
                  disabled={isSubmitting || isUpdating || success}
                  className="min-h-[80px] resize-none text-base"
                  rows={3}
                />
              </div>

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
                  disabled={isSubmitting || isUpdating || success}
                  className="min-h-[60px] resize-none text-base"
                  rows={2}
                />
              </div>
            </div>

            <Separator className="my-6" />

            {/* Items Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold">Requisition Items</h3>
                  <Badge variant="secondary" className="ml-2">
                    {formData.items?.filter((i: any) => i.item_name?.trim()).length || 0} items
                  </Badge>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                  disabled={isSubmitting || isUpdating || success}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Item
                </Button>
              </div>

              <div className="grid grid-cols-12 gap-3 px-1 text-xs font-medium text-muted-foreground">
                <div className="col-span-12 md:col-span-3">Item Name *</div>
                <div className="col-span-12 md:col-span-3">Description</div>
                <div className="col-span-3 md:col-span-1">Qty *</div>
                <div className="col-span-3 md:col-span-1">Unit *</div>
                <div className="col-span-3 md:col-span-1">Unit Cost *</div>
                <div className="col-span-3 md:col-span-1">Tax %</div>
                <div className="col-span-3 md:col-span-1">Discount %</div>
                <div className="col-span-2 md:col-span-1 text-right">Total</div>
              </div>

              <div className="space-y-3">
                {formData.items?.map((item: any, index: number) => (
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

              <div className="flex justify-between items-center pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Items: <span className="font-medium">{formData.items?.filter((i: any) => i.item_name?.trim()).length || 0}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Grand Total</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {totalAmount.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Advanced Options */}
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full h-11 text-base"
              disabled={isSubmitting || isUpdating || success}
            >
              {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options'}
            </Button>

            {showAdvanced && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
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
                    disabled={isSubmitting || isUpdating || success}
                    className="h-11 text-base"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="budget_source" className="flex items-center gap-2 text-sm font-medium">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    Budget Source
                  </Label>
                  <Select
                    value={formData.budget_source || undefined}
                    onValueChange={(value) => handleChange('budget_source', value)}
                    disabled={isSubmitting || isUpdating || success}
                  >
                    <SelectTrigger className="h-11 text-base">
                      <SelectValue placeholder="Select budget source" />
                    </SelectTrigger>
                    <SelectContent>
                      {BUDGET_SOURCES.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="funding_source" className="flex items-center gap-2 text-sm font-medium">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    Funding Source
                  </Label>
                  <Select
                    value={formData.funding_source || undefined}
                    onValueChange={(value) => handleChange('funding_source', value)}
                    disabled={isSubmitting || isUpdating || success}
                  >
                    <SelectTrigger className="h-11 text-base">
                      <SelectValue placeholder="Select funding source" />
                    </SelectTrigger>
                    <SelectContent>
                      {FUNDING_SOURCES.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

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
                    disabled={isSubmitting || isUpdating || success}
                    className="h-11 text-base"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="procurement_method" className="flex items-center gap-2 text-sm font-medium">
                    <Briefcase className="h-4 w-4 text-gray-400" />
                    Procurement Method
                  </Label>
                  <Select
                    value={formData.procurement_method || undefined}
                    onValueChange={(value) => handleChange('procurement_method', value)}
                    disabled={isSubmitting || isUpdating || success}
                  >
                    <SelectTrigger className="h-11 text-base">
                      <SelectValue placeholder="Select procurement method" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROCUREMENT_METHODS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-3 pt-2">
                    <input
                      type="checkbox"
                      id="framework_agreement"
                      checked={formData.is_framework_agreement}
                      onChange={(e) => handleChange('is_framework_agreement', e.target.checked)}
                      disabled={isSubmitting || isUpdating || success}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="framework_agreement" className="text-sm font-medium cursor-pointer">
                      Framework Agreement
                    </Label>
                  </div>
                </div>

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
                      disabled={isSubmitting || isUpdating || success}
                      className="h-11 text-base"
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="risk_level" className="flex items-center gap-2 text-sm font-medium">
                    <Shield className="h-4 w-4 text-gray-400" />
                    Risk Level
                  </Label>
                  <Select
                    value={formData.risk_level}
                    onValueChange={(value) => handleChange('risk_level', value)}
                    disabled={isSubmitting || isUpdating || success}
                  >
                    <SelectTrigger className="h-11 text-base">
                      <SelectValue placeholder="Select risk level" />
                    </SelectTrigger>
                    <SelectContent>
                      {RISK_LEVELS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

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
                    disabled={isSubmitting || isUpdating || success}
                    className="min-h-[60px] resize-none text-base"
                    rows={2}
                  />
                </div>

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
                    disabled={isSubmitting || isUpdating || success}
                    className="min-h-[60px] resize-none text-base"
                    rows={2}
                  />
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="border-t py-4 px-6 bg-muted/30 rounded-b-xl">
            <div className="flex justify-between items-center w-full">
              <p className="text-xs text-muted-foreground">
                <span className="text-red-500">*</span> Required fields. Only draft requisitions can be edited.
              </p>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/requisitions/${id}`)}
                  disabled={isSubmitting || isUpdating || success}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="gap-2"
                  disabled={isSubmitting || isUpdating || success}
                >
                  {isSubmitting || isUpdating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : success ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Saved!
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardFooter>
        </Card>
      </form>
    </PageTemplate>
  );
}
