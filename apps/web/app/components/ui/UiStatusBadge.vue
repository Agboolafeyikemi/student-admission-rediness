<script setup lang="ts">
const props = withDefaults(defineProps<{
  status: 'not_started' | 'in_progress' | 'complete'
  size?: 'sm' | 'md'
}>(), {
  size: 'md',
})

const map = {
  not_started: { tone: 'neutral' as const, label: 'Not started' },
  in_progress:  { tone: 'warn'    as const, label: 'In progress' },
  complete:     { tone: 'success' as const, label: 'Complete'    },
}

const config = computed(() => map[props.status])
</script>

<template>
  <UiBadge :tone="config.tone" :size="props.size" dot>
    {{ config.label }}
  </UiBadge>
</template>
