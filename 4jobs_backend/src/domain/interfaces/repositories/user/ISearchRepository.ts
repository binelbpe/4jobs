import { User } from '../../../entities/User';
import { JobPost } from '../../../entities/jobPostTypes';

export interface ISearchRepository {
  searchUsersAndJobs(query: string, userId: string): Promise<{ users: Partial<User>[], jobPosts: JobPost[] }>;
}
