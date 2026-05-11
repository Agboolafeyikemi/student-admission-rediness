import type {
  StudentProfile,
  CreateProfileInput,
  UpdateProfileInput,
  CreateProfilePayload,
  UpdateProfilePayload,
} from '@@/types'

export function useProfile() {
  const { apiFetch } = useApi()
  const pending = ref(false)
  const error = ref<string | null>(null)

  async function createProfile(input: CreateProfileInput): Promise<StudentProfile> {
    pending.value = true
    error.value = null
    const { fullName, ...rest } = input
    const payload: CreateProfilePayload = { name: fullName, ...rest }
    try {
      return await apiFetch<StudentProfile>('/profiles', { method: 'POST', body: payload })
    } catch (err: unknown) {
      error.value = (err as Error).message
      throw err
    } finally {
      pending.value = false
    }
  }

  async function updateProfile(id: string, input: UpdateProfileInput): Promise<StudentProfile> {
    pending.value = true
    error.value = null
    const { fullName, ...rest } = input
    const payload: UpdateProfilePayload = fullName !== undefined ? { name: fullName, ...rest } : rest
    try {
      return await apiFetch<StudentProfile>(`/profiles/${id}`, { method: 'PATCH', body: payload })
    } catch (err: unknown) {
      error.value = (err as Error).message
      throw err
    } finally {
      pending.value = false
    }
  }

  return { createProfile, updateProfile, pending, error }
}
