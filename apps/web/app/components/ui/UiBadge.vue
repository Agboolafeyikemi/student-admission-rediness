<script setup lang="ts">
const props = withDefaults(defineProps<{
  tone?: 'neutral' | 'navy' | 'teal' | 'success' | 'warn' | 'danger' | 'soft'
  dot?: boolean
  size?: 'sm' | 'md'
}>(), {
  tone: 'neutral',
  dot: false,
  size: 'md',
})

const toneClasses: Record<string, string> = {
  neutral: 'bg-[#EEF1F6] text-ink-mid',
  navy:    'bg-[#E4E9F2] text-navy',
  teal:    'bg-teal-soft text-[#0B6A6A]',
  success: 'bg-success-soft text-success',
  warn:    'bg-warn-soft text-warn',
  danger:  'bg-danger-soft text-danger',
  soft:    'bg-surface text-ink-mid border border-border',
}

const dotClasses: Record<string, string> = {
  neutral: 'bg-ink-soft',
  navy:    'bg-navy',
  teal:    'bg-teal',
  success: 'bg-success',
  warn:    'bg-warn',
  danger:  'bg-danger',
  soft:    'bg-ink-soft',
}
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-full font-[540] leading-none"
    :class="[
      toneClasses[props.tone],
      props.size === 'sm' ? 'px-[7px] py-[2px] text-[11px]' : 'px-[9px] py-[3px] text-xs',
    ]"
  >
    <span
      v-if="props.dot"
      class="h-1.5 w-1.5 shrink-0 rounded-full"
      :class="dotClasses[props.tone]"
    />
    <slot />
  </span>
</template>
