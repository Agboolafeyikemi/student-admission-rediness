import type { Requirement } from '../types/index.js';

export const requirements: Requirement[] = [
  // ─── Stanford CS MS ────────────────────────────────────────────────────────
  {
    id: 'req-cs-stanford-01',
    programId: 'cs-stanford-ms-2026',
    title: 'Official Transcripts',
    description:
      "Official transcripts from all undergraduate and graduate institutions attended. Must be sent directly from the institution or uploaded through the official application portal.",
    type: 'document',
    evidenceType: 'pdf_upload',
    required: true,
    dueOffsetDays: 14,
  },
  {
    id: 'req-cs-stanford-02',
    programId: 'cs-stanford-ms-2026',
    title: 'Statement of Purpose',
    description:
      "A 500-1,000 word essay describing your research interests, academic background, and how Stanford's CS program aligns with your goals.",
    type: 'writing',
    evidenceType: 'pdf_upload',
    required: true,
    dueOffsetDays: 7,
  },
  {
    id: 'req-cs-stanford-03',
    programId: 'cs-stanford-ms-2026',
    title: 'Letters of Recommendation (3)',
    description:
      "Three letters from academic or professional references who can speak to your technical ability and research potential. Submitted via the online portal.",
    type: 'recommendation',
    evidenceType: 'reference_form',
    required: true,
    dueOffsetDays: 21,
  },
  {
    id: 'req-cs-stanford-04',
    programId: 'cs-stanford-ms-2026',
    title: 'Resume / CV',
    description:
      "Current resume or curriculum vitae including education, work experience, research projects, and publications.",
    type: 'document',
    evidenceType: 'pdf_upload',
    required: true,
    dueOffsetDays: 7,
  },
  {
    id: 'req-cs-stanford-05',
    programId: 'cs-stanford-ms-2026',
    title: 'GRE General Test Scores',
    description:
      "Stanford CS is test-optional. GRE scores may be submitted but are not required. If submitted, send official scores from ETS (institution code: 4704).",
    type: 'test_score',
    evidenceType: 'score_report',
    required: false,
    dueOffsetDays: 21,
  },
  {
    id: 'req-cs-stanford-06',
    programId: 'cs-stanford-ms-2026',
    title: 'TOEFL / IELTS (International Applicants)',
    description:
      "Non-native English speakers must submit TOEFL (minimum 100 iBT) or IELTS (minimum 7.0). Exempt if bachelor's degree is from an English-instruction institution.",
    type: 'test_score',
    evidenceType: 'score_report',
    required: false,
    dueOffsetDays: 21,
  },
  {
    id: 'req-cs-stanford-07',
    programId: 'cs-stanford-ms-2026',
    title: 'Application Fee',
    description: "Non-refundable application fee of $125, paid online at time of submission.",
    type: 'financial',
    evidenceType: 'payment',
    required: true,
    dueOffsetDays: 0,
  },

  // ─── Harvard MBA ───────────────────────────────────────────────────────────
  {
    id: 'req-mba-harvard-01',
    programId: 'mba-harvard-2026',
    title: 'Official Transcripts',
    description:
      "Transcripts from all post-secondary institutions. HBS accepts unofficial transcripts at application; official copies required upon admission.",
    type: 'document',
    evidenceType: 'pdf_upload',
    required: true,
    dueOffsetDays: 14,
  },
  {
    id: 'req-mba-harvard-02',
    programId: 'mba-harvard-2026',
    title: 'Post-MBA Career Goals Essay',
    description:
      "A single essay (up to 900 words) answering: \"As we review your application, what more would you like us to know as we consider your candidacy for the Harvard Business School MBA program?\"",
    type: 'writing',
    evidenceType: 'pdf_upload',
    required: true,
    dueOffsetDays: 7,
  },
  {
    id: 'req-mba-harvard-03',
    programId: 'mba-harvard-2026',
    title: 'Letters of Recommendation (2)',
    description:
      "Two professional recommendations -- at least one from a direct supervisor. Recommenders complete HBS-specific questions online.",
    type: 'recommendation',
    evidenceType: 'reference_form',
    required: true,
    dueOffsetDays: 21,
  },
  {
    id: 'req-mba-harvard-04',
    programId: 'mba-harvard-2026',
    title: 'Resume',
    description:
      "One-page resume summarizing professional experience, academic background, and extracurricular leadership.",
    type: 'document',
    evidenceType: 'pdf_upload',
    required: true,
    dueOffsetDays: 7,
  },
  {
    id: 'req-mba-harvard-05',
    programId: 'mba-harvard-2026',
    title: 'GMAT / GRE Scores',
    description:
      "Official scores from GMAT (institution code: 3XK-5J-67) or GRE (institution code: 3451). Average admitted GMAT: 730. Scores must be less than 5 years old.",
    type: 'test_score',
    evidenceType: 'score_report',
    required: true,
    dueOffsetDays: 21,
  },
  {
    id: 'req-mba-harvard-06',
    programId: 'mba-harvard-2026',
    title: 'Application Fee',
    description: "Non-refundable application fee of $250, paid online at time of submission.",
    type: 'financial',
    evidenceType: 'payment',
    required: true,
    dueOffsetDays: 0,
  },

  // ─── MIT Data Science MS ───────────────────────────────────────────────────
  {
    id: 'req-ds-mit-01',
    programId: 'ds-mit-ms-2026',
    title: 'Official Transcripts',
    description:
      "Transcripts from all colleges and universities attended, sent electronically through the application system.",
    type: 'document',
    evidenceType: 'pdf_upload',
    required: true,
    dueOffsetDays: 14,
  },
  {
    id: 'req-ds-mit-02',
    programId: 'ds-mit-ms-2026',
    title: 'Statement of Objectives',
    description:
      "A 600-800 word essay outlining your research background, the specific problems you want to investigate, and which MIT faculty your work aligns with.",
    type: 'writing',
    evidenceType: 'pdf_upload',
    required: true,
    dueOffsetDays: 7,
  },
  {
    id: 'req-ds-mit-03',
    programId: 'ds-mit-ms-2026',
    title: 'Letters of Recommendation (3)',
    description:
      "Three academic letters from professors or research supervisors. Recommenders must submit directly through MIT's portal before the deadline.",
    type: 'recommendation',
    evidenceType: 'reference_form',
    required: true,
    dueOffsetDays: 21,
  },
  {
    id: 'req-ds-mit-04',
    programId: 'ds-mit-ms-2026',
    title: 'Resume / CV',
    description:
      "Full academic CV including publications, research experience, and technical skills.",
    type: 'document',
    evidenceType: 'pdf_upload',
    required: true,
    dueOffsetDays: 7,
  },
  {
    id: 'req-ds-mit-05',
    programId: 'ds-mit-ms-2026',
    title: 'GRE General Test Scores',
    description:
      "MIT IDSS is test-optional. GRE scores are not required and will not disadvantage applicants who omit them. If submitted, send official scores from ETS (institution code: 3514).",
    type: 'test_score',
    evidenceType: 'score_report',
    required: false,
    dueOffsetDays: 21,
  },
  {
    id: 'req-ds-mit-06',
    programId: 'ds-mit-ms-2026',
    title: 'TOEFL / IELTS (International Applicants)',
    description:
      "TOEFL minimum 100 iBT or IELTS minimum 7.0. Waived if bachelor's degree was completed at an English-speaking institution.",
    type: 'test_score',
    evidenceType: 'score_report',
    required: false,
    dueOffsetDays: 21,
  },
  {
    id: 'req-ds-mit-07',
    programId: 'ds-mit-ms-2026',
    title: 'Application Fee',
    description: "Non-refundable application fee of $75, paid at time of online submission.",
    type: 'financial',
    evidenceType: 'payment',
    required: true,
    dueOffsetDays: 0,
  },

  // ─── Yale Law JD ───────────────────────────────────────────────────────────
  {
    id: 'req-jd-yale-01',
    programId: 'jd-yale-2026',
    title: 'Official Transcripts',
    description:
      "Transcripts from every college or university attended, submitted through LSAC's Credential Assembly Service (CAS).",
    type: 'document',
    evidenceType: 'pdf_upload',
    required: true,
    dueOffsetDays: 21,
  },
  {
    id: 'req-jd-yale-02',
    programId: 'jd-yale-2026',
    title: 'Personal Statement',
    description:
      "A 2-4 page personal statement conveying your background, motivation for pursuing law, and what you will contribute to the Yale community.",
    type: 'writing',
    evidenceType: 'pdf_upload',
    required: true,
    dueOffsetDays: 10,
  },
  {
    id: 'req-jd-yale-03',
    programId: 'jd-yale-2026',
    title: 'Writing Sample',
    description:
      "A 10-30 page analytical writing sample demonstrating legal research and reasoning. Submitted through LSAC.",
    type: 'writing',
    evidenceType: 'pdf_upload',
    required: true,
    dueOffsetDays: 10,
  },
  {
    id: 'req-jd-yale-04',
    programId: 'jd-yale-2026',
    title: 'Letters of Recommendation (3)',
    description:
      "Three letters through LSAC CAS, at least two from academic references who can evaluate your writing and analytical skills.",
    type: 'recommendation',
    evidenceType: 'reference_form',
    required: true,
    dueOffsetDays: 28,
  },
  {
    id: 'req-jd-yale-05',
    programId: 'jd-yale-2026',
    title: 'Resume',
    description:
      "Current resume including education, work experience, publications, and community involvement.",
    type: 'document',
    evidenceType: 'pdf_upload',
    required: true,
    dueOffsetDays: 10,
  },
  {
    id: 'req-jd-yale-06',
    programId: 'jd-yale-2026',
    title: 'LSAT Scores',
    description:
      "Official LSAT scores reported through LSAC. Yale's median LSAT is 174. Scores from the last 5 years are accepted; best score is considered.",
    type: 'test_score',
    evidenceType: 'score_report',
    required: true,
    dueOffsetDays: 28,
  },
  {
    id: 'req-jd-yale-07',
    programId: 'jd-yale-2026',
    title: 'Application Fee',
    description: "Non-refundable application fee of $85, paid through LSAC at time of submission.",
    type: 'financial',
    evidenceType: 'payment',
    required: true,
    dueOffsetDays: 0,
  },

  // ─── Johns Hopkins MPH ─────────────────────────────────────────────────────
  {
    id: 'req-mph-jhu-01',
    programId: 'mph-jhu-2026',
    title: 'Official Transcripts',
    description:
      "Transcripts from all colleges and universities, showing a bachelor's degree or higher. Minimum cumulative GPA of 3.0 recommended.",
    type: 'document',
    evidenceType: 'pdf_upload',
    required: true,
    dueOffsetDays: 14,
  },
  {
    id: 'req-mph-jhu-02',
    programId: 'mph-jhu-2026',
    title: 'Statement of Purpose',
    description:
      "A 700-900 word essay explaining your public health interests, the specific MPH concentration you're pursuing, and your professional goals after graduation.",
    type: 'writing',
    evidenceType: 'pdf_upload',
    required: true,
    dueOffsetDays: 7,
  },
  {
    id: 'req-mph-jhu-03',
    programId: 'mph-jhu-2026',
    title: 'Letters of Recommendation (2)',
    description:
      "Two letters from individuals who can speak to your academic preparation and potential for public health leadership. At least one must be academic.",
    type: 'recommendation',
    evidenceType: 'reference_form',
    required: true,
    dueOffsetDays: 21,
  },
  {
    id: 'req-mph-jhu-04',
    programId: 'mph-jhu-2026',
    title: 'Resume / CV',
    description:
      "Detailed resume including public health or health-related work, volunteer experience, and relevant coursework.",
    type: 'document',
    evidenceType: 'pdf_upload',
    required: true,
    dueOffsetDays: 7,
  },
  {
    id: 'req-mph-jhu-05',
    programId: 'mph-jhu-2026',
    title: 'GRE General Test Scores',
    description:
      "GRE scores submitted through ETS (institution code: 5132). Optional for applicants with a 3.5+ GPA or relevant professional experience of 5+ years.",
    type: 'test_score',
    evidenceType: 'score_report',
    required: false,
    dueOffsetDays: 21,
  },
  {
    id: 'req-mph-jhu-06',
    programId: 'mph-jhu-2026',
    title: 'Application Fee',
    description: "Non-refundable application fee of $75, paid at time of online submission.",
    type: 'financial',
    evidenceType: 'payment',
    required: true,
    dueOffsetDays: 0,
  },
];
