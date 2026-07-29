// frontend/src/hooks/useGoodsReceived.ts

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { goodsReceivedService } from '@/services/goodsReceived.service';
import { useToast } from '@/components/ui/toast-context';
import type {
  GoodsReceivedNote,
  ServiceAcknowledgmentNote,
  GoodsReceivedFilters,
  GRNSummary,
  CreateGoodsReceivedData,
  InspectGoodsData,
  RateServiceData,
} from '@/types/goodsReceived.types';
import type { PaginatedResponse } from '@/types/common.types';

export const GOODS_RECEIVED_QUERY_KEY = 'goods-received';
export const SERVICE_ACKNOWLEDGMENT_QUERY_KEY = 'service-acknowledgments';

// ============================================
// GRN QUERIES
// ============================================

export const useGrns = (
  filters?: GoodsReceivedFilters,
  options?: Omit<UseQueryOptions<PaginatedResponse<GoodsReceivedNote>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: [GOODS_RECEIVED_QUERY_KEY, filters],
    queryFn: () => goodsReceivedService.getGrns(filters),
    ...options,
  });
};

export const useGrn = (
  id: number,
  options?: Omit<UseQueryOptions<GoodsReceivedNote>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['grn', id],
    queryFn: () => goodsReceivedService.getGrnById(id),
    enabled: !!id,
    ...options,
  });
};

export const useGrnSummary = (
  id: number,
  options?: Omit<UseQueryOptions<GRNSummary>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['grn-summary', id],
    queryFn: () => goodsReceivedService.getGrnSummary(id),
    enabled: !!id,
    ...options,
  });
};

export const usePendingGrns = (
  options?: Omit<UseQueryOptions<GoodsReceivedNote[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['pending-grns'],
    queryFn: () => goodsReceivedService.getPendingGrns(),
    ...options,
  });
};

export const useGrnsByPurchaseOrder = (
  purchaseOrderId: number,
  options?: Omit<UseQueryOptions<GoodsReceivedNote[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['grns-by-purchase-order', purchaseOrderId],
    queryFn: () => goodsReceivedService.getGrnsByPurchaseOrder(purchaseOrderId),
    enabled: !!purchaseOrderId,
    ...options,
  });
};

// ============================================
// SAN QUERIES
// ============================================

export const useSans = (
  filters?: GoodsReceivedFilters,
  options?: Omit<UseQueryOptions<PaginatedResponse<ServiceAcknowledgmentNote>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: [SERVICE_ACKNOWLEDGMENT_QUERY_KEY, filters],
    queryFn: () => goodsReceivedService.getSans(filters),
    ...options,
  });
};

export const useSan = (
  id: number,
  options?: Omit<UseQueryOptions<ServiceAcknowledgmentNote>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['san', id],
    queryFn: () => goodsReceivedService.getSanById(id),
    enabled: !!id,
    ...options,
  });
};

export const useSanSummary = (
  id: number,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['san-summary', id],
    queryFn: () => goodsReceivedService.getSanSummary(id),
    enabled: !!id,
    ...options,
  });
};

export const usePendingSans = (
  options?: Omit<UseQueryOptions<ServiceAcknowledgmentNote[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['pending-sans'],
    queryFn: () => goodsReceivedService.getPendingSans(),
    ...options,
  });
};

export const useSansByPurchaseOrder = (
  purchaseOrderId: number,
  options?: Omit<UseQueryOptions<ServiceAcknowledgmentNote[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['sans-by-purchase-order', purchaseOrderId],
    queryFn: () => goodsReceivedService.getSansByPurchaseOrder(purchaseOrderId),
    enabled: !!purchaseOrderId,
    ...options,
  });
};

// ============================================
// GRN MUTATIONS
// ============================================

export const useCreateGrn = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (data: CreateGoodsReceivedData) => goodsReceivedService.createGrn(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [GOODS_RECEIVED_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['grns-by-purchase-order', data.purchase_order_id] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order', data.purchase_order_id] });
      queryClient.invalidateQueries({ queryKey: ['procurement-status'] });
      success(`GRN "${data.grn_number}" created successfully`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to create GRN');
    },
  });
};

