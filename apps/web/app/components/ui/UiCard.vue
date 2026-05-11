<script setup lang="ts">
withDefaults(defineProps<{
  padded?: boolean
  hover?: boolean
}>(), {
  padded: true,
  hover: false,
})
</script>

<template>
  <div
    class="bg-surface rounded-xl border border-border shadow-[0_1px_0_rgba(11,31,68,0.02)] transition-[box-shadow,border-color] duration-150"
    :class="{
      'p-[18px]': padded,
      'hover:shadow-[0_4px_18px_rgba(11,31,68,0.08)] hover:border-border-strong cursor-pointer': hover,
    }"
  >
    <slot />
  </div>
</template>
