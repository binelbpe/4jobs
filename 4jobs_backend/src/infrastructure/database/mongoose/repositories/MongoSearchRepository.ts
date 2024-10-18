import { injectable } from "inversify";
import { ISearchRepository } from "../../../../domain/interfaces/repositories/user/ISearchRepository";
import { UserModel } from "../models/UserModel";
import JobPostModel from "../models/jobPostModel";
import { ConnectionModel } from "../models/ConnectionModel";
import { User } from "../../../../domain/entities/User";
import { JobPost } from "../../../../domain/entities/jobPostTypes";
import mongoose from "mongoose";
import { IUserDocument } from "../../../../domain/entities/User";

@injectable()
export class MongoSearchRepository implements ISearchRepository {
  async searchUsersAndJobs(
    query: string,
    userId: string
  ): Promise<{ users: Partial<User>[]; jobPosts: JobPost[] }> {
    const userDocs = await UserModel.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
      _id: { $ne: new mongoose.Types.ObjectId(userId) },
      isBlocked: { $ne: true }, // Exclude blocked users
    }).limit(10);

    const jobPostDocs = await JobPostModel.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { "company.name": { $regex: query, $options: "i" } },
        { location: { $regex: query, $options: "i" } },
        { skillsRequired: { $in: [new RegExp(query, "i")] } },
        { qualifications: { $in: [new RegExp(query, "i")] } },
      ],
      isBlock: { $ne: true },
    }).limit(10);

    const connections = await ConnectionModel.find({
      $or: [
        { requester: new mongoose.Types.ObjectId(userId) },
        { recipient: new mongoose.Types.ObjectId(userId) },
      ],
      status: ["accepted", "pending"],
    });

    const connectedUserIds = connections.map((conn) =>
      conn.requester.toString() === userId
        ? conn.recipient.toString()
        : conn.requester.toString()
    );

    const searchResults = await UserModel.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
        { skills: { $elemMatch: { $regex: query, $options: "i" } } },
      ],
    })
      .limit(10)
      .skip(0);

    const results = await Promise.all(
      searchResults.map(async (doc: IUserDocument) => {
        const isConnected = connectedUserIds.includes(doc._id.toString());
        return {
          id: doc._id.toString(),
          email: doc.email,
          name: doc.name,
          profileImage: doc.profileImage,
          isConnected,
          isBlocked: doc.isBlocked, // Include isBlocked in the returned user object
        };
      })
    );

    const users: Partial<User>[] = results.map((result) => result);

    const jobPosts: JobPost[] = jobPostDocs.map((doc) => {
      const isApplied =
        doc.applicants?.some((applicant) => applicant.toString() === userId) ||
        false;
      return {
        _id: doc._id.toString(),
        title: doc.title,
        description: doc.description,
        company: doc.company,
        location: doc.location,
        salaryRange: doc.salaryRange,
        wayOfWork: doc.wayOfWork,
        skillsRequired: doc.skillsRequired,
        qualifications: doc.qualifications,
        status: doc.status,
        recruiterId: doc.recruiterId.toString(),
        applicants: doc.applicants?.map((id) => id.toString()) || [],
        reports: doc.reports,
        isBlock: doc.isBlock,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        isApplied,
      };
    });

    return { users, jobPosts };
  }
}
