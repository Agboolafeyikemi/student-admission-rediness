<script setup lang="ts">
import { watch, onUnmounted } from 'vue'

const props = withDefaults(defineProps<{
  open: boolean
  width?: number
  label: string
}>(), {
  width: 720,
})

const emit = defineEmits<{
  close: []
}>()

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}

watch(() => props.open, (val) => {
  if (val) window.addEventListener('keydown', onKeydown)
  else window.removeEventListener('keydown', onKeydown)
})

onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[rgba(11,20,40,0.42)] px-6 py-[60px] backdrop-blur-[2px]"
      @click="emit('close')"
    >
      <div
        role="dialog"
        aria-modal="true"
        :aria-label="label"
        class="relative w-full overflow-hidden rounded-[14px] bg-surface shadow-[0_30px_60px_rgba(8,17,35,0.28)]"
        :style="{ maxWidth: `${width}px` }"
        @click.stop
      >
        <slot />
      </div>
    </div>
  </Teleport>
</template>
