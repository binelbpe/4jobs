import { IPost, CreatePostDTO } from '../../../entities/Post';

export interface IPostRepository {
  create(postData: CreatePostDTO): Promise<IPost>;
  // findById(id: string): Promise<Post | null>;
  findAll(page: number, limit: number): Promise<{ posts: IPost[], totalPages: number, currentPage: number }>;
  findByUserId(userId: string, page: number, limit: number): Promise<{ posts: IPost[], totalPages: number, currentPage: number }>;
  // update(id: string, post: Partial<Post>): Promise<Post | null>;
  deletePost(id: string): Promise<boolean>;
  editPost(postId: string, userId: string, updatedPostData: Partial<IPost>): Promise<IPost>;
  // addLike(postId: string, userId: string): Promise<Post | null>;
  // removeLike(postId: string, userId: string): Promise<Post | null>;
  // addComment(postId: string, comment: { userId: string; content: string }): Promise<Post | null>;
  // removeComment(postId: string, commentId: string): Promise<Post | null>;
  toggleBlockStatus(postId: string): Promise<IPost>;
}
