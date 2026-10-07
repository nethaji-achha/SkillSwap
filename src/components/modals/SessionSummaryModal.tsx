'use client';

import React, { useState, useEffect } from 'react';
import { SessionSummaryItem } from '@/types';
import { sessionService } from '@/services/session.service';
import { 
  X, 
  Sparkles, 
  BookOpen, 
  Lightbulb, 
  HelpCircle, 
  CheckCircle, 
  ArrowRight, 
  Calendar, 
  Clock, 
  Loader2,
  Award
} from 'lucide-react';

interface SessionSummaryModalProps {
  sessionId?: string;
  summary?: SessionSummaryItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SessionSummaryModal({ sessionId, summary: initialSummary, isOpen, onClose }: SessionSummaryModalProps) {
  const [summary, setSummary] = useState<SessionSummaryItem | null>(initialSummary || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialSummary) {
        setSummary(initialSummary);
      } else if (sessionId) {
        fetchSummary(sessionId);
      }
    }
  }, [isOpen, sessionId, initialSummary]);

  const fetchSummary = async (id: string) => {
    try {
      setLoading(true);
      setError('');
      const data = await sessionService.getSessionSummary(id);
      setSummary(data);
    } catch (err: any) {
      setError('Summary not found or session is not yet completed.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col my-8 animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-brand-blue/5 via-brand-green/5 to-transparent border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-green to-brand-blue flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-slate-900 text-lg">AI Learning Summary</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 border border-amber-500/20 flex items-center gap-1">
                  <Award className="w-3 h-3 text-amber-600" /> Bronze Awarded
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {summary?.skill_name || 'Skill Exchange'} • 1-on-1 Mentorship Session
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700 text-xs">
          {loading ? (
            <div className="py-16 text-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-brand-blue" />
              Generating comprehensive session summary...
            </div>
          ) : error ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <p className="font-semibold">{error}</p>
              <p className="text-[11px] text-slate-400">Summaries are automatically created when a session is completed.</p>
            </div>
          ) : summary ? (
            <>
              {/* Metadata strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Mentor</span>
                  <span className="font-bold text-slate-800 text-xs truncate block">{summary.teacher_name}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Learner</span>
                  <span className="font-bold text-slate-800 text-xs truncate block">{summary.learner_name}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Duration</span>
                  <span className="font-bold text-slate-800 text-xs flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" /> {summary.duration_minutes} mins
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Date</span>
                  <span className="font-bold text-slate-800 text-xs flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" /> {new Date(summary.session_date).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Learning Objective */}
              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-brand-blue" />
                  Learning Objective
                </h4>
                <p className="bg-brand-blue/5 border border-brand-blue/15 p-3.5 rounded-xl text-slate-700 leading-relaxed text-xs">
                  {summary.learning_objective || 'Master core concepts and real-world techniques.'}
                </p>
              </div>

              {/* Key Concepts */}
              {summary.key_concepts && summary.key_concepts.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-brand-green-dark" />
                    Key Concepts Covered
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {summary.key_concepts.map((concept, i) => (
                      <div key={i} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-green-dark mt-1.5 flex-shrink-0" />
                        <span className="text-slate-700 font-medium">{concept}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Practical Tips */}
              {summary.practical_tips && summary.practical_tips.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                    Practical Tips & Mentor Insights
                  </h4>
                  <div className="space-y-2">
                    {summary.practical_tips.map((tip, i) => (
                      <div key={i} className="flex items-start gap-2.5 bg-amber-500/5 border border-amber-500/15 p-3 rounded-xl">
                        <span className="font-black text-amber-700 text-xs">#{i + 1}</span>
                        <span className="text-slate-700">{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Questions Discussed */}
              {summary.questions_discussed && summary.questions_discussed.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-brand-blue" />
                    Questions & Solutions Discussed
                  </h4>
                  <div className="space-y-2">
                    {summary.questions_discussed.map((q, i) => (
                      <div key={i} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-700">
                        <p className="font-semibold text-slate-900">{q}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Next Steps & Scheduled Assessment Notice */}
              <div className="p-4 bg-gradient-to-r from-brand-blue/10 to-brand-green/10 rounded-2xl border border-brand-blue/20 space-y-2">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-brand-blue" />
                  <h5 className="font-bold text-slate-900 text-xs">Bronze Badge Unlocked & Assessment Scheduled</h5>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Your Bronze badge is awarded. Your 5-question Skill Assessment will unlock in 2 days. Score 60–79% to earn <strong className="text-slate-800">Silver</strong> or 80–100% to achieve <strong className="text-amber-700">Gold</strong>!
                </p>
              </div>
            </>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition"
          >
            Close Summary
          </button>
        </div>
      </div>
    </div>
  );
}
