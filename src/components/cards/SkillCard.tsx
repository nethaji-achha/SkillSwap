import React from 'react';
import { PopularSkillCategory } from '@/types';
import { 
  Code, 
  Brain, 
  Palette, 
  Globe, 
  TrendingUp, 
  Briefcase, 
  Camera, 
  Video, 
  Languages, 
  Music,
  ArrowRight,
  Users
} from 'lucide-react';
import Link from 'next/link';

interface SkillCardProps {
  category: PopularSkillCategory;
  onExplore?: () => void;
}

export const SkillCard: React.FC<SkillCardProps> = ({ category, onExplore }) => {
  const getIcon = (name?: string) => {
    switch (name) {
      case 'Code': return <Code className="w-5 h-5" />;
      case 'Brain': return <Brain className="w-5 h-5" />;
      case 'Palette': return <Palette className="w-5 h-5" />;
      case 'Globe': return <Globe className="w-5 h-5" />;
      case 'TrendingUp': return <TrendingUp className="w-5 h-5" />;
      case 'Briefcase': return <Briefcase className="w-5 h-5" />;
      case 'Camera': return <Camera className="w-5 h-5" />;
      case 'Video': return <Video className="w-5 h-5" />;
      case 'Languages': return <Languages className="w-5 h-5" />;
      case 'Music': return <Music className="w-5 h-5" />;
      default: return <Code className="w-5 h-5" />;
    }
  };

  const topSkills = category.topSkills || [];
  const learnerCount = category.learnerCount || 0;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-subtle hover:shadow-hover hover:border-brand-blue/30 transition-all duration-200 flex flex-col justify-between group">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 text-brand-blue flex items-center justify-center group-hover:bg-brand-blue group-hover:text-white transition-colors">
            {getIcon(category.iconName || category.icon)}
          </div>
          {learnerCount > 0 && (
            <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium bg-slate-100 px-2.5 py-1 rounded-full">
              <Users className="w-3 h-3 text-slate-400" />
              {learnerCount.toLocaleString()} learners
            </span>
          )}
        </div>

        <h3 className="font-bold text-base text-slate-900 mb-1 group-hover:text-brand-blue transition-colors">
          {category.name}
        </h3>
        
        {topSkills.length > 0 && (
          <p className="text-xs text-slate-500 mb-4 line-clamp-1">
            {topSkills.slice(0, 3).join(' • ')}
          </p>
        )}
      </div>

      <Link
        href={`/discover?category=${encodeURIComponent(category.slug)}`}
        className="inline-flex items-center justify-between w-full pt-3 border-t border-slate-100 text-xs font-semibold text-brand-blue hover:text-brand-blue-dark"
      >
        <span>Explore Skills</span>
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
};

export default SkillCard;
