import { Role } from "./enums/role";

export interface User {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  role: Role;
  profileSummary: string | null;
  resumeUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}