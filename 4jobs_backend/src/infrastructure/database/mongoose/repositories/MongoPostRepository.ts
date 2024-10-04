import { injectable, inject } from "inversify";
import { IPostRepository } from "../../../../domain/interfaces/repositories/user/IPostRepository";
import { IPost, CreatePostDTO } from "../../../../domain/entities/Post";
import PostModel from "../models/PostModel";
import { S3Service } from "../../../services/S3Service";
import TYPES from "../../../../types";

@injectable()
export class MongoPostRepository implements IPostRepository {
  constructor(@inject(TYPES.S3Service) private s3Service: S3Service) {}

  async create(postData: CreatePostDTO): Promise<IPost> {
    const { userId, content, image, video } = postData;

    let imageUrl, videoUrl;

    if (image) {
      imageUrl = await this.s3Service.uploadFile(image);
    }

    if (video) {
      videoUrl = await this.s3Service.uploadFile(video);
    }

    const post = new PostModel({
      userId,
      content,
      imageUrl,
      videoUrl,
      likes: [],
      comments: [],
    });

    await post.save();
    return this.populateUserInfo(post);
  }

  async findAll(page: number, limit: number): Promise<IPost[]> {
    const skip = (page - 1) * limit;
    const posts = await PostModel.find()
      .populate('userId', 'name profileImage bio')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return posts.map(post => this.populateUserInfo(post));
  }

  async findByUserId(userId: string, page: number, limit: number): Promise<IPost[]> {
    const skip = (page - 1) * limit;
    const posts = await PostModel.find({ userId })
      .populate('userId', 'name profileImage bio')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return posts.map(post => this.populateUserInfo(post));
  }

  async deletePost(id: string): Promise<boolean> {
    const deletedPost = await PostModel.findByIdAndDelete(id);
    return !!deletedPost;
  }

  async editPost(postId: string, userId: string, updatedPostData: Partial<IPost>): Promise<IPost> {
    const post = await PostModel.findOne({ _id: postId, userId })
      .populate('userId', 'name profileImage bio');

    if (!post) {
      throw new Error('Post not found or user not authorized to edit this post');
    }

    Object.assign(post, updatedPostData);
    await post.save();
    
    return this.populateUserInfo(post);
  }

  private populateUserInfo(post: any): IPost {
    const postObj = post.toObject();
    return {
      ...postObj,
      user: post.userId ? {
        name: post.userId.name,
        profileImage: post.userId.profileImage,
        bio: post.userId.bio,
      } : undefined,
    };
  }
}