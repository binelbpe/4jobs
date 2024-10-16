import { injectable, inject } from 'inversify';
import { IRecruiterSearchRepository } from '../../../domain/interfaces/repositories/recruiter/IRecruiterSearchRepository';
import { UserSearchResult } from '../../../domain/entities/UserSearchResult';
import TYPES from '../../../types';

@injectable()
export class SearchUsersUseCase {
  constructor(
    @inject(TYPES.IRecruiterSearchRepository) private searchRepository: IRecruiterSearchRepository
  ) {}

  async execute(query: string): Promise<UserSearchResult[]> {
    return this.searchRepository.searchUsers(query);
  }
}
