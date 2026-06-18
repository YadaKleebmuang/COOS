export interface RegisterForm {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  token?: string;
  user?: any;
}
