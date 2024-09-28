import mongoose, { Schema, Document } from 'mongoose';
import { Post } from '../../../../domain/entities/Post';

export interface PostDocument extends Post, Document {}

const PostSchema: Schema = new Schema({
  author: { type: String, required: true },
  content: { type: String, required: true },
  likes: { type: Number, default: 0 },
  comments: [{ type: String }],
  shares: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model<PostDocument>('Post', PostSchema);