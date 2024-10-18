import mongoose, { Document, Schema } from 'mongoose';
import { IUserDocument } from '../../../../domain/entities/User';


const UserSchema = new Schema<IUserDocument>({
  email: { type: String, unique: true, required: true },
  password: { type: String },
  name: { type: String, required: true },
  phone:{type: Number},
  role: { type: String, enum: ['user', 'recruiter', 'admin'], default: 'user' },
  isAdmin: { type: Boolean, default: false },
  bio: { type: String },
  about: { type: String },
  experiences: [{
    id: { type: String, required: true },
    title: { type: String, required: true },
    company: { type: String, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String },
    currentlyWorking: { type: Boolean, default: false },
    description: { type: String },
  }],
  projects: [{
    id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    link: { type: String },
    imageUrl: { type: String },
  }],
  certificates: [{
    id: { type: String, required: true },
    name: { type: String, required: true },
    issuingOrganization: { type: String, required: true },
    dateOfIssue: { type: Date, required: true },
    imageUrl: { type: String },
  }],
  skills: [{ type: String }],
  profileImage: { type: String },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  resume: { type: String },
  appliedJobs: [{ type: Schema.Types.ObjectId, ref: 'JobPost' }],
  isBlocked:{type: Boolean, default: false },
}, {
  timestamps: true 
});

export const UserModel = mongoose.model<IUserDocument>('User', UserSchema);
