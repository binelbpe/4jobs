

import { JobPost } from "../../../entities/jobPostTypes";

export interface IJobPostAdminRepository {
  findAll(): Promise<JobPost[]>;
  findById(id: string): Promise<JobPost | null>;
  update(id: string, jobPost: Partial<JobPost>): Promise<JobPost | null>;
  blockJobPost(id: string): Promise<JobPost | null>;
  unblockJobPost(id: string): Promise<JobPost | null>;
}