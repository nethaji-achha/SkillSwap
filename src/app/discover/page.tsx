'use client';

import React, { useState, useEffect } from 'react';
import { useSkillSwap } from '@/context/SkillSwapContext';
import { userService } from '@/services/user.service';
import { UserProfile } from '@/types';
import { UserCard } from '@/components/cards/UserCard';
import { SearchBar } from '@/components/ui/SearchBar';
import { Search, Sparkles, Loader2, Users } from 'lucide-react';
import Link from 'next/link';

export default function DiscoverPage() {
  const { openSwapModal } = useSkillSwap();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAvailability, setSelectedAvailability] = useState('all');

  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        setLoading(true);
        const data = await userService.getCommunityUsers({
          search: searchQuery || undefined,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          availability: selectedAvailability !== 'all' ? selectedAvailability : undefined,
        });
        setUsers(data);
      } catch (err) {
        console.error('Failed to load community users', err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchCommunity();
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, selectedAvailability]);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Find people to learn from
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Search skills, people, or topics to discover peer teachers and learners.
            </p>
          </div>

          <Link
            href="/ai-match"
            className="px-4 py-2 bg-gradient-to-r from-brand-green to-brand-blue hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-md shadow-brand-blue/15 transition flex items-center justify-center gap-1.5 self-start md:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Skill Match
          </Link>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search skills, people or topics..."
          />

          {/* Filters row */}
          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-medium">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="all">All Categories</option>
                <option value="programming">Programming</option>
                <option value="web-dev">Web Development</option>
                <option value="ai-ml">AI & Machine Learning</option>
                <option value="ui-ux">UI/UX Design</option>
                <option value="marketing">Marketing</option>
                <option value="business">Business</option>
                <option value="languages">Languages</option>
                <option value="music">Music</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-medium">Availability:</span>
              <select
                value={selectedAvailability}
                onChange={(e) => setSelectedAvailability(e.target.value)}
                className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="all">Any Availability</option>
                <option value="Weekday mornings">Weekday Mornings</option>
                <option value="Weekday evenings">Weekday Evenings</option>
                <option value="Weekends">Weekends</option>
              </select>
            </div>

            {(searchQuery || selectedCategory !== 'all' || selectedAvailability !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedAvailability('all');
                }}
                className="text-xs text-brand-blue hover:text-brand-blue-dark font-semibold underline"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Results Grid */}
        <div>
          {loading ? (
            <div className="py-20 text-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-brand-blue" />
              Loading real community members...
            </div>
          ) : users.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center shadow-sm">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No users found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
                No active community members match your current filters. Try adjusting your search query or category.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedAvailability('all');
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {users.map((member) => (
                <UserCard
                  key={member.id}
                  user={member}
                  onRequestSwap={() => openSwapModal(member)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
  );
}
