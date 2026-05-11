<script setup lang="ts">
definePageMeta({ middleware: 'requires-profile' })

const route = useRoute()
const programId = route.params.id as string

const { session, setProgramId, addSelectedProgram } = useSession()
const { updateProfile } = useProfile()
const { apiFetch } = useApi()

const { program, pending, error } = useProgramDetail(programId)

const selected = computed(() => session.value.selectedProgramIds.includes(programId))
const active = computed(() => session.value.programId === programId)

const selecting = ref(false)
const toastMsg = ref('')

async function selectAndGo() {
  selecting.value = true
  const profileId = session.value.profileId
  setProgramId(programId)
  addSelectedProgram(programId)
  try {
    await updateProfile(profileId, { selectedProgramIds: [...session.value.selectedProgramIds] })
    await apiFetch('/checklists', { method: 'POST', body: { profileId, programId } })
    await navigateTo('/dashboard')
  } catch (err: unknown) {
    toastMsg.value = (err as Error).message
    selecting.value = false
  }
}

function setActive() {
  setProgramId(programId)
}

const typeOrder = ['document', 'test_score', 'recommendation', 'financial', 'writing']

const typeLabels: Record<string, string> = {
  document: 'Documents',
  test_score: 'Test Scores',
  recommendation: 'Recommendations',
  financial: 'Financial',
  writing: 'Writing',
}

const evidenceLabels: Record<string, string> = {
  pdf_upload: 'PDF Upload',
  score_report: 'Score Report',
  reference_form: 'Reference Form',
  payment: 'Payment',
  other: 'Other',
}

const daysUntil = computed(() => {
  if (!program.value) return 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(program.value.applicationDeadline)
  due.setHours(0, 0, 0, 0)
  return Math.round((due.getTime() - today.getTime()) / 86_400_000)
})

const deadlineAccent = computed(() => daysUntil.value <= 30)

const groupedRequirements = computed(() => {
  if (!program.value) return []
  const map: Record<string, typeof program.value.requirements> = {}
  program.value.requirements.forEach((r) => {
    map[r.type] = map[r.type] ?? []
    map[r.type].push(r)
  })
  return typeOrder
    .filter((k) => map[k])
    .map((k) => ({ type: k, label: typeLabels[k] ?? k, items: map[k] }))
})

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' })
}
</script>

