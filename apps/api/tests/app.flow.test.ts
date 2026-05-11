import { afterEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { checklists } from '../src/data/checklists.js';

const app = createApp();

const PROFILE_ID = 'profile-alice-chen';
const PROGRAM_ID = 'cs-stanford-ms-2026';
// req-cs-stanford-01 = "Official Transcripts", required: true — guarantees readinessScore > 0 after completion.
const REQUIRED_REQ_ID = 'req-cs-stanford-01';

afterEach(() => {
  checklists.length = 0;
});

describe('POST /checklists — creation flow', () => {
  it('returns 201 with all checklist items and persists them in memory', async () => {
    const res = await request(app)
      .post('/checklists')
      .send({ profileId: PROFILE_ID, programId: PROGRAM_ID });

    expect(res.status).toBe(201);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);

    for (const item of res.body) {
      expect(item).toMatchObject({
        profileId: PROFILE_ID,
        programId: PROGRAM_ID,
        requirementId: expect.any(String),
        status: 'not_started',
        dueDate: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    }

    expect(checklists).toHaveLength(res.body.length);
    expect(checklists.every((c) => c.profileId === PROFILE_ID && c.programId === PROGRAM_ID)).toBe(true);
  });
});

describe('PATCH /checklists/item — update + readiness + timeline sync', () => {
  it('completing an item syncs readiness score and timeline event status', async () => {
    // 1. Create the checklist.
    const createRes = await request(app)
      .post('/checklists')
      .send({ profileId: PROFILE_ID, programId: PROGRAM_ID });
    expect(createRes.status).toBe(201);

    const target = (createRes.body as Array<Record<string, string>>).find(
      (item) => item.requirementId === REQUIRED_REQ_ID,
    );
    expect(target).toBeDefined();

    // 2. Mark it complete.
    const patchRes = await request(app)
      .patch('/checklists/item')
      .send({ profileId: PROFILE_ID, requirementId: REQUIRED_REQ_ID, status: 'complete', notes: 'submitted' });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.status).toBe('complete');
    expect(patchRes.body.notes).toBe('submitted');
    expect(patchRes.body.completedAt).toBeDefined();
    // updatedAt and completedAt are both stamped with the same `now` inside
    // checklistService.update, so equality proves updatedAt was refreshed
    // without relying on wall-clock drift between the POST and PATCH calls.
    expect(patchRes.body.updatedAt).toBe(patchRes.body.completedAt);

    // 3. GET /readiness reflects the completed required item.
    const readinessRes = await request(app)
      .get('/readiness')
      .query({ profileId: PROFILE_ID, programId: PROGRAM_ID });

    expect(readinessRes.status).toBe(200);
    expect(readinessRes.body.readinessScore).toBeGreaterThan(0);
    const missingIds = (readinessRes.body.missingRequirements as Array<{ id: string }>).map((r) => r.id);
    expect(missingIds).not.toContain(REQUIRED_REQ_ID);

    // 4. GET /timeline reflects the completed item status.
    const timelineRes = await request(app)
      .get('/timeline')
      .query({ profileId: PROFILE_ID, programId: PROGRAM_ID });

    expect(timelineRes.status).toBe(200);
    const completedEvent = (timelineRes.body as Array<{ relatedRequirementId: string; status: string }>).find(
      (e) => e.relatedRequirementId === REQUIRED_REQ_ID,
    );
    expect(completedEvent).toBeDefined();
    expect(completedEvent!.status).toBe('complete');
  });
});
