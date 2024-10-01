import { injectable, inject } from "inversify";
import { IJobPostAdminRepository } from "../../../domain/interfaces/repositories/admin/IJobPostRepositoryAdmin";
import TYPES from "../../../types";

@injectable()
export class UnblockJobPostUseCase {
  constructor(
    @inject(TYPES.IJobPostAdminRepository) private IJobPostAdminRepository: IJobPostAdminRepository
  ) {}

  async execute(postId: string) {
    return this.IJobPostAdminRepository.unblockJobPost(postId);
  }
}