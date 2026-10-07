import { apiClient } from './api-client';

export interface SignUpData {
  email: string;
  password: string;
  full_name: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export const authService = {
  async signUp(data: SignUpData) {
    const res = await apiClient.post<any>('/auth/signup', data);
    if (res.access_token) {
      localStorage.setItem('skillswap_token', res.access_token);
    }
    return res;
  },

  async login(data: LoginData) {
    const res = await apiClient.post<any>('/auth/login', data);
    if (res.access_token) {
      localStorage.setItem('skillswap_token', res.access_token);
    }
    return res;
  },

  async getCurrentUser() {
    return apiClient.get<any>('/auth/me');
  },

  logout() {
    localStorage.removeItem('skillswap_token');
    window.location.href = '/login';
  },

  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('skillswap_token');
  }
};
