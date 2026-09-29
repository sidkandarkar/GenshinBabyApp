import { useState } from 'react';
import { ScheduleItem, ActivityCategory } from '../types';
import { soundManager } from '../utils/audio';
import { 
  Bell, BellOff, CheckCircle2, Circle, Plus, 
  Trash2, Volume2, ShieldCheck, Sparkles, X, 
  Utensils, Droplet, Moon, Tv, Baby, Activity
} from 'lucide-react';

interface ScheduleViewProps {
  schedule: ScheduleItem[];
  onToggleScheduleCheck: (id: string) => void;
  onToggleReminder: (id: string) => void;
  onAddScheduleItem: (item: Omit<ScheduleItem, 'id' | 'completedDates'>) => void;
  onDeleteScheduleItem: (id: string) => void;
  onTriggerTestReminder: () => void;
  notificationPermission: NotificationPermission | 'unsupported';
  onRequestNotificationPermission: () => void;
}

export function ScheduleView({
  schedule,
  onToggleScheduleCheck,
  onToggleReminder,
  onAddScheduleItem,
  onDeleteScheduleItem,
  onTriggerTestReminder,
  notificationPermission,
  onRequestNotificationPermission,
}: ScheduleViewProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [time, setTime] = useState('11:00');
  const [label, setLabel] = useState('');
  const [category, setCategory] = useState<ActivityCategory>('eat');
  const [targetAmount, setTargetAmount] = useState<number | ''>('');
  const [targetDurationMins, setTargetDurationMins] = useState<number | ''>('');
  const [reminderEnabled, setReminderEnabled] = useState(true);

  const todayStr = new Date().toISOString().split('T')[0];

  // Sort schedule by time
  const sortedSchedule = [...schedule].sort((a, b) => a.time.localeCompare(b.time));

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;

    onAddScheduleItem({
      time,
      label: label.trim(),
      category,
      targetAmount: targetAmount !== '' ? Number(targetAmount) : undefined,
      targetDurationMins: targetDurationMins !== '' ? Number(targetDurationMins) : undefined,
      reminderEnabled,
    });

    soundManager.playLogSuccessChime();
    setIsAdding(false);
    setLabel('');
    setTargetAmount('');
    setTargetDurationMins('');
  };

  const getCategoryIcon = (cat: ActivityCategory) => {
    switch (cat) {
      case 'eat': return Utensils;
      case 'drink': return Droplet;
      case 'sleep': return Moon;
      case 'screen': return Tv;
      case 'diaper': return Baby;
      case 'play': return Activity;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Reminders & Notification Setup */}
      <div className="p-5 rounded-2xl bg-[#101729] border border-[#243452] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#ebd48a]" />
            <h2 className="font-genshin text-lg sm:text-xl font-bold text-white tracking-wide">
              Daily Schedule & Interactive Reminders
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Keep track of baby's feeding, sleep, and playtime milestones with scheduled chimes
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Test reminder audio & toast button */}
          <button
            onClick={onTriggerTestReminder}
            className="px-3.5 py-1.5 rounded-lg bg-[#162238] border border-[#273a5e] text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Preview reminder chime sound & notification toast"
          >
            <Volume2 className="w-3.5 h-3.5 text-[#ebd48a]" />
            <span>Test Reminder Chime</span>
          </button>

          {/* Browser Notification Permission Button */}
          {notificationPermission !== 'granted' && (
            <button
              onClick={onRequestNotificationPermission}
              className="px-3.5 py-1.5 rounded-lg bg-[#1b2b48] border border-[#4be3b5]/40 text-[#4be3b5] hover:bg-[#23385e] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Enable Browser Alerts</span>
            </button>
          )}

          {/* Add routine button */}
          <button
            onClick={() => {
              setIsAdding(true);
              soundManager.playClickSound();
            }}
            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#edd382] to-[#dfbb5e] text-[#0d1424] text-xs font-bold flex items-center gap-1.5 hover:brightness-110 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Routine</span>
          </button>
        </div>
      </div>

      {/* Routine Schedule Timeline */}
      <div className="p-5 rounded-2xl bg-[#101729] border border-[#243452]">
        <div className="flex items-center justify-between pb-3 border-b border-[#1f2d47]">
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Daily Master Routine ({sortedSchedule.length} Events)
          </span>
          <span className="text-xs text-slate-400">
            {sortedSchedule.filter(s => s.completedDates.includes(todayStr)).length} of {sortedSchedule.length} completed today
          </span>
        </div>

        <div className="mt-4 divide-y divide-[#18243b]">
          {sortedSchedule.map((item) => {
            const isCompletedToday = item.completedDates.includes(todayStr);
            const Icon = getCategoryIcon(item.category);

            const categoryColor = {
              eat: 'text-amber-400 border-amber-500/30 bg-amber-950/20',
              drink: 'text-sky-400 border-sky-500/30 bg-sky-950/20',
              sleep: 'text-indigo-400 border-indigo-500/30 bg-indigo-950/20',
              screen: 'text-rose-400 border-rose-500/30 bg-rose-950/20',
              diaper: 'text-teal-400 border-teal-500/30 bg-teal-950/20',
              play: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20',
            }[item.category];

            return (
              <div
                key={item.id}
                className={`py-3.5 px-3 flex items-center justify-between gap-4 transition-colors rounded-xl ${
                  isCompletedToday ? 'bg-[#0f1728]/50 opacity-80' : 'hover:bg-[#131d33]/50'
                }`}
              >
                {/* Left: Checkmark & Time & Title */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <button
                    onClick={() => {
                      onToggleScheduleCheck(item.id);
                      soundManager.playLogSuccessChime();
                    }}
                    className="text-slate-500 hover:text-[#4be3b5] transition-colors cursor-pointer shrink-0"
                    title={isCompletedToday ? 'Mark as incomplete' : 'Mark as completed for today'}
                  >
                    {isCompletedToday ? (
                      <CheckCircle2 className="w-5 h-5 text-[#4be3b5]" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-500" />
                    )}
                  </button>

                  <span className="font-mono-num font-bold text-sm sm:text-base text-white w-14 shrink-0">
                    {item.time}
                  </span>

                  <div className={`p-2 rounded-lg border ${categoryColor} shrink-0 hidden sm:block`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="min-w-0">
                    <span className={`text-sm font-semibold block truncate ${
                      isCompletedToday ? 'line-through text-slate-400' : 'text-slate-100'
                    }`}>
                      {item.label}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span className="capitalize">{item.category}</span>
                      {item.targetAmount && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono-num">{item.targetAmount} ml/g target</span>
                        </>
                      )}
                      {item.targetDurationMins && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono-num">{item.targetDurationMins} mins</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Reminder Toggle & Delete */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      onToggleReminder(item.id);
                      soundManager.playClickSound();
                    }}
                    className={`p-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer flex items-center gap-1.5 ${
                      item.reminderEnabled
                        ? 'bg-[#192b48] border-[#4be3b5]/40 text-[#4be3b5]'
                        : 'bg-[#0a0f1d] border-[#1e2a44] text-slate-500 hover:text-slate-300'
                    }`}
                    title={item.reminderEnabled ? 'Reminder chime enabled' : 'Reminder disabled'}
                  >
                    {item.reminderEnabled ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
                    <span className="hidden md:inline">{item.reminderEnabled ? 'Alert Active' : 'Off'}</span>
                  </button>

                  {/* Allow deleting custom routines */}
                  {schedule.length > 4 && (
                    <button
                      onClick={() => {
                        onDeleteScheduleItem(item.id);
                        soundManager.playClickSound();
                      }}
                      className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 rounded-lg transition-colors cursor-pointer"
                      title="Remove routine item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add New Routine Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-[#101729] border border-[#d4af37]/50 rounded-2xl shadow-2xl p-6 text-slate-100 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-[#233350]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#ebd48a]" />
                <h3 className="font-genshin text-lg font-bold text-[#f5e2a3]">
                  Add Routine Schedule Item
                </h3>
              </div>
              <button
                onClick={() => setIsAdding(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Scheduled Time
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-[#090e1a] border border-[#273859] rounded-lg text-xs text-white font-mono-num focus:outline-none focus:border-[#4be3b5]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ActivityCategory)}
                    className="w-full px-3 py-2 bg-[#090e1a] border border-[#273859] rounded-lg text-xs text-white focus:outline-none focus:border-[#4be3b5]"
                  >
                    <option value="eat">Eat (Meals/Puree)</option>
                    <option value="drink">Drink (Milk/Water)</option>
                    <option value="sleep">Sleep (Nap/Bedtime)</option>
                    <option value="screen">Screen / TV Time</option>
                    <option value="play">Play & Exercise</option>
                    <option value="diaper">Diaper Care</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Routine Title
                </label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. Afternoon Puree & Water"
                  required
                  className="w-full px-3 py-2 bg-[#090e1a] border border-[#273859] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#4be3b5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Target Amount (ml/g)
                  </label>
                  <input
                    type="number"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 150"
                    className="w-full px-3 py-2 bg-[#090e1a] border border-[#273859] rounded-lg text-xs text-white font-mono-num focus:outline-none focus:border-[#4be3b5]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Target Duration (mins)
                  </label>
                  <input
                    type="number"
                    value={targetDurationMins}
                    onChange={(e) => setTargetDurationMins(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 60"
                    className="w-full px-3 py-2 bg-[#090e1a] border border-[#273859] rounded-lg text-xs text-white font-mono-num focus:outline-none focus:border-[#4be3b5]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="enableReminderCheck"
                  checked={reminderEnabled}
                  onChange={(e) => setReminderEnabled(e.target.checked)}
                  className="rounded border-[#273859] text-[#4be3b5] focus:ring-0"
                />
                <label htmlFor="enableReminderCheck" className="text-xs text-slate-300 cursor-pointer">
                  Enable chime reminder when this time arrives
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#233350]">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-[#0d1424] bg-gradient-to-r from-[#edd382] to-[#dfbb5e] rounded-lg hover:brightness-110 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Event</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
