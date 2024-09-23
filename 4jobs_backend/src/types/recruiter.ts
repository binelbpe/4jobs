export interface IRecruiter {
  id: string;
  email: string;
  password: string;
  companyName: string;
  phone: string;
  name: string;
  role: 'user' | 'recruiter' | 'admin';
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
  governmentId?: string;
  employeeId?: string; 
  location?: string;
  employeeIdImage?: string; 
}
