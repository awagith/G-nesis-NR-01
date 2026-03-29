import { profileRepository } from '@/repositories/profile.repository'
import type { QueryResult, QueryListResult } from '@/repositories/base.repository'
import type { Profile, UserRole } from '@/types'

export const profileService = {
  getById(id: string): Promise<QueryResult<Profile>> {
    return profileRepository.findById(id)
  },

  listByOrganization(organizationId: string): Promise<QueryListResult<Profile>> {
    return profileRepository.findByOrganization(organizationId)
  },

  listByRole(role: UserRole): Promise<QueryListResult<Profile>> {
    return profileRepository.findByRole(role)
  },

  updateAvatar(id: string, avatarUrl: string): Promise<QueryResult<Profile>> {
    return profileRepository.updateAvatar(id, avatarUrl)
  },

  inviteUser(params: {
    email: string
    name: string
    role: UserRole
    organizationId?: string
  }): Promise<{ error: string | null }> {
    return profileRepository.inviteUser(params)
  },
}
