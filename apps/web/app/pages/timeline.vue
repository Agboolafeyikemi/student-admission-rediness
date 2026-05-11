<script setup lang="ts">
definePageMeta({ middleware: 'requires-profile' })

const { session } = useSession()
const profileId = session.value.profileId
const programId = session.value.programId

const { events: apiEvents, pending: timelinePending, refresh: timelineRefresh } = useTimeline(profileId, programId)
const { programs, pending: programsPending } = usePrograms()
const { apiFetch } = useApi()

const activeProgram = computed(() => programs.value.find(p => p.id === programId) ?? null)

type FlatEvent = {
  id: string
  title: string
  date: string
  status: 'pending' | 'complete'
  type: 'deadline' | 'milestone' | 'submission' | 'program_start'
  sourceType: string
  isProgramDeadline: boolean
  isStart: boolean
  relatedRequirementId?: string
}

const typeSourceLabels: Record<string, string> = {
  deadline: 'Deadline',
  milestone: 'Milestone',
  submission: 'Submission',
  program_start: 'Term start',
}

function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number)
  return new Date(y, m - 1, d)
}

function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const todayStr = computed(() => toISODate(new Date()))

const allEvents = computed<FlatEvent[]>(() => {
  const apiMapped: FlatEvent[] = apiEvents.value.map(e => ({
    id: e.id,
    title: e.title,
    date: e.date,
    status: e.status,
    type: e.type,
    sourceType: typeSourceLabels[e.type] ?? e.type,
    isProgramDeadline: false,
    isStart: false,
    relatedRequirementId: e.relatedRequirementId,
  }))

  const derived: FlatEvent[] = []
  const prog = activeProgram.value
  if (prog) {
    const startDate = parseLocalDate(prog.applicationDeadline)
    startDate.setMonth(startDate.getMonth() + 4)

    derived.push({
      id: `deadline-${programId}`,
      title: `${prog.name} — Application Deadline`,
      date: prog.applicationDeadline,
      status: 'pending',
      type: 'deadline',
      sourceType: 'Application',
      isProgramDeadline: true,
      isStart: false,
    })
    derived.push({
      id: `start-${programId}`,
      title: `${prog.name} — Program begins`,
      date: toISODate(startDate),
      status: 'pending',
      type: 'program_start',
      sourceType: 'Term start',
      isProgramDeadline: false,
      isStart: true,
    })
  }

  return [...apiMapped, ...derived].sort((a, b) => a.date.localeCompare(b.date))
})

const pastEvents = computed(() => allEvents.value.filter(e => e.date < todayStr.value))
const upcomingEvents = computed(() => allEvents.value.filter(e => e.date >= todayStr.value))
const completedCount = computed(() => allEvents.value.filter(e => e.status === 'complete').length)

const next7Count = computed(() => {
  const todayMs = parseLocalDate(todayStr.value).getTime()
  return upcomingEvents.value.filter(e => {
    const diff = Math.round((parseLocalDate(e.date).getTime() - todayMs) / 86_400_000)
    return diff <= 7
  }).length
})

const markPending = ref(false)

async function onToggleComplete(event: FlatEvent) {
  if (!event.relatedRequirementId || markPending.value) return
  markPending.value = true
  try {
    await apiFetch('/checklists/item', {
      method: 'PATCH',
      body: { profileId, requirementId: event.relatedRequirementId, status: 'complete' },
    })
    await timelineRefresh()
  } finally {
    markPending.value = false
  }
}

