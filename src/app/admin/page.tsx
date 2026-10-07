'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSkillSwap } from '@/context/SkillSwapContext';
import { adminService } from '@/services/admin.service';
import { AdminAnalytics } from '@/types';
import { 
  Users, 
  BookOpen, 
  IndianRupee, 
  Coins, 
  ShieldAlert, 
  TrendingUp, 
  Calendar, 
  Crown,
  Loader2,
  ArrowRight
} from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user } = useSkillSwap();
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await adminService.getAnalytics();
        setAnalytics(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load admin analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold uppercase tracking-wider mb-2">
              <Crown className="w-3.5 h-3.5" />
              Platform Administration
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Admin Operations & Analytics</h1>
            <p className="text-xs text-slate-500 mt-1">Real-time marketplace velocity, payment reconciliation, and moderation.</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/admin/users')}
              className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition"
            >
              Users Directory
            </button>
            <button
              onClick={() => router.push('/admin/payments')}
              className="px-3.5 py-2 bg-gradient-to-r from-brand-green to-brand-blue hover:opacity-95 text-white text-xs font-semibold rounded-xl transition"
            >
              Payment Audit
            </button>
          </div>
        </div>

        {/* Loading / Error States */}
        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-brand-blue" />
            Loading real analytics from database...
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center text-rose-700 text-sm">
            {error}. Ensure your user has admin privileges.
          </div>
        ) : (
          <>
            {/* Top Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase text-slate-400">Total Users</span>
                  <Users className="w-5 h-5 text-brand-blue" />
                </div>
                <div className="text-2xl font-black text-slate-900 mt-3">{analytics?.total_users || 0}</div>
                <p className="text-[11px] text-slate-500 mt-0.5">{analytics?.active_users || 0} active members</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase text-slate-400">Total Revenue</span>
                  <IndianRupee className="w-5 h-5 text-brand-green-dark" />
                </div>
                <div className="text-2xl font-black text-slate-900 mt-3">₹{(analytics?.total_revenue_inr || 0).toLocaleString()}</div>
                <p className="text-[11px] text-brand-green-dark mt-0.5">Verified Razorpay transactions</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase text-slate-400">Circulating Tokens</span>
                  <Coins className="w-5 h-5 text-brand-orange-dark" />
                </div>
                <div className="text-2xl font-black text-slate-900 mt-3">{analytics?.total_tokens_circulating || 0} 🪙</div>
                <p className="text-[11px] text-slate-500 mt-0.5">Across active user wallets</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase text-slate-400">Completed Sessions</span>
                  <Calendar className="w-5 h-5 text-brand-blue" />
                </div>
                <div className="text-2xl font-black text-slate-900 mt-3">{analytics?.completed_sessions || 0}</div>
                <p className="text-[11px] text-slate-500 mt-0.5">{analytics?.total_sessions || 0} total scheduled</p>
              </div>
            </div>

            {/* Quick Links Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div 
                onClick={() => router.push('/admin/users')}
                className="bg-white border border-slate-200 hover:border-brand-blue/30 hover:shadow-md transition cursor-pointer rounded-2xl p-6 group"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center mb-4 group-hover:scale-105 transition">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">User Moderation & Verification</h3>
                <p className="text-xs text-slate-500 mt-1 mb-4">View real database users, toggle verified badges, and suspend abusive accounts.</p>
                <span className="text-xs font-semibold text-brand-blue flex items-center gap-1 group-hover:translate-x-1 transition">
                  Manage Users <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>

              <div 
                onClick={() => router.push('/admin/payments')}
                className="bg-white border border-slate-200 hover:border-brand-green/30 hover:shadow-md transition cursor-pointer rounded-2xl p-6 group"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-green/10 text-brand-green-dark flex items-center justify-center mb-4 group-hover:scale-105 transition">
                  <IndianRupee className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Payment Logs & Reconciliation</h3>
                <p className="text-xs text-slate-500 mt-1 mb-4">Audit Razorpay payment IDs, verify token allocations, and check webhook states.</p>
                <span className="text-xs font-semibold text-brand-green-dark flex items-center gap-1 group-hover:translate-x-1 transition">
                  View Payments <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>

              <div 
                onClick={() => router.push('/admin/reports')}
                className="bg-white border border-slate-200 hover:border-rose-200 hover:shadow-md transition cursor-pointer rounded-2xl p-6 group"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 group-hover:scale-105 transition">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Disputes & Incident Reports</h3>
                <p className="text-xs text-slate-500 mt-1 mb-4">Investigate session disagreements, token hold disputes, and safety reports.</p>
                <span className="text-xs font-semibold text-rose-600 flex items-center gap-1 group-hover:translate-x-1 transition">
                  Review Reports <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </>
        )}
      </div>
  );
}
