import { useState } from 'react';
import { BabyProfile, ElementVision } from '../types';
import { soundManager } from '../utils/audio';
import { Sparkles, Edit3, Heart, Shield, Compass, X, Check } from 'lucide-react';

interface BabyProfileBarProps {
  profile: BabyProfile;
  onUpdateProfile: (updated: BabyProfile) => void;
  todayLoggedCount: number;
}

export function BabyProfileBar({
  profile,
  onUpdateProfile,
  todayLoggedCount,
}: BabyProfileBarProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editVision, setEditVision] = useState<ElementVision>(profile.vision);
  const [editSleepHours, setEditSleepHours] = useState(profile.dailyTargetSleepHours);
  const [editFluidsMl, setEditFluidsMl] = useState(profile.dailyTargetFluidsMl);
  const [editScreenMins, setEditScreenMins] = useState(profile.dailyMaxScreenMins);

  const elementColors: Record<ElementVision, { text: string; bg: string; border: string; glow: string }> = {
    Anemo: { text: '#4be3b5', bg: 'bg-emerald-950/40', border: 'border-emerald-500/40', glow: 'shadow-[0_0_12px_rgba(75,227,181,0.25)]' },
    Geo: { text: '#e6b343', bg: 'bg-amber-950/40', border: 'border-amber-500/40', glow: 'shadow-[0_0_12px_rgba(230,179,67,0.25)]' },
    Electro: { text: '#bf8cf8', bg: 'bg-purple-950/40', border: 'border-purple-500/40', glow: 'shadow-[0_0_12px_rgba(191,140,248,0.25)]' },
    Dendro: { text: '#9cdb43', bg: 'bg-lime-950/40', border: 'border-lime-500/40', glow: 'shadow-[0_0_12px_rgba(156,219,67,0.25)]' },
    Hydro: { text: '#3fb5f3', bg: 'bg-sky-950/40', border: 'border-sky-500/40', glow: 'shadow-[0_0_12px_rgba(63,181,243,0.25)]' },
    Pyro: { text: '#f36d4e', bg: 'bg-rose-950/40', border: 'border-rose-500/40', glow: 'shadow-[0_0_12px_rgba(243,109,78,0.25)]' },
    Cryo: { text: '#8be5f5', bg: 'bg-cyan-950/40', border: 'border-cyan-500/40', glow: 'shadow-[0_0_12px_rgba(139,229,245,0.25)]' },
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...profile,
      name: editName.trim() || 'Lumi',
      vision: editVision,
      dailyTargetSleepHours: Number(editSleepHours) || 12,
      dailyTargetFluidsMl: Number(editFluidsMl) || 800,
      dailyMaxScreenMins: Number(editScreenMins) || 45,
    });
    soundManager.playLogSuccessChime();
    setIsEditing(false);
  };

  const currentTheme = elementColors[profile.vision] || elementColors.Anemo;

  return (
    <div className="relative rounded-2xl overflow-hidden border border-[#2d3d5c] bg-[#101728] shadow-xl">
      {/* Background Banner with measured gradient scrim for legibility */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/teyvat_sky_banner_1790690914825.jpg"
          alt="Teyvat Realm Horizon"
          className="w-full h-full object-cover object-center opacity-30 mix-blend-screen filter saturate-150"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d1424] via-[#0d1424]/90 to-[#101728]/80" />
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* Left Side: Avatar & Character Stat Card */}
        <div className="flex items-center gap-4 sm:gap-5">
          {/* Avatar with Ornate Celestial Frame */}
          <div className="relative shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 bg-gradient-to-br from-[#edd382] via-[#947738] to-[#4be3b5] shadow-lg">
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-full h-full rounded-full object-cover bg-[#131d33]"
                referrerPolicy="no-referrer"
              />
            </div>
            {/* Element Emblem Tag */}
            <div
              className={`absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${currentTheme.bg} ${currentTheme.border} border text-white shadow-md flex items-center gap-1`}
              style={{ color: currentTheme.text }}
            >
              <Sparkles className="w-2.5 h-2.5" />
              <span>{profile.vision}</span>
            </div>
          </div>

          {/* Character Identity & Status */}
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-genshin text-xl sm:text-2xl font-bold text-white tracking-wide flex items-center gap-2">
                <span>{profile.name}</span>
                <span className="text-xs font-mono-num font-semibold px-2 py-0.5 rounded bg-[#1e2a44] text-[#ebd48a] border border-[#ebd48a]/30">
                  AR {profile.adventureRank}
                </span>
              </h1>
              <button
                onClick={() => {
                  setIsEditing(true);
                  soundManager.playClickSound();
                }}
                className="text-slate-400 hover:text-[#ebd48a] transition-colors p-1"
                title="Edit Little Traveler Profile"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 mt-1 flex flex-wrap items-center gap-2">
              <span className="text-[#ebd48a] font-medium">Little Traveler of Teyvat</span>
              <span className="text-slate-500">·</span>
              <span>14 Months Old</span>
              <span className="text-slate-500">·</span>
              <span className="text-[#4be3b5]">{todayLoggedCount} Activities Logged Today</span>
            </p>

            <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-[#ebd48a]" />
                <span>Sleep Target: <strong className="text-slate-200 font-mono-num">{profile.dailyTargetSleepHours}h</strong></span>
              </div>
              <span>·</span>
              <div className="flex items-center gap-1">
                <Heart className="w-3 h-3 text-rose-400" />
                <span>Hydration: <strong className="text-slate-200 font-mono-num">{profile.dailyTargetFluidsMl}ml</strong></span>
              </div>
              <span>·</span>
              <div className="flex items-center gap-1">
                <Compass className="w-3 h-3 text-amber-400" />
                <span>Screen Max: <strong className="text-slate-200 font-mono-num">{profile.dailyMaxScreenMins}m</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Adventure Rank Experience / Daily Routine Stash */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-[#0a0f1c]/70 border border-[#23314d] rounded-xl p-3.5 sm:px-5">
          <div className="text-left">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
              Daily Commissions Done
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-bold font-mono-num text-[#4be3b5]">
                {Math.min(todayLoggedCount, 4)} / 4
              </span>
              <span className="text-xs text-slate-400">Activities</span>
            </div>
          </div>

          <div className="h-8 w-px bg-[#23314d] hidden sm:block" />

          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
              Adventure Reward
            </span>
            <div className="flex items-center gap-1.5 mt-0.5 font-mono-num text-sm text-[#f5e2a3] font-bold">
              <Sparkles className="w-4 h-4 text-[#f5e2a3]" />
              <span>+60 Daily Primogems</span>
            </div>
          </div>
        </div>

      </div>

      {/* Edit Profile Modal Dialog */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-[#11192b] border border-[#ebd48a]/50 rounded-2xl shadow-2xl p-6 text-slate-100 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#243350]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#ebd48a]" />
                <h3 className="font-genshin text-lg font-bold text-[#f5e2a3]">
                  Traveler Character Settings
                </h3>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-300 font-semibold mb-1">
                  Baby's Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0a0f1c] border border-[#2b3c5e] rounded-lg text-sm text-white focus:outline-none focus:border-[#4be3b5]"
                  placeholder="e.g. Lumi, Klee, Leo..."
                  required
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-300 font-semibold mb-1">
                  Elemental Vision
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['Anemo', 'Geo', 'Electro', 'Dendro', 'Hydro', 'Pyro', 'Cryo'] as ElementVision[]).map((elem) => (
                    <button
                      key={elem}
                      type="button"
                      onClick={() => setEditVision(elem)}
                      className={`px-2 py-1.5 rounded-lg text-xs font-medium border text-center transition-all ${
                        editVision === elem
                          ? `${elementColors[elem].bg} ${elementColors[elem].border} text-white font-bold`
                          : 'bg-[#0a0f1c] border-[#22314e] text-slate-400 hover:text-slate-200'
                      }`}
                      style={editVision === elem ? { color: elementColors[elem].text } : {}}
                    >
                      {elem}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-300 font-medium mb-1">
                    Sleep Goal (hrs)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={editSleepHours}
                    onChange={(e) => setEditSleepHours(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 bg-[#0a0f1c] border border-[#2b3c5e] rounded-lg text-xs text-white font-mono-num"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-300 font-medium mb-1">
                    Fluids Target (ml)
                  </label>
                  <input
                    type="number"
                    step="50"
                    value={editFluidsMl}
                    onChange={(e) => setEditFluidsMl(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-2.5 py-1.5 bg-[#0a0f1c] border border-[#2b3c5e] rounded-lg text-xs text-white font-mono-num"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-300 font-medium mb-1">
                    Screen Limit (min)
                  </label>
                  <input
                    type="number"
                    step="5"
                    value={editScreenMins}
                    onChange={(e) => setEditScreenMins(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-2.5 py-1.5 bg-[#0a0f1c] border border-[#2b3c5e] rounded-lg text-xs text-white font-mono-num"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#243350]">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-[#0d1424] bg-gradient-to-r from-[#edd382] to-[#dfbb5e] rounded-lg hover:brightness-110 flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
