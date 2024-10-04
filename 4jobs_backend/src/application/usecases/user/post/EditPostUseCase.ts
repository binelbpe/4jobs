import { inject, injectable } from 'inversify';
import TYPES from '../../../../types';
import { IPostRepository } from '../../../../domain/interfaces/repositories/user/IPostRepository';
import { IPost } from '../../../../domain/entities/Post';

@injectable()
export class EditPostUseCase implements EditPostUseCase {
  constructor(
    @inject(TYPES.IPostRepository) private postRepository: IPostRepository
  ) {}


  async editPost(postId: string, userId: string, updatedPostData: Partial<IPost>): Promise<IPost> {
    return this.postRepository.editPost(postId, userId, updatedPostData);
  }
}