import { IPost, CreatePostDTO } from '../../../entities/Post';

export interface IPostRepository {
  create(postData: CreatePostDTO): Promise<IPost>;
  findAll(page: number, limit: number): Promise<{ posts: IPost[], totalPages: number, currentPage: number }>;
  findAllAdmin(page: number, limit: number): Promise<{ posts: IPost[], totalPages: number, currentPage: number }>;
  findByUserId(userId: string, page: number, limit: number): Promise<{ posts: IPost[], totalPages: number, currentPage: number }>;
  deletePost(id: string): Promise<boolean>;
  editPost(postId: string, userId: string, updatedPostData: Partial<IPost>): Promise<IPost>;
  toggleBlockStatus(postId: string): Promise<IPost>;
  addLike(postId: string, userId: string): Promise<IPost | null>;
  removeLike(postId: string, userId: string): Promise<IPost | null>;
  addComment(postId: string, comment: { userId: string; content: string }): Promise<IPost | null>;
  deleteComment(postId: string, commentId: string): Promise<IPost | null>;
}
