import { Role } from "../enums/role";

export interface AuthResponse {
  token: string;
  type: string;
  userId: number;
  name: string;
  email: string;
  role: Role;
}