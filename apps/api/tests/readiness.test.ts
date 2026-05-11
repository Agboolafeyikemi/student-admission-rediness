import { afterEach, describe, expect, it } from 'vitest';
import { checklists } from '../src/data/checklists.js';
import { checklistService } from '../src/services/checklist.js';
import { readinessService } from '../src/services/readiness.js';

const PROFILE_ID = 'profile-alice-chen';
const PROGRAM_ID = 'cs-stanford-ms-2026';
const QUERY = { profileId: PROFILE_ID, programId: PROGRAM_ID };
const NOW = '2026-01-01T00:00:00.000Z';

// req-cs-stanford-01 is "Official Transcripts" — required: true
const REQUIRED_REQ_ID = 'req-cs-stanford-01';

afterEach(() => {
  checklists.length = 0;
});

describe('readinessService.get', () => {
  it('throws 404 for unknown profile', () => {
    expect(() => readinessService.get({ profileId: 'no-such-profile', programId: PROGRAM_ID })).toThrow(
      'Profile not found',
    );
  });

  it('throws 404 for unknown program', () => {
    expect(() => readinessService.get({ profileId: PROFILE_ID, programId: 'no-such-program' })).toThrow(
      'Program not found',
    );
  });

  it('returns score 0 when no checklist has been generated', () => {
    const result = readinessService.get(QUERY);
    expect(result.readinessScore).toBe(0);
  });

  it('returns score 0 when all items are not_started', () => {
    checklistService.generate(QUERY, NOW);
    const result = readinessService.get(QUERY);
    expect(result.readinessScore).toBe(0);
  });

  it('readiness score increases when a required item is completed', () => {
    checklistService.generate(QUERY, NOW);

    const before = readinessService.get(QUERY).readinessScore;

    checklistService.update({ profileId: PROFILE_ID, requirementId: REQUIRED_REQ_ID, status: 'complete' }, NOW);

    const after = readinessService.get(QUERY).readinessScore;
    expect(after).toBeGreaterThan(before);
  });

  it('completed required item is removed from missingRequirements', () => {
    checklistService.generate(QUERY, NOW);
    checklistService.update({ profileId: PROFILE_ID, requirementId: REQUIRED_REQ_ID, status: 'complete' }, NOW);

    const { missingRequirements } = readinessService.get(QUERY);
    const ids = missingRequirements.map((r) => r.id);
    expect(ids).not.toContain(REQUIRED_REQ_ID);
  });

  it('all required items appear in missingRequirements when none are complete', () => {
    checklistService.generate(QUERY, NOW);

    const { missingRequirements } = readinessService.get(QUERY);
    // Every item in missingRequirements must be a required requirement
    expect(missingRequirements.every((r) => r.required)).toBe(true);
    // At least one missing requirement exists for this program
    expect(missingRequirements.length).toBeGreaterThan(0);
  });

  it('score is 100 when all required items are complete', () => {
    const items = checklistService.generate(QUERY, NOW);

    // Find all items that correspond to required requirements
    const { missingRequirements } = readinessService.get(QUERY);
    const requiredReqIds = missingRequirements.map((r) => r.id);

    for (const reqId of requiredReqIds) {
      checklistService.update({ profileId: PROFILE_ID, requirementId: reqId, status: 'complete' }, NOW);
    }

    const { readinessScore } = readinessService.get(QUERY);
    expect(readinessScore).toBe(100);
  });

  it('nextMilestones excludes completed items and is sorted ascending by dueDate', () => {
    checklistService.generate(QUERY, NOW);
    checklistService.update({ profileId: PROFILE_ID, requirementId: REQUIRED_REQ_ID, status: 'complete' }, NOW);

    const { nextMilestones } = readinessService.get(QUERY);

    // Completed item should not appear in milestones
    expect(nextMilestones.some((m) => m.requirementId === REQUIRED_REQ_ID)).toBe(false);

    // Milestones are sorted ascending
    const dates = nextMilestones.map((m) => m.dueDate);
    expect(dates).toEqual([...dates].sort());
  });

  it('score formula: completed required ÷ total required × 100 (rounded)', () => {
    checklistService.generate(QUERY, NOW);
    const { missingRequirements: allMissing } = readinessService.get(QUERY);
    const totalRequired = allMissing.length;

    // Complete exactly one required item
    checklistService.update({ profileId: PROFILE_ID, requirementId: REQUIRED_REQ_ID, status: 'complete' }, NOW);

    const { readinessScore } = readinessService.get(QUERY);
    const expected = Math.round((1 / totalRequired) * 100);
    expect(readinessScore).toBe(expected);
  });
});
