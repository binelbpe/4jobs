import 'reflect-metadata'; 
export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'user' | 'recruiter' | 'admin';  
  isAdmin: boolean;
}
