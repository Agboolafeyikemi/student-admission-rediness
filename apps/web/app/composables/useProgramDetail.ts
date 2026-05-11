import type { ProgramDetail } from '@@/types'
import { getApiErrorMessage } from './useApi'

export function useProgramDetail(programId: string) {
  const { baseURL } = useApi()

  // State + initial fetch — skipped entirely when programId is falsy.
  const { data: program, pending, error: fetchError, refresh } = useAsyncData(
    `program-detail-${programId}`,
    () => $fetch<ProgramDetail>(`/programs/${programId}`, { baseURL }),
    { immediate: Boolean(programId) },
  )

  // Computed
  const error = computed(() => fetchError.value ? getApiErrorMessage(fetchError.value) : null)

  // Public alias keeps the method name the task requires.
  async function fetch(): Promise<void> {
    await refresh()
  }

  return { program, pending, error, fetch }
}
