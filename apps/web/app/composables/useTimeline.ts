import type { TimelineEvent } from '@@/types'
import { getApiErrorMessage } from './useApi'

export function useTimeline(profileId: string, programId: string) {
  const { baseURL } = useApi()

  // State + initial fetch — useAsyncData bundles ref initialization and lifecycle fetch.
  const { data, pending, error: fetchError, refresh } = useAsyncData(
    `timeline-${profileId}-${programId}`,
    () => $fetch<TimelineEvent[]>('/timeline', { baseURL, query: { profileId, programId } }),
  )

  // Computed
  const events = computed<TimelineEvent[]>(() => data.value ?? [])
  const error = computed(() => fetchError.value ? getApiErrorMessage(fetchError.value) : null)

  return { events, pending, error, refresh }
}
