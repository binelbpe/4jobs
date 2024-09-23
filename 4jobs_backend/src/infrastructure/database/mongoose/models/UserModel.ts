import mongoose, { Document, Schema } from 'mongoose';

interface IUserDocument extends Document {
  email: string;
  password: string;
  name: string;
  role: 'user' | 'recruiter' | 'admin';
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
  bio?: string;
  about?: string;
  experiences?: Experience[];
  projects?: Project[];
  certificates?: Certificate[];
  skills?: string[];
  profileImage?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  resume?: string;
}

interface Experience {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate?: string;
  currentlyWorking: boolean;
  description: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  link?: string;
  imageUrl?: string;
}

interface Certificate {
  id: string;
  name: string;
  issuingOrganization: string;
  dateOfIssue: Date;
  imageUrl?: string;
}

const UserSchema = new Schema<IUserDocument>({
  email: { type: String, unique: true, required: true },
  password: { type: String },
  name: { type: String, required: true },
  role: { type: String, enum: ['user', 'recruiter', 'admin'], default: 'user' },
  isAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
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
});

UserSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export const UserModel = mongoose.model<IUserDocument>('User', UserSchema);