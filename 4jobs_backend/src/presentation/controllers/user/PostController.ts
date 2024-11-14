import { injectable, inject } from "inversify";
import { Request, Response } from "express";
import { CreatePostUseCase } from "../../../application/usecases/user/post/CreatePostUseCase";
import { GetAllPostsUseCase } from "../../../application/usecases/user/post/GetAllPostsUseCase";
import { GetUserPostsUseCase } from "../../../application/usecases/user/post/GetUserPostsUseCase";
import { DeletePostUseCase } from "../../../application/usecases/user/post/DeletePostUseCase";
import { EditPostUseCase } from "../../../application/usecases/user/post/EditPostUseCase";
import { LikePostUseCase } from "../../../application/usecases/user/post/LikePostUseCase";
import { DislikePostUseCase } from "../../../application/usecases/user/post/DislikePostUseCase";
import { CommentOnPostUseCase } from "../../../application/usecases/user/post/CommentOnPostUseCase";
import TYPES from "../../../types";

@injectable()
export class PostController {
  constructor(
    @inject(TYPES.CreatePostUseCase)
    private createPostUseCase: CreatePostUseCase,
    @inject(TYPES.GetAllPostsUseCase)
    private getAllPostsUseCase: GetAllPostsUseCase,
    @inject(TYPES.GetUserPostsUseCase)
    private getUserPostsUseCase: GetUserPostsUseCase,
    @inject(TYPES.DeletePostUseCase)
    private deletePostUseCase: DeletePostUseCase,
    @inject(TYPES.EditPostUseCase)
    private EditPostUseCase: EditPostUseCase,
    @inject(TYPES.LikePostUseCase)
    private likePostUseCase: LikePostUseCase,
    @inject(TYPES.DislikePostUseCase)
    private dislikePostUseCase: DislikePostUseCase,
    @inject(TYPES.CommentOnPostUseCase)
    private commentOnPostUseCase: CommentOnPostUseCase
  ) {}

  async createPost(req: Request, res: Response): Promise<void> {

    try {
      const { userId } = req.params;
      const { content } = req.body;
      const image = req.files?.["image"]?.[0];
      const video = req.files?.["video"]?.[0];


      const post = await this.createPostUseCase.execute({
        userId,
        content,
        image,
        video,
      });
      res.status(201).json(post);
    } catch (error) {
      console.error("Error creating post:", error);
      res
        .status(500)
        .json({ error: "An error occurred while creating the post" });
    }
  }

  async getPosts(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const posts = await this.getAllPostsUseCase.execute(page, limit);
      res.status(200).json(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ error: "An error occurred while fetching posts" });
    }
  }

  async getPostsForUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const posts = await this.getUserPostsUseCase.findByUserIdPosts(
        userId,
        page,
        limit
      );
      res.status(200).json(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ error: "An error occurred while fetching posts" });
    }
  }

  async deletePost(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.id;

      const posts = await this.deletePostUseCase.execute(userId);
      res.status(200).json({ message: "success" });
    } catch (error) {
      console.error("Error deleting post:", error);
      res.status(500).json({ error: "An error occurred while deleting post" });
    }
  }

  async editPost(req: Request, res: Response): Promise<void> {
    try {
      const postId = req.params.postId;
      const userId = req.params.userId;
      const updatedPostData = req.body;
      const updatedPost = await this.EditPostUseCase.editPost(
        postId,
        userId,
        updatedPostData
      );
      res.status(200).json(updatedPost);
    } catch (error) {
      console.error("Error editing post:", error);
      res
        .status(500)
        .json({ error: "An error occurred while editing the post" });
    }
  }

  async likePost(req: Request, res: Response): Promise<void> {
    try {
      const { postId } = req.params;
      const { userId } = req.body;
      const updatedPost = await this.likePostUseCase.execute(postId, userId);
      res.status(200).json(updatedPost);
    } catch (error) {
      console.error("Error liking post:", error);
      res
        .status(500)
        .json({ error: "An error occurred while liking the post" });
    }
  }

  async dislikePost(req: Request, res: Response): Promise<void> {
    try {
      const { postId } = req.params;
      const { userId } = req.body;
      const updatedPost = await this.dislikePostUseCase.execute(postId, userId);
      res.status(200).json(updatedPost);
    } catch (error) {
      console.error("Error disliking post:", error);
      res
        .status(500)
        .json({ error: "An error occurred while disliking the post" });
    }
  }

  async commentOnPost(req: Request, res: Response): Promise<void> {
    try {
      const { postId } = req.params;
      const { userId, content } = req.body;
      const updatedPost = await this.commentOnPostUseCase.execute(
        postId,
        userId,
        content
      );
      res.status(200).json(updatedPost);
    } catch (error) {
      console.error("Error commenting on post:", error);
      res
        .status(500)
        .json({ error: "An error occurred while commenting on the post" });
    }
  }

  async deleteComment(req: Request, res: Response): Promise<void> {
    try {
      const { postId, commentId } = req.params;
      const updatedPost = await this.commentOnPostUseCase.deleteComment(postId, commentId);
      if (updatedPost) {
        res.status(200).json(updatedPost);
      } else {
        res.status(404).json({ error: "Post or comment not found" });
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      res
        .status(500)
        .json({ error: "An error occurred while deleting the comment" });
    }
  }
}
