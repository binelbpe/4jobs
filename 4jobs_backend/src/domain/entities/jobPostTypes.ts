
import mongoose from 'mongoose';
export interface JobPost {
  _id?: string;
  title: string;
  description: string;
  company: {
    name: string;
    website: string;
    logo: string;
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
  applicants?: string[];
  recruiterId: string;
}

export type CreateJobPostParams = Omit<JobPost, '_id'>;
export type UpdateJobPostParams = Partial<JobPost>;