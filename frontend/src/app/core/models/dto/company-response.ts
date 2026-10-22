export interface CompanyResponse {
  id: number;
  name: string;
  description: string | null;
  website: string | null;
  location: string;
  industry: string | null;
  logoUrl: string | null;
  isApproved: boolean;
  employerName: string;
  employerId: number;
  createdAt: string;
}