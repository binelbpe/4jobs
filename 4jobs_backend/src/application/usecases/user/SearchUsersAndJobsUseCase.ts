import { injectable, inject } from 'inversify';
import { ISearchRepository } from '../../../domain/interfaces/repositories/user/ISearchRepository';
import TYPES from '../../../types';

@injectable()
export class SearchUsersAndJobsUseCase {
  constructor(
    @inject(TYPES.ISearchRepository) private searchRepository: ISearchRepository
  ) {}

  async execute(query: string, userId: string) {
    return this.searchRepository.searchUsersAndJobs(query, userId);
  }
}
