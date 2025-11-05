export interface UserResource {
  id: number;
  email: string;
  passwordHash: string;
  role: string;
  status: string;
  name?: string;
  avatarUrl?: string;
}
