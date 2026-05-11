import { checklists } from '../data/checklists.js';
import { profiles } from '../data/profiles.js';
import { programs } from '../data/programs.js';
import { requirements } from '../data/requirements.js';
import type { ChecklistItem, Requirement } from '../types/index.js';
import { findOrThrow } from '../utils/findOrThrow.js';
import type { ProfileProgramQuery } from '../validators/query.js';

export interface ReadinessResult {
  readinessScore: number;
  missingRequirements: Requirement[];
  nextMilestones: ChecklistItem[];
}

export const readinessService = {
  get(query: ProfileProgramQuery): ReadinessResult {
    const { profileId, programId } = query;

    findOrThrow(profiles, (p) => p.id === profileId, 'Profile');
    findOrThrow(programs, (p) => p.id === programId, 'Program');

    const requiredReqs = requirements.filter((r) => r.programId === programId && r.required);

    // Single filter pass — reused for both the Map and nextMilestones.
    const profileItems = checklists.filter(
      (c) => c.profileId === profileId && c.programId === programId,
    );
    const itemByReqId = new Map(profileItems.map((c) => [c.requirementId, c]));

    // Readiness score: completed required ÷ total required × 100.
    const totalRequired = requiredReqs.length;
    const completedRequired = requiredReqs.filter(
      (r) => itemByReqId.get(r.id)?.status === 'complete',
    ).length;
    const readinessScore =
      totalRequired === 0 ? 0 : Math.round((completedRequired / totalRequired) * 100);

    // Missing: required requirements with no item OR item status !== 'complete'.
    const missingRequirements = requiredReqs.filter(
      (r) => itemByReqId.get(r.id)?.status !== 'complete',
    );

    // Next milestones: non-complete items ascending by dueDate.
    const nextMilestones = profileItems
      .filter((c) => c.status !== 'complete')
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

    return { readinessScore, missingRequirements, nextMilestones };
  },
};
