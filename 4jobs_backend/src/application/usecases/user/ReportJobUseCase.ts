import { injectable, inject } from "inversify";
import TYPES from "../../../types";
import { IJobPostUserRepository } from "../../../domain/interfaces/repositories/user/IJobPostUserRepository";

@injectable()
export class ReportJobUseCase {
  constructor(
    @inject(TYPES.IJobPostUserRepository)
    private jobPostRepository: IJobPostUserRepository
  ) {}

  async execute(userId: string, jobId: string): Promise<void> {
    const result = await this.jobPostRepository.reportJob(userId, jobId);
    if (!result) {
      throw new Error("Failed to report job");
    }
  }
}