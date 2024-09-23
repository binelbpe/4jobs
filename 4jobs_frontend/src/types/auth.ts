export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  otpStep: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  googleToken?: string; // Optional for Google login
}

export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
}

export interface OtpVerificationCredentials {
  email: string;
  otp: string; // One-time password for verification
}

export interface User {
  id: string;
  email: string;
  name: string;
  role?: 'user' | 'admin'; // Consider using enums for roles
  profileImage?: string;
  bio?: string;
  about?: string;
  dateOfBirth?: string; // Consider Date type for better handling
  gender?: 'male' | 'female' | 'other'; // Consider using enums for gender
  skills?: string[]; // Retaining as array for flexibility
  experiences?: Experience[];
  projects?: Project[];
  certificates?: Certificate[];
  resume?: string;
  token: string;
}

export interface UpdateProfileFormData {
  name: string;
  email: string;
  bio?: string;
  about?: string;
  dateOfBirth?: string; // Consider Date type for better handling
  gender?: 'male' | 'female' | 'other'; // Optional, matching User
  skills: string[]; // Keeping as array for flexibility
  profileImage: File | null;
  resume: File | null;
  experiences?: Experience[];
  projects?: Project[];
  certificates: {
    file: File | null; // Optional file property
    details: Certificate; // Aligned with Certificate type
  }[];
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  startDate: string; // Keep as string for form handling
  endDate?: string; // Keep as string for form handling
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
  id: string; // Unique identifier for the certificate
  name: string; // Name of the certificate
  issuingOrganization: string; // Organization that issued the certificate
  dateOfIssue: string; // Keep as string for consistency
  description?: string; // Optional description of the certificate
  imageUrl?: string; // Optional URL for the certificate image
  file?: File | null; // File property for uploads
}
