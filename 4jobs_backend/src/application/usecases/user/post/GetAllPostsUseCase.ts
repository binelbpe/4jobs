import { IPostRepository } from '../../../../domain/interfaces/repositories/user/IPostRepository';
import { Post } from '../../../../domain/entities/Post';

export class GetAllPostsUseCase {
  constructor(private postRepository: IPostRepository) {}

  async execute(): Promise<Post[]> {
    return this.postRepository.findAll();
  }
}