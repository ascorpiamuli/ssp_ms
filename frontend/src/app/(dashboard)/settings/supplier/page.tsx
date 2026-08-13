// frontend/src/app/(dashboard)/settings/supplier/page.tsx

'use client';

import { useState, useEffect } from 'react';
import {
  Store,
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Hash,
  FileText,
  Briefcase,
  Users,
  Calendar,
  Banknote,
  Award,
  BadgeCheck,
  CreditCard,
  UserCog,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Camera,
  RefreshCw,
  Package,
  BriefcaseBusiness,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useToast } from '@/components/ui/toast-context';

const CATEGORY_OPTIONS = [
  { value: 'goods', label: 'Goods Supplier', icon: Package, color: 'text-blue-600 dark:text-blue-400' },
  { value: 'services', label: 'Services Provider', icon: BriefcaseBusiness, color: 'text-purple-600 dark:text-purple-400' },
  { value: 'both', label: 'Both Goods & Services', icon: Store, color: 'text-orange-600 dark:text-orange-400' },
];

interface SupplierFormData {
  company_name: string;
  company_email: string;
  company_phone: string;
  company_registration: string;
  company_address: string;
  company_website: string;
  tax_id: string;
  category: 'goods' | 'services' | 'both' | '';
  description: string;
  established_year: string;
  employee_count: string;
  annual_revenue: string;
  certifications: string;
  registration_date: string;
  license_number: string;
  bank_name: string;
  bank_account: string;
  bank_branch: string;
  payment_terms: string;
  preferred_currency: string;
  contact_person_name: string;
  contact_person_email: string;
  contact_person_phone: string;
}

const safeValue = (value: any): string => {
  if (value === null || value === undefined) return '';
  return String(value);
};

