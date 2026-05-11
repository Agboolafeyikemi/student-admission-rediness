<script setup lang="ts">
import type { Program, ProgramDetail } from '@@/types'

definePageMeta({ layout: 'default' })

const { session, setProgramId, addSelectedProgram, setPendingProgramId } = useSession()
const { updateProfile } = useProfile()
const { apiFetch } = useApi()

const {
  programs,
  pending,
  error,
  clientFilters,
  catalogPage,
  perPage,
  allDepartments,
  allDegreeTypes,
  filteredPrograms,
  visiblePrograms,
  catalogTotalPages,
  activeClientFilterCount,
  setSearch,
  toggleDegreeType,
  setDepartmentChecked,
  setDeadline,
  clearClientFilters,
  setCatalogPage,
} = usePrograms()

const selectedCount = computed(() => session.value.selectedProgramIds.length)

const headerSubtitle = computed(() => {
  const n = filteredPrograms.value.length
  const plural = n === 1 ? '' : 's'
  return `${n} program${plural} matching your filters · ${selectedCount.value} selected`
})

function isProgramSelected(id: string) {
  return session.value.selectedProgramIds.includes(id)
}

function isProgramActive(id: string) {
  return session.value.programId === id
}

const modalOpen = ref(false)
const modalProgram = ref<ProgramDetail | null>(null)
const modalPending = ref(false)
const toastMsg = ref('')

watch(error, (e) => {
  if (e) toastMsg.value = e
})

async function openModal(p: Program) {
  modalProgram.value = null
  modalPending.value = true
  modalOpen.value = true
  try {
    modalProgram.value = await apiFetch<ProgramDetail>(`/programs/${p.id}`)
  } catch (err: unknown) {
    toastMsg.value = (err as Error).message
    modalOpen.value = false
  } finally {
    modalPending.value = false
  }
}

function closeModal() {
  modalOpen.value = false
  modalProgram.value = null
}

async function selectProgram(programId: string) {
  const profileId = session.value.profileId
  if (!profileId) {
    setPendingProgramId(programId)
    await navigateTo('/onboarding')
    return
  }
  setProgramId(programId)
  addSelectedProgram(programId)
  try {
    await updateProfile(profileId, { selectedProgramIds: [...session.value.selectedProgramIds] })
    await apiFetch('/checklists', { method: 'POST', body: { profileId, programId } })
  } catch (err: unknown) {
    toastMsg.value = (err as Error).message
  }
}

function setActiveFromModal() {
  if (!modalProgram.value) return
  setProgramId(modalProgram.value.id)
}

const modalSelected = computed(() =>
  modalProgram.value ? isProgramSelected(modalProgram.value.id) : false,
)

const modalActive = computed(() =>
  modalProgram.value ? isProgramActive(modalProgram.value.id) : false,
)

async function onModalSelect() {
  if (!modalProgram.value) return
  await selectProgram(modalProgram.value.id)
}

function goChecklist() {
  closeModal()
  navigateTo('/dashboard')
}

const deadlineOptions = [
  { v: 'any' as const, label: 'Any time' },
  { v: '30' as const, label: 'Next 30 days' },
  { v: '60' as const, label: 'Next 60 days' },
  { v: '90' as const, label: 'Next 90 days' },
]

const pageNumbers = computed(() =>
  Array.from({ length: catalogTotalPages.value }, (_, i) => i + 1),
)

const rangeLabel = computed(() => {
  const total = filteredPrograms.value.length
  if (total === 0) return ''
  const from = (catalogPage.value - 1) * perPage + 1
  const to = Math.min(catalogPage.value * perPage, total)
  return `Showing ${from}\u2013${to} of ${total}`
})
</script>

