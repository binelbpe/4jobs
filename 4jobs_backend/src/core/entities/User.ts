export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'user' | 'recruiter' | 'admin';
  createdAt: Date;
  updatedAt: Date;
  isAdmin: Boolean;
}
