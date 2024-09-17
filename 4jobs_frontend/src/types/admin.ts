export interface Admin {
  id: string;
  email: string;
  name: string;
  role: string;
  isAdmin: boolean;
}

export interface AdminLoginResponse {
  token: string;
  admin: Admin;
}
