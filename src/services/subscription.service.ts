import { apiClient } from './api-client';
import { SubscriptionPlanItem, UserSubscriptionInfo } from '@/types';

export const subscriptionService = {
  async getPlans(): Promise<SubscriptionPlanItem[]> {
    return apiClient.get<SubscriptionPlanItem[]>('/subscriptions/plans');
  },

  async getCurrentSubscription(): Promise<UserSubscriptionInfo> {
    return apiClient.get<UserSubscriptionInfo>('/subscriptions/current');
  }
};
