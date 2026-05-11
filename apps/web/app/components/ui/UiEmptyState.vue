<script setup lang="ts">
withDefaults(defineProps<{
  icon?: string
  title: string
  body?: string
}>(), {
  icon: 'search',
})
</script>

<template>
  <div class="rounded-xl border border-dashed border-border-strong bg-surface px-7 py-11 text-center">
    <span class="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#EEF1F6] text-ink-mid">
      <UiIcon :name="(icon as any)" :size="22" />
    </span>
    <p class="text-[15px] font-semibold text-ink">{{ title }}</p>
    <p v-if="body" class="mx-auto mt-1 max-w-[380px] text-[13.5px] text-ink-soft">{{ body }}</p>
    <div v-if="$slots.action" class="mt-3.5">
      <slot name="action" />
    </div>
  </div>
</template>
