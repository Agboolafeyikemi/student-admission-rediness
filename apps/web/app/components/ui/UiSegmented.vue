<script setup lang="ts">
defineOptions({ inheritAttrs: false })

defineProps<{
  modelValue: string
  label?: string
  required?: boolean
  options: { label: string; value: string }[]
  error?: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" class="text-sm font-medium text-gray-700">
      {{ label }}<span v-if="required" class="text-red-500 ml-0.5">*</span>
    </label>
    <div class="flex rounded-lg border border-gray-200 bg-gray-100 p-0.5">
      <button
        v-for="opt in options"
        :key="opt.value"
        type="button"
        class="flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
        :class="modelValue === opt.value
          ? 'bg-gray-900 text-white shadow-sm'
          : 'text-gray-500 hover:text-gray-800'"
        @click="$emit('update:modelValue', opt.value)"
      >
        {{ opt.label }}
      </button>
    </div>
    <p v-if="error" class="text-xs text-red-500">{{ error }}</p>
  </div>
</template>
