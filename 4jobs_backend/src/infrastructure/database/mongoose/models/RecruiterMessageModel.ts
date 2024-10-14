import mongoose, { Schema, Document } from 'mongoose';

export interface IRecruiterMessageDocument extends Document {
  conversationId: string;
  senderId: string;
  receiverId: string;
  senderType: 'recruiter' | 'user';
  content: string;
  timestamp: Date;
  isRead: boolean; // Add this field
}

const RecruiterMessageSchema: Schema = new Schema({
  conversationId: { type: String, required: true },
  senderId: { type: String, required: true },
  receiverId: { type: String, required: true },
  senderType: { type: String, enum: ['recruiter', 'user'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false }, // Add this field
});

export const RecruiterMessageModel = mongoose.model<IRecruiterMessageDocument>('RecruiterMessage', RecruiterMessageSchema);

export interface IConversationDocument extends Document {
  recruiterId: string;
  applicantId: string;
  lastMessage: string;
  lastMessageTimestamp: Date;
}

const ConversationSchema: Schema = new Schema({
  recruiterId: { type: String, required: true },
  applicantId: { type: String, required: true },
  lastMessage: { type: String, default: '' }, 
  lastMessageTimestamp: { type: Date, default: Date.now },
});

export const ConversationModel = mongoose.model<IConversationDocument>('Conversation', ConversationSchema);
