export enum JobType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  INTERNSHIP = 'INTERNSHIP',
  CONTRACT = 'CONTRACT',
  REMOTE = 'REMOTE',
  HYBRID = 'HYBRID'
}

export const JOB_TYPE_LABELS: Record<JobType, string> = {
  [JobType.FULL_TIME]: 'Full-time',
  [JobType.PART_TIME]: 'Part-time',
  [JobType.INTERNSHIP]: 'Internship',
  [JobType.CONTRACT]: 'Contract',
  [JobType.REMOTE]: 'Remote',
  [JobType.HYBRID]: 'Hybrid'
};