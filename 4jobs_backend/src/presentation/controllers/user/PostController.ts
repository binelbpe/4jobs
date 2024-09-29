import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { CreatePostUseCase } from '../../../application/usecases/user/post/CreatePostUseCase';
import { GetAllPostsUseCase } from '../../../application/usecases/user/post/GetAllPostsUseCase';
import TYPES from '../../../types';

@injectable()
export class PostController {
  constructor(
    @inject(TYPES.CreatePostUseCase) private createPostUseCase: CreatePostUseCase,
    @inject(TYPES.GetAllPostsUseCase) private getAllPostsUseCase: GetAllPostsUseCase
  ) {}

  async createPost(req: Request, res: Response): Promise<void> {
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);
    console.log('Request params:', req.params);
  
    try {
      const { userId } = req.params;
      const { content } = req.body;
      const image = req.files?.['image']?.[0];
      const video = req.files?.['video']?.[0];
  
      // Log the extracted data
      console.log('Extracted data:', { userId, content, image, video });
  
      const post = await this.createPostUseCase.execute({ userId, content, image, video });
      res.status(201).json(post);
    } catch (error) {
      console.error('Error creating post:', error);
      res.status(500).json({ error: 'An error occurred while creating the post' });
    }
  }

  async getPosts(req: Request, res: Response): Promise<void> {
    try {
      console.log("fetching")
      const posts = await this.getAllPostsUseCase.execute();
      res.status(200).json(posts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      res.status(500).json({ error: 'An error occurred while fetching posts' });
    }
  }

  // Implement other controller methods for future expansion
}