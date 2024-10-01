// src/domain/entities/User.ts
import 'reflect-metadata';
export interface User {
  id: string;
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


export interface IUserDocument extends Document {
  email: string;
  password: string;
  phone: number;
  name: string;
  role: 'user' | 'recruiter' | 'admin';
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
  appliedJobs:string[]; 
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
  isBlocked:boolean;
  
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
  profileImage?: string;
  connectionStatus: 'none' | 'pending' | 'accepted' | 'rejected';
}