
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
  token: string;
}
