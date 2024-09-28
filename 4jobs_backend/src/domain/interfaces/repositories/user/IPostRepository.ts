// src/domain/repositories/IPostRepository.ts

import { Post } from '../../../../domain/entities/Post';

export interface IPostRepository {
  findAll(): Promise<Post[]>;
  findById(id: string): Promise<Post | null>;
  create(post: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>): Promise<Post>;
  update(id: string, post: Partial<Post>): Promise<Post | null>;
  delete(id: string): Promise<boolean>;
  like(id: string): Promise<Post | null>;
  addComment(id: string, comment: string): Promise<Post | null>;
  share(id: string): Promise<Post | null>;
}