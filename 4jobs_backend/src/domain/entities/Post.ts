export interface IPost {
  _id: string;
  userId: string;
  content?: string;
  imageUrl?: string;
  videoUrl?: string;
  likes: string[];
  comments: IComment[];
  createdAt: Date;
  updatedAt: Date;
  user?: {
    name: string;
    profileImage?: string;
    bio?: string;
  };
}

export interface IComment {
  _id: string;
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
