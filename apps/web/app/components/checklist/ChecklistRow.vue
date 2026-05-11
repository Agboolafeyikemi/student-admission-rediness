<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  id: string
  title: string
  status: 'not_started' | 'in_progress' | 'complete'
  dueDate: string
  notes: string
  evidence: string
  expanded: boolean
  isLast: boolean
}>()

const emit = defineEmits<{
  toggle: []
  update: [patch: { status: string; notes?: string }]
}>()

const draftStatus = ref(props.status)
const draftNotes = ref(props.notes)

watch([() => props.expanded, () => props.id], ([expanded]) => {
  if (expanded) {
    draftStatus.value = props.status
    draftNotes.value = props.notes
  }
})

const statusOptions = [
  { label: 'Not started', value: 'not_started' },
  { label: 'In progress', value: 'in_progress' },
  { label: 'Complete', value: 'complete' },
]

function daysUntil(iso: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(iso)
  due.setHours(0, 0, 0, 0)
  return Math.round((due.getTime() - today.getTime()) / 86_400_000)
}

function fmtDateShort(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })
}

function relativeDays(iso: string) {
  const d = daysUntil(iso)
  if (d === 0) return 'today'
  if (d === 1) return 'tomorrow'
  if (d === -1) return 'yesterday'
  if (d > 0) return `in ${d} days`
  return `${Math.abs(d)} days ago`
}

const d = () => daysUntil(props.dueDate)
const overdue = () => d() < 0 && props.status !== 'complete'
const dimmed = () => props.status === 'complete'

function onCheckboxClick(e: Event) {
  e.stopPropagation()
  emit('update', {
    status: props.status === 'complete' ? 'not_started' : 'complete',
  })
}

function onRowKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    emit('toggle')
  }
}

function saveChanges() {
  emit('update', { status: draftStatus.value, notes: draftNotes.value })
  emit('toggle')
}
</script>

<template>
  <div :class="!isLast || expanded ? 'border-b border-border' : ''">
    <!-- Clickable row -->
    <div
      role="button"
      :tabindex="0"
      class="grid cursor-pointer items-center gap-3.5 px-5 py-3 text-left transition-colors hover:bg-[#FAFBFD]"
      style="grid-template-columns: auto 1fr auto auto auto"
      :style="{ opacity: dimmed() ? 0.7 : 1 }"
      @click="$emit('toggle')"
      @keydown="onRowKeydown"
    >
      <!-- Circle checkbox -->
      <button
        type="button"
        class="inline-flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-[1.5px] p-0 text-white transition-colors"
        :style="{
          borderColor: status === 'complete' ? '#137A4D' : '#CCD3DD',
          background: status === 'complete' ? '#137A4D' : '#fff',
        }"
        :aria-label="status === 'complete' ? 'Mark incomplete' : 'Mark complete'"
        @click="onCheckboxClick"
      >
        <UiIcon v-if="status === 'complete'" name="check" :size="12" :stroke-width="2.6" />
      </button>

      <!-- Title + notes preview -->
      <div class="min-w-0">
        <div
          class="text-[14px] font-[540] text-ink"
          :style="{ textDecoration: dimmed() ? 'line-through' : 'none', textDecorationColor: '#7B8699' }"
        >
          {{ title }}
        </div>
        <div
          v-if="notes"
          class="mt-0.5 overflow-hidden text-ellipsis whitespace-nowrap text-[12.5px] text-ink-soft"
        >
          {{ notes }}
        </div>
      </div>

      <!-- Status badge -->
      <UiStatusBadge :status="status" size="sm" />

      <!-- Due date -->
      <div
        class="min-w-[100px] text-right text-[12.5px]"
        :class="overdue() ? 'text-danger' : 'text-ink-mid'"
      >
        {{ fmtDateShort(dueDate) }}
        <div class="text-[11px]" :class="overdue() ? 'text-danger' : 'text-ink-soft'">
          {{ relativeDays(dueDate) }}
        </div>
      </div>

      <!-- Chevron -->
      <UiIcon
        name="chevronDown"
        :size="14"
        class="text-ink-soft transition-transform duration-150"
        :style="{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }"
      />
    </div>

    <!-- Expanded panel -->
    <div
      v-if="expanded"
      class="grid grid-cols-2 gap-[18px] border-t border-border bg-[#FAFBFD] px-5 pb-[18px] pt-3.5"
    >
      <!-- Left: status + evidence -->
      <div class="flex flex-col gap-3">
        <!-- Status -->
        <div>
          <div class="mb-1.5 text-[12px] font-semibold text-ink-mid">Status</div>
          <UiSegmented
            id="status"
            v-model="draftStatus"
            :options="statusOptions"
          />
        </div>
        <!-- Evidence -->
        <div>
          <div class="mb-0.5 text-[12px] font-semibold text-ink-mid">Evidence</div>
          <div class="mb-1.5 text-[12px] text-ink-soft">{{ evidence }}</div>
          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-lg border border-border-strong bg-surface px-3 py-1.5 text-xs font-semibold text-ink-mid transition-colors hover:bg-[#EEF1F6]"
          >
            <UiIcon name="doc" :size="13" />
            Upload {{ evidence.toLowerCase() || 'file' }}
          </button>
        </div>
      </div>

      <!-- Right: notes + actions -->
      <div class="flex flex-col gap-3">
        <!-- Notes -->
        <div class="flex flex-1 flex-col">
          <div class="mb-0.5 text-[12px] font-semibold text-ink-mid">Notes</div>
          <div class="mb-1.5 text-[12px] text-ink-soft">Visible only to you</div>
          <textarea
            v-model="draftNotes"
            placeholder="Add notes, draft outlines, recommender details…"
            rows="3"
            class="w-full resize-y rounded-lg border border-border-strong bg-surface px-3 py-2 font-sans text-[13.5px] text-ink outline-none transition focus:border-navy-mid focus:ring-2 focus:ring-navy/10"
          />
        </div>
        <!-- Save / Cancel -->
        <div class="flex justify-end gap-2">
          <button
            type="button"
            class="rounded-lg border border-border-strong bg-surface px-3 py-1.5 text-xs font-semibold text-ink-mid transition-colors hover:bg-[#EEF1F6]"
            @click="$emit('toggle')"
          >
            Cancel
          </button>
          <button
            type="button"
            class="rounded-lg bg-navy px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
            @click="saveChanges"
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
