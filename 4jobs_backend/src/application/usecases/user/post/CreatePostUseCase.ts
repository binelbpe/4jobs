import { IPostRepository } from '../../../../domain/interfaces/repositories/user/IPostRepository';
import { Post } from '../../../../domain/entities/Post';

export class CreatePostUseCase {
  constructor(private postRepository: IPostRepository) {}

  async execute(post: Omit<Post, 'id' | 'likes' | 'comments' | 'shares' | 'createdAt' | 'updatedAt'>): Promise<Post> {
    return this.postRepository.create({
      ...post,
      likes: 0,
      comments: [],
      shares: 0,
    });
  }
}