export type EducationLevel = 'bachelor' | 'master' | 'doctoral'

export interface TestScores {
  gre?: number
  gmat?: number
  lsat?: number
  toefl?: number
  ielts?: number
}

export interface StudentProfile {
  id: string
  name: string
  email: string
  gpa: number
  educationLevel: EducationLevel
  targetTerm: string
  testScores: TestScores
  selectedProgramIds: string[]
  createdAt: string
  updatedAt: string
}

export interface CreateProfileInput {
  fullName: string
  email: string
  gpa: number
  educationLevel: EducationLevel
  targetTerm: string
  testScores?: TestScores
  selectedProgramIds?: string[]
}

export interface UpdateProfileInput {
  fullName?: string
  email?: string
  gpa?: number
  educationLevel?: EducationLevel
  targetTerm?: string
  testScores?: TestScores
  selectedProgramIds?: string[]
}

export interface CreateProfilePayload {
  name: string
  email: string
  gpa: number
  educationLevel: EducationLevel
  targetTerm: string
  testScores?: TestScores
  selectedProgramIds?: string[]
}

export interface UpdateProfilePayload {
  name?: string
  email?: string
  gpa?: number
  educationLevel?: EducationLevel
  targetTerm?: string
  testScores?: TestScores
  selectedProgramIds?: string[]
}

export interface Session {
  profileId: string
  programId: string
  /** Client-mirrored list for catalog UX; kept in sync with PATCH /profiles when possible. */
  selectedProgramIds: string[]
  /** Program the user tried to select before having a profile; cleared after auto-selection. */
  pendingProgramId: string
}

export type EvidenceType = 'pdf_upload' | 'score_report' | 'reference_form' | 'payment' | 'other'

export interface Program {
  id: string
  name: string
  university: string
  degreeType: string
  department: string
  description: string
  applicationDeadline: string
  startDate: string
  tuitionPerYear: number
  duration: string
}

export interface Requirement {
  id: string
  programId: string
  title: string
  description: string
  type: 'document' | 'test_score' | 'recommendation' | 'financial' | 'writing'
  evidenceType: EvidenceType
  required: boolean
  dueOffsetDays: number
}

export interface ProgramDetail extends Program {
  requirements: Requirement[]
}

export interface ChecklistItem {
  id: string
  profileId: string
  programId: string
  requirementId: string
  status: 'not_started' | 'in_progress' | 'complete'
  dueDate: string
  notes?: string
  completedAt?: string
  createdAt: string
  updatedAt: string
}

export interface TimelineEvent {
  id: string
  profileId: string
  programId: string
  relatedRequirementId?: string
  title: string
  description: string
  date: string
  type: 'deadline' | 'milestone' | 'submission' | 'program_start'
  status: 'pending' | 'complete'
}

export interface ReadinessResult {
  readinessScore: number
  missingRequirements: Requirement[]
  nextMilestones: ChecklistItem[]
}

export interface ProgramsQuery {
  page: number
  limit: number
  university?: string
  degreeType?: string
}

export interface ProgramsResult {
  data: Program[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// View model types — UI-friendly field names. Composables map from API types to these.

export interface RequirementView {
  id: string
  title: string
  type: string
  evidence: string
  description: string
  required: boolean
}

export interface ProgramView {
  id: string
  name: string
  university: string
  degree: string
  department: string
  deadline: string
  tuition: number
  duration: string
  summary: string
  requirements: RequirementView[]
}

export interface ChecklistItemView {
  id: string
  requirementId: string
  title: string
  type: string
  evidence: string
  description: string
  status: 'not_started' | 'in_progress' | 'complete'
  dueDate: string
  notes: string
  programId: string
}

export interface TimelineEventView {
  id: string
  title: string
  date: string
  status: 'pending' | 'complete'
  type: 'deadline' | 'milestone' | 'submission' | 'program_start'
  sourceType: string
}

export interface ProfileScores {
  GRE?: number
  GMAT?: number
  LSAT?: number
  TOEFL?: number
  IELTS?: number
}
