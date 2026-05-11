import type { Program, ProgramsResult } from '@@/types'
import { getApiErrorMessage } from './useApi'

function daysUntilDeadline(iso: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(iso)
  due.setHours(0, 0, 0, 0)
  return Math.round((due.getTime() - today.getTime()) / 86_400_000)
}

export interface ProgramsClientFilters {
  q: string
  degreeTypes: string[]
  departments: string[]
  deadline: 'any' | '30' | '60' | '90'
}

export function usePrograms() {
  const { baseURL } = useApi()

  const catalogPage = ref(1)
  const perPage = 6

  const clientFilters = ref<ProgramsClientFilters>({
    q: '',
    degreeTypes: [],
    departments: [],
    deadline: 'any',
  })

  const { data, pending, error: fetchError, refresh } = useAsyncData(
    'programs-catalog',
    () =>
      $fetch<ProgramsResult>('/programs', {
        baseURL,
        query: { page: 1, limit: 50 },
      }),
  )

  const programs = computed(() => data.value?.data ?? [])
  const error = computed(() => (fetchError.value ? getApiErrorMessage(fetchError.value) : null))

  const allDepartments = computed(() =>
    [...new Set(programs.value.map(p => p.department))].sort((a, b) => a.localeCompare(b)),
  )

  const allDegreeTypes = computed(() => [...new Set(programs.value.map(p => p.degreeType))])

  const filteredPrograms = computed(() => {
    const f = clientFilters.value
    return programs.value.filter((p) => {
      if (f.q.trim()) {
        const q = f.q.toLowerCase()
        if (!`${p.name} ${p.university} ${p.department}`.toLowerCase().includes(q)) return false
      }
      if (f.degreeTypes.length && !f.degreeTypes.includes(p.degreeType)) return false
      if (f.departments.length && !f.departments.includes(p.department)) return false
      if (f.deadline !== 'any') {
        const d = daysUntilDeadline(p.applicationDeadline)
        if (f.deadline === '30' && d > 30) return false
        if (f.deadline === '60' && d > 60) return false
        if (f.deadline === '90' && d > 90) return false
      }
      return true
    })
  })

  const catalogTotalPages = computed(() =>
    Math.max(1, Math.ceil(filteredPrograms.value.length / perPage)),
  )

  const visiblePrograms = computed(() => {
    const start = (catalogPage.value - 1) * perPage
    return filteredPrograms.value.slice(start, start + perPage)
  })

  const activeClientFilterCount = computed(() => {
    const f = clientFilters.value
    return f.degreeTypes.length + f.departments.length + (f.deadline !== 'any' ? 1 : 0)
  })

  watch(filteredPrograms, (list) => {
    const maxPage = Math.max(1, Math.ceil(list.length / perPage))
    if (catalogPage.value > maxPage) catalogPage.value = maxPage
  })

  function setSearch(q: string): void {
    clientFilters.value = { ...clientFilters.value, q }
    catalogPage.value = 1
  }

  function toggleDegreeType(degree: string): void {
    const set = new Set(clientFilters.value.degreeTypes)
    if (set.has(degree)) set.delete(degree)
    else set.add(degree)
    clientFilters.value = { ...clientFilters.value, degreeTypes: [...set] }
    catalogPage.value = 1
  }

  function setDepartmentChecked(dept: string, checked: boolean): void {
    const next = new Set(clientFilters.value.departments)
    if (checked) next.add(dept)
    else next.delete(dept)
    clientFilters.value = { ...clientFilters.value, departments: [...next] }
    catalogPage.value = 1
  }

  function setDeadline(deadline: ProgramsClientFilters['deadline']): void {
    clientFilters.value = { ...clientFilters.value, deadline }
    catalogPage.value = 1
  }

  function clearClientFilters(): void {
    clientFilters.value = {
      q: '',
      degreeTypes: [],
      departments: [],
      deadline: 'any',
    }
    catalogPage.value = 1
  }

  function setCatalogPage(n: number): void {
    catalogPage.value = Math.min(Math.max(1, n), catalogTotalPages.value)
  }

  return {
    programs,
    pending,
    error,
    refresh,
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
  }
}
