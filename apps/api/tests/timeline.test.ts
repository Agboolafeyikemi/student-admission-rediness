import { afterEach, describe, expect, it } from 'vitest';
import { checklists } from '../src/data/checklists.js';
import { checklistService } from '../src/services/checklist.js';
import { timelineService } from '../src/services/timeline.js';

const PROFILE_ID = 'profile-alice-chen';
const PROGRAM_ID = 'cs-stanford-ms-2026';
const QUERY = { profileId: PROFILE_ID, programId: PROGRAM_ID };
const NOW = '2026-01-01T00:00:00.000Z';

afterEach(() => {
  checklists.length = 0;
});

describe('timelineService.get', () => {
  it('returns 404 for unknown profile', () => {
    expect(() => timelineService.get({ profileId: 'missing', programId: PROGRAM_ID })).toThrow(
      'Profile not found',
    );
  });

  it('returns 404 for unknown program', () => {
    expect(() => timelineService.get({ profileId: PROFILE_ID, programId: 'missing' })).toThrow(
      'Program not found',
    );
  });

  it('returns empty array when no checklist has been generated', () => {
    const events = timelineService.get(QUERY);
    expect(events).toEqual([]);
  });

  it('returns one event per checklist item after generate', () => {
    const items = checklistService.generate(QUERY, NOW);
    const events = timelineService.get(QUERY);
    expect(events).toHaveLength(items.length);
  });

  it('events are sorted ascending by date', () => {
    checklistService.generate(QUERY, NOW);
    const events = timelineService.get(QUERY);
    const dates = events.map((e) => e.date);
    expect(dates).toEqual([...dates].sort());
  });

  it('all events start with status pending', () => {
    checklistService.generate(QUERY, NOW);
    const events = timelineService.get(QUERY);
    expect(events.every((e) => e.status === 'pending')).toBe(true);
  });

  it('each event includes relatedRequirementId matching its checklist item', () => {
    const items = checklistService.generate(QUERY, NOW);
    const events = timelineService.get(QUERY);
    const reqIds = new Set(items.map((i) => i.requirementId));
    expect(events.every((e) => reqIds.has(e.relatedRequirementId!))).toBe(true);
  });

  it('event status reflects checklist item status after marking complete', () => {
    checklistService.generate(QUERY, NOW);

    const target = checklists.find(
      (c) => c.profileId === PROFILE_ID && c.programId === PROGRAM_ID,
    )!;
    target.status = 'complete';

    const events = timelineService.get(QUERY);
    const matched = events.find((e) => e.relatedRequirementId === target.requirementId);
    expect(matched?.status).toBe('complete');

    const others = events.filter((e) => e.relatedRequirementId !== target.requirementId);
    expect(others.every((e) => e.status === 'pending')).toBe(true);
  });
});
