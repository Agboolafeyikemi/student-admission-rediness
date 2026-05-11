<script setup lang="ts">
import type { EducationLevel } from '@@/types'

definePageMeta({ middleware: 'requires-profile' })

const { session, clear } = useSession()
const profileId = session.value.profileId
const { updateProfile, pending, error: saveError } = useProfile()
const { apiFetch } = useApi()

// ── Form state ─────────────────────────────────────────────────────────

const form = reactive({
  fullName: '',
  email: '',
  gpa: '',
  educationLevel: 'bachelor' as EducationLevel | '',
  targetTerm: '',
  scores: { GRE: '', GMAT: '', LSAT: '', TOEFL: '', IELTS: '' } as Record<string, string>,
})

// Fetch the stored profile and hydrate the form
onMounted(async () => {
  try {
    const profile = await apiFetch<{
      name: string; email: string; gpa: number
      educationLevel: EducationLevel; targetTerm: string
      testScores?: Record<string, number>
    }>(`/profiles/${profileId}`)
    form.fullName = profile.name
    form.email = profile.email
    form.gpa = String(profile.gpa)
    form.educationLevel = profile.educationLevel
    form.targetTerm = profile.targetTerm
    if (profile.testScores) {
      for (const k of ['GRE', 'GMAT', 'LSAT', 'TOEFL', 'IELTS']) {
        const v = profile.testScores[k.toLowerCase()]
        if (v !== undefined) form.scores[k] = String(v)
      }
    }
  } catch {}
})

const touched = reactive<Record<string, boolean>>({
  fullName: false,
  email: false,
  gpa: false,
  targetTerm: false,
})

const formErrors = reactive<Record<string, string | null>>({
  fullName: null,
  email: null,
  gpa: null,
  targetTerm: null,
})

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateField(name: string, value: string): string | null {
  switch (name) {
    case 'fullName':
      return value.trim().length < 2 ? 'Enter your full name.' : null
    case 'email':
      return !value || !EMAIL_RE.test(value) ? 'Enter a valid email address.' : null
    case 'gpa': {
      if (value === '') return 'GPA is required.'
      const n = Number(value)
      if (Number.isNaN(n)) return 'Must be a number.'
      if (n < 0 || n > 4) return 'GPA must be 0.0 – 4.0.'
      return null
    }
    case 'targetTerm':
      return !value ? 'Choose a target term.' : null
    default:
      return null
  }
}

function setField(name: string, value: string) {
  (form as Record<string, unknown>)[name] = value
  if (touched[name]) formErrors[name] = validateField(name, value)
  dirty.value = true
  savedFlash.value = false
}

function blurField(name: string, value: string) {
  touched[name] = true
  formErrors[name] = validateField(name, value)
}

function setScore(k: string, v: string) {
  form.scores[k] = v
  dirty.value = true
  savedFlash.value = false
}

const REQUIRED = ['fullName', 'email', 'gpa', 'targetTerm']

const isValid = computed(() =>
  REQUIRED.every((n) => {
    const v = (form as Record<string, unknown>)[n] as string
    return v !== '' && !validateField(n, v)
  }),
)

// ── Save / flash ───────────────────────────────────────────────────────

const dirty = ref(false)
const savedFlash = ref(false)
let flashTimer: ReturnType<typeof setTimeout> | null = null

async function save() {
  if (!isValid.value || !dirty.value || pending.value) return

  // Touch all required fields to surface any remaining errors
  REQUIRED.forEach(n => blurField(n, (form as Record<string, unknown>)[n] as string))
  if (REQUIRED.some(n => formErrors[n])) return

  await updateProfile(profileId, {
    fullName: form.fullName.trim(),
    email: form.email.trim(),
    gpa: parseFloat(form.gpa),
    educationLevel: form.educationLevel as EducationLevel,
    targetTerm: form.targetTerm,
    testScores: {
      gre:   form.scores.GRE   ? Number(form.scores.GRE)   : undefined,
      gmat:  form.scores.GMAT  ? Number(form.scores.GMAT)  : undefined,
      lsat:  form.scores.LSAT  ? Number(form.scores.LSAT)  : undefined,
      toefl: form.scores.TOEFL ? Number(form.scores.TOEFL) : undefined,
      ielts: form.scores.IELTS ? Number(form.scores.IELTS) : undefined,
    },
  })

  if (!saveError.value) {
    dirty.value = false
    savedFlash.value = true
    if (flashTimer) clearTimeout(flashTimer)
    flashTimer = setTimeout(() => { savedFlash.value = false }, 2500)
  }
}

function signOut() {
  clear()
  navigateTo('/onboarding')
}

// ── Derived display ────────────────────────────────────────────────────

