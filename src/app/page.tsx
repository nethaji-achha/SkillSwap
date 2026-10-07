'use client';

import React from 'react';
import Link from 'next/link';
import { useSkillSwap } from '@/context/SkillSwapContext';
import { POPULAR_SKILL_CATEGORIES } from '@/data/mockData';
import { 
  ArrowRight, 
  Sparkles, 
  ArrowRightLeft, 
  CheckCircle2, 
  ShieldCheck, 
  Coins, 
  Zap, 
  Calendar,
  MessageSquare,
  Award,
  Layers,
  Code,
  Globe,
  TrendingUp,
  Briefcase
} from 'lucide-react';

export default function LandingPage() {
  const { user } = useSkillSwap();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <main className="flex-1 space-y-24 py-8 sm:py-16">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-brand-blue-600 text-xs sm:text-sm font-semibold">
            <Sparkles className="w-4 h-4 text-brand-blue-500" />
            <span>AI-Powered Skill Exchange & Token Economy</span>
          </div>

          {/* Official Headline */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-[#071321] tracking-tight leading-[1.15]">
              Learn from people.{' '}
              <span className="text-[#6be000]">
                Share
              </span>{' '}
              <span className="text-[#0878f9]">
                what you know.
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
              Connect with people who can teach what you want to learn while sharing the skills you're already good at.
            </p>
          </div>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href={user ? "/ai-match" : "/signup"}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#6be000] to-[#0878f9] hover:opacity-95 text-white font-bold text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2 active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Find My Skill Match</span>
            </Link>
            <Link
              href="/discover"
              className="w-full sm:w-auto px-8 py-3.5 bg-white border border-brand-blue-500/40 hover:bg-blue-50/50 text-brand-blue-600 font-semibold text-sm rounded-xl shadow-sm transition flex items-center justify-center gap-2"
            >
              <span>Explore Skills</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Abstract Skill Exchange Visual (React ↔ Figma, Python ↔ UI/UX, Marketing ↔ Web Dev) */}
          <div className="max-w-4xl mx-auto pt-8">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">
                Live Peer Knowledge Exchange
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Pair 1 */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between hover:border-blue-200 transition">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 text-brand-blue-700 flex items-center justify-center font-bold text-xs">
                      ⚛️
                    </div>
                    <span className="font-bold text-slate-800 text-sm">React</span>
                  </div>
                  <ArrowRightLeft className="w-4 h-4 text-brand-blue-500 shrink-0" />
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-slate-800 text-sm">Figma</span>
                    <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#ff8a00] flex items-center justify-center font-bold text-xs">
                      🎨
                    </div>
                  </div>
                </div>

                {/* Pair 2 */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between hover:border-green-200 transition">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                      🐍
                    </div>
                    <span className="font-bold text-slate-800 text-sm">Python</span>
                  </div>
                  <ArrowRightLeft className="w-4 h-4 text-[#6be000] shrink-0" />
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-slate-800 text-sm">UI/UX</span>
                    <div className="w-8 h-8 rounded-xl bg-blue-100 text-brand-blue-700 flex items-center justify-center font-bold text-xs">
                      📐
                    </div>
                  </div>
                </div>

                {/* Pair 3 */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between hover:border-orange-200 transition">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">
                      📈
                    </div>
                    <span className="font-bold text-slate-800 text-sm">Marketing</span>
                  </div>
                  <ArrowRightLeft className="w-4 h-4 text-[#ff8a00] shrink-0" />
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-slate-800 text-sm">Web Dev</span>
                    <div className="w-8 h-8 rounded-xl bg-blue-100 text-brand-blue-700 flex items-center justify-center font-bold text-xs">
                      🌐
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-6 text-xs text-slate-500">
                <span className="flex items-center gap-1.5 font-medium">
                  <Coins className="w-4 h-4 text-[#ff8a00]" />
                  Token-backed Peer Escrow
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Sparkles className="w-4 h-4 text-brand-blue-500" />
                  Gemini Semantic Matching
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-4 h-4 text-[#6be000]" />
                  Verified Skill Passport
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works (Section 9) */}
        <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-brand-blue-600 uppercase tracking-widest mb-2">How It Works</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-[#071321] tracking-tight">
              Three simple steps to exchange knowledge
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white border border-slate-200 rounded-3xl p-8 relative shadow-sm hover:shadow-md transition">
              <div className="text-4xl font-black text-brand-green-100 mb-4">01</div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Add Your Skills</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Tell us what you can teach and what you want to learn. Set your preferred session duration and token pricing.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white border border-slate-200 rounded-3xl p-8 relative shadow-sm hover:shadow-md transition">
              <div className="text-4xl font-black text-brand-blue-100 mb-4">02</div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Find Your Match</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                AI finds people with complementary skills, matching availability, and mutual learning interests with clear explanations.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white border border-slate-200 rounded-3xl p-8 relative shadow-sm hover:shadow-md transition">
              <div className="text-4xl font-black text-brand-orange-100 mb-4">03</div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Learn & Share</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Connect, schedule a 1-on-1 session, exchange knowledge, build reputation, and earn Skill Swap tokens to learn again.
              </p>
            </div>
          </div>
        </section>

        {/* Skill Categories */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold text-brand-blue-600 uppercase tracking-widest mb-2">Marketplace Taxonomy</h2>
            <h3 className="text-3xl font-extrabold text-[#071321] tracking-tight">
              Explore Popular Skill Categories
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {POPULAR_SKILL_CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={`/discover?category=${cat.slug}`}
                className="bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md p-5 rounded-2xl transition group flex flex-col justify-between"
              >
                <div>
                  <h4 className="font-bold text-slate-900 text-sm group-hover:text-brand-blue-600 transition">
                    {cat.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    {cat.description}
                  </p>
                </div>
                <div className="mt-4 text-[11px] font-semibold text-brand-blue-600 flex items-center gap-1 group-hover:translate-x-1 transition">
                  Explore →
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Token Economy Callout */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#071321] text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xl border border-[#11263a]">
            <div className="relative z-10 max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff8a00]/20 text-[#ff8a00] text-xs font-bold">
                <span>🪙</span>
                <span>The Skill Swap Flywheel</span>
              </div>
              <h3 className="text-3xl font-black tracking-tight text-white">
                Teach what you know. Earn tokens. Learn what you want.
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Your knowledge has real value. Offer sessions in areas where you excel, earn tokens with escrow protection, and use those tokens to learn from subject matter experts worldwide.
              </p>
              <div className="pt-4 flex flex-wrap gap-4">
                <Link
                  href="/signup"
                  className="px-6 py-3 bg-gradient-to-r from-[#6be000] to-[#0878f9] hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-md transition"
                >
                  Create Your Free Account
                </Link>
                <Link
                  href="/pricing"
                  className="px-6 py-3 bg-[#0d1d2d] hover:bg-[#11263a] text-slate-200 font-semibold text-xs rounded-xl border border-[#1e3a52] transition"
                >
                  View Membership Plans
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#11263a] bg-[#071321] text-slate-400 py-12 text-center text-xs">
        <div className="max-w-7xl mx-auto px-4 space-y-3">
          <div className="font-bold text-white text-sm">Skill Swap — TEACH. LEARN. GROW. TOGETHER.</div>
          <p>© 2026 Skill Swap Platform. Powered by FastAPI, PostgreSQL, Razorpay & Google Gemini AI.</p>
        </div>
      </footer>
    </div>
  );
}
