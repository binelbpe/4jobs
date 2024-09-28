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
    return await JobPostModel.findById(id).lean();
  }
  
  async update(
    id: string,
    userId: string
  ): Promise<JobPost | null> {
    let updatedJobPost= await JobPostModel.findByIdAndUpdate(
      id, 
      { $addToSet: { applicants: userId } }, // Use $addToSet to avoid duplicate entries
      { new: true }
    );

    console.log("updatedjob post applied -------------------",updatedJobPost)
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

    const totalCount = await JobPostModel.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    const jobPosts = await JobPostModel.find(filter)
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
}
