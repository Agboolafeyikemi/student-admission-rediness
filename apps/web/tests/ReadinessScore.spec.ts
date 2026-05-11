import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ReadinessScore from '../app/components/dashboard/ReadinessScore.vue'

// Stub Nuxt auto-imported child components so the test runs outside the Nuxt runtime.
// UiProgressArc renders data-value / data-label so we can assert on them below.
const stubs = {
  UiCard: { template: '<div><slot /></div>' },
  UiProgressArc: {
    template: '<div :data-value="String(value)" :data-label="label">{{ value }}%</div>',
    props: ['value', 'label', 'sublabel'],
  },
  UiBadge: { template: '<span><slot /></span>' },
}

function mountScore(score: number, completed: number, total: number, inProgress: number, notStarted: number) {
  return mount(ReadinessScore, {
    props: { score, completed, total, inProgress, notStarted },
    global: { stubs },
  })
}

describe('ReadinessScore — stat counts', () => {
  it('renders Done / In progress / Not started labels and counts', () => {
    const wrapper = mountScore(60, 3, 5, 1, 1)
    const text = wrapper.text()
    expect(text).toContain('Done')
    expect(text).toContain('In progress')
    expect(text).toContain('Not started')
    expect(text).toContain('3')   // completed count
    expect(text).toContain('1')   // inProgress count
  })

  it('passes the score value to the progress arc', () => {
    const wrapper = mountScore(75, 3, 4, 0, 1)
    expect(wrapper.find('[data-value]').attributes('data-value')).toBe('75')
  })

  it('shows the Live badge and footer copy', () => {
    const wrapper = mountScore(0, 0, 5, 0, 5)
    const text = wrapper.text()
    expect(text).toContain('Live')
    expect(text).toContain('Score updates as you complete items')
  })
})

describe('ReadinessScore — arcLabel thresholds', () => {
  it.each([
    [100, 'Ready'],
    [80,  'Almost there'],
    [50,  'In progress'],
    [10,  'Not started'],
  ])('score %i → label "%s"', (score, expectedLabel) => {
    const wrapper = mountScore(score, 0, 5, 0, 5)
    expect(wrapper.find('[data-label]').attributes('data-label')).toBe(expectedLabel)
  })
})
