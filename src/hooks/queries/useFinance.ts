import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { financeRepository } from '@/repositories/finance.repository'
import { crmRepository, contractRepository } from '@/repositories/crm.repository'
import { useAuth } from '@/hooks/useAuth'
import type { CrmContact, Contract, FinancialTransaction } from '@/types'

// ─── Finance ──────────────────────────────────────────────────────────────────
export const financeKeys = {
  all: ['finance'] as const,
  summary: (from: string, to: string) => [...financeKeys.all, 'summary', from, to] as const,
  period: (from: string, to: string) => [...financeKeys.all, 'period', from, to] as const,
  byOrg: (orgId: string) => [...financeKeys.all, 'org', orgId] as const,
}

export function useFinanceSummary(from: string, to: string) {
  return useQuery({
    queryKey: financeKeys.summary(from, to),
    queryFn: () => financeRepository.getSummary(from, to),
    enabled: !!from && !!to,
  })
}

export function useFinanceTransactions(from: string, to: string) {
  return useQuery({
    queryKey: financeKeys.period(from, to),
    queryFn: () => financeRepository.findByPeriod(from, to),
    enabled: !!from && !!to,
    select: r => r.data,
  })
}

export function useCreateTransaction() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (
      payload: Omit<FinancialTransaction, 'id' | 'created_at' | 'created_by'>
    ) => financeRepository.create({ ...payload, created_by: user!.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.all })
    },
  })
}

// ─── CRM ──────────────────────────────────────────────────────────────────────
export const crmKeys = {
  all: ['crm'] as const,
  list: () => [...crmKeys.all, 'list'] as const,
  byStage: (stage: string) => [...crmKeys.all, 'stage', stage] as const,
  detail: (id: string) => [...crmKeys.all, 'detail', id] as const,
  contracts: {
    all: ['contracts'] as const,
    active: () => [...crmKeys.contracts.all, 'active'] as const,
    byOrg: (orgId: string) => [...crmKeys.contracts.all, 'org', orgId] as const,
    expiring: (days: number) => [...crmKeys.contracts.all, 'expiring', days] as const,
  },
}

export function useCrmContacts() {
  return useQuery({
    queryKey: crmKeys.list(),
    queryFn: () => crmRepository.findAll({ orderBy: 'updated_at', orderDir: 'desc' }),
    select: r => r.data,
  })
}

export function useCrmContactsByStage(stage: CrmContact['stage']) {
  return useQuery({
    queryKey: crmKeys.byStage(stage),
    queryFn: () => crmRepository.findByStage(stage),
    select: r => r.data,
  })
}

export function useCreateCrmContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: Omit<CrmContact, 'id' | 'created_at' | 'updated_at'>) =>
      crmRepository.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.list() })
    },
  })
}

export function useUpdateCrmContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...payload }: Partial<CrmContact> & { id: string }) =>
      crmRepository.update(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: crmKeys.list() })
      queryClient.invalidateQueries({ queryKey: crmKeys.detail(id) })
    },
  })
}

export function useActiveContracts() {
  return useQuery({
    queryKey: crmKeys.contracts.active(),
    queryFn: () => contractRepository.findActive(),
    select: r => r.data,
  })
}

export function useExpiringContracts(days = 30) {
  return useQuery({
    queryKey: crmKeys.contracts.expiring(days),
    queryFn: () => contractRepository.findExpiringSoon(days),
    select: r => r.data,
  })
}

export function useCreateContract() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: Omit<Contract, 'id' | 'created_at'>) =>
      contractRepository.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.contracts.all })
    },
  })
}
