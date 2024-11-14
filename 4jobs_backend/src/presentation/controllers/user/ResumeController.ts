import { Request, Response } from "express";
import { injectable, inject } from "inversify";
import TYPES from "../../../types";
import { GenerateResumeUseCase } from "../../../application/usecases/user/GenerateResumeUseCase";
import { ResumeData } from "../../../domain/entities/resumeTypes";

@injectable()
export class ResumeController {
  constructor(
    @inject(TYPES.GenerateResumeUseCase) private generateResumeUseCase: GenerateResumeUseCase
  ) {}

  async generateResume(req: Request, res: Response): Promise<void> {
    try {
      const resumeData: ResumeData = req.body;

      if (!resumeData.userId) {
        res.status(400).json({ error: "User ID is required" });
        return;
      }

      const pdfBuffer = await this.generateResumeUseCase.execute(resumeData);
      const base64Pdf = pdfBuffer.toString('base64');
      res.json({ pdfData: base64Pdf });
    } catch (error) {
      console.error("Error generating resume:", error);
      res.status(500).json({ error: "Failed to generate resume" });
    }
  }
}
