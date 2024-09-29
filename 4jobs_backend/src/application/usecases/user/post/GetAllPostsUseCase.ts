import { injectable, inject } from 'inversify';
import { IPost } from '../../../../domain/entities/Post';
import { IPostRepository } from '../../../../domain/interfaces/repositories/user/IPostRepository';
import TYPES from '../../../../types';

@injectable()
export class GetAllPostsUseCase {
  constructor(
    @inject(TYPES.IPostRepository) private postRepository: IPostRepository
  ) {}

  async execute(): Promise<IPost[]> {
    return this.postRepository.findAll();
  }
}