export default function SupplierProfilePage() {
  const { success, error } = useToast();
  const {
    useSupplierProfileExists,
    createSupplier,
    updateSupplier,
  } = useSuppliers();

  // Destructure isLoading from the query result
  const {
    exists: supplierExists,
    supplier: supplierData,
    refetch: refetchSupplier,
    isLoading: isSupplierLoading,  // ✅ This is the correct way
  } = useSupplierProfileExists();

  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState(false);
  const [companyLogoFile, setCompanyLogoFile] = useState<File | null>(null);
  const [companyLogoPreview, setCompanyLogoPreview] = useState<string | null>(null);
  const [isEditingSupplier, setIsEditingSupplier] = useState(false);
  const [supplierId, setSupplierId] = useState<number | null>(null);
  const [supplierErrors, setSupplierErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<SupplierFormData>({
    company_name: '',
    company_email: '',
    company_phone: '',
    company_registration: '',
    company_address: '',
    company_website: '',
    tax_id: '',
    category: '',
    description: '',
    established_year: '',
    employee_count: '',
    annual_revenue: '',
    certifications: '',
    registration_date: '',
    license_number: '',
    bank_name: '',
    bank_account: '',
    bank_branch: '',
    payment_terms: '',
    preferred_currency: 'KES',
    contact_person_name: '',
    contact_person_email: '',
    contact_person_phone: '',
  });

  useEffect(() => {
    if (supplierData) {
      const data = supplierData as any;
      let categoryValue: 'goods' | 'services' | 'both' | '' = '';
      const rawCategory = data.category || '';
      if (rawCategory) {
        const normalized = rawCategory.toLowerCase();
        if (normalized === 'goods' || normalized === 'services' || normalized === 'both') {
          categoryValue = normalized as 'goods' | 'services' | 'both';
        }
      }

      setFormData({
        company_name: data.company_name || '',
        company_email: data.company_email || '',
        company_phone: data.company_phone || '',
        company_registration: data.company_registration || '',
        company_address: data.company_address || '',
        company_website: data.company_website || '',
        tax_id: data.tax_id || '',
        category: categoryValue,
        description: data.description || '',
        established_year: data.established_year || '',
        employee_count: data.employee_count || '',
        annual_revenue: data.annual_revenue || '',
        certifications: data.certifications || '',
        registration_date: data.registration_date || '',
        license_number: data.license_number || '',
        bank_name: data.bank_name || '',
        bank_account: data.bank_account || '',
        bank_branch: data.bank_branch || '',
        payment_terms: data.payment_terms || '',
        preferred_currency: data.preferred_currency || 'KES',
        contact_person_name: data.contact_person_name || '',
        contact_person_email: data.contact_person_email || '',
        contact_person_phone: data.contact_person_phone || '',
      });
      setSupplierId(data.id);
      setIsEditingSupplier(true);
    }
  }, [supplierData]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Logo must be less than 5MB.');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setErrorMsg('Please upload an image file.');
        return;
      }
      setCompanyLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setCompanyLogoPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (supplierErrors[field]) setSupplierErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleCategorySelect = (value: string) => {
    handleChange('category', value);
  };

  const getCategoryValue = (): string => formData.category || '';

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.company_name.trim()) errors.company_name = 'Company name is required';
    if (!formData.company_email.trim()) {
      errors.company_email = 'Company email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.company_email)) {
      errors.company_email = 'Invalid email format';
    }
    if (!formData.company_registration.trim()) errors.company_registration = 'Registration number is required';
    if (!formData.company_address.trim()) errors.company_address = 'Company address is required';
    if (!formData.category) errors.category = 'Category is required';
    setSupplierErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(false);

    try {
      const toUndefined = (value: string | null | undefined): string | undefined => {
        return value === null ? undefined : value || undefined;
      };

      const payload: any = {
        company_name: formData.company_name,
        company_email: formData.company_email,
        company_phone: toUndefined(formData.company_phone),
        company_registration: formData.company_registration,
        company_address: formData.company_address,
        company_website: toUndefined(formData.company_website),
        tax_id: toUndefined(formData.tax_id),
        category: formData.category as 'goods' | 'services' | 'both',
        description: toUndefined(formData.description),
        established_year: toUndefined(formData.established_year),
        employee_count: toUndefined(formData.employee_count),
        annual_revenue: toUndefined(formData.annual_revenue),
        certifications: toUndefined(formData.certifications),
        registration_date: toUndefined(formData.registration_date),
        license_number: toUndefined(formData.license_number),
        bank_name: toUndefined(formData.bank_name),
        bank_account: toUndefined(formData.bank_account),
        bank_branch: toUndefined(formData.bank_branch),
        payment_terms: toUndefined(formData.payment_terms),
        preferred_currency: formData.preferred_currency || 'KES',
        contact_person_name: toUndefined(formData.contact_person_name),
        contact_person_email: toUndefined(formData.contact_person_email),
        contact_person_phone: toUndefined(formData.contact_person_phone),
      };

      if (companyLogoFile) payload.company_logo = companyLogoFile;

      let response;
      if (isEditingSupplier && supplierId) {
        response = await updateSupplier.mutateAsync({ id: supplierId, data: payload });
      } else {
        response = await createSupplier.mutateAsync(payload);
      }

      if (!isEditingSupplier && response && 'id' in response) {
        setSupplierId((response as any).id);
        setIsEditingSupplier(true);
      }

      setSuccessMsg(true);
      await refetchSupplier();
      setCompanyLogoFile(null);
      setCompanyLogoPreview(null);
      success(isEditingSupplier ? 'Supplier profile updated successfully!' : 'Supplier profile created successfully!');
      setTimeout(() => setSuccessMsg(false), 3000);
    } catch (err: any) {
      const msg = err.message || 'Failed to save supplier profile';
      setErrorMsg(msg);
      error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetchSupplier();
      success('Supplier profile refreshed');
    } catch (err) {
      error('Failed to refresh supplier profile');
    } finally {
      setIsRefreshing(false);
    }
  };

  const getSupplierLogoUrl = (): string | null => {
    if (companyLogoPreview) return companyLogoPreview;
    if (supplierData && 'company_logo' in supplierData) {
      return (supplierData as any).company_logo || null;
    }
    return null;
  };

  // ✅ Loading state using the destructured isLoading from the query
  if (isSupplierLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-3 text-muted-foreground">Loading supplier profile...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold dark:text-white">Supplier Profile</h2>
          <p className="text-muted-foreground">
            {isEditingSupplier
              ? 'Update your company information and supplier details.'
              : 'Complete your supplier profile to start receiving procurement opportunities.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing} className="gap-2 rounded-xl">
            <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")} />
            Refresh
          </Button>
          <Badge variant="outline" className="rounded-full bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400 border-orange-200 dark:border-orange-800">
            {isEditingSupplier ? 'Update' : 'Complete'}
          </Badge>
        </div>
      </div>

      <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-950 rounded-xl">
        <CardContent className="pt-6">
          {errorMsg && (
            <Alert variant="destructive" className="mb-6 rounded-xl border-red-200 dark:border-red-800">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMsg}</AlertDescription>
            </Alert>
          )}
          {successMsg && (
            <Alert className="mb-6 rounded-xl border-green-500/50 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-700 dark:text-green-300 font-medium">
                ✅ {isEditingSupplier ? 'Supplier profile updated' : 'Supplier profile created'} successfully!
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Logo */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="h-24 w-24 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-800">
                  {getSupplierLogoUrl() ? (
                    <img src={getSupplierLogoUrl()!} alt="Company Logo" className="h-full w-full object-cover" />
                  ) : (
                    <Store className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <label
                  htmlFor="supplier-logo-upload"
                  className="absolute -bottom-2 -right-2 p-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full cursor-pointer hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg shadow-blue-600/30 hover:scale-110"
                >
                  <Camera className="h-3.5 w-3.5" />
                  <input
                    id="supplier-logo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoChange}
                    disabled={isLoading}
                  />
                </label>
              </div>
              <div className="text-sm text-gray-500">
                <p className="font-medium">Upload company logo</p>
                <p className="text-xs text-muted-foreground">PNG, JPG, SVG up to 5MB</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Company Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="Enter company name"
                  value={formData.company_name}
                  onChange={(e) => handleChange('company_name', e.target.value)}
                  disabled={isLoading}
                  className={cn("h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700", supplierErrors.company_name && "border-red-500")}
                />
                {supplierErrors.company_name && <p className="text-sm text-red-500">{supplierErrors.company_name}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Company Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="email"
                  placeholder="company@example.com"
                  value={formData.company_email}
                  onChange={(e) => handleChange('company_email', e.target.value)}
                  disabled={isLoading}
                  className={cn("h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700", supplierErrors.company_email && "border-red-500")}
                />
                {supplierErrors.company_email && <p className="text-sm text-red-500">{supplierErrors.company_email}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Company Phone</Label>
                <Input
                  placeholder="+254 700 000 000"
                  value={formData.company_phone}
                  onChange={(e) => handleChange('company_phone', e.target.value)}
                  disabled={isLoading}
                  className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Registration Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="Enter registration number"
                  value={formData.company_registration}
                  onChange={(e) => handleChange('company_registration', e.target.value)}
                  disabled={isLoading}
                  className={cn("h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700", supplierErrors.company_registration && "border-red-500")}
                />
                {supplierErrors.company_registration && <p className="text-sm text-red-500">{supplierErrors.company_registration}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Tax ID / PIN</Label>
                <Input
                  placeholder="Enter tax ID or PIN"
                  value={formData.tax_id}
                  onChange={(e) => handleChange('tax_id', e.target.value)}
                  disabled={isLoading}
                  className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">License Number</Label>
                <Input
                  placeholder="Enter license number"
                  value={formData.license_number}
                  onChange={(e) => handleChange('license_number', e.target.value)}
                  disabled={isLoading}
                  className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Registration Date</Label>
                <Input
                  type="date"
                  value={formData.registration_date}
                  onChange={(e) => handleChange('registration_date', e.target.value)}
                  disabled={isLoading}
                  className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Year Established</Label>
                <Input
                  placeholder="e.g., 2010"
                  value={formData.established_year}
                  onChange={(e) => handleChange('established_year', e.target.value)}
                  disabled={isLoading}
                  className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Number of Employees</Label>
                <Input
                  placeholder="e.g., 50"
                  value={formData.employee_count}
                  onChange={(e) => handleChange('employee_count', e.target.value)}
                  disabled={isLoading}
                  className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Annual Revenue</Label>
                <Input
                  placeholder="e.g., 5,000,000"
                  value={formData.annual_revenue}
                  onChange={(e) => handleChange('annual_revenue', e.target.value)}
                  disabled={isLoading}
                  className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                />
              </div>

              {/* Category */}
              <div className="space-y-2 md:col-span-2">
                <Label className="text-sm font-medium">
                  Business Category <span className="text-red-500">*</span>
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {CATEGORY_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleCategorySelect(option.value)}
                        className={cn(
                          "flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all duration-200",
                          getCategoryValue() === option.value
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-sm shadow-blue-500/10"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50",
                          supplierErrors.category && "border-red-500"
                        )}
                        disabled={isLoading}
                      >
                        <Icon className={cn("h-4 w-4", option.color)} />
                        <span className="text-sm font-medium">{option.label}</span>
                        {getCategoryValue() === option.value && (
                          <CheckCircle className="h-4 w-4 text-blue-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
                {supplierErrors.category && <p className="text-sm text-red-500">{supplierErrors.category}</p>}
              </div>

              {/* Company Address */}
              <div className="space-y-2 md:col-span-2">
                <Label className="text-sm font-medium">
                  Company Address <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  placeholder="Enter company address"
                  value={formData.company_address}
                  onChange={(e) => handleChange('company_address', e.target.value)}
                  disabled={isLoading}
                  className={cn("min-h-[80px] resize-none rounded-xl dark:bg-gray-900 dark:border-gray-700", supplierErrors.company_address && "border-red-500")}
                  rows={2}
                />
                {supplierErrors.company_address && <p className="text-sm text-red-500">{supplierErrors.company_address}</p>}
              </div>

              {/* Company Website */}
              <div className="space-y-2 md:col-span-2">
                <Label className="text-sm font-medium">Company Website</Label>
                <Input
                  placeholder="https://example.com"
                  value={formData.company_website}
                  onChange={(e) => handleChange('company_website', e.target.value)}
                  disabled={isLoading}
                  className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                />
              </div>

              {/* Certifications */}
              <div className="space-y-2 md:col-span-2">
                <Label className="text-sm font-medium">Certifications</Label>
                <Input
                  placeholder="e.g., ISO 9001, ISO 14001"
                  value={formData.certifications}
                  onChange={(e) => handleChange('certifications', e.target.value)}
                  disabled={isLoading}
                  className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                />
              </div>

              {/* Company Description */}
              <div className="space-y-2 md:col-span-2">
                <Label className="text-sm font-medium">Company Description</Label>
                <Textarea
                  placeholder="Describe your company, products, and services..."
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  disabled={isLoading}
                  className="min-h-[100px] resize-none rounded-xl dark:bg-gray-900 dark:border-gray-700"
                />
              </div>

              <Separator className="md:col-span-2 my-2 dark:bg-gray-700" />

              {/* Contact Person */}
              <div className="md:col-span-2">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <UserCog className="h-4 w-4 text-muted-foreground" />
                  Contact Person
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Full Name</Label>
                    <Input
                      placeholder="Contact person name"
                      value={formData.contact_person_name}
                      onChange={(e) => handleChange('contact_person_name', e.target.value)}
                      disabled={isLoading}
                      className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Email</Label>
                    <Input
                      type="email"
                      placeholder="contact@example.com"
                      value={formData.contact_person_email}
                      onChange={(e) => handleChange('contact_person_email', e.target.value)}
                      disabled={isLoading}
                      className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Phone</Label>
                    <Input
                      placeholder="+254 700 000 000"
                      value={formData.contact_person_phone}
                      onChange={(e) => handleChange('contact_person_phone', e.target.value)}
                      disabled={isLoading}
                      className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                    />
                  </div>
                </div>
              </div>

              <Separator className="md:col-span-2 my-2 dark:bg-gray-700" />

              {/* Banking Information */}
              <div className="md:col-span-2">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  Banking Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Bank Name</Label>
                    <Input
                      placeholder="Bank name"
                      value={formData.bank_name}
                      onChange={(e) => handleChange('bank_name', e.target.value)}
                      disabled={isLoading}
                      className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Bank Branch</Label>
                    <Input
                      placeholder="Branch name"
                      value={formData.bank_branch}
                      onChange={(e) => handleChange('bank_branch', e.target.value)}
                      disabled={isLoading}
                      className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Account Number</Label>
                    <Input
                      placeholder="Bank account number"
                      value={formData.bank_account}
                      onChange={(e) => handleChange('bank_account', e.target.value)}
                      disabled={isLoading}
                      className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Payment Terms</Label>
                    <Input
                      placeholder="e.g., Net 30"
                      value={formData.payment_terms}
                      onChange={(e) => handleChange('payment_terms', e.target.value)}
                      disabled={isLoading}
                      className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Preferred Currency</Label>
                    <Select
                      value={formData.preferred_currency}
                      onValueChange={(value: string) => handleChange('preferred_currency', value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                        <SelectItem value="KES">KES - Kenyan Shilling</SelectItem>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="GBP">GBP - British Pound</SelectItem>
                        <SelectItem value="UGX">UGX - Ugandan Shilling</SelectItem>
                        <SelectItem value="TZS">TZS - Tanzanian Shilling</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="dark:bg-gray-700" />

            <div className="flex items-center gap-3">
              <Button
                type="submit"
                className="gap-2 px-8 min-w-[140px] h-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/20"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isEditingSupplier ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {isEditingSupplier ? 'Update Supplier' : 'Create Supplier'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
