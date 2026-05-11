<script setup lang="ts">
defineProps<{
  id: string
  modelValue: boolean
  label: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<template>
  <label
    :for="id"
    class="inline-flex cursor-pointer select-none items-center gap-2 text-sm text-ink"
  >
    <input
      :id="id"
      type="checkbox"
      :checked="modelValue"
      class="peer sr-only"
      @change="emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
    />
    <span
      class="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border-[1.5px] transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-navy/30 peer-focus-visible:ring-offset-1"
      :class="modelValue ? 'border-navy bg-navy' : 'border-border-strong bg-surface'"
    >
      <UiIcon v-if="modelValue" name="check" :size="11" :stroke-width="2.6" class="text-white" />
    </span>
    {{ label }}
  </label>
</template>
