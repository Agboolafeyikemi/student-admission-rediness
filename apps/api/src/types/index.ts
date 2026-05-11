export type EducationLevel = 'bachelor' | 'master' | 'doctoral';

export interface TestScores {
  gre?: number;   // composite V+Q, 260–340
  gmat?: number;  // total score, 200–800
  lsat?: number;  // 120–180
  toefl?: number; // iBT, 0–120
  ielts?: number; // band score, 0–9.0
}

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  gpa: number; // 0.0–4.0
  educationLevel: EducationLevel;
  targetTerm: string; // e.g. "Fall 2027"
  testScores: TestScores;
  selectedProgramIds: string[];
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export type EvidenceType = 'pdf_upload' | 'score_report' | 'reference_form' | 'payment' | 'other';

export interface Program {
  id: string;
  name: string;
  university: string;
  degreeType: string; // "MS", "MBA", "JD", "MPH", etc.
  department: string;
  description: string;
  applicationDeadline: string; // ISO 8601 date
  startDate: string; // ISO 8601 date
  tuitionPerYear: number; // USD
  duration: string; // e.g. "2 years"
}

export interface Requirement {
  id: string;
  programId: string;
  title: string;
  description: string;
  type: 'document' | 'test_score' | 'recommendation' | 'financial' | 'writing';
  evidenceType: EvidenceType;
  required: boolean;
  // Days before applicationDeadline this item must be submitted.
  // dueDate = applicationDeadline - dueOffsetDays
  dueOffsetDays: number;
}

export interface ChecklistItem {
  id: string;
  profileId: string;
  programId: string;
  requirementId: string;
  status: 'not_started' | 'in_progress' | 'complete';
  dueDate: string; // ISO 8601 — computed on creation
  notes?: string;
  completedAt?: string; // ISO 8601
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export interface TimelineEvent {
  id: string;
  profileId: string;
  programId: string;
  relatedRequirementId?: string; // present when derived from a checklist item
  title: string;
  description: string;
  date: string; // ISO 8601 — events are sorted ascending by this field
  type: 'deadline' | 'milestone' | 'submission' | 'program_start';
  status: 'pending' | 'complete';
}
