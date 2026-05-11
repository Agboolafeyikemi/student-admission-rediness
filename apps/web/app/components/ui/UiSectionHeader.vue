<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
}>()
</script>

<template>
  <div class="mb-7 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
    <div class="min-w-0">
      <h2 class="m-0 text-[22px] font-semibold tracking-[-0.012em] text-ink">
        {{ title }}
      </h2>
      <p v-if="subtitle" class="mt-1 text-[13.5px] leading-snug text-ink-soft">
        {{ subtitle }}
      </p>
    </div>
    <div v-if="$slots.right" class="w-full shrink-0 sm:w-auto">
      <slot name="right" />
    </div>
  </div>
</template>
