<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  id: string
  title: string
  date: string
  status: 'pending' | 'complete'
  type: 'deadline' | 'milestone' | 'submission' | 'program_start'
  sourceType: string
  isProgramDeadline?: boolean
  isStart?: boolean
  isLast: boolean
  dim?: boolean
}>(), {
  isProgramDeadline: false,
  isStart: false,
  dim: false,
})

defineEmits<{
  toggleComplete: []
}>()

function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number)
  return new Date(y, m - 1, d)
}

function daysUntil(iso: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = parseLocalDate(iso)
  return Math.round((due.getTime() - today.getTime()) / 86_400_000)
}

function relativeDays(iso: string): string {
  const d = daysUntil(iso)
  if (d === 0) return 'today'
  if (d === 1) return 'tomorrow'
  if (d === -1) return 'yesterday'
  if (d > 0) return `in ${d} days`
  return `${Math.abs(d)} days ago`
}

const d = computed(() => daysUntil(props.date))
const completed = computed(() => props.status === 'complete')
const overdue = computed(() => d.value < 0 && !completed.value)
const urgent = computed(() => d.value >= 0 && d.value <= 7 && !completed.value)

const dt = computed(() => parseLocalDate(props.date))
const monthStr = computed(() =>
  dt.value.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
)
const dayStr = computed(() => dt.value.getDate())

const datePillMonthColor = computed(() => {
  if (overdue.value) return '#C0392B'
  if (urgent.value) return '#B6500F'
  return '#46556B'
})

const datePillDayColor = computed(() => overdue.value ? '#C0392B' : '#0E1729')

const nodeBorderColor = computed(() => {
  if (completed.value) return '#137A4D'
  if (props.type === 'deadline') return '#C0392B'
  return '#0EA5A5'
})

const relativeLabel = computed(() =>
  completed.value ? 'Completed' : relativeDays(props.date),
)

const relativeLabelColor = computed(() => {
  if (overdue.value) return '#C0392B'
  if (urgent.value) return '#B6500F'
  return '#7B8699'
})
</script>

<template>
  <div
    class="grid items-stretch"
    style="grid-template-columns: 60px 28px 1fr; gap: 14px; position: relative"
    :style="{ paddingBottom: isLast ? '0' : '14px' }"
  >
    <!-- Date pill -->
    <div
      class="flex h-14 flex-col items-center justify-center rounded-lg border border-border"
      :style="{
        background: completed ? '#F1F4F8' : '#fff',
        opacity: dim || completed ? 0.7 : 1,
      }"
    >
      <span
        class="text-[10.5px] font-semibold tracking-[0.06em]"
        :style="{ color: datePillMonthColor }"
      >
        {{ monthStr }}
      </span>
      <span
        class="text-[22px] font-semibold leading-none tracking-[-0.02em]"
        :style="{ color: datePillDayColor }"
      >
        {{ dayStr }}
      </span>
    </div>

    <!-- Rail + node -->
    <div class="relative flex justify-center">
      <!-- Vertical rail -->
      <div
        v-if="!isLast"
        class="absolute left-1/2 top-0 w-0.5 -translate-x-1/2 bg-border"
        style="bottom: -14px"
      />
      <!-- Node circle -->
      <div class="z-[1] mt-[18px]">
        <span
          class="inline-flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 text-white"
          :style="{
            background: completed ? '#137A4D' : '#fff',
            borderColor: nodeBorderColor,
          }"
        >
          <UiIcon v-if="completed" name="check" :size="12" :stroke-width="2.6" />
        </span>
      </div>
    </div>

    <!-- Event card -->
    <div
      class="flex items-center gap-3 rounded-[10px] border border-border px-3.5 py-3"
      :style="{
        background: completed ? '#F8FAFC' : '#fff',
        opacity: dim ? 0.7 : 1,
      }"
    >
      <UiTypeIcon :type="type" :size="16" />

      <div class="min-w-0 flex-1">
        <div
          class="text-[14px] font-semibold tracking-[-0.005em] text-ink"
          :style="{ textDecoration: completed ? 'line-through' : 'none', textDecorationColor: '#7B8699' }"
        >
          {{ title }}
        </div>
        <div class="mt-0.5 flex items-center gap-2.5 text-[12.5px] text-ink-soft">
          <span>{{ sourceType }}</span>
          <span>·</span>
          <span
            :style="{
              color: relativeLabelColor,
              fontWeight: overdue || urgent ? 540 : 400,
            }"
          >
            {{ relativeLabel }}
          </span>
        </div>
      </div>

      <!-- Right actions -->
      <div class="flex shrink-0 items-center gap-2.5">
        <template v-if="!isProgramDeadline && !isStart">
          <UiBadge v-if="completed" tone="success" :dot="true">Complete</UiBadge>
          <button
            v-else
            type="button"
            class="inline-flex items-center gap-1.5 rounded-lg border border-border-strong bg-surface px-2.5 py-1.5 text-xs font-semibold text-ink-mid transition-colors hover:bg-[#EEF1F6]"
            @click="$emit('toggleComplete')"
          >
            <UiIcon name="check" :size="12" />
            Mark complete
          </button>
        </template>
        <UiBadge v-else-if="isProgramDeadline" tone="danger" :dot="true">Hard deadline</UiBadge>
        <UiBadge v-else-if="isStart" tone="navy">Term start</UiBadge>
      </div>
    </div>
  </div>
</template>
