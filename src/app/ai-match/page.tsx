'use client';

import React, { useState, useEffect } from 'react';
import { useSkillSwap } from '@/context/SkillSwapContext';
import { matchService } from '@/services/match.service';
import { SkillMatch } from '@/types';
import { MatchCard } from '@/components/cards/MatchCard';
import { 
  Sparkles, 
  Send, 
  CheckCircle2, 
  ArrowRightLeft, 
  Cpu, 
  Search,
  BookOpen,
  GraduationCap,
  Loader2,
  Users
} from 'lucide-react';
import Link from 'next/link';

export default function AIMatchPage() {
  const { user, openSwapModal } = useSkillSwap();
  const [query, setQuery] = useState(
    'I want to learn design and can teach web development or programming.'
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matches, setMatches] = useState<SkillMatch[]>([]);

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setIsAnalyzing(true);
    try {
      const recs = await matchService.getRecommendedMatches('all');
      
      // If query is provided, filter or boost relevance based on keywords in query
      if (query.trim()) {
        const qTerms = query.toLowerCase().split(/\s+/);
        const scored = recs.map((m) => {
          let boost = 0;
          const userStr = (
            m.user.name + ' ' +
            m.user.headline + ' ' +
            m.theyTeachYou.join(' ') + ' ' +
            m.youTeachThem.join(' ')
          ).toLowerCase();

          for (const term of qTerms) {
            if (term.length > 2 && userStr.includes(term)) {
              boost += 5;
            }
          }
          return {
            ...m,
            matchPercentage: Math.min(99, m.matchPercentage + boost)
          };
        });
        scored.sort((a, b) => b.matchPercentage - a.matchPercentage);
        setMatches(scored);
      } else {
        setMatches(recs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    handleAnalyze();
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-200">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-brand-navy via-brand-navy-card to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-blue/20 border border-brand-blue/30 text-brand-blue-light text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-brand-blue-light" />
            <span>AI Semantic Matching & Compatibility Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Find your complementary skill match
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Describe what you can offer and what you are hoping to learn in plain English. Our AI semantic engine parses your goals and matches you with peers from the database.
          </p>
        </div>

        {/* Natural Language Query Box */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <form onSubmit={handleAnalyze} className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Natural Language Swap Prompt
            </label>
            <textarea
              rows={2}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. I want to learn Figma and UI design and I can teach modern React and Next.js..."
              className="w-full rounded-2xl border border-slate-200 p-3.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue shadow-inner resize-none leading-relaxed"
            />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span>Quick prompts:</span>
                <button
                  type="button"
                  onClick={() => setQuery('I want to learn Figma design and can teach React and TypeScript.')}
                  className="text-brand-blue hover:underline font-medium"
                >
                  React ↔ Figma
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setQuery('I want to learn Marketing and can teach Python backend.')}
                  className="text-brand-blue hover:underline font-medium"
                >
                  Python ↔ Marketing
                </button>
              </div>

              <button
                type="submit"
                disabled={isAnalyzing}
                className="px-6 py-2.5 bg-gradient-to-r from-brand-green to-brand-blue hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-blue/15 transition flex items-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Computing Semantic Embeddings...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Run AI Match
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Ranked Skill Matches ({matches.length})</h2>
              <p className="text-xs text-slate-500">Calculated based on reciprocal skills, availability, and semantic relevance</p>
            </div>
          </div>

          {isAnalyzing ? (
            <div className="py-20 text-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-brand-blue" />
              Parsing database vectors and compatibility scores...
            </div>
          ) : matches.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center shadow-sm">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No matches found in database</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
                Complete your profile and add learning goals to discover skill matches.
              </p>
              <Link
                href="/skills"
                className="px-5 py-2.5 bg-gradient-to-r from-brand-green to-brand-blue hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Configure My Skills
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {matches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  onRequestSwap={() => openSwapModal(match.user)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
  );
}
