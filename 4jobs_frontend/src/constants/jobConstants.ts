export const WORK_TYPES = [
  'Full-time',
  'Part-time',
  'Contract',
  'Freelance',
  'Remote',
  'Hybrid',
  'On-site',
] as const;

export type WorkType = typeof WORK_TYPES[number];
