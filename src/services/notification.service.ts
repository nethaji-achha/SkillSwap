import { apiClient } from './api-client';
import { AppNotification } from '@/types';

export const notificationService = {
  async getNotifications(): Promise<AppNotification[]> {
    return apiClient.get<AppNotification[]>('/notifications/');
  },

  async markAsRead(notificationId: string) {
    return apiClient.post<any>(`/notifications/${notificationId}/read`);
  },

  async markAllAsRead() {
    return apiClient.post<any>('/notifications/read-all');
  }
};
