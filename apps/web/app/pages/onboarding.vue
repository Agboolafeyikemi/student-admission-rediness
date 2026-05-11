<script setup lang="ts">
import type { CreateProfileInput, EducationLevel } from '@@/types'

definePageMeta({ layout: 'onboarding' })

const TARGET_TERMS = ['Fall 2025', 'Spring 2026', 'Fall 2026', 'Spring 2027', 'Fall 2027', 'Spring 2028']
  .map(v => ({ label: v, value: v }))

const EDUCATION_LEVELS = [
  { label: 'Bachelor', value: 'bachelor' },
  { label: 'Master',   value: 'master'   },
  { label: 'Doctoral', value: 'doctoral' },
]

// ── Form state ────────────────────────────────────────────────────────

const form = reactive({
  fullName:       '',
  email:          '',
  gpa:            '',
  educationLevel: '' as EducationLevel | '',
  targetTerm:     '',
  gre:   '',
  gmat:  '',
  lsat:  '',
  toefl: '',
  ielts: '',
})

const touched = reactive({
  fullName:       false,
  email:          false,
  gpa:            false,
  educationLevel: false,
  targetTerm:     false,
  gre:            false,
  gmat:           false,
  lsat:           false,
  toefl:          false,
  ielts:          false,
})

// ── Validation ────────────────────────────────────────────────────────

const EMAIL_RE = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/

const TEST_SCORE_RANGES: Record<string, { min: number; max: number; label: string }> = {
  gre:   { min: 260, max: 340, label: 'GRE (260–340)' },
  gmat:  { min: 200, max: 800, label: 'GMAT (200–800)' },
  lsat:  { min: 120, max: 180, label: 'LSAT (120–180)' },
  toefl: { min: 0,   max: 120, label: 'TOEFL (0–120)' },
  ielts: { min: 0,   max: 9,   label: 'IELTS (0–9)' },
}

function validateField(name: string, value: string): string | null {
  switch (name) {
    case 'fullName':       return value.trim().length < 2 ? 'Enter your full name.' : null
    case 'email':          return !EMAIL_RE.test(value.trim()) ? 'Enter a valid email address.' : null
    case 'gpa': {
      if (value === '') return 'GPA is required.'
      const n = Number(value)
      if (Number.isNaN(n)) return 'Must be a number.'
      if (n < 0 || n > 4) return 'GPA must be 0.0 – 4.0.'
      return null
    }
    case 'educationLevel': return !value ? 'Select your education level.' : null
    case 'targetTerm':     return !value ? 'Choose a target term.' : null
    default: {
      const range = TEST_SCORE_RANGES[name]
      if (range && value !== '') {
        const n = Number(value)
        if (Number.isNaN(n)) return 'Must be a number.'
        if (n < range.min || n > range.max) return `${range.label} expected.`
      }
      return null
    }
  }
}

const fieldErrors = computed(() => ({
  fullName:       touched.fullName       ? (validateField('fullName',       form.fullName)       ?? '') : '',
  email:          touched.email          ? (validateField('email',          form.email)          ?? '') : '',
  gpa:            touched.gpa            ? (validateField('gpa',            form.gpa)            ?? '') : '',
  educationLevel: touched.educationLevel ? (validateField('educationLevel', form.educationLevel) ?? '') : '',
  targetTerm:     touched.targetTerm     ? (validateField('targetTerm',     form.targetTerm)     ?? '') : '',
  gre:            touched.gre            ? (validateField('gre',            form.gre)            ?? '') : '',
  gmat:           touched.gmat           ? (validateField('gmat',           form.gmat)           ?? '') : '',
  lsat:           touched.lsat           ? (validateField('lsat',           form.lsat)           ?? '') : '',
  toefl:          touched.toefl          ? (validateField('toefl',          form.toefl)          ?? '') : '',
  ielts:          touched.ielts          ? (validateField('ielts',          form.ielts)          ?? '') : '',
}))

const formValid = computed(() => {
  const coreFields = ['fullName', 'email', 'gpa', 'educationLevel', 'targetTerm'] as const
  const scoreFields = ['gre', 'gmat', 'lsat', 'toefl', 'ielts'] as const
  return (
    coreFields.every(n => validateField(n, form[n] as string) === null) &&
    scoreFields.every(n => validateField(n, form[n]) === null)
  )
})

function touchAll() {
  Object.keys(touched).forEach(k => { (touched as Record<string, boolean>)[k] = true })
}

// ── Submission ────────────────────────────────────────────────────────

const { createProfile, pending: profilePending, error: profileError } = useProfile()
const { setProfileId } = useSession()

const submitError = ref<string | null>(null)
const toastMsg = ref('')

watch([submitError, profileError], ([se, pe]) => {
  if (se || pe) toastMsg.value = se ?? pe ?? ''
})

