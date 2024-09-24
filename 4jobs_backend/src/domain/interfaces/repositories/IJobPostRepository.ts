import { JobPost, CreateJobPostParams, UpdateJobPostParams } from '../../../types/jobPostTypes';

export interface IJobPostRepository {
  create(params: CreateJobPostParams): Promise<JobPost>;
  findById(id: string): Promise<JobPost | null>;
  findByRecruiterId(recruiterId: string): Promise<JobPost[]>;
  update(id: string, params: UpdateJobPostParams): Promise<JobPost | null>;
  delete(id: string): Promise<boolean>;
}