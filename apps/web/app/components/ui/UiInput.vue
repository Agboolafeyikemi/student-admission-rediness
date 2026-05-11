<script setup lang="ts">
defineOptions({ inheritAttrs: false })

defineProps<{
  modelValue: string
  label?: string
  labelBadge?: string
  type?: string
  placeholder?: string
  required?: boolean
  error?: string
  hint?: string
  suffix?: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
  blur: []
}>()
</script>

<template>
  <div class="flex flex-col gap-1">
    <div v-if="label" class="flex items-center justify-between">
      <label class="text-sm font-medium text-gray-700">
        {{ label }}<span v-if="required" class="text-red-500 ml-0.5">*</span>
      </label>
      <span v-if="labelBadge" class="text-xs text-gray-400">{{ labelBadge }}</span>
    </div>
    <div class="relative">
      <input
        v-bind="$attrs"
        :type="type ?? 'text'"
        :placeholder="placeholder"
        :value="modelValue"
        class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        :class="{
          'border-red-400 focus:border-red-400 focus:ring-red-200': error,
          'pr-14': suffix,
        }"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        @blur="$emit('blur')"
      />
      <span v-if="suffix" class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
        {{ suffix }}
      </span>
    </div>
    <p v-if="hint && !error" class="text-xs text-gray-400">{{ hint }}</p>
    <p v-if="error" class="text-xs text-red-500">{{ error }}</p>
  </div>
</template>
