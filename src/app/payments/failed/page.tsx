'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { XCircle, ArrowLeft, RotateCcw } from 'lucide-react';

function PaymentFailedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason') || 'Your payment could not be completed.';

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-xl shadow-slate-100">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-5">
          <XCircle className="w-9 h-9" />
        </div>

        <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Payment Failed</h1>
        <p className="text-sm text-slate-600 mb-6">
          {reason} No tokens were deducted or added to your account.
        </p>

        <div className="space-y-2.5">
          <button
            onClick={() => router.push('/wallet/buy')}
            className="w-full py-3 px-4 bg-gradient-to-r from-brand-green to-brand-blue hover:opacity-95 text-white font-semibold text-sm rounded-xl shadow-md shadow-brand-blue/15 transition active:scale-95 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
          
          <button
            onClick={() => router.push('/wallet')}
            className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Wallet</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400">Loading...</div>}>
      <PaymentFailedContent />
    </Suspense>
  );
}
