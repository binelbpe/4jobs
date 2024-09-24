import { injectable, inject } from 'inversify';
import TYPES from '../../../types';
import { IJobPostRepository } from '../../../domain/interfaces/repositories/IJobPostRepository';
import { JobPost, CreateJobPostParams, UpdateJobPostParams } from '../../../types/jobPostTypes';

@injectable()
export class JobPostUseCase {
  constructor(
    @inject(TYPES.JobPostRepository) private jobPostRepository: IJobPostRepository
  ) {}

  async createJobPost(params: CreateJobPostParams): Promise<JobPost> {
    return await this.jobPostRepository.create(params);
  }

  async getJobPostById(id: string): Promise<JobPost | null> {
    return await this.jobPostRepository.findById(id);
  }

  async getJobPostsByRecruiterId(recruiterId: string): Promise<JobPost[]> {
    return await this.jobPostRepository.findByRecruiterId(recruiterId);
  }

  async updateJobPost(id: string, params: UpdateJobPostParams): Promise<JobPost | null> {
    return await this.jobPostRepository.update(id, params);
  }

  async deleteJobPost(id: string): Promise<boolean> {
    return await this.jobPostRepository.delete(id);
  }
}