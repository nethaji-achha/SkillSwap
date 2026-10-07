'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function PaymentPendingPage() {
  const router = useRouter();

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-xl shadow-slate-100">
        <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-5">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>

        <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Payment Processing</h1>
        <p className="text-sm text-slate-600 mb-6">
          Your payment is currently being verified with the payment gateway. Tokens will appear in your wallet once confirmation is received.
        </p>

        <button
          onClick={() => router.push('/wallet')}
          className="w-full py-3 px-4 bg-gradient-to-r from-brand-green to-brand-blue hover:opacity-95 text-white font-semibold text-sm rounded-xl shadow-md shadow-brand-blue/15 transition active:scale-95 flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Wallet</span>
        </button>
      </div>
    </div>
  );
}
