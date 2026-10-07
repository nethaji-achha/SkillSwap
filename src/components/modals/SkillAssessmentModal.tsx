'use client';

import React, { useState, useEffect } from 'react';
import { SkillAssessmentItem } from '@/types';
import { skillService } from '@/services/skill.service';
import { 
  X, 
  Award, 
  CheckCircle2, 
  HelpCircle, 
  Sparkles, 
  Clock, 
  Loader2, 
  Lock, 
  AlertCircle,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

interface SkillAssessmentModalProps {
  assessmentId: string;
  isOpen: boolean;
  onClose: () => void;
  onCompleted?: () => void;
}

export function SkillAssessmentModal({ assessmentId, isOpen, onClose, onCompleted }: SkillAssessmentModalProps) {
  const [assessment, setAssessment] = useState<SkillAssessmentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && assessmentId) {
      loadAssessment();
    }
  }, [isOpen, assessmentId]);

  const loadAssessment = async () => {
    try {
      setLoading(true);
      setError('');
      setResult(null);
      const data = await skillService.getAssessmentById(assessmentId);
      setAssessment(data);
      if (data.status === 'completed') {
        setResult({
          score: data.score,
          percentage: data.percentage,
          badge_awarded: data.badge_awarded,
          feedback: data.feedback,
          completed_at: data.completed_at
        });
        if (data.submitted_answers) {
          setAnswers(data.submitted_answers);
        }
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to load assessment details.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    if (assessment?.status === 'completed' || result) return;
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIdx
    }));
  };

  const handleSubmit = async () => {
    if (!assessment) return;
    const questions = assessment.questions || [];
    const unanswered = questions.filter(q => answers[q.id] === undefined);
    if (unanswered.length > 0) {
      if (!confirm(`You have ${unanswered.length} unanswered questions. Submit anyway?`)) {
        return;
      }
    }

    try {
      setSubmitting(true);
      setError('');
      const res = await skillService.submitAssessment(assessment.id, answers);
      setResult(res);
      // Reload full assessment with explanations and answers
      const updated = await skillService.getAssessmentById(assessment.id);
      setAssessment(updated);
      if (onCompleted) {
        onCompleted();
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to submit assessment.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const isLocked = assessment && !assessment.is_available && assessment.status === 'scheduled';
  const availableDate = assessment ? new Date(assessment.available_at) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col my-8 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-brand-blue/5 via-brand-green/5 to-transparent border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md ${
              result?.badge_awarded === 'GOLD' 
                ? 'bg-amber-500'
                : result?.badge_awarded === 'SILVER'
                ? 'bg-slate-400'
                : 'bg-gradient-to-br from-brand-blue to-brand-green'
            }`}>
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-slate-900 text-lg">{assessment?.skill_name || 'Skill'} Assessment</h3>
                {assessment?.status === 'completed' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-green/10 text-brand-green-dark border border-brand-green/30">
                    Completed
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Unlock Silver (60–79%) or Gold (80–100%) Badge
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700 text-xs">
          {loading ? (
            <div className="py-16 text-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-brand-blue" />
              Loading skill assessment questions...
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          ) : isLocked ? (
            /* Locked State (Scheduled 2 days out) */
            <div className="py-12 px-6 text-center space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
                <Lock className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-base">Assessment Scheduled</h4>
                <p className="text-xs text-slate-500 mt-1">
                  To give you time to revise and practice, this assessment unlocks on:
                </p>
                <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100 font-bold text-slate-800 flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4 text-brand-blue" />
                  {availableDate?.toLocaleDateString()} at {availableDate?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <p className="text-[11px] text-slate-400">
                You currently hold the <strong className="text-amber-700">BRONZE</strong> badge for {assessment?.skill_name}.
              </p>
            </div>
          ) : assessment ? (
            <>
              {/* Completed Results Banner */}
              {result && (
                <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
                  result.badge_awarded === 'GOLD'
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-900'
                    : result.badge_awarded === 'SILVER'
                    ? 'bg-slate-100 border-slate-300 text-slate-800'
                    : 'bg-brand-blue/10 border-brand-blue/20 text-slate-800'
                }`}>
                  <div className="flex items-center gap-3.5">
                    <div className="text-center">
                      <span className="text-3xl font-black">{result.percentage}%</span>
                      <span className="text-[10px] block uppercase font-bold text-slate-500">Score</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-base">
                          {result.badge_awarded} Badge {result.badge_awarded === 'GOLD' ? '🥇' : result.badge_awarded === 'SILVER' ? '🥈' : '🥉'}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">{result.feedback}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Questions List */}
              <div className="space-y-6">
                {(assessment.questions || []).map((q, qIndex) => {
                  const selected = answers[q.id];
                  const isSubmitted = assessment.status === 'completed' || !!result;
                  const hasCorrect = q.correct_idx !== undefined;
                  const isCorrectChoice = isSubmitted && hasCorrect && selected === q.correct_idx;

                  return (
                    <div
                      key={q.id || qIndex}
                      className="p-4 sm:p-5 bg-slate-50 border border-slate-100 rounded-2xl space-y-3.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {qIndex + 1}. {q.question}
                        </span>
                        {isSubmitted && hasCorrect && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            isCorrectChoice
                              ? 'bg-brand-green/10 text-brand-green-dark border border-brand-green/30'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {isCorrectChoice ? 'Correct' : 'Incorrect'}
                          </span>
                        )}
                      </div>

                      {/* Options */}
                      <div className="space-y-2">
                        {q.options.map((opt, optIdx) => {
                          const isOptionSelected = selected === optIdx;
                          const isThisCorrect = isSubmitted && hasCorrect && optIdx === q.correct_idx;
                          const isWrongSelection = isSubmitted && hasCorrect && isOptionSelected && optIdx !== q.correct_idx;

                          return (
                            <button
                              key={optIdx}
                              type="button"
                              onClick={() => handleSelectOption(q.id, optIdx)}
                              disabled={isSubmitted}
                              className={`w-full text-left p-3 rounded-xl border text-xs transition flex items-center justify-between gap-2 ${
                                isThisCorrect
                                  ? 'bg-brand-green/10 border-brand-green text-brand-green-dark font-bold'
                                  : isWrongSelection
                                  ? 'bg-rose-50 border-rose-300 text-rose-700 font-semibold'
                                  : isOptionSelected
                                  ? 'bg-brand-blue/10 border-brand-blue text-brand-blue-dark font-semibold'
                                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                                  {String.fromCharCode(65 + optIdx)}
                                </span>
                                <span>{opt}</span>
                              </div>
                              {isThisCorrect && <CheckCircle2 className="w-4 h-4 text-brand-green-dark flex-shrink-0" />}
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation if submitted */}
                      {isSubmitted && q.explanation && (
                        <div className="p-3 bg-white border border-slate-200 rounded-xl text-[11px] text-slate-600 space-y-1">
                          <span className="font-bold text-slate-800 block">Explanation:</span>
                          <p>{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-medium">
            {assessment?.status === 'completed'
              ? 'Assessment reviewed.'
              : `${Object.keys(answers).length} of ${assessment?.questions?.length || 0} answered`}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl transition"
            >
              Close
            </button>
            {assessment && !isLocked && assessment.status !== 'completed' && !result && (
              <button
                onClick={handleSubmit}
                disabled={submitting || Object.keys(answers).length === 0}
                className="px-5 py-2 bg-gradient-to-r from-brand-green to-brand-blue hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-1.5"
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Submit & Get Graded</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
