import { injectable, inject } from "inversify";
import { Request, Response } from "express";
import { CreatePostUseCase } from "../../../application/usecases/user/post/CreatePostUseCase";
import { GetAllPostsUseCase } from "../../../application/usecases/user/post/GetAllPostsUseCase";
import { GetUserPostsUseCase } from "../../../application/usecases/user/post/GetUserPostsUseCase";
import { DeletePostUseCase } from "../../../application/usecases/user/post/DeletePostUseCase";
import { EditPostUseCase } from '../../../application/usecases/user/post/EditPostUseCase';
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
    private EditPostUseCase: EditPostUseCase
  ) {}

  async createPost(req: Request, res: Response): Promise<void> {
    console.log("Request body:", req.body);
    console.log("Request files:", req.files);
    console.log("Request params:", req.params);

    try {
      const { userId } = req.params;
      const { content } = req.body;
      const image = req.files?.["image"]?.[0];
      const video = req.files?.["video"]?.[0];

      // Log the extracted data
      console.log("Extracted data:", { userId, content, image, video });

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
      console.log("Fetching posts for page:", page);

      const posts = await this.getAllPostsUseCase.execute(page, limit);
      console.log("postssssss==================:", posts);
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
      console.log("Fetching posts for page:", page);
      console.log("page limit", page, limit);
      const posts = await this.getUserPostsUseCase.findByUserIdPosts(
        userId,
        page,
        limit
      );
      console.log("postssssss==================:", posts);
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
      console.log("postssssss==================delete:", posts);
      res.status(200).json({ message: "success" });
    } catch (error) {
      console.error("Error deleting post:", error);
      res.status(500).json({ error: "An error occurred while deleting post" });
    }
  }

  async editPost(req: Request, res: Response): Promise<void> {
    try {
      const postId = req.params.postId;
      const userId = req.params.userId; // Assuming you have user information in the request after authentication
      const updatedPostData = req.body;
      console.log("updatedPostData",updatedPostData)
      console.log("postIddd",postId)
      console.log("userId",userId)
      const updatedPost = await this.EditPostUseCase.editPost(postId, userId, updatedPostData);
console.log("updatedPost",updatedPost)
      res.status(200).json(updatedPost);
    } catch (error) {
      console.error('Error editing post:', error);
      res.status(500).json({ error: 'An error occurred while editing the post' });
    }
  }

  // Implement other controller methods for future expansion
}
