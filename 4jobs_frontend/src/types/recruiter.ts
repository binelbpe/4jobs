export interface Recruiter {
  email: string;
  password: string;
  companyName: string;
  role: 'recruiter';
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}