<template>
  <div>
    <UiToast :message="toastMsg" type="error" @dismiss="toastMsg = ''" />

    <div v-if="pending && programs.length === 0" class="flex flex-col items-center gap-3 py-20">
      <svg class="h-8 w-8 animate-spin text-navy-mid" viewBox="0 0 24 24" fill="none">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
      <p class="text-sm text-ink-soft">Loading programs…</p>
    </div>

    <template v-else>
      <UiSectionHeader title="Program Catalog" :subtitle="headerSubtitle">
        <template #right>
          <div class="w-full min-w-0 sm:w-[280px]">
            <div
              class="flex h-10 items-center gap-2 rounded-lg border border-border-strong bg-surface px-3 transition-colors focus-within:border-navy"
            >
              <UiIcon name="search" :size="14" class="shrink-0 text-ink-soft" />
              <input
                id="catalog-search"
                type="search"
                :value="clientFilters.q"
                placeholder="Search by name, school, dept…"
                class="min-w-0 flex-1 border-0 bg-transparent text-sm text-ink outline-none placeholder:text-ink-soft"
                autocomplete="off"
                @input="setSearch(($event.target as HTMLInputElement).value)"
              >
            </div>
          </div>
        </template>
      </UiSectionHeader>

      <div class="grid grid-cols-1 items-start gap-6 lg:grid-cols-[248px_1fr] lg:gap-6">
        <!-- Filters -->
        <aside class="min-w-0">
          <UiCard :padded="false" class="lg:sticky lg:top-[88px]">
            <div
              class="flex items-center justify-between border-b border-border px-4 py-3.5"
            >
              <span class="flex items-center gap-2 text-[13.5px] font-semibold text-ink">
                <UiIcon name="filter" :size="16" />
                Filters
              </span>
              <button
                v-if="activeClientFilterCount > 0"
                type="button"
                class="text-xs font-[540] text-navy-mid hover:underline"
                @click="clearClientFilters"
              >
                Clear ({{ activeClientFilterCount }})
              </button>
            </div>

            <div class="border-b border-border px-4 py-3.5">
              <div
                class="mb-2.5 text-[11.5px] font-semibold uppercase tracking-[0.06em] text-ink-mid"
              >
                Degree type
              </div>
              <div class="flex flex-wrap gap-1.5">
                <button
                  v-for="d in allDegreeTypes"
                  :key="d"
                  type="button"
                  class="rounded-full border px-2.5 py-1 text-[12.5px] font-[540] transition-colors"
                  :class="clientFilters.degreeTypes.includes(d)
                    ? 'border-navy bg-navy text-white'
                    : 'border-border-strong bg-surface text-ink hover:border-navy hover:text-navy'"
                  @click="toggleDegreeType(d)"
                >
                  {{ d }}
                </button>
              </div>
            </div>

            <div class="border-b border-border px-4 py-3.5">
              <div
                class="mb-2.5 text-[11.5px] font-semibold uppercase tracking-[0.06em] text-ink-mid"
              >
                Department
              </div>
              <div class="flex max-h-[240px] flex-col gap-2 overflow-y-auto pr-1">
                <UiCheckbox
                  v-for="d in allDepartments"
                  :id="`dept-${d}`"
                  :key="d"
                  :model-value="clientFilters.departments.includes(d)"
                  :label="d"
                  @update:model-value="setDepartmentChecked(d, $event)"
                />
              </div>
            </div>

            <div class="px-4 py-3.5">
              <div
                class="mb-2.5 text-[11.5px] font-semibold uppercase tracking-[0.06em] text-ink-mid"
              >
                Deadline within
              </div>
              <div class="flex flex-col gap-1.5">
                <label
                  v-for="o in deadlineOptions"
                  :key="o.v"
                  class="flex cursor-pointer items-center gap-2.5 text-[13px] text-ink"
                >
                  <input
                    type="radio"
                    name="catalog-deadline"
                    class="accent-navy"
                    :checked="clientFilters.deadline === o.v"
                    @change="setDeadline(o.v)"
                  >
                  {{ o.label }}
                </label>
              </div>
            </div>
          </UiCard>
        </aside>

        <!-- Grid -->
        <div class="min-w-0">
          <UiEmptyState
            v-if="visiblePrograms.length === 0"
            icon="search"
            title="No programs match those filters"
            body="Try removing a filter or broadening your deadline window."
          >
            <template #action>
              <button
                type="button"
                class="rounded-lg border border-border-strong bg-surface px-4 py-2 text-sm font-semibold text-ink-mid transition-colors hover:bg-[#EEF1F6]"
                @click="clearClientFilters"
              >
                Clear all filters
              </button>
            </template>
          </UiEmptyState>

          <div v-else class="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <ProgramCard
              v-for="p in visiblePrograms"
              :id="p.id"
              :key="p.id"
              :name="p.name"
              :university="p.university"
              :degree="p.degreeType"
              :department="p.department"
              :deadline="p.applicationDeadline"
              :tuition="p.tuitionPerYear"
              :duration="p.duration"
              :selected="isProgramSelected(p.id)"
              :active="isProgramActive(p.id)"
              @view="openModal(p)"
              @select="selectProgram(p.id)"
            />
          </div>

          <div
            v-if="filteredPrograms.length > perPage"
            class="mt-5 flex flex-col gap-3 border-t border-transparent pt-2 sm:flex-row sm:items-center sm:justify-between"
          >
            <div class="text-[13px] text-ink-soft">{{ rangeLabel }}</div>
            <div class="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                class="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs font-semibold text-ink-mid disabled:cursor-not-allowed disabled:opacity-45"
                :disabled="catalogPage === 1"
                @click="setCatalogPage(catalogPage - 1)"
              >
                <UiIcon name="chevronLeft" :size="14" />
                Prev
              </button>
              <button
                v-for="n in pageNumbers"
                :key="n"
                type="button"
                class="flex h-8 w-8 items-center justify-center rounded-md border text-[13px] font-[540]"
                :class="n === catalogPage
                  ? 'border-navy bg-navy text-white'
                  : 'border-border bg-surface text-ink hover:border-border-strong'"
                @click="setCatalogPage(n)"
              >
                {{ n }}
              </button>
              <button
                type="button"
                class="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs font-semibold text-ink-mid disabled:cursor-not-allowed disabled:opacity-45"
                :disabled="catalogPage === catalogTotalPages"
                @click="setCatalogPage(catalogPage + 1)"
              >
                Next
                <UiIcon name="chevronRight" :size="14" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <ProgramDetailModal
      :open="modalOpen"
      :program="modalProgram"
      :pending="modalPending"
      :selected="modalSelected"
      :active="modalActive"
      @close="closeModal"
      @select="onModalSelect"
      @set-active="setActiveFromModal"
      @view-checklist="goChecklist"
    />
  </div>
</template>
