import type { Config } from 'tailwindcss'
import { tokens } from './app/utils/tokens'

export default {
  content: ['./app/**/*.{vue,ts}'],
  theme: {
    extend: {
      colors: {
        navy:             tokens.navy,
        'navy-dark':      tokens.navyDark,
        'navy-mid':       tokens.navyMid,
        teal:             tokens.teal,
        'teal-soft':      tokens.tealSoft,
        bg:               tokens.bg,
        surface:          tokens.surface,
        border:           tokens.border,
        'border-strong':  tokens.borderStrong,
        ink:              tokens.ink,
        'ink-mid':        tokens.inkMid,
        'ink-soft':       tokens.inkSoft,
        warn:             tokens.warn,
        'warn-soft':      tokens.warnSoft,
        success:          tokens.success,
        'success-soft':   tokens.successSoft,
        danger:           tokens.danger,
        'danger-soft':    tokens.dangerSoft,
        primary: {
          DEFAULT: '#1e3a5f',
          100: '#d0daea',
          200: '#a1b5d5',
          300: '#7290bf',
          400: '#436baa',
          500: '#1e3a5f',
          600: '#182f4c',
          700: '#122439',
          800: '#0c1926',
          900: '#060e13',
        },
        accent: {
          DEFAULT: '#0d9488',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#0d9488',
          600: '#0a7b72',
          700: '#07615b',
          800: '#054843',
          900: '#02302c',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
} satisfies Config
