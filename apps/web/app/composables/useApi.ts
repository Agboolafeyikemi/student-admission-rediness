export function getApiErrorMessage(err: unknown): string {
  const e = err as { data?: { message?: string }; message?: string }
  return e?.data?.message ?? e?.message ?? 'Something went wrong'
}

export function useApi() {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBase as string

  async function apiFetch<T>(path: string, options?: Parameters<typeof $fetch>[1]): Promise<T> {
    try {
      return await $fetch<T>(path, { baseURL, ...options })
    } catch (err: unknown) {
      throw new Error(getApiErrorMessage(err))
    }
  }

  return { baseURL, apiFetch }
}
