import { IUserRepository } from "../../../../domain/interfaces/repositories/user/IUserRepository";
import { User } from "../../../../domain/entities/User";
import { injectable } from "inversify";
import { UserModel } from "../../mongoose/models/UserModel";

@injectable()
export class MongoUserRepository implements IUserRepository {
  async findByUserId(userId: string): Promise<User | null> {
    const user = await UserModel.findById(userId).lean();
    return user ? this.mapToUser(user) : null;
  }

  async findById(id: string): Promise<User | null> {
    const user = await UserModel.findById(id).lean();
    return user ? this.mapToUser(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await UserModel.findOne({ email }).lean();
    return user ? this.mapToUser(user) : null;
  }

  async create(user: Omit<User, 'id'>): Promise<User> {
    const newUser = new UserModel(user);
    await newUser.save();
    return this.mapToUser(newUser.toObject());
  }

  async update(id: string, user: Partial<User>): Promise<User | null> {
    const updatedUser = await UserModel.findByIdAndUpdate(id, user, {
      new: true,
    }).lean();
    return updatedUser ? this.mapToUser(updatedUser) : null;
  }

  async updateAppliedJobs(id: string, jobPostId: string): Promise<User | null> {
    const updatedUser = await UserModel.findByIdAndUpdate(
        id,
        { $addToSet: { appliedJobs: jobPostId } },
        { new: true }
    ).lean();
    return updatedUser ? this.mapToUser(updatedUser) : null;
  }

  async searchUsers(query: string, userIds: string[]): Promise<User[]> {
    const users = await UserModel.find({
      _id: { $in: userIds },
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    }).limit(20);
    return users.map(this.mapToUser);
  }

  // New method
  async findUsersByIds(userIds: string[]): Promise<User[]> {
    const users = await UserModel.find({ _id: { $in: userIds } }).lean();
    return users.map(this.mapToUser);
  }

  private mapToUser(doc: any): User {
    return {
      id: doc._id.toString(),
      email: doc.email,
      password: doc.password,
      name: doc.name,
      role: doc.role,
      isAdmin: doc.isAdmin,
      phone: doc.phone,
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

  // Add this new method to the MongoUserRepository class

  async updatePassword(id: string, newPassword: string): Promise<void> {
    await UserModel.findByIdAndUpdate(id, { password: newPassword });
  }
}
