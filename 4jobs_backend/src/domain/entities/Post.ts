export interface Post {
  id?: string;
  author: string;
  content: string;
  likes: number;
  comments: string[];
  shares: number;
  createdAt: Date;
  updatedAt: Date;
}