import { apiClient } from './api-client';
import { AdminAnalytics } from '@/types';

export const adminService = {
  async getAnalytics(): Promise<AdminAnalytics> {
    return apiClient.get<AdminAnalytics>('/admin/analytics');
  },

  async getUsers(search?: string) {
    const q = search ? `?search=${search}` : '';
    return apiClient.get<any[]>(`/admin/users${q}`);
  },

  async toggleUserVerification(userId: string) {
    return apiClient.post<any>(`/admin/users/${userId}/verify`);
  },

  async toggleUserStatus(userId: string) {
    return apiClient.post<any>(`/admin/users/${userId}/toggle-status`);
  },

  async getPayments() {
    return apiClient.get<any[]>('/admin/payments');
  },

  async getReports() {
    return apiClient.get<any[]>('/admin/reports');
  }
};
