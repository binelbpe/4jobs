import { IRecruiter } from "../../../entities/Recruiter";

export interface IRecruiterRepository {
  create(recruiterData: {
    email: string;
    password: string;
    companyName: string;
    phone: string;
    name: string;
    role: string;
    isApproved: boolean;
    governmentId?: string;
    location?: string;
    employeeId?: string;
    employeeIdImage?: string;
  }): Promise<IRecruiter>;

  findRecruiterByEmail(email: string): Promise<IRecruiter | null>;
  findByEmail(email: string): Promise<IRecruiter | null>;
  save(recruiter: IRecruiter): Promise<IRecruiter>;
  findRecruiters(): Promise<IRecruiter[]>;
  findById(id: string): Promise<IRecruiter | null>;
  findRecruiterById(id: string): Promise<IRecruiter | null>;
  updateRecruiter(
    id: string,
    updates: Partial<IRecruiter>
  ): Promise<IRecruiter | null>;
  updateSubscription(
    id: string,
    subscriptionData: {
      subscribed: boolean;
      planDuration: string;
      expiryDate: Date;
      subscriptionAmount: number;
      subscriptionStartDate: Date; // Add this new field
    }
  ): Promise<IRecruiter | null>;
}
