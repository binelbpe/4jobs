import { IPost, CreatePostDTO } from '../../../entities/Post';

export interface IPostRepository {
  create(postData: CreatePostDTO): Promise<IPost>;
  // findById(id: string): Promise<Post | null>;
  findAll(): Promise<IPost[]>;
  // findByUserId(userId: string): Promise<Post[]>;
  // update(id: string, post: Partial<Post>): Promise<Post | null>;
  // delete(id: string): Promise<boolean>;
  // addLike(postId: string, userId: string): Promise<Post | null>;
  // removeLike(postId: string, userId: string): Promise<Post | null>;
  // addComment(postId: string, comment: { userId: string; content: string }): Promise<Post | null>;
  // removeComment(postId: string, commentId: string): Promise<Post | null>;
}