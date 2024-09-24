import { injectable } from 'inversify';
import JobPostModel from '../models/jobPostModel';
import { IJobPostRepository } from '../../../../domain/interfaces/repositories/IJobPostRepository';
import { JobPost, CreateJobPostParams, UpdateJobPostParams } from '../../../../types/jobPostTypes';

@injectable()
export class MongoJobPostRepository implements IJobPostRepository {
  async create(params: CreateJobPostParams): Promise<JobPost> {
    const jobPost = new JobPostModel(params);
    return await jobPost.save();
  }

  async findById(id: string): Promise<JobPost | null> {
    return await JobPostModel.findById(id);
  }

  async findByRecruiterId(recruiterId: string): Promise<JobPost[]> {
    return await JobPostModel.find({ recruiterId });
  }

  async update(id: string, params: UpdateJobPostParams): Promise<JobPost | null> {
    return await JobPostModel.findByIdAndUpdate(id, params, { new: true });
  }

  async delete(id: string): Promise<boolean> {
    const result = await JobPostModel.findByIdAndDelete(id);
    return !!result;
  }
}