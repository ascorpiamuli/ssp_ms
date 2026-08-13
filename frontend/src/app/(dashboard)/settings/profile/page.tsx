// frontend/src/app/(dashboard)/settings/profile/page.tsx

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Globe,
  Hash,
  FileText,
  Link,
  Github,
  Twitter,
  Linkedin,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Camera,
  Trash2,
  X,
  RefreshCw,
  Shield,
  Building,
  Sparkles,
  Clock,
  CalendarDays,
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/toast-context';

// ============================================
// CONSTANTS - Role Labels
// ============================================

const ROLE_LABELS: Record<string, string> = {
  'ADMIN': 'Administrator',
  'HOD': 'Head of Department',
  'ACCOUNTANT': 'Accountant/Finance',
  'HEAD OF INSTITUTION': 'Principal/Head of Institution',
  'FINAL_APPROVER': 'Director/Finance Administrator',
  'PROCUREMENT': 'Procurement Officer',
  'SUPPLIER': 'Supplier/Vendor',
  'AUDITOR': 'Auditorial Staff Officer',
  'SUPER_ADMIN': 'Super Administrator',
};

const ROLE_DESCRIPTIONS: Record<string, string> = {
  'ADMIN': 'The Chief Administrator of the System',
  'HOD': 'Approves departmental requisitions',
  'ACCOUNTANT': 'Verifies budget & financial compliance',
  'HEAD OF INSTITUTION': 'Final institutional approval authority',
  'FINAL_APPROVER': 'Authorizes financial commitments',
  'PROCUREMENT': 'Manages procurement & supplier processes',
  'SUPPLIER': 'Provides goods or services',
  'AUDITOR': 'Ensures compliance & transparency',
  'SUPER_ADMIN': 'Super Administrator with full system access',
};

const getRoleLabel = (roleName: string): string => {
  if (!roleName) return 'Unknown Role';
  const upperRole = roleName.toUpperCase();
  return ROLE_LABELS[upperRole] || roleName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const getRoleDescription = (roleName: string): string => {
  if (!roleName) return '';
  const upperRole = roleName.toUpperCase();
  return ROLE_DESCRIPTIONS[upperRole] || '';
};

const getRoleBadgeColor = (roleName: string): string => {
  if (!roleName) return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
  const upperRole = roleName.toUpperCase();
  const colors: Record<string, string> = {
    'ADMIN': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    'HOD': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
    'ACCOUNTANT': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    'HEAD OF INSTITUTION': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    'FINAL_APPROVER': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    'PROCUREMENT': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800',
    'SUPPLIER': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800',
    'AUDITOR': 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800',
    'SUPER_ADMIN': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
  };
  return colors[upperRole] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
};

interface ExtendedUser {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  role: string | null;
  avatar?: string;
  avatar_url?: string;
  id_number?: string;
  date_of_birth?: string;
  created_at: string;
  last_login_at?: string;
  profile?: {
    id: number;
    avatar?: string;
    date_of_birth?: string;
    gender?: string;
    address?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
    bio?: string;
    social_links?: {
      github?: string;
      twitter?: string;
      linkedin?: string;
      website?: string;
    };
  };
  roles: string[];
}

interface ProfileFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  id_number: string;
  date_of_birth: string;
  profile: {
    address: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    bio: string;
    gender: string;
    social_links?: {
      github?: string;
      twitter?: string;
      linkedin?: string;
      website?: string;
    };
  };
}

