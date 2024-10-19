import { inject, injectable } from 'inversify';
import { IPostRepository } from '../../../../domain/interfaces/repositories/user/IPostRepository';
import { IPost } from '../../../../domain/entities/Post';
import TYPES from '../../../../types';

@injectable()
export class DislikePostUseCase {
  constructor(
    @inject(TYPES.PostRepository) private postRepository: IPostRepository
  ) {}

  async execute(postId: string, userId: string): Promise<IPost | null> {
    return this.postRepository.removeLike(postId, userId);
  }
}