const initials = computed(() =>
  (form.fullName || 'U')
    .split(' ')
    .map(s => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase(),
)

const scoresCount = computed(() =>
  Object.values(form.scores).filter(v => v !== '').length,
)

const educationLabel = computed(() => {
  const map: Record<string, string> = { bachelor: 'Bachelor', master: 'Master', doctoral: 'Doctoral' }
  return form.educationLevel ? (map[form.educationLevel] ?? form.educationLevel) : '—'
})

// ── Options ────────────────────────────────────────────────────────────

const EDUCATION_OPTIONS = [
  { label: 'Bachelor', value: 'bachelor' },
  { label: 'Master',   value: 'master'   },
  { label: 'Doctoral', value: 'doctoral' },
]

const TARGET_TERMS = [
  'Fall 2026', 'Spring 2027', 'Fall 2027', 'Spring 2028', 'Fall 2028',
]

const SCORE_KEYS = ['GRE', 'GMAT', 'LSAT', 'TOEFL', 'IELTS'] as const
</script>

<template>
  <div>
    <UiSectionHeader
      title="Profile"
      subtitle="Update the details we use to recommend programs and tailor your readiness checklist."
    >
      <template #right>
        <div class="flex items-center gap-2.5">
          <UiBadge v-if="savedFlash" tone="success" :dot="true">Saved</UiBadge>
          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-lg border border-border-strong bg-surface px-3.5 py-2 text-[13px] font-semibold text-ink-mid transition-colors hover:bg-[#EEF1F6]"
            @click="signOut"
          >
            <UiIcon name="logout" :size="14" />
            Sign out
          </button>
          <button
            type="button"
            :disabled="!isValid || !dirty || pending"
            class="inline-flex items-center gap-1.5 rounded-lg bg-navy px-3.5 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
            @click="save"
          >
            <svg v-if="pending" class="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            Save changes
          </button>
        </div>
      </template>
    </UiSectionHeader>

    <div v-if="saveError" class="mb-4 rounded-lg border border-danger-soft bg-danger-soft px-4 py-3 text-[13px] text-danger">
      {{ saveError }}
    </div>

    <div class="grid items-start gap-6 lg:grid-cols-[260px_1fr]">

      <!-- ── Identity card ───────────────────────────────────────── -->
      <UiCard>
        <div class="flex flex-col items-center pt-1.5 text-center">
          <!-- Avatar -->
          <span
            class="inline-flex h-20 w-20 items-center justify-center rounded-full bg-navy text-[28px] font-semibold tracking-[0.02em] text-white"
          >
            {{ initials }}
          </span>

          <!-- Name + email -->
          <div class="mt-3 text-[15px] font-semibold text-ink">
            {{ form.fullName || 'Your name' }}
          </div>
          <div class="mt-0.5 text-[12.5px] text-ink-soft">
            {{ form.email || 'you@university.edu' }}
          </div>

          <!-- Mini stats -->
          <div
            class="mt-3.5 grid w-full grid-cols-2 gap-2 rounded-lg border border-border bg-[#FAFBFD] p-3 text-left"
          >
            <div>
              <div class="text-[10.5px] font-semibold uppercase tracking-[0.06em] text-ink-soft">GPA</div>
              <div class="mt-0.5 text-[13px] font-[540] text-ink">{{ form.gpa || '—' }}</div>
            </div>
            <div>
              <div class="text-[10.5px] font-semibold uppercase tracking-[0.06em] text-ink-soft">Level</div>
              <div class="mt-0.5 text-[13px] font-[540] text-ink">{{ educationLabel }}</div>
            </div>
            <div>
              <div class="text-[10.5px] font-semibold uppercase tracking-[0.06em] text-ink-soft">Target</div>
              <div class="mt-0.5 text-[13px] font-[540] text-ink">{{ form.targetTerm || '—' }}</div>
            </div>
            <div>
              <div class="text-[10.5px] font-semibold uppercase tracking-[0.06em] text-ink-soft">Tests</div>
              <div class="mt-0.5 text-[13px] font-[540] text-ink">{{ scoresCount || '—' }}</div>
            </div>
          </div>
        </div>
      </UiCard>

      <!-- ── Edit form card ──────────────────────────────────────── -->
      <UiCard :padded="false">

        <!-- Section: Account -->
        <div class="flex flex-col gap-5 p-6">
          <div>
            <div class="text-[14.5px] font-semibold text-ink">Account</div>
            <div class="mt-0.5 text-[12.5px] text-ink-soft">Identifying details.</div>
          </div>

          <div class="grid grid-cols-1 gap-[18px] sm:grid-cols-2">
            <UiField label="Full name" html-for="pf-fn" :required="true" :error="formErrors.fullName ?? undefined">
              <input
                id="pf-fn"
                :value="form.fullName"
                type="text"
                autocomplete="name"
                class="h-10 w-full rounded-lg border bg-white px-3 text-[13.5px] text-ink outline-none transition placeholder:text-ink-soft focus:ring-2"
                :class="formErrors.fullName
                  ? 'border-danger focus:border-danger focus:ring-danger/10'
                  : 'border-border-strong focus:border-navy-mid focus:ring-navy/10'"
                @input="setField('fullName', ($event.target as HTMLInputElement).value)"
                @blur="blurField('fullName', form.fullName)"
              />
            </UiField>

            <UiField label="Email address" html-for="pf-em" :required="true" :error="formErrors.email ?? undefined">
              <input
                id="pf-em"
                :value="form.email"
                type="email"
                autocomplete="email"
                class="h-10 w-full rounded-lg border bg-white px-3 text-[13.5px] text-ink outline-none transition placeholder:text-ink-soft focus:ring-2"
                :class="formErrors.email
                  ? 'border-danger focus:border-danger focus:ring-danger/10'
                  : 'border-border-strong focus:border-navy-mid focus:ring-navy/10'"
                @input="setField('email', ($event.target as HTMLInputElement).value)"
                @blur="blurField('email', form.email)"
              />
            </UiField>
          </div>
        </div>

        <!-- Section: Academic -->
        <div class="flex flex-col gap-5 border-t border-border p-6">
          <div>
            <div class="text-[14.5px] font-semibold text-ink">Academic</div>
            <div class="mt-0.5 text-[12.5px] text-ink-soft">Used to filter programs and check eligibility.</div>
          </div>

          <div class="grid items-start gap-[18px] sm:grid-cols-[180px_1fr]">
            <UiField
              label="GPA"
              html-for="pf-gpa"
              :required="true"
              :error="formErrors.gpa ?? undefined"
              :hint="formErrors.gpa ? undefined : '0.0 – 4.0 scale'"
            >
              <div class="relative">
                <input
                  id="pf-gpa"
                  :value="form.gpa"
                  type="number"
                  inputmode="decimal"
                  step="0.01"
                  min="0"
                  max="4"
                  placeholder="3.8"
                  class="h-10 w-full rounded-lg border bg-white py-0 pl-3 pr-12 text-[13.5px] text-ink outline-none transition focus:ring-2"
                  :class="formErrors.gpa
                    ? 'border-danger focus:border-danger focus:ring-danger/10'
                    : 'border-border-strong focus:border-navy-mid focus:ring-navy/10'"
                  @input="setField('gpa', ($event.target as HTMLInputElement).value)"
                  @blur="blurField('gpa', form.gpa)"
                />
                <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-ink-soft">
                  / 4.0
                </span>
              </div>
            </UiField>

            <UiField label="Education level" html-for="pf-edu" :required="true">
              <div class="flex overflow-hidden rounded-lg border border-border-strong">
                <button
                  v-for="opt in EDUCATION_OPTIONS"
                  :key="opt.value"
                  type="button"
                  class="flex-1 px-2 py-[9px] text-[12.5px] font-[540] transition-colors"
                  :class="form.educationLevel === opt.value
                    ? 'bg-navy text-white'
                    : 'bg-surface text-ink-mid hover:bg-[#EEF1F6]'"
                  @click="setField('educationLevel', opt.value)"
                >
                  {{ opt.label }}
                </button>
              </div>
            </UiField>
          </div>

          <UiField
            label="Target term"
            html-for="pf-tt"
            :required="true"
            :error="formErrors.targetTerm ?? undefined"
          >
            <UiSelect
              id="pf-tt"
              v-model="form.targetTerm"
              :options="TARGET_TERMS"
              placeholder="Choose a term…"
              @change="setField('targetTerm', form.targetTerm); blurField('targetTerm', form.targetTerm)"
            />
          </UiField>
        </div>

        <!-- Section: Test scores -->
        <div class="flex flex-col gap-4 rounded-b-[inherit] border-t border-border bg-[#FAFBFD] p-6">
          <div>
            <div class="text-[14.5px] font-semibold text-ink">Test scores</div>
            <div class="mt-0.5 text-[12.5px] text-ink-soft">
              Add scores as you take them. We'll mark missing ones on your checklist.
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <UiField
              v-for="k in SCORE_KEYS"
              :key="k"
              :label="k"
              :html-for="`pf-sc-${k}`"
              :optional="true"
            >
              <input
                :id="`pf-sc-${k}`"
                :value="form.scores[k]"
                type="number"
                inputmode="decimal"
                :placeholder="k === 'IELTS' ? '8.0' : '320'"
                class="h-10 w-full rounded-lg border border-border-strong bg-white px-3 text-[13.5px] text-ink outline-none transition placeholder:text-ink-soft focus:border-navy-mid focus:ring-2 focus:ring-navy/10"
                @input="setScore(k, ($event.target as HTMLInputElement).value)"
              />
            </UiField>
          </div>
        </div>

      </UiCard>
    </div>
  </div>
</template>
