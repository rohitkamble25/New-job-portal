import { Role } from "../enums/role";

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  phoneNumber: string | null;
  role: Role;
  profileSummary: string | null;
  resumeUrl: string | null;
  isActive: boolean;
  createdAt: string;
}