import { apiClient } from './api-client';
import { AIRoadmapResponse } from '@/types';

export const aiService = {
  async generateRoadmap(payload: {
    skill_to_learn: string;
    current_level?: string;
    target_goal?: string;
    duration_days?: number;
  }): Promise<AIRoadmapResponse> {
    return apiClient.post<AIRoadmapResponse>('/ai/roadmap', payload);
  },

  async getPricingRecommendation(payload: {
    skill_name: string;
    experience_level: string;
    years_experience: number;
    description?: string;
  }) {
    return apiClient.post<any>('/ai/pricing-recommendation', payload);
  },

  async chatWithMentor(message: string): Promise<{ reply: string }> {
    return apiClient.post<{ reply: string }>('/ai/mentor-chat', { message });
  }
};
