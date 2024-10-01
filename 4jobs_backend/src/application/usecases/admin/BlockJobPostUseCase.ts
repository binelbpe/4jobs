import { injectable, inject } from "inversify";
import { IJobPostAdminRepository } from "../../../domain/interfaces/repositories/admin/IJobPostRepositoryAdmin";
import TYPES from "../../../types";

@injectable()
export class BlockJobPostUseCase {
  constructor(
    @inject(TYPES.IJobPostAdminRepository) private IJobPostAdminRepository: IJobPostAdminRepository
  ) {}

  async execute(postId: string) {
    return this.IJobPostAdminRepository.blockJobPost(postId);
  }
}