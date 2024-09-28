import { IAdminRepository } from "../../../../domain/interfaces/repositories/admin/IAdminRepository";
import { User } from "../../../../domain/entities/User";
import { injectable } from "inversify";
import { UserModel } from "../../mongoose/models/UserModel";
import { IRecruiter } from "../../../../domain/entities/Recruiter";
import Recruiter from "../models/RecruiterModel";

@injectable()
export class MongoAdminRepository implements IAdminRepository {


  async findAllUsers(): Promise<User[]> {
    const usersList = await UserModel.find({ isAdmin: false }).exec();

    // Map each document to ensure `id` is correctly mapped from `_id`
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

  async save(recruiter: IRecruiter): Promise<IRecruiter> {
    const updatedRecruiter = await Recruiter.findByIdAndUpdate(
      recruiter.id,
      recruiter,
      { new: true }
    ).exec();
    return updatedRecruiter as IRecruiter;
  }

  async findRecruiters(): Promise<IRecruiter[]> {
    const recruiters = await Recruiter.find().exec();
    return recruiters as IRecruiter[];
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
}
