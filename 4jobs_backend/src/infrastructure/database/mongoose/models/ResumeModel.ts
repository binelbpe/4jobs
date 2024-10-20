import mongoose, { Schema, Document } from 'mongoose';

interface IResume extends Document {
  user: mongoose.Types.ObjectId;
  resumeUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

const ResumeSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  resumeUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const ResumeModel = mongoose.model<IResume>('Resume', ResumeSchema);
