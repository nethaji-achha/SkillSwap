'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminService } from '@/services/admin.service';
import { IndianRupee, ArrowLeft, Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function AdminPaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const data = await adminService.getPayments();
        setPayments(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
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
          <h1 className="text-2xl font-bold text-slate-900">Payment Audit Logs</h1>
          <p className="text-xs text-slate-500 mt-0.5">Real-time record of all Razorpay order creations, signatures, and verified token credits.</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="py-16 text-center text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-blue" />
              Loading payment records...
            </div>
          ) : payments.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <IndianRupee className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No payment records found in database yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase font-semibold">
                  <tr>
                    <th className="px-5 py-3">User</th>
                    <th className="px-5 py-3">Order ID</th>
                    <th className="px-5 py-3">Payment ID</th>
                    <th className="px-5 py-3">Amount</th>
                    <th className="px-5 py-3">Tokens Credited</th>
                    <th className="px-5 py-3">Purpose</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-5 py-3.5 font-semibold text-slate-900">
                        <div>{p.user_name}</div>
                        <div className="text-[11px] text-slate-400 font-normal">{p.user_email}</div>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-[11px] text-slate-600">{p.razorpay_order_id}</td>
                      <td className="px-5 py-3.5 font-mono text-[11px] text-slate-600">{p.razorpay_payment_id || '—'}</td>
                      <td className="px-5 py-3.5 font-bold text-slate-900">₹{p.amount_inr}</td>
                      <td className="px-5 py-3.5 font-extrabold text-brand-orange-dark">+{p.tokens_credited} 🪙</td>
                      <td className="px-5 py-3.5 capitalize">{p.purpose.replace('_', ' ')}</td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          p.status === 'success' ? 'bg-brand-green/10 text-brand-green-dark' :
                          p.status === 'created' ? 'bg-brand-orange/10 text-brand-orange-dark' :
                          'bg-rose-50 text-rose-700'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right text-slate-400">
                        {new Date(p.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
  );
}
