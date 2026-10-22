import { User } from './user';

export interface Company {
  id: number;
  name: string;
  description: string | null;
  website: string | null;
  location: string | null;
  industry: string | null;
  logoUrl: string | null;
  isApproved: boolean;
  employer: User;
  createdAt: string;
  updatedAt: string;
}