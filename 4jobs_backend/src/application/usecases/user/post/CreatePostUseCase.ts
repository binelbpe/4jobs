// src/domain/usecases/CreatePostUseCase.ts

import { injectable, inject } from 'inversify';
import { IPostRepository } from '../../../../domain/interfaces/repositories/user/IPostRepository';
import { CreatePostDTO, IPost } from '../../../../domain/entities/Post';
import  TYPES  from '../../../../types';

@injectable()
export class CreatePostUseCase {
  constructor(
    @inject(TYPES.IPostRepository) private postRepository: IPostRepository
  ) {}

  async execute(postData: CreatePostDTO): Promise<IPost> {
    return this.postRepository.create(postData);
  }
}