function fmtDate(iso: string): string {
  return parseLocalDate(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

const loading = computed(() => timelinePending.value || programsPending.value)

const legendItems = [
  { type: 'deadline', label: 'Deadline' },
  { type: 'milestone', label: 'Milestone' },
  { type: 'submission', label: 'Submission' },
  { type: 'program_start', label: 'Program start' },
] as const
</script>

<template>
  <div>
    <!-- No active program -->
    <UiEmptyState
      v-if="!programId"
      icon="graduation"
      title="No active program"
      body="Select a program from the catalog to start tracking your timeline."
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
      <!-- Loading -->
      <div v-if="loading" class="flex flex-col items-center gap-3 py-24">
        <svg class="h-8 w-8 animate-spin text-navy-mid" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
        <p class="text-sm text-ink-soft">Loading timeline…</p>
      </div>

      <template v-else>
        <UiSectionHeader
          title="Timeline"
          :subtitle="activeProgram
            ? `${upcomingEvents.length} upcoming, ${completedCount} complete · derived from your checklist for ${activeProgram.name}`
            : ''"
        />

        <div class="grid items-start gap-6 lg:grid-cols-[1fr_280px]">

          <!-- Left: timeline card -->
          <UiCard :padded="false">
            <div class="px-7 pb-6 pt-5">

              <!-- Past section -->
              <template v-if="pastEvents.length > 0">
                <div class="mb-3 text-[11.5px] font-semibold uppercase tracking-[0.06em] text-ink-soft">
                  Past
                </div>
                <div class="mb-[18px]">
                  <TimelineItem
                    v-for="(ev, i) in pastEvents"
                    :key="ev.id"
                    :id="ev.id"
                    :title="ev.title"
                    :date="ev.date"
                    :status="ev.status"
                    :type="ev.type"
                    :source-type="ev.sourceType"
                    :is-program-deadline="ev.isProgramDeadline"
                    :is-start="ev.isStart"
                    :is-last="i === pastEvents.length - 1"
                    :dim="true"
                    @toggle-complete="onToggleComplete(ev)"
                  />
                </div>
              </template>

              <!-- Today marker -->
              <div
                class="mb-[14px] flex items-center gap-2.5 rounded-[10px] border border-dashed border-teal px-3 py-2.5"
                style="background: linear-gradient(90deg, rgba(14,165,165,0.08), rgba(14,165,165,0))"
              >
                <span
                  class="h-2.5 w-2.5 shrink-0 rounded-full bg-teal"
                  style="box-shadow: 0 0 0 4px rgba(14,165,165,0.18)"
                />
                <span class="text-[13px] font-semibold tracking-[-0.005em] text-ink">
                  Today · {{ fmtDate(todayStr) }}
                </span>
              </div>

              <!-- Upcoming section -->
              <div class="mb-3 mt-[22px] text-[11.5px] font-semibold uppercase tracking-[0.06em] text-ink-soft">
                Upcoming
              </div>

              <div
                v-if="upcomingEvents.length === 0"
                class="py-6 text-[13.5px] text-ink-soft"
              >
                Nothing upcoming.
              </div>

              <template v-else>
                <TimelineItem
                  v-for="(ev, i) in upcomingEvents"
                  :key="ev.id"
                  :id="ev.id"
                  :title="ev.title"
                  :date="ev.date"
                  :status="ev.status"
                  :type="ev.type"
                  :source-type="ev.sourceType"
                  :is-program-deadline="ev.isProgramDeadline"
                  :is-start="ev.isStart"
                  :is-last="i === upcomingEvents.length - 1"
                  @toggle-complete="onToggleComplete(ev)"
                />
              </template>
            </div>
          </UiCard>

          <!-- Right: sidebar -->
          <div class="flex flex-col gap-3.5">

            <!-- At a glance -->
            <UiCard>
              <div class="mb-2.5 text-[11.5px] font-semibold uppercase tracking-[0.06em] text-ink-mid">
                At a glance
              </div>

              <div class="flex items-center justify-between border-b border-border py-2">
                <span class="text-[13px] text-ink-mid">Items in timeline</span>
                <span class="text-[14px] font-semibold text-ink">{{ allEvents.length }}</span>
              </div>
              <div class="flex items-center justify-between border-b border-border py-2">
                <span class="text-[13px] text-ink-mid">Completed</span>
                <span class="text-[14px] font-semibold" style="color: #137A4D">{{ completedCount }}</span>
              </div>
              <div class="flex items-center justify-between border-b border-border py-2">
                <span class="text-[13px] text-ink-mid">Upcoming</span>
                <span class="text-[14px] font-semibold text-ink">{{ upcomingEvents.length }}</span>
              </div>
              <div class="flex items-center justify-between py-2">
                <span class="text-[13px] text-ink-mid">Next 7 days</span>
                <span class="text-[14px] font-semibold" style="color: #B6500F">{{ next7Count }}</span>
              </div>
            </UiCard>

            <!-- Event types legend -->
            <UiCard>
              <div class="mb-3 text-[11.5px] font-semibold uppercase tracking-[0.06em] text-ink-mid">
                Event types
              </div>
              <div class="flex flex-col gap-2.5">
                <div
                  v-for="item in legendItems"
                  :key="item.type"
                  class="flex items-center gap-2.5 text-[13px] text-ink"
                >
                  <UiTypeIcon :type="item.type" :size="14" />
                  {{ item.label }}
                </div>
              </div>
            </UiCard>

          </div>
        </div>
      </template>
    </template>
  </div>
</template>
