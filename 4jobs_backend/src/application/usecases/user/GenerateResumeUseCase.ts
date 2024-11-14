import { injectable, inject } from "inversify";
import TYPES from "../../../types";
import { IResumeRepository } from "../../../domain/interfaces/repositories/user/IResumeRepository";
import { IUserRepository } from "../../../domain/interfaces/repositories/user/IUserRepository";
import { ResumeData } from "../../../domain/entities/resumeTypes";
import { generatePDF } from "../../../infrastructure/services/PDFGeneratorService";

@injectable()
export class GenerateResumeUseCase {
  constructor(
    @inject(TYPES.IResumeRepository) private resumeRepository: IResumeRepository,
    @inject(TYPES.IUserRepository) private userRepository: IUserRepository
  ) {}

  async execute( resumeData: ResumeData): Promise<Buffer> {
    const userId=resumeData.userId
    if (!userId) {
      throw new Error("User ID is required");
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error(`User not found with ID: ${userId}`);
    }

    const pdfBuffer = await generatePDF(resumeData);


    return pdfBuffer;
  }
}
