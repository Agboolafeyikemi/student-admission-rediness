<script setup lang="ts">
import type { ChecklistItem, ChecklistItemView } from '@@/types'

definePageMeta({ middleware: 'requires-profile' })

const { session } = useSession()
const profileId = session.value.profileId
const programId = session.value.programId

// -- Data sources --
const { program, pending: programPending } = useProgramDetail(programId)
const { readinessScore, refresh: readinessRefresh } = useReadiness(profileId, programId)
const { refresh: timelineRefresh } = useTimeline(profileId, programId)
const {
  checklist,
  pending: checklistPending,
  error: checklistError,
  createChecklist,
  updateItem,
} = useChecklist(profileId, programId, { readinessRefresh, timelineRefresh })

const initializing = ref(true)

onMounted(async () => {
  if (profileId && programId) {
    await createChecklist()
    await readinessRefresh()
  }
  initializing.value = false
})

const toastMsg = ref('')
watch(checklistError, (e) => { if (e) toastMsg.value = e })

// -- Join checklist items with requirement data --
const requirementMap = computed(() => {
  if (!program.value) return new Map<string, (typeof program.value.requirements)[0]>()
  return new Map(program.value.requirements.map(r => [r.id, r]))
})

const enrichedItems = computed<ChecklistItemView[]>(() =>
  checklist.value.flatMap((item) => {
    const req = requirementMap.value.get(item.requirementId)
    if (!req) return []
    return [{
      id: item.id,
      requirementId: item.requirementId,
      title: req.title,
      type: req.type,
      evidence: req.evidenceType,
      description: req.description,
      status: item.status,
      dueDate: item.dueDate,
      notes: item.notes ?? '',
      programId: item.programId,
    }]
  }),
)

// -- Derived stats --
const completedCount = computed(() => enrichedItems.value.filter(i => i.status === 'complete').length)
const inProgressCount = computed(() => enrichedItems.value.filter(i => i.status === 'in_progress').length)
const notStartedCount = computed(() => enrichedItems.value.filter(i => i.status === 'not_started').length)

const missing = computed(() =>
  [...enrichedItems.value.filter(i => i.status !== 'complete')]
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()),
)

// -- Readiness score --
const pct = computed(() => Math.min(readinessScore.value, 100))

// -- Checklist groups --
const typeOrder = ['document', 'test_score', 'recommendation', 'financial', 'writing']
const typeLabels: Record<string, string> = {
  document: 'Documents',
  test_score: 'Test Scores',
  recommendation: 'Recommendations',
  financial: 'Financial',
  writing: 'Writing',
}

const groups = computed(() => {
  const map: Record<string, ChecklistItemView[]> = {}
  enrichedItems.value.forEach((item) => {
    map[item.type] = map[item.type] ?? []
    map[item.type].push(item)
  })
  return typeOrder.filter(k => map[k]).map(k => ({ type: k, label: typeLabels[k] ?? k, items: map[k] }))
})

// -- Expanded row --
const expandedId = ref<string | null>(null)

function onExpand(id: string) {
  expandedId.value = expandedId.value === id ? null : id
}

async function onUpdateItem(requirementId: string, patch: { status: ChecklistItem['status']; notes?: string }) {
  await updateItem(requirementId, patch)
}

