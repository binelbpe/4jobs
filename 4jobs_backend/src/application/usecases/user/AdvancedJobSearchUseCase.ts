import { injectable, inject } from "inversify";
import TYPES from "../../../types";
import { IJobPostUserRepository } from "../../../domain/interfaces/repositories/user/IJobPostUserRepository";
import { AdvancedSearchFilters, AdvancedSearchResult } from "../../../domain/entities/AdvancedSearchTypes";

@injectable()
export class AdvancedJobSearchUseCase {
  constructor(
    @inject(TYPES.IJobPostUserRepository)
    private jobPostRepository: IJobPostUserRepository
  ) {}

  async execute(
    filters: AdvancedSearchFilters,
    page: number = 1,
    limit: number = 10
  ): Promise<AdvancedSearchResult> {
    try {
      return await this.jobPostRepository.advancedSearch(filters, page, limit);
    } catch (error) {
      throw new Error("Failed to perform advanced job search");
    }
  }
}
