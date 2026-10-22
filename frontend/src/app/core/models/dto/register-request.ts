import { Role } from "../enums/role";

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phoneNumber: string | null;
  role: Role;
}