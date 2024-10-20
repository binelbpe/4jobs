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

  async findAll(
    page: number,
    limit: number
  ): Promise<{ posts: IPost[]; totalPages: number; currentPage: number }> {
    const skip = (page - 1) * limit;
    const totalCount = await PostModel.countDocuments({ status: "active" });
    const totalPages = Math.ceil(totalCount / limit);

    const posts = await PostModel.find({ status: "active" })
      .populate("userId", "name email profileImage bio")
      .populate({
        path: "comments.userId",
        select: "name profileImage",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return {
      posts: posts.map((post) => this.populateUserInfo(post)),
      totalPages,
      currentPage: page,
    };
  }

  async findAllAdmin(
    page: number,
    limit: number
  ): Promise<{ posts: IPost[]; totalPages: number; currentPage: number }> {
    const skip = (page - 1) * limit;
    const totalCount = await PostModel.countDocuments();
    const totalPages = Math.ceil(totalCount / limit);

    const posts = await PostModel.find()
      .populate("userId", "name email profileImage bio")
      .populate({
        path: "comments.userId",
        select: "name profileImage",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return {
      posts: posts.map((post) => this.populateUserInfo(post)),
      totalPages,
      currentPage: page,
    };
  }

  async findByUserId(
    userId: string,
    page: number,
    limit: number
  ): Promise<{ posts: IPost[]; totalPages: number; currentPage: number }> {
    const skip = (page - 1) * limit;
    const totalCount = await PostModel.countDocuments({ userId });
    const totalPages = Math.ceil(totalCount / limit);

    const posts = await PostModel.find({ userId })
      .populate("userId", "name profileImage bio")
      .populate({
        path: "comments.userId",
        select: "name profileImage",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return {
      posts: posts.map((post) => this.populateUserInfo(post)),
      totalPages,
      currentPage: page,
    };
  }

  async deletePost(id: string): Promise<boolean> {
    const deletedPost = await PostModel.findByIdAndDelete(id);
    return !!deletedPost;
  }

  async editPost(
    postId: string,
    userId: string,
    updatedPostData: Partial<IPost>
  ): Promise<IPost> {
    const post = await PostModel.findOne({ _id: postId, userId }).populate(
      "userId",
      "name profileImage bio"
    );

    if (!post) {
      throw new Error(
        "Post not found or user not authorized to edit this post"
      );
    }

    Object.assign(post, updatedPostData);
    await post.save();

    return this.populateUserInfo(post);
  }

  async toggleBlockStatus(postId: string): Promise<IPost> {
    const post = await PostModel.findById(postId).populate(
      "userId",
      "name email profileImage bio"
    );
    if (!post) {
      throw new Error("Post not found");
    }

    post.status = post.status === "active" ? "blocked" : "active";
    await post.save();

    return this.populateUserInfo(post);
  }

  private populateUserInfo(post: any): IPost {
    const postObj = post.toObject();
    return {
      ...postObj,
      user: post.userId
        ? {
            name: post.userId.name,
            email: post.userId.email,
            profileImage: post.userId.profileImage,
            bio: post.userId.bio,
          }
        : undefined,
      comments: postObj.comments.map((comment: any) => ({
        ...comment,
        user: comment.userId
          ? {
              name: comment.userId.name,
              profileImage: comment.userId.profileImage,
            }
          : undefined,
      })),
    };
  }

  async findAllForAdmin(
    page: number,
    limit: number
  ): Promise<{ posts: IPost[]; totalPages: number; currentPage: number }> {
    const skip = (page - 1) * limit;
    const totalCount = await PostModel.countDocuments();
    const totalPages = Math.ceil(totalCount / limit);

    const posts = await PostModel.find()
      .populate("userId", "name email profileImage bio")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return {
      posts: posts.map((post) => this.populateUserInfo(post)),
      totalPages,
      currentPage: page,
    };
  }

  async addLike(postId: string, userId: string): Promise<IPost | null> {
    const post = await PostModel.findByIdAndUpdate(
      postId,
      { $addToSet: { likes: userId } },
      { new: true }
    ).populate("userId", "name email profileImage bio");

    return post ? this.populateUserInfo(post) : null;
  }

  async removeLike(postId: string, userId: string): Promise<IPost | null> {
    const post = await PostModel.findByIdAndUpdate(
      postId,
      { $pull: { likes: userId } },
      { new: true }
    ).populate("userId", "name email profileImage bio");

    return post ? this.populateUserInfo(post) : null;
  }

  async addComment(
    postId: string,
    comment: { userId: string; content: string }
  ): Promise<IPost | null> {
    const post = await PostModel.findByIdAndUpdate(
      postId,
      { $push: { comments: comment } },
      { new: true }
    ).populate("userId", "name email profileImage bio");

    return post ? this.populateUserInfo(post) : null;
  }

  async deleteComment(
    postId: string,
    commentId: string
  ): Promise<IPost | null> {
    const post = await PostModel.findByIdAndUpdate(
      postId,
      { $pull: { comments: { _id: commentId } } },
      { new: true }
    ).populate("userId", "name email profileImage bio");

    return post ? this.populateUserInfo(post) : null;
  }
}
