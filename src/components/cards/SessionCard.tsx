import React from 'react';
import Link from 'next/link';
import { LearningSession } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Calendar, Clock, Video, Star, CheckCircle, FileText, Sparkles } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface SessionCardProps {
  session: LearningSession;
  onJoin?: () => void;
  onReview?: () => void;
}

export const SessionCard: React.FC<SessionCardProps> = ({ session, onJoin, onReview }) => {
  const isTeacher = session.role === 'teacher';
  const partnerName = session.partner?.name || (isTeacher ? session.learnerName : session.teacherName) || 'Learning Partner';
  const partnerAvatar = session.partner?.avatar || (isTeacher ? session.learnerAvatar : session.teacherAvatar) || '';

  const statusBadge: Record<string, string> = {
    upcoming: 'bg-brand-blue/10 text-brand-blue-dark border-brand-blue/20',
    scheduled: 'bg-brand-blue/10 text-brand-blue-dark border-brand-blue/20',
    in_progress: 'bg-brand-orange/10 text-brand-orange-dark border-brand-orange/20',
    completed: 'bg-brand-green/10 text-brand-green-dark border-brand-green/30',
    cancelled: 'bg-slate-100 text-slate-600 border-slate-200',
    disputed: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  const currentStatusBadge = statusBadge[session.status] || 'bg-slate-100 text-slate-600 border-slate-200';

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-subtle hover:shadow-hover transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Top: Status & Role */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border capitalize ${currentStatusBadge}`}
          >
            {session.status}
          </span>
          <span className="text-xs font-medium text-slate-500">
            {isTeacher ? '👨‍🏫 You are Teaching' : '🎓 You are Learning'}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-base text-slate-900 mb-2">
          {session.title || `${session.skillName || session.skill} Mentorship`}
        </h3>

        {/* Partner Info */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl mb-4 border border-slate-100">
          <Avatar src={partnerAvatar} name={partnerName} size="md" />
          <div className="min-w-0">
            <p className="text-xs text-slate-400">{isTeacher ? 'Student / Peer' : 'Mentor / Teacher'}</p>
            <p className="text-sm font-semibold text-slate-800 truncate">{partnerName}</p>
          </div>
        </div>

        {/* Session Metadata */}
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-4">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{formatDate(session.date || session.scheduledAt || '')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{session.time || new Date(session.scheduledAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({session.durationMinutes}m)</span>
          </div>
        </div>

        {/* Objective */}
        <div className="text-xs text-slate-500 bg-white border border-slate-100 p-3 rounded-xl mb-4">
          <p className="font-semibold text-slate-700 mb-0.5 flex items-center gap-1">
            <FileText className="w-3 h-3 text-brand-blue" /> Objective:
          </p>
          <p className="line-clamp-2 leading-relaxed">{session.objective || 'Hands-on practice & architecture review'}</p>
        </div>

        {/* Completed Review if exists */}
        {session.status === 'completed' && session.rating && (
          <div className="bg-brand-green/5 border border-brand-green/20 p-3 rounded-xl mb-4 text-xs">
            <div className="flex items-center gap-1 text-brand-green-dark font-semibold mb-1">
              <Star className="w-3.5 h-3.5 fill-brand-orange text-brand-orange" />
              <span>{session.rating} / 5 Stars</span>
            </div>
            {session.review && (
              <p className="text-slate-600 italic">"{session.review}"</p>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
        <Link href={`/sessions/${session.id}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full">
            View Details
          </Button>
        </Link>
        {(session.status === 'upcoming' || session.status === 'scheduled') && (
          <Link href={`/sessions/${session.id}?join=true`} className="flex-1">
            <Button
              variant="teach"
              size="sm"
              leftIcon={<Video className="w-3.5 h-3.5" />}
              className="w-full"
            >
              Join Call
            </Button>
          </Link>
        )}
        {session.status === 'completed' && !session.rating && onReview && (
          <Button
            variant="primary"
            size="sm"
            onClick={onReview}
            className="flex-1"
            leftIcon={<Star className="w-3.5 h-3.5" />}
          >
            Review
          </Button>
        )}
      </div>
    </div>
  );
};

export default SessionCard;
