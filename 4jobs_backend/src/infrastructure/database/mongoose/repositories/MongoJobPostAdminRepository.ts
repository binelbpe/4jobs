import { injectable } from "inversify";
import { IJobPostAdminRepository } from "../../../../domain/interfaces/repositories/admin/IJobPostRepositoryAdmin";
import { JobPost } from "../../../../domain/entities/jobPostTypes";
import JobPostModel from "../models/jobPostModel";
import {UserModel} from "../models/UserModel"; // Assuming you have a User model

@injectable()
export class MongoJobPostAdminRepository implements IJobPostAdminRepository {
  async findAll(): Promise<JobPost[]> {
    const jobPosts = await JobPostModel.find().lean().populate({
      path: 'recruiterId',
      select: 'name email'
    }).populate({
      path: 'applicants',
      select: 'name email'
    });

    const populatedJobPosts = await Promise.all(jobPosts.map(async (post) => {
      const reportedByUsers = await UserModel.find({ _id: { $in: post.reports?.map(report => report.userId) } })
        .select('name email')
        .lean();

      const reportsWithUserDetails = post.reports?.map(report => ({
        ...report,
        user: reportedByUsers.find(user => user._id.toString() === report.userId.toString())
      }));

      return {
        ...post,
        reports: reportsWithUserDetails
      };
    }));

    return populatedJobPosts;
  }

  async findById(id: string): Promise<JobPost | null> {
    return JobPostModel.findById(id)
      .populate('recruiterId', 'name email')
      .populate('applicants', 'name email')
      .populate('reports.userId', 'name email')
      .lean();
  }

  async update(id: string, jobPost: Partial<JobPost>): Promise<JobPost | null> {
    return JobPostModel.findByIdAndUpdate(id, jobPost, { new: true })
      .populate('recruiterId', 'name email')
      .populate('applicants', 'name email')
      .populate('reports.userId', 'name email')
      .lean();
  }

  async blockJobPost(id: string): Promise<JobPost | null> {
    return JobPostModel.findByIdAndUpdate(id, { isBlock: true }, { new: true })
      .populate('recruiterId', 'name email')
      .populate('applicants', 'name email')
      .populate('reports.userId', 'name email')
      .lean();
  }

  async unblockJobPost(id: string): Promise<JobPost | null> {
    return JobPostModel.findByIdAndUpdate(id, { isBlock: false }, { new: true })
      .populate('recruiterId', 'name email')
      .populate('applicants', 'name email')
      .populate('reports.userId', 'name email')
      .lean();
  }
}