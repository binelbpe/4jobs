import { injectable } from "inversify";
import { IResumeRepository } from "../../../../domain/interfaces/repositories/user/IResumeRepository";
import { Resume } from "../../../../domain/entities/Resume";
import { ResumeModel } from "../models/ResumeModel";

@injectable()
export class MongoResumeRepository implements IResumeRepository {
  async create(userId: string, resumeUrl: string): Promise<Resume> {
    const resume = await ResumeModel.create({ user: userId, resumeUrl });
    return this.mapToEntity(resume);
  }

  async findByUserId(userId: string): Promise<Resume | null> {
    const resume = await ResumeModel.findOne({ user: userId }).populate('user');
    return resume ? this.mapToEntity(resume) : null;
  }

  async update(id: string, resumeUrl: string): Promise<Resume> {
    const resume = await ResumeModel.findByIdAndUpdate(
      id,
      { resumeUrl, updatedAt: new Date() },
      { new: true }
    ).populate('user');
    if (!resume) {
      throw new Error("Resume not found");
    }
    return this.mapToEntity(resume);
  }

  private mapToEntity(resumeDoc: any): Resume {
    return new Resume(
      resumeDoc._id.toString(),
      resumeDoc.user,
      resumeDoc.resumeUrl,
      resumeDoc.createdAt,
      resumeDoc.updatedAt
    );
  }
}
