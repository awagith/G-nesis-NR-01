import { crmRepository, contractRepository } from '@/repositories/crm.repository'
import { auditRepository } from '@/repositories/audit.repository'
import type { QueryResult, QueryListResult } from '@/repositories/base.repository'
import type { CrmContact, Contract } from '@/types'

export const crmService = {
  // ─── Contacts ─────────────────────────────────────────────────────────────
  listAll(): Promise<QueryListResult<CrmContact>> {
    return crmRepository.findAll({ orderBy: 'updated_at', orderDir: 'desc' })
  },

  listByStage(stage: CrmContact['stage']): Promise<QueryListResult<CrmContact>> {
    return crmRepository.findByStage(stage)
  },

  listByAssignee(userId: string): Promise<QueryListResult<CrmContact>> {
    return crmRepository.findByAssignee(userId)
  },

  search(query: string): Promise<QueryListResult<CrmContact>> {
    return crmRepository.search(query)
  },

  get(id: string): Promise<QueryResult<CrmContact>> {
    return crmRepository.findById(id)
  },

  async create(
    payload: Omit<CrmContact, 'id' | 'created_at' | 'updated_at'>,
    actorId: string
  ): Promise<QueryResult<CrmContact>> {
    const result = await crmRepository.create(payload)

    if (result.data) {
      await auditRepository.log({
        userId: actorId,
        action: 'crm.contact.create',
        entityType: 'crm_contacts',
        entityId: result.data.id,
        metadata: { name: payload.name, stage: payload.stage },
      })
    }

    return result
  },

  async advanceStage(
    id: string,
    stage: CrmContact['stage'],
    actorId: string
  ): Promise<QueryResult<CrmContact>> {
    const result = await crmRepository.update(id, { stage })

    if (result.data) {
      await auditRepository.log({
        userId: actorId,
        action: 'crm.contact.stage_change',
        entityType: 'crm_contacts',
        entityId: id,
        metadata: { stage },
      })
    }

    return result
  },

  // ─── Contracts ────────────────────────────────────────────────────────────
  listActive(): Promise<QueryListResult<Contract>> {
    return contractRepository.findActive()
  },

  listByOrganization(orgId: string): Promise<QueryListResult<Contract>> {
    return contractRepository.findByOrganization(orgId)
  },

  listExpiringSoon(days = 30): Promise<QueryListResult<Contract>> {
    return contractRepository.findExpiringSoon(days)
  },

  async createContract(
    payload: Omit<Contract, 'id' | 'created_at'>,
    actorId: string
  ): Promise<QueryResult<Contract>> {
    const result = await contractRepository.create(payload)

    if (result.data) {
      await auditRepository.log({
        userId: actorId,
        action: 'contract.create',
        entityType: 'contracts',
        entityId: result.data.id,
        organizationId: payload.organization_id,
        metadata: { title: payload.title, value: payload.value },
      })
    }

    return result
  },

  async updateContractStatus(
    id: string,
    status: Contract['status'],
    actorId: string
  ): Promise<QueryResult<Contract>> {
    const result = await contractRepository.update(id, { status })

    if (result.data) {
      await auditRepository.log({
        userId: actorId,
        action: 'contract.status_change',
        entityType: 'contracts',
        entityId: id,
        metadata: { status },
      })
    }

    return result
  },
}
