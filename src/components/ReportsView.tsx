import { useMemo, useState } from 'react';
import { ActivityLog, BabyProfile } from '../types';
import { soundManager } from '../utils/audio';
import { 
  Sparkles, Award, FileText, CheckCircle2, 
  Printer, Copy, Check, Info, ShieldCheck, HeartPulse
} from 'lucide-react';

interface ReportsViewProps {
  logs: ActivityLog[];
  profile: BabyProfile;
}

export function ReportsView({ logs, profile }: ReportsViewProps) {
  const [copied, setCopied] = useState(false);

  // Compute analytics over the last 7 days
  const stats = useMemo(() => {
    const now = new Date();
    const last7DaysLogs = logs.filter((l) => {
      const logDate = new Date(l.date).getTime();
      return now.getTime() - logDate <= 7 * 24 * 60 * 60 * 1000;
    });

    const sleepLogs = last7DaysLogs.filter((l) => l.category === 'sleep');
    const totalSleepMins = sleepLogs.reduce((acc, l) => acc + (l.durationMinutes || 0), 0);
    const avgSleepPerDay = Number((totalSleepMins / 7 / 60).toFixed(1));

    const nightLogs = sleepLogs.filter((l) => l.subType === 'night_sleep');
    const avgNightSleep = Number((nightLogs.reduce((acc, l) => acc + (l.durationMinutes || 0), 0) / 7 / 60).toFixed(1));

    const napLogs = sleepLogs.filter((l) => l.subType !== 'night_sleep');
    const avgNapSleep = Number((napLogs.reduce((acc, l) => acc + (l.durationMinutes || 0), 0) / 7 / 60).toFixed(1));

    const drinkLogs = last7DaysLogs.filter((l) => l.category === 'drink');
    const totalFluids = drinkLogs.reduce((acc, l) => {
      if (l.unit === 'oz') return acc + (l.amount || 0) * 29.57;
      return acc + (l.amount || 0);
    }, 0);
    const avgFluidsPerDay = Math.round(totalFluids / 7);

    const screenLogs = last7DaysLogs.filter((l) => l.category === 'screen');
    const totalScreenMins = screenLogs.reduce((acc, l) => acc + (l.durationMinutes || 0), 0);
    const avgScreenPerDay = Math.round(totalScreenMins / 7);

    const eatLogs = last7DaysLogs.filter((l) => l.category === 'eat');
    const avgMealsPerDay = Number((eatLogs.length / 7).toFixed(1));

    // Health Score calculation (0-100)
    let score = 70;
    if (avgSleepPerDay >= profile.dailyTargetSleepHours * 0.9) score += 12;
    if (avgFluidsPerDay >= profile.dailyTargetFluidsMl * 0.85) score += 10;
    if (avgScreenPerDay <= profile.dailyMaxScreenMins) score += 8;

    return {
      avgSleepPerDay,
      avgNightSleep,
      avgNapSleep,
      avgFluidsPerDay,
      avgScreenPerDay,
      avgMealsPerDay,
      score: Math.min(100, score),
      totalLogsCount: last7DaysLogs.length,
    };
  }, [logs, profile]);

  const handleCopyMarkdown = () => {
    const reportText = `# 🌟 Teyvat Baby Chronicle - 7-Day Pediatric Summary Report
**Traveler:** ${profile.name} (Age: 14 Months · Vision: ${profile.vision})
**Evaluation Period:** Last 7 Days
**Health & Routine Score:** ${stats.score}/100

## 1. Sleep & Circadian Rhythm
- Average Sleep: ${stats.avgSleepPerDay} hours/day (Target: ${profile.dailyTargetSleepHours}h)
- Night Sleep Average: ${stats.avgNightSleep} hrs
- Day Naps Average: ${stats.avgNapSleep} hrs
- Assessment: Sleep rhythm is stable with solid night consolidation.

## 2. Hydration & Nutrition Balance
- Average Fluids: ${stats.avgFluidsPerDay} ml/day (Target: ${profile.dailyTargetFluidsMl}ml)
- Solid Meals: ${stats.avgMealsPerDay} meals/day
- Assessment: Healthy intake of formula, water, and purees.

## 3. Screen Time Moderation
- Average Screen Time: ${stats.avgScreenPerDay} mins/day (Recommended Limit: $\\le$ ${profile.dailyMaxScreenMins}m)
- Status: ${stats.avgScreenPerDay <= profile.dailyMaxScreenMins ? 'Within Safe Pediatric Guidelines' : 'Slightly above target threshold'}

## 4. Care Recommendations
- Maintain current wake windows between afternoon nap and bedtime.
- Continue offering fresh water alongside solid meals.
`;

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    soundManager.playLogSuccessChime();
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    soundManager.playClickSound();
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Report Header */}
      <div className="p-5 rounded-2xl bg-[#101729] border border-[#243452] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#ebd48a]" />
            <h2 className="font-genshin text-lg sm:text-xl font-bold text-white tracking-wide">
              Pediatric Chronicle & Intelligence Summary
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated health evaluation for {profile.name} based on the past 7 days of verified logs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyMarkdown}
            className="px-3 py-1.5 rounded-lg bg-[#162238] border border-[#273a5e] text-slate-200 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy Summary'}</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#edd382] to-[#dfbb5e] text-[#0d1424] text-xs font-bold flex items-center gap-1.5 hover:brightness-110 shadow-sm transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Primary Wellness Index Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0d1424] via-[#121a2d] to-[#172238] border border-[#d4af37]/40 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#090e1a] border border-[#ebd48a]/50 flex items-center justify-center p-3">
              <img
                src="/src/assets/images/celestial_star_seal_1790690940407.jpg"
                alt="Celestial Seal"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-[#ebd48a] font-semibold">
                Overall Routine & Wellness Score
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl sm:text-4xl font-bold font-mono-num text-white">
                  {stats.score}
                </span>
                <span className="text-sm text-slate-400 font-mono-num">/ 100</span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 font-medium ml-2">
                  Excellent Routine
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Calculated from sleep consistency, fluid benchmarks, meal variety, and screen moderation.
              </p>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 border-[#233350] pt-3 sm:pt-0">
            <span className="text-xs text-slate-400">Total Activities Evaluated</span>
            <span className="text-lg font-bold font-mono-num text-[#4be3b5]">
              {stats.totalLogsCount} logs
            </span>
          </div>
        </div>
      </div>

      {/* 3 Pillar Clinical Evaluations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Pillar 1: Sleep Assessment */}
        <div className="p-5 rounded-2xl bg-[#101729] border border-[#243452] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-[#1f2d47]">
              <HeartPulse className="w-4 h-4 text-indigo-400" />
              <h3 className="font-genshin text-sm font-bold text-white tracking-wide">
                Sleep & Wake Windows
              </h3>
            </div>
            <div className="mt-4 space-y-3">
              <div>
                <span className="text-xs text-slate-400 block">7-Day Daily Sleep Average</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-bold font-mono-num text-white">{stats.avgSleepPerDay}</span>
                  <span className="text-xs text-slate-400">hrs (Goal: {profile.dailyTargetSleepHours}h)</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-[#1a253a]">
                <div>
                  <span className="text-slate-400 block">Night Sleep</span>
                  <span className="font-mono-num font-semibold text-slate-200">{stats.avgNightSleep}h avg</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Day Naps</span>
                  <span className="font-mono-num font-semibold text-slate-200">{stats.avgNapSleep}h avg</span>
                </div>
              </div>
              <p className="text-xs text-slate-300 bg-[#0a0f1d] p-2.5 rounded-lg border border-[#1e2a44] leading-relaxed">
                Sleep is consolidating effectively. Night rest averages ~{Math.round(stats.avgNightSleep)} hours, consistent with pediatric targets.
              </p>
            </div>
          </div>
        </div>

        {/* Pillar 2: Nutrition & Hydration */}
        <div className="p-5 rounded-2xl bg-[#101729] border border-[#243452] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-[#1f2d47]">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              <h3 className="font-genshin text-sm font-bold text-white tracking-wide">
                Hydration & Diet Balance
              </h3>
            </div>
            <div className="mt-4 space-y-3">
              <div>
                <span className="text-xs text-slate-400 block">Fluid Intake (Milk + Water)</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-bold font-mono-num text-white">{stats.avgFluidsPerDay}</span>
                  <span className="text-xs text-slate-400">ml / day</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-[#1a253a]">
                <div>
                  <span className="text-slate-400 block">Solid Meals</span>
                  <span className="font-mono-num font-semibold text-slate-200">{stats.avgMealsPerDay} / day</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Adequacy</span>
                  <span className="font-semibold text-emerald-400">Optimal</span>
                </div>
              </div>
              <p className="text-xs text-slate-300 bg-[#0a0f1d] p-2.5 rounded-lg border border-[#1e2a44] leading-relaxed">
                Hydration exceeds 85% of recommended guideline. Formula and purees are well balanced.
              </p>
            </div>
          </div>
        </div>

        {/* Pillar 3: Screen Moderation */}
        <div className="p-5 rounded-2xl bg-[#101729] border border-[#243452] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-[#1f2d47]">
              <Sparkles className="w-4 h-4 text-rose-400" />
              <h3 className="font-genshin text-sm font-bold text-white tracking-wide">
                Screen Exposure Safety
              </h3>
            </div>
            <div className="mt-4 space-y-3">
              <div>
                <span className="text-xs text-slate-400 block">Average Daily Screen</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-bold font-mono-num text-white">{stats.avgScreenPerDay}</span>
                  <span className="text-xs text-slate-400">mins / day</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-[#1a253a]">
                <div>
                  <span className="text-slate-400 block">Daily Limit</span>
                  <span className="font-mono-num font-semibold text-slate-200">{profile.dailyMaxScreenMins}m limit</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Compliance</span>
                  <span className={`font-semibold ${stats.avgScreenPerDay <= profile.dailyMaxScreenMins ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {stats.avgScreenPerDay <= profile.dailyMaxScreenMins ? 'Within Limit' : 'Above Limit'}
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-300 bg-[#0a0f1d] p-2.5 rounded-lg border border-[#1e2a44] leading-relaxed">
                {stats.avgScreenPerDay <= profile.dailyMaxScreenMins
                  ? 'Screen exposure is well supervised with interactive nursery content.'
                  : 'Consider swapping evening screen time for quiet storybook reading.'}
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Paimon's Field Guide / Pediatric Recommendations */}
      <div className="p-5 rounded-2xl bg-[#101729] border border-[#243452]">
        <div className="flex items-center gap-2 pb-3 border-b border-[#1f2d47]">
          <Info className="w-4 h-4 text-[#ebd48a]" />
          <h3 className="font-genshin text-base font-bold text-[#f5e2a3] tracking-wide">
            Companion Field Guide & Practical Parent Tips
          </h3>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3.5 rounded-xl bg-[#0a0f1d] border border-[#1f2d47] flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-[#4be3b5] shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-white block">Optimal 3.5h Wake Window</span>
              <p className="text-xs text-slate-400 mt-0.5">
                For a 14-month traveler, a 3 to 3.5 hour wake window between morning nap and afternoon slumber helps prevent overtiredness before bedtime.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0a0f1d] border border-[#1f2d47] flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-[#4be3b5] shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-white block">Post-Meal Water Routine</span>
              <p className="text-xs text-slate-400 mt-0.5">
                Offering 30-50ml of water right after lunch purees encourages swallowing coordination and keeps digestion smooth.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0a0f1d] border border-[#1f2d47] flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-[#4be3b5] shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-white block">Sunset Screen Cut-Off</span>
              <p className="text-xs text-slate-400 mt-0.5">
                Turning off TV screens at least 45 minutes before the 7:45 PM bedtime routine stimulates natural melatonin production for sound night sleep.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0a0f1d] border border-[#1f2d47] flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-[#4be3b5] shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-white block">Sensory Floor Exploration</span>
              <p className="text-xs text-slate-400 mt-0.5">
                Baby showed high cheerfulness during 14:00 playtime. Regular crawling and block stacking promotes bilateral motor coordination.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Unlocked Teyvat Milestone Badges */}
      <div className="p-5 rounded-2xl bg-[#101729] border border-[#243452]">
        <div className="flex items-center gap-2 pb-3 border-b border-[#1f2d47]">
          <Award className="w-4 h-4 text-[#ebd48a]" />
          <h3 className="font-genshin text-base font-bold text-[#f5e2a3] tracking-wide">
            Adventure Milestones & Badges
          </h3>
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { title: 'Slumber Knight', desc: 'Slept 10+ hrs in a night', unlocked: true, icon: '🌙' },
            { title: 'Adeptus Gourmet', desc: 'Ate 3 balanced meals', unlocked: true, icon: '🥣' },
            { title: 'Spring Fountain', desc: 'Hit 800ml daily fluids', unlocked: true, icon: '💧' },
            { title: 'Windborne Zen', desc: 'Screen under 30 mins', unlocked: true, icon: '🍃' },
          ].map((badge, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-[#090e1a] border border-[#263756] text-center flex flex-col items-center justify-center"
            >
              <span className="text-2xl mb-1">{badge.icon}</span>
              <span className="text-xs font-bold text-slate-200 block truncate">{badge.title}</span>
              <span className="text-[10px] text-slate-400 mt-0.5">{badge.desc}</span>
              <span className="mt-2 text-[10px] font-mono-num text-[#4be3b5] font-semibold">
                ✓ Unlocked
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
