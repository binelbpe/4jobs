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

  async create(user: Omit<User, "id">): Promise<User> {
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
        { $addToSet: { appliedJobs: jobPostId } }, // Add jobPostId to appliedJobs array if not already present
        { new: true }
    ).lean();
    
    console.log("updated user applied job 11111111111111111111",updatedUser)
    return updatedUser ? this.mapToUser(updatedUser) : null;
}


  private mapToUser(doc: any): User {
    return {
      id: doc._id.toString(),
      email: doc.email,
      password: doc.password,
      name: doc.name,
      role: doc.role,
      isAdmin: doc.isAdmin,
      phone:doc.phone,
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
