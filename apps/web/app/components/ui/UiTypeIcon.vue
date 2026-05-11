<script setup lang="ts">
const props = withDefaults(defineProps<{
  type: string
  size?: number
}>(), {
  size: 16,
})

type Tone = 'navy' | 'teal' | 'warn' | 'danger' | 'success' | 'neutral'

const typeMap: Record<string, { icon: string; tone: Tone }> = {
  Documents:        { icon: 'doc',        tone: 'navy'    },
  document:         { icon: 'doc',        tone: 'navy'    },
  'Test Scores':    { icon: 'spark',      tone: 'teal'    },
  test_score:       { icon: 'spark',      tone: 'teal'    },
  Recommendations:  { icon: 'users',      tone: 'navy'    },
  recommendation:   { icon: 'users',      tone: 'navy'    },
  Financial:        { icon: 'dollar',     tone: 'warn'    },
  financial:        { icon: 'dollar',     tone: 'warn'    },
  Writing:          { icon: 'edit',       tone: 'teal'    },
  writing:          { icon: 'edit',       tone: 'teal'    },
  deadline:         { icon: 'flag',       tone: 'danger'  },
  milestone:        { icon: 'spark',      tone: 'teal'    },
  submission:       { icon: 'send',       tone: 'navy'    },
  'program start':  { icon: 'graduation', tone: 'success' },
  program_start:    { icon: 'graduation', tone: 'success' },
}

const toneBgFg: Record<Tone, string> = {
  navy:    'bg-[#E4E9F2] text-navy',
  teal:    'bg-teal-soft text-[#0B6A6A]',
  warn:    'bg-warn-soft text-warn',
  danger:  'bg-danger-soft text-danger',
  success: 'bg-success-soft text-success',
  neutral: 'bg-[#EEF1F6] text-ink-mid',
}

const config = computed(() => typeMap[props.type] ?? { icon: 'doc', tone: 'neutral' as Tone })
const boxSize = computed(() => props.size + 12)
</script>

<template>
  <span
    class="inline-flex shrink-0 items-center justify-center rounded-[7px]"
    :class="toneBgFg[config.tone]"
    :style="{ width: `${boxSize}px`, height: `${boxSize}px` }"
  >
    <UiIcon :name="config.icon" :size="props.size" />
  </span>
</template>
