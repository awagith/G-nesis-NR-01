import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { documentService } from '@/services/document.service'
import { useAuth } from '@/hooks/useAuth'

export const documentKeys = {
  all: ['documents'] as const,
  byOrg: (orgId: string) => [...documentKeys.all, 'org', orgId] as const,
  byType: (orgId: string, type: string) => [...documentKeys.all, 'org', orgId, type] as const,
}

export function useDocuments(organizationId: string) {
  return useQuery({
    queryKey: documentKeys.byOrg(organizationId),
    queryFn: () => documentService.listByOrganization(organizationId),
    enabled: !!organizationId,
    select: r => r.data,
  })
}

export function useDocumentsByType(organizationId: string, type: string) {
  return useQuery({
    queryKey: documentKeys.byType(organizationId, type),
    queryFn: () => documentService.listByType(organizationId, type),
    enabled: !!organizationId && !!type,
    select: r => r.data,
  })
}

export function useUploadDocument() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (params: { file: File; organizationId: string; type: string }) =>
      documentService.upload({ ...params, uploadedBy: user!.id }),
    onSuccess: (_, { organizationId }) => {
      queryClient.invalidateQueries({ queryKey: documentKeys.byOrg(organizationId) })
    },
  })
}

export function useRemoveDocument() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: ({
      id,
      storagePath,
      organizationId,
    }: {
      id: string
      storagePath: string
      organizationId: string
    }) =>
      documentService
        .remove(id, storagePath, user!.id, organizationId)
        .then(r => ({ ...r, organizationId })),
    onSuccess: result => {
      queryClient.invalidateQueries({ queryKey: documentKeys.byOrg(result.organizationId) })
    },
  })
}