<template>
  <div>
    <UiToast :message="toastMsg" type="error" @dismiss="toastMsg = ''" />

    <!-- Back link -->
    <div class="mb-5">
      <NuxtLink
        to="/programs"
        class="inline-flex items-center gap-1.5 text-[13px] font-[540] text-ink-mid transition-colors hover:text-ink"
      >
        <UiIcon name="chevronLeft" :size="14" />
        Program Catalog
      </NuxtLink>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="flex flex-col items-center gap-3 py-24">
      <svg class="h-8 w-8 animate-spin text-navy-mid" viewBox="0 0 24 24" fill="none">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
      <p class="text-sm text-ink-soft">Loading program…</p>
    </div>

    <!-- Error -->
    <UiEmptyState
      v-else-if="error"
      icon="alert"
      title="Failed to load program"
      :body="error"
    >
      <template #action>
        <NuxtLink
          to="/programs"
          class="rounded-lg border border-border-strong bg-surface px-4 py-2 text-sm font-semibold text-ink-mid transition-colors hover:bg-[#EEF1F6]"
        >
          Back to catalog
        </NuxtLink>
      </template>
    </UiEmptyState>

    <!-- Content -->
    <div v-else-if="program" class="mx-auto max-w-[800px] overflow-hidden rounded-xl border border-border shadow-sm">

      <!-- Navy header -->
      <div class="px-7 pb-[18px] pt-[22px]" style="background: #0B1F44; color: #fff">
        <div class="mb-2 flex items-center gap-2">
          <UiBadge tone="teal">{{ program.degreeType }}</UiBadge>
          <span class="text-[13px]" style="color: #A6B7D6">{{ program.department }}</span>
        </div>
        <h1 class="m-0 text-[22px] font-semibold leading-snug tracking-[-0.014em]">{{ program.name }}</h1>
        <div class="mt-1 text-[14px]" style="color: #C2CEE2">{{ program.university }}</div>

        <!-- KPIs -->
        <div class="mt-[18px] flex flex-wrap gap-6">
          <div>
            <div class="text-[11px] uppercase tracking-[0.06em]" style="color: #A6B7D6">Deadline</div>
            <div class="mt-0.5 text-[16px] font-semibold" :style="{ color: deadlineAccent ? '#FFC4A6' : '#fff' }">
              {{ fmtDate(program.applicationDeadline) }}
              <span v-if="daysUntil <= 30" class="ml-1.5 text-[13px] font-normal" style="color: #C2CEE2">
                in {{ daysUntil }} days
              </span>
            </div>
          </div>
          <div>
            <div class="text-[11px] uppercase tracking-[0.06em]" style="color: #A6B7D6">Tuition</div>
            <div class="mt-0.5 text-[16px] font-semibold text-white">
              ${{ program.tuitionPerYear.toLocaleString() }}
              <span class="ml-1.5 text-[13px] font-normal" style="color: #C2CEE2">per year</span>
            </div>
          </div>
          <div>
            <div class="text-[11px] uppercase tracking-[0.06em]" style="color: #A6B7D6">Duration</div>
            <div class="mt-0.5 text-[16px] font-semibold text-white">{{ program.duration }}</div>
          </div>
          <div>
            <div class="text-[11px] uppercase tracking-[0.06em]" style="color: #A6B7D6">Requirements</div>
            <div class="mt-0.5 text-[16px] font-semibold text-white">{{ program.requirements.length }} items</div>
          </div>
        </div>
      </div>

      <!-- Summary -->
      <div class="px-7 pb-2 pt-[22px]">
        <div class="text-[11.5px] font-semibold uppercase tracking-[0.06em] text-ink-mid">Summary</div>
        <p class="mt-2 text-[14px] leading-[1.55] text-ink-mid" style="text-wrap: pretty">
          {{ program.description }}
        </p>
      </div>

      <!-- Requirements -->
      <div class="px-7 pb-1.5 pt-[22px]">
        <div class="mb-3 text-[11.5px] font-semibold uppercase tracking-[0.06em] text-ink-mid">Requirements</div>
        <div class="flex flex-col gap-[18px]">
          <div v-for="group in groupedRequirements" :key="group.type">
            <div class="mb-2 flex items-center gap-2">
              <UiTypeIcon :type="group.type" :size="14" />
              <span class="text-[13px] font-semibold text-ink">{{ group.label }}</span>
              <span class="text-[12px] text-ink-soft">· {{ group.items.length }}</span>
            </div>
            <div class="overflow-hidden rounded-[10px] border border-border">
              <div
                v-for="(req, idx) in group.items"
                :key="req.id"
                class="grid grid-cols-[1fr_auto] gap-4 px-3.5 py-3"
                :class="idx > 0 ? 'border-t border-border' : ''"
              >
                <div>
                  <div class="text-[13.5px] font-[540] text-ink">{{ req.title }}</div>
                  <div v-if="req.description" class="mt-0.5 text-[12.5px] text-ink-soft">
                    {{ req.description }}
                  </div>
                </div>
                <div class="self-center">
                  <UiBadge tone="soft" size="sm">{{ evidenceLabels[req.evidenceType] ?? req.evidenceType }}</UiBadge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="mt-2 flex items-center justify-between border-t border-border bg-[#FAFBFD] px-7 py-[16px]">
        <p class="max-w-[360px] text-[12.5px] text-ink-soft">
          <template v-if="selected">
            This program is on your list. Selecting again won't duplicate it.
          </template>
          <template v-else>
            Selecting generates a personalized checklist with due dates derived from this program's deadline.
          </template>
        </p>

        <div class="flex gap-2.5">
          <NuxtLink
            to="/programs"
            class="rounded-lg border border-border-strong px-4 py-2 text-sm font-semibold text-ink-mid transition-colors hover:bg-[#EEF1F6]"
          >
            Back to catalog
          </NuxtLink>

          <template v-if="selected">
            <button
              v-if="!active"
              type="button"
              class="rounded-lg border border-border-strong px-4 py-2 text-sm font-semibold text-ink-mid transition-colors hover:bg-[#EEF1F6]"
              @click="setActive"
            >
              Make active
            </button>
            <NuxtLink
              to="/dashboard"
              class="inline-flex items-center gap-1.5 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              View checklist
              <UiIcon name="chevronRight" :size="14" />
            </NuxtLink>
          </template>

          <button
            v-else
            type="button"
            :disabled="selecting"
            class="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
            style="background: #0EA5A5"
            @click="selectAndGo"
          >
            <svg v-if="selecting" class="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            <UiIcon v-else name="plus" :size="14" />
            Select program
          </button>
        </div>
      </div>

    </div>
  </div>
</template>
