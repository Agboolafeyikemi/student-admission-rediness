<script setup lang="ts">
const props = withDefaults(defineProps<{
  value: number
  size?: number
  stroke?: number
  label?: string
  sublabel?: string
}>(), {
  size: 220,
  stroke: 16,
})

const clamped     = computed(() => Math.min(100, Math.max(0, props.value)))
const r           = computed(() => (props.size - props.stroke) / 2)
const circ        = computed(() => 2 * Math.PI * r.value)
const dashOffset  = computed(() => circ.value - (clamped.value / 100) * circ.value)
const numFontSize = computed(() => Math.round(props.size * 0.26))
const pctFontSize = computed(() => Math.round(props.size * 0.13))
</script>

<template>
  <div
    class="relative"
    :style="{ width: `${props.size}px`, height: `${props.size}px` }"
    role="progressbar"
    :aria-valuenow="clamped"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-label="props.label ? `${props.label}: ${clamped}%` : `Readiness: ${clamped}%`"
  >
    <svg
      :width="props.size"
      :height="props.size"
      style="transform: rotate(-90deg)"
      aria-hidden="true"
    >
      <!-- track -->
      <circle
        :cx="props.size / 2"
        :cy="props.size / 2"
        :r="r"
        fill="none"
        stroke="#EEF1F6"
        :stroke-width="props.stroke"
      />
      <!-- fill -->
      <circle
        :cx="props.size / 2"
        :cy="props.size / 2"
        :r="r"
        fill="none"
        class="stroke-teal"
        :stroke-width="props.stroke"
        :stroke-dasharray="circ"
        :stroke-dashoffset="dashOffset"
        stroke-linecap="round"
        style="transition: stroke-dashoffset 350ms ease"
      />
    </svg>

    <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
      <div
        class="font-semibold leading-none tracking-tight text-navy"
        :style="{ fontSize: `${numFontSize}px` }"
      >
        {{ Math.round(clamped) }}<span
          class="font-medium text-ink-soft"
          :style="{ fontSize: `${pctFontSize}px` }"
        >%</span>
      </div>
      <div
        v-if="props.label"
        class="mt-1.5 text-xs font-semibold uppercase tracking-widest text-teal"
      >
        {{ props.label }}
      </div>
      <div
        v-if="props.sublabel"
        class="mt-1 text-xs text-ink-soft"
      >
        {{ props.sublabel }}
      </div>
    </div>
  </div>
</template>
