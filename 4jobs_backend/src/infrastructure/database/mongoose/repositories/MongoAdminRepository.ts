import { IAdminRepository } from "../../../../domain/interfaces/repositories/admin/IAdminRepository";
import { User } from "../../../../domain/entities/User";
import { injectable } from "inversify";
import { UserModel } from "../../mongoose/models/UserModel";
import { IRecruiter } from "../../../../domain/entities/Recruiter";
import Recruiter from "../models/RecruiterModel";
import JobPost from "../models/jobPostModel";
import Post from "../models/PostModel";

@injectable()
export class MongoAdminRepository implements IAdminRepository {
  async findAllUsers(): Promise<User[]> {
    const usersList = await UserModel.find({ isAdmin: false }).exec();

    const mappedUsers = usersList.map(this.mapToUser);
    return mappedUsers;
  }

  async blockUserById(id: string): Promise<User | null> {
    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      { isBlocked: true },
      { new: true }
    );

    return updatedUser ? this.mapToUser(updatedUser) : null;
  }

  async unBlockUserById(id: string): Promise<User | null> {
    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      { isBlocked: false },
      { new: true }
    );

    return updatedUser ? this.mapToUser(updatedUser) : null;
  }

  async findById(id: string): Promise<IRecruiter | null> {
    const recruiter = await Recruiter.findById(id).exec();
    return recruiter as IRecruiter | null;
  }

  private mapToUser(doc: any): User {
    return {
      id: doc._id.toString(),
      email: doc.email,
      password: doc.password,
      name: doc.name,
      role: doc.role,
      isAdmin: doc.isAdmin,
      bio: doc.bio,
      about: doc.about,
      experiences: doc.experiences || [],
      projects: doc.projects || [],
      certificates: doc.certificates || [],
      skills: doc.skills || [],
      appliedJobs: doc.appliedJobs || [],
      profileImage: doc.profileImage,
      dateOfBirth: doc.dateOfBirth,
      gender: doc.gender,
      resume: doc.resume,
      isBlocked: doc.isBlocked,
    };
  }

  private mapToIRecruiter(doc: any): IRecruiter {
    return {
      id: doc._id.toString(),
      email: doc.email,
      password: doc.password,
      companyName: doc.companyName,
      phone: doc.phone,
      name: doc.name,
      role: doc.role,
      isApproved: doc.isApproved,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      governmentId: doc.governmentId,
      employeeId: doc.employeeId,
      location: doc.location,
      employeeIdImage: doc.employeeIdImage,
      subscribed: doc.subscribed,
      planDuration: doc.planDuration,
      expiryDate: doc.expiryDate,
      subscriptionAmount: doc.subscriptionAmount,
      subscriptionStartDate: doc.subscriptionStartDate, // Add this line
    };
  }

  async save(recruiter: IRecruiter): Promise<IRecruiter> {
    const updatedRecruiter = await Recruiter.findByIdAndUpdate(
      recruiter.id,
      recruiter,
      { new: true }
    ).exec();
    return this.mapToIRecruiter(updatedRecruiter);
  }

  async findRecruiters(): Promise<IRecruiter[]> {
    const recruiters = await Recruiter.find().exec();
    return recruiters.map(this.mapToIRecruiter);
  }

  async getUserCount(): Promise<number> {
    return await UserModel.countDocuments({ role: "user" });
  }

  async getRecruiterCount(): Promise<number> {
    return await Recruiter.countDocuments();
  }

  async getCompanyCount(): Promise<number> {
    const uniqueCompanies = await Recruiter.aggregate([
      {
        $group: {
          _id: "$companyName",
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: null,
          totalUniqueCompanies: { $sum: 1 },
        },
      },
    ]);

    return uniqueCompanies[0]?.totalUniqueCompanies || 0;
  }

  async getTotalRevenue(): Promise<number> {
    const result = await Recruiter.aggregate([
      {
        $match: { subscribed: true },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$subscriptionAmount" },
        },
      },
    ]);
    return result[0]?.totalRevenue || 0;
  }

  async getMonthlyRevenue(): Promise<{ month: string; amount: number }[]> {
    const result = await Recruiter.aggregate([
      {
        $match: { subscribed: true },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m", date: "$subscriptionStartDate" },
          },
          amount: { $sum: "$subscriptionAmount" },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          _id: 0,
          month: "$_id",
          amount: 1,
        },
      },
    ]);
    return result;
  }

  async getJobPostCount(): Promise<number> {
    return await JobPost.countDocuments();
  }

  async getUserPostCount(): Promise<number> {
    return await Post.countDocuments();
  }

  async getSubscriptions(
    page: number,
    limit: number
  ): Promise<{
    subscriptions: IRecruiter[];
    totalPages: number;
    currentPage: number;
  }> {
    const totalCount = await Recruiter.countDocuments({ subscribed: true });
    const totalPages = Math.ceil(totalCount / limit);
    const skip = (page - 1) * limit;

    const recruiters = await Recruiter.find({ subscribed: true })
      .skip(skip)
      .limit(limit)
      .exec();

    return {
      subscriptions: recruiters.map(this.mapToIRecruiter),
      totalPages,
      currentPage: page,
    };
  }

  async cancelSubscription(recruiterId: string): Promise<IRecruiter | null> {
    const updatedRecruiter = await Recruiter.findByIdAndUpdate(
      recruiterId,
      {
        subscribed: false,
        planDuration: null,
        expiryDate: null,
        subscriptionAmount: 0,
        subscriptionStartDate: null,
      },
      { new: true }
    ).exec();
    return updatedRecruiter ? this.mapToIRecruiter(updatedRecruiter) : null;
  }
}
