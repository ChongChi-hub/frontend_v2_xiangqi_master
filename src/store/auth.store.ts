import { create } from 'zustand';
import type { User } from '@/types/auth';
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from '@/config/constants';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

const getInitialToken = (): string | null => {
  return (
    localStorage.getItem(AUTH_TOKEN_KEY) ||
    localStorage.getItem('authToken') ||
    localStorage.getItem('token')
  );
};

const getInitialUser = (): User | null => {
  const userJson =
    localStorage.getItem(AUTH_USER_KEY) ||
    localStorage.getItem('authUser') ||
    localStorage.getItem('user');

  if (!userJson) return null;
  try {
    return JSON.parse(userJson) as User;
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  user: getInitialUser(),
  token: getInitialToken(),
  isAuthenticated: !!getInitialToken(),

  setAuth: (user: User, token: string) => {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    localStorage.setItem('authToken', token);
    localStorage.setItem('authUser', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
