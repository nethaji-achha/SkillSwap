export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export type AvailabilityTime = 'Weekday mornings' | 'Weekday evenings' | 'Weekends';

export interface AchievementItem {
  id?: string;
  user_id?: string;
  skill_name: string;
  badge_level: 'BRONZE' | 'SILVER' | 'GOLD' | string;
  source_session_id?: string;
  latest_score?: number;
  assessment_status?: 'scheduled' | 'available' | 'completed' | string;
  awarded_at: string;
  updated_at?: string;
}

export interface SkillItem {
  id: string;
  name: string;
  category: string;
  level: SkillLevel;
  type?: 'teach' | 'learn';
  yearsExperience?: number;
  sessionPrice?: number; // In Skill Swap Tokens (🪙)
  isPublished?: boolean;
  targetLevel?: SkillLevel;
  learningGoal?: string;
  priority?: 'High' | 'Medium' | 'Low';
  sessionsCount?: number;
  hoursSpent?: number;
  progressPercentage?: number;
  description?: string;
  badge?: 'BRONZE' | 'SILVER' | 'GOLD' | string;
  assessment_status?: string;
  latest_score?: number;
}

export interface ExperienceEntry {
  title: string;
  company: string;
  period: string;
  description: string;
}

export interface EducationEntry {
  degree: string;
  institution: string;
  year: string;
}

export interface ProjectEntry {
  title: string;
  description: string;
  link?: string;
}

export interface CertificationEntry {
  name: string;
  issuer: string;
  year: string;
}

export interface SocialLinksData {
  github?: string;
  linkedin?: string;
  portfolio?: string;
  website?: string;
}

export interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  tags: string[];
  link?: string;
  image?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  username?: string;
  email?: string;
  headline: string;
  bio: string;
  location: string;
  avatar: string;
  rating: number;
  reviewsCount: number;
  sessionsCompleted: number;
  teachingHours?: number;
  learningHours?: number;
  skillsTeaching: SkillItem[];
  skillsLearning: SkillItem[];
  achievements?: AchievementItem[];
  availability: string[];
  languages?: string[];
  interests?: string[];
  experience?: ExperienceEntry[];
  education?: EducationEntry[];
  projects?: ProjectEntry[];
  certifications?: CertificationEntry[];
  socialLinks?: SocialLinksData;
  social_links?: SocialLinksData;
  portfolio?: PortfolioProject[];
  isOnline?: boolean;
  isVerified?: boolean;
  memberSince?: string;
  role?: string;
  onboardingCompleted?: boolean;
}

export interface SkillMatch {
  id: string;
  user: UserProfile;
  matchPercentage: number;
  explanations: string[];
  youTeachThem: string[];
  theyTeachYou: string[];
  tokenPrice: number;
  status?: 'recommended' | 'pending' | 'connected' | 'completed';
}

export interface SkillSwapRequest {
  id: string;
  senderId: string;
  receiverId: string;
  receiverUser: UserProfile;
  teachSkill: string;
  learnSkill: string;
  message: string;
  tokenPrice?: number;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId?: string;
  senderId: string;
  senderName?: string;
  senderAvatar?: string;
  text: string;
  timestamp: string;
  isMe: boolean;
}

export interface Conversation {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerAvatar: string;
  partnerHeadline?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export type SessionStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';

export interface LearningSession {
  id: string;
  skillName: string;
  skill?: string;
  title?: string;
  teacherId: string;
  teacherName: string;
  teacherAvatar: string;
  learnerId: string;
  learnerName: string;
  learnerAvatar: string;
  scheduledAt: string;
  date?: string;
  time?: string;
  durationMinutes: number;
  tokenPrice: number;
  objective: string;
  status: SessionStatus | string;
  hasSummary?: boolean;
  role?: 'teacher' | 'learner';
  partner?: {
    name: string;
    avatar: string;
  };
  rating?: number;
  review?: string;
  meetingLink?: string;
  createdAt: string;
  completedAt?: string;
}

export interface SessionSummaryItem {
  id: string;
  session_id: string;
  user_id: string;
  skill_name: string;
  title: string;
  teacher_name: string;
  learner_name: string;
  duration_minutes: number;
  session_date: string;
  learning_objective: string;
  key_concepts: string[];
  important_points: string[];
  practical_tips: string[];
  questions_discussed: string[];
  main_takeaways: string[];
  suggested_revision_points: string[];
  suggested_next_steps: string[];
  raw_summary?: string;
  created_at: string;
}

export interface AssessmentQuestionItem {
  id: string;
  question: string;
  options: string[];
  correct_idx?: number;
  explanation?: string;
}

export interface SkillAssessmentItem {
  id: string;
  user_id: string;
  session_id?: string;
  skill_name: string;
  topic: string;
  status: 'scheduled' | 'available' | 'completed' | string;
  available_at: string;
  is_available: boolean;
  questions: AssessmentQuestionItem[];
  questions_count?: number;
  submitted_answers?: Record<string, number>;
  score: number;
  percentage: number;
  badge_awarded?: 'BRONZE' | 'SILVER' | 'GOLD' | string;
  feedback?: string;
  created_at: string;
  completed_at?: string;
}

export interface AppNotification {
  id: string;
  type: 'match' | 'session' | 'wallet' | 'message' | 'review' | 'system' | string;
  title: string;
  message: string;
  is_read: boolean;
  read?: boolean;
  link?: string;
  actionUrl?: string;
  avatar?: string;
  timestamp?: string;
  created_at: string;
}

export interface PopularSkillCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  iconName?: string;
  learnerCount?: number;
  topSkills?: string[];
}

export interface WalletInfo {
  available_balance: number;
  pending_balance: number;
  earned_total: number;
  spent_total: number;
  purchased_total: number;
  updated_at?: string;
}

export interface TokenTransactionItem {
  id: string;
  type: 'earned' | 'spent' | 'purchased' | 'pending' | 'refunded';
  amount: number;
  description: string;
  status: 'completed' | 'pending' | 'cancelled' | 'refunded';
  reference_id?: string;
  created_at: string;
}

export interface TokenPackageItem {
  id: string;
  name: string;
  tokens: number;
  price_inr: number;
  is_popular: boolean;
  badge?: string;
}

export interface SubscriptionPlanItem {
  id: string;
  name: string;
  slug: string;
  price_inr: number;
  tokens_per_month: number;
  ai_requests_per_month: number;
  features: string[];
  is_popular: boolean;
}

export interface UserSubscriptionInfo {
  id?: string;
  plan_slug: string;
  plan_name: string;
  status: string;
  ai_requests_used: number;
  ai_requests_limit: number;
  tokens_per_month: number;
  current_period_start?: string;
  current_period_end?: string;
}

export interface PaymentRecord {
  id: string;
  razorpay_order_id: string;
  razorpay_payment_id?: string;
  amount_inr: number;
  currency: string;
  purpose: string;
  tokens_credited: number;
  status: string;
  created_at: string;
}

export interface AIRoadmapPhase {
  phase_number: number;
  title: string;
  duration: string;
  objectives: string[];
  key_topics: string[];
  practice_tasks: string[];
  checkpoint_question: string;
}

export interface AIRoadmapResponse {
  title: string;
  overview: string;
  estimated_hours_total: number;
  recommended_sessions: number;
  phases: AIRoadmapPhase[];
}

export interface AdminAnalytics {
  total_users: number;
  active_users: number;
  total_sessions: number;
  completed_sessions: number;
  total_revenue_inr: number;
  total_tokens_circulating: number;
  total_skills_offered: number;
  total_learning_goals: number;
  active_subscriptions: number;
}
