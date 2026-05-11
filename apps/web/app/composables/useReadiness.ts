import type { ReadinessResult, Requirement, ChecklistItem } from '@@/types'
import { getApiErrorMessage } from './useApi'

export function useReadiness(profileId: string, programId: string) {
  const { baseURL } = useApi()

  // State + initial fetch — useAsyncData bundles ref initialization and lifecycle fetch.
  const { data, pending, error: fetchError, refresh } = useAsyncData(
    `readiness-${profileId}-${programId}`,
    () => $fetch<ReadinessResult>('/readiness', { baseURL, query: { profileId, programId } }),
  )

  // Computed
  const error = computed(() => fetchError.value ? getApiErrorMessage(fetchError.value) : null)
  const readinessScore = computed(() => data.value?.readinessScore ?? 0)
  const missingRequirements = computed<Requirement[]>(() => data.value?.missingRequirements ?? [])
  const nextMilestones = computed<ChecklistItem[]>(() => data.value?.nextMilestones ?? [])

  return { data, pending, error, readinessScore, missingRequirements, nextMilestones, refresh }
}
