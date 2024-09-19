import { IRecruiter } from '../../../types/recruiter';

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
  }): Promise<IRecruiter>;

  findRecruiterByEmail(email: string): Promise<IRecruiter | null>;
  findByEmail(email: string): Promise<IRecruiter | null>;
  save(recruiter: IRecruiter): Promise<IRecruiter>;
  findRecruiters(): Promise<IRecruiter[]>;
  findById(id: string): Promise<IRecruiter | null>;
}
