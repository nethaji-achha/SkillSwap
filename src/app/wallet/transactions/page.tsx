'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSkillSwap } from '@/context/SkillSwapContext';
import { walletService } from '@/services/wallet.service';
import { TokenTransactionItem } from '@/types';
import { 
  Coins, 
  ArrowLeft, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Filter, 
  Search,
  Loader2
} from 'lucide-react';

export default function WalletTransactionsPage() {
  const router = useRouter();
  const { wallet } = useSkillSwap();
  const [transactions, setTransactions] = useState<TokenTransactionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const data = await walletService.getTransactions(activeFilter === 'all' ? undefined : activeFilter);
        setTransactions(data);
      } catch (err) {
        console.error('Failed to load transactions', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [activeFilter]);

  const filtered = transactions.filter((t) =>
    t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation */}
        <button
          onClick={() => router.push('/wallet')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Wallet
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Token Transaction History</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Live record of all earned, spent, purchased, and escrowed Skill Swap tokens.
            </p>
          </div>
          <div className="text-sm font-semibold text-slate-700 bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl shadow-sm">
            Current Balance: <span className="font-extrabold text-brand-orange-dark">{wallet?.available_balance || 0} 🪙</span>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by description or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {['all', 'earned', 'spent', 'purchased', 'pending', 'refunded'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition whitespace-nowrap ${
                  activeFilter === filter
                    ? 'bg-brand-blue text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="py-16 text-center text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-blue" />
              Loading history...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Coins className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-slate-800">No transactions found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No matching token movements recorded in your wallet history.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filtered.map((tx) => {
                const isPositive = tx.type === 'earned' || tx.type === 'purchased' || tx.type === 'refunded';
                return (
                  <div key={tx.id} className="p-4 sm:px-6 sm:py-4 flex items-center justify-between hover:bg-slate-50/70 transition">
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
                        <div className="text-sm font-semibold text-slate-900">{tx.description}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                          <span>{new Date(tx.created_at).toLocaleString()}</span>
                          <span>•</span>
                          <span className="font-mono text-[10px] text-slate-400">ID: {tx.id.slice(0, 8)}</span>
                          <span>•</span>
                          <span className="capitalize font-medium text-slate-600">{tx.status}</span>
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
