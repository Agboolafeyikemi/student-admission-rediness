import type { StudentProfile } from '../types/index.js';

export const profiles: StudentProfile[] = [
  {
    id: 'profile-alice-chen',
    name: 'Alice Chen',
    email: 'alice.chen@email.com',
    gpa: 3.87,
    educationLevel: 'bachelor',
    targetTerm: 'Fall 2027',
    testScores: { gre: 324 }, // V:162 Q:162
    selectedProgramIds: ['cs-stanford-ms-2026', 'ds-mit-ms-2026'],
    createdAt: '2025-08-04T10:00:00.000Z',
    updatedAt: '2025-08-04T10:00:00.000Z',
  },
  {
    id: 'profile-marcus-williams',
    name: 'Marcus Williams',
    email: 'marcus.williams@email.com',
    gpa: 3.54,
    educationLevel: 'bachelor',
    targetTerm: 'Fall 2027',
    testScores: { gmat: 710 },
    selectedProgramIds: ['mba-harvard-2026'],
    createdAt: '2025-07-15T09:30:00.000Z',
    updatedAt: '2025-09-20T14:15:00.000Z',
  },
  {
    id: 'profile-sofia-rodriguez',
    name: 'Sofia Rodriguez',
    email: 'sofia.rodriguez@email.com',
    gpa: 3.92,
    educationLevel: 'bachelor',
    targetTerm: 'Fall 2027',
    testScores: { lsat: 172 },
    selectedProgramIds: ['jd-yale-2026', 'mph-jhu-2026'],
    createdAt: '2025-09-01T14:00:00.000Z',
    updatedAt: '2025-09-01T14:00:00.000Z',
  },
];
