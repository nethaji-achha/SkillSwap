'use client';

import React, { useState } from 'react';
import { useSkillSwap } from '@/context/SkillSwapContext';
import { SkillLevel } from '@/types';
import { X, Plus, BookOpen, Coins, Loader2 } from 'lucide-react';

interface AddSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: 'teach' | 'learn';
}

export const AddSkillModal: React.FC<AddSkillModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'teach',
}) => {
  const { addUserSkill } = useSkillSwap();
  const [type, setType] = useState<'teach' | 'learn'>(defaultType);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Programming');
  const [level, setLevel] = useState<SkillLevel>('Intermediate');
  const [yearsExperience, setYearsExperience] = useState<number>(2.0);
  const [sessionPrice, setSessionPrice] = useState<number>(15);
  const [description, setDescription] = useState('');
  const [targetLevel, setTargetLevel] = useState<SkillLevel>('Advanced');
  const [learningGoal, setLearningGoal] = useState('');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    setType(defaultType);
  }, [defaultType]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await addUserSkill(type, {
        skill_name: name.trim(),
        name: name.trim(),
        category,
        level,
        yearsExperience,
        sessionPrice,
        description,
        targetLevel,
        learningGoal,
        priority,
      });
      setName('');
      setDescription('');
      setLearningGoal('');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <Plus className="w-4 h-4 text-brand-blue" />
            <span>{type === 'teach' ? 'Offer a Teaching Skill' : 'Add a Learning Goal'}</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Type Toggle */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Category Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('teach')}
                className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                  type === 'teach'
                    ? 'bg-brand-green/10 border-brand-green text-brand-green-dark shadow-sm'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Skill I Can Teach
              </button>
              <button
                type="button"
                onClick={() => setType('learn')}
                className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                  type === 'learn'
                    ? 'bg-brand-blue/10 border-brand-blue text-brand-blue-dark shadow-sm'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Skill I Want to Learn
              </button>
            </div>
          </div>

          {/* Skill Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Skill Name
            </label>
            <input
              type="text"
              placeholder="e.g. Next.js, Product Design, Python, SEO"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
            >
              <option value="Programming">Programming</option>
              <option value="Web Development">Web Development</option>
              <option value="AI & Machine Learning">AI & Machine Learning</option>
              <option value="UI/UX Design">UI/UX Design</option>
              <option value="Marketing">Marketing & Growth</option>
              <option value="Business">Business & Strategy</option>
              <option value="Photography & Video">Photography & Video</option>
              <option value="Languages">Languages</option>
              <option value="Music">Music & Audio</option>
              <option value="Career">Career Development</option>
            </select>
          </div>

          {/* Type-Specific Fields */}
          {type === 'teach' ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Experience Level</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as SkillLevel)}
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Price (🪙 / session)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={sessionPrice}
                    onChange={(e) => setSessionPrice(parseInt(e.target.value) || 10)}
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description & Teaching Focus
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What topics, exercises, or frameworks will you cover in your sessions?"
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none"
                />
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Current Level</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as SkillLevel)}
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Level</label>
                  <select
                    value={targetLevel}
                    onChange={(e) => setTargetLevel(e.target.value as SkillLevel)}
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  >
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Specific Learning Goal
                </label>
                <textarea
                  rows={2}
                  value={learningGoal}
                  onChange={(e) => setLearningGoal(e.target.value)}
                  placeholder="e.g. Build an end-to-end full-stack SaaS app and prepare for senior interview."
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none"
                />
              </div>
            </>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-gradient-to-r from-brand-green to-brand-blue hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-blue/20 transition flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Skill'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
