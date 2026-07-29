// frontend/src/hooks/useContract.ts

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { contractService } from '@/services/contract.service';
import { useToast } from '@/components/ui/toast-context';
import type {
  Contract,
  ContractFilters,
  ContractSummary,
  CreateContractData,
} from '@/types/contract.types';
import type { PaginatedResponse } from '@/types/common.types';

export const CONTRACTS_QUERY_KEY = 'contracts';

// ============================================
// QUERIES
// ============================================

export const useContracts = (
  filters?: ContractFilters,
  options?: Omit<UseQueryOptions<PaginatedResponse<Contract>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: [CONTRACTS_QUERY_KEY, filters],
    queryFn: () => contractService.getAll(filters),
    ...options,
  });
};

export const useContract = (
  id: number,
  options?: Omit<UseQueryOptions<Contract>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['contract', id],
    queryFn: () => contractService.getById(id),
    enabled: !!id,
    ...options,
  });
};

export const useContractSummary = (
  id: number,
  options?: Omit<UseQueryOptions<ContractSummary>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['contract-summary', id],
    queryFn: () => contractService.getSummary(id),
    enabled: !!id,
    ...options,
  });
};

export const useActiveContracts = (
  options?: Omit<UseQueryOptions<Contract[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['active-contracts'],
    queryFn: () => contractService.getActive(),
    ...options,
  });
};

export const useExpiringContracts = (
  days: number = 30,
  options?: Omit<UseQueryOptions<Contract[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['expiring-contracts', days],
    queryFn: () => contractService.getExpiring(days),
    ...options,
  });
};

export const useRenewableContracts = (
  options?: Omit<UseQueryOptions<Contract[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['renewable-contracts'],
    queryFn: () => contractService.getRenewable(),
    ...options,
  });
};

export const useContractsByRequisition = (
  requisitionId: number,
  options?: Omit<UseQueryOptions<Contract[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['contracts-by-requisition', requisitionId],
    queryFn: () => contractService.getByRequisition(requisitionId),
    enabled: !!requisitionId,
    ...options,
  });
};

export const useContractsBySupplier = (
  supplierId: number,
  options?: Omit<UseQueryOptions<Contract[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['contracts-by-supplier', supplierId],
    queryFn: () => contractService.getBySupplier(supplierId),
    enabled: !!supplierId,
    ...options,
  });
};

// ============================================
// MUTATIONS
// ============================================

export const useCreateContract = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (data: CreateContractData) => contractService.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [CONTRACTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['contracts-by-requisition', data.requisition_id] });
      queryClient.invalidateQueries({ queryKey: ['contracts-by-supplier', data.supplier_id] });
      queryClient.invalidateQueries({ queryKey: ['active-contracts'] });
      queryClient.invalidateQueries({ queryKey: ['procurement-status'] });
      success(`Contract "${data.contract_number}" created successfully`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to create contract');
    },
  });
};

export const useApproveContract = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: number) => contractService.approve(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [CONTRACTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['contract', data.id] });
      queryClient.invalidateQueries({ queryKey: ['contract-summary', data.id] });
      queryClient.invalidateQueries({ queryKey: ['active-contracts'] });
      queryClient.invalidateQueries({ queryKey: ['procurement-approvals'] });
      success(`Contract "${data.contract_number}" approved successfully`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to approve contract');
    },
  });
};

export const useActivateContract = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: number) => contractService.activate(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [CONTRACTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['contract', data.id] });
      queryClient.invalidateQueries({ queryKey: ['contract-summary', data.id] });
      queryClient.invalidateQueries({ queryKey: ['active-contracts'] });
      success(`Contract "${data.contract_number}" activated successfully`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to activate contract');
    },
  });
};

export const useCompleteContract = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: number) => contractService.complete(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [CONTRACTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['contract', data.id] });
      queryClient.invalidateQueries({ queryKey: ['contract-summary', data.id] });
      queryClient.invalidateQueries({ queryKey: ['active-contracts'] });
      success(`Contract "${data.contract_number}" completed successfully`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to complete contract');
    },
  });
};

export const useTerminateContract = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      contractService.terminate(id, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [CONTRACTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['contract', data.id] });
      queryClient.invalidateQueries({ queryKey: ['contract-summary', data.id] });
      queryClient.invalidateQueries({ queryKey: ['active-contracts'] });
      success(`Contract "${data.contract_number}" terminated`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to terminate contract');
    },
  });
};

export const useSuspendContract = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      contractService.suspend(id, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [CONTRACTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['contract', data.id] });
      queryClient.invalidateQueries({ queryKey: ['contract-summary', data.id] });
      queryClient.invalidateQueries({ queryKey: ['active-contracts'] });
      success(`Contract "${data.contract_number}" suspended`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to suspend contract');
    },
  });
};

export const useRenewContract = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: number) => contractService.renew(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [CONTRACTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['contract', data.id] });
      queryClient.invalidateQueries({ queryKey: ['contract-summary', data.id] });
      queryClient.invalidateQueries({ queryKey: ['active-contracts'] });
      queryClient.invalidateQueries({ queryKey: ['renewable-contracts'] });
      success(`Contract "${data.contract_number}" renewed successfully`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to renew contract');
    },
  });
};

export const useGetContractPdf = () => {
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: number) => contractService.getPdf(id),
    onSuccess: () => {
      success('PDF downloaded successfully');
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to generate PDF');
    },
  });
};
