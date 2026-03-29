import { diagnosisRepository, riskRepository } from '@/repositories/diagnosis.repository'
import { auditRepository } from '@/repositories/audit.repository'
import type { QueryResult, QueryListResult } from '@/repositories/base.repository'
import type { PsychosocialDiagnosis, PsychosocialRisk } from '@/types'

export const diagnosisService = {
  // ─── Diagnósticos ──────────────────────────────────────────────────────────
  listByOrganization(orgId: string): Promise<QueryListResult<PsychosocialDiagnosis>> {
    return diagnosisRepository.findByOrganization(orgId)
  },

  listActive(orgId: string): Promise<QueryListResult<PsychosocialDiagnosis>> {
    return diagnosisRepository.findActive(orgId)
  },

  get(id: string): Promise<QueryResult<PsychosocialDiagnosis>> {
    return diagnosisRepository.findById(id)
  },

  async create(
    payload: Omit<PsychosocialDiagnosis, 'id' | 'created_at' | 'updated_at'>,
    actorId: string
  ): Promise<QueryResult<PsychosocialDiagnosis>> {
    const result = await diagnosisRepository.create(payload)

    if (result.data) {
      await auditRepository.log({
        userId: actorId,
        action: 'diagnosis.create',
        entityType: 'psychosocial_diagnosis',
        entityId: result.data.id,
        organizationId: payload.organization_id,
        metadata: { title: payload.title },
      })
    }

    return result
  },

  async updateStatus(
    id: string,
    status: PsychosocialDiagnosis['status'],
    actorId: string
  ): Promise<QueryResult<PsychosocialDiagnosis>> {
    const updates: Partial<PsychosocialDiagnosis> = { status }
    if (status === 'in_progress') updates.started_at = new Date().toISOString()
    if (status === 'completed') updates.completed_at = new Date().toISOString()

    const result = await diagnosisRepository.update(id, updates)

    if (result.data) {
      await auditRepository.log({
        userId: actorId,
        action: 'diagnosis.status_change',
        entityType: 'psychosocial_diagnosis',
        entityId: id,
        metadata: { status },
      })
    }

    return result
  },

  // ─── Riscos ────────────────────────────────────────────────────────────────
  listRisksByOrganization(orgId: string): Promise<QueryListResult<PsychosocialRisk>> {
    return riskRepository.findByOrganization(orgId)
  },

  listRisksByDiagnosis(diagnosisId: string): Promise<QueryListResult<PsychosocialRisk>> {
    return riskRepository.findByDiagnosis(diagnosisId)
  },

  async createRisk(
    payload: Omit<PsychosocialRisk, 'id' | 'created_at'>,
    actorId: string
  ): Promise<QueryResult<PsychosocialRisk>> {
    const result = await riskRepository.create(payload)

    if (result.data) {
      await auditRepository.log({
        userId: actorId,
        action: 'risk.create',
        entityType: 'psychosocial_risks',
        entityId: result.data.id,
        organizationId: payload.organization_id,
        metadata: { level: payload.level, category: payload.category },
      })
    }

    return result
  },

  updateRisk(
    id: string,
    payload: Partial<Omit<PsychosocialRisk, 'id' | 'created_at'>>
  ): Promise<QueryResult<PsychosocialRisk>> {
    return riskRepository.update(id, payload)
  },
}
