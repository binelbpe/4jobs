import mongoose, { Schema, Document } from 'mongoose';
import { Recruiter as RecruiterInterface } from '../../../../core/entities/Recruiter';

const RecruiterSchema: Schema = new Schema({
  companyName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'recruiter', 'admin'], default: 'recruiter' },
  isApproved: { type: Boolean, default: false },
  name: { type: String }, 
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model<RecruiterInterface & Document>('Recruiter', RecruiterSchema);
