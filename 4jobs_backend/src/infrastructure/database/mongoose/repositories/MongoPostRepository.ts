// src/infrastructure/mongodb/repositories/MongoPostRepository.ts

import { IPostRepository } from '../../../domain/repositories/IPostRepository';
import { Post } from '../../../domain/entities/Post';
import PostModel, { PostDocument } from '../models/PostModel';

export class MongoPostRepository implements IPostRepository {
  async findAll(): Promise<Post[]> {
    const posts = await PostModel.find().sort({ createdAt: -1 });
    return posts.map(this.toPost);
  }

  async findById(id: string): Promise<Post | null> {
    const post = await PostModel.findById(id);
    return post ? this.toPost(post) : null;
  }

  async create(postData: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>): Promise<Post> {
    const post = new PostModel(postData);
    await post.save();
    return this.toPost(post);
  }

  async update(id: string, postData: Partial<Post>): Promise<Post | null> {
    const post = await PostModel.findByIdAndUpdate(id, postData, { new: true });
    return post ? this.toPost(post) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await PostModel.findByIdAndDelete(id);
    return !!result;
  }

  async like(id: string): Promise<Post | null> {
    const post = await PostModel.findByIdAndUpdate(id, { $inc: { likes: 1 } }, { new: true });
    return post ? this.toPost(post) : null;
  }

  async addComment(id: string, comment: string): Promise<Post | null> {
    const post = await PostModel.findByIdAndUpdate(id, { $push: { comments: comment } }, { new: true });
    return post ? this.toPost(post) : null;
  }

  async share(id: string): Promise<Post | null> {
    const post = await PostModel.findByIdAndUpdate(id, { $inc: { shares: 1 } }, { new: true });
    return post ? this.toPost(post) : null;
  }

  private toPost(doc: PostDocument): Post {
    return {
      id: doc._id.toString(),
      author: doc.author,
      content: doc.content,
      likes: doc.likes,
      comments: doc.comments,
      shares: doc.shares,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}