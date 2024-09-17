import { Document } from 'mongoose';

export interface Recruiter extends Document {
  companyName: string;
  phone: string;
  email: string;
  password: string;
  role: 'user' | 'recruiter' | 'admin';
  isApproved: boolean;
  name: string; 
  createdAt: Date;
  updatedAt: Date;
}
