import { inject, injectable } from 'inversify';
import { IPostRepository } from '../../../../domain/interfaces/repositories/user/IPostRepository';
import  TYPES  from '../../../../types';

@injectable()
export class DeletePostUseCase {
  constructor(
    @inject(TYPES.IPostRepository) private postRepository: IPostRepository
  ) {}

  async execute(postId: string): Promise<boolean> {
    return this.postRepository.deletePost(postId);
  }
}