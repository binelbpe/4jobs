import { injectable } from "inversify";
import JobPostModel from "../models/jobPostModel";
import { UserModel } from "../models/UserModel";
import { IJobPostUserRepository } from "../../../../domain/interfaces/repositories/user/IJobPostUserRepository";
import {
  JobPost,
  CreateJobPostParams,
  UpdateJobPostParams,
} from "../../../../domain/entities/jobPostTypes";
import { User } from "../../../../domain/entities/User";

@injectable()
export class MongoJobPostUserRepository implements IJobPostUserRepository {
  async findById(id: string): Promise<JobPost | null> {
    return await JobPostModel.findOne({ _id: id, isBlock: false }).lean();
  }
  
  async update(
    id: string,
    userId: string
  ): Promise<JobPost | null> {
    let updatedJobPost = await JobPostModel.findOneAndUpdate(
      { _id: id, isBlock: false },
      { $addToSet: { applicants: userId } },
      { new: true }
    );

    console.log("updatedjob post applied -------------------", updatedJobPost)
    return updatedJobPost
  }

  async findAll(
    page: number,
    limit: number,
    sortBy: string,
    sortOrder: string,
    filter: any
  ): Promise<{ jobPosts: JobPost[]; totalPages: number; totalCount: number }> {
    const skip = (page - 1) * limit;
    const sort: { [key: string]: 1 | -1 } = {
      [sortBy]: sortOrder === "asc" ? 1 : -1,
    };

    // Add isBlock: false to the filter
    const blockFilter = { ...filter, isBlock: false };

    const totalCount = await JobPostModel.countDocuments(blockFilter);
    const totalPages = Math.ceil(totalCount / limit);

    const jobPosts = await JobPostModel.find(blockFilter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    return {
      jobPosts: jobPosts,
      totalPages,
      totalCount,
    };
  }

  async reportJob(userId: string, jobId: string): Promise<JobPost | null> {
    const updatedJobPost = await JobPostModel.findByIdAndUpdate(
      jobId,
      { $addToSet: { reportedBy: userId } },
      { new: true }
    );

    return updatedJobPost;
  }
}
