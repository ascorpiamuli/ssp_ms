// frontend/src/app/(dashboard)/settings/company/page.tsx

'use client';

import { useState, useEffect } from 'react';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Hash,
  FileText,
  Users,
  Calendar,
  DollarSign,
  Briefcase,
  Palette,
  Type,
  Link,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Camera,
  Trash2,
  X,
  RefreshCw,
  Clock,
  Settings,
  Award,
  UserCog,
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
import { useCompanyProfile } from '@/hooks/useCompanyProfile';
import { useToast } from '@/components/ui/toast-context';

const INDUSTRY_OPTIONS = [
  { value: 'education', label: 'Education' },
  { value: 'technology', label: 'Technology' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'finance', label: 'Finance' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'retail', label: 'Retail' },
  { value: 'services', label: 'Services' },
  { value: 'government', label: 'Government' },
  { value: 'nonprofit', label: 'Non-Profit' },
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'construction', label: 'Construction' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'hospitality', label: 'Hospitality' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'other', label: 'Other' },
];

const COMPANY_SIZE_OPTIONS = [
  { value: 'small', label: 'Small (1-50 employees)' },
  { value: 'medium', label: 'Medium (51-200 employees)' },
  { value: 'large', label: 'Large (201-1000 employees)' },
  { value: 'enterprise', label: 'Enterprise (1000+ employees)' },
];

const CURRENCY_OPTIONS = [
  { value: 'KES', label: 'KES - Kenyan Shilling' },
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'UGX', label: 'UGX - Ugandan Shilling' },
  { value: 'TZS', label: 'TZS - Tanzanian Shilling' },
];

const TIMEZONE_OPTIONS = [
  { value: 'Africa/Nairobi', label: 'Africa/Nairobi (UTC+3)' },
  { value: 'Africa/Dar_es_Salaam', label: 'Africa/Dar_es_Salaam (UTC+3)' },
  { value: 'Africa/Kampala', label: 'Africa/Kampala (UTC+3)' },
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'America/New_York (UTC-5)' },
  { value: 'Europe/London', label: 'Europe/London (UTC+1)' },
];

const FONT_OPTIONS = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Lato', label: 'Lato' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Nunito', label: 'Nunito' },
  { value: 'Raleway', label: 'Raleway' },
  { value: 'Playfair Display', label: 'Playfair Display' },
  { value: 'Merriweather', label: 'Merriweather' },
];

interface CompanyProfileFormData {
  company_name: string;
  company_email: string;
  company_phone: string;
  company_address: string;
  company_website: string;
  registration_number: string;
  tax_id: string;
  license_number: string;
  industry: string;
  company_size: string;
  employee_count: number | string;
  annual_revenue: string;
  established_year: string;
  description: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  font_family: string;
  contact_person_name: string;
  contact_person_email: string;
  contact_person_phone: string;
  facebook_url: string;
  twitter_url: string;
  linkedin_url: string;
  instagram_url: string;
  youtube_url: string;
  timezone: string;
  currency: string;
  date_format: string;
  time_format: string;
  is_active: boolean;
}

const safeValue = (value: any): string => {
  if (value === null || value === undefined) return '';
  return String(value);
};

const safeBoolean = (value: any): boolean => {
  if (value === null || value === undefined) return true;
  return Boolean(value);
};

