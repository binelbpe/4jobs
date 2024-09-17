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
    createdAt?: Date;
    updatedAt?: Date;
  }): Promise<IRecruiter>;

  findRecruiterByEmail(email: string): Promise<IRecruiter | null>;
  findByEmail(email: string): Promise<IRecruiter | null>;
  save(recruiter: IRecruiter): Promise<IRecruiter>;
}
