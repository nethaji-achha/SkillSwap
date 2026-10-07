import { authService } from './auth.service';
import { userService } from './user.service';
import { skillService } from './skill.service';
import { matchService } from './match.service';
import { walletService } from './wallet.service';
import { paymentService } from './payment.service';
import { subscriptionService } from './subscription.service';
import { sessionService } from './session.service';
import { messageService } from './message.service';
import { reviewService } from './review.service';
import { notificationService } from './notification.service';
import { aiService } from './ai.service';
import { adminService } from './admin.service';

export {
  authService,
  userService,
  skillService,
  matchService,
  walletService,
  paymentService,
  subscriptionService,
  sessionService,
  messageService,
  reviewService,
  notificationService,
  aiService,
  adminService
};

// Unified facade export
export const apiService = {
  getCurrentUser: () => authService.getCurrentUser(),
  updateProfile: (data: any) => userService.updateMyProfile(data),
  getUserById: (id: string) => userService.getUserById(id),
  getCommunityUsers: (filter?: any) => userService.getCommunityUsers(filter),
  getPopularCategories: () => skillService.getCategories(),
  getMySkills: () => skillService.getMySkills(),
  addSkill: (type: 'teach' | 'learn', skill: any) => skillService.addSkill({ ...skill, skill_type: type, skill_name: skill.name }),
  updateSkill: (id: string, updates: any) => skillService.updateSkill(id, updates),
  deleteSkill: (id: string) => skillService.deleteSkill(id),
  getRecommendedMatches: (tab?: string) => matchService.getRecommendedMatches(tab),
  getSessions: (filter?: string) => sessionService.getMySessions(filter),
  getSessionById: (id: string) => sessionService.getSessionById(id),
  bookSession: (data: any) => sessionService.bookSession(data),
  completeSession: (id: string) => sessionService.completeSession(id),
  cancelSession: (id: string) => sessionService.cancelSession(id),
  submitReview: (data: any) => reviewService.submitReview(data),
  getConversations: () => messageService.getConversations(),
  getMessages: (partnerId: string) => messageService.getMessages(partnerId),
  sendMessage: (receiverId: string, content: string) => messageService.sendMessage(receiverId, content),
  getNotifications: () => notificationService.getNotifications(),
  markNotificationRead: (id: string) => notificationService.markAsRead(id),
  markAllNotificationsRead: () => notificationService.markAllAsRead(),
  getWalletBalance: () => walletService.getBalance(),
  getTransactions: (type?: string) => walletService.getTransactions(type),
  getTokenPackages: () => walletService.getPackages(),
  getSubscriptionPlans: () => subscriptionService.getPlans(),
  getCurrentSubscription: () => subscriptionService.getCurrentSubscription(),
  createPaymentOrder: (data: any) => paymentService.createOrder(data),
  verifyPayment: (data: any) => paymentService.verifyPayment(data),
  generateAIRoadmap: (data: any) => aiService.generateRoadmap(data),
  getAIPricingRecommendation: (data: any) => aiService.getPricingRecommendation(data),
  chatWithAIMentor: (msg: string) => aiService.chatWithMentor(msg)
};
