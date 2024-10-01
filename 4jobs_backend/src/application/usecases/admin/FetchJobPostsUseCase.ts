import { injectable, inject } from "inversify";
import { IJobPostAdminRepository } from "../../../domain/interfaces/repositories/admin/IJobPostRepositoryAdmin";
import TYPES from "../../../types";

@injectable()
export class FetchJobPostsUseCase {
  constructor(
    @inject(TYPES.IJobPostAdminRepository) private IJobPostAdminRepository: IJobPostAdminRepository
  ) {}

  async execute() {
    return this.IJobPostAdminRepository.findAll();
  }
}
