import mongoose, { Schema, Document } from 'mongoose';

export interface IPendingNotification extends Document {
  userId: string;
  notificationData: any;
  createdAt: Date;
}

const PendingNotificationSchema: Schema = new Schema({
  userId: { type: String, required: true, index: true },
  notificationData: { type: Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const PendingNotificationModel = mongoose.model<IPendingNotification>('PendingNotification', PendingNotificationSchema);