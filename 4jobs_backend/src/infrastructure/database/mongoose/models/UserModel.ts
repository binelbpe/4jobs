// src/infrastructure/database/mongoose/models/UserModel.ts
import mongoose, { Document, Schema } from 'mongoose';

interface IUserDocument extends Document {
  email: string;
  password: string;
  name: string;
  role: 'user' | 'recruiter' | 'admin';
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>({
  email: { type: String, required: true },
  password: { type: String},
  name: { type: String, required: true },
  role: { type: String, enum: ['user', 'recruiter', 'admin'], required: true },
  isAdmin: { type: Boolean, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const UserModel = mongoose.model<IUserDocument>('User', UserSchema);
