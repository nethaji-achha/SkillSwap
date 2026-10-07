import { apiClient } from './api-client';
import { Conversation, ChatMessage } from '@/types';

export const messageService = {
  async getConversations(): Promise<Conversation[]> {
    const raw = await apiClient.get<any[]>('/messages/conversations');
    return raw.map((c) => ({
      id: c.id,
      partnerId: c.partner_id,
      partnerName: c.partner_name,
      partnerAvatar: c.partner_avatar,
      partnerHeadline: c.partner_headline,
      lastMessage: c.last_message,
      lastMessageTime: c.last_message_at,
      unreadCount: c.unread_count
    }));
  },

  async getMessages(partnerId: string): Promise<ChatMessage[]> {
    const raw = await apiClient.get<any[]>(`/messages/conversation/${partnerId}`);
    return raw.map((m) => ({
      id: m.id,
      senderId: m.sender_id,
      text: m.content,
      timestamp: m.created_at,
      isMe: false // Calculated in UI relative to current user ID
    }));
  },

  async sendMessage(receiverId: string, content: string) {
    return apiClient.post<any>('/messages/send', {
      receiver_id: receiverId,
      content
    });
  }
};
