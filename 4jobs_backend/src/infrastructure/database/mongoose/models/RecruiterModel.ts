import mongoose, { Schema, Document } from "mongoose";
import { Recruiter as RecruiterInterface } from "../../../../domain/entities/Recruiter";

const RecruiterSchema: Schema = new Schema({
  companyName: { type: String, required: true },
  location: { type: String },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["user", "recruiter", "admin"],
    default: "recruiter",
  },
  isApproved: { type: Boolean, default: false },
  name: { type: String },
  governmentId: { type: String, required: true },
  governmentIdUrl: { type: String },
  employeeId: { type: String },
  employeeIdImage: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  subscribed: { type: Boolean, default: false },
  planDuration: { type: String, default: null },
  expiryDate: { type: Date, default: null },
  subscriptionAmount: { type: Number, default: 0 },
  subscriptionStartDate: { type: Date, default: null },
});

export default mongoose.model<RecruiterInterface & Document>(
  "Recruiter",
  RecruiterSchema
);
