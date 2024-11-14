import { JobPost } from "../../../entities/jobPostTypes";
import { AdvancedSearchFilters, AdvancedSearchResult } from "../../../entities/AdvancedSearchTypes";

export interface IJobPostUserRepository {
  findAll(
    page: number,
    limit: number,
    sortBy: string,
    sortOrder: string,
    filter: any
  ): Promise<{ jobPosts: JobPost[]; totalPages: number; totalCount: number }>;

  findById(id: string): Promise<JobPost | null>;

  update(id: string, userId: string): Promise<JobPost | null>;
  
  reportJob(userId: string, jobId: string, reason: string): Promise<JobPost | null>;
 
  advancedSearch(
    filters: AdvancedSearchFilters,
    page: number,
    limit: number
  ): Promise<AdvancedSearchResult>;
}
