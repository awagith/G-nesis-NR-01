import { format, formatDistanceToNow, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// ─── Datas ────────────────────────────────────────────────────────────────────
export function formatDate(date: string | null | undefined, pattern = 'dd/MM/yyyy'): string {
  if (!date) return '—'
  try {
    return format(parseISO(date), pattern, { locale: ptBR })
  } catch {
    return '—'
  }
}

export function formatDateTime(date: string | null | undefined): string {
  return formatDate(date, "dd/MM/yyyy 'às' HH:mm")
}

export function formatRelative(date: string | null | undefined): string {
  if (!date) return '—'
  try {
    return formatDistanceToNow(parseISO(date), { addSuffix: true, locale: ptBR })
  } catch {
    return '—'
  }
}

// ─── Moeda ────────────────────────────────────────────────────────────────────
export function formatCurrency(value: number | null | undefined): string {
  if (value == null) return '—'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

// ─── Números ──────────────────────────────────────────────────────────────────
export function formatNumber(value: number | null | undefined): string {
  if (value == null) return '—'
  return new Intl.NumberFormat('pt-BR').format(value)
}

export function formatPercent(value: number | null | undefined): string {
  if (value == null) return '—'
  return `${value}%`
}

// ─── Tamanho de arquivo ───────────────────────────────────────────────────────
export function formatFileSize(bytes: number | null | undefined): string {
  if (bytes == null) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ─── Labels de domínio ────────────────────────────────────────────────────────
export const riskLevelLabel: Record<string, string> = {
  low: 'Baixo',
  medium: 'Médio',
  high: 'Alto',
  critical: 'Crítico',
}

export const actionStatusLabel: Record<string, string> = {
  pending: 'Pendente',
  in_progress: 'Em andamento',
  completed: 'Concluído',
  cancelled: 'Cancelado',
}

export const diagnosisStatusLabel: Record<string, string> = {
  draft: 'Rascunho',
  in_progress: 'Em andamento',
  completed: 'Concluído',
  archived: 'Arquivado',
}

export const contractStatusLabel: Record<string, string> = {
  active: 'Ativo',
  suspended: 'Suspenso',
  cancelled: 'Cancelado',
  expired: 'Expirado',
}

export const crmStageLabel: Record<string, string> = {
  lead: 'Lead',
  prospect: 'Prospecto',
  proposal: 'Proposta',
  negotiation: 'Negociação',
  closed_won: 'Fechado (ganho)',
  closed_lost: 'Fechado (perdido)',
}

export const roleLabel: Record<string, string> = {
  genesis: 'Genesis',
  client_executive: 'Cliente Executivo',
  collaborator: 'Colaborador',
  professional: 'Profissional',
}
