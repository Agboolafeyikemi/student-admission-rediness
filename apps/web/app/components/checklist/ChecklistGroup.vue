<script setup lang="ts">
import { computed } from 'vue'
import type { ChecklistItemView } from '~/types'

const props = defineProps<{
  type: string
  label?: string
  items: ChecklistItemView[]
  expandedId: string | null
}>()

defineEmits<{
  expand: [id: string]
  updateItem: [id: string, patch: { status: string; notes?: string }]
}>()

const completed = computed(() => props.items.filter((i) => i.status === 'complete').length)
const progressPct = computed(() =>
  props.items.length === 0 ? 0 : (completed.value / props.items.length) * 100,
)
</script>

<template>
  <UiCard :padded="false">
    <!-- Group header -->
    <div class="flex items-center justify-between border-b border-border px-5 py-3.5">
      <div class="flex items-center gap-2.5">
        <UiTypeIcon :type="type" :size="16" />
        <div>
          <div class="text-[14.5px] font-semibold text-ink">{{ label ?? type }}</div>
          <div class="text-[12px] text-ink-soft">
            {{ items.length }} item{{ items.length === 1 ? '' : 's' }}
          </div>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <div class="h-[5px] w-[110px] overflow-hidden rounded-full bg-[#EEF1F6]">
          <div
            class="h-full bg-teal transition-[width] duration-[250ms]"
            :style="{ width: `${progressPct}%` }"
          />
        </div>
        <div class="min-w-[36px] text-right text-[12px] text-ink-mid">
          {{ completed }}/{{ items.length }}
        </div>
      </div>
    </div>

    <!-- Rows -->
    <div>
      <ChecklistRow
        v-for="(item, idx) in items"
        :key="item.id"
        :id="item.id"
        :title="item.title"
        :status="item.status"
        :due-date="item.dueDate"
        :notes="item.notes"
        :evidence="item.evidence"
        :expanded="expandedId === item.id"
        :is-last="idx === items.length - 1"
        @toggle="$emit('expand', item.id)"
        @update="(patch) => $emit('updateItem', item.requirementId, patch)"
      />
    </div>
  </UiCard>
</template>
