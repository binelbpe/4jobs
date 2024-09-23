// src/domain/entities/User.ts
import 'reflect-metadata';
export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'user' | 'recruiter' | 'admin';  
  isAdmin: boolean;

  // Profile-related fields
  bio?: string;
  about?: string;
  experiences: Experience[];
  projects: Project[];
  certificates: Certificate[];
  skills: string[];
  profileImage?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  resume?: string;
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  startDate: Date;
  endDate?: Date;
  currentlyWorking?: boolean;
  description: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  link?: string;
}

export interface Certificate {
  id: string;
  name: string;
  issuingOrganization: string;
  dateOfIssue: Date;
}
