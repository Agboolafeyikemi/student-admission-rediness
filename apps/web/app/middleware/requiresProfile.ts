// Guards pages that only need a student profile (e.g. programs catalog, profile edit).
// Pages that also need an active program should check session.programId themselves.
export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server) return
  const { session } = useSession()
  if (!session.value.profileId) {
    return navigateTo('/onboarding')
  }
})