export default function PersonalProfilePage() {
  const router = useRouter();
  const { success, error } = useToast();
  const {
    user,
    updateProfile,
    uploadAvatar,
    isUpdatingProfile,
    isUploadingAvatar,
    refetchUser,
  } = useAuthContext();

  const userExtended = user as ExtendedUser | null;

  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<ProfileFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    id_number: '',
    date_of_birth: '',
    profile: {
      address: '',
      city: '',
      state: '',
      postal_code: '',
      country: '',
      bio: '',
      gender: '',
      social_links: {
        github: '',
        twitter: '',
        linkedin: '',
        website: '',
      },
    },
  });

  // Get role info
  const primaryRole = userExtended?.role?.toUpperCase() || '';
  const roleLabel = getRoleLabel(primaryRole);
  const roleDescription = getRoleDescription(primaryRole);
  const roleBadgeColor = getRoleBadgeColor(primaryRole);

  useEffect(() => {
    if (userExtended) {
      const profile = userExtended.profile;
      setFormData({
        first_name: userExtended.first_name || '',
        last_name: userExtended.last_name || '',
        email: userExtended.email || '',
        phone: userExtended.phone || '',
        id_number: userExtended.id_number || '',
        date_of_birth: userExtended.date_of_birth || '',
        profile: {
          address: profile?.address || '',
          city: profile?.city || '',
          state: profile?.state || '',
          postal_code: profile?.postal_code || '',
          country: profile?.country || '',
          bio: profile?.bio || '',
          gender: profile?.gender || '',
          social_links: {
            github: profile?.social_links?.github || '',
            twitter: profile?.social_links?.twitter || '',
            linkedin: profile?.social_links?.linkedin || '',
            website: profile?.social_links?.website || '',
          },
        },
      });
    }
  }, [userExtended]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.first_name.trim()) errors.first_name = 'First name is required';
    if (!formData.last_name.trim()) errors.last_name = 'Last name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    if (formData.phone && !/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
      errors.phone = 'Invalid phone number format';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) setFormErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleProfileChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      profile: { ...prev.profile, [field]: value },
    }));
    if (formErrors[`profile.${field}`]) setFormErrors(prev => ({ ...prev, [`profile.${field}`]: '' }));
  };

  const handleSocialChange = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        social_links: {
          ...(prev.profile.social_links || {}),
          [platform]: value,
        },
      },
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Avatar image must be less than 5MB.');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setErrorMsg('Please upload an image file.');
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setAvatarPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(false);

    try {
      if (avatarFile) await uploadAvatar(avatarFile);

      const updateData: any = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        date_of_birth: formData.date_of_birth,
        profile: {
          address: formData.profile.address,
          city: formData.profile.city,
          state: formData.profile.state,
          postal_code: formData.profile.postal_code,
          country: formData.profile.country,
          bio: formData.profile.bio,
          gender: formData.profile.gender,
          social_links: formData.profile.social_links,
        },
      };
      if (formData.id_number) updateData.id_number = formData.id_number;

      await updateProfile(updateData);
      setSuccessMsg(true);
      await refetchUser();
      setAvatarFile(null);
      setAvatarPreview(null);
      success('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(false), 3000);
    } catch (err: any) {
      const msg = err.message || 'Failed to update profile';
      setErrorMsg(msg);
      error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetchUser();
      success('Profile refreshed');
    } catch (err) {
      error('Failed to refresh profile');
    } finally {
      setIsRefreshing(false);
    }
  };

  const getUserInitials = () => {
    const first = formData.first_name?.charAt(0) || '';
    const last = formData.last_name?.charAt(0) || '';
    return (first + last).toUpperCase() || 'U';
  };

  const getAvatarUrl = () => {
    if (avatarPreview) return avatarPreview;
    if (userExtended?.avatar_url) return userExtended.avatar_url;
    if (userExtended?.avatar) return userExtended.avatar;
    return null;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold dark:text-white">Personal Profile</h2>
        <p className="text-muted-foreground">Manage your personal information and account details</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar Card */}
        <div className="lg:col-span-1">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-950 rounded-xl">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="relative group">
                  <Avatar className="h-32 w-32 ring-4 ring-blue-100 dark:ring-blue-900/30 shadow-lg">
                    {getAvatarUrl() ? (
                      <AvatarImage src={getAvatarUrl()!} alt={formData.first_name} className="object-cover" />
                    ) : null}
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-4xl font-medium">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 p-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full cursor-pointer hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg shadow-blue-600/30 hover:scale-110"
                  >
                    <Camera className="h-4 w-4" />
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                      disabled={isUploadingAvatar}
                    />
                  </label>
                </div>
                <h3 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">
                  {formData.first_name} {formData.last_name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  {formData.email}
                </p>
                {primaryRole && (
                  <div className="mt-2 flex flex-col items-center gap-1">
                    <Badge className={cn("flex items-center gap-1.5 rounded-full px-3 py-1.5 border font-medium", roleBadgeColor)}>
                      <Shield className="h-3.5 w-3.5" />
                      {roleLabel}
                    </Badge>
                    {roleDescription && (
                      <p className="text-xs text-muted-foreground max-w-[200px] text-center">{roleDescription}</p>
                    )}
                  </div>
                )}
                {isUploadingAvatar && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </div>
                )}
                {avatarFile && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-green-600">New avatar selected</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-red-500 hover:text-red-600 rounded-xl"
                      onClick={() => { setAvatarFile(null); setAvatarPreview(null); }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>

              <Separator className="my-4 dark:bg-gray-700" />

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50/50 dark:bg-gray-800/30">
                  <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Member Since
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {userExtended?.created_at ? new Date(userExtended.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                {userExtended?.last_login_at && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50/50 dark:bg-gray-800/30">
                    <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      Last Login
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {new Date(userExtended.last_login_at).toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50/50 dark:bg-gray-800/30">
                  <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Status
                  </span>
                  <Badge variant="success" className="flex items-center gap-1 rounded-full">
                    <CheckCircle className="h-3 w-3" />
                    Active
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-950 rounded-xl">
            <CardHeader className="border-b border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2.5 text-xl">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20">
                      <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    Edit Profile
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    Update your personal information and profile details
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing} className="gap-2 rounded-xl">
                  <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
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
                    ✅ Profile updated successfully!
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name" className="text-sm font-medium">
                      First Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="first_name"
                      placeholder="Enter first name"
                      value={formData.first_name}
                      onChange={(e) => handleChange('first_name', e.target.value)}
                      disabled={isLoading}
                      className={cn("h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700", formErrors.first_name && "border-red-500")}
                    />
                    {formErrors.first_name && <p className="text-sm text-red-500">{formErrors.first_name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name" className="text-sm font-medium">
                      Last Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="last_name"
                      placeholder="Enter last name"
                      value={formData.last_name}
                      onChange={(e) => handleChange('last_name', e.target.value)}
                      disabled={isLoading}
                      className={cn("h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700", formErrors.last_name && "border-red-500")}
                    />
                    {formErrors.last_name && <p className="text-sm text-red-500">{formErrors.last_name}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    disabled
                    className="h-11 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-muted-foreground"
                  />
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="+254 700 000 000"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      disabled={isLoading}
                      className={cn("h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700", formErrors.phone && "border-red-500")}
                    />
                    {formErrors.phone && <p className="text-sm text-red-500">{formErrors.phone}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="id_number" className="text-sm font-medium">ID Number</Label>
                    <Input
                      id="id_number"
                      placeholder="Enter ID number"
                      value={formData.id_number}
                      onChange={(e) => handleChange('id_number', e.target.value)}
                      disabled={isLoading}
                      className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date_of_birth" className="text-sm font-medium">Date of Birth</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => handleChange('date_of_birth', e.target.value)}
                    disabled={isLoading}
                    className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-sm font-medium">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us a bit about yourself..."
                    value={formData.profile.bio}
                    onChange={(e) => handleProfileChange('bio', e.target.value)}
                    disabled={isLoading}
                    className="min-h-[100px] resize-none rounded-xl dark:bg-gray-900 dark:border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-medium">Address</Label>
                  <Input
                    id="address"
                    placeholder="Enter street address"
                    value={formData.profile.address}
                    onChange={(e) => handleProfileChange('address', e.target.value)}
                    disabled={isLoading}
                    className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-sm font-medium">City</Label>
                    <Input
                      id="city"
                      placeholder="Enter city"
                      value={formData.profile.city}
                      onChange={(e) => handleProfileChange('city', e.target.value)}
                      disabled={isLoading}
                      className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-sm font-medium">State/Province</Label>
                    <Input
                      id="state"
                      placeholder="Enter state or province"
                      value={formData.profile.state}
                      onChange={(e) => handleProfileChange('state', e.target.value)}
                      disabled={isLoading}
                      className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="postal_code" className="text-sm font-medium">Postal Code</Label>
                    <Input
                      id="postal_code"
                      placeholder="Enter postal code"
                      value={formData.profile.postal_code}
                      onChange={(e) => handleProfileChange('postal_code', e.target.value)}
                      disabled={isLoading}
                      className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-sm font-medium">Country</Label>
                    <Input
                      id="country"
                      placeholder="Enter country"
                      value={formData.profile.country}
                      onChange={(e) => handleProfileChange('country', e.target.value)}
                      disabled={isLoading}
                      className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Social Links</Label>
                  <div className="space-y-3">
                    <Input
                      placeholder="Website URL"
                      value={formData.profile.social_links?.website || ''}
                      onChange={(e) => handleSocialChange('website', e.target.value)}
                      disabled={isLoading}
                      className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                    />
                    <Input
                      placeholder="GitHub URL"
                      value={formData.profile.social_links?.github || ''}
                      onChange={(e) => handleSocialChange('github', e.target.value)}
                      disabled={isLoading}
                      className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                    />
                    <Input
                      placeholder="Twitter/X URL"
                      value={formData.profile.social_links?.twitter || ''}
                      onChange={(e) => handleSocialChange('twitter', e.target.value)}
                      disabled={isLoading}
                      className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                    />
                    <Input
                      placeholder="LinkedIn URL"
                      value={formData.profile.social_links?.linkedin || ''}
                      onChange={(e) => handleSocialChange('linkedin', e.target.value)}
                      disabled={isLoading}
                      className="h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                    />
                  </div>
                </div>

                <Separator className="dark:bg-gray-700" />

                <div className="flex items-center gap-3">
                  <Button
                    type="submit"
                    className="gap-2 px-8 min-w-[140px] h-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/20"
                    disabled={isLoading || isUploadingAvatar}
                  >
                    {isLoading || isUploadingAvatar ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {isUploadingAvatar ? 'Uploading...' : 'Saving...'}
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/dashboard')}
                    disabled={isLoading}
                    className="gap-2 h-12 rounded-xl dark:border-gray-700 dark:hover:bg-gray-800"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
            <CardFooter className="border-t border-gray-200/50 dark:border-gray-700/50 py-4 px-6 bg-gray-50/50 dark:bg-gray-800/30 rounded-b-xl">
              <div className="flex justify-between items-center w-full">
                <p className="text-xs text-muted-foreground">
                  <span className="text-red-500">*</span> Required fields. Your information is secure and will not be shared.
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline" className="text-[10px] rounded-full px-2.5 py-0">Secure</Badge>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
