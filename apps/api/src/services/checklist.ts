import { v5 as uuidv5 } from 'uuid';
import { subDays } from 'date-fns';
import { checklists } from '../data/checklists.js';
import { profiles } from '../data/profiles.js';
import { programs } from '../data/programs.js';
import { requirements } from '../data/requirements.js';
import type { ChecklistItem } from '../types/index.js';
import { AppError } from '../utils/AppError.js';
import { findOrThrow } from '../utils/findOrThrow.js';
import type { CreateChecklistInput, UpdateChecklistItemInput } from '../validators/checklist.js';

// Fixed namespace for checklist item IDs.
// UUIDv5: SHA-1(namespace + profileId:programId:requirementId) → deterministic per item.
const CHECKLIST_ITEM_NS = 'd9428888-122b-11e1-b85c-61cd3cbb3210';

export const checklistService = {
  // `now` defaults to real wall-clock time in production; pass a fixed ISO string
  // in tests for fully deterministic output.
  generate(input: CreateChecklistInput, now = new Date().toISOString()): ChecklistItem[] {
    const { profileId, programId } = input;

    findOrThrow(profiles, (p) => p.id === profileId, 'Profile');
    const program = findOrThrow(programs, (p) => p.id === programId, 'Program');

    // Key existing items by requirementId so merge is O(1) per requirement.
    const existingByReqId = new Map(
      checklists
        .filter((c) => c.profileId === profileId && c.programId === programId)
        .map((c) => [c.requirementId, c]),
    );

    // Parse once — avoids re-constructing a Date object inside every map iteration.
    const deadline = new Date(program.applicationDeadline);

    const items: ChecklistItem[] = requirements
      .filter((r) => r.programId === programId)
      .map((r) => {
        const dueDate = subDays(deadline, r.dueOffsetDays).toISOString();
        const existing = existingByReqId.get(r.id);

        if (existing) {
          // Preserve user progress. Only bump updatedAt when dueDate actually changed.
          return dueDate !== existing.dueDate ? { ...existing, dueDate, updatedAt: now } : existing;
        }

        return {
          id: uuidv5(`${profileId}:${programId}:${r.id}`, CHECKLIST_ITEM_NS),
          profileId,
          programId,
          requirementId: r.id,
          status: 'not_started' as const,
          dueDate,
          createdAt: now,
          updatedAt: now,
        };
      });

    // Removed requirements are dropped naturally — we only iterate current requirements.
    // Replace the stored slice for this profile+program with the merged result.
    const rest = checklists.filter((c) => !(c.profileId === profileId && c.programId === programId));
    checklists.length = 0;
    checklists.push(...rest, ...items);

    return items;
  },

  update(input: UpdateChecklistItemInput, now = new Date().toISOString()): ChecklistItem {
    const { profileId, requirementId, status, notes } = input;

    const item = checklists.find(
      (c) => c.profileId === profileId && c.requirementId === requirementId,
    );
    if (!item) throw AppError.notFound('Checklist item');

    const statusChanged = item.status !== status;
    const notesChanged = notes !== undefined && notes !== item.notes;

    if (!statusChanged && !notesChanged) return item;

    if (statusChanged) {
      item.status = status;
      if (status === 'complete') {
        item.completedAt = now;
      } else {
        delete item.completedAt;
      }
    }
    if (notesChanged) item.notes = notes;

    item.updatedAt = now;
    return item;
  },
};
