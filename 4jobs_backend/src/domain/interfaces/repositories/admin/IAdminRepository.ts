import { User } from "../../../entities/User";

import { IRecruiter } from "../../../entities/Recruiter";

export interface IAdminRepository {
  findAllUsers(): Promise<User[]>;
  blockUserById(id: string): Promise<User | null>;
  unBlockUserById(id: string): Promise<User | null>;
  save(recruiter: IRecruiter): Promise<IRecruiter>;
  findRecruiters(): Promise<IRecruiter[]>;
  findById(id: string): Promise<IRecruiter | null>;
  getUserCount(): Promise<number>;
  getRecruiterCount(): Promise<number>;
  getCompanyCount(): Promise<number>;
  getTotalRevenue(): Promise<number>;
  getMonthlyRevenue(): Promise<{ month: string; amount: number }[]>;
  getJobPostCount(): Promise<number>;
  getUserPostCount(): Promise<number>;
  getSubscriptions(
    page: number,
    limit: number
  ): Promise<{
    subscriptions: IRecruiter[];
    totalPages: number;
    currentPage: number;
  }>;
  cancelSubscription(recruiterId: string): Promise<IRecruiter | null>;
}
