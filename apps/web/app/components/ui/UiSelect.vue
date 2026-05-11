<script setup lang="ts">
defineOptions({ inheritAttrs: false })

type Option = { value: string; label: string }

const props = defineProps<{
  id: string
  modelValue: string
  options: Array<Option | string>
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const normalized = computed<Option[]>(() =>
  props.options.map(o => typeof o === 'string' ? { value: o, label: o } : o),
)
</script>

<template>
  <div class="relative">
    <select
      :id="props.id"
      :value="props.modelValue"
      v-bind="$attrs"
      class="h-10 w-full appearance-none rounded-lg border border-border-strong bg-surface px-3 pr-9 text-sm text-ink outline-none transition focus:border-navy-mid focus:ring-2 focus:ring-navy/10"
      :class="{ 'text-ink-soft': !props.modelValue }"
      @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option v-if="props.placeholder" value="" disabled :selected="!props.modelValue">
        {{ props.placeholder }}
      </option>
      <option v-for="opt in normalized" :key="opt.value" :value="opt.value">
        {{ opt.label }}
      </option>
    </select>
    <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft">
      <UiIcon name="chevronDown" :size="16" />
    </span>
  </div>
</template>
