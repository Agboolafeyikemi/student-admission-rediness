import type { ChecklistItem } from '@@/types'

export function useChecklist(
  profileId: string,
  programId: string,
  options?: {
    readinessRefresh?: () => Promise<void>
    timelineRefresh?: () => Promise<void>
  },
) {
  const { apiFetch } = useApi()

  const checklist = ref<ChecklistItem[]>([])
  const pending = ref(false)
  const error = ref<string | null>(null)

  async function createChecklist(): Promise<void> {
    pending.value = true
    error.value = null
    try {
      checklist.value = await apiFetch<ChecklistItem[]>('/checklists', {
        method: 'POST',
        body: { profileId, programId },
      })
    } catch (err: unknown) {
      error.value = (err as Error).message
    } finally {
      pending.value = false
    }
  }

  async function updateItem(
    requirementId: string,
    patch: { status: ChecklistItem['status']; notes?: string },
  ): Promise<void> {
    pending.value = true
    error.value = null
    try {
      const updated = await apiFetch<ChecklistItem>('/checklists/item', {
        method: 'PATCH',
        body: { profileId, requirementId, status: patch.status, notes: patch.notes },
      })
      checklist.value = checklist.value.map((item) =>
        item.requirementId === requirementId ? updated : item,
      )
      await Promise.allSettled([options?.readinessRefresh?.(), options?.timelineRefresh?.()])
    } catch (err: unknown) {
      error.value = (err as Error).message
    } finally {
      pending.value = false
    }
  }

  // No GET /checklists endpoint exists. POST /checklists is idempotent:
  // the backend merges existing item progress rather than overwriting it.
  async function refresh(): Promise<void> {
    await createChecklist()
  }

  return { checklist, pending, error, createChecklist, updateItem, refresh }
}
