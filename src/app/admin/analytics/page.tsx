'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminService } from '@/services/admin.service';
import { AdminAnalytics } from '@/types';
import { TrendingUp, ArrowLeft, Loader2, Users, IndianRupee, Coins, Calendar, BookOpen, Layers } from 'lucide-react';

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const data = await adminService.getAnalytics();
        setAnalytics(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
        <button
          onClick={() => router.push('/admin')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Admin Hub
        </button>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">Platform Analytics & Metrics</h1>
          <p className="text-xs text-slate-500 mt-0.5">Comprehensive real-time telemetry from PostgreSQL database.</p>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-brand-blue" />
            Loading real analytics...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
                <span>User Community</span>
                <Users className="w-5 h-5 text-brand-blue" />
              </div>
              <div className="text-3xl font-black text-slate-900 mt-4">{analytics?.total_users || 0}</div>
              <p className="text-xs text-slate-500 mt-1">{analytics?.active_users || 0} active registered accounts</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
                <span>Total Revenue (INR)</span>
                <IndianRupee className="w-5 h-5 text-brand-green-dark" />
              </div>
              <div className="text-3xl font-black text-slate-900 mt-4">₹{(analytics?.total_revenue_inr || 0).toLocaleString()}</div>
              <p className="text-xs text-brand-green-dark mt-1">Direct token packs & memberships</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
                <span>Circulating Token Economy</span>
                <Coins className="w-5 h-5 text-brand-orange" />
              </div>
              <div className="text-3xl font-black text-brand-orange-dark mt-4">{analytics?.total_tokens_circulating || 0} 🪙</div>
              <p className="text-xs text-slate-500 mt-1">Held in user balances & escrow</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
                <span>Total Skill Sessions</span>
                <Calendar className="w-5 h-5 text-brand-green-dark" />
              </div>
              <div className="text-3xl font-black text-slate-900 mt-4">{analytics?.total_sessions || 0}</div>
              <p className="text-xs text-slate-500 mt-1">{analytics?.completed_sessions || 0} completed successfully</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
                <span>Skills Offered</span>
                <BookOpen className="w-5 h-5 text-brand-blue" />
              </div>
              <div className="text-3xl font-black text-slate-900 mt-4">{analytics?.total_skills_offered || 0}</div>
              <p className="text-xs text-slate-500 mt-1">Available to teach across members</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
                <span>Learning Goals Stated</span>
                <Layers className="w-5 h-5 text-brand-blue" />
              </div>
              <div className="text-3xl font-black text-slate-900 mt-4">{analytics?.total_learning_goals || 0}</div>
              <p className="text-xs text-slate-500 mt-1">Active student learning objectives</p>
            </div>
          </div>
        )}
      </div>
  );
}
