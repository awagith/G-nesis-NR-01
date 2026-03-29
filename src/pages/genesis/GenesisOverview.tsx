import { format, startOfMonth } from 'date-fns'
import {
    Building2,
    DollarSign,
    TrendingUp,
    UserSearch,
    type LucideIcon,
} from 'lucide-react'
import { useMemo } from 'react'

import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { SectionLoader } from '@/components/ui/LoadingSpinner'
import { useActiveContracts, useCrmContacts, useFinanceSummary } from '@/hooks/queries/useFinance'
import { useOrganizations } from '@/hooks/queries/useOrganizations'
import type { CrmContact, Organization } from '@/types'
import { formatCurrency, formatNumber } from '@/utils/format'

// ─── Stat Card (local) ───────────────────────────────────────────────────────

interface StatCardProps {
  label: string
  value: string
  subtitle?: string
  icon: LucideIcon
  color: 'indigo' | 'emerald' | 'amber' | 'rose'
}

const colorMap = {
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', icon: 'text-indigo-500' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: 'text-emerald-500' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600', icon: 'text-amber-500' },
  rose: { bg: 'bg-rose-50', text: 'text-rose-600', icon: 'text-rose-500' },
} as const

function StatCard({ label, value, subtitle, icon: Icon, color }: StatCardProps) {
  const c = colorMap[color]
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${c.bg}`}>
          <Icon className={`h-6 w-6 ${c.icon}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className={`mt-1 text-2xl font-bold ${c.text}`}>{value}</p>
          {subtitle && <p className="mt-0.5 text-xs text-gray-400">{subtitle}</p>}
        </div>
      </div>
    </div>
  )
}

// ─── Pipeline mini (local) ───────────────────────────────────────────────────

const stageLabels: Record<CrmContact['stage'], string> = {
  lead: 'Lead',
  prospect: 'Prospect',
  proposal: 'Proposta',
  negotiation: 'Negociação',
  closed_won: 'Fechado',
  closed_lost: 'Perdido',
}

const stageColors: Record<CrmContact['stage'], string> = {
  lead: 'bg-gray-200',
  prospect: 'bg-blue-200',
  proposal: 'bg-indigo-200',
  negotiation: 'bg-amber-200',
  closed_won: 'bg-emerald-200',
  closed_lost: 'bg-red-200',
}

// ─── Org Status mini (local) ─────────────────────────────────────────────────

const orgStatusLabel: Record<Organization['status'], string> = {
  active: 'Ativas',
  suspended: 'Suspensas',
  inactive: 'Inativas',
}

const orgStatusColor: Record<Organization['status'], string> = {
  active: 'bg-emerald-100 text-emerald-700',
  suspended: 'bg-amber-100 text-amber-700',
  inactive: 'bg-gray-100 text-gray-600',
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function GenesisOverview() {
  const today = useMemo(() => new Date(), [])
  const monthStart = useMemo(() => format(startOfMonth(today), 'yyyy-MM-dd'), [today])
  const todayStr = useMemo(() => format(today, 'yyyy-MM-dd'), [today])

  const orgs = useOrganizations()
  const contacts = useCrmContacts()
  const contracts = useActiveContracts()
  const finance = useFinanceSummary(monthStart, todayStr)

  const isLoading = orgs.isLoading || contacts.isLoading || contracts.isLoading || finance.isLoading
  const error = orgs.error || contacts.error || contracts.error || finance.error

  // Derived stats
  const activeOrgs = orgs.data?.filter(o => o.status === 'active').length ?? 0
  const totalOrgs = orgs.data?.length ?? 0
  const pipelineContacts = contacts.data?.filter(c => c.stage !== 'closed_won' && c.stage !== 'closed_lost').length ?? 0
  const activeContractsCount = contracts.data?.length ?? 0
  const revenue = finance.data?.revenue ?? 0

  // Org breakdown by status
  const orgByStatus = useMemo(() => {
    if (!orgs.data) return []
    const counts: Record<string, number> = {}
    for (const o of orgs.data) {
      counts[o.status] = (counts[o.status] ?? 0) + 1
    }
    return Object.entries(counts) as [Organization['status'], number][]
  }, [orgs.data])

  // CRM pipeline breakdown
  const pipelineByStage = useMemo(() => {
    if (!contacts.data) return []
    const counts: Record<string, number> = {}
    for (const c of contacts.data) {
      counts[c.stage] = (counts[c.stage] ?? 0) + 1
    }
    return Object.entries(counts) as [CrmContact['stage'], number][]
  }, [contacts.data])

  if (isLoading) return <SectionLoader />
  if (error) return <ErrorMessage message="Erro ao carregar dados do dashboard." onRetry={() => {
    void orgs.refetch()
    void contacts.refetch()
    void contracts.refetch()
    void finance.refetch()
  }} />

  return (
    <div className="space-y-8">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Visão Geral</h1>
        <p className="mt-1 text-sm text-gray-500">
          Resumo da plataforma Gênesis NR-01
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Organizações ativas"
          value={formatNumber(activeOrgs)}
          subtitle={`${formatNumber(totalOrgs)} no total`}
          icon={Building2}
          color="indigo"
        />
        <StatCard
          label="Pipeline CRM"
          value={formatNumber(pipelineContacts)}
          subtitle="contatos em negociação"
          icon={UserSearch}
          color="amber"
        />
        <StatCard
          label="Contratos ativos"
          value={formatNumber(activeContractsCount)}
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          label="Receita do mês"
          value={formatCurrency(revenue)}
          subtitle={`Líquido: ${formatCurrency(finance.data?.net ?? 0)}`}
          icon={DollarSign}
          color="rose"
        />
      </div>

      {/* Breakdown sections */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Organizations by status */}
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <h2 className="text-sm font-semibold text-gray-900">Organizações por status</h2>
          {orgByStatus.length === 0 ? (
            <p className="mt-4 text-sm text-gray-400">Nenhuma organização cadastrada.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {orgByStatus.map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${orgStatusColor[status]}`}>
                    {orgStatusLabel[status]}
                  </span>
                  <span className="text-sm font-semibold text-gray-700">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CRM pipeline */}
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <h2 className="text-sm font-semibold text-gray-900">Pipeline de Vendas</h2>
          {pipelineByStage.length === 0 ? (
            <p className="mt-4 text-sm text-gray-400">Nenhum contato no CRM.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {pipelineByStage.map(([stage, count]) => {
                const total = contacts.data?.length ?? 1
                const pct = Math.round((count / total) * 100)
                return (
                  <div key={stage}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{stageLabels[stage]}</span>
                      <span className="font-medium text-gray-700">{count}</span>
                    </div>
                    <div className="mt-1 h-2 w-full rounded-full bg-gray-100">
                      <div
                        className={`h-2 rounded-full ${stageColors[stage]}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
