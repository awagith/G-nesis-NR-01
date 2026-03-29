import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { diagnosisService } from '@/services/diagnosis.service'
import { useAuth } from '@/hooks/useAuth'
import type { PsychosocialDiagnosis, PsychosocialRisk } from '@/types'

export const diagnosisKeys = {
  all: ['diagnosis'] as const,
  byOrg: (orgId: string) => [...diagnosisKeys.all, 'org', orgId] as const,
  detail: (id: string) => [...diagnosisKeys.all, 'detail', id] as const,
  risks: {
    all: ['risks'] as const,
    byOrg: (orgId: string) => [...diagnosisKeys.risks.all, 'org', orgId] as const,
    byDiagnosis: (diagId: string) => [...diagnosisKeys.risks.all, 'diagnosis', diagId] as const,
  },
}

export function useDiagnoses(organizationId: string) {
  return useQuery({
    queryKey: diagnosisKeys.byOrg(organizationId),
    queryFn: () => diagnosisService.listByOrganization(organizationId),
    enabled: !!organizationId,
    select: r => r.data,
  })
}

export function useDiagnosis(id: string) {
  return useQuery({
    queryKey: diagnosisKeys.detail(id),
    queryFn: () => diagnosisService.get(id),
    enabled: !!id,
    select: r => r.data,
  })
}

export function useRisks(organizationId: string) {
  return useQuery({
    queryKey: diagnosisKeys.risks.byOrg(organizationId),
    queryFn: () => diagnosisService.listRisksByOrganization(organizationId),
    enabled: !!organizationId,
    select: r => r.data,
  })
}

export function useRisksByDiagnosis(diagnosisId: string) {
  return useQuery({
    queryKey: diagnosisKeys.risks.byDiagnosis(diagnosisId),
    queryFn: () => diagnosisService.listRisksByDiagnosis(diagnosisId),
    enabled: !!diagnosisId,
    select: r => r.data,
  })
}

export function useCreateDiagnosis() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (payload: Omit<PsychosocialDiagnosis, 'id' | 'created_at' | 'updated_at'>) =>
      diagnosisService.create(payload, user!.id),
    onSuccess: (_, { organization_id }) => {
      queryClient.invalidateQueries({ queryKey: diagnosisKeys.byOrg(organization_id) })
    },
  })
}

export function useUpdateDiagnosisStatus() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: ({
      id,
      status,
      organizationId,
    }: {
      id: string
      status: PsychosocialDiagnosis['status']
      organizationId: string
    }) => diagnosisService.updateStatus(id, status, user!.id).then(r => ({ ...r, organizationId })),
    onSuccess: (result, { id, organizationId }) => {
      queryClient.invalidateQueries({ queryKey: diagnosisKeys.byOrg(organizationId) })
      queryClient.invalidateQueries({ queryKey: diagnosisKeys.detail(id) })
    },
  })
}

export function useCreateRisk() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (payload: Omit<PsychosocialRisk, 'id' | 'created_at'>) =>
      diagnosisService.createRisk(payload, user!.id),
    onSuccess: (_, { organization_id, diagnosis_id }) => {
      queryClient.invalidateQueries({ queryKey: diagnosisKeys.risks.byOrg(organization_id) })
      if (diagnosis_id) {
        queryClient.invalidateQueries({ queryKey: diagnosisKeys.risks.byDiagnosis(diagnosis_id) })
      }
    },
  })
}
