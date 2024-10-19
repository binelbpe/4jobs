export interface Post {
  _id: string; // Ensure this is defined as a string
  userId: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  likes: string[];
  comments: Comment[];
  user: {
    _id: string; // Add this line
    name: string;
    profileImage?: string;
  };
  createdAt: string;
  updatedAt: string;
  status?: 'active' | 'blocked';
}

export interface Like {
  _id: string;
  name: string;
  profileImage?: string;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  userId: {
    id: string;
    name: string;
    profileImage?: string;
  };
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
  userName: string;
  userProfileImage?: string;
}

export interface PostsApiResponse {
  posts: Post[];
  totalPages: number;
  currentPage: number;
}
