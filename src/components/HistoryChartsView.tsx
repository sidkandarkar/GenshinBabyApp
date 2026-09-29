import { useState, useMemo } from 'react';
import { ActivityLog, BabyProfile } from '../types';
import { formatDate } from '../data/seedData';
import { soundManager } from '../utils/audio';
import { Moon, Tv, Droplet, Clock, Download } from 'lucide-react';

interface HistoryChartsViewProps {
  logs: ActivityLog[];
  profile: BabyProfile;
}

export function HistoryChartsView({ logs, profile }: HistoryChartsViewProps) {
  const [rangeDays, setRangeDays] = useState<7 | 14 | 30>(7);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  // Compute daily aggregates for the selected range
  const dailyData = useMemo(() => {
    const now = new Date();
    const result: Array<{
      date: string;
      label: string;
      dayOfWeek: string;
      nightSleepMins: number;
      napMins: number;
      totalSleepMins: number;
      totalSleepHours: number;
      fluidsMl: number;
      screenMins: number;
      feedsCount: number;
      diapersCount: number;
    }> = [];

    for (let i = rangeDays - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = formatDate(d);
      const dayLogs = logs.filter((l) => l.date === dateStr);

      const nightSleepMins = dayLogs
        .filter((l) => l.category === 'sleep' && l.subType === 'night_sleep')
        .reduce((sum, l) => sum + (l.durationMinutes || 0), 0);

      const napMins = dayLogs
        .filter((l) => l.category === 'sleep' && l.subType !== 'night_sleep')
        .reduce((sum, l) => sum + (l.durationMinutes || 0), 0);

      const totalSleepMins = nightSleepMins + napMins;

      const fluidsMl = dayLogs
        .filter((l) => l.category === 'drink')
        .reduce((sum, l) => {
          if (l.unit === 'oz') return sum + (l.amount || 0) * 29.57;
          return sum + (l.amount || 0);
        }, 0);

      const screenMins = dayLogs
        .filter((l) => l.category === 'screen')
        .reduce((sum, l) => sum + (l.durationMinutes || 0), 0);

      const feedsCount = dayLogs.filter((l) => l.category === 'eat' || l.category === 'drink').length;
      const diapersCount = dayLogs.filter((l) => l.category === 'diaper').length;

      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      result.push({
        date: dateStr,
        label: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        dayOfWeek: days[d.getDay()],
        nightSleepMins,
        napMins,
        totalSleepMins,
        totalSleepHours: Number((totalSleepMins / 60).toFixed(1)),
        fluidsMl: Math.round(fluidsMl),
        screenMins,
        feedsCount,
        diapersCount,
      });
    }

    return result;
  }, [logs, rangeDays]);

  // Overall averages for the period
  const avgSleep = (
    dailyData.reduce((acc, d) => acc + d.totalSleepHours, 0) / (dailyData.length || 1)
  ).toFixed(1);

  const avgFluids = Math.round(
    dailyData.reduce((acc, d) => acc + d.fluidsMl, 0) / (dailyData.length || 1)
  );

  const avgScreen = Math.round(
    dailyData.reduce((acc, d) => acc + d.screenMins, 0) / (dailyData.length || 1)
  );

  // Maximum scales for charts
  const maxSleepScale = Math.max(16, ...dailyData.map((d) => d.totalSleepHours + 2));
  const maxFluidScale = Math.max(1000, ...dailyData.map((d) => d.fluidsMl + 100));
  const maxScreenScale = Math.max(60, ...dailyData.map((d) => d.screenMins + 15));

  const handleExportCSV = () => {
    const headers = 'Date,Day,Total Sleep (hrs),Night Sleep (min),Naps (min),Fluids (ml),Screen Time (min),Feedings,Diapers\n';
    const rows = dailyData
      .map(
        (d) =>
          `${d.date},${d.dayOfWeek},${d.totalSleepHours},${d.nightSleepMins},${d.napMins},${d.fluidsMl},${d.screenMins},${d.feedsCount},${d.diapersCount}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `baby_chronicle_data_${rangeDays}days.csv`;
    a.click();
    URL.revokeObjectURL(url);
    soundManager.playLogSuccessChime();
  };

  return (
    <div className="space-y-6">
      
      {/* Header bar & Time Range Selector */}
      <div className="p-5 rounded-2xl bg-[#101729] border border-[#243452] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-genshin text-lg sm:text-xl font-bold text-white tracking-wide">
            Historical Tracking & Trend Analytics
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Visualize sleep rhythms, nutrition intake, and screen moderation across days
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Time range buttons */}
          <div className="flex items-center gap-1 p-1 bg-[#090e1a] rounded-lg border border-[#1f2d47]">
            {([7, 14, 30] as const).map((days) => (
              <button
                key={days}
                onClick={() => {
                  setRangeDays(days);
                  soundManager.playClickSound();
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  rangeDays === days
                    ? 'bg-[#1b2b48] text-[#4be3b5] border border-[#4be3b5]/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Last {days} Days
              </button>
            ))}
          </div>

          {/* Export CSV button */}
          <button
            onClick={handleExportCSV}
            className="p-2 text-slate-300 hover:text-white bg-[#162238] border border-[#25395c] rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Export CSV Data"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* 3 Summary Period Averages */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#101729] border border-[#223352]">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">
            Average Daily Sleep
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-bold font-mono-num text-white">{avgSleep}</span>
            <span className="text-xs text-slate-400">hours/day</span>
          </div>
          <span className="text-[11px] text-indigo-400 block mt-1">
            Target: {profile.dailyTargetSleepHours}h daily
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#101729] border border-[#223352]">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">
            Average Fluids & Milk
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-bold font-mono-num text-white">{avgFluids}</span>
            <span className="text-xs text-slate-400">ml/day</span>
          </div>
          <span className="text-[11px] text-sky-400 block mt-1">
            Target: {profile.dailyTargetFluidsMl}ml daily
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#101729] border border-[#223352]">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">
            Average Screen Time
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className={`text-2xl font-bold font-mono-num ${avgScreen > profile.dailyMaxScreenMins ? 'text-rose-400' : 'text-white'}`}>
              {avgScreen}
            </span>
            <span className="text-xs text-slate-400">mins/day</span>
          </div>
          <span className="text-[11px] text-emerald-400 block mt-1">
            Limit: max {profile.dailyMaxScreenMins}m daily
          </span>
        </div>
      </div>

      {/* Chart 1: Sleep Distribution (Stacked Night Sleep vs Naps) */}
      <div className="p-5 rounded-2xl bg-[#101729] border border-[#243452]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-[#1f2d47]">
          <div className="flex items-center gap-2">
            <Moon className="w-4 h-4 text-indigo-400" />
            <h3 className="font-genshin text-base font-bold text-white tracking-wide">
              Sleep Rhythm & Duration (Night Sleep + Day Naps)
            </h3>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500" />
              <span className="text-slate-300">Night Sleep</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-purple-400" />
              <span className="text-slate-300">Day Naps</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-t border-dashed border-[#ebd48a]" />
              <span className="text-[#ebd48a]">Target ({profile.dailyTargetSleepHours}h)</span>
            </div>
          </div>
        </div>

        {/* SVG Stacked Bar Chart */}
        <div className="h-64 w-full relative">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 700 220">
            {/* Target Line */}
            {(() => {
              const yPos = 200 - (profile.dailyTargetSleepHours / maxSleepScale) * 180;
              return (
                <line
                  x1="40"
                  y1={yPos}
                  x2="690"
                  y2={yPos}
                  stroke="#ebd48a"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  opacity="0.6"
                />
              );
            })()}

            {/* Bars */}
            {dailyData.map((d, idx) => {
              const totalItems = dailyData.length;
              const slotWidth = (650 - 40) / totalItems;
              const barWidth = Math.min(32, slotWidth * 0.6);
              const xPos = 50 + idx * slotWidth + (slotWidth - barWidth) / 2;

              const nightH = (d.nightSleepMins / 60 / maxSleepScale) * 180;
              const napH = (d.napMins / 60 / maxSleepScale) * 180;
              const totalH = nightH + napH;
              const yNight = 200 - nightH;
              const yNap = yNight - napH;

              const isHovered = hoveredDate === d.date;

              return (
                <g
                  key={d.date}
                  className="cursor-pointer transition-opacity"
                  onMouseEnter={() => setHoveredDate(d.date)}
                  onMouseLeave={() => setHoveredDate(null)}
                >
                  {/* Night Sleep Bar */}
                  <rect
                    x={xPos}
                    y={yNight}
                    width={barWidth}
                    height={Math.max(2, nightH)}
                    fill="#6366f1"
                    rx={2}
                    className="hover:brightness-125 transition-all"
                  />

                  {/* Nap Sleep Bar stacked on top */}
                  <rect
                    x={xPos}
                    y={yNap}
                    width={barWidth}
                    height={Math.max(2, napH)}
                    fill="#a855f7"
                    rx={2}
                    className="hover:brightness-125 transition-all"
                  />

                  {/* X-axis label */}
                  <text
                    x={xPos + barWidth / 2}
                    y="215"
                    textAnchor="middle"
                    fill={isHovered ? '#4be3b5' : '#8899b5'}
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {rangeDays === 30 ? (idx % 4 === 0 ? d.label : '') : d.dayOfWeek}
                  </text>

                  {/* Hover tooltip indicator */}
                  {isHovered && (
                    <g>
                      <rect
                        x={Math.max(10, Math.min(xPos - 50, 580))}
                        y={Math.max(10, yNap - 35)}
                        width="110"
                        height="30"
                        rx="4"
                        fill="#0b101d"
                        stroke="#ebd48a"
                        strokeWidth="1"
                      />
                      <text
                        x={Math.max(10, Math.min(xPos - 50, 580)) + 55}
                        y={Math.max(10, yNap - 35) + 18}
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="11"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {d.totalSleepHours}h ({Math.round(d.nightSleepMins / 60)}h + {d.napMins}m nap)
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Grid: 2 Charts Side by Side: Hydration/Fluids & Screen Time */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 2: Hydration Intake (ml) */}
        <div className="p-5 rounded-2xl bg-[#101729] border border-[#243452]">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1f2d47]">
            <div className="flex items-center gap-2">
              <Droplet className="w-4 h-4 text-sky-400" />
              <h3 className="font-genshin text-base font-bold text-white tracking-wide">
                Daily Hydration & Fluids (ml)
              </h3>
            </div>
            <span className="text-xs text-sky-400 font-mono-num">
              Target: {profile.dailyTargetFluidsMl}ml
            </span>
          </div>

          <div className="h-56 w-full relative">
            <svg className="w-full h-full" viewBox="0 0 350 180">
              {/* Target Line */}
              {(() => {
                const yPos = 160 - (profile.dailyTargetFluidsMl / maxFluidScale) * 140;
                return (
                  <line
                    x1="20"
                    y1={yPos}
                    x2="340"
                    y2={yPos}
                    stroke="#38bdf8"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                    opacity="0.5"
                  />
                );
              })()}

              {dailyData.map((d, idx) => {
                const slotWidth = 320 / dailyData.length;
                const barWidth = Math.min(18, slotWidth * 0.6);
                const xPos = 20 + idx * slotWidth + (slotWidth - barWidth) / 2;
                const h = (d.fluidsMl / maxFluidScale) * 140;
                const yPos = 160 - h;

                return (
                  <g key={d.date} className="cursor-pointer">
                    <rect
                      x={xPos}
                      y={yPos}
                      width={barWidth}
                      height={Math.max(2, h)}
                      fill="#0284c7"
                      rx={2}
                      className="hover:fill-sky-400 transition-colors"
                    >
                      <title>{`${d.date}: ${d.fluidsMl}ml`}</title>
                    </rect>
                    <text
                      x={xPos + barWidth / 2}
                      y="173"
                      textAnchor="middle"
                      fill="#8899b5"
                      fontSize="9"
                      fontFamily="monospace"
                    >
                      {rangeDays === 30 ? (idx % 5 === 0 ? d.label : '') : d.dayOfWeek}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Chart 3: Screen Time Trend (mins) */}
        <div className="p-5 rounded-2xl bg-[#101729] border border-[#243452]">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1f2d47]">
            <div className="flex items-center gap-2">
              <Tv className="w-4 h-4 text-rose-400" />
              <h3 className="font-genshin text-base font-bold text-white tracking-wide">
                Screen Time Exposure (mins)
              </h3>
            </div>
            <span className="text-xs text-rose-400 font-mono-num">
              Max limit: {profile.dailyMaxScreenMins}m
            </span>
          </div>

          <div className="h-56 w-full relative">
            <svg className="w-full h-full" viewBox="0 0 350 180">
              {/* Danger Threshold Line */}
              {(() => {
                const yPos = 160 - (profile.dailyMaxScreenMins / maxScreenScale) * 140;
                return (
                  <line
                    x1="20"
                    y1={yPos}
                    x2="340"
                    y2={yPos}
                    stroke="#f43f5e"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    opacity="0.7"
                  />
                );
              })()}

              {dailyData.map((d, idx) => {
                const slotWidth = 320 / dailyData.length;
                const barWidth = Math.min(18, slotWidth * 0.6);
                const xPos = 20 + idx * slotWidth + (slotWidth - barWidth) / 2;
                const h = (d.screenMins / maxScreenScale) * 140;
                const yPos = 160 - h;
                const isOver = d.screenMins > profile.dailyMaxScreenMins;

                return (
                  <g key={d.date} className="cursor-pointer">
                    <rect
                      x={xPos}
                      y={yPos}
                      width={barWidth}
                      height={Math.max(2, h)}
                      fill={isOver ? '#e11d48' : '#334155'}
                      rx={2}
                      className="hover:brightness-125 transition-colors"
                    >
                      <title>{`${d.date}: ${d.screenMins} mins`}</title>
                    </rect>
                    <text
                      x={xPos + barWidth / 2}
                      y="173"
                      textAnchor="middle"
                      fill="#8899b5"
                      fontSize="9"
                      fontFamily="monospace"
                    >
                      {rangeDays === 30 ? (idx % 5 === 0 ? d.label : '') : d.dayOfWeek}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

      </div>

      {/* Tabular Historical Ledger for Complete Scannability */}
      <div className="p-5 rounded-2xl bg-[#101729] border border-[#243452]">
        <div className="flex items-center justify-between pb-3 border-b border-[#1f2d47]">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#ebd48a]" />
            <h3 className="font-genshin text-base font-bold text-white tracking-wide">
              Detailed Historical Data Table
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono-num">{dailyData.length} records</span>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#202e48] text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3 text-right">Sleep Total</th>
                <th className="py-2.5 px-3 text-right">Night / Naps</th>
                <th className="py-2.5 px-3 text-right">Fluids</th>
                <th className="py-2.5 px-3 text-right">Screen</th>
                <th className="py-2.5 px-3 text-right">Feeds</th>
                <th className="py-2.5 px-3 text-right">Diapers</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#18243b]">
              {dailyData.map((d) => (
                <tr key={d.date} className="hover:bg-[#141f36]/60 transition-colors">
                  <td className="py-2.5 px-3 font-medium text-slate-200">
                    {d.label} <span className="text-slate-500 font-normal">({d.dayOfWeek})</span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono-num font-semibold text-white">
                    {d.totalSleepHours}h
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono-num text-slate-400">
                    {Math.round(d.nightSleepMins / 60)}h / {d.napMins}m
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono-num text-sky-400 font-medium">
                    {d.fluidsMl}ml
                  </td>
                  <td className={`py-2.5 px-3 text-right font-mono-num font-medium ${
                    d.screenMins > profile.dailyMaxScreenMins ? 'text-rose-400' : 'text-slate-300'
                  }`}>
                    {d.screenMins}m
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono-num text-amber-400">
                    {d.feedsCount}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono-num text-teal-400">
                    {d.diapersCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
