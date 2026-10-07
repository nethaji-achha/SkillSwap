'use client';

import React from 'react';
import Link from 'next/link';
import { useSkillSwap } from '@/context/SkillSwapContext';
import { Avatar } from '@/components/ui/Avatar';
import { Bell, CheckCheck, Sparkles, MessageSquare, Calendar, Star } from 'lucide-react';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useSkillSwap();

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'match':
        return <Sparkles className="w-3.5 h-3.5 text-brand-blue" />;
      case 'session':
        return <Calendar className="w-3.5 h-3.5 text-brand-green-dark" />;
      case 'review':
        return <Star className="w-3.5 h-3.5 text-brand-orange fill-brand-orange" />;
      default:
        return <MessageSquare className="w-3.5 h-3.5 text-brand-blue" />;
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl border border-slate-200 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-slate-700" />
            <h4 className="font-bold text-slate-900 text-sm">Notifications</h4>
          </div>
          <button
            onClick={() => markAllNotificationsAsRead()}
            className="text-[11px] font-semibold text-brand-blue hover:text-brand-blue-dark flex items-center gap-1"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              No notifications yet.
            </div>
          ) : (
            notifications.map((n) => (
              <Link
                key={n.id}
                href={n.actionUrl || n.link || '#'}
                onClick={() => {
                  markNotificationAsRead(n.id);
                  onClose();
                }}
                className={`flex items-start gap-3 p-3.5 hover:bg-slate-50 transition-colors block ${
                  !n.is_read && !n.read ? 'bg-brand-blue/5' : ''
                }`}
              >
                {n.avatar ? (
                  <Avatar src={n.avatar} name={n.title} size="sm" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    {getIcon(n.type)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <p className="text-xs font-bold text-slate-900 truncate">{n.title}</p>
                    <span className="text-[10px] text-slate-400 shrink-0">{n.timestamp || new Date(n.created_at || Date.now()).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-snug">{n.message}</p>
                </div>
                {!n.is_read && !n.read && (
                  <span className="w-2 h-2 rounded-full bg-brand-blue shrink-0 mt-1.5" />
                )}
              </Link>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationDropdown;
