import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  type: string;
  message: string;
  sender: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;
  relatedItem: mongoose.Types.ObjectId;
  status: 'read' | 'unread';
  createdAt: Date;
}

const NotificationSchema: Schema = new Schema({
  type: { type: String, required: true },
  message: { type: String, required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  relatedItem: { type: mongoose.Schema.Types.ObjectId, required: true },
  status: { type: String, enum: ['read', 'unread'], default: 'unread' },
  createdAt: { type: Date, default: Date.now }
});

export const NotificationModel = mongoose.model<INotification>('Notification', NotificationSchema);