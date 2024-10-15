import "reflect-metadata";
import { Document } from "mongoose";

export interface Recruiter extends Document {
  companyName: string;
  phone: string;
  email: string;
  password: string;
  role: "recruiter";
  isApproved: boolean;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRecruiter {
  id: string;
  email: string;
  password: string;
  companyName: string;
  phone: string;
  name: string;
  role: "user" | "recruiter" | "admin";
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
  governmentId?: string;
  employeeId?: string;
  location?: string;
  employeeIdImage?: string;
  subscribed: boolean;
  planDuration: string | null;
  expiryDate: Date | null;
  subscriptionAmount: number;
  subscriptionStartDate: Date | null; // Add this new field
}
