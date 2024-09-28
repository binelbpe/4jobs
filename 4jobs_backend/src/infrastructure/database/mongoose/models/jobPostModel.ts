import mongoose, { Schema, Document } from 'mongoose';
import { JobPost } from '../../../../domain/entities/jobPostTypes';

const JobPostSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  company: {
    name: { type: String, required: true },
    website: { type: String },
    logo: { type: String },
  },
  location: { type: String, required: true },
  salaryRange: {
    min: { type: Number },
    max: { type: Number },
  },
  wayOfWork: { type: String, required: true },
  skillsRequired: [{ type: String }],
  qualifications: [{ type: String }],
  status: { type: String, enum: ['Open', 'Closed'], default: 'Open' },
  recruiterId: { type: Schema.Types.ObjectId, ref: 'Recruiter', required: true },
  applicants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

export default mongoose.model<JobPost & Document>('JobPost', JobPostSchema);