'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSkillSwap } from '@/context/SkillSwapContext';
import { SUBSCRIPTION_PLANS } from '@/data/mockData';
import { paymentService } from '@/services/payment.service';
import { Check, Zap, Sparkles, Shield, ArrowRight, Loader2 } from 'lucide-react';

export default function PricingPage() {
  const router = useRouter();
  const { user, subscription, refreshUserAndWallet, showToast } = useSkillSwap();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSubscribe = async (plan: any) => {
    if (!user) {
      router.push('/login?redirect=/pricing');
      return;
    }

    if (plan.slug === 'basic' || plan.price_inr === 0) {
      showToast('You are currently on the Basic free plan.');
      return;
    }

    if (subscription?.plan_slug === plan.slug) {
      showToast(`You are already subscribed to ${plan.name}`);
      return;
    }

    setLoadingPlan(plan.slug);
    try {
      // 1. Create Razorpay order on backend
      const orderData = await paymentService.createOrder({
        subscription_plan_id: plan.id,
        purpose: 'subscription'
      });

      // 2. Load script
      const scriptLoaded = await paymentService.loadRazorpayScript();
      if (!scriptLoaded) {
        showToast('Payment gateway unavailable. Please try again.');
        setLoadingPlan(null);
        return;
      }

      // 3. Open Razorpay modal
      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Skill Swap',
        description: `Subscription: ${plan.name}`,
        order_id: orderData.order_id,
        handler: async (response: any) => {
          try {
            const verifyRes = await paymentService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id || orderData.order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature || 'sig_demo_test'
            });
            await refreshUserAndWallet();
            router.push(`/payments/success?payment_id=${verifyRes.transaction_id}&tokens=${verifyRes.tokens_added}`);
          } catch (err: any) {
            router.push(`/payments/failed?reason=${encodeURIComponent(err.message || 'Verification failed')}`);
          }
        },
        prefill: {
          name: orderData.user_name || user.name,
          email: orderData.user_email || user.email
        },
        theme: {
          color: '#0878f9'
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (resp: any) {
        router.push(`/payments/failed?reason=${encodeURIComponent(resp.error?.description || 'Payment rejected')}`);
      });
      rzp.open();
    } catch (err: any) {
      showToast(err.message || 'Failed to initiate checkout.');
    } finally {
      setLoadingPlan(null);
    }
  };

  const getPlanColors = (slug: string) => {
    switch (slug) {
      case 'go':
        return {
          border: 'border-brand-blue-500 ring-2 ring-blue-50',
          badge: 'bg-brand-blue-500 text-white',
          button: 'bg-brand-blue-500 hover:bg-brand-blue-600 text-white shadow-md'
        };
      case 'plus':
        return {
          border: 'border-[#6be000] ring-2 ring-green-50 shadow-lg',
          badge: 'bg-[#6be000] text-slate-900',
          button: 'bg-[#6be000] hover:opacity-95 text-slate-900 font-bold shadow-md'
        };
      case 'pro':
        return {
          border: 'border-[#ff8a00] ring-2 ring-orange-50',
          badge: 'bg-[#ff8a00] text-white',
          button: 'bg-[#ff8a00] hover:bg-orange-600 text-white shadow-md'
        };
      default:
        return {
          border: 'border-slate-200',
          badge: 'bg-slate-200 text-slate-700',
          button: 'bg-slate-900 hover:bg-slate-800 text-white'
        };
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-200 py-4">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-brand-blue-600 text-xs font-semibold mb-4">
          <Sparkles className="w-4 h-4 text-brand-blue-500" />
          Simple, Transparent Membership
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#071321] tracking-tight mb-4">
          Accelerate your learning with monthly token grants
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Subscribe for continuous monthly tokens, priority AI matching, and dedicated mentorship. Tokens represent genuine human knowledge exchanges.
        </p>
      </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {SUBSCRIPTION_PLANS.map((plan) => {
            const isCurrent = subscription?.plan_slug === plan.slug;
            const isPopular = plan.is_popular;
            const colors = getPlanColors(plan.slug);

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col bg-white rounded-2xl p-7 transition-all duration-300 ${
                  isPopular
                    ? `${colors.border} shadow-xl`
                    : 'border border-slate-200 shadow-sm hover:shadow-md'
                }`}
              >
                {isPopular && (
                  <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 ${colors.badge} text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm`}>
                    Most Popular
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-1">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mt-4">
                    <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                      ₹{plan.price_inr.toLocaleString()}
                    </span>
                    <span className="text-sm font-medium text-slate-500">/month</span>
                  </div>
                  <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs font-semibold">
                    <span>🪙</span>
                    <span>{plan.tokens_per_month} Tokens / month</span>
                  </div>
                </div>

                <div className="flex-1 space-y-3 mb-8 border-t border-slate-100 pt-6">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Included Features
                  </div>
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-sm text-slate-700">
                      <Check className="w-4 h-4 text-[#6be000] shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleSubscribe(plan)}
                  disabled={loadingPlan === plan.slug || isCurrent}
                  className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                    isCurrent
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                      : colors.button
                  }`}
                >
                  {loadingPlan === plan.slug ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : isCurrent ? (
                    'Current Plan'
                  ) : plan.price_inr === 0 ? (
                    'Get Started Free'
                  ) : (
                    <>
                      Upgrade to {plan.name}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Security / FAQ Banner */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-brand-blue-600 shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base">Secure Razorpay Integration & Escrow Protection</h4>
              <p className="text-sm text-slate-600 mt-0.5">
                All transactions are verified server-side. Unused tokens never expire and stay in your wallet.
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push('/wallet')}
            className="whitespace-nowrap px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-sm font-semibold transition"
          >
            Looking for One-Time Token Packs? →
          </button>
        </div>
    </div>
  );
}
