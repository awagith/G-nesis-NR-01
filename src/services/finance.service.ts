import { financeRepository } from '@/repositories/finance.repository'
import { auditRepository } from '@/repositories/audit.repository'
import type { QueryResult, QueryListResult } from '@/repositories/base.repository'
import type { FinancialTransaction } from '@/types'

export const financeService = {
  getSummary(from: string, to: string) {
    return financeRepository.getSummary(from, to)
  },

  listByPeriod(from: string, to: string): Promise<QueryListResult<FinancialTransaction>> {
    return financeRepository.findByPeriod(from, to)
  },

  listByOrganization(orgId: string): Promise<QueryListResult<FinancialTransaction>> {
    return financeRepository.findByOrganization(orgId)
  },

  listByType(type: FinancialTransaction['type']): Promise<QueryListResult<FinancialTransaction>> {
    return financeRepository.findByType(type)
  },

  async create(
    payload: Omit<FinancialTransaction, 'id' | 'created_at'>,
    actorId: string
  ): Promise<QueryResult<FinancialTransaction>> {
    const result = await financeRepository.create(payload)

    if (result.data) {
      await auditRepository.log({
        userId: actorId,
        action: 'finance.transaction.create',
        entityType: 'financial_transactions',
        entityId: result.data.id,
        organizationId: payload.organization_id ?? undefined,
        metadata: { type: payload.type, amount: payload.amount },
      })
    }

    return result
  },
}
