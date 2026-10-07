import { apiClient } from './api-client';
import { UserProfile } from '@/types';

const mapRawUserToProfile = (u: any): UserProfile => ({
  id: u.id,
  name: u.full_name,
  username: u.username || u.profile?.username || '',
  email: u.email,
  headline: u.profile?.headline || '',
  bio: u.profile?.bio || '',
  location: u.profile?.location || '',
  avatar: u.profile?.avatar_url || '',
  rating: u.profile?.reputation_score ?? 5.0,
  reviewsCount: u.profile?.rating_count ?? 0,
  sessionsCompleted: u.profile?.completed_sessions ?? 0,
  teachingHours: u.profile?.teaching_hours ?? 0,
  learningHours: u.profile?.learning_hours ?? 0,
  availability: u.profile?.availability || [],
  languages: u.profile?.languages || ['English'],
  interests: u.profile?.interests || [],
  experience: u.profile?.experience || [],
  education: u.profile?.education || [],
  projects: u.profile?.projects || [],
  certifications: u.profile?.certifications || [],
  socialLinks: u.profile?.social_links || {},
  social_links: u.profile?.social_links || {},
  isVerified: u.is_verified,
  role: u.role,
  onboardingCompleted: u.profile?.onboarding_completed,
  skillsTeaching: (u.skills_teaching || []).map((s: any) => ({
    id: s.id,
    name: s.skill_name,
    category: s.category,
    level: s.experience_level,
    type: 'teach',
    yearsExperience: s.years_experience,
    sessionPrice: s.session_price,
    description: s.description,
    isPublished: s.is_published
  })),
  skillsLearning: (u.skills_learning || []).map((s: any) => ({
    id: s.id,
    name: s.skill_name,
    category: s.category,
    level: s.current_level,
    type: 'learn',
    targetLevel: s.target_level,
    learningGoal: s.learning_goal,
    priority: s.priority
  }))
});

export const userService = {
  async getCommunityUsers(params?: {
    search?: string;
    category?: string;
    experience_level?: string;
    availability?: string;
  }): Promise<UserProfile[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.category) query.append('category', params.category);
    if (params?.experience_level) query.append('experience_level', params.experience_level);
    if (params?.availability) query.append('availability', params.availability);

    const qStr = query.toString() ? `?${query.toString()}` : '';
    const rawUsers = await apiClient.get<any[]>(`/users/community${qStr}`);
    return rawUsers.map(mapRawUserToProfile);
  },

  async getUserById(userIdOrUsername: string): Promise<UserProfile> {
    const u = await apiClient.get<any>(`/users/${encodeURIComponent(userIdOrUsername)}`);
    return mapRawUserToProfile(u);
  },

  async getUserByUsername(username: string): Promise<UserProfile> {
    const u = await apiClient.get<any>(`/users/by-username/${encodeURIComponent(username.replace(/^@/, ''))}`);
    return mapRawUserToProfile(u);
  },

  async updateMyProfile(updates: any): Promise<any> {
    const payload: any = {
      ...updates
    };
    if (updates.name && !updates.full_name) {
      payload.full_name = updates.name;
    }
    if (updates.socialLinks && !updates.social_links) {
      payload.social_links = updates.socialLinks;
    }
    return apiClient.put<any>('/users/profile/me', payload);
  },

  async uploadAvatar(file: File): Promise<{ avatar_url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.upload<{ message: string; avatar_url: string }>('/users/upload-avatar', formData);
  }
};
