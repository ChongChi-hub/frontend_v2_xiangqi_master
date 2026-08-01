import { useMutation } from '@tanstack/react-query';
import apiClient from './api';
import type { LoginCredentials, RegisterCredentials, AuthResponse } from '@/types/auth';

export const loginApi = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
  return response.data;
};

export const registerApi = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
  const payload = {
    email: credentials.email,
    username: credentials.username,
    password: credentials.password,
  };
  const response = await apiClient.post<AuthResponse>('/auth/register', payload);
  return response.data;
};

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: loginApi,
  });
};

export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: registerApi,
  });
};
