export interface CompanyRequest {
  name: string;
  description: string | null;
  website: string | null;
  location: string;
  industry: string | null;
}