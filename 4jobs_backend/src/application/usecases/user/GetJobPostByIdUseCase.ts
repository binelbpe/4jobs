import { injectable, inject } from "inversify";
import TYPES from "../../../types";
import { IJobPostUserRepository } from "../../../domain/interfaces/repositories/user/IJobPostUserRepository";

@injectable()
export class GetJobPostByIdUseCase {
  constructor(
    @inject(TYPES.IJobPostUserRepository)
    private jobPostRepository: IJobPostUserRepository
  ) {}

  async execute(jobPostId: string) {
    return await this.jobPostRepository.findById(jobPostId);
  }
}
