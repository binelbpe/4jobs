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
  governmentId?: string; // Add this line
}
