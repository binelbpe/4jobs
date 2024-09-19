import { IRecruiter } from '../../../../types/recruiter';
import { IRecruiterRepository } from '../../../../domain/interfaces/repositories/IRecruiterRepository';
import Recruiter from '../models/RecruiterModel';
import { injectable } from 'inversify';

@injectable()
export class MongoRecruiterRepository implements IRecruiterRepository {
  async create(recruiterData: {
    email: string;
    password: string;
    companyName: string;
    phone: string;
    name: string;
    role: string;
    isApproved: boolean;
    governmentId: string;
    createdAt?: Date;
    updatedAt?: Date;
    
  }): Promise<IRecruiter> {
    const recruiter = new Recruiter(recruiterData);
    return recruiter.save() as Promise<IRecruiter>;
  }

  async findRecruiterByEmail(email: string): Promise<IRecruiter | null> {
    const recruiter = await Recruiter.findOne({ email }).exec();
    return recruiter as IRecruiter | null;
  }

  async findByEmail(email: string): Promise<IRecruiter | null> {
    return this.findRecruiterByEmail(email);
  }

  async findById(id: string): Promise<IRecruiter | null> {
    const recruiter = await Recruiter.findById(id).exec();
    return recruiter as IRecruiter | null;
  }

  async save(recruiter: IRecruiter): Promise<IRecruiter> {
    const updatedRecruiter = await Recruiter.findByIdAndUpdate(recruiter.id, recruiter, { new: true }).exec();
    return updatedRecruiter as IRecruiter;
  }

  async findRecruiters(): Promise<IRecruiter[]> {
    const recruiters = await Recruiter.find().exec();
    return recruiters as IRecruiter[];
  }
}