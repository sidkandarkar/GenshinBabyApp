import { useState } from 'react';
import { ReminderNotification } from '../types';
import { soundManager } from '../utils/audio';
import { Bell, Sparkles, X, Check, Clock } from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: ReminderNotification[];
  onDismiss: (id: string) => void;
  onClearAll: () => void;
}

export function NotificationModal({
  isOpen,
  onClose,
  notifications,
  onDismiss,
  onClearAll,
}: NotificationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-[#101729] border border-[#d4af37]/50 rounded-2xl shadow-2xl p-5 text-slate-100 overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#233350] shrink-0">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#ebd48a]" />
            <h3 className="font-genshin text-base font-bold text-[#f5e2a3]">
              Schedule Reminders & Alerts
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List of active notifications */}
        <div className="my-4 overflow-y-auto flex-1 space-y-3">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
              <p>No active reminder alerts right now.</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Reminders will chime and appear here as your baby's daily schedule unfolds.
              </p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className="p-3 rounded-xl bg-[#0a0f1d] border border-[#273a5e] flex items-start justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-white truncate">{notif.title}</span>
                    <span className="text-[10px] font-mono-num text-[#4be3b5] px-1.5 py-0.5 rounded bg-[#132338]">
                      {notif.timeStr}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{notif.message}</p>
                </div>
                <button
                  onClick={() => {
                    onDismiss(notif.id);
                    soundManager.playClickSound();
                  }}
                  className="p-1 text-slate-500 hover:text-slate-200 rounded shrink-0"
                  title="Dismiss notification"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="pt-3 border-t border-[#233350] flex justify-between items-center shrink-0">
            <span className="text-xs text-slate-500 font-mono-num">
              {notifications.length} notifications
            </span>
            <button
              onClick={() => {
                onClearAll();
                soundManager.playClickSound();
              }}
              className="text-xs text-slate-400 hover:text-rose-400 transition-colors"
            >
              Clear All
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Floating Toast for Real-time Notification alerts
export function FloatingReminderToast({
  notification,
  onDismiss,
}: {
  notification: ReminderNotification | null;
  onDismiss: () => void;
}) {
  if (!notification) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full p-4 rounded-xl bg-[#101729] border border-[#ebd48a] shadow-2xl animate-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-[#192b48] border border-[#ebd48a]/40 text-[#ebd48a] shrink-0">
          <Sparkles className="w-5 h-5 text-[#ebd48a]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-bold text-[#ebd48a]">
              Routine Reminder
            </span>
            <span className="text-[11px] font-mono-num text-slate-400">
              {notification.timeStr}
            </span>
          </div>
          <h4 className="text-sm font-semibold text-white mt-0.5 truncate">
            {notification.title}
          </h4>
          <p className="text-xs text-slate-300 mt-1">
            {notification.message}
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-white p-1 rounded shrink-0 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
