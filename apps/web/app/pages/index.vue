<script setup lang="ts">
definePageMeta({
  middleware: [
    function () {
      if (import.meta.server) {
        return navigateTo('/onboarding', { replace: true })
      }
      const { session } = useSession()
      const dest = !session.value.profileId
        ? '/onboarding'
        : !session.value.programId
          ? '/programs'
          : '/dashboard'
      return navigateTo(dest, { replace: true })
    },
  ],
})
</script>

<template>
  <div />
</template>
