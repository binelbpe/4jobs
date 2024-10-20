import { Resume } from "../../../entities/Resume";
import { ResumeData } from "../../../../domain/entities/resumeTypes";

export interface IResumeRepository {
  create(userId: string, resumeUrl: string): Promise<Resume>;
  findByUserId(userId: string): Promise<Resume | null>;
  update(id: string, resumeUrl: string): Promise<Resume>;
}
