import { useState, useEffect } from 'react';
import { ActivityLog, BabyProfile, ScheduleItem } from '../types';
import { soundManager } from '../utils/audio';
import { 
  Sparkles, Moon, Play, Pause, Square, Tv, 
  Trash2, Clock, CheckCircle2, AlertCircle, 
  ChevronRight, Calendar, Droplet, Utensils
} from 'lucide-react';

interface DashboardViewProps {
  profile: BabyProfile;
  todayLogs: ActivityLog[];
  schedule: ScheduleItem[];
  onOpenQuickLog: () => void;
  onDeleteLog: (id: string) => void;
  onAddLog: (log: Omit<ActivityLog, 'id'>) => void;
  onClaimDailyCommissions: () => void;
  dailyCommissionsClaimed: boolean;
  onToggleScheduleCheck: (id: string) => void;
  onNavigateToSchedule: () => void;
}

export function DashboardView({
  profile,
  todayLogs,
  schedule,
  onOpenQuickLog,
  onDeleteLog,
  onAddLog,
  onClaimDailyCommissions,
  dailyCommissionsClaimed,
  onToggleScheduleCheck,
  onNavigateToSchedule,
}: DashboardViewProps) {
  // Live Timer State for Nap or TV
  const [activeTimerType, setActiveTimerType] = useState<'sleep' | 'screen' | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Filter for today's logs
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  // Clock effect for timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  const handleStartTimer = (type: 'sleep' | 'screen') => {
    setActiveTimerType(type);
    setTimerSeconds(0);
    setIsTimerRunning(true);
    soundManager.playClickSound();
  };

  const handleStopAndSaveTimer = () => {
    if (!activeTimerType || timerSeconds < 10) {
      setIsTimerRunning(false);
      setActiveTimerType(null);
      setTimerSeconds(0);
      return;
    }

    const durationMins = Math.max(1, Math.round(timerSeconds / 60));
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    onAddLog({
      date: dateStr,
      timestamp: `${dateStr}T${timeStr}:00.000Z`,
      category: activeTimerType,
      subType: activeTimerType === 'sleep' ? 'nap' : 'tv',
      title: activeTimerType === 'sleep' ? `Timed Nap Session (${durationMins}m)` : `Timed Screen Watch (${durationMins}m)`,
      durationMinutes: durationMins,
      notes: `Recorded with live activity stopwatch`,
      mood: activeTimerType === 'sleep' ? 'sleepy' : 'cheerful',
    });

    soundManager.playLogSuccessChime();
    setIsTimerRunning(false);
    setActiveTimerType(null);
    setTimerSeconds(0);
  };

  // Computations for today's metrics
  const totalSleepMins = todayLogs
    .filter((l) => l.category === 'sleep')
    .reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);
  const totalSleepHours = (totalSleepMins / 60).toFixed(1);

  const totalFluidsMl = todayLogs
    .filter((l) => l.category === 'drink')
    .reduce((acc, curr) => {
      if (curr.unit === 'oz') return acc + (curr.amount || 0) * 29.57;
      return acc + (curr.amount || 0);
    }, 0);

  const totalScreenMins = todayLogs
    .filter((l) => l.category === 'screen')
    .reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);

  const totalFeeds = todayLogs.filter((l) => l.category === 'eat' || l.category === 'drink').length;
  const totalDiapers = todayLogs.filter((l) => l.category === 'diaper').length;

  // 4 Daily Commissions
  const c1Completed = Number(totalSleepHours) >= profile.dailyTargetSleepHours * 0.8;
  const c2Completed = totalFluidsMl >= profile.dailyTargetFluidsMl * 0.8;
  const c3Completed = totalFeeds >= 3;
  const c4Completed = totalScreenMins <= profile.dailyMaxScreenMins;

  const commissionsDoneCount = [c1Completed, c2Completed, c3Completed, c4Completed].filter(Boolean).length;
  const allCommissionsDone = commissionsDoneCount === 4;

  // Next upcoming schedule item
  const todayStr = new Date().toISOString().split('T')[0];
  const nowTime = `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`;
  
  // Find next upcoming schedule item
  const nextItem = schedule.find(
    (s) => s.time >= nowTime && !s.completedDates.includes(todayStr)
  ) || schedule.find((s) => !s.completedDates.includes(todayStr));

  // Filtered timeline logs
  const filteredLogs = todayLogs.filter((log) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'nutrition') return log.category === 'eat' || log.category === 'drink';
    return log.category === selectedFilter;
  });

  const formatTimerDigits = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      
      {/* 4 Core Summary Metric Displays */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Metric 1: Sleep */}
        <div className="p-4 rounded-xl bg-[#11192a] border border-[#223352] relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold">Sleep Today</span>
            <Moon className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold font-mono-num text-white">
              {totalSleepHours}
            </span>
            <span className="text-xs text-slate-400">/ {profile.dailyTargetSleepHours}h</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
            <span className="text-indigo-400">
              {todayLogs.filter(l => l.category === 'sleep' && l.subType === 'nap').length} naps logged
            </span>
            <span>·</span>
            <span>{totalSleepMins} mins total</span>
          </div>
        </div>

        {/* Metric 2: Fluids / Hydration */}
        <div className="p-4 rounded-xl bg-[#11192a] border border-[#223352] relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold">Fluids & Milk</span>
            <Droplet className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold font-mono-num text-white">
              {Math.round(totalFluidsMl)}
            </span>
            <span className="text-xs text-slate-400">/ {profile.dailyTargetFluidsMl}ml</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
            <span className="text-sky-400 font-mono-num">
              {Math.round((totalFluidsMl / profile.dailyTargetFluidsMl) * 100)}% target
            </span>
            <span>·</span>
            <span>Hydration stable</span>
          </div>
        </div>

        {/* Metric 3: Screen / TV */}
        <div className="p-4 rounded-xl bg-[#11192a] border border-[#223352] relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold">Screen Time</span>
            <Tv className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl sm:text-3xl font-bold font-mono-num ${
              totalScreenMins > profile.dailyMaxScreenMins ? 'text-rose-400' : 'text-white'
            }`}>
              {totalScreenMins}
            </span>
            <span className="text-xs text-slate-400">/ max {profile.dailyMaxScreenMins}m</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
            {totalScreenMins <= profile.dailyMaxScreenMins ? (
              <span className="text-emerald-400">Within pediatric safe limits</span>
            ) : (
              <span className="text-rose-400">Exceeded daily target</span>
            )}
          </div>
        </div>

        {/* Metric 4: Meals & Diapers */}
        <div className="p-4 rounded-xl bg-[#11192a] border border-[#223352] relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold">Care Rounds</span>
            <Utensils className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold font-mono-num text-white">
              {totalFeeds}
            </span>
            <span className="text-xs text-slate-400">feeds</span>
            <span className="text-slate-600 font-mono-num">|</span>
            <span className="text-2xl sm:text-3xl font-bold font-mono-num text-[#4be3b5]">
              {totalDiapers}
            </span>
            <span className="text-xs text-slate-400">diapers</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
            <span className="text-amber-400">Well-fed & active</span>
          </div>
        </div>

      </div>

      {/* Live Activity Timers & Quick Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#121c33] to-[#162138] border border-[#273a5e] shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#ebd48a]" />
              <h2 className="font-genshin text-sm sm:text-base font-bold text-white tracking-wide">
                Live Activity Stopwatch
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Track baby's naps or screen sessions in real-time with automatic duration logging
            </p>
          </div>

          {/* Active Timer Display or Start Buttons */}
          {activeTimerType ? (
            <div className="flex items-center gap-3 bg-[#0a0f1d] px-4 py-2.5 rounded-xl border border-[#d4af37]/40 shadow-inner">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <span className="text-xs font-semibold uppercase text-slate-300">
                  {activeTimerType === 'sleep' ? 'Nap Timer' : 'Screen Timer'}
                </span>
                <span className="font-mono-num text-lg font-bold text-[#4be3b5] tracking-wider ml-1">
                  {formatTimerDigits(timerSeconds)}
                </span>
              </div>

              <div className="flex items-center gap-1.5 ml-2">
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="p-1.5 rounded-lg bg-[#192742] text-slate-200 hover:text-white hover:bg-[#253960] transition-colors cursor-pointer"
                  title={isTimerRunning ? 'Pause' : 'Resume'}
                >
                  {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleStopAndSaveTimer}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                  title="Finish & Save into Activity Log"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Save Log</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleStartTimer('sleep')}
                className="px-3.5 py-1.5 rounded-lg bg-[#192a47] hover:bg-[#21375d] border border-indigo-500/30 text-indigo-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span>Start Nap Timer</span>
              </button>
              <button
                onClick={() => handleStartTimer('screen')}
                className="px-3.5 py-1.5 rounded-lg bg-[#192a47] hover:bg-[#21375d] border border-rose-500/30 text-rose-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Tv className="w-3.5 h-3.5 text-rose-400" />
                <span>Start TV Timer</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Grid: Genshin Daily Commissions & Next Routine Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols): Daily Commissions (Daily Baby Care Milestones) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#101729] border border-[#243452]">
          <div className="flex items-center justify-between pb-3 border-b border-[#1f2d47]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#ebd48a]" />
              <h2 className="font-genshin text-base font-bold text-[#f5e2a3] tracking-wide">
                Daily Adventurer Commissions
              </h2>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <span className="font-mono-num font-bold text-[#4be3b5]">{commissionsDoneCount}/4</span>
              <span>Complete</span>
            </div>
          </div>

          <p className="text-xs text-slate-400 mt-2">
            Complete daily core baby care goals to earn Primogems for baby's milestone trove.
          </p>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Commission 1: Sleep */}
            <div className={`p-3 rounded-xl border transition-all ${
              c1Completed ? 'bg-indigo-950/20 border-indigo-500/40 text-indigo-200' : 'bg-[#0d1424] border-[#22314e] text-slate-300'
            }`}>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold block text-white">1. Slumber Adept</span>
                  <span className="text-[11px] text-slate-400">Sleep $\ge$ 10 hrs today</span>
                </div>
                {c1Completed ? (
                  <CheckCircle2 className="w-4 h-4 text-[#4be3b5]" />
                ) : (
                  <span className="text-xs font-mono-num text-slate-500">{totalSleepHours}h / 10h</span>
                )}
              </div>
            </div>

            {/* Commission 2: Hydration */}
            <div className={`p-3 rounded-xl border transition-all ${
              c2Completed ? 'bg-sky-950/20 border-sky-500/40 text-sky-200' : 'bg-[#0d1424] border-[#22314e] text-slate-300'
            }`}>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold block text-white">2. Springwater Blessing</span>
                  <span className="text-[11px] text-slate-400">Fluids $\ge$ 640 ml intake</span>
                </div>
                {c2Completed ? (
                  <CheckCircle2 className="w-4 h-4 text-[#4be3b5]" />
                ) : (
                  <span className="text-xs font-mono-num text-slate-500">{Math.round(totalFluidsMl)}ml</span>
                )}
              </div>
            </div>

            {/* Commission 3: Nutrition */}
            <div className={`p-3 rounded-xl border transition-all ${
              c3Completed ? 'bg-amber-950/20 border-amber-500/40 text-amber-200' : 'bg-[#0d1424] border-[#22314e] text-slate-300'
            }`}>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold block text-white">3. Teyvat Feast</span>
                  <span className="text-[11px] text-slate-400">Record at least 3 meals/bottles</span>
                </div>
                {c3Completed ? (
                  <CheckCircle2 className="w-4 h-4 text-[#4be3b5]" />
                ) : (
                  <span className="text-xs font-mono-num text-slate-500">{totalFeeds} / 3</span>
                )}
              </div>
            </div>

            {/* Commission 4: Screen Time */}
            <div className={`p-3 rounded-xl border transition-all ${
              c4Completed ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200' : 'bg-[#0d1424] border-[#22314e] text-slate-300'
            }`}>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold block text-white">4. Windborne Moderation</span>
                  <span className="text-[11px] text-slate-400">Keep screen time $\le$ {profile.dailyMaxScreenMins}m</span>
                </div>
                {c4Completed ? (
                  <CheckCircle2 className="w-4 h-4 text-[#4be3b5]" />
                ) : (
                  <span className="text-xs font-mono-num text-rose-400">{totalScreenMins}m</span>
                )}
              </div>
            </div>
          </div>

          {/* Reward claim bar */}
          <div className="mt-4 pt-3 border-t border-[#1f2d47] flex items-center justify-between">
            <span className="text-xs text-slate-400">
              {dailyCommissionsClaimed
                ? '✅ Daily Primogems claimed today!'
                : allCommissionsDone
                ? '🎉 All 4 commissions completed!'
                : 'Complete all 4 commissions to claim rewards'}
            </span>

            {allCommissionsDone && !dailyCommissionsClaimed && (
              <button
                onClick={onClaimDailyCommissions}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-[#0d1424] bg-gradient-to-r from-[#edd382] to-[#dfbb5e] shadow-[0_0_12px_rgba(237,211,130,0.4)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer animate-bounce"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Claim +60 Primogems</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Schedule / Next Up Banner */}
        <div className="p-5 rounded-2xl bg-[#101729] border border-[#243452] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#1f2d47]">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#4be3b5]" />
                <h2 className="font-genshin text-base font-bold text-white tracking-wide">
                  Routine Schedule
                </h2>
              </div>
              <button
                onClick={onNavigateToSchedule}
                className="text-xs text-[#4be3b5] hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>View Full</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {nextItem ? (
              <div className="mt-4 p-3.5 rounded-xl bg-[#0c1324] border border-[#263756]">
                <span className="text-[11px] uppercase tracking-wider text-[#ebd48a] font-semibold block">
                  Next Scheduled Routine
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl font-bold font-mono-num text-white">
                    {nextItem.time}
                  </span>
                  <span className="text-sm font-semibold text-slate-200">
                    {nextItem.label}
                  </span>
                </div>
                <div className="mt-2 text-xs text-slate-400">
                  {nextItem.targetAmount ? `Target: ${nextItem.targetAmount}ml/g` : ''}
                  {nextItem.targetDurationMins ? `Duration: ${nextItem.targetDurationMins} mins` : ''}
                </div>

                <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#1e2a44]">
                  <span className="text-[11px] text-slate-400">
                    {nextItem.completedDates.includes(todayStr) ? 'Done for today' : 'Pending routine'}
                  </span>
                  <button
                    onClick={() => {
                      onToggleScheduleCheck(nextItem.id);
                      soundManager.playLogSuccessChime();
                    }}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                      nextItem.completedDates.includes(todayStr)
                        ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/40'
                        : 'bg-[#1b2b48] text-[#4be3b5] hover:bg-[#253960]'
                    }`}
                  >
                    {nextItem.completedDates.includes(todayStr) ? '✓ Completed' : 'Mark Done'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-6 text-center text-xs text-slate-400 py-6">
                All scheduled routines completed for today!
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-[#1f2d47] text-xs text-slate-400 flex items-center justify-between">
            <span>Reminders: Interactive Audio & Alerts</span>
            <span className="text-emerald-400 font-medium">Active</span>
          </div>
        </div>

      </div>

      {/* Today's Activity Timeline / Journal Feed */}
      <div className="p-5 rounded-2xl bg-[#101729] border border-[#243452]">
        
        {/* Header & Filter Controls (Segmented buttons) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1f2d47]">
          <div>
            <h2 className="font-genshin text-base sm:text-lg font-bold text-white tracking-wide">
              Today's Activity Journal
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Chronological log of feedings, sleep periods, diaper changes, and play
            </p>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 p-1 bg-[#0a0f1d] rounded-lg border border-[#202e48] overflow-x-auto">
            {[
              { id: 'all', label: 'All' },
              { id: 'nutrition', label: 'Feeds/Drinks' },
              { id: 'sleep', label: 'Sleep' },
              { id: 'screen', label: 'TV / Media' },
              { id: 'diaper', label: 'Diapers' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setSelectedFilter(tab.id);
                  soundManager.playClickSound();
                }}
                className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                  selectedFilter === tab.id
                    ? 'bg-[#1b2b48] text-[#4be3b5] font-semibold border border-[#4be3b5]/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline Items */}
        <div className="mt-4 divide-y divide-[#1c283f]">
          {filteredLogs.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-slate-400">No activities logged yet for this category today.</p>
              <button
                onClick={onOpenQuickLog}
                className="mt-3 px-4 py-1.5 text-xs font-semibold text-[#0d1424] bg-gradient-to-r from-[#edd382] to-[#dfbb5e] rounded-lg hover:brightness-110"
              >
                + Log First Activity
              </button>
            </div>
          ) : (
            filteredLogs.map((log) => {
              const timeFormatted = new Date(log.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              const categoryBadge = {
                eat: { text: 'Feed / Food', color: 'text-amber-400', icon: Utensils },
                drink: { text: 'Drink / Milk', color: 'text-sky-400', icon: Droplet },
                sleep: { text: 'Sleep', color: 'text-indigo-400', icon: Moon },
                screen: { text: 'Screen / TV', color: 'text-rose-400', icon: Tv },
                diaper: { text: 'Diaper Change', color: 'text-teal-400', icon: AlertCircle },
                play: { text: 'Play Time', color: 'text-emerald-400', icon: Sparkles },
              }[log.category];

              const Icon = categoryBadge.icon;

              return (
                <div
                  key={log.id}
                  className="py-3.5 flex items-center justify-between gap-4 group hover:bg-[#131d33]/50 px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Timestamp */}
                    <span className="font-mono-num text-xs font-semibold text-slate-400 w-14 shrink-0">
                      {timeFormatted}
                    </span>

                    {/* Category Icon */}
                    <div className={`p-2 rounded-lg bg-[#0c1324] border border-[#22314e] ${categoryBadge.color} shrink-0`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    {/* Details */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-100 truncate">
                          {log.title}
                        </span>
                        {log.mood && (
                          <span className="text-xs" title={`Mood: ${log.mood}`}>
                            {log.mood === 'cheerful' ? '😊' : log.mood === 'calm' ? '😌' : log.mood === 'fussy' ? '🥺' : '😴'}
                          </span>
                        )}
                      </div>
                      
                      {/* Quiet Unboxed Metadata with Typographic Separators */}
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span className={categoryBadge.color}>{categoryBadge.text}</span>
                        {log.amount && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono-num text-slate-300 font-medium">
                              {log.amount} {log.unit}
                            </span>
                          </>
                        )}
                        {log.durationMinutes && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono-num text-slate-300 font-medium">
                              {log.durationMinutes} mins
                            </span>
                          </>
                        )}
                        {log.notes && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="italic text-slate-400 truncate max-w-xs">{log.notes}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        onDeleteLog(log.id);
                        soundManager.playClickSound();
                      }}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 rounded-md transition-colors opacity-60 group-hover:opacity-100 cursor-pointer"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

    </div>
  );
}
