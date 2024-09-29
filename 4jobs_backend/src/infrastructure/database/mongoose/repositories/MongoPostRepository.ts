import { injectable, inject } from 'inversify';
import { IPostRepository } from '../../../../domain/interfaces/repositories/user/IPostRepository';
import { IPost, CreatePostDTO } from '../../../../domain/entities/Post';
import PostModel from '../models/PostModel';
import { S3Service } from '../../../services/S3Service';
import TYPES from '../../../../types';

@injectable()
export class MongoPostRepository implements IPostRepository {
  constructor(
    @inject(TYPES.S3Service) private s3Service: S3Service
  ) {}

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
      comments: []
    });

    await post.save();

    return post.toObject();
  }

  async findAll(page: number, limit: number): Promise<IPost[]> {
    const skip = (page - 1) * limit;
    const posts = await PostModel.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    return posts.map(post => post.toObject());
  }
  // Implement other methods for future expansion
}


