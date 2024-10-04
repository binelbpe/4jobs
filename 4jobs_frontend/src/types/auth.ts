
import {BasicJobPost} from '../types/jobPostTypes'
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  otpStep: boolean;
  selectedPost: BasicJobPost | null,
  jobPosts: {
    posts: BasicJobPost[];
    loading: boolean;
    error: string | null;
    totalPages: number;
    totalCount: number;
    currentPage: number;
    updatedAt:string;
}
}


export interface LoginCredentials {
  email: string;
  password: string;
  googleToken?: string; 
}

export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
}

export interface OtpVerificationCredentials {
  email: string;
  otp: string; 
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: number;
  token?: string;
  role?: 'user' | 'admin'; 
  profileImage?: string;
  bio?: string;
  about?: string;
  dateOfBirth?: string; 
  gender?: 'male' | 'female' | 'other'; 
  skills?: string[]; 
  experiences?: Experience[];
  appliedJobs?: string[];
  projects?: Project[];
  certificates?: Certificate[];
  resume?: string;
  isBlocked?:boolean;
}

export interface UpdateProfileFormData {
  name: string;
  email: string;
  bio?: string;
  about?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  skills: string[]; 
  profileImage: File | null;
  resume: File | null;
  experiences?: Experience[];
  appliedJobs?: string[];
  projects?: Project[];
  certificates: {
    file: File | null; 
    details: Certificate; 
  }[];
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  startDate: string; 
  endDate?: string; 
  currentlyWorking?: boolean;
  description?: string;
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
  dateOfIssue: string; 
  description?: string; 
  imageUrl?: string; 
  file?: File | null;
}

export interface UserDetails extends User {
  bio?: string;
  about?: string;
  experiences: Experience[];
  projects: Project[];
  certificates: Certificate[];
  skills: string[];
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  resume?: string;
}

export interface FetchUsersResponse {
  applicants: User[];
  totalPages: number;
  currentPage: number;
}

export interface FetchUserDetailsResponse {
  user: UserDetails;
}

export interface ApiError {
  message: string;
}


export interface RecommendationUser extends User {
  connectionStatus: 'none' | 'pending' | 'rejected';
}

export interface UserConnection {
  _id: string;
  email: string;
  name: string;
  phone?: number;
  token?: string;
  role?: 'user' | 'admin'; 
  profileImage?: string;
  bio?: string;
  about?: string;
  dateOfBirth?: string; 
  gender?: 'male' | 'female' | 'other'; 
  skills?: string[]; 
  experiences?: Experience[];
  appliedJobs?: string[];
  projects?: Project[];
  certificates?: Certificate[];
  resume?: string;
  isBlocked?:boolean;
}
