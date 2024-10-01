
import mongoose from 'mongoose';
// domain/entities/JobPost.ts

export interface JobPost {
  _id?: string;
  title: string;
  description: string;
  company: {
    name: string;
    website?: string;
    logo?: string;
  };
  location: string;
  salaryRange: {
    min: number;
    max: number;
  };
  wayOfWork: string;
  skillsRequired: string[];
  qualifications: string[];
  status: 'Open' | 'Closed';
  recruiterId: string;
  applicants?: string[];
  reportedBy?: string[];
  createdAt: Date;
  updatedAt: Date;
  isBlock:boolean;
}
export type CreateJobPostParams = Omit<JobPost, '_id'>;
export type UpdateJobPostParams = Partial<JobPost>;