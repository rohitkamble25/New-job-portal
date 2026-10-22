import { ApplicationStatus } from "../enums/application-status";

export interface ApplicationResponse {
  id: number;
  jobId: number;
  jobTitle: string;
  companyName: string;
  applicantId: number;
  applicantName: string;
  applicantEmail: string;
  status: ApplicationStatus;
  coverLetter: string | null;
  resumeUrl: string | null;
  employerNotes: string | null;
  appliedAt: string;
  updatedAt: string;
}