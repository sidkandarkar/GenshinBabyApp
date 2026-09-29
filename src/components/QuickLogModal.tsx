import { useState } from 'react';
import { ActivityCategory, ActivityLog, BabyMood } from '../types';
import { soundManager } from '../utils/audio';
import { X, Sparkles, Utensils, Droplets, Moon, Tv, Baby, Activity } from 'lucide-react';

interface QuickLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveLog: (log: Omit<ActivityLog, 'id'>) => void;
}

export function QuickLogModal({ isOpen, onClose, onSaveLog }: QuickLogModalProps) {
  const [mode, setMode] = useState<'quick' | 'custom'>('quick');
  const [category, setCategory] = useState<ActivityCategory>('eat');
  const [subType, setSubType] = useState('solid');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [unit, setUnit] = useState<string>('g');
  const [durationMinutes, setDurationMinutes] = useState<number | ''>('');
  const [mood, setMood] = useState<BabyMood>('cheerful');
  const [notes, setNotes] = useState('');
  const [activityTime, setActivityTime] = useState(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });

  if (!isOpen) return null;

  // Preset 1-click items
  const presets = [
    {
      title: 'Formula Milk Bottle',
      category: 'drink' as ActivityCategory,
      subType: 'formula',
      amount: 180,
      unit: 'ml',
      icon: Droplets,
      color: 'text-sky-400',
      bg: 'hover:border-sky-400/50 bg-sky-950/20',
      mood: 'cheerful' as BabyMood,
    },
    {
      title: 'Water Sippy Cup',
      category: 'drink' as ActivityCategory,
      subType: 'water',
      amount: 90,
      unit: 'ml',
      icon: Droplets,
      color: 'text-cyan-300',
      bg: 'hover:border-cyan-400/50 bg-cyan-950/20',
      mood: 'calm' as BabyMood,
    },
    {
      title: 'Nutritious Baby Puree / Mash',
      category: 'eat' as ActivityCategory,
      subType: 'puree',
      amount: 130,
      unit: 'g',
      icon: Utensils,
      color: 'text-amber-400',
      bg: 'hover:border-amber-400/50 bg-amber-950/20',
      mood: 'cheerful' as BabyMood,
    },
    {
      title: 'Solid Meal (Finger Food/Lunch)',
      category: 'eat' as ActivityCategory,
      subType: 'solid',
      amount: 150,
      unit: 'g',
      icon: Utensils,
      color: 'text-orange-400',
      bg: 'hover:border-orange-400/50 bg-orange-950/20',
      mood: 'cheerful' as BabyMood,
    },
    {
      title: 'Gentle Day Nap (45m)',
      category: 'sleep' as ActivityCategory,
      subType: 'nap',
      durationMinutes: 45,
      icon: Moon,
      color: 'text-indigo-400',
      bg: 'hover:border-indigo-400/50 bg-indigo-950/20',
      mood: 'sleepy' as BabyMood,
    },
    {
      title: 'Full Rest Nap (1.5h)',
      category: 'sleep' as ActivityCategory,
      subType: 'nap',
      durationMinutes: 90,
      icon: Moon,
      color: 'text-purple-400',
      bg: 'hover:border-purple-400/50 bg-purple-950/20',
      mood: 'sleepy' as BabyMood,
    },
    {
      title: 'Kids TV / Nursery Rhymes (25m)',
      category: 'screen' as ActivityCategory,
      subType: 'tv',
      durationMinutes: 25,
      icon: Tv,
      color: 'text-rose-400',
      bg: 'hover:border-rose-400/50 bg-rose-950/20',
      mood: 'cheerful' as BabyMood,
    },
    {
      title: 'Clean Diaper Change (Wet)',
      category: 'diaper' as ActivityCategory,
      subType: 'wet',
      icon: Baby,
      color: 'text-teal-400',
      bg: 'hover:border-teal-400/50 bg-teal-950/20',
      mood: 'calm' as BabyMood,
    },
  ];

  const handleApplyPreset = (preset: typeof presets[0]) => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    onSaveLog({
      date: dateStr,
      timestamp: `${dateStr}T${timeStr}:00.000Z`,
      category: preset.category,
      subType: preset.subType,
      title: preset.title,
      amount: preset.amount,
      unit: preset.unit,
      durationMinutes: preset.durationMinutes,
      mood: preset.mood,
      notes: 'Quick recorded from Adventurer presets',
    });

    soundManager.playLogSuccessChime();
    onClose();
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const logTimestamp = `${dateStr}T${activityTime}:00.000Z`;

    const defaultTitle = `${category.toUpperCase()}: ${subType}`;

    onSaveLog({
      date: dateStr,
      timestamp: logTimestamp,
      category,
      subType,
      title: title.trim() || defaultTitle,
      amount: amount !== '' ? Number(amount) : undefined,
      unit: (category === 'eat' || category === 'drink') ? unit : undefined,
      durationMinutes: durationMinutes !== '' ? Number(durationMinutes) : undefined,
      mood,
      notes: notes.trim() || undefined,
    });

    soundManager.playLogSuccessChime();
    onClose();
  };

  const handleCategorySelect = (cat: ActivityCategory) => {
    setCategory(cat);
    if (cat === 'eat') {
      setSubType('solid');
      setUnit('g');
    } else if (cat === 'drink') {
      setSubType('formula');
      setUnit('ml');
    } else if (cat === 'sleep') {
      setSubType('nap');
      setDurationMinutes(60);
    } else if (cat === 'screen') {
      setSubType('tv');
      setDurationMinutes(20);
    } else if (cat === 'diaper') {
      setSubType('wet');
    } else if (cat === 'play') {
      setSubType('tummy_time');
      setDurationMinutes(30);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#101729] border border-[#d4af37]/40 rounded-2xl shadow-2xl text-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#233350] bg-[#0c1324] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#f5e2a3]" />
            <h2 className="font-genshin text-lg font-bold text-[#f5e2a3] tracking-wide">
              Record Baby Activity
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch between 1-Click Presets and Custom Entry */}
        <div className="px-5 pt-4 flex gap-2 border-b border-[#1f2b42] pb-3 shrink-0">
          <button
            type="button"
            onClick={() => setMode('quick')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              mode === 'quick'
                ? 'bg-[#1b2b48] text-[#4be3b5] border border-[#4be3b5]/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ⚡ 1-Tap Presets
          </button>
          <button
            type="button"
            onClick={() => setMode('custom')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              mode === 'custom'
                ? 'bg-[#1b2b48] text-[#4be3b5] border border-[#4be3b5]/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ✍️ Custom Detailed Entry
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1">
          {mode === 'quick' ? (
            <div>
              <p className="text-xs text-slate-400 mb-3">
                Tap any common activity below for instant logging:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {presets.map((preset, idx) => {
                  const Icon = preset.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleApplyPreset(preset)}
                      className={`text-left p-3 rounded-xl border border-[#263756] ${preset.bg} transition-all duration-150 flex items-center gap-3 cursor-pointer group active:scale-[0.98]`}
                    >
                      <div className={`p-2.5 rounded-lg bg-[#0e172a] border border-[#2c3e60] ${preset.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-semibold text-xs sm:text-sm text-slate-200 group-hover:text-white block truncate">
                          {preset.title}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono-num">
                          {preset.amount ? `${preset.amount}${preset.unit}` : ''}
                          {preset.durationMinutes ? `${preset.durationMinutes} mins` : ''}
                          {!preset.amount && !preset.durationMinutes ? 'Quick Log' : ''}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <form onSubmit={handleCustomSubmit} className="space-y-4">
              {/* Category buttons */}
              <div>
                <label className="block text-xs uppercase font-semibold text-slate-400 mb-1.5">
                  Activity Category
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {[
                    { id: 'eat', label: 'Eats', icon: Utensils },
                    { id: 'drink', label: 'Drinks', icon: Droplets },
                    { id: 'sleep', label: 'Sleep', icon: Moon },
                    { id: 'screen', label: 'TV / Media', icon: Tv },
                    { id: 'diaper', label: 'Diaper', icon: Baby },
                    { id: 'play', label: 'Play', icon: Activity },
                  ].map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleCategorySelect(cat.id as ActivityCategory)}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-[#192b49] border-[#4be3b5] text-[#4be3b5] shadow-[0_0_8px_rgba(75,227,181,0.3)]'
                            : 'bg-[#0d1424] border-[#22314e] text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Icon className="w-4 h-4 mb-1" />
                        <span className="truncate">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title & Subtype */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Activity Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={
                      category === 'eat'
                        ? 'e.g. Avocado & Sweet Potato Mash'
                        : category === 'drink'
                        ? 'e.g. Warm Formula Milk'
                        : category === 'sleep'
                        ? 'e.g. Afternoon Nap'
                        : category === 'screen'
                        ? 'e.g. Nursery Rhymes on TV'
                        : 'Activity title'
                    }
                    className="w-full px-3 py-2 bg-[#090e1a] border border-[#273859] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#4be3b5]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Type / Variety
                  </label>
                  <select
                    value={subType}
                    onChange={(e) => setSubType(e.target.value)}
                    className="w-full px-3 py-2 bg-[#090e1a] border border-[#273859] rounded-lg text-xs text-white focus:outline-none focus:border-[#4be3b5]"
                  >
                    {category === 'eat' && (
                      <>
                        <option value="solid">Solid Food (Meal)</option>
                        <option value="puree">Puree / Mash</option>
                        <option value="cereal">Oatmeal / Cereal</option>
                        <option value="snack">Puffs / Teething Snack</option>
                      </>
                    )}
                    {category === 'drink' && (
                      <>
                        <option value="formula">Formula Milk</option>
                        <option value="breastmilk">Breastmilk</option>
                        <option value="milk">Whole Cow Milk</option>
                        <option value="water">Fresh Water</option>
                        <option value="juice">Diluted Juice</option>
                      </>
                    )}
                    {category === 'sleep' && (
                      <>
                        <option value="nap">Day Nap</option>
                        <option value="night_sleep">Night Sleep</option>
                      </>
                    )}
                    {category === 'screen' && (
                      <>
                        <option value="tv">Living Room TV</option>
                        <option value="tablet">Kids Tablet / Phone</option>
                        <option value="rhymes">Musical Rhymes</option>
                      </>
                    )}
                    {category === 'diaper' && (
                      <>
                        <option value="wet">Wet Diaper</option>
                        <option value="dirty">Poop / Dirty Diaper</option>
                        <option value="both">Both (Wet & Dirty)</option>
                      </>
                    )}
                    {category === 'play' && (
                      <>
                        <option value="tummy_time">Tummy Time</option>
                        <option value="outdoor">Stroller & Outdoor Walk</option>
                        <option value="sensory">Blocks & Sensory Toys</option>
                        <option value="bath">Warm Bath Time</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Dynamic metric fields based on category */}
              {(category === 'eat' || category === 'drink') && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Amount Consumed
                    </label>
                    <input
                      type="number"
                      step="5"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="e.g. 180"
                      className="w-full px-3 py-2 bg-[#090e1a] border border-[#273859] rounded-lg text-xs text-white font-mono-num focus:outline-none focus:border-[#4be3b5]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Measurement Unit
                    </label>
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full px-3 py-2 bg-[#090e1a] border border-[#273859] rounded-lg text-xs text-white focus:outline-none focus:border-[#4be3b5]"
                    >
                      <option value="ml">ml (Milliliters)</option>
                      <option value="oz">oz (Fluid Ounces)</option>
                      <option value="g">g (Grams)</option>
                    </select>
                  </div>
                </div>
              )}

              {(category === 'sleep' || category === 'screen' || category === 'play') && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Duration (Minutes)
                    </label>
                    <input
                      type="number"
                      step="5"
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="e.g. 45"
                      className="w-full px-3 py-2 bg-[#090e1a] border border-[#273859] rounded-lg text-xs text-white font-mono-num focus:outline-none focus:border-[#4be3b5]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Time of Event
                    </label>
                    <input
                      type="time"
                      value={activityTime}
                      onChange={(e) => setActivityTime(e.target.value)}
                      className="w-full px-3 py-2 bg-[#090e1a] border border-[#273859] rounded-lg text-xs text-white font-mono-num focus:outline-none focus:border-[#4be3b5]"
                    />
                  </div>
                </div>
              )}

              {/* Mood and Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Baby's Mood
                  </label>
                  <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
                    {(['cheerful', 'calm', 'fussy', 'sleepy'] as BabyMood[]).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMood(m)}
                        className={`py-1.5 px-1 rounded-md border text-[11px] capitalize transition-all ${
                          mood === m
                            ? 'bg-[#192b49] border-[#d4af37] text-[#f5e2a3] font-semibold'
                            : 'bg-[#090e1a] border-[#22314e] text-slate-400'
                        }`}
                      >
                        {m === 'cheerful' ? '😊' : m === 'calm' ? '😌' : m === 'fussy' ? '🥺' : '😴'} {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Care Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. loved the mashed carrots, burped nicely"
                    className="w-full px-3 py-2 bg-[#090e1a] border border-[#273859] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#4be3b5]"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex justify-end gap-2 border-t border-[#233350]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-[#0d1424] bg-gradient-to-r from-[#edd382] via-[#f7e4a1] to-[#dfbb5e] rounded-lg hover:brightness-110 active:scale-95 transition-all shadow-[0_0_12px_rgba(237,211,130,0.3)] flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Save Activity</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
