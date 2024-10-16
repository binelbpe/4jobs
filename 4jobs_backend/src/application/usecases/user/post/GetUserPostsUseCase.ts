import { inject, injectable } from 'inversify';
import { IPostRepository } from '../../../../domain/interfaces/repositories/user/IPostRepository';
import { IPost } from '../../../../domain/entities/Post';
import  TYPES  from '../../../../types';

@injectable()
export class GetUserPostsUseCase {
  constructor(
    @inject(TYPES.IPostRepository) private postRepository: IPostRepository
  ) {}

  async findByUserIdPosts(userId: string, page: number, limit: number): Promise<{ posts: IPost[], totalPages: number, currentPage: number }> {
    return this.postRepository.findByUserId(userId, page, limit);
  }
}
