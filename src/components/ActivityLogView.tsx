import { useState } from 'react';
import { ActivityCategory, ActivityLog } from '../types';
import { soundManager } from '../utils/audio';
import { 
  Search, Trash2, Calendar, Utensils, 
  Droplet, Moon, Tv, Baby, Activity, Plus 
} from 'lucide-react';

interface ActivityLogViewProps {
  logs: ActivityLog[];
  onDeleteLog: (id: string) => void;
  onOpenQuickLog: () => void;
}

export function ActivityLogView({
  logs,
  onDeleteLog,
  onOpenQuickLog,
}: ActivityLogViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('all');

  // Unique dates in logs
  const dates = Array.from(new Set(logs.map((l) => l.date))).sort((a, b) => b.localeCompare(a));

  const filteredLogs = logs.filter((log) => {
    if (selectedCategory !== 'all' && log.category !== selectedCategory) return false;
    if (selectedDateFilter !== 'all' && log.date !== selectedDateFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = log.title.toLowerCase().includes(q);
      const matchNotes = log.notes?.toLowerCase().includes(q) || false;
      const matchSub = log.subType.toLowerCase().includes(q);
      if (!matchTitle && !matchNotes && !matchSub) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Search & Filter Header */}
      <div className="p-5 rounded-2xl bg-[#101729] border border-[#243452] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-genshin text-lg sm:text-xl font-bold text-white tracking-wide">
              Complete Activity Journal & History
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Browse, filter, and inspect all past feeds, sleep logs, screen time, and diapers
            </p>
          </div>

          <button
            onClick={onOpenQuickLog}
            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#edd382] to-[#dfbb5e] text-[#0d1424] text-xs font-bold flex items-center gap-1.5 hover:brightness-110 shadow-sm transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Log New Activity</span>
          </button>
        </div>

        {/* Filter controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search meals, puree, nap notes..."
              className="w-full pl-9 pr-3 py-2 bg-[#090e1a] border border-[#273859] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#4be3b5]"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-[#090e1a] border border-[#273859] rounded-lg text-xs text-white focus:outline-none focus:border-[#4be3b5]"
            >
              <option value="all">All Categories</option>
              <option value="eat">Eats & Meals</option>
              <option value="drink">Drinks & Formula</option>
              <option value="sleep">Sleep & Naps</option>
              <option value="screen">Screen & TV</option>
              <option value="diaper">Diapers</option>
              <option value="play">Play & Exercise</option>
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <select
              value={selectedDateFilter}
              onChange={(e) => setSelectedDateFilter(e.target.value)}
              className="w-full px-3 py-2 bg-[#090e1a] border border-[#273859] rounded-lg text-xs text-white focus:outline-none focus:border-[#4be3b5]"
            >
              <option value="all">All Dates ({dates.length} days recorded)</option>
              {dates.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Log Feed */}
      <div className="p-5 rounded-2xl bg-[#101729] border border-[#243452]">
        <div className="flex items-center justify-between pb-3 border-b border-[#1f2d47]">
          <span className="text-xs font-semibold text-slate-400">
            Showing <strong className="text-white font-mono-num">{filteredLogs.length}</strong> activity records
          </span>
        </div>

        <div className="mt-4 divide-y divide-[#18243b]">
          {filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No activities found matching your search and filter criteria.
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
                diaper: { text: 'Diaper Change', color: 'text-teal-400', icon: Baby },
                play: { text: 'Play Time', color: 'text-emerald-400', icon: Activity },
              }[log.category];

              const Icon = categoryBadge.icon;

              return (
                <div
                  key={log.id}
                  className="py-3.5 px-3 flex items-center justify-between gap-4 hover:bg-[#131d33]/50 rounded-xl transition-colors group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Date & Time */}
                    <div className="w-20 shrink-0">
                      <span className="font-mono-num text-xs font-semibold text-white block">
                        {timeFormatted}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono-num block">
                        {log.date}
                      </span>
                    </div>

                    {/* Icon */}
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
                      
                      {/* Quiet Metadata with Typographic Separators */}
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
                            <span className="italic text-slate-400 truncate max-w-sm">{log.notes}</span>
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
