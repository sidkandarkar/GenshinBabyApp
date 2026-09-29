import { useState } from 'react';
import { ActiveTab } from '../types';
import { soundManager } from '../utils/audio';
import { Volume2, VolumeX, Plus, Sparkles, Bell } from 'lucide-react';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  primogems: number;
  onOpenQuickLog: () => void;
  unreadRemindersCount: number;
  onOpenNotifications: () => void;
}

export function Header({
  activeTab,
  setActiveTab,
  primogems,
  onOpenQuickLog,
  unreadRemindersCount,
  onOpenNotifications,
}: HeaderProps) {
  const [isMuted, setIsMuted] = useState(soundManager.getMuted());

  const handleToggleSound = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      soundManager.playClickSound();
    }
  };

  const navLinks: { id: ActiveTab; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'logs', label: 'Activity Journal' },
    { id: 'analytics', label: 'Historical Charts' },
    { id: 'reports', label: 'Summary Reports' },
    { id: 'routine', label: 'Daily Schedule' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0d1424]/90 backdrop-blur-md border-b border-[#2a3854]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Zone 1: Brand Wordmark (Single text element in display face) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              setActiveTab('dashboard');
              soundManager.playClickSound();
            }}
            className="text-left group cursor-pointer"
          >
            <span className="font-genshin text-lg sm:text-xl font-bold tracking-wider text-[#f5e2a3] group-hover:text-amber-300 transition-colors drop-shadow-[0_0_12px_rgba(245,226,163,0.3)]">
              TEYVAT BABY CHRONICLE
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Clean text links with subtle hover underlines) */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
          {navLinks.map((link) => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => {
                  setActiveTab(link.id);
                  soundManager.playClickSound();
                }}
                className={`py-1 transition-colors relative whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'text-[#4be3b5] font-semibold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4be3b5] shadow-[0_0_8px_#4be3b5]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Actions (Primogem Stash, Sound FX, Reminder Alert & Primary Action) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Primogem Stash Counter */}
          <div 
            title="Primogems earned from completed daily baby care milestones"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#162238] border border-[#d4af37]/30 text-xs font-mono-num text-[#f8d070]"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#f8d070]" />
            <span className="font-bold">{primogems.toLocaleString()}</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            aria-label={isMuted ? 'Unmute sounds' : 'Mute sounds'}
            className="p-2 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-[#1a2842] transition-colors cursor-pointer"
            title={isMuted ? 'Sound muted (Click to enable Teyvat audio)' : 'Sound active (Click to mute)'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-[#4be3b5]" />}
          </button>

          {/* Reminders / Notifications button */}
          <button
            onClick={() => {
              onOpenNotifications();
              soundManager.playClickSound();
            }}
            aria-label="View notifications & reminders"
            className="relative p-2 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-[#1a2842] transition-colors cursor-pointer"
            title="Schedule Reminders"
          >
            <Bell className="w-4 h-4 text-[#f5e2a3]" />
            {unreadRemindersCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>

          {/* Primary Action Button */}
          <button
            onClick={() => {
              onOpenQuickLog();
              soundManager.playClickSound();
            }}
            className="px-3.5 py-1.5 text-xs font-semibold text-[#0d1424] bg-gradient-to-r from-[#edd382] via-[#f7e4a1] to-[#dfbb5e] rounded-md hover:brightness-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(237,211,130,0.3)] flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#0d1424] stroke-[3]" />
            <span>Log Activity</span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation bar */}
      <div className="lg:hidden flex items-center overflow-x-auto px-4 py-2 border-t border-[#1e2c47] gap-3 text-xs bg-[#0b101d]">
        {navLinks.map((link) => {
          const isActive = activeTab === link.id;
          return (
            <button
              key={link.id}
              onClick={() => {
                setActiveTab(link.id);
                soundManager.playClickSound();
              }}
              className={`px-2.5 py-1 rounded whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-[#182a46] text-[#4be3b5] font-semibold border border-[#4be3b5]/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {link.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}
