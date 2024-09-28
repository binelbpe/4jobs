import { IPostRepository } from '../../../../domain/interfaces/repositories/user/IPostRepository';
import { Post } from '../../../../domain/entities/Post';

export class SharePostUseCase {
  constructor(private postRepository: IPostRepository) {}

  async execute(id: string): Promise<Post | null> {
    return this.postRepository.share(id);
  }
}