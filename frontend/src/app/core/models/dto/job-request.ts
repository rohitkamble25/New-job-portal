import { JobType } from "../enums/job-type";

export interface JobRequest {
  title: string;
  description: string;
  location: string;
  jobType: JobType;
  salaryMin: number | null;
  salaryMax: number | null;
  experience: string | null;
  skills: string | null;
  vacancies: number | null;
  lastDate: string | null;
  companyId: number;
}