export default defineNuxtPlugin(() => {
  const { hydrate } = useSession()
  hydrate()
})
