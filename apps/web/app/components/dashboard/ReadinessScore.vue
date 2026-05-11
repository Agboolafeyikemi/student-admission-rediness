<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  score: number
  completed: number
  total: number
  inProgress: number
  notStarted: number
}>()

const arcLabel = computed(() => {
  if (props.score >= 100) return 'Ready'
  if (props.score >= 70) return 'Almost there'
  if (props.score >= 25) return 'In progress'
  return 'Not started'
})

const miniStats = computed(() => [
  { label: 'Done', value: props.completed, color: '#137A4D' },
  { label: 'In progress', value: props.inProgress, color: '#B6500F' },
  { label: 'Not started', value: props.notStarted, color: '#7B8699' },
])
</script>

<template>
  <UiCard :padded="false">
    <!-- Arc + mini stats -->
    <div class="flex flex-col items-center px-[22px] pb-[18px] pt-[26px]">
      <UiProgressArc
        :value="score"
        :size="200"
        :stroke="14"
        :label="arcLabel"
        :sublabel="`${completed} of ${total} required items`"
      />

      <div class="mt-[18px] grid w-full grid-cols-3 gap-2">
        <div
          v-for="stat in miniStats"
          :key="stat.label"
          class="flex flex-col gap-0.5 rounded-lg border border-border bg-[#FAFBFD] px-3 py-2.5"
        >
          <div class="flex items-center gap-1.5 text-[11.5px] font-[540] text-ink-mid">
            <span
              class="inline-block h-1.5 w-1.5 rounded-full"
              :style="{ background: stat.color }"
            />
            {{ stat.label }}
          </div>
          <div class="text-[18px] font-semibold leading-none tracking-[-0.01em] text-ink">
            {{ stat.value }}
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="flex items-center justify-between border-t border-border bg-[#FAFBFD] px-[18px] py-3">
      <span class="text-[12px] text-ink-soft">Score updates as you complete items</span>
      <UiBadge tone="navy">Live</UiBadge>
    </div>
  </UiCard>
</template>
