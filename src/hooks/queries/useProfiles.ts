import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { profileRepository } from '@/repositories/profile.repository'
import type { UserRole } from '@/types'

export const profileKeys = {
  all: ['profiles'] as const,
  byOrg: (orgId: string) => [...profileKeys.all, 'org', orgId] as const,
  byRole: (role: UserRole) => [...profileKeys.all, 'role', role] as const,
  detail: (id: string) => [...profileKeys.all, 'detail', id] as const,
}

export function useProfilesByOrganization(organizationId: string) {
  return useQuery({
    queryKey: profileKeys.byOrg(organizationId),
    queryFn: () => profileRepository.findByOrganization(organizationId),
    enabled: !!organizationId,
    select: r => r.data,
  })
}

export function useProfile(id: string) {
  return useQuery({
    queryKey: profileKeys.detail(id),
    queryFn: () => profileRepository.findById(id),
    enabled: !!id,
    select: r => r.data,
  })
}

export function useInviteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: {
      email: string
      name: string
      role: UserRole
      organizationId?: string
    }) => profileRepository.inviteUser(params),
    onSuccess: (_, { organizationId }) => {
      if (organizationId) {
        queryClient.invalidateQueries({ queryKey: profileKeys.byOrg(organizationId) })
      }
    },
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      avatarUrl,
    }: {
      id: string
      avatarUrl: string
    }) => profileRepository.updateAvatar(id, avatarUrl),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: profileKeys.detail(id) })
    },
  })
}
