import { injectable } from "inversify";
import JobPostModel from "../models/jobPostModel";
import { UserModel } from "../models/UserModel";
import { IJobPostRepository } from "../../../../domain/interfaces/repositories/recruiter/IJobPostRepository";
import {
  JobPost,
  CreateJobPostParams,
  UpdateJobPostParams,
} from "../../../../domain/entities/jobPostTypes";
import { User } from "../../../../domain/entities/User";

@injectable()
export class MongoJobPostRepository implements IJobPostRepository {
  async create(params: CreateJobPostParams): Promise<JobPost> {
    const jobPost = new JobPostModel(params);
    return await jobPost.save();
  }

  async findById(id: string): Promise<JobPost | null> {
    return await JobPostModel.findById(id).lean();
  }

  async findByRecruiterId(recruiterId: string): Promise<JobPost[]> {
    return await JobPostModel.find({ recruiterId });
  }

  async update(
    id: string,
    params: UpdateJobPostParams
  ): Promise<JobPost | null> {
    return await JobPostModel.findByIdAndUpdate(id, params, { new: true });
  }

  async delete(id: string): Promise<boolean> {
    const result = await JobPostModel.findByIdAndDelete(id);
    return !!result;
  }

 
  
  async findApplicantsByJobId(
    jobId: string,
    page: number,
    limit: number
  ): Promise<{ applicants: User[]; totalPages: number; totalCount: number }> {
    const skip = (page - 1) * limit;

    const jobPost = await JobPostModel.findById(jobId).lean();
    if (!jobPost || !jobPost.applicants) {
      throw new Error("Job post or applicants not found");
    }

    const totalCount = jobPost.applicants?.length || 0;
    const totalPages = Math.ceil(totalCount / limit);

    const applicantIds = jobPost.applicants?.slice(skip, skip + limit) || [];
    const applicants = await UserModel.find({
      _id: { $in: applicantIds },
    }).lean();

    return {
      applicants: applicants.map(this.mapToUser),
      totalPages,
      totalCount,
    };
  }

  private mapToUser(doc: any): User {
    return {
      id: doc._id.toString(),
      email: doc.email,
      name: doc.name,
      bio: doc.bio,
      about: doc.about,
      experiences: doc.experiences || [],
      projects: doc.projects || [],
      certificates: doc.certificates || [],
      skills: doc.skills || [],
      profileImage: doc.profileImage,
      dateOfBirth: doc.dateOfBirth,
      gender: doc.gender,
      resume: doc.resume,
      password: doc.password || "", 
      role: doc.role || "", 
      isAdmin: doc.isAdmin || false, 
    };
  }

  async findAll(): Promise<JobPost[]> {
    return await JobPostModel.find({ isBlock: false }).lean();
  }
}
