import { injectable } from "inversify";
import { IJobPostAdminRepository } from "../../../../domain/interfaces/repositories/admin/IJobPostRepositoryAdmin";
import { JobPost } from "../../../../domain/entities/jobPostTypes";
import JobPostModel from "../models/jobPostModel";

@injectable()
export class MongoJobPostAdminRepository implements IJobPostAdminRepository {
  async findAll(): Promise<JobPost[]> {
    console.log("job post list admin mongo")
    return JobPostModel.find().lean();
  }

  async findById(id: string): Promise<JobPost | null> {
    return JobPostModel.findById(id).lean();
  }

  async update(id: string, jobPost: Partial<JobPost>): Promise<JobPost | null> {
    return JobPostModel.findByIdAndUpdate(id, jobPost, { new: true }).lean();
  }

  async blockJobPost(id: string): Promise<JobPost | null> {
    return JobPostModel.findByIdAndUpdate(id, { isBlock: true }, { new: true }).lean();
  }

  async unblockJobPost(id: string): Promise<JobPost | null> {
    return JobPostModel.findByIdAndUpdate(id, { isBlock: false }, { new: true }).lean();
  }
}