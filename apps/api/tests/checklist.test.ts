import { afterEach, describe, expect, it } from 'vitest';
import { subDays } from 'date-fns';
import { checklists } from '../src/data/checklists.js';
import { programs } from '../src/data/programs.js';
import { requirements } from '../src/data/requirements.js';
import { checklistService } from '../src/services/checklist.js';

const PROFILE_ID = 'profile-alice-chen';
const PROGRAM_ID = 'cs-stanford-ms-2026';
const QUERY = { profileId: PROFILE_ID, programId: PROGRAM_ID };
const NOW = '2026-01-01T00:00:00.000Z';

// req-cs-stanford-01 = "Official Transcripts", dueOffsetDays: 14, required: true
const REQUIRED_REQ_ID = 'req-cs-stanford-01';

afterEach(() => {
  checklists.length = 0;
});

describe('checklistService.generate', () => {
  it('throws 404 for unknown profile', () => {
    expect(() =>
      checklistService.generate({ profileId: 'no-such-profile', programId: PROGRAM_ID }, NOW),
    ).toThrow('Profile not found');
  });

  it('throws 404 for unknown program', () => {
    expect(() =>
      checklistService.generate({ profileId: PROFILE_ID, programId: 'no-such-program' }, NOW),
    ).toThrow('Program not found');
  });

  it('generates one checklist item per program requirement', () => {
    const items = checklistService.generate(QUERY, NOW);
    const programReqs = requirements.filter((r) => r.programId === PROGRAM_ID);
    expect(items).toHaveLength(programReqs.length);
  });

  it('all items start with status not_started', () => {
    const items = checklistService.generate(QUERY, NOW);
    expect(items.every((i) => i.status === 'not_started')).toBe(true);
  });

  it('due dates = applicationDeadline − dueOffsetDays', () => {
    const items = checklistService.generate(QUERY, NOW);
    const program = programs.find((p) => p.id === PROGRAM_ID)!;
    const deadline = new Date(program.applicationDeadline);

    for (const item of items) {
      const req = requirements.find((r) => r.id === item.requirementId)!;
      const expected = subDays(deadline, req.dueOffsetDays).toISOString();
      expect(item.dueDate).toBe(expected);
    }
  });

  it('items have deterministic IDs — same input yields same IDs', () => {
    const first = checklistService.generate(QUERY, NOW);
    checklists.length = 0;
    const second = checklistService.generate(QUERY, NOW);
    expect(first.map((i) => i.id)).toEqual(second.map((i) => i.id));
  });

  it('persists items in the in-memory store', () => {
    const items = checklistService.generate(QUERY, NOW);
    expect(checklists).toHaveLength(items.length);
  });

  it('re-generating preserves existing status (merge, not overwrite)', () => {
    checklistService.generate(QUERY, NOW);

    // Manually mark one item complete in the store
    const target = checklists.find((c) => c.requirementId === REQUIRED_REQ_ID)!;
    target.status = 'complete';

    // Re-generate
    const items = checklistService.generate(QUERY, NOW);
    const merged = items.find((i) => i.requirementId === REQUIRED_REQ_ID)!;
    expect(merged.status).toBe('complete');
  });

  it('items carry correct profileId and programId', () => {
    const items = checklistService.generate(QUERY, NOW);
    expect(items.every((i) => i.profileId === PROFILE_ID && i.programId === PROGRAM_ID)).toBe(true);
  });
});

describe('checklistService.update', () => {
  it('throws 404 when no checklist item exists for the requirement', () => {
    expect(() =>
      checklistService.update({ profileId: PROFILE_ID, requirementId: REQUIRED_REQ_ID, status: 'complete' }, NOW),
    ).toThrow('Checklist item not found');
  });

  it('updates item status to complete and sets completedAt', () => {
    checklistService.generate(QUERY, NOW);
    const item = checklistService.update(
      { profileId: PROFILE_ID, requirementId: REQUIRED_REQ_ID, status: 'complete' },
      NOW,
    );
    expect(item.status).toBe('complete');
    expect(item.completedAt).toBe(NOW);
    expect(item.updatedAt).toBe(NOW);
  });

  it('clears completedAt when status reverts from complete to in_progress', () => {
    checklistService.generate(QUERY, NOW);
    checklistService.update({ profileId: PROFILE_ID, requirementId: REQUIRED_REQ_ID, status: 'complete' }, NOW);
    const item = checklistService.update(
      { profileId: PROFILE_ID, requirementId: REQUIRED_REQ_ID, status: 'in_progress' },
      NOW,
    );
    expect(item.status).toBe('in_progress');
    expect(item.completedAt).toBeUndefined();
  });

  it('updates notes without changing status', () => {
    checklistService.generate(QUERY, NOW);
    const item = checklistService.update(
      { profileId: PROFILE_ID, requirementId: REQUIRED_REQ_ID, status: 'not_started', notes: 'will upload soon' },
      NOW,
    );
    expect(item.notes).toBe('will upload soon');
    expect(item.status).toBe('not_started');
  });

  it('is a no-op (returns same object) when status and notes unchanged', () => {
    checklistService.generate(QUERY, NOW);
    const first = checklistService.update(
      { profileId: PROFILE_ID, requirementId: REQUIRED_REQ_ID, status: 'not_started' },
      NOW,
    );
    const second = checklistService.update(
      { profileId: PROFILE_ID, requirementId: REQUIRED_REQ_ID, status: 'not_started' },
      NOW,
    );
    expect(second).toBe(first); // same object reference — no mutation occurred
  });
});
