import { v5 as uuidv5 } from 'uuid';
import { checklists } from '../data/checklists.js';
import { profiles } from '../data/profiles.js';
import { programs } from '../data/programs.js';
import { requirements } from '../data/requirements.js';
import type { Requirement, TimelineEvent } from '../types/index.js';
import { findOrThrow } from '../utils/findOrThrow.js';
import type { ProfileProgramQuery } from '../validators/query.js';

// Fixed namespace for timeline event IDs derived from checklist item IDs.
const TIMELINE_NS = 'a987fbc9-4bed-3078-8f07-9141ba07c9f3';

function toEventType(reqType: Requirement['type']): TimelineEvent['type'] {
  if (reqType === 'financial') return 'deadline';
  if (reqType === 'test_score') return 'milestone';
  return 'submission';
}

export const timelineService = {
  get(query: ProfileProgramQuery): TimelineEvent[] {
    const { profileId, programId } = query;

    findOrThrow(profiles, (p) => p.id === profileId, 'Profile');
    findOrThrow(programs, (p) => p.id === programId, 'Program');

    // O(1) requirement lookups when mapping checklist items.
    const reqById = new Map(
      requirements.filter((r) => r.programId === programId).map((r) => [r.id, r]),
    );

    return checklists
      .filter((c) => c.profileId === profileId && c.programId === programId)
      .map((item): TimelineEvent => {
        const req = reqById.get(item.requirementId);
        return {
          id: uuidv5(item.id, TIMELINE_NS),
          profileId,
          programId,
          relatedRequirementId: item.requirementId,
          title: req?.title ?? item.requirementId,
          description: req?.description ?? '',
          date: item.dueDate,
          type: toEventType(req?.type ?? 'document'),
          status: item.status === 'complete' ? 'complete' : 'pending',
        };
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  },
};
