import { JobType } from "../enums/job-type";

export interface JobResponse {
  id: number;
  title: string;
  description: string;
  location: string;
  jobType: JobType;
  salaryMin: number | null;
  salaryMax: number | null;
  experience: string | null;
  skills: string | null;
  vacancies: number;
  lastDate: string | null;
  isActive: boolean;
  companyName: string;
  companyId: number;
  companyLogoUrl: string | null;
  postedByName: string;
  createdAt: string;
}