export default function CompanyProfilePage() {
  const { success, error } = useToast();
  const {
    useGetProfile,
    useGetCompletionStatus,
    saveProfile,
  } = useCompanyProfile();

  // ✅ Get loading states from individual queries
  const { data: profileData, isLoading: profileLoading, refetch: refetchProfile } = useGetProfile();
  const { data: completionData, isLoading: completionLoading } = useGetCompletionStatus();

  // ✅ Check if save mutation is pending
  const isSaving = saveProfile.isPending;

  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState(false);
  const [companyLogoFile, setCompanyLogoFile] = useState<File | null>(null);
  const [companyLogoPreview, setCompanyLogoPreview] = useState<string | null>(null);
  const [companyErrors, setCompanyErrors] = useState<Record<string, string>>({});

  const companyProfile = profileData as any;
  const companyCompletion = completionData?.data;

  const [formData, setFormData] = useState<CompanyProfileFormData>({
    company_name: '',
    company_email: '',
    company_phone: '',
    company_address: '',
    company_website: '',
    registration_number: '',
    tax_id: '',
    license_number: '',
    industry: '',
    company_size: '',
    employee_count: '',
    annual_revenue: '',
    established_year: '',
    description: '',
    primary_color: '#1a237e',
    secondary_color: '#3498db',
    accent_color: '#ffc107',
    font_family: 'Inter',
    contact_person_name: '',
    contact_person_email: '',
    contact_person_phone: '',
    facebook_url: '',
    twitter_url: '',
    linkedin_url: '',
    instagram_url: '',
    youtube_url: '',
    timezone: 'Africa/Nairobi',
    currency: 'KES',
    date_format: 'd M Y',
    time_format: 'H:i',
    is_active: true,
  });

  useEffect(() => {
    if (companyProfile) {
      setFormData({
        company_name: safeValue(companyProfile.company_name),
        company_email: safeValue(companyProfile.company_email),
        company_phone: safeValue(companyProfile.company_phone),
        company_address: safeValue(companyProfile.company_address),
        company_website: safeValue(companyProfile.company_website),
        registration_number: safeValue(companyProfile.registration_number),
        tax_id: safeValue(companyProfile.tax_id),
        license_number: safeValue(companyProfile.license_number),
        industry: safeValue(companyProfile.industry),
        company_size: safeValue(companyProfile.company_size),
        employee_count: companyProfile.employee_count ?? '',
        annual_revenue: safeValue(companyProfile.annual_revenue),
        established_year: safeValue(companyProfile.established_year),
        description: safeValue(companyProfile.description),
        primary_color: safeValue(companyProfile.primary_color) || '#1a237e',
        secondary_color: safeValue(companyProfile.secondary_color) || '#3498db',
        accent_color: safeValue(companyProfile.accent_color) || '#ffc107',
        font_family: safeValue(companyProfile.font_family) || 'Inter',
        contact_person_name: safeValue(companyProfile.contact_person_name),
        contact_person_email: safeValue(companyProfile.contact_person_email),
        contact_person_phone: safeValue(companyProfile.contact_person_phone),
        facebook_url: safeValue(companyProfile.social_links?.facebook),
        twitter_url: safeValue(companyProfile.social_links?.twitter),
        linkedin_url: safeValue(companyProfile.social_links?.linkedin),
        instagram_url: safeValue(companyProfile.social_links?.instagram),
        youtube_url: safeValue(companyProfile.social_links?.youtube),
        timezone: safeValue(companyProfile.timezone) || 'Africa/Nairobi',
        currency: safeValue(companyProfile.currency) || 'KES',
        date_format: safeValue(companyProfile.date_format) || 'd M Y',
        time_format: safeValue(companyProfile.time_format) || 'H:i',
        is_active: safeBoolean(companyProfile.is_active),
      });
    }
  }, [companyProfile]);

  const handleCompanyLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Company logo must be less than 5MB.');
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
    if (companyErrors[field]) setCompanyErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleNumberChange = (field: string, value: string) => {
    const numValue = value === '' ? '' : Number(value);
    setFormData(prev => ({ ...prev, [field]: numValue }));
    if (companyErrors[field]) setCompanyErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (companyErrors[field]) setCompanyErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.company_name.trim()) errors.company_name = 'Company name is required';
    if (!formData.company_email.trim()) {
      errors.company_email = 'Company email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.company_email)) {
      errors.company_email = 'Invalid email format';
    }
    if (!formData.company_address.trim()) errors.company_address = 'Company address is required';
    setCompanyErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(false);

    try {
      const formDataToSubmit = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          if (key === 'is_active') {
            formDataToSubmit.append(key, value === true || value === 'true' ? '1' : '0');
          } else if (key === 'employee_count') {
            formDataToSubmit.append(key, String(value));
          } else {
            formDataToSubmit.append(key, String(value));
          }
        }
      });
      if (companyLogoFile) formDataToSubmit.append('company_logo', companyLogoFile);

      await saveProfile.mutateAsync(formDataToSubmit);
      setSuccessMsg(true);
      await refetchProfile();
      setCompanyLogoFile(null);
      setCompanyLogoPreview(null);
      success('Company profile updated successfully!');
      setTimeout(() => setSuccessMsg(false), 3000);
    } catch (err: any) {
      const msg = err.message || 'Failed to update company profile';
      setErrorMsg(msg);
      error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetchProfile();
      success('Company profile refreshed');
    } catch (err) {
      error('Failed to refresh company profile');
    } finally {
      setIsRefreshing(false);
    }
  };

  const getCompanyLogoUrl = (): string | null => {
    if (companyLogoPreview) return companyLogoPreview;
    if (companyProfile?.logo_url) return companyProfile.logo_url;
    if (companyProfile?.company_logo) return companyProfile.company_logo;
    return null;
  };

  const companyCompletionPercentage = companyCompletion?.percentage || 0;

  // ✅ Use individual loading states
  if (profileLoading || completionLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-3 text-muted-foreground">Loading company profile...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold dark:text-white">Company Profile</h2>
          <p className="text-muted-foreground">Manage your organization's profile, branding, and contact information</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing} className="gap-2 rounded-xl">
            <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")} />
            Refresh
          </Button>
          <Badge variant="outline" className="rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border-blue-200 dark:border-blue-800">
            {companyCompletionPercentage}% Complete
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
                ✅ Company profile updated successfully!
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Logo */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="h-24 w-24 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-800">
                  {getCompanyLogoUrl() ? (
                    <img src={getCompanyLogoUrl()!} alt="Company Logo" className="h-full w-full object-cover" />
                  ) : (
                    <Building2 className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <label
                  htmlFor="company-logo-upload"
                  className="absolute -bottom-2 -right-2 p-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full cursor-pointer hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg shadow-blue-600/30 hover:scale-110"
                >
                  <Camera className="h-3.5 w-3.5" />
                  <input
                    id="company-logo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCompanyLogoChange}
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
                <Label htmlFor="company_name" className="text-sm font-medium">
                  Company Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="company_name"
                  placeholder="Enter company name"
                  value={formData.company_name}
                  onChange={(e) => handleChange('company_name', e.target.value)}
                  disabled={isLoading}
                  className={cn("h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700", companyErrors.company_name && "border-red-500")}
                />
                {companyErrors.company_name && <p className="text-sm text-red-500">{companyErrors.company_name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_email" className="text-sm font-medium">
                  Company Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="company_email"
                  type="email"
                  placeholder="company@example.com"
                  value={formData.company_email}
                  onChange={(e) => handleChange('company_email', e.target.value)}
                  disabled={isLoading}
                  className={cn("h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700", companyErrors.company_email && "border-red-500")}
                />
                {companyErrors.company_email && <p className="text-sm text-red-500">{companyErrors.company_email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_phone" className="text-sm font-medium">Company Phone</Label>
                <Input
                  id="company_phone"
                  placeholder="+254 700 000 000"
                  value={formData.company_phone}
                  onChange={(e) => handleChange('company_phone', e.target.value)}
                  disabled={isLoading}
                  className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="registration_number" className="text-sm font-medium">Registration Number</Label>
                <Input
                  id="registration_number"
                  placeholder="Enter registration number"
                  value={formData.registration_number}
                  onChange={(e) => handleChange('registration_number', e.target.value)}
                  disabled={isLoading}
                  className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tax_id" className="text-sm font-medium">Tax ID / PIN</Label>
                <Input
                  id="tax_id"
                  placeholder="Enter tax ID or PIN"
                  value={formData.tax_id}
                  onChange={(e) => handleChange('tax_id', e.target.value)}
                  disabled={isLoading}
                  className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="license_number" className="text-sm font-medium">License Number</Label>
                <Input
                  id="license_number"
                  placeholder="Enter license number"
                  value={formData.license_number}
                  onChange={(e) => handleChange('license_number', e.target.value)}
                  disabled={isLoading}
                  className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry" className="text-sm font-medium">Industry</Label>
                <Select
                  value={formData.industry}
                  onValueChange={(value) => handleSelectChange('industry', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                    {INDUSTRY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_size" className="text-sm font-medium">Company Size</Label>
                <Select
                  value={formData.company_size}
                  onValueChange={(value) => handleSelectChange('company_size', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700">
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                    {COMPANY_SIZE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="employee_count" className="text-sm font-medium">Employee Count</Label>
                <Input
                  id="employee_count"
                  type="number"
                  placeholder="Enter number of employees"
                  value={formData.employee_count}
                  onChange={(e) => handleNumberChange('employee_count', e.target.value)}
                  disabled={isLoading}
                  className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="annual_revenue" className="text-sm font-medium">Annual Revenue</Label>
                <Input
                  id="annual_revenue"
                  placeholder="e.g., 5,000,000"
                  value={formData.annual_revenue}
                  onChange={(e) => handleChange('annual_revenue', e.target.value)}
                  disabled={isLoading}
                  className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="established_year" className="text-sm font-medium">Year Established</Label>
                <Input
                  id="established_year"
                  placeholder="e.g., 2010"
                  value={formData.established_year}
                  onChange={(e) => handleChange('established_year', e.target.value)}
                  disabled={isLoading}
                  className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="company_address" className="text-sm font-medium">
                  Company Address <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="company_address"
                  placeholder="Enter company address"
                  value={formData.company_address}
                  onChange={(e) => handleChange('company_address', e.target.value)}
                  disabled={isLoading}
                  className={cn("min-h-[80px] resize-none rounded-xl dark:bg-gray-900 dark:border-gray-700", companyErrors.company_address && "border-red-500")}
                  rows={2}
                />
                {companyErrors.company_address && <p className="text-sm text-red-500">{companyErrors.company_address}</p>}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="company_website" className="text-sm font-medium">Company Website</Label>
                <Input
                  id="company_website"
                  placeholder="https://example.com"
                  value={formData.company_website}
                  onChange={(e) => handleChange('company_website', e.target.value)}
                  disabled={isLoading}
                  className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description" className="text-sm font-medium">Company Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your company, products, and services..."
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  disabled={isLoading}
                  className="min-h-[100px] resize-none rounded-xl dark:bg-gray-900 dark:border-gray-700"
                />
              </div>
            </div>

            <Separator className="dark:bg-gray-700" />

            {/* Branding */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <Palette className="h-4 w-4 text-muted-foreground" />
                Branding
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={formData.primary_color}
                      onChange={(e) => handleChange('primary_color', e.target.value)}
                      disabled={isLoading}
                      className="h-11 w-16 rounded-xl dark:bg-gray-900 dark:border-gray-700 p-1"
                    />
                    <Input
                      value={formData.primary_color}
                      onChange={(e) => handleChange('primary_color', e.target.value)}
                      disabled={isLoading}
                      className="h-11 flex-1 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={formData.secondary_color}
                      onChange={(e) => handleChange('secondary_color', e.target.value)}
                      disabled={isLoading}
                      className="h-11 w-16 rounded-xl dark:bg-gray-900 dark:border-gray-700 p-1"
                    />
                    <Input
                      value={formData.secondary_color}
                      onChange={(e) => handleChange('secondary_color', e.target.value)}
                      disabled={isLoading}
                      className="h-11 flex-1 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Accent Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={formData.accent_color}
                      onChange={(e) => handleChange('accent_color', e.target.value)}
                      disabled={isLoading}
                      className="h-11 w-16 rounded-xl dark:bg-gray-900 dark:border-gray-700 p-1"
                    />
                    <Input
                      value={formData.accent_color}
                      onChange={(e) => handleChange('accent_color', e.target.value)}
                      disabled={isLoading}
                      className="h-11 flex-1 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <Label className="text-sm font-medium flex items-center gap-1.5">
                  <Type className="h-3.5 w-3.5 text-muted-foreground" />
                  Font Family
                </Label>
                <Select
                  value={formData.font_family}
                  onValueChange={(value) => handleSelectChange('font_family', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700">
                    <SelectValue placeholder="Select font family" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-900 dark:border-gray-700 max-h-[200px]">
                    {FONT_OPTIONS.map((font) => (
                      <SelectItem key={font.value} value={font.value}>{font.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator className="dark:bg-gray-700" />

            {/* Contact Person */}
            <div>
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

            <Separator className="dark:bg-gray-700" />

            {/* Social Media */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <Link className="h-4 w-4 text-muted-foreground" />
                Social Media
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Facebook className="h-4 w-4 text-muted-foreground" />
                    Facebook
                  </Label>
                  <Input
                    placeholder="https://facebook.com/company"
                    value={formData.facebook_url}
                    onChange={(e) => handleChange('facebook_url', e.target.value)}
                    disabled={isLoading}
                    className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Twitter className="h-4 w-4 text-muted-foreground" />
                    Twitter/X
                  </Label>
                  <Input
                    placeholder="https://twitter.com/company"
                    value={formData.twitter_url}
                    onChange={(e) => handleChange('twitter_url', e.target.value)}
                    disabled={isLoading}
                    className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Linkedin className="h-4 w-4 text-muted-foreground" />
                    LinkedIn
                  </Label>
                  <Input
                    placeholder="https://linkedin.com/company"
                    value={formData.linkedin_url}
                    onChange={(e) => handleChange('linkedin_url', e.target.value)}
                    disabled={isLoading}
                    className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Instagram className="h-4 w-4 text-muted-foreground" />
                    Instagram
                  </Label>
                  <Input
                    placeholder="https://instagram.com/company"
                    value={formData.instagram_url}
                    onChange={(e) => handleChange('instagram_url', e.target.value)}
                    disabled={isLoading}
                    className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Youtube className="h-4 w-4 text-muted-foreground" />
                    YouTube
                  </Label>
                  <Input
                    placeholder="https://youtube.com/company"
                    value={formData.youtube_url}
                    onChange={(e) => handleChange('youtube_url', e.target.value)}
                    disabled={isLoading}
                    className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                  />
                </div>
              </div>
            </div>

            <Separator className="dark:bg-gray-700" />

            {/* Settings */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <Settings className="h-4 w-4 text-muted-foreground" />
                Settings
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    Timezone
                  </Label>
                  <Select
                    value={formData.timezone}
                    onValueChange={(value) => handleSelectChange('timezone', value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                      {TIMEZONE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-1.5">
                    <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                    Currency
                  </Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => handleSelectChange('currency', value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                      {CURRENCY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator className="dark:bg-gray-700" />

            <div className="flex items-center gap-3">
              <Button
                type="submit"
                className="gap-2 px-8 min-w-[140px] h-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/20"
                disabled={isLoading || isSaving}
              >
                {isLoading || isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
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
