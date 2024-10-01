// src/types/postTypes.ts
export interface Post {
  _id: string;
  userId: string;
  author: string;
  content?: string;
  videoUrl?: string;
  imageUrl?: string;
  likes: number;
  comments: Comment[];
  createdAt: string;
}

export interface Comment {
  id: string;
  userId: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface CreatePostData {
  content?: string;
  video?: File;
  image?: File;
}

export interface LikePostData {
  postId: string;
  userId: string;
}

export interface CommentPostData {
  postId: string;
  userId: string;
  content: string;
}