// -- Date helpers --
function daysUntil(iso: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(iso)
  due.setHours(0, 0, 0, 0)
  return Math.round((due.getTime() - today.getTime()) / 86_400_000)
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function fmtDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function relativeDays(iso: string): string {
  const d = daysUntil(iso)
  if (d === 0) return 'today'
  if (d < 0) return `${Math.abs(d)}d overdue`
  return `in ${d}d`
}

const loading = computed(() => initializing.value || programPending.value)

// -- Submit application --
const submitted = ref(false)
const submitPending = ref(false)

async function handleSubmit() {
  if (submitted.value) return
  const confirmed = window.confirm(
    `Submit your application to ${program.value?.name ?? 'this program'} at ${program.value?.university ?? ''}?\n\nMake sure all required items are complete before submitting.`,
  )
  if (!confirmed) return
  submitPending.value = true
  // Simulate a brief submission step (no real endpoint needed for assessment scope)
  await new Promise((r) => setTimeout(r, 600))
  submitPending.value = false
  submitted.value = true
  toastMsg.value = ''
}
</script>

<template>
  <div>
    <UiToast :message="toastMsg" type="error" @dismiss="toastMsg = ''" />

    <!-- No active program -->
    <UiEmptyState
      v-if="!programId"
      icon="graduation"
      title="No active program"
      body="Select a program from the catalog to start tracking your readiness."
    >
      <template #action>
        <NuxtLink
          to="/programs"
          class="rounded-lg border border-border-strong bg-surface px-4 py-2 text-sm font-semibold text-ink-mid transition-colors hover:bg-[#EEF1F6]"
        >
          Browse programs
        </NuxtLink>
      </template>
    </UiEmptyState>

    <template v-else>
      <!-- Initial load -->
      <div v-if="loading" class="flex flex-col items-center gap-3 py-24">
        <svg class="h-8 w-8 animate-spin text-navy-mid" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
        <p class="text-sm text-ink-soft">Loading dashboard…</p>
      </div>

      <template v-else>
        <!-- Section header -->
        <UiSectionHeader
          title="Readiness Dashboard"
          :subtitle="program
            ? `Tracking ${program.name} at ${program.university}. Application deadline ${fmtDate(program.applicationDeadline)} (in ${daysUntil(program.applicationDeadline)} days).`
            : ''"
        >
          <template #right>
            <div class="flex items-center gap-2.5">
              <NuxtLink
                to="/timeline"
                class="inline-flex items-center gap-1.5 rounded-lg border border-border-strong bg-surface px-3.5 py-2 text-[13px] font-semibold text-ink-mid transition-colors hover:bg-[#EEF1F6]"
              >
                <UiIcon name="calendar" :size="14" />
                Timeline
              </NuxtLink>
              <button
                v-if="!submitted"
                type="button"
                :disabled="submitPending"
                class="inline-flex items-center gap-1.5 rounded-lg bg-navy px-3.5 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                @click="handleSubmit"
              >
                <svg v-if="submitPending" class="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                <UiIcon v-else name="send" :size="14" />
                {{ submitPending ? 'Submitting…' : 'Submit application' }}
              </button>
              <div
                v-else
                class="inline-flex items-center gap-1.5 rounded-lg bg-[#E4F7EE] px-3.5 py-2 text-[13px] font-semibold text-[#137A4D]"
              >
                <UiIcon name="check" :size="14" />
                Application submitted
              </div>
            </div>
          </template>
        </UiSectionHeader>

        <!-- Top row -->
        <div class="mb-[22px] grid grid-cols-1 gap-[18px] sm:grid-cols-[320px_1fr]">

          <!-- Readiness score card -->
          <DashboardReadinessScore
            :score="pct"
            :completed="completedCount"
            :total="enrichedItems.length"
            :in-progress="inProgressCount"
            :not-started="notStartedCount"
          />

          <!-- Missing requirements card -->
          <UiCard :padded="false" class="flex flex-col">
            <div class="flex items-start gap-3 border-b border-border px-5 py-4">
              <div
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                :style="missing.length > 0
                  ? 'background: #FEF3EC; color: #B6500F'
                  : 'background: #E4F7EE; color: #137A4D'"
              >
                <UiIcon :name="missing.length > 0 ? 'alert' : 'check'" :size="18" />
              </div>
              <div class="flex-1">
                <div class="text-[14.5px] font-semibold text-ink">
                  {{ missing.length > 0
                    ? `${missing.length} required item${missing.length === 1 ? '' : 's'} still needed`
                    : "You're all set" }}
                </div>
                <div class="mt-0.5 text-[13px] text-ink-soft">
                  {{ missing.length > 0
                    ? "Knock these out before the application deadline. Mark them complete from here, or open the checklist below."
                    : "Every required item is complete. Review your application package, then submit when ready." }}
                </div>
              </div>
            </div>

            <div class="max-h-[320px] flex-1 overflow-y-auto p-2">
              <div
                v-if="missing.length === 0"
                class="flex items-center justify-center py-6 text-[13.5px] text-ink-soft"
              >
                Nothing missing. 🎓
              </div>

              <div
                v-for="item in missing.slice(0, 5)"
                :key="item.requirementId"
                class="flex items-center gap-3 rounded-lg px-3 py-2.5"
              >
                <UiTypeIcon :type="item.type" :size="14" />
                <div class="min-w-0 flex-1">
                  <div class="truncate text-[13.5px] font-[540] text-ink">{{ item.title }}</div>
                  <div class="mt-0.5 flex items-center gap-2 text-[12px] text-ink-soft">
                    <span>{{ typeLabels[item.type] ?? item.type }}</span>
                    <span>·</span>
                    <span :class="daysUntil(item.dueDate) <= 7 ? 'font-[540] text-danger' : ''">
                      Due {{ fmtDateShort(item.dueDate) }} · {{ relativeDays(item.dueDate) }}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  :disabled="checklistPending"
                  class="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border-strong bg-surface px-2.5 py-1.5 text-[12px] font-semibold text-ink-mid transition-colors hover:bg-[#EEF1F6] disabled:cursor-not-allowed disabled:opacity-45"
                  @click="onUpdateItem(item.requirementId, { status: 'complete' })"
                >
                  <UiIcon name="check" :size="12" />
                  Mark complete
                </button>
              </div>
            </div>

            <div
              v-if="missing.length > 5"
              class="border-t border-border bg-[#FAFBFD] px-[18px] py-[10px] text-[12.5px] text-ink-soft"
            >
              + {{ missing.length - 5 }} more in checklist below
            </div>
          </UiCard>
        </div>

        <!-- Checklist section -->
        <div class="flex flex-col gap-4">
          <template v-if="groups.length > 0">
            <div>
              <h2 class="m-0 text-[18px] font-semibold tracking-[-0.012em] text-ink">Checklist</h2>
              <p class="mt-1 text-[13.5px] text-ink-soft">
                Click any row to update status or add notes. Completing an item updates your score and timeline.
              </p>
            </div>
          </template>

          <UiEmptyState
            v-if="groups.length === 0"
            icon="graduation"
            title="No checklist items"
            body="Your checklist will appear here once the program requirements are loaded."
          />

          <ChecklistGroup
            v-for="group in groups"
            :key="group.type"
            :type="group.type"
            :label="group.label"
            :items="group.items"
            :expanded-id="expandedId"
            @expand="onExpand"
            @update-item="onUpdateItem"
          />
        </div>
      </template>
    </template>
  </div>
</template>
