import { organizationRepository } from '@/repositories/organization.repository'
import { auditRepository } from '@/repositories/audit.repository'
import type { QueryResult, QueryListResult } from '@/repositories/base.repository'
import type { Organization, OrganizationUnit } from '@/types'

export const organizationService = {
  list(): Promise<QueryListResult<Organization>> {
    return organizationRepository.findAllActive()
  },

  listByStatus(status: Organization['status']): Promise<QueryListResult<Organization>> {
    return organizationRepository.findByStatus(status)
  },

  get(id: string): Promise<QueryResult<Organization>> {
    return organizationRepository.findById(id)
  },

  async create(
    payload: Omit<Organization, 'id' | 'created_at' | 'updated_at'>,
    actorId: string
  ): Promise<QueryResult<Organization>> {
    const result = await organizationRepository.create(payload)

    if (result.data) {
      await auditRepository.log({
        userId: actorId,
        action: 'organization.create',
        entityType: 'organization',
        entityId: result.data.id,
        metadata: { name: result.data.name },
      })
    }

    return result
  },

  async update(
    id: string,
    payload: Partial<Omit<Organization, 'id' | 'created_at'>>,
    actorId: string
  ): Promise<QueryResult<Organization>> {
    const result = await organizationRepository.update(id, payload)

    if (result.data) {
      await auditRepository.log({
        userId: actorId,
        action: 'organization.update',
        entityType: 'organization',
        entityId: id,
        metadata: { fields: Object.keys(payload) },
      })
    }

    return result
  },

  // ─── Unidades ──────────────────────────────────────────────────────────────
  listUnits(organizationId: string): Promise<QueryListResult<OrganizationUnit>> {
    return organizationRepository.findUnits(organizationId)
  },

  createUnit(
    payload: Omit<OrganizationUnit, 'id' | 'created_at'>
  ): Promise<QueryResult<OrganizationUnit>> {
    return organizationRepository.createUnit(payload)
  },

  updateUnit(
    id: string,
    payload: Partial<Omit<OrganizationUnit, 'id' | 'created_at'>>
  ): Promise<QueryResult<OrganizationUnit>> {
    return organizationRepository.updateUnit(id, payload)
  },

  deleteUnit(id: string): Promise<{ error: string | null }> {
    return organizationRepository.deleteUnit(id)
  },
}
