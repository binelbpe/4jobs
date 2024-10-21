import { User } from "../../../entities/User";

export interface IUserRepository {
  findByUserId(userId: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: Omit<User, "id">): Promise<User>;
  updateAppliedJobs(id: string, jobPostId:string): Promise<User | null>;
  update(id: string, user: Partial<User>): Promise<User | null>;
  searchUsers(query: string, userIds: string[]): Promise<User[]>;
  findUsersByIds(userIds: string[]): Promise<User[]>;
  updatePassword(id: string, newPassword: string): Promise<void>;
}
