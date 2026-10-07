import { apiClient } from './api-client';
import { PopularSkillCategory, SkillItem, AchievementItem, SkillAssessmentItem } from '@/types';

export const skillService = {
  async getCategories(): Promise<PopularSkillCategory[]> {
    return apiClient.get<PopularSkillCategory[]>('/skills/categories');
  },

  async getMySkills(): Promise<{ skillsTeaching: SkillItem[]; skillsLearning: SkillItem[] }> {
    const raw = await apiClient.get<any>('/skills/my-skills');
    return {
      skillsTeaching: (raw.skills_teaching || []).map((s: any) => ({
        id: s.id,
        name: s.skill_name,
        category: s.category,
        level: s.experience_level,
        type: 'teach',
        yearsExperience: s.years_experience,
        sessionPrice: s.session_price,
        description: s.description,
        isPublished: s.is_published,
        badge: s.badge
      })),
      skillsLearning: (raw.skills_learning || []).map((s: any) => ({
        id: s.id,
        name: s.skill_name,
        category: s.category,
        level: s.current_level,
        type: 'learn',
        targetLevel: s.target_level,
        learningGoal: s.learning_goal,
        priority: s.priority,
        badge: s.badge,
        assessment_status: s.assessment_status,
        latest_score: s.latest_score
      }))
    };
  },

  async addSkill(skill: Partial<SkillItem> & { skill_type: 'teach' | 'learn'; skill_name: string }) {
    return apiClient.post<any>('/skills/add', {
      skill_name: skill.skill_name,
      category: skill.category || 'General',
      skill_type: skill.skill_type,
      experience_level: skill.level || 'Intermediate',
      years_experience: skill.yearsExperience || 1.0,
      description: skill.description || '',
      session_price: skill.sessionPrice || 10,
      is_published: skill.isPublished !== undefined ? skill.isPublished : true,
      current_level: skill.level || 'Beginner',
      target_level: skill.targetLevel || 'Advanced',
      learning_goal: skill.learningGoal || '',
      priority: skill.priority || 'Medium'
    });
  },

  async updateSkill(id: string, updates: Partial<SkillItem>) {
    return apiClient.put<any>(`/skills/${id}`, updates);
  },

  async deleteSkill(id: string) {
    return apiClient.delete<any>(`/skills/${id}`);
  },

  async getMyAchievements(): Promise<AchievementItem[]> {
    return apiClient.get<AchievementItem[]>('/skills/achievements/my');
  },

  async getUserAchievements(userId: string): Promise<AchievementItem[]> {
    return apiClient.get<AchievementItem[]>(`/skills/achievements/user/${userId}`);
  },

  async getMyAssessments(): Promise<SkillAssessmentItem[]> {
    return apiClient.get<SkillAssessmentItem[]>('/skills/assessments/my');
  },

  async getAssessmentById(assessmentId: string): Promise<SkillAssessmentItem> {
    return apiClient.get<SkillAssessmentItem>(`/skills/assessments/${assessmentId}`);
  },

  async submitAssessment(assessmentId: string, answers: Record<string, number>) {
    return apiClient.post<any>(`/skills/assessments/${assessmentId}/submit`, { answers });
  }
};