async function handleSubmit() {
  touchAll()
  if (!formValid.value) return

  submitError.value = null
  try {
    const scores: Partial<Record<'gre' | 'gmat' | 'lsat' | 'toefl' | 'ielts', number>> = {}
    if (form.gre)   scores.gre   = +form.gre
    if (form.gmat)  scores.gmat  = +form.gmat
    if (form.lsat)  scores.lsat  = +form.lsat
    if (form.toefl) scores.toefl = +form.toefl
    if (form.ielts) scores.ielts = +form.ielts

    const payload: CreateProfileInput = {
      fullName:          form.fullName.trim(),
      email:             form.email.trim(),
      gpa:               +form.gpa,
      educationLevel:    form.educationLevel as EducationLevel,
      targetTerm:        form.targetTerm,
      testScores:        Object.keys(scores).length ? scores : undefined,
      selectedProgramIds: [],
    }

    const profile = await createProfile(payload)
    setProfileId(profile.id)

    // After profile creation, send the student to browse and pick a program
    await navigateTo('/programs')
  } catch (err: unknown) {
    submitError.value = (err as Error).message
  }
}
</script>

<template>
  <div class="mx-auto max-w-[760px] px-7 pb-20 pt-11">

    <UiToast :message="toastMsg" type="error" @dismiss="toastMsg = ''" />

    <!-- Header -->
    <div class="mb-[22px]">
      <h1 class="m-0 text-[28px] font-semibold tracking-[-0.018em] text-ink">Create your profile</h1>
      <p class="mt-2 max-w-[620px] text-[14.5px] leading-[1.55] text-ink-soft">
        Tell us about yourself so we can tailor your readiness checklist. You can update everything later from your profile page.
      </p>
    </div>

    <UiCard :padded="false">
      <!-- Core fields -->
      <div class="flex flex-col gap-[22px] p-7">

        <!-- Full name + Email -->
        <div class="grid grid-cols-2 gap-5">
          <UiInput
            v-model="form.fullName"
            label="Full name"
            placeholder="Maya Okonkwo"
            :required="true"
            :error="fieldErrors.fullName"
            @blur="touched.fullName = true"
          />
          <UiInput
            v-model="form.email"
            label="Email address"
            type="email"
            placeholder="you@university.edu"
            :required="true"
            :error="fieldErrors.email"
            @blur="touched.email = true"
          />
        </div>

        <!-- GPA + Education level -->
        <div class="grid gap-5" style="grid-template-columns: 180px 1fr; align-items: start">
          <UiInput
            v-model="form.gpa"
            label="GPA"
            type="number"
            step="0.01"
            min="0"
            max="4"
            placeholder="3.74"
            suffix="/ 4.0"
            hint="0.0 – 4.0 scale"
            :required="true"
            :error="fieldErrors.gpa"
            @blur="touched.gpa = true"
          />
          <UiSegmented
            v-model="form.educationLevel"
            label="Education level"
            :required="true"
            :options="EDUCATION_LEVELS"
            :error="fieldErrors.educationLevel"
            @update:model-value="touched.educationLevel = true"
          />
        </div>

        <!-- Target term -->
        <UiField
          label="Target term"
          html-for="targetTerm"
          :required="true"
          hint="When do you plan to start?"
          :error="fieldErrors.targetTerm"
        >
          <UiSelect
            id="targetTerm"
            v-model="form.targetTerm"
            placeholder="Select a term"
            :options="TARGET_TERMS"
            @update:model-value="touched.targetTerm = true"
          />
        </UiField>
      </div>

      <!-- Test scores -->
      <div class="border-t border-border bg-[#FAFBFD] p-7">
        <div class="text-[14.5px] font-[600] text-ink">Test scores</div>
        <div class="mt-0.5 text-[13px] text-ink-soft">
          Optional — add any scores you already have. Missing ones will appear as open items on your checklist.
        </div>
        <div class="mt-4 grid grid-cols-5 gap-3">
          <UiInput
            v-model="form.gre"
            label="GRE"
            placeholder="320"
            label-badge="Optional"
            type="number"
            :error="fieldErrors.gre"
            @blur="touched.gre = true"
          />
          <UiInput
            v-model="form.gmat"
            label="GMAT"
            placeholder="700"
            label-badge="Optional"
            type="number"
            :error="fieldErrors.gmat"
            @blur="touched.gmat = true"
          />
          <UiInput
            v-model="form.lsat"
            label="LSAT"
            placeholder="172"
            label-badge="Optional"
            type="number"
            :error="fieldErrors.lsat"
            @blur="touched.lsat = true"
          />
          <UiInput
            v-model="form.toefl"
            label="TOEFL"
            placeholder="120"
            label-badge="Optional"
            type="number"
            :error="fieldErrors.toefl"
            @blur="touched.toefl = true"
          />
          <UiInput
            v-model="form.ielts"
            label="IELTS"
            placeholder="8.0"
            label-badge="Optional"
            type="number"
            step="0.1"
            :error="fieldErrors.ielts"
            @blur="touched.ielts = true"
          />
        </div>
      </div>
    </UiCard>

    <!-- Footer -->
    <div class="mt-6 flex items-center justify-between">
      <p class="text-[13px] text-ink-soft">
        Already have a profile?
        <NuxtLink to="/programs" class="font-[540] text-navy hover:underline">Browse programs</NuxtLink>
      </p>
      <UiButton :loading="profilePending" @click="handleSubmit">
        Create profile
        <UiIcon name="chevronRight" :size="15" />
      </UiButton>
    </div>

  </div>
</template>
