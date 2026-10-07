'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSkillSwap } from '@/context/SkillSwapContext';
import { aiService } from '@/services/ai.service';
import { AIRoadmapResponse } from '@/types';
import { 
  Bot, 
  Send, 
  Sparkles, 
  BookOpen, 
  CheckCircle2, 
  Loader2,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  Cpu
} from 'lucide-react';
import Link from 'next/link';

interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  roadmap?: AIRoadmapResponse;
  timestamp: string;
}

export default function AIAssistantPage() {
  const { user, subscription } = useSkillSwap();
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'init',
      role: 'assistant',
      content: `### 👋 Hi ${user?.name ? user.name.split(' ')[0] : 'Member'}! I am **Skill Swap AI Mentor**.
      
I can help you with:
- 🗺 **Custom Learning Roadmaps** (e.g. *"I want to learn Next.js & React in 30 days"*)
- 💡 **Skill Pricing Advice** (How many tokens to charge for your expertise)
- 📋 **Session Preparation Questions** to ask during peer exchanges.

What would you like to explore or plan today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (customPrompt?: string) => {
    const text = customPrompt || input;
    if (!text.trim()) return;

    const userMsg: AIMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      if (text.toLowerCase().includes('roadmap') || text.toLowerCase().includes('in 30 days') || text.toLowerCase().includes('learn')) {
        const skillName = text.replace(/i want to learn|generate a roadmap for|roadmap for|in 30 days/gi, '').trim() || 'Software Engineering';
        const roadmapData = await aiService.generateRoadmap({
          skill_to_learn: skillName,
          current_level: 'Beginner',
          target_goal: 'Practical application & peer exchange',
          duration_days: 30
        });

        const aiMsg: AIMessage = {
          id: `ai_${Date.now()}`,
          role: 'assistant',
          content: `Here is your customized **${roadmapData.title}**:`,
          roadmap: roadmapData,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        const res = await aiService.chatWithMentor(text);
        const aiMsg: AIMessage = {
          id: `ai_${Date.now()}`,
          role: 'assistant',
          content: res.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch (err: any) {
      const errorMsg: AIMessage = {
        id: `ai_err_${Date.now()}`,
        role: 'assistant',
        content: err.message || 'AI assistant is not configured yet. Please check your backend GEMINI_API_KEY environment variable.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
        {/* Header */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-brand-blue text-white flex items-center justify-center font-bold shadow-md shadow-brand-blue/20">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900">Skill Swap AI Mentor</h1>
                <span className="text-[10px] font-bold bg-brand-blue/10 text-brand-blue-dark px-2 py-0.5 rounded-full border border-brand-blue/20">
                  Google Gemini
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Curriculum roadmaps, study checkpoints, and peer preparation
              </p>
            </div>
          </div>

          {/* AI Usage Quota Pill */}
          <div className="bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-2xl text-xs space-y-0.5">
            <div className="flex items-center justify-between gap-3 text-slate-500 font-medium">
              <span>AI Usage:</span>
              <strong className="text-brand-blue">
                {subscription?.ai_requests_used || 0} / {subscription?.ai_requests_limit || 15}
              </strong>
            </div>
            <div className="text-[10px] text-slate-400">Separate from 🪙 Skill Tokens</div>
          </div>
        </div>

        {/* Quick Prompt Starters */}
        <div className="flex flex-wrap gap-2">
          {[
            'I want to learn React in 30 days',
            'Generate a Figma to Code roadmap',
            'Recommend token pricing for teaching Python',
            'What questions should I ask in my first session?'
          ].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="px-3 py-1.5 bg-white border border-slate-200 hover:border-brand-blue/30 hover:bg-brand-blue/5 text-slate-700 rounded-xl text-xs font-semibold transition text-left"
            >
              💡 {prompt}
            </button>
          ))}
        </div>

        {/* Messages Container */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[520px]">
          <div className="flex-1 p-6 overflow-y-auto space-y-5 bg-slate-50/30">
            {messages.map((m) => {
              const isUser = m.role === 'user';
              return (
                <div key={m.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl p-4 text-xs ${
                    isUser
                      ? 'bg-brand-blue text-white rounded-br-xs shadow-sm'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs shadow-sm space-y-3'
                  }`}>
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {m.content}
                    </div>

                    {/* Render Rich Roadmap if attached */}
                    {m.roadmap && (
                      <div className="mt-3 bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4 text-slate-900">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <span className="font-bold text-sm text-brand-blue">{m.roadmap.title}</span>
                          <span className="text-[11px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border">
                            ⏱ {m.roadmap.estimated_hours_total} Estimated Hours
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{m.roadmap.overview}</p>

                        <div className="space-y-3">
                          {m.roadmap.phases.map((phase) => (
                            <div key={phase.phase_number} className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                              <div className="flex items-center justify-between">
                                <h4 className="font-bold text-xs text-slate-900">
                                  Phase {phase.phase_number}: {phase.title}
                                </h4>
                                <span className="text-[10px] font-bold text-brand-blue bg-brand-blue/10 px-2 py-0.5 rounded">
                                  {phase.duration}
                                </span>
                              </div>

                              <div className="space-y-1 text-[11px] text-slate-600">
                                <div className="font-semibold text-slate-700">Practice Tasks:</div>
                                {phase.practice_tasks.map((t, idx) => (
                                  <div key={idx} className="flex items-start gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-green-dark shrink-0 mt-0.5" />
                                    <span>{t}</span>
                                  </div>
                                ))}
                              </div>

                              <div className="p-2 bg-brand-orange/5 border border-brand-orange/20 rounded-lg text-[11px] text-brand-orange-dark">
                                <strong>Checkpoint:</strong> {phase.checkpoint_question}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="pt-2 flex items-center justify-between text-xs">
                          <span className="text-slate-500">Ready to start?</span>
                          <Link
                            href="/discover"
                            className="inline-flex items-center gap-1 font-bold text-brand-blue hover:text-brand-blue-dark"
                          >
                            Find Mentors for this Roadmap →
                          </Link>
                        </div>
                      </div>
                    )}

                    <div className={`text-[9px] mt-1 text-right ${isUser ? 'text-blue-100' : 'text-slate-400'}`}>
                      {m.timestamp}
                    </div>
                  </div>
                </div>
              );
            })}
            {isTyping && (
              <div className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-2xl w-32 shadow-sm text-xs text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin text-brand-blue" />
                <span>Thinking...</span>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input Bar */}
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-4 border-t border-slate-200 bg-white flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask for a roadmap (e.g. 'I want to learn Python in 30 days')..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-white"
            />
            <button
              type="submit"
              disabled={isTyping || !input.trim()}
              className="px-4 py-2.5 bg-gradient-to-r from-brand-green to-brand-blue hover:opacity-95 text-white rounded-xl shadow-md shadow-brand-blue/15 transition disabled:opacity-50 flex items-center gap-1.5 text-xs font-bold"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Ask AI</span>
            </button>
          </form>
        </div>
      </div>
  );
}
