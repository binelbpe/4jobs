import { JobPost } from "./jobPostTypes";

export interface AdvancedSearchFilters {
  title?: string;
  company?: string;
  location?: string;
  skills?: string[];
  salaryMin?: number;
  salaryMax?: number;
  wayOfWork?: string;
}

export interface JobPostWithMatch extends Omit<JobPost, '_id'> {
  _id?: string;
  matchPercentage: number;
}

export interface AdvancedSearchResult {
  exactMatches: JobPostWithMatch[];
  similarMatches: JobPostWithMatch[];
  totalPages: number;
  currentPage: number;
  totalExactCount: number;
  totalSimilarCount: number;
}
