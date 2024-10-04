import mongoose from 'mongoose';

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
  recruiterId: mongoose.Types.ObjectId | string;
  applicants?: mongoose.Types.ObjectId[] | string[];
  reports?: {
    userId: mongoose.Types.ObjectId | string;
    reason: string;
    createdAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
  isBlock: boolean;
}

export type CreateJobPostParams = Omit<JobPost, '_id' | 'createdAt' | 'updatedAt'>;
export type UpdateJobPostParams = Partial<JobPost>;