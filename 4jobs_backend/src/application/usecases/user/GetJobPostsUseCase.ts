import { injectable, inject } from "inversify";
import TYPES from "../../../types";
import { IJobPostUserRepository } from "../../../domain/interfaces/repositories/user/IJobPostUserRepository";

@injectable()
export class GetJobPostsUseCase {
  constructor(
    @inject(TYPES.IJobPostUserRepository)
    private jobPostRepository: IJobPostUserRepository
  ) {}

  async execute(page: number, limit: number, sortBy: string, sortOrder: string, filter: any) {
    return await this.jobPostRepository.findAll(page, limit, sortBy, sortOrder, filter);
  }
}
