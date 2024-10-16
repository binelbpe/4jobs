import mongoose, { Schema, Document } from 'mongoose';

export interface IUserVideoCall extends Document {
  callerId: string;
  recipientId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'ended';
  createdAt: Date;
  updatedAt: Date;
}

const UserVideoCallSchema: Schema = new Schema({
  callerId: { type: String, required: true },
  recipientId: { type: String, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'ended'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const UserVideoCallModel = mongoose.model<IUserVideoCall>('UserVideoCall', UserVideoCallSchema);
