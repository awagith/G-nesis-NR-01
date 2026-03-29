import { actionPlanRepository } from '@/repositories/action-plan.repository'
import { auditRepository } from '@/repositories/audit.repository'
import type { QueryResult, QueryListResult } from '@/repositories/base.repository'
import type { ActionPlan, ActionItem } from '@/types'

export const actionPlanService = {
  listByOrganization(orgId: string): Promise<QueryListResult<ActionPlan>> {
    return actionPlanRepository.findByOrganization(orgId)
  },

  listByStatus(orgId: string, status: ActionPlan['status']): Promise<QueryListResult<ActionPlan>> {
    return actionPlanRepository.findByStatus(orgId, status)
  },

  listOverdue(orgId: string): Promise<QueryListResult<ActionPlan>> {
    return actionPlanRepository.findOverdue(orgId)
  },

  get(id: string): Promise<QueryResult<ActionPlan>> {
    return actionPlanRepository.findById(id)
  },

  async create(
    payload: Omit<ActionPlan, 'id' | 'created_at' | 'updated_at' | 'progress_pct'>,
    actorId: string
  ): Promise<QueryResult<ActionPlan>> {
    const result = await actionPlanRepository.create({ ...payload, progress_pct: 0 })

    if (result.data) {
      await auditRepository.log({
        userId: actorId,
        action: 'action_plan.create',
        entityType: 'action_plans',
        entityId: result.data.id,
        organizationId: payload.organization_id,
        metadata: { title: payload.title },
      })
    }

    return result
  },

  async update(
    id: string,
    payload: Partial<Omit<ActionPlan, 'id' | 'created_at'>>,
    actorId: string
  ): Promise<QueryResult<ActionPlan>> {
    const result = await actionPlanRepository.update(id, payload)

    if (result.data) {
      await auditRepository.log({
        userId: actorId,
        action: 'action_plan.update',
        entityType: 'action_plans',
        entityId: id,
        metadata: { fields: Object.keys(payload) },
      })
    }

    return result
  },

  // ─── Items ─────────────────────────────────────────────────────────────────
  listItems(actionPlanId: string): Promise<QueryListResult<ActionItem>> {
    return actionPlanRepository.findItems(actionPlanId)
  },

  createItem(
    payload: Omit<ActionItem, 'id' | 'created_at' | 'completed_at'>
  ): Promise<QueryResult<ActionItem>> {
    return actionPlanRepository.createItem(payload)
  },

  async updateItem(
    id: string,
    actionPlanId: string,
    payload: Partial<Omit<ActionItem, 'id' | 'created_at'>>,
    actorId: string
  ): Promise<QueryResult<ActionItem>> {
    const result = await actionPlanRepository.updateItem(id, payload)

    // Recalcula progresso do plano quando item muda de status
    if (payload.status) {
      await actionPlanRepository.recalculateProgress(actionPlanId)
      await auditRepository.log({
        userId: actorId,
        action: 'action_item.status_change',
        entityType: 'action_items',
        entityId: id,
        metadata: { status: payload.status, actionPlanId },
      })
    }

    return result
  },
}
