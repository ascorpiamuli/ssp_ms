'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  FileSignature,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  RefreshCw,
  Eye,
  User,
  Calendar,
  Mail,
  Check,
  X,
  Search,
  Filter,
  AlertCircle,
  ShieldCheck,
  UserCheck,
  Users,
  Building2,
  Download,
  QrCode,
  Scan,
  Award,
  Zap,
  TrendingUp,
  Activity,
  Hourglass,
  ChevronDown,
  ChevronUp,
  ListFilter,
  LayoutList,
  LayoutGrid,
  Copy,
  ExternalLink,
  Fingerprint,
  Smartphone,
  History,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/toast-context';
import { useAuthContext } from '@/contexts/AuthContext';
import { PageTemplate } from '@/components/dashboard/PageTemplate';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAdminSignature } from '@/hooks/useSignature';
import { useQueryClient } from '@tanstack/react-query';

// UI Components
import StatsCards, { type StatCardItem } from '@/components/ui/stat-cards';
import { WrappedCornerTag } from '@/components/ui/wrapped-corner-tag';
import HorizontalCornerTag from '@/components/ui/horizontal-corner-tag';

export default function AdminSignatureVerificationPage() {
  console.log('🔍 [AdminSignatureVerification] Component rendering');

  const { user } = useAuthContext();
  const { success, error } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSignature, setSelectedSignature] = useState<any>(null);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const {
    pending,
    verified,
    stats,
    isLoading,
    verify,
    reject,
    refetch,
    getPendingCount,
    getVerifiedCount,
    getTotalCount,
    getPercentageVerified,
  } = useAdminSignature();

  // Get all signatures (pending + verified)
  const allSignatures = useMemo(() => {
    const pendingList = pending || [];
    const verifiedList = verified || [];
    return [...pendingList, ...verifiedList];
  }, [pending, verified]);

  const getCurrentList = () => {
    if (activeTab === 'all') {
      return allSignatures;
    } else if (activeTab === 'pending') {
      return pending || [];
    } else if (activeTab === 'verified') {
      return verified || [];
    }
    return [];
  };

  const currentList = getCurrentList();

  const filteredSignatures = Array.isArray(currentList) ? currentList.filter((sig: any) => {
    const matchesSearch = sig.user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sig.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sig.user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sig.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) : [];

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { label: string; className: string; icon: React.ElementType }> = {
      pending: {
        label: 'Pending',
        className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
        icon: Clock,
      },
      approved: {
        label: 'Approved',
        className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
        icon: CheckCircle,
      },
      rejected: {
        label: 'Rejected',
        className: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800',
        icon: XCircle,
      },
      expired: {
        label: 'Expired',
        className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700',
        icon: Clock,
      },
    };
    return configs[status] || configs.pending;
  };

  // Compute stats for StatsCards
  const statsItems: StatCardItem[] = useMemo(() => {
    const total = getTotalCount();
    const pendingCount = getPendingCount();
    const verifiedCount = getVerifiedCount();
    const rejectedCount = stats?.rejected || 0;

    return [
      {
        label: "Total Signatures",
        value: total,
        icon: FileSignature,
        tagLabel: "TOTAL",
        tagColor: "blue",
        subtitle: `${getPercentageVerified()}% verified`,
      },
      {
        label: "Pending Verification",
        value: pendingCount,
        icon: Hourglass,
        tagLabel: "PENDING",
        tagColor: "amber",
        subtitle: `${pendingCount} awaiting review`,
      },
      {
        label: "Verified",
        value: verifiedCount,
        icon: ShieldCheck,
        tagLabel: "VERIFIED",
        tagColor: "emerald",
        subtitle: `${verifiedCount} approved signatures`,
      },
      {
        label: "Rejected",
        value: rejectedCount,
        icon: XCircle,
        tagLabel: "REJECTED",
        tagColor: "rose",
        subtitle: `${rejectedCount} rejected signatures`,
      },
    ];
  }, [stats, getTotalCount, getPendingCount, getVerifiedCount, getPercentageVerified]);

  const handleVerify = (signature: any) => {
    setSelectedSignature(signature);
    setShowVerifyDialog(true);
  };

  const handleReject = (signature: any) => {
    setSelectedSignature(signature);
    setShowRejectDialog(true);
  };

  const handleConfirmVerify = async () => {
    if (selectedSignature) {
      try {
        await verify.mutateAsync({
          specimenId: selectedSignature.id,
          notes: 'Verified by administrator'
        });
        setShowVerifyDialog(false);
        setSelectedSignature(null);
        queryClient.invalidateQueries({ queryKey: ['pending-signatures'] });
        queryClient.invalidateQueries({ queryKey: ['verified-signatures'] });
        queryClient.invalidateQueries({ queryKey: ['signature-stats'] });
        success('Signature verified successfully');
      } catch (err) {
        console.error('❌ [AdminSignatureVerification] Verify failed:', err);
        error('Failed to verify signature');
      }
    }
  };

  const handleConfirmReject = async () => {
    if (selectedSignature && rejectReason.trim()) {
      try {
        await reject.mutateAsync({
          specimenId: selectedSignature.id,
          reason: rejectReason
        });
        setShowRejectDialog(false);
        setSelectedSignature(null);
        setRejectReason('');
        queryClient.invalidateQueries({ queryKey: ['pending-signatures'] });
        queryClient.invalidateQueries({ queryKey: ['verified-signatures'] });
        queryClient.invalidateQueries({ queryKey: ['signature-stats'] });
        success('Signature rejected successfully');
      } catch (err) {
        console.error('❌ [AdminSignatureVerification] Reject failed:', err);
        error('Failed to reject signature');
      }
    }
  };

  const handleRefetch = () => {
    refetch();
    success('Data refreshed');
  };

  const handleDownloadQR = (qrImage: string, signatureId: number) => {
    if (!qrImage) return;
    const link = document.createElement('a');
    link.href = qrImage;
    link.download = `signature-qr-${signatureId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('QR Code downloaded');
  };

  const handleCopyQR = (qrImage: string) => {
    if (!qrImage) return;
    navigator.clipboard.writeText(qrImage).then(() => {
      success('QR Code copied to clipboard!');
    }).catch(() => {
      error('Failed to copy QR Code');
    });
  };

  const truncateUserAgent = (ua: string | null | undefined) => {
    if (!ua) return null;
    if (ua.length > 50) return ua.substring(0, 50) + '...';
    return ua;
  };

  const renderSignatureTable = (signatures: any[], showActions: boolean = true) => {
    if (signatures.length === 0) {
      return (
        <div className="text-center py-16">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-800">
              {activeTab === 'pending' ? (
                <Clock className="h-12 w-12 text-gray-400" />
              ) : activeTab === 'verified' ? (
                <ShieldCheck className="h-12 w-12 text-gray-400" />
              ) : (
                <FileSignature className="h-12 w-12 text-gray-400" />
              )}
            </div>
          </div>
          <h3 className="text-lg font-semibold dark:text-white">
            {activeTab === 'all' ? 'No Signatures Found' :
              activeTab === 'pending' ? 'No Pending Signatures' : 'No Verified Signatures'}
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            {searchQuery ? 'Try adjusting your search or filter.' :
              activeTab === 'all' ? 'No signatures have been submitted yet.' :
                activeTab === 'pending' ? 'All signatures have been verified.' : 'No signatures have been verified yet.'}
          </p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-gray-800/50 hover:bg-transparent">
              <TableHead className="min-w-[200px] py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">User</TableHead>
              <TableHead className="min-w-[100px] py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Signature</TableHead>
              <TableHead className="min-w-[120px] py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Status</TableHead>
              <TableHead className="min-w-[120px] py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Submitted</TableHead>
              {activeTab === 'verified' && <TableHead className="min-w-[120px] py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Verified At</TableHead>}
              {activeTab === 'all' && <TableHead className="min-w-[120px] py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Verified At</TableHead>}
              <TableHead className="min-w-[180px] py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Forensic Details</TableHead>
              {(activeTab === 'verified' || activeTab === 'all') && <TableHead className="min-w-[80px] py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">QR</TableHead>}
              <TableHead className="min-w-[140px] py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {signatures.map((signature: any, index: number) => {
              const statusConfig = getStatusBadge(signature.status);
              const StatusIcon = statusConfig.icon;
              const hasQR = signature.qr_code?.image;
              const isPending = signature.status === 'pending';
              const hasIp = signature?.ip_address && signature.ip_address !== null;
              const hasUa = signature?.user_agent && signature.user_agent !== null;

              return (
                <motion.tr
                  key={signature.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors group",
                    isPending && "bg-amber-50/30 dark:bg-amber-900/5"
                  )}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 ring-2 ring-gray-200 dark:ring-gray-700">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-bold">
                          {signature.user?.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium dark:text-white">{signature.user?.full_name || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {signature.user?.email || 'No email'}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => {
                        setSelectedSignature(signature);
                        setShowImageDialog(true);
                      }}
                      className="relative group"
                    >
                      <div className="w-16 h-10 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800 flex items-center justify-center hover:shadow-lg transition-all duration-200">
                        {signature.signature_image_url ? (
                          <img
                            src={signature.signature_image_url}
                            alt="Signature"
                            className="max-w-full max-h-full object-contain p-1"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder-signature.png';
                            }}
                          />
                        ) : (
                          <FileSignature className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center backdrop-blur-sm">
                        <Eye className="h-4 w-4 text-white" />
                      </div>
                    </button>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium",
                      statusConfig.className
                    )}>
                      <StatusIcon className="h-3 w-3" />
                      {statusConfig.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {format(new Date(signature.created_at), 'PP')}
                      </span>
                      <span className="text-xs text-gray-400">
                        {format(new Date(signature.created_at), 'p')}
                      </span>
                    </div>
                  </TableCell>
                  {(activeTab === 'verified' || activeTab === 'all') && (
                    <TableCell>
                      {signature.verified_at ? (
                        <div className="flex flex-col">
                          <span className="text-sm text-emerald-600 dark:text-emerald-400">
                            {format(new Date(signature.verified_at), 'PP')}
                          </span>
                          <span className="text-xs text-gray-400">
                            {format(new Date(signature.verified_at), 'p')}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </TableCell>
                  )}
                  <TableCell>
                    {(hasIp || hasUa) ? (
                      <div className="flex flex-col gap-1 max-w-[180px]">
                        {hasIp && (
                          <div className="flex items-center gap-1.5 text-xs">
                            <Fingerprint className="h-3 w-3 text-blue-500 dark:text-blue-400 shrink-0" />
                            <span className="font-mono text-muted-foreground truncate">
                              {signature.ip_address}
                            </span>
                          </div>
                        )}
                        {hasUa && (
                          <div className="flex items-start gap-1.5 text-xs">
                            <Smartphone className="h-3 w-3 text-purple-500 dark:text-purple-400 shrink-0 mt-0.5" />
                            <span className="text-muted-foreground truncate" title={signature.user_agent}>
                              {truncateUserAgent(signature.user_agent)}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">No forensic data</span>
                    )}
                  </TableCell>
                  {(activeTab === 'verified' || activeTab === 'all') && (
                    <TableCell>
                      {hasQR ? (
                        <button
                          onClick={() => {
                            setSelectedSignature(signature);
                            setShowQRDialog(true);
                          }}
                          className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors text-sm"
                        >
                          <QrCode className="h-4 w-4" />
                          <span className="hidden sm:inline">View</span>
                        </button>
                      ) : (
                        <span className="text-xs text-muted-foreground">No QR</span>
                      )}
                    </TableCell>
                  )}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {isPending && (
                        <>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm shadow-emerald-600/20"
                                  onClick={() => handleVerify(signature)}
                                  disabled={verify.isPending}
                                >
                                  {verify.isPending ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <Check className="h-3.5 w-3.5" />
                                  )}
                                  Verify
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="rounded-xl">Approve this signature</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="gap-1.5 rounded-lg shadow-sm shadow-rose-600/20"
                                  onClick={() => handleReject(signature)}
                                  disabled={reject.isPending}
                                >
                                  {reject.isPending ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <X className="h-3.5 w-3.5" />
                                  )}
                                  Reject
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="rounded-xl">Reject this signature</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </>
                      )}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-lg hover:bg-muted/50"
                              onClick={() => {
                                setSelectedSignature(signature);
                                setShowImageDialog(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="rounded-xl">View full details</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </motion.tr>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  };

  if (isLoading) {
    return (
      <PageTemplate
        title="Signature Verification"
        description="Verify and manage user signature specimens"
        icon={<FileSignature className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />}
        background="gradient"
        variant="default"
      >
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            <p className="text-sm text-muted-foreground">Loading signatures...</p>
          </div>
        </div>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title="Signature Verification"
      description="Verify and manage user signature specimens with full forensic tracking"
      icon={<FileSignature className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />}
      background="gradient"
      variant="default"
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Signatures' },
      ]}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefetch}
            className="gap-2 rounded-xl shadow-sm dark:border-gray-700 dark:hover:bg-gray-800"
            disabled={isLoading}
          >
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
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
          columns={4}
          variant="default"
          formatCompact={true}
          tagOrientation="none"
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
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px] h-11 rounded-xl dark:bg-gray-900 dark:border-gray-700">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
                className="gap-2 h-11 rounded-xl dark:border-gray-700 dark:hover:bg-gray-800"
              >
                <Filter className="h-4 w-4" />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3 rounded-xl bg-gray-100 dark:bg-gray-800/50 p-1">
            <TabsTrigger
              value="all"
              className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm"
            >
              <FileSignature className="h-4 w-4 mr-2" />
              All
              {getTotalCount() > 0 && (
                <Badge className="ml-2 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0">
                  {getTotalCount()}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="pending"
              className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm"
            >
              <Clock className="h-4 w-4 mr-2" />
              Pending
              {getPendingCount() > 0 && (
                <Badge className="ml-2 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0">
                  {getPendingCount()}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="verified"
              className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm"
            >
              <ShieldCheck className="h-4 w-4 mr-2" />
              Verified
              {getVerifiedCount() > 0 && (
                <Badge className="ml-2 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0">
                  {getVerifiedCount()}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <Card className="border-0 shadow-xl rounded-2xl overflow-hidden bg-gradient-to-br from-white to-gray-50/30 dark:from-gray-900 dark:to-gray-800/30 relative">
              <WrappedCornerTag label="SIGNATURES" color="blue" position="top-left" size="lg" />
              <CardHeader className="border-b border-border/50 bg-muted/20 pt-8">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileSignature className="h-5 w-5 text-blue-600" />
                      All Signatures
                      <Badge className="ml-2 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        {filteredSignatures.length} total
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Complete view of all signature submissions with forensic data
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {renderSignatureTable(filteredSignatures, true)}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending" className="mt-4">
            <Card className="border-0 shadow-xl rounded-2xl overflow-hidden bg-gradient-to-br from-white to-gray-50/30 dark:from-gray-900 dark:to-gray-800/30 relative">
              <WrappedCornerTag label="PENDING" color="amber" position="top-left" size="lg" />
              <CardHeader className="border-b border-border/50 bg-muted/20 pt-8">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="h-5 w-5 text-amber-600" />
                      Pending Signatures
                      {getPendingCount() > 0 && (
                        <Badge className="ml-2 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                          {getPendingCount()} awaiting review
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      Review user signatures, verify IP and device details before approval
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {renderSignatureTable(filteredSignatures, true)}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="verified" className="mt-4">
            <Card className="border-0 shadow-xl rounded-2xl overflow-hidden bg-gradient-to-br from-white to-gray-50/30 dark:from-gray-900 dark:to-gray-800/30 relative">
              <WrappedCornerTag label="VERIFIED" color="emerald" position="top-left" size="lg" />
              <CardHeader className="border-b border-border/50 bg-muted/20 pt-8">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-emerald-600" />
                      Verified Signatures
                      {getVerifiedCount() > 0 && (
                        <Badge className="ml-2 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                          {getVerifiedCount()} verified
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      Complete audit trail including IP, device, and verification history
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {renderSignatureTable(filteredSignatures, false)}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Verify Dialog - No Tags */}
      <Dialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
        <DialogContent className="rounded-2xl shadow-2xl border-0 dark:bg-gray-900">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-600">
              <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                <ShieldCheck className="h-5 w-5" />
              </div>
              Verify Signature
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to verify this signature?
              This action will approve the signature and make it available for use.
            </DialogDescription>
          </DialogHeader>
          {selectedSignature && (
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-border">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 ring-2 ring-background">
                    <AvatarFallback className="bg-blue-500 text-white font-bold">
                      {selectedSignature.user?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium dark:text-white">{selectedSignature.user?.full_name || 'Unknown'}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" /> {selectedSignature.user?.email || 'No email'}
                    </p>
                  </div>
                </div>
                {(selectedSignature?.ip_address || selectedSignature?.user_agent) && (
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    {selectedSignature.ip_address && (
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Fingerprint className="h-3 w-3" /> {selectedSignature.ip_address}
                      </div>
                    )}
                    {selectedSignature.user_agent && (
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Smartphone className="h-3 w-3" /> {truncateUserAgent(selectedSignature.user_agent)}
                      </div>
                    )}
                  </div>
                )}
              </div>
              {selectedSignature.signature_image_url && (
                <div className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-border shadow-sm">
                  <img
                    src={selectedSignature.signature_image_url}
                    alt="Signature"
                    className="max-h-24 object-contain mx-auto"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-signature.png';
                    }}
                  />
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVerifyDialog(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={handleConfirmVerify}
              disabled={verify.isPending}
              className="gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20"
            >
              {verify.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              {verify.isPending ? 'Verifying...' : 'Verify Signature'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog - No Tags */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="rounded-2xl shadow-2xl border-0 dark:bg-gray-900">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600">
              <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900/30">
                <XCircle className="h-5 w-5" />
              </div>
              Reject Signature
            </DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this signature.
            </DialogDescription>
          </DialogHeader>
          {selectedSignature && (
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-border">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 ring-2 ring-background">
                    <AvatarFallback className="bg-blue-500 text-white font-bold">
                      {selectedSignature.user?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium dark:text-white">{selectedSignature.user?.full_name || 'Unknown'}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" /> {selectedSignature.user?.email || 'No email'}
                    </p>
                  </div>
                </div>
              </div>
              {selectedSignature.signature_image_url && (
                <div className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-border shadow-sm">
                  <img
                    src={selectedSignature.signature_image_url}
                    alt="Signature"
                    className="max-h-24 object-contain mx-auto"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-signature.png';
                    }}
                  />
                </div>
              )}
              <div>
                <label className="text-sm font-medium dark:text-white">Rejection Reason</label>
                <textarea
                  className="w-full mt-1.5 p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 resize-none transition-all"
                  rows={3}
                  placeholder="Enter reason for rejection..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmReject}
              disabled={reject.isPending || !rejectReason.trim()}
              className="gap-2 rounded-xl shadow-lg shadow-rose-600/20"
            >
              {reject.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <X className="h-4 w-4" />
              )}
              {reject.isPending ? 'Rejecting...' : 'Reject Signature'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Preview Dialog - No Tags */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="rounded-2xl shadow-2xl border-0 max-w-md max-h-[90vh] overflow-y-auto dark:bg-gray-900">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-600" />
              Signature Preview & Audit
            </DialogTitle>
            <DialogDescription>
              Full forensic details for {selectedSignature?.user?.full_name || 'User'}'s signature
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center p-2 space-y-4">
            {selectedSignature && (
              <>
                <div className="w-full bg-white dark:bg-gray-900 rounded-2xl border-2 border-dashed border-border shadow-lg flex items-center justify-center p-6 relative group">
                  {selectedSignature.signature_image_url ? (
                    <img
                      src={selectedSignature.signature_image_url}
                      alt="Signature"
                      className="max-h-40 object-contain"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-signature.png';
                      }}
                    />
                  ) : (
                    <FileSignature className="h-16 w-16 text-gray-400" />
                  )}
                </div>

                <div className="w-full space-y-2 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-border">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <History className="h-3 w-3" /> Signature Timeline
                  </h4>
                  <div className="space-y-2 mt-2">
                    <div className="flex justify-between items-center text-xs border-b border-border/50 pb-1">
                      <span className="text-muted-foreground">Submitted</span>
                      <span className="font-medium dark:text-white">
                        {format(new Date(selectedSignature.created_at), 'PPp')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs border-b border-border/50 pb-1">
                      <span className="text-muted-foreground">Status</span>
                      <Badge className={cn(
                        "text-[10px] px-2 py-0.5",
                        getStatusBadge(selectedSignature.status).className
                      )}>
                        {getStatusBadge(selectedSignature.status).label}
                      </Badge>
                    </div>
                    {selectedSignature.verified_at && (
                      <div className="flex justify-between items-center text-xs border-b border-border/50 pb-1">
                        <span className="text-muted-foreground">Verified At</span>
                        <span className="font-medium text-emerald-600 dark:text-emerald-400">
                          {format(new Date(selectedSignature.verified_at), 'PPp')}
                        </span>
                      </div>
                    )}
                    {selectedSignature.verified_by && (
                      <div className="flex justify-between items-center text-xs border-b border-border/50 pb-1">
                        <span className="text-muted-foreground">Verified By</span>
                        <span className="font-medium dark:text-white">
                          {selectedSignature.verified_by.full_name}
                        </span>
                      </div>
                    )}
                    {selectedSignature.ip_address && (
                      <div className="flex justify-between items-center text-xs border-b border-border/50 pb-1">
                        <span className="text-muted-foreground">IP Address</span>
                        <span className="font-mono text-xs dark:text-white">
                          {selectedSignature.ip_address}
                        </span>
                      </div>
                    )}
                    {selectedSignature.user_agent && (
                      <div className="flex justify-between items-start text-xs">
                        <span className="text-muted-foreground shrink-0">Device</span>
                        <span className="font-mono text-xs dark:text-white text-right max-w-[200px] break-words truncate" title={selectedSignature.user_agent}>
                          {truncateUserAgent(selectedSignature.user_agent)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowImageDialog(false)} className="rounded-xl">
              Close
            </Button>
            {selectedSignature?.status === 'pending' && (
              <Button
                className="gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20"
                onClick={() => {
                  setShowImageDialog(false);
                  handleVerify(selectedSignature);
                }}
              >
                <Check className="h-4 w-4" />
                Verify
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog - No Tags */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="rounded-2xl shadow-xl border-0 max-w-md overflow-hidden p-0 dark:bg-gray-900">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-white text-base">
                <QrCode className="h-5 w-5" />
                Verification QR Code
              </DialogTitle>
              <DialogDescription className="text-blue-100 text-xs">
                {selectedSignature?.user?.full_name || 'User'}'s digital signature pass
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="flex flex-col items-center p-6 bg-gray-50/30 dark:bg-gray-800/30">
            {selectedSignature?.qr_code?.image ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="relative group"
              >
                <div className="w-48 h-48 bg-white dark:bg-gray-900 rounded-xl p-3 shadow-md border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                  <img
                    src={selectedSignature.qr_code.image}
                    alt="Signature QR Code"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-qr.png';
                    }}
                  />
                </div>
                <div className="absolute -top-2 -right-2 bg-emerald-500 rounded-full p-1.5 shadow-md shadow-emerald-500/30">
                  <ShieldCheck className="h-4 w-4 text-white" />
                </div>
              </motion.div>
            ) : (
              <div className="w-48 h-48 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-xl">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            )}

            <div className="mt-4 text-center space-y-3 w-full max-w-xs">
              <div>
                <p className="text-sm font-medium dark:text-white">Scan to Verify</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Use your phone camera to validate this signature instantly.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 text-[10px] text-muted-foreground">
                {selectedSignature?.verified_at && (
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle className="h-3 w-3" />
                    {format(new Date(selectedSignature.verified_at), 'PP')}
                  </span>
                )}
                {selectedSignature?.verified_by && (
                  <span className="flex items-center gap-1">
                    <UserCheck className="h-3 w-3" />
                    {selectedSignature.verified_by.full_name}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-center gap-2 pt-1">
                <Button
                  variant="default"
                  size="sm"
                  className="gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white h-8 px-3 text-xs shadow-sm shadow-blue-600/20"
                  onClick={() => handleDownloadQR(selectedSignature.qr_code.image, selectedSignature.id)}
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 rounded-lg h-8 px-3 text-xs shadow-sm"
                  onClick={() => handleCopyQR(selectedSignature.qr_code.image)}
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter className="p-4 pt-0 bg-gray-50/50 dark:bg-gray-900/50">
            <Button variant="ghost" size="sm" onClick={() => setShowQRDialog(false)} className="rounded-lg text-xs h-8">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTemplate>
  );
}
