import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String},
  name: { type: String, required: true },
  role: { type: String, enum: ['user', 'recruiter', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isAdmin:{ type: Boolean, default: false },
});

export const UserModel = mongoose.model('User', userSchema);