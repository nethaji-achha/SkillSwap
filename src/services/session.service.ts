import { apiClient } from './api-client';
import { LearningSession, SessionSummaryItem } from '@/types';

export interface BookSessionPayload {
  teacher_id: string;
  skill_name: string;
  scheduled_at: string;
  duration_minutes: number;
  token_price: number;
  objective?: string;
}

export const sessionService = {
  async getMySessions(statusFilter: string = 'all'): Promise<LearningSession[]> {
    const q = statusFilter !== 'all' ? `?status_filter=${statusFilter}` : '';
    const raw = await apiClient.get<any[]>(`/sessions/${q}`);
    
    return raw.map((s) => ({
      id: s.id,
      skillName: s.skill_name,
      teacherId: s.teacher_id,
      teacherName: s.teacher_name,
      teacherAvatar: s.teacher_avatar,
      learnerId: s.learner_id,
      learnerName: s.learner_name,
      learnerAvatar: s.learner_avatar,
      scheduledAt: s.scheduled_at,
      durationMinutes: s.duration_minutes,
      tokenPrice: s.token_price,
      objective: s.objective,
      status: s.status,
      hasSummary: s.has_summary,
      meetingLink: s.meeting_link,
      createdAt: s.created_at,
      completedAt: s.completed_at
    }));
  },

  async getSessionById(sessionId: string): Promise<LearningSession> {
    const s = await apiClient.get<any>(`/sessions/${sessionId}`);
    return {
      id: s.id,
      skillName: s.skill_name,
      teacherId: s.teacher_id,
      teacherName: s.teacher_name,
      teacherAvatar: s.teacher_avatar,
      learnerId: s.learner_id,
      learnerName: s.learner_name,
      learnerAvatar: s.learner_avatar,
      scheduledAt: s.scheduled_at,
      durationMinutes: s.duration_minutes,
      tokenPrice: s.token_price,
      objective: s.objective,
      status: s.status,
      hasSummary: s.has_summary,
      meetingLink: s.meeting_link,
      createdAt: s.created_at,
      completedAt: s.completed_at
    };
  },

  async getSessionSummary(sessionId: string): Promise<SessionSummaryItem> {
    return apiClient.get<SessionSummaryItem>(`/sessions/${sessionId}/summary`);
  },

  async getMySummaries(): Promise<SessionSummaryItem[]> {
    return apiClient.get<SessionSummaryItem[]>('/sessions/summaries/my');
  },

  async getSummaryById(summaryId: string): Promise<SessionSummaryItem> {
    return apiClient.get<SessionSummaryItem>(`/sessions/summaries/${summaryId}`);
  },

  async bookSession(payload: BookSessionPayload) {
    return apiClient.post<any>('/sessions/book', payload);
  },

  async completeSession(sessionId: string) {
    return apiClient.post<any>(`/sessions/${sessionId}/complete`);
  },

  async cancelSession(sessionId: string) {
    return apiClient.post<any>(`/sessions/${sessionId}/cancel`);
  }
};
