import { IRecruiter } from "../../../../domain/entities/Recruiter";
import { IRecruiterRepository } from "../../../../domain/interfaces/repositories/recruiter/IRecruiterRepository";
import Recruiter from "../models/RecruiterModel";
import { injectable } from "inversify";

@injectable()
export class MongoRecruiterRepository implements IRecruiterRepository {
  private mapToIRecruiter(doc: any): IRecruiter {
    return {
      id: doc._id.toString(),
      email: doc.email,
      password: doc.password,
      companyName: doc.companyName,
      phone: doc.phone,
      name: doc.name,
      role: doc.role,
      isApproved: doc.isApproved,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      governmentId: doc.governmentId,
      employeeId: doc.employeeId,
      location: doc.location,
      employeeIdImage: doc.employeeIdImage,
      subscribed: doc.subscribed,
      planDuration: doc.planDuration,
      expiryDate: doc.expiryDate,
      subscriptionAmount: doc.subscriptionAmount,
      subscriptionStartDate: doc.subscriptionStartDate, 
    };
  }

  async create(recruiterData: any): Promise<IRecruiter> {
    const recruiter = new Recruiter(recruiterData);
    const savedRecruiter = await recruiter.save();
    return this.mapToIRecruiter(savedRecruiter);
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
    const updatedRecruiter = await Recruiter.findByIdAndUpdate(
      recruiter.id,
      recruiter,
      { new: true }
    ).exec();
    return this.mapToIRecruiter(updatedRecruiter);
  }

  async findRecruiters(): Promise<IRecruiter[]> {
    const recruiters = await Recruiter.find().exec();
    return recruiters.map(this.mapToIRecruiter);
  }

  async updateRecruiter(
    id: string,
    updates: Partial<IRecruiter>
  ): Promise<IRecruiter | null> {
    if (updates.location === undefined) {
      throw new Error("Location is required for updating the profile");
    }

    const updatedRecruiter = await Recruiter.findByIdAndUpdate(id, updates, {
      new: true,
    }).exec();
    return updatedRecruiter as IRecruiter | null;
  }

  async findRecruiterById(id: string): Promise<IRecruiter | null> {
    const recruiter = await Recruiter.findById(id).exec();
    return recruiter as IRecruiter | null;
  }

  async updateSubscription(
    id: string,
    subscriptionData: {
      subscribed: boolean;
      planDuration: string;
      expiryDate: Date;
      subscriptionAmount: number;
      subscriptionStartDate: Date;
    }
  ): Promise<IRecruiter | null> {
    const updatedRecruiter = await Recruiter.findByIdAndUpdate(
      id,
      { $set: subscriptionData },
      { new: true }
    ).exec();
    return updatedRecruiter ? this.mapToIRecruiter(updatedRecruiter) : null;
  }
}
