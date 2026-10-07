import { apiClient } from './api-client';
import { SkillMatch } from '@/types';

export const matchService = {
  async getRecommendedMatches(tab: string = 'all'): Promise<SkillMatch[]> {
    const rawMatches = await apiClient.get<any[]>(`/matches/recommendations?tab=${tab}`);
    return rawMatches.map((m) => ({
      id: m.user_id,
      matchPercentage: m.match_score,
      explanations: m.explanations || [],
      tokenPrice: m.token_price || 15,
      youTeachThem: m.skills_learning || [],
      theyTeachYou: m.skills_teaching || [],
      status: 'recommended',
      user: {
        id: m.user_id,
        name: m.user_name,
        headline: m.headline || '',
        bio: '',
        location: m.location || '',
        avatar: m.avatar_url || '',
        rating: m.reputation_score || 5.0,
        reviewsCount: m.rating_count || 0,
        sessionsCompleted: 0,
        availability: m.availability || [],
        skillsTeaching: (m.skills_teaching || []).map((name: string) => ({
          id: name,
          name,
          category: 'General',
          level: 'Advanced'
        })),
        skillsLearning: (m.skills_learning || []).map((name: string) => ({
          id: name,
          name,
          category: 'General',
          level: 'Beginner'
        }))
      }
    }));
  }
};
