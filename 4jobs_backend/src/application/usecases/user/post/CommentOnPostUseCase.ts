import { IPostRepository } from '../../../../domain/interfaces/repositories/user/IPostRepository';
import { Post } from '../../../../domain/entities/Post';

export class CommentOnPostUseCase {
  constructor(private postRepository: IPostRepository) {}

  async execute(id: string, comment: string): Promise<Post | null> {
    return this.postRepository.addComment(id, comment);
  }
}