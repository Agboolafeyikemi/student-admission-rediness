<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  id: string
  name: string
  university: string
  degree: string
  department: string
  deadline: string
  tuition: number
  duration: string
  selected: boolean
  active: boolean
}>()

defineEmits<{
  view: []
  select: []
}>()

const daysUntil = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(props.deadline)
  due.setHours(0, 0, 0, 0)
  return Math.round((due.getTime() - today.getTime()) / 86_400_000)
})

const urgent = computed(() => daysUntil.value <= 14)

const deadlineLabel = computed(() =>
  new Date(props.deadline).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
)

const tuitionLabel = computed(() => `$${(props.tuition / 1000).toFixed(1)}k`)
</script>

<template>
  <div
    class="flex flex-col rounded-xl border bg-surface transition-[box-shadow,border-color] duration-150"
    :style="selected
      ? { borderColor: '#0EA5A5', boxShadow: 'inset 0 0 0 1px #0EA5A5' }
      : { borderColor: '#E4E8EF' }"
  >
    <!-- Body -->
    <div class="flex-1 p-[18px]">
      <!-- Badges -->
      <div class="mb-2 flex items-start justify-between gap-2.5">
        <div class="flex flex-wrap gap-2">
          <UiBadge tone="navy">{{ degree }}</UiBadge>
          <UiBadge tone="soft">{{ department }}</UiBadge>
        </div>
        <UiBadge v-if="selected" tone="teal" :dot="true">
          {{ active ? 'Active' : 'Selected' }}
        </UiBadge>
      </div>

      <!-- Name and university -->
      <h3 class="text-[15.5px] font-semibold leading-snug tracking-[-0.012em] text-ink">
        {{ name }}
      </h3>
      <p class="mt-1 text-[13px] text-ink-mid">{{ university }}</p>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-3 gap-1.5 border-t border-border px-[18px] py-3">
      <div>
        <div class="text-[11px] uppercase tracking-[0.04em] text-ink-soft">Deadline</div>
        <div
          class="mt-0.5 text-[13.5px] font-semibold"
          :class="urgent ? 'text-danger' : 'text-ink'"
        >
          {{ deadlineLabel }}
          <span v-if="urgent" class="ml-1 text-xs font-normal text-ink-soft">
            in {{ daysUntil }}d
          </span>
        </div>
      </div>
      <div>
        <div class="text-[11px] uppercase tracking-[0.04em] text-ink-soft">Tuition</div>
        <div class="mt-0.5 text-[13.5px] font-semibold text-ink">
          {{ tuitionLabel }}
          <span class="ml-0.5 text-xs font-normal text-ink-soft">/ yr</span>
        </div>
      </div>
      <div>
        <div class="text-[11px] uppercase tracking-[0.04em] text-ink-soft">Duration</div>
        <div class="mt-0.5 text-[13.5px] font-semibold text-ink">{{ duration }}</div>
      </div>
    </div>

    <!-- Footer -->
    <div class="flex items-center justify-between rounded-b-xl border-t border-border bg-[#FAFBFD] px-[14px] py-3">
      <button
        type="button"
        class="inline-flex items-center gap-1 text-[13px] font-[540] text-navy-mid hover:underline"
        @click="$emit('view')"
      >
        View details
        <UiIcon name="chevronRight" :size="14" />
      </button>

      <button
        v-if="selected"
        type="button"
        class="inline-flex items-center gap-1.5 rounded-lg border border-border-strong bg-surface px-3 py-1.5 text-xs font-semibold text-ink-mid"
      >
        <UiIcon name="check" :size="12" />
        Selected
      </button>

      <button
        v-else
        type="button"
        class="rounded-lg bg-teal px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
        @click="$emit('select')"
      >
        Select program
      </button>
    </div>
  </div>
</template>
