'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { skillService } from '@/services/skill.service';
import { PopularSkillCategory } from '@/types';
import { Layers, ArrowLeft, Loader2, BookOpen } from 'lucide-react';

export default function AdminSkillsPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<PopularSkillCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        setLoading(true);
        const data = await skillService.getCategories();
        setCategories(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCats();
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
          <h1 className="text-2xl font-bold text-slate-900">Skill Taxonomy & Categories</h1>
          <p className="text-xs text-slate-500 mt-0.5">Platform skill directory and categorization structure.</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="py-16 text-center text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-blue" />
              Loading skill categories...
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {categories.map((c) => (
                <div key={c.id} className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-brand-blue/10 text-brand-blue-dark flex items-center justify-center font-bold">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{c.name}</h4>
                      <p className="text-xs text-slate-500">{c.description}</p>
                    </div>
                  </div>
                  <span className="font-mono text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
                    slug: {c.slug}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
  );
}
