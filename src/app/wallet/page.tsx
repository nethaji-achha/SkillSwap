'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSkillSwap } from '@/context/SkillSwapContext';
import { walletService } from '@/services/wallet.service';
import { TokenTransactionItem } from '@/types';
import EmptyState from '@/components/ui/EmptyState';
import { 
  Coins, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  ShieldCheck, 
  PlusCircle, 
  History, 
  Lock,
  Sparkles,
  TrendingUp
} from 'lucide-react';

export default function WalletPage() {
  const router = useRouter();
  const { user, wallet, refreshUserAndWallet } = useSkillSwap();
  const [transactions, setTransactions] = useState<TokenTransactionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const data = await walletService.getTransactions();
        setTransactions(data);
      } catch (err) {
        console.error('Failed to load wallet transactions', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
    refreshUserAndWallet();
  }, []);

  const available = wallet?.available_balance || 0;
  const pending = wallet?.pending_balance || 0;
  const earned = wallet?.earned_total || 0;
  const spent = wallet?.spent_total || 0;
  const purchased = wallet?.purchased_total || 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2.5">
              <span>Skill Swap Wallet</span>
              <span className="text-2xl">🪙</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Your internal exchange currency for 1-on-1 peer skill sessions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/wallet/buy')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-brand-green to-brand-blue hover:opacity-95 text-white text-sm font-semibold rounded-xl shadow-md shadow-brand-blue/15 transition active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4" />
              Buy Tokens
            </button>
            <button
              onClick={() => router.push('/wallet/transactions')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl transition"
            >
              <History className="w-4 h-4" />
              All Transactions
            </button>
          </div>
        </div>

        {/* Balance Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Available */}
          <div className="bg-gradient-to-br from-brand-orange to-amber-600 text-white rounded-2xl p-5 shadow-lg shadow-brand-orange/20 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-orange-100">Available</span>
              <Coins className="w-5 h-5 text-orange-200" />
            </div>
            <div className="mt-4">
              <div className="text-3xl font-black">{available} 🪙</div>
              <p className="text-xs text-orange-100 mt-1">Ready for learning sessions</p>
            </div>
          </div>

          {/* Pending Escrow */}
          <div className="bg-white border border-amber-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">In Escrow</span>
              <Lock className="w-5 h-5 text-amber-500" />
            </div>
            <div className="mt-4">
              <div className="text-3xl font-black text-amber-900">{pending} 🪙</div>
              <p className="text-xs text-amber-600 mt-1">Held for active sessions</p>
            </div>
          </div>

          {/* Total Earned */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-green-dark">Total Earned</span>
              <ArrowDownLeft className="w-5 h-5 text-brand-green-dark" />
            </div>
            <div className="mt-4">
              <div className="text-3xl font-black text-slate-900">{earned} 🪙</div>
              <p className="text-xs text-slate-500 mt-1">From teaching skills</p>
            </div>
          </div>

          {/* Total Spent */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Spent</span>
              <ArrowUpRight className="w-5 h-5 text-rose-500" />
            </div>
            <div className="mt-4">
              <div className="text-3xl font-black text-slate-900">{spent} 🪙</div>
              <p className="text-xs text-slate-500 mt-1">On learning sessions</p>
            </div>
          </div>

          {/* Total Purchased */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-blue-dark">Purchased</span>
              <TrendingUp className="w-5 h-5 text-brand-blue" />
            </div>
            <div className="mt-4">
              <div className="text-3xl font-black text-slate-900">{purchased} 🪙</div>
              <p className="text-xs text-slate-500 mt-1">Via Razorpay</p>
            </div>
          </div>
        </div>

        {/* How Escrow Works Notice */}
        <div className="bg-brand-blue/5 border border-brand-blue/20 rounded-2xl p-5 flex items-start gap-4">
          <div className="p-2 bg-brand-blue/10 rounded-xl text-brand-blue shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Protected Token Escrow System</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              When you schedule a learning session, your tokens are placed in secure pending escrow. Tokens are only transferred to the teacher after the session is successfully completed. If a session is cancelled, your tokens are instantly returned.
            </p>
          </div>
        </div>

        {/* Recent Transactions Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Recent Transactions</h2>
            <button
              onClick={() => router.push('/wallet/transactions')}
              className="text-xs font-semibold text-brand-blue hover:text-brand-blue-dark"
            >
              View Full History →
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              <div className="w-6 h-6 border-2 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading transactions...
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Coins className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-slate-800">No token transactions yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Your transaction activity will appear here as you teach, learn, or purchase Skill Swap tokens.
              </p>
              <div className="mt-4 flex items-center justify-center gap-3">
                <button
                  onClick={() => router.push('/skills')}
                  className="px-4 py-2 bg-brand-green/10 hover:bg-brand-green/20 text-brand-green-dark text-xs font-semibold rounded-lg transition"
                >
                  Offer a Skill to Earn 🪙
                </button>
                <button
                  onClick={() => router.push('/wallet/buy')}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition"
                >
                  Buy Tokens
                </button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {transactions.slice(0, 8).map((tx) => {
                const isPositive = tx.type === 'earned' || tx.type === 'purchased' || tx.type === 'refunded';
                return (
                  <div key={tx.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/60 transition">
                    <div className="flex items-center gap-3.5">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        tx.type === 'earned' ? 'bg-brand-green/10 text-brand-green-dark' :
                        tx.type === 'purchased' ? 'bg-brand-blue/10 text-brand-blue' :
                        tx.type === 'pending' ? 'bg-brand-orange/10 text-brand-orange-dark' :
                        tx.type === 'refunded' ? 'bg-slate-100 text-slate-600' :
                        'bg-rose-50 text-rose-600'
                      }`}>
                        {isPositive ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-900">{tx.description}</div>
                        <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                          <span>{new Date(tx.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          <span>•</span>
                          <span className="capitalize">{tx.status}</span>
                        </div>
                      </div>
                    </div>

                    <div className={`text-sm font-bold ${
                      isPositive ? 'text-brand-green-dark' : 'text-slate-900'
                    }`}>
                      {isPositive ? `+${tx.amount}` : `-${tx.amount}`} 🪙
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
  );
}
