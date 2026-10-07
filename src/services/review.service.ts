import { apiClient } from './api-client';

export interface SubmitReviewPayload {
  session_id: string;
  overall_rating: number;
  knowledge: number;
  communication: number;
  reliability: number;
  teaching: number;
  professionalism: number;
  comment: string;
}

export const reviewService = {
  async submitReview(payload: SubmitReviewPayload) {
    return apiClient.post<any>('/reviews/', payload);
  },

  async getUserReviews(userId: string) {
    return apiClient.get<any[]>(`/reviews/user/${userId}`);
  }
};
