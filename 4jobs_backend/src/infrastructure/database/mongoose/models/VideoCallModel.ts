import mongoose, { Schema, Document } from 'mongoose';

interface IVideoCallDocument extends Document {
  recruiterId: string;
  userId: string;
  status: 'pending' | 'active' | 'ended';
  startTime?: Date;
  endTime?: Date;
}

const VideoCallSchema: Schema = new Schema({
  recruiterId: { type: String, required: true },
  userId: { type: String, required: true },
  status: { type: String, enum: ['pending', 'active', 'ended'], required: true },
  startTime: { type: Date },
  endTime: { type: Date },
});

export const VideoCallModel = mongoose.model<IVideoCallDocument>('VideoCall', VideoCallSchema);
