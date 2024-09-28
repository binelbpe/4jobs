import { IPostRepository } from '../../../../domain/interfaces/repositories/user/IPostRepository';
import { Post } from '../../../../domain/entities/Post';

export class LikePostUseCase {
  constructor(private postRepository: IPostRepository) {}

  async execute(id: string): Promise<Post | null> {
    return this.postRepository.like(id);
  }
}