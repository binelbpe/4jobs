import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  _id: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId | string;
  recipient: mongoose.Types.ObjectId | string;
  content: string;
  createdAt: Date;
  isRead: boolean;
  status: "sent" | "delivered" | "read"; 
}

const MessageSchema: Schema = new Schema({
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false },
  status: { type: String, default: 'sent' },  
});

export const MessageModel = mongoose.model<IMessage>('Message', MessageSchema);
