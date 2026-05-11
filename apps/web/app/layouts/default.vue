<script setup lang="ts">
import type { ProgramDetail } from '@@/types'

const route = useRoute()
const { session, hydrate, clear } = useSession()
const { baseURL } = useApi()

// Populate session from localStorage synchronously on the client side.
// No-op on server, so SSR renders with empty session (correct).
if (import.meta.client) {
  hydrate()
}

// --- Sidebar ---
const collapsed = ref(false)

const navItems = [
  { label: 'Dashboard', icon: 'grid',     href: '/dashboard' },
  { label: 'Programs',  icon: 'school',   href: '/programs'  },
  { label: 'Timeline',  icon: 'calendar', href: '/timeline'  },
  { label: 'Profile',   icon: 'user',     href: '/profile'    },
] as const

function isActive(href: string) {
  return route.path === href || route.path.startsWith(href + '/')
}

// --- Active program in sidebar ---
// useProgramDetail captures programId statically and cannot react to changes
// that occur during the layout's lifetime (e.g. user selects a program while
// already on the dashboard). We use useAsyncData with a watch instead so the
// sidebar always reflects the current session.programId.
const activeProgramId = computed(() => session.value.programId)

const { data: activeProgram, pending: programPending } = useAsyncData<ProgramDetail | null>(
  'layout-active-program',
  () =>
    session.value.programId
      ? $fetch<ProgramDetail>(`/programs/${session.value.programId}`, { baseURL })
      : Promise.resolve(null),
  { watch: [activeProgramId] },
)

// --- Topbar ---
const pageTitles: Record<string, string> = {
  '/dashboard':  'Readiness Dashboard',
  '/programs':   'Program Catalog',
  '/timeline':   'Timeline',
  '/onboarding': 'Your Profile',
  '/profile':    'Profile',
}

const pageTitle = computed(() => pageTitles[route.path] ?? '')

const topbarSubtitle = computed(() => {
  if (route.path === '/dashboard' && activeProgram.value) {
    return `${activeProgram.value.university} · ${activeProgram.value.degreeType}`
  }
  return ''
})

// --- User dropdown ---
const dropdownOpen = ref(false)

function signOut() {
  clear()
  dropdownOpen.value = false
  navigateTo('/onboarding')
}
</script>

<template>
  <div class="flex min-h-screen bg-bg font-sans">

    <!-- ── Sidebar ─────────────────────────────────────────────── -->
    <aside
      class="sticky top-0 flex h-screen shrink-0 flex-col border-r border-navy-dark bg-navy text-white transition-[width] duration-200"
      :style="{ width: collapsed ? '72px' : '248px' }"
    >
      <!-- Logo row -->
      <div
        class="flex h-16 shrink-0 items-center gap-2.5 border-b border-white/[0.08]"
        :class="collapsed ? 'justify-center' : 'px-5'"
      >
        <div
          class="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg bg-teal text-[14px] font-bold tracking-[-0.02em] text-navy-dark"
        >
          Ad
        </div>
        <div v-if="!collapsed" class="flex flex-col leading-[1.15]">
          <span class="text-[14.5px] font-semibold tracking-[-0.01em]">ADMISSION</span>
          <span class="text-[11px] tracking-[0.04em]" style="color: #94A6C7">READINESS · 2027</span>
        </div>
      </div>

      <!-- Nav -->
      <nav class="flex flex-col gap-0.5 p-2.5">
        <NuxtLink
          v-for="item in navItems"
          :key="item.href"
          :to="item.href"
          :aria-current="isActive(item.href) ? 'page' : undefined"
          :title="collapsed ? item.label : undefined"
          class="relative flex items-center gap-3 rounded-lg text-[14px] font-[540] transition-colors"
          :class="[
            collapsed ? 'justify-center py-2.5' : 'px-3 py-[9px]',
            isActive(item.href)
              ? 'bg-teal/[0.16] text-white'
              : 'text-[#B8C5DD] hover:bg-white/[0.05] hover:text-white',
          ]"
        >
          <!-- Active left indicator bar -->
          <span
            v-if="isActive(item.href) && !collapsed"
            class="absolute bottom-2 left-0 top-2 w-[3px] rounded-sm bg-teal"
          />
          <UiIcon :name="(item.icon as any)" :size="18" />
          <span v-if="!collapsed">{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <div class="flex-1" />

      <!-- Active program card (expanded only) -->
      <div v-if="!collapsed && session.programId" class="px-[18px] pb-3.5">
        <div
          class="rounded-[10px] border border-white/[0.08] p-3"
          style="background: rgba(255,255,255,0.05)"
        >
          <div class="mb-1 text-[11px] uppercase tracking-[0.06em]" style="color: #94A6C7">
            Active program
          </div>
          <template v-if="programPending">
            <div class="h-3.5 w-32 animate-pulse rounded bg-white/10" />
            <div class="mt-1.5 h-3 w-24 animate-pulse rounded bg-white/10" />
          </template>
          <template v-else-if="activeProgram">
            <div class="text-[13px] font-[540] leading-snug">{{ activeProgram.name }}</div>
            <div class="mt-0.5 text-[12px]" style="color: #B8C5DD">
              {{ activeProgram.university }}
            </div>
          </template>
          <template v-else>
            <div class="text-[13px]" style="color: #B8C5DD">No program selected</div>
          </template>
        </div>
      </div>

      <!-- Collapse toggle -->
      <button
        type="button"
        class="flex items-center gap-2 border-t border-white/[0.06] p-3 text-[12px] transition-colors hover:bg-white/[0.04]"
        :class="collapsed ? 'justify-center' : ''"
        style="color: #94A6C7"
        :aria-label="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        @click="collapsed = !collapsed"
      >
        <UiIcon :name="collapsed ? 'chevronRight' : 'chevronLeft'" :size="14" />
        <span v-if="!collapsed">Collapse</span>
      </button>
    </aside>

    <!-- ── Main ──────────────────────────────────────────────────── -->
    <div class="flex min-w-0 flex-1 flex-col">

      <!-- Topbar -->
      <header class="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-border bg-surface px-8">
        <div>
          <!-- subtitle line always occupies space so title doesn't jump -->
          <div class="text-[12px] tracking-[0.04em] text-ink-soft">
            {{ topbarSubtitle }}&nbsp;
          </div>
          <h1 class="m-0 text-[18px] font-semibold leading-none tracking-[-0.012em] text-ink">
            {{ pageTitle }}
          </h1>
        </div>

        <!-- User menu -->
        <div class="relative" @mouseleave="dropdownOpen = false">
          <button
            type="button"
            class="flex items-center gap-2.5 rounded-full border border-border bg-surface py-1 pl-1 pr-2.5 transition-shadow hover:shadow-sm"
            @click="dropdownOpen = !dropdownOpen"
          >
            <span
              class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-navy text-white"
            >
              <UiIcon name="user" :size="15" />
            </span>
            <UiIcon name="chevronDown" :size="14" class="text-ink-soft" />
          </button>

          <!-- Dropdown panel -->
          <div
            v-if="dropdownOpen"
            class="absolute right-0 top-[50px] z-30 min-w-[220px] rounded-[10px] border border-border bg-surface p-2 shadow-[0_10px_24px_rgba(11,31,68,0.10)]"
          >
            <div class="mb-1.5 border-b border-border px-2.5 pb-2.5 pt-2">
              <div class="text-[13.5px] font-semibold text-ink">My account</div>
              <div class="text-[12px] text-ink-soft">
                {{ session.profileId ? `ID: ${session.profileId}` : 'Not signed in' }}
              </div>
            </div>
            <button
              type="button"
              class="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[13.5px] text-ink transition-colors hover:bg-[#EEF1F6]"
              @click="navigateTo('/profile'); dropdownOpen = false"
            >
              <UiIcon name="user" :size="14" class="text-ink-soft" />
              Edit profile
            </button>
            <button
              type="button"
              class="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[13.5px] text-ink transition-colors hover:bg-[#EEF1F6]"
              @click="signOut"
            >
              <UiIcon name="logout" :size="14" class="text-ink-soft" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <!-- Page content -->
      <main class="flex-1 px-10 py-7">
        <div class="mx-auto max-w-[1320px]">
          <slot />
        </div>
      </main>
    </div>

  </div>
</template>
