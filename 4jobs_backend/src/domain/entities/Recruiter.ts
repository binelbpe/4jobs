import 'reflect-metadata'; 
import { Document } from 'mongoose';


export interface Recruiter extends Document {
  companyName: string;
  phone: string;
  email: string;
  password: string;
  role:'recruiter';
  isApproved: boolean;
  name: string; 
  createdAt: Date;
  updatedAt: Date;
}
