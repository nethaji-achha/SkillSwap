'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminService } from '@/services/admin.service';
import { ShieldAlert, ArrowLeft, Loader2 } from 'lucide-react';

export default function AdminReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const data = await adminService.getReports();
        setReports(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
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
          <h1 className="text-2xl font-bold text-slate-900">Incident & Dispute Reports</h1>
          <p className="text-xs text-slate-500 mt-0.5">Platform safety, spam complaints, and session escrow disputes.</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="py-16 text-center text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-blue" />
              Loading reports...
            </div>
          ) : reports.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <ShieldAlert className="w-8 h-8 mx-auto mb-2 text-brand-green-dark opacity-80" />
              <p className="text-sm font-semibold text-slate-700">No active reports or disputes</p>
              <p className="text-xs text-slate-400 mt-0.5">The community is operating peacefully.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {reports.map((r) => (
                <div key={r.id} className="p-5 flex items-start justify-between">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{r.reason}</div>
                    <p className="text-xs text-slate-600 mt-1">{r.details || 'No additional details provided.'}</p>
                    <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-2">
                      <span>Reported by: <strong>{r.reporter_name}</strong></span>
                      <span>•</span>
                      <span>Target: {r.target_type} ({r.target_id.slice(0, 8)})</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-lg uppercase">
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
  );
}
