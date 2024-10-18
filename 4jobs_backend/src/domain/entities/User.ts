// src/domain/entities/User.ts
import 'reflect-metadata';
import { Document } from 'mongoose';

export interface User {
  id: string; // Change this to non-optional
  email: string;
  password: string;
  phone?:number;
  name: string;
  role?: 'user' | 'recruiter' | 'admin';  
  isAdmin?: boolean;
  appliedJobs?: string[];
  // Profile-related fields
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
  isBlocked?: boolean;
}

export interface MUser {
  id: string;
  email: string;
  password?: string;
  phone?:number;
  name: string;
  role?: 'user' | 'recruiter' | 'admin';  
  isAdmin?: boolean;
  appliedJobs?: string[];
  // Profile-related fields
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
  isBlocked?: boolean;
}

export interface IUserDocument extends Omit<User, 'id'>, Document {
  _id: string; // Add this line
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate?: string;
  currentlyWorking: boolean;
  description: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  link?: string;
  imageUrl?: string;
}

export interface Certificate {
  id: string;
  name: string;
  issuingOrganization: string;
  dateOfIssue: Date;
  imageUrl?: string;
}
export interface UserRecommendation {
  id: string;
  name: string;
  email: string;
  profileImage: string;
  connectionStatus: "none" | "pending" | "accepted" | "rejected";
  matchingCriteria: string[];
}
