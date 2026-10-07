'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSkillSwap } from '@/context/SkillSwapContext';
import { messageService } from '@/services/message.service';
import { Conversation, ChatMessage } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { ScheduleSessionModal } from '@/components/modals/ScheduleSessionModal';
import { 
  Send, 
  Search, 
  MessageSquare, 
  Calendar,
  Loader2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function MessagesPage() {
  const { user, conversations: globalConversations } = useSkillSwap();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activePartnerId, setActivePartnerId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [loading, setLoading] = useState<boolean>(true);
  const [sending, setSending] = useState<boolean>(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchConvos = async () => {
      try {
        setLoading(true);
        const convos = await messageService.getConversations();
        setConversations(convos);
        if (convos.length > 0 && !activePartnerId) {
          setActivePartnerId(convos[0].partnerId);
        }
      } catch (err) {
        console.error('Failed to load conversations', err);
      } finally {
        setLoading(false);
      }
    };
    fetchConvos();
  }, []);

  useEffect(() => {
    if (activePartnerId) {
      const fetchThread = async () => {
        try {
          const msgs = await messageService.getMessages(activePartnerId);
          setMessages(msgs);
        } catch (err) {
          console.error(err);
        }
      };
      fetchThread();
    }
  }, [activePartnerId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const activeConvo = conversations.find((c) => c.partnerId === activePartnerId);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activePartnerId) return;

    const textToSend = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      const res = await messageService.sendMessage(activePartnerId, textToSend);
      setMessages((prev) => [
        ...prev,
        {
          id: res.id,
          senderId: user?.id || 'me',
          text: textToSend,
          timestamp: new Date().toISOString(),
          isMe: true
        }
      ]);
    } catch (err) {
      console.error('Failed to send message', err);
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = conversations.filter((c) =>
    c.partnerName.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <>
      <div className="h-[calc(100vh-8.5rem)] md:h-[calc(100vh-7rem)] bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex animate-in fade-in duration-200">
        {/* Left Sidebar: Conversation List */}
        <div className="w-full sm:w-80 md:w-88 border-r border-slate-200 flex flex-col shrink-0 bg-slate-50/50">
          <div className="p-4 border-b border-slate-200 bg-white">
            <h2 className="text-lg font-bold text-slate-900 mb-3">Messages</h2>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full bg-slate-100 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {loading ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-brand-blue" />
                Loading conversations...
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                <p className="text-xs font-semibold text-slate-700">No conversations yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Request a skill swap from the Discover or Matches tab to start chatting.
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isActive = conv.partnerId === activePartnerId;
                return (
                  <button
                    key={conv.id}
                    onClick={() => setActivePartnerId(conv.partnerId)}
                    className={`w-full p-4 flex items-start gap-3.5 text-left transition-colors ${
                      isActive ? 'bg-brand-blue/10 border-r-4 border-brand-blue' : 'hover:bg-slate-100/60'
                    }`}
                  >
                    <Avatar src={conv.partnerAvatar} name={conv.partnerName} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-bold text-slate-900 text-xs truncate">
                          {conv.partnerName}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(conv.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">{conv.lastMessage}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Area: Chat conversation */}
        <div className="flex-1 flex flex-col bg-white">
          {activeConvo ? (
            <>
              {/* Active Conversation Header */}
              <div className="px-6 py-3.5 border-b border-slate-200 flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <Avatar src={activeConvo.partnerAvatar} name={activeConvo.partnerName} size="md" />
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{activeConvo.partnerName}</h3>
                    <p className="text-[11px] text-slate-400">{activeConvo.partnerHeadline || 'Skill Swap Partner'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setScheduleModalOpen(true)}
                    className="px-3 py-1.5 bg-brand-green/10 hover:bg-brand-green/20 text-brand-green-dark font-bold text-xs rounded-xl transition flex items-center gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Schedule Session</span>
                  </button>
                  <Link
                    href={`/profile/${activeConvo.partnerId}`}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
                  >
                    Profile
                  </Link>
                </div>
              </div>

              {/* Messages scroll body */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/30">
                {messages.length === 0 ? (
                  <div className="py-20 text-center text-slate-400 text-xs">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                    <p className="font-semibold text-slate-700">Start the conversation</p>
                    <p className="text-slate-400 mt-0.5">Send a message to propose your skill exchange or schedule a session.</p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMe = m.senderId === user?.id || m.isMe;
                    return (
                      <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs ${
                          isMe
                            ? 'bg-brand-blue text-white rounded-br-xs shadow-sm'
                            : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs shadow-sm'
                        }`}>
                          <p className="leading-relaxed">{m.text}</p>
                          <div className={`text-[9px] mt-1 text-right ${isMe ? 'text-blue-100' : 'text-slate-400'}`}>
                            {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message input bar */}
              <form onSubmit={handleSend} className="p-4 border-t border-slate-200 bg-white flex items-center gap-2">
                <input
                  type="text"
                  placeholder={`Message ${activeConvo.partnerName}...`}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-white"
                />
                <button
                  type="submit"
                  disabled={sending || !inputText.trim()}
                  className="p-2.5 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-xl shadow-md shadow-brand-blue/20 transition disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <MessageSquare className="w-12 h-12 text-slate-300 mb-3" />
              <h3 className="text-base font-bold text-slate-800">No active conversation selected</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Select a conversation from the left or discover new peers to connect with.
              </p>
            </div>
          )}
        </div>
      </div>

      <ScheduleSessionModal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        defaultPartner={activeConvo ? {
          id: activeConvo.partnerId,
          name: activeConvo.partnerName,
          headline: activeConvo.partnerHeadline || '',
          bio: '',
          location: '',
          avatar: activeConvo.partnerAvatar,
          rating: 5.0,
          reviewsCount: 0,
          sessionsCompleted: 0,
          skillsTeaching: [],
          skillsLearning: [],
          availability: []
        } : undefined}
      />
    </>
  );
}
