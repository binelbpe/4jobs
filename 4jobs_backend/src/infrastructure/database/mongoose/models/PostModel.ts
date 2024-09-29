// src/infrastructure/models/PostModel.ts

import mongoose, { Schema, Document } from 'mongoose';
import { IPost } from '../../../../domain/entities/Post';

const PostSchema: Schema = new Schema({
  userId: { type: String, required: true },
  content: { type: String },
  imageUrl: { type: String },
  videoUrl: { type: String },
  likes: [{ type: String }],
  comments: [{
    userId: { type: String, required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
}, { timestamps: true });

export default mongoose.model<IPost & Document>('Post', PostSchema);