'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSkillSwap } from '@/context/SkillSwapContext';
import { walletService } from '@/services/wallet.service';
import { paymentService } from '@/services/payment.service';
import { TokenPackageItem } from '@/types';
import { 
  Coins, 
  Sparkles, 
  ShieldCheck, 
  ArrowLeft, 
  Check, 
  Loader2,
  Zap
} from 'lucide-react';

export default function BuyTokensPage() {
  const router = useRouter();
  const { user, wallet, refreshUserAndWallet, showToast } = useSkillSwap();
  const [packages, setPackages] = useState<TokenPackageItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        const pkgs = await walletService.getPackages();
        setPackages(pkgs);
      } catch (err) {
        console.error('Failed to load packages', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  const handleBuy = async (pkg: TokenPackageItem) => {
    if (!user) {
      router.push('/login?redirect=/wallet/buy');
      return;
    }

    setPurchasingId(pkg.id);
    try {
      // 1. Create order on FastAPI backend
      const orderData = await paymentService.createOrder({
        package_id: pkg.id,
        purpose: 'token_purchase'
      });

      // 2. Load Razorpay script
      const scriptLoaded = await paymentService.loadRazorpayScript();
      if (!scriptLoaded) {
        showToast('Could not load Razorpay gateway. Please try again.');
        setPurchasingId(null);
        return;
      }

      // 3. Trigger Razorpay Checkout
      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Skill Swap',
        description: `Purchase: ${pkg.tokens} Skill Swap Tokens (🪙)`,
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
      showToast(err.message || 'Payment initiation failed.');
    } finally {
      setPurchasingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
        {/* Back Link */}
        <button
          onClick={() => router.push('/wallet')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Wallet
        </button>

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-orange/10 border border-brand-orange/20 text-brand-orange-dark rounded-full text-xs font-semibold mb-3">
            <Coins className="w-3.5 h-3.5" />
            Skill Swap Token Packs
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Buy Skill Swap Tokens
          </h1>
          <p className="text-sm text-slate-600 mt-2">
            Use tokens to book 1-on-1 sessions with skilled experts. Tokens never expire. Current balance: <strong className="text-brand-orange-dark">{wallet?.available_balance || 0} 🪙</strong>
          </p>
        </div>

        {/* Packages Grid */}
        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-brand-blue" />
            Loading token packages...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {packages.map((pkg) => {
              const isPopular = pkg.is_popular;
              return (
                <div
                  key={pkg.id}
                  className={`relative flex flex-col bg-white rounded-2xl p-5 transition-all duration-300 ${
                    isPopular
                      ? 'border-2 border-brand-blue shadow-lg shadow-brand-blue/10 ring-2 ring-brand-blue/10'
                      : 'border border-slate-200 shadow-sm hover:shadow-md'
                  }`}
                >
                  {pkg.badge && (
                    <div className={`text-[11px] font-bold px-2 py-0.5 rounded-md mb-2 inline-block self-start ${
                      isPopular ? 'bg-brand-orange text-white' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {pkg.badge}
                    </div>
                  )}

                  <h3 className="text-base font-bold text-slate-900">{pkg.name}</h3>

                  <div className="mt-4 mb-4">
                    <div className="flex items-center gap-1.5 text-2xl font-black text-slate-900">
                      <span>{pkg.tokens}</span>
                      <span className="text-xl">🪙</span>
                    </div>
                    <div className="text-sm font-extrabold text-slate-600 mt-1">
                      ₹{pkg.price_inr.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      (₹{(pkg.price_inr / pkg.tokens).toFixed(2)} / token)
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-slate-100">
                    <button
                      onClick={() => handleBuy(pkg)}
                      disabled={purchasingId === pkg.id}
                      className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        isPopular
                          ? 'bg-gradient-to-r from-brand-green to-brand-blue hover:opacity-95 text-white shadow-md shadow-brand-blue/15 active:scale-95'
                          : 'bg-slate-900 hover:bg-slate-800 text-white active:scale-95'
                      }`}
                    >
                      {purchasingId === pkg.id ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        `Buy for ₹${pkg.price_inr}`
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Info card */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-xs text-slate-600 space-y-2">
          <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Important Product Rules:
          </div>
          <p>• Skill Swap Tokens (🪙) are internal exchange tokens used to book peer learning sessions.</p>
          <p>• You can also earn tokens for free by offering and teaching your own skills on the platform.</p>
          <p>• Payments are securely verified via Razorpay. Tokens are credited instantly upon backend confirmation.</p>
        </div>
      </div>
  );
}