export const useSubmitGrn = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: number) => goodsReceivedService.submitGrn(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [GOODS_RECEIVED_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['grn', data.id] });
      queryClient.invalidateQueries({ queryKey: ['pending-grns'] });
      queryClient.invalidateQueries({ queryKey: ['procurement-approvals'] });
      success(`GRN "${data.grn_number}" submitted for approval`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to submit GRN for approval');
    },
  });
};

export const useApproveGrn = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, comment }: { id: number; comment?: string }) =>
      goodsReceivedService.approveGrn(id, comment),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [GOODS_RECEIVED_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['grn', data.id] });
      queryClient.invalidateQueries({ queryKey: ['pending-grns'] });
      queryClient.invalidateQueries({ queryKey: ['procurement-approvals'] });
      success(`GRN "${data.grn_number}" approved successfully`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to approve GRN');
    },
  });
};

export const useRejectGrn = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      goodsReceivedService.rejectGrn(id, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [GOODS_RECEIVED_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['grn', data.id] });
      queryClient.invalidateQueries({ queryKey: ['pending-grns'] });
      success(`GRN "${data.grn_number}" rejected`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to reject GRN');
    },
  });
};

export const useInspectGoods = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: InspectGoodsData }) =>
      goodsReceivedService.inspectGoods(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [GOODS_RECEIVED_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['grn', data.id] });
      queryClient.invalidateQueries({ queryKey: ['grn-summary', data.id] });
      success(`Goods inspected successfully`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to inspect goods');
    },
  });
};

export const useGetGrnPdf = () => {
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: number) => goodsReceivedService.getGrnPdf(id),
    onSuccess: () => {
      success('PDF downloaded successfully');
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to generate PDF');
    },
  });
};

// ============================================
// SAN MUTATIONS
// ============================================

export const useCreateSan = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (data: CreateGoodsReceivedData) => goodsReceivedService.createSan(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [SERVICE_ACKNOWLEDGMENT_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['sans-by-purchase-order', data.purchase_order_id] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order', data.purchase_order_id] });
      queryClient.invalidateQueries({ queryKey: ['procurement-status'] });
      success(`SAN "${data.san_number}" created successfully`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to create SAN');
    },
  });
};

export const useSubmitSan = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: number) => goodsReceivedService.submitSan(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [SERVICE_ACKNOWLEDGMENT_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['san', data.id] });
      queryClient.invalidateQueries({ queryKey: ['pending-sans'] });
      queryClient.invalidateQueries({ queryKey: ['procurement-approvals'] });
      success(`SAN "${data.san_number}" submitted for approval`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to submit SAN for approval');
    },
  });
};

export const useApproveSan = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, comment }: { id: number; comment?: string }) =>
      goodsReceivedService.approveSan(id, comment),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [SERVICE_ACKNOWLEDGMENT_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['san', data.id] });
      queryClient.invalidateQueries({ queryKey: ['pending-sans'] });
      queryClient.invalidateQueries({ queryKey: ['procurement-approvals'] });
      success(`SAN "${data.san_number}" approved successfully`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to approve SAN');
    },
  });
};

export const useRejectSan = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      goodsReceivedService.rejectSan(id, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [SERVICE_ACKNOWLEDGMENT_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['san', data.id] });
      queryClient.invalidateQueries({ queryKey: ['pending-sans'] });
      success(`SAN "${data.san_number}" rejected`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to reject SAN');
    },
  });
};

export const useRateService = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: RateServiceData }) =>
      goodsReceivedService.rateService(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [SERVICE_ACKNOWLEDGMENT_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['san', data.id] });
      queryClient.invalidateQueries({ queryKey: ['san-summary', data.id] });
      success(`Service quality rated successfully`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to rate service quality');
    },
  });
};

export const useGetSanPdf = () => {
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: number) => goodsReceivedService.getSanPdf(id),
    onSuccess: () => {
      success('PDF downloaded successfully');
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to generate PDF');
    },
  });
};
