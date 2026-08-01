export interface User {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  avatar?: string;
  eloScore?: number;
  winMatches?: number;
  loseMatches?: number;
  drawMatches?: number;
  role?: string;
  createdAt?: string;
}

export interface LoginCredentials {
  username?: string;
  email?: string;
  password?: string;
  rememberMe?: boolean;
}

export interface RegisterCredentials {
  fullName?: string;
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  agreeTerms?: boolean;
}

export interface AuthResponse {
  message?: string;
  user: User;
  token?: string;
  accessToken?: string;
}

export interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}
