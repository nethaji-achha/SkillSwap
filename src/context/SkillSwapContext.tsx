'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  UserProfile, 
  SkillMatch, 
  LearningSession, 
  Conversation, 
  ChatMessage, 
  AppNotification, 
  PopularSkillCategory,
  SkillItem,
  WalletInfo,
  UserSubscriptionInfo
} from '@/types';
import { 
  authService, 
  userService, 
  skillService, 
  matchService, 
  walletService, 
  subscriptionService, 
  sessionService, 
  messageService, 
  notificationService,
  reviewService
} from '@/services/api';

interface SkillSwapContextType {
  user: UserProfile | null;
  wallet: WalletInfo | null;
  subscription: UserSubscriptionInfo | null;
  communityUsers: UserProfile[];
  matches: SkillMatch[];
  sessions: LearningSession[];
  conversations: Conversation[];
  notifications: AppNotification[];
  categories: PopularSkillCategory[];
  unreadNotificationCount: number;
  unreadMessageCount: number;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Actions
  refreshUserAndWallet: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  addUserSkill: (type: 'teach' | 'learn', skill: any) => Promise<void>;
  removeUserSkill: (skillId: string) => Promise<void>;
  bookLearningSession: (data: {
    teacherId: string;
    skillName: string;
    scheduledAt: string;
    durationMinutes: number;
    tokenPrice: number;
    objective?: string;
  }) => Promise<any>;
  completeSession: (sessionId: string, reviewData?: {
    overall_rating: number;
    knowledge: number;
    communication: number;
    reliability: number;
    teaching: number;
    professionalism: number;
    comment: string;
  }) => Promise<void>;
  cancelSession: (sessionId: string) => Promise<void>;
  sendMessage: (receiverId: string, text: string) => Promise<any>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  logout: () => void;
  
  // Quick Swap Modal Global State
  activeSwapModalUser: UserProfile | null;
  openSwapModal: (user: UserProfile) => void;
  closeSwapModal: () => void;

  // Toast / Feedback message
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const SkillSwapContext = createContext<SkillSwapContextType | undefined>(undefined);

export const SkillSwapProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [subscription, setSubscription] = useState<UserSubscriptionInfo | null>(null);
  const [communityUsers, setCommunityUsers] = useState<UserProfile[]>([]);
  const [matches, setMatches] = useState<SkillMatch[]>([]);
  const [sessions, setSessions] = useState<LearningSession[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [categories, setCategories] = useState<PopularSkillCategory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeSwapModalUser, setActiveSwapModalUser] = useState<UserProfile | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Categories (public)
      try {
        const catData = await skillService.getCategories();
        setCategories(catData || []);
      } catch (err) {}

      // 2. Auth & User Profile
      if (authService.isAuthenticated()) {
        try {
          const meData = await authService.getCurrentUser();
          if (meData) {
            setUser({
              id: meData.id,
              name: meData.full_name,
              username: meData.username || meData.profile?.username || '',
              email: meData.email,
              headline: meData.profile?.headline || '',
              bio: meData.profile?.bio || '',
              location: meData.profile?.location || '',
              avatar: meData.profile?.avatar_url || '',
              rating: meData.profile?.reputation_score ?? 5.0,
              reviewsCount: meData.profile?.rating_count ?? 0,
              sessionsCompleted: meData.profile?.completed_sessions ?? 0,
              teachingHours: meData.profile?.teaching_hours ?? 0,
              learningHours: meData.profile?.learning_hours ?? 0,
              availability: meData.profile?.availability || [],
              languages: meData.profile?.languages || ['English'],
              interests: meData.profile?.interests || [],
              experience: meData.profile?.experience || [],
              education: meData.profile?.education || [],
              projects: meData.profile?.projects || [],
              certifications: meData.profile?.certifications || [],
              socialLinks: meData.profile?.social_links || {},
              social_links: meData.profile?.social_links || {},
              isVerified: meData.is_verified,
              role: meData.role,
              onboardingCompleted: meData.profile?.onboarding_completed,
              skillsTeaching: [],
              skillsLearning: []
            });

            if (meData.wallet) {
              setWallet(meData.wallet);
            }
            if (meData.subscription) {
              setSubscription(meData.subscription);
            }
          }
        } catch (authErr) {
          // Token expired
          console.warn('Auth check error', authErr);
        }

        // 3. User skills, matches, sessions, messages, notifications, wallet
        try {
          const [skillsData, matchData, sessionData, convoData, notifData, walletData, subData] = await Promise.all([
            skillService.getMySkills().catch(() => ({ skillsTeaching: [], skillsLearning: [] })),
            matchService.getRecommendedMatches('all').catch(() => []),
            sessionService.getMySessions('all').catch(() => []),
            messageService.getConversations().catch(() => []),
            notificationService.getNotifications().catch(() => []),
            walletService.getBalance().catch(() => null),
            subscriptionService.getCurrentSubscription().catch(() => null),
          ]);

          if (skillsData) {
            setUser((prev) => prev ? {
              ...prev,
              skillsTeaching: skillsData.skillsTeaching,
              skillsLearning: skillsData.skillsLearning
            } : null);
          }

          setMatches(matchData || []);
          setSessions(sessionData || []);
          setConversations(convoData || []);
          setNotifications(notifData || []);
          if (walletData) setWallet(walletData);
          if (subData) setSubscription(subData);
        } catch (fetchErr) {
          console.error('Error loading private data', fetchErr);
        }
      }

