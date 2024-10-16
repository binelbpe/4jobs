export interface Post {
  _id: string;
  userId: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  likes: string[];
  comments: Comment[];
  user: {
    name: string;
    profileImage?: string;
    bio?: string;
  };
  createdAt: string;
  updatedAt: string;
  status?: 'active' | 'blocked';
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

export interface PostsApiResponse {
  posts: Post[];
  totalPages: number;
  currentPage: number;
}
