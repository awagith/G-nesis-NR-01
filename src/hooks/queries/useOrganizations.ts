import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { organizationService } from '@/services/organization.service'
import { useAuth } from '@/hooks/useAuth'
import type { Organization, OrganizationUnit } from '@/types'

// ─── Query keys centralizadas ─────────────────────────────────────────────────
export const orgKeys = {
  all: ['organizations'] as const,
  lists: () => [...orgKeys.all, 'list'] as const,
  list: (status?: string) => [...orgKeys.lists(), { status }] as const,
  detail: (id: string) => [...orgKeys.all, 'detail', id] as const,
  units: (orgId: string) => [...orgKeys.all, 'units', orgId] as const,
}

// ─── Queries ──────────────────────────────────────────────────────────────────
export function useOrganizations() {
  return useQuery({
    queryKey: orgKeys.list('active'),
    queryFn: () => organizationService.list(),
    select: r => r.data,
  })
}

export function useOrganization(id: string) {
  return useQuery({
    queryKey: orgKeys.detail(id),
    queryFn: () => organizationService.get(id),
    enabled: !!id,
    select: r => r.data,
  })
}

export function useOrganizationUnits(organizationId: string) {
  return useQuery({
    queryKey: orgKeys.units(organizationId),
    queryFn: () => organizationService.listUnits(organizationId),
    enabled: !!organizationId,
    select: r => r.data,
  })
}

// ─── Mutations ────────────────────────────────────────────────────────────────
export function useCreateOrganization() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (payload: Omit<Organization, 'id' | 'created_at' | 'updated_at'>) =>
      organizationService.create(payload, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orgKeys.lists() })
    },
  })
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: ({ id, ...payload }: Partial<Organization> & { id: string }) =>
      organizationService.update(id, payload, user!.id),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: orgKeys.lists() })
      queryClient.invalidateQueries({ queryKey: orgKeys.detail(id) })
    },
  })
}

export function useCreateUnit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: Omit<OrganizationUnit, 'id' | 'created_at'>) =>
      organizationService.createUnit(payload),
    onSuccess: (_, { organization_id }) => {
      queryClient.invalidateQueries({ queryKey: orgKeys.units(organization_id) })
    },
  })
}

export function useDeleteUnit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, organizationId }: { id: string; organizationId: string }) =>
      organizationService.deleteUnit(id).then(r => ({ ...r, organizationId })),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: orgKeys.units(result.organizationId) })
    },
  })
}
