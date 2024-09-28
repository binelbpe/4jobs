// src/presentation/controllers/PostController.ts

import { Request, Response } from 'express';
import { GetAllPostsUseCase } from '../../domain/usecases/post/GetAllPostsUseCase';
import { CreatePostUseCase } from '../../domain/usecases/post/CreatePostUseCase';
import { LikePostUseCase } from '../../domain/usecases/post/LikePostUseCase';
import { CommentOnPostUseCase } from '../../domain/usecases/post/CommentOnPostUseCase';
import { SharePostUseCase } from '../../domain/usecases/post/SharePostUseCase';

export class PostController {
  constructor(
    private getAllPostsUseCase: GetAllPostsUseCase,
    private createPostUseCase: CreatePostUseCase,
    private likePostUseCase: LikePostUseCase,
    private commentOnPostUseCase: CommentOnPostUseCase,
    private sharePostUseCase: SharePostUseCase
  ) {}

  getAllPosts = async (req: Request, res: Response): Promise<void> => {
    try {
      const posts = await this.getAllPostsUseCase.execute();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  createPost = async (req: Request, res: Response): Promise<void> => {
    try {
      const { author, content } = req.body;
      const post = await this.createPostUseCase.execute({ author, content });
      res.status(201).json(post);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  likePost = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const post = await this.likePostUseCase.execute(id);
      if (post) {
        res.json(post);
      } else {
        res.status(404).json({ error: 'Post not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  commentOnPost = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { comment } = req.body;
      const post = await this.commentOnPostUseCase.execute(id, comment);
      if (post) {
        res.json(post);
      } else {
        res.status(404).json({ error: 'Post not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  sharePost = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const post = await this.sharePostUseCase.execute(id);
      if (post) {
        res.json(post);
      } else {
        res.status(404).json({ error: 'Post not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}