      // 4. Community Users
      try {
        const commData = await userService.getCommunityUsers();
        setCommunityUsers(commData || []);
      } catch (err) {}

    } catch (globalErr) {
      console.error('Global data load error:', globalErr);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const refreshUserAndWallet = async () => {
    try {
      const [walletData, subData, skillsData, meData] = await Promise.all([
        walletService.getBalance().catch(() => null),
        subscriptionService.getCurrentSubscription().catch(() => null),
        skillService.getMySkills().catch(() => null),
        authService.getCurrentUser().catch(() => null)
      ]);
      if (walletData) setWallet(walletData);
      if (subData) setSubscription(subData);
      if (meData) {
        setUser((prev) => ({
          id: meData.id,
          name: meData.full_name,
          username: meData.username || meData.profile?.username || '',
          email: meData.email,
          headline: meData.profile?.headline || '',
          bio: meData.profile?.bio || '',
          location: meData.profile?.location || '',
          avatar: meData.profile?.avatar_url || '',
          rating: meData.profile?.reputation_score ?? 5.0,
          reviewsCount: meData.profile?.rating_count ?? 0,
          sessionsCompleted: meData.profile?.completed_sessions ?? 0,
          teachingHours: meData.profile?.teaching_hours ?? 0,
          learningHours: meData.profile?.learning_hours ?? 0,
          availability: meData.profile?.availability || [],
          languages: meData.profile?.languages || ['English'],
          interests: meData.profile?.interests || [],
          experience: meData.profile?.experience || [],
          education: meData.profile?.education || [],
          projects: meData.profile?.projects || [],
          certifications: meData.profile?.certifications || [],
          socialLinks: meData.profile?.social_links || {},
          social_links: meData.profile?.social_links || {},
          isVerified: meData.is_verified,
          role: meData.role,
          onboardingCompleted: meData.profile?.onboarding_completed,
          skillsTeaching: skillsData ? skillsData.skillsTeaching : (prev?.skillsTeaching || []),
          skillsLearning: skillsData ? skillsData.skillsLearning : (prev?.skillsLearning || [])
        }));
      }
    } catch (err) {
      console.error('Error refreshing wallet', err);
    }
  };

  const updateUserProfile = async (updates: any) => {
    try {
      const res = await userService.updateMyProfile(updates);
      setUser((prev) => (prev ? {
        ...prev,
        ...updates,
        name: updates.full_name || updates.name || prev.name,
        username: updates.username || prev.username,
        avatar: updates.avatar_url || updates.avatar || prev.avatar,
        socialLinks: updates.social_links || updates.socialLinks || prev.socialLinks,
        social_links: updates.social_links || updates.socialLinks || prev.social_links
      } : null));
      showToast('Profile updated successfully!');
      return res;
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile');
      throw err;
    }
  };

  const addUserSkill = async (type: 'teach' | 'learn', skill: any) => {
    try {
      await skillService.addSkill({
        ...skill,
        skill_type: type,
        skill_name: skill.name || skill.skill_name
      });
      const updatedSkills = await skillService.getMySkills();
      setUser((prev) => prev ? {
        ...prev,
        skillsTeaching: updatedSkills.skillsTeaching,
        skillsLearning: updatedSkills.skillsLearning
      } : null);
      showToast(`Added ${skill.name || skill.skill_name} to skills!`);
    } catch (err: any) {
      showToast(err.message || 'Failed to add skill');
      throw err;
    }
  };

  const removeUserSkill = async (skillId: string) => {
    try {
      await skillService.deleteSkill(skillId);
      const updatedSkills = await skillService.getMySkills();
      setUser((prev) => prev ? {
        ...prev,
        skillsTeaching: updatedSkills.skillsTeaching,
        skillsLearning: updatedSkills.skillsLearning
      } : null);
      showToast('Skill removed.');
    } catch (err: any) {
      showToast(err.message || 'Failed to remove skill');
      throw err;
    }
  };

  const bookLearningSession = async (data: {
    teacherId: string;
    skillName: string;
    scheduledAt: string;
    durationMinutes: number;
    tokenPrice: number;
    objective?: string;
  }) => {
    try {
      const res = await sessionService.bookSession({
        teacher_id: data.teacherId,
        skill_name: data.skillName,
        scheduled_at: data.scheduledAt,
        duration_minutes: data.durationMinutes,
        token_price: data.tokenPrice,
        objective: data.objective || ''
      });
      await refreshUserAndWallet();
      const freshSessions = await sessionService.getMySessions('all');
      setSessions(freshSessions);
      showToast('Session booked! Tokens reserved in escrow.');
      return res;
    } catch (err: any) {
      showToast(err.message || 'Failed to book session');
      throw err;
    }
  };

  const completeSession = async (sessionId: string, reviewData?: any) => {
    try {
      await sessionService.completeSession(sessionId);
      if (reviewData) {
        await reviewService.submitReview({
          session_id: sessionId,
          ...reviewData
        });
      }
      await refreshUserAndWallet();
      const freshSessions = await sessionService.getMySessions('all');
      setSessions(freshSessions);
      showToast('Session completed & tokens released! 🎉');
    } catch (err: any) {
      showToast(err.message || 'Failed to complete session');
      throw err;
    }
  };

  const cancelSession = async (sessionId: string) => {
    try {
      await sessionService.cancelSession(sessionId);
      await refreshUserAndWallet();
      const freshSessions = await sessionService.getMySessions('all');
      setSessions(freshSessions);
      showToast('Session cancelled & tokens refunded.');
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel session');
      throw err;
    }
  };

  const sendMessage = async (receiverId: string, text: string) => {
    try {
      const res = await messageService.sendMessage(receiverId, text);
      const convos = await messageService.getConversations();
      setConversations(convos);
      return res;
    } catch (err: any) {
      showToast(err.message || 'Failed to send message');
      throw err;
    }
  };

  const markNotificationAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {}
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {}
  };

  const logout = () => {
    authService.logout();
  };

  const openSwapModal = (targetUser: UserProfile) => {
    setActiveSwapModalUser(targetUser);
  };

  const closeSwapModal = () => {
    setActiveSwapModalUser(null);
  };

  const unreadNotificationCount = notifications.filter((n) => !n.is_read).length;
  const unreadMessageCount = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  return (
    <SkillSwapContext.Provider
      value={{
        user,
        wallet,
        subscription,
        communityUsers,
        matches,
        sessions,
        conversations,
        notifications,
        categories,
        unreadNotificationCount,
        unreadMessageCount,
        isLoading,
        isAuthenticated: !!user,
        refreshUserAndWallet,
        updateUserProfile,
        addUserSkill,
        removeUserSkill,
        bookLearningSession,
        completeSession,
        cancelSession,
        sendMessage,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        logout,
        activeSwapModalUser,
        openSwapModal,
        closeSwapModal,
        toastMessage,
        showToast
      }}
    >
      {children}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}
    </SkillSwapContext.Provider>
  );
};

export const useSkillSwap = () => {
  const context = useContext(SkillSwapContext);
  if (!context) {
    throw new Error('useSkillSwap must be used within a SkillSwapProvider');
  }
  return context;
};
