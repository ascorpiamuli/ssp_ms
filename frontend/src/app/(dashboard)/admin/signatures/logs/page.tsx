'use client';

import React, { useState, useEffect } from 'react';
import {
  History,
  FileSignature,
  Search,
  Filter,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  RefreshCw,
  Smartphone,
  Fingerprint,
  ShieldCheck,
  AlertCircle,
  Download,
  Eye,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAdminSignature } from '@/hooks/useSignature';
import { useAuthContext } from '@/contexts/AuthContext';
import { PageTemplate } from '@/components/dashboard/PageTemplate';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function SignatureLogsPage() {
  const { user } = useAuthContext();
  const { logs, isLoading, isFetching, refetchLogs } = useAdminSignature();

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Apply filters to logs
  const filteredLogs = (logs || []).filter((log: any) => {
    const userData = log.createdBy || log.created_by || null;

    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      log.action?.toLowerCase().includes(searchLower) ||
      log.message?.toLowerCase().includes(searchLower) ||
      userData?.full_name?.toLowerCase().includes(searchLower) ||
      userData?.email?.toLowerCase().includes(searchLower);

    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;

    const logDate = new Date(log.created_at);
    const fromDate = dateFrom ? new Date(dateFrom) : null;
    const toDate = dateTo ? new Date(dateTo) : null;
    const matchesFrom = !fromDate || logDate >= fromDate;
    const matchesTo = !toDate || logDate <= toDate;

    return matchesSearch && matchesAction && matchesStatus && matchesFrom && matchesTo;
  });

  // Pagination calculations
  const totalFiltered = filteredLogs.length;
  const totalPages = Math.ceil(totalFiltered / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalFiltered);
  const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, actionFilter, statusFilter, dateFrom, dateTo]);

  // Get unique actions for filter dropdown
  const uniqueActions = Array.from(new Set((logs || []).map((log: any) => log.action).filter(Boolean)));

  // Helper: truncate User Agent for clean display
  const truncateUserAgent = (ua: string | null) => {
    if (!ua) return 'Unknown Device';
    if (ua.length > 60) return ua.substring(0, 60) + '...';
    return ua;
  };

  // Helper: human-readable action labels
  const getActionLabel = (action: string) => {
    const map: Record<string, string> = {
      upload: 'Upload',
      verify: 'Verify',
      reject: 'Reject',
      delete: 'Delete',
      qr_generate: 'QR Regenerate',
    };
    return map[action] || action.charAt(0).toUpperCase() + action.slice(1);
  };

  const getActionIcon = (action: string) => {
    const map: Record<string, React.ElementType> = {
      upload: FileSignature,
      verify: ShieldCheck,
      reject: XCircle,
      delete: AlertCircle,
      qr_generate: RefreshCw,
    };
    const Icon = map[action] || History;
    return <Icon className="h-4 w-4" />;
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { label: string; className: string; icon: React.ElementType }> = {
      success: {
        label: 'Success',
        className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
        icon: CheckCircle,
      },
      failed: {
        label: 'Failed',
        className: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800',
        icon: XCircle,
      },
      pending: {
        label: 'Pending',
        className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
        icon: Clock,
      },
    };
    return configs[status] || { label: status, className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400', icon: AlertCircle };
  };

  // Helper to parse data column safely
  const parseLogData = (data: any) => {
    if (!data) return null;
    try {
      return typeof data === 'string' ? JSON.parse(data) : data;
    } catch {
      return data;
    }
  };

  // Safe user extractor
  const getUserFromLog = (log: any) => {
    return log.createdBy || log.created_by || null;
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setActionFilter('all');
    setStatusFilter('all');
    setDateFrom('');
    setDateTo('');
  };

  // Guard state to prevent flashing
  const [isDataReady, setIsDataReady] = useState(false);
  useEffect(() => {
    if (!isLoading) {
      setTimeout(() => setIsDataReady(true), 100);
    }
  }, [isLoading]);

  // Loading State
  if (!isDataReady || isLoading) {
    return (
      <PageTemplate
        title="Signature Verification Logs"
        description="Audit trail of all signature actions"
        icon={<History className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />}
        background="gradient"
        variant="default"
      >
        <div className="flex flex-col items-center justify-center py-32 gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <p className="text-sm text-muted-foreground">Loading audit logs...</p>
        </div>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title="Signature Verification Logs"
      description="Complete audit trail of all signature actions across the system"
      icon={<History className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />}
      background="gradient"
      variant="default"
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 rounded-xl shadow-sm"
            onClick={() => refetchLogs()}
            disabled={isFetching}
          >
            <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 rounded-xl shadow-sm"
            onClick={handleClearFilters}
          >
            <Filter className="h-4 w-4" />
            Clear Filters
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 shadow-lg rounded-2xl bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Logs</p>
                  <p className="text-2xl font-bold mt-1 dark:text-white">{logs?.length || 0}</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  <History className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg rounded-2xl bg-gradient-to-br from-emerald-50/50 to-green-50/50 dark:from-emerald-950/20 dark:to-green-950/20">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Successful</p>
                  <p className="text-2xl font-bold mt-1 dark:text-white text-emerald-600 dark:text-emerald-400">
                    {logs?.filter((l: any) => l.status === 'success').length || 0}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg rounded-2xl bg-gradient-to-br from-rose-50/50 to-red-50/50 dark:from-rose-950/20 dark:to-red-950/20">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Failed</p>
                  <p className="text-2xl font-bold mt-1 dark:text-white text-rose-600 dark:text-rose-400">
                    {logs?.filter((l: any) => l.status === 'failed').length || 0}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400">
                  <XCircle className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg rounded-2xl bg-gradient-to-br from-amber-50/50 to-yellow-50/50 dark:from-amber-950/20 dark:to-yellow-950/20">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Filtered</p>
                  <p className="text-2xl font-bold mt-1 dark:text-white text-amber-600 dark:text-amber-400">
                    {filteredLogs.length}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                  <Filter className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="relative col-span-1 md:col-span-2 lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search action, message, or user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 rounded-xl shadow-sm"
            />
          </div>

          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="rounded-xl shadow-sm">
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              {uniqueActions.map((action) => (
                <SelectItem key={action} value={action}>
                  {getActionLabel(action)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="rounded-xl shadow-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="rounded-xl shadow-sm"
            placeholder="From"
          />
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="rounded-xl shadow-sm"
            placeholder="To"
          />
        </div>

        {/* Logs Table */}
        <Card className="border-0 shadow-xl rounded-2xl overflow-hidden bg-gradient-to-br from-white to-gray-50/30 dark:from-gray-900 dark:to-gray-800/30">
          <CardHeader className="border-b border-border/50 bg-muted/20">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <History className="h-5 w-5 text-blue-600" />
                  Audit Logs
                  <Badge className="ml-2 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0">
                    Showing {paginatedLogs.length} of {totalFiltered} records
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Complete history of all signature actions including IP and device tracking
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {paginatedLogs.length === 0 ? (
              <div className="text-center py-20">
                <div className="flex justify-center mb-4">
                  <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-800">
                    <History className="h-12 w-12 text-gray-400" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold dark:text-white">No logs found</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {searchQuery || actionFilter !== 'all' || statusFilter !== 'all' || dateFrom || dateTo
                    ? 'Try adjusting your filters.'
                    : 'No signature actions have been logged yet.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[140px]">Timestamp</TableHead>
                      <TableHead className="w-[140px]">User</TableHead>
                      <TableHead className="w-[120px]">Action</TableHead>
                      <TableHead className="w-[100px]">Status</TableHead>
                      <TableHead className="w-[200px]">Message</TableHead>
                      <TableHead className="w-[180px]">Forensic Details</TableHead>
                      <TableHead className="w-[60px] text-right">Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedLogs.map((log: any, index: number) => {
                      const statusConfig = getStatusBadge(log.status);
                      const StatusIcon = statusConfig.icon;
                      const actionLabel = getActionLabel(log.action);
                      const parsedData = parseLogData(log.data);
                      const userData = log.createdBy || log.created_by || null;

                      return (
                        <motion.tr
                          key={log.id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: (index % rowsPerPage) * 0.03 }}
                          className="hover:bg-muted/30 transition-colors"
                        >
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium dark:text-white">
                                {format(new Date(log.created_at), 'MMM d, yyyy')}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(log.created_at), 'h:mm a')}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                {userData?.full_name?.charAt(0) || 'U'}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-medium dark:text-white truncate max-w-[80px]">
                                  {userData?.full_name || 'Unknown'}
                                </span>
                                <span className="text-xs text-muted-foreground truncate max-w-[80px]">
                                  {userData?.email || 'N/A'}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className={cn(
                                "p-1.5 rounded-full",
                                log.action === 'upload' && "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
                                log.action === 'verify' && "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
                                log.action === 'reject' && "bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400",
                                log.action === 'delete' && "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
                                log.action === 'qr_generate' && "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
                              )}>
                                {getActionIcon(log.action)}
                              </div>
                              <span className="text-sm font-medium dark:text-white">{actionLabel}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={cn(
                              "flex items-center gap-1.5 px-2 py-0.5 rounded-full font-medium text-xs",
                              statusConfig.className
                            )}>
                              <StatusIcon className="h-3 w-3" />
                              {statusConfig.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground truncate max-w-[180px] block" title={log.message}>
                              {log.message || 'No message'}
                            </span>
                            {parsedData?.specimen_id && (
                              <span className="text-xs text-muted-foreground mt-0.5 block">
                                Specimen ID: {parsedData.specimen_id}
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1 max-w-[160px]">
                              {log.ip_address ? (
                                <div className="flex items-center gap-1.5 text-xs">
                                  <Fingerprint className="h-3 w-3 text-blue-500 dark:text-blue-400 shrink-0" />
                                  <span className="font-mono text-muted-foreground truncate">{log.ip_address}</span>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground italic">No IP captured</span>
                              )}
                              {log.user_agent ? (
                                <div className="flex items-start gap-1.5 text-xs">
                                  <Smartphone className="h-3 w-3 text-purple-500 dark:text-purple-400 shrink-0 mt-0.5" />
                                  <span className="text-muted-foreground truncate" title={log.user_agent}>
                                    {truncateUserAgent(log.user_agent)}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground italic">No device captured</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-lg hover:bg-muted/50"
                                    onClick={() => {
                                      setSelectedLog(log);
                                      setShowDetailDialog(true);
                                    }}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>View full details</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                        </motion.tr>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination Controls */}
        {totalPages > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium dark:text-white">{startIndex + 1}</span> to{' '}
              <span className="font-medium dark:text-white">{endIndex}</span> of{' '}
              <span className="font-medium dark:text-white">{totalFiltered}</span> results
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="rounded-lg"
              >
                First
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="rounded-lg"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium dark:text-white px-2">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="rounded-lg"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="rounded-lg"
              >
                Last
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="rounded-2xl shadow-2xl border-0 max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-blue-600" />
              Log Details
            </DialogTitle>
            <DialogDescription>
              Full audit record for this signature action
            </DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <p className="text-xs text-muted-foreground">Action</p>
                  <p className="font-medium dark:text-white flex items-center gap-2 mt-0.5">
                    {getActionIcon(selectedLog.action)}
                    {getActionLabel(selectedLog.action)}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge className={cn(
                    "mt-0.5 flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium",
                    getStatusBadge(selectedLog.status).className
                  )}>
                    {(() => {
                      const StatusIconBadge = getStatusBadge(selectedLog.status).icon;
                      return <StatusIconBadge className="h-3 w-3" />;
                    })()}
                    {getStatusBadge(selectedLog.status).label}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <p className="text-xs text-muted-foreground">User</p>
                  <p className="font-medium dark:text-white mt-0.5">
                    {selectedLog.createdBy?.full_name || selectedLog.created_by?.full_name || 'Unknown'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedLog.createdBy?.email || selectedLog.created_by?.email || 'N/A'}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <p className="text-xs text-muted-foreground">Timestamp</p>
                  <p className="font-medium dark:text-white mt-0.5">
                    {format(new Date(selectedLog.created_at), 'MMM d, yyyy')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(selectedLog.created_at), 'h:mm:ss a')}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <p className="text-xs text-muted-foreground">IP Address</p>
                  <p className="font-mono text-sm dark:text-white mt-0.5">
                    {selectedLog.ip_address || 'Not captured'}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <p className="text-xs text-muted-foreground">Device</p>
                  <p className="font-mono text-xs dark:text-white mt-0.5 truncate" title={selectedLog.user_agent}>
                    {selectedLog.user_agent ? truncateUserAgent(selectedLog.user_agent) : 'Not captured'}
                  </p>
                </div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-sm">
                <p className="text-xs text-muted-foreground">Message</p>
                <p className="font-medium dark:text-white mt-0.5">{selectedLog.message || 'No message'}</p>
              </div>
              {selectedLog.data && (
                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-sm">
                  <p className="text-xs text-muted-foreground">Data Payload</p>
                  <pre className="text-xs font-mono bg-white dark:bg-gray-900 p-2 rounded-lg mt-0.5 overflow-x-auto border border-border/50">
                    {typeof selectedLog.data === 'string' ? selectedLog.data : JSON.stringify(selectedLog.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)} className="rounded-xl">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTemplate>
  );
}
