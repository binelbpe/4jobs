import { inject, injectable } from 'inversify';
import TYPES from '../../../types';
import { IPostRepository } from '../../../domain/interfaces/repositories/user/IPostRepository';

@injectable()
export class ToggleUserPostBlockUseCase {
  constructor(
    @inject(TYPES.IPostRepository) private postRepository: IPostRepository
  ) {}

  async execute(postId: string) {
    return this.postRepository.toggleBlockStatus(postId);
  }
}
