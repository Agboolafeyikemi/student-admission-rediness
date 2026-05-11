<script setup lang="ts">
export type IconName =
  | 'check' | 'x' | 'chevronRight' | 'chevronLeft' | 'chevronDown'
  | 'search' | 'filter' | 'clock' | 'calendar' | 'doc' | 'user' | 'users'
  | 'dollar' | 'edit' | 'grid' | 'alert' | 'spark'
  | 'flag' | 'play' | 'send' | 'logout' | 'plus' | 'minus' | 'info'
  | 'graduation' | 'book' | 'school'

const props = withDefaults(defineProps<{
  name: string
  size?: number
  strokeWidth?: number
}>(), {
  size: 16,
  strokeWidth: 1.6,
})

const pathMap: Record<string, string> = {
  check:        '<path d="M5 12.5l4.5 4.5L19 7"/>',
  x:            '<path d="M6 6l12 12M18 6L6 18"/>',
  chevronRight: '<path d="M9 6l6 6-6 6"/>',
  chevronLeft:  '<path d="M15 6l-6 6 6 6"/>',
  chevronDown:  '<path d="M6 9l6 6 6-6"/>',
  search:       '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.3-4.3"/>',
  filter:       '<path d="M4 5h16M7 12h10M10 19h4"/>',
  clock:        '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  calendar:     '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3.5v3M16 3.5v3"/>',
  doc:          '<path d="M7 3.5h7l4 4V20a1 1 0 01-1 1H7a1 1 0 01-1-1V4.5a1 1 0 011-1z"/><path d="M14 3.5V8h4"/>',
  user:         '<circle cx="12" cy="8.5" r="4"/><path d="M4.5 20c1.5-4 4.5-6 7.5-6s6 2 7.5 6"/>',
  users:        '<circle cx="9" cy="9" r="3.5"/><path d="M3 19c1-3.5 3.5-5.5 6-5.5s5 2 6 5.5"/><path d="M16 4.5a3.5 3.5 0 010 7M21 19c-.5-2.5-2-4.4-4-5"/>',
  dollar:       '<path d="M12 4v16M16 8c0-1.5-1.7-2.5-4-2.5S8 6.5 8 8s1.5 2 4 2.5 4 1 4 2.5-1.7 2.5-4 2.5-4-1-4-2.5"/>',
  edit:         '<path d="M4 20h4l11-11-4-4L4 16v4z"/><path d="M14 6l4 4"/>',
  grid:         '<rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/>',
  alert:        '<path d="M12 3l9.5 17H2.5L12 3z"/><path d="M12 10v4M12 17v.5"/>',
  spark:        '<path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2 2M16.4 16.4l2 2M5.6 18.4l2-2M16.4 7.6l2-2"/>',
  flag:         '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
  play:         '<path d="M7 5l11 7-11 7V5z"/>',
  send:         '<path d="M3 11l18-7-7 18-3-7-8-4z"/>',
  logout:       '<path d="M14 4h4a1 1 0 011 1v14a1 1 0 01-1 1h-4M9 16l-4-4 4-4M5 12h11"/>',
  plus:         '<path d="M12 5v14M5 12h14"/>',
  minus:        '<path d="M5 12h14"/>',
  info:         '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8v.5"/>',
  graduation:   '<path d="M2 9l10-4 10 4-10 4-10-4z"/><path d="M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5"/>',
  book:         '<path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2V5z"/><path d="M4 19a2 2 0 012-2h13"/>',
  school:       '<path d="M3 10l9-5 9 5-9 5-9-5z"/><path d="M7 12v4l5 2.5L17 16v-4"/>',
}
</script>

<template>
  <svg
    v-if="pathMap[props.name]"
    :width="props.size"
    :height="props.size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="props.strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    v-html="pathMap[props.name]"
  />
</template>
