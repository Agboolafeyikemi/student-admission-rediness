<script setup lang="ts">
withDefaults(defineProps<{
  label: string
  htmlFor: string
  error?: string
  hint?: string
  required?: boolean
  optional?: boolean
}>(), {
  required: false,
  optional: false,
})
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label
      :for="htmlFor"
      class="flex items-baseline justify-between text-[13px] font-[540] text-ink"
    >
      <span>
        {{ label }}<span v-if="required" class="ml-[3px] text-danger">*</span>
      </span>
      <span v-if="optional && !required" class="text-xs font-normal text-ink-soft">Optional</span>
    </label>

    <slot />

    <div v-if="error" class="flex items-center gap-[5px] text-xs text-danger">
      <UiIcon name="alert" :size="12" />
      {{ error }}
    </div>
    <div v-else-if="hint" class="text-xs text-ink-soft">{{ hint }}</div>
  </div>
</template>
