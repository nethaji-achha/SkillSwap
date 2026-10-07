'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { subscriptionService } from '@/services/subscription.service';
import { SubscriptionPlanItem } from '@/types';
import { Crown, ArrowLeft, Loader2, Check } from 'lucide-react';

export default function AdminSubscriptionsPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<SubscriptionPlanItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const data = await subscriptionService.getPlans();
        setPlans(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
        <button
          onClick={() => router.push('/admin')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Admin Hub
        </button>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">Subscription Plans Overview</h1>
          <p className="text-xs text-slate-500 mt-0.5">Recurring membership tiers and monthly token grants.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {plans.map((p) => (
            <div key={p.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-base">{p.name}</h3>
                {p.is_popular && <span className="text-[10px] font-bold bg-brand-orange text-white px-2 py-0.5 rounded shadow-sm">POPULAR</span>}
              </div>
              <div className="text-2xl font-black text-slate-900">₹{p.price_inr} <span className="text-xs font-normal text-slate-400">/mo</span></div>
              <div className="text-xs font-semibold text-brand-orange-dark bg-brand-orange/10 px-2.5 py-1 rounded-lg">
                🪙 {p.tokens_per_month} Tokens/month
              </div>
              <div className="text-xs text-brand-blue-dark bg-brand-blue/10 px-2.5 py-1 rounded-lg">
                🤖 {p.ai_requests_per_month} AI Quota/mo
              </div>
              <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                {p.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-brand-green-dark shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
  );
}
