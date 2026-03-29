import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { actionPlanService } from '@/services/action-plan.service'
import { useAuth } from '@/hooks/useAuth'
import type { ActionPlan, ActionItem } from '@/types'

export const actionPlanKeys = {
  all: ['action_plans'] as const,
  byOrg: (orgId: string) => [...actionPlanKeys.all, 'org', orgId] as const,
  detail: (id: string) => [...actionPlanKeys.all, 'detail', id] as const,
  items: (planId: string) => [...actionPlanKeys.all, 'items', planId] as const,
}

export function useActionPlans(organizationId: string) {
  return useQuery({
    queryKey: actionPlanKeys.byOrg(organizationId),
    queryFn: () => actionPlanService.listByOrganization(organizationId),
    enabled: !!organizationId,
    select: r => r.data,
  })
}

export function useActionPlan(id: string) {
  return useQuery({
    queryKey: actionPlanKeys.detail(id),
    queryFn: () => actionPlanService.get(id),
    enabled: !!id,
    select: r => r.data,
  })
}

export function useActionItems(actionPlanId: string) {
  return useQuery({
    queryKey: actionPlanKeys.items(actionPlanId),
    queryFn: () => actionPlanService.listItems(actionPlanId),
    enabled: !!actionPlanId,
    select: r => r.data,
  })
}

export function useCreateActionPlan() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (payload: Omit<ActionPlan, 'id' | 'created_at' | 'updated_at' | 'progress_pct'>) =>
      actionPlanService.create(payload, user!.id),
    onSuccess: (_, { organization_id }) => {
      queryClient.invalidateQueries({ queryKey: actionPlanKeys.byOrg(organization_id) })
    },
  })
}

export function useUpdateActionPlan() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: ({
      id,
      organizationId: _organizationId,
      ...payload
    }: Partial<ActionPlan> & { id: string; organizationId: string }) =>
      actionPlanService.update(id, payload, user!.id),
    onSuccess: (_result, { id, organizationId }) => {
      queryClient.invalidateQueries({ queryKey: actionPlanKeys.byOrg(organizationId) })
      queryClient.invalidateQueries({ queryKey: actionPlanKeys.detail(id) })
    },
  })
}

export function useCreateActionItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: Omit<ActionItem, 'id' | 'created_at' | 'completed_at'>) =>
      actionPlanService.createItem(payload),
    onSuccess: (_, { action_plan_id }) => {
      queryClient.invalidateQueries({ queryKey: actionPlanKeys.items(action_plan_id) })
      queryClient.invalidateQueries({ queryKey: actionPlanKeys.detail(action_plan_id) })
    },
  })
}

export function useUpdateActionItem() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: ({
      id,
      actionPlanId,
      ...payload
    }: Partial<ActionItem> & { id: string; actionPlanId: string }) =>
      actionPlanService.updateItem(id, actionPlanId, payload, user!.id),
    onSuccess: (_, { actionPlanId }) => {
      queryClient.invalidateQueries({ queryKey: actionPlanKeys.items(actionPlanId) })
      queryClient.invalidateQueries({ queryKey: actionPlanKeys.detail(actionPlanId) })
      queryClient.invalidateQueries({ queryKey: actionPlanKeys.all })
    },
  })
}
