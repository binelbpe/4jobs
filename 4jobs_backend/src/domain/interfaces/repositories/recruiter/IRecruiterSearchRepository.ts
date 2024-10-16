import { UserSearchResult } from '../../../entities/UserSearchResult';

export interface IRecruiterSearchRepository {
  searchUsers(query: string): Promise<UserSearchResult[]>;
}
