import type { Session } from '@@/types'

const SESSION_KEY = 'admissions_session'

export function useSession() {
  const session = useState<Session>('session', () => ({
    profileId: '',
    programId: '',
    selectedProgramIds: [],
    pendingProgramId: '',
  }))

  function hydrate() {
    if (!import.meta.client) return
    try {
      const raw = localStorage.getItem(SESSION_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as Partial<Session>
      if (parsed.profileId) session.value.profileId = parsed.profileId
      if (parsed.programId) session.value.programId = parsed.programId
      if (parsed.selectedProgramIds?.length)
        session.value.selectedProgramIds = parsed.selectedProgramIds
      else if (parsed.programId)
        session.value.selectedProgramIds = [parsed.programId]
      if (parsed.pendingProgramId) session.value.pendingProgramId = parsed.pendingProgramId
    } catch {}
  }

  function persist() {
    if (!import.meta.client) return
    localStorage.setItem(SESSION_KEY, JSON.stringify(session.value))
  }

  function setProfileId(id: string) {
    session.value.profileId = id
    persist()
  }

  function setProgramId(id: string) {
    session.value.programId = id
    persist()
  }

  function setSelectedProgramIds(ids: string[]) {
    session.value.selectedProgramIds = [...ids]
    persist()
  }

  function addSelectedProgram(id: string) {
    session.value.selectedProgramIds = [...new Set([...session.value.selectedProgramIds, id])]
    persist()
  }

  function setPendingProgramId(id: string) {
    session.value.pendingProgramId = id
    persist()
  }

  function clearPendingProgramId() {
    session.value.pendingProgramId = ''
    persist()
  }

  function clear() {
    session.value = { profileId: '', programId: '', selectedProgramIds: [], pendingProgramId: '' }
    if (import.meta.client) localStorage.removeItem(SESSION_KEY)
  }

  return { session, hydrate, setProfileId, setProgramId, setSelectedProgramIds, addSelectedProgram, setPendingProgramId, clearPendingProgramId, clear }
}
