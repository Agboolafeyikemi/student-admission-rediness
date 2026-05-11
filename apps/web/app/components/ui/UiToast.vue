<script setup lang="ts">
defineProps<{
  message: string
  type?: 'error' | 'success'
}>()

defineEmits<{ dismiss: [] }>()
</script>

<template>
  <Transition name="toast">
    <div
      v-if="message"
      class="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-xl px-5 py-3 text-sm font-medium shadow-lg"
      :class="type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'"
    >
      <span>{{ message }}</span>
      <button class="opacity-75 hover:opacity-100" @click="$emit('dismiss')">✕</button>
    </div>
  </Transition>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 0.75rem);
}
</style>
