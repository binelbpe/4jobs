// src/types/post.ts

export interface IPost {
  id: string;
  userId: string;
  content?: string;
  imageUrl?: string;
  videoUrl?: string;
  likes: string[];
  comments: IComment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IComment {
  id: string;
  userId: string;
  content: string;
  createdAt: Date;
}

export interface CreatePostDTO {
  userId: string;
  content?: string;
  image?: Express.Multer.File;
  video?: Express.Multer.File;
}