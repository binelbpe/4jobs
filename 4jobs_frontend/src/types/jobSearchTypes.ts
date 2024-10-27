import { BasicJobPost } from './jobPostTypes';
import { WorkType } from '../constants/jobConstants';

export interface JobSearchFilters {
  title?: string;
  company?: string;
  location?: string;
  skills?: string[];
  salaryMin?: number;
  salaryMax?: number;
  wayOfWork?: WorkType;
}

export interface JobSearchState {
  filters: JobSearchFilters;
  exactMatches: BasicJobPost[];
  similarMatches: BasicJobPost[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  totalExactCount: number;
  totalSimilarCount: number;
}
