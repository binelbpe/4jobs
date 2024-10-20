import {
  JobPost,
  CreateJobPostParams,
  UpdateJobPostParams,
} from "../../../entities/jobPostTypes";
import { User } from "../../../entities/User";

export interface IJobPostRepository {
  create(params: CreateJobPostParams): Promise<JobPost>;
  findById(id: string): Promise<JobPost | null>;
  findByRecruiterId(recruiterId: string): Promise<JobPost[]>;
  update(id: string, params: UpdateJobPostParams): Promise<JobPost | null>;
  delete(id: string): Promise<boolean>;
  findApplicantsByJobId(
    jobId: string,
    page: number,
    limit: number
  ): Promise<{ applicants: User[]; totalPages: number; totalCount: number }>;
  findAll(): Promise<JobPost[]>;
}
