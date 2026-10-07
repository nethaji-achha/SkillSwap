'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSkillSwap } from '@/context/SkillSwapContext';
import { CheckCircle2, Coins, ArrowRight, History } from 'lucide-react';

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { wallet, refreshUserAndWallet } = useSkillSwap();

  const paymentId = searchParams.get('payment_id') || 'Completed';
  const tokensAdded = searchParams.get('tokens') || '0';

  useEffect(() => {
    refreshUserAndWallet();
  }, []);

  return (
    <div className="max-w-lg mx-auto py-12 px-4">
      <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-xl shadow-slate-100">
        <div className="w-16 h-16 bg-brand-green/15 text-brand-green-dark rounded-full flex items-center justify-center mx-auto mb-5 animate-bounce">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Payment Successful 🎉</h1>
        <p className="text-sm text-slate-600 mb-6">
          Your payment was securely processed and your Skill Swap tokens have been credited to your wallet.
        </p>

        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 mb-6 text-left space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Tokens Added:</span>
            <span className="font-extrabold text-brand-green-dark flex items-center gap-1">
              +{tokensAdded} <span className="text-base">🪙</span>
            </span>
          </div>

          <div className="flex items-center justify-between text-sm border-t border-slate-200/60 pt-2.5">
            <span className="text-slate-500">New Available Balance:</span>
            <span className="font-bold text-slate-900">{wallet?.available_balance || 0} 🪙</span>
          </div>

          <div className="flex items-center justify-between text-xs border-t border-slate-200/60 pt-2.5">
            <span className="text-slate-400">Transaction ID:</span>
            <span className="font-mono text-slate-500 truncate max-w-[180px]">{paymentId}</span>
          </div>
        </div>

        <div className="space-y-2.5">
          <button
            onClick={() => router.push('/wallet')}
            className="w-full py-3 px-4 bg-gradient-to-r from-brand-green to-brand-blue hover:opacity-95 text-white font-semibold text-sm rounded-xl shadow-md shadow-brand-blue/15 transition active:scale-95 flex items-center justify-center gap-2"
          >
            <span>View Wallet</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => router.push('/wallet/transactions')}
            className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-2"
          >
            <History className="w-3.5 h-3.5" />
            <span>View Transactions</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400">Loading payment details...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
