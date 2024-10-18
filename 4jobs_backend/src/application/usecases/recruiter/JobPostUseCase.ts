import { injectable, inject } from "inversify";
import TYPES from "../../../types";
import { IJobPostRepository } from "../../../domain/interfaces/repositories/recruiter/IJobPostRepository";
import {
  JobPost,
  CreateJobPostParams,
  UpdateJobPostParams,
} from "../../../domain/entities/jobPostTypes";
import { User } from "../../../domain/entities/User";
import { IUserRepository } from "../../../domain/interfaces/repositories/user/IUserRepository";
@injectable()
export class JobPostUseCase {
  constructor(
    @inject(TYPES.JobPostRepository)
    private jobPostRepository: IJobPostRepository,
    @inject(TYPES.IUserRepository) private userRepository: IUserRepository
  ) {}
  async getApplicantsByJobId(
    jobId: string,
    page: number,
    limit: number
  ): Promise<{ applicants: User[]; totalPages: number; totalCount: number }> {
    return this.jobPostRepository.findApplicantsByJobId(jobId, page, limit);
  }
  async createJobPost(params: CreateJobPostParams): Promise<JobPost> {
    return await this.jobPostRepository.create(params);
  }

  async getJobPostById(id: string): Promise<JobPost | null> {
    return await this.jobPostRepository.findById(id);
  }

  async getApplicantsById(id: string): Promise<User | null> {
    return await this.userRepository.findById(id);
  }

  async getJobPostsByRecruiterId(recruiterId: string): Promise<JobPost[]> {
    return await this.jobPostRepository.findByRecruiterId(recruiterId);
  }

  async updateJobPost(
    id: string,
    params: UpdateJobPostParams
  ): Promise<JobPost | null> {
    return await this.jobPostRepository.update(id, params);
  }

  async deleteJobPost(id: string): Promise<boolean> {
    return await this.jobPostRepository.delete(id);
  }

  async getAllJobPosts(): Promise<JobPost[]> {
    return await this.jobPostRepository.findAll();
  }
}
