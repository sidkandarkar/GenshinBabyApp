export type ElementVision = 'Anemo' | 'Geo' | 'Electro' | 'Dendro' | 'Hydro' | 'Pyro' | 'Cryo';

export type ActivityCategory = 'eat' | 'drink' | 'sleep' | 'screen' | 'diaper' | 'play';

export interface BabyProfile {
  name: string;
  birthDate: string; // YYYY-MM-DD
  avatar: string;
  vision: ElementVision;
  adventureRank: number; // e.g. 14 for 14 months
  primogems: number;
  dailyTargetSleepHours: number;
  dailyTargetFluidsMl: number;
  dailyMaxScreenMins: number;
  dailyFeedingsTarget: number;
}

export type BabyMood = 'cheerful' | 'calm' | 'fussy' | 'sleepy';

export interface ActivityLog {
  id: string;
  timestamp: string; // ISO 8601
  date: string; // YYYY-MM-DD
  category: ActivityCategory;
  subType: string; // e.g. 'formula', 'puree', 'nap', 'night_sleep', 'tv', 'wet'
  title: string;
  amount?: number; // ml, oz, grams
  unit?: string; // 'ml', 'oz', 'g'
  durationMinutes?: number; // for sleep, screen, play
  notes?: string;
  mood?: BabyMood;
}

export interface ScheduleItem {
  id: string;
  time: string; // 24-hr "HH:MM" e.g. "08:30"
  label: string;
  category: ActivityCategory;
  subType?: string;
  targetAmount?: number;
  targetDurationMins?: number;
  reminderEnabled: boolean;
  notes?: string;
  completedDates: string[]; // YYYY-MM-DD on which it was marked done
}

export interface DailyCommission {
  id: string;
  title: string;
  description: string;
  category: ActivityCategory;
  currentValue: number;
  targetValue: number;
  unit: string;
  rewardPrimogems: number;
  claimed: boolean;
}

export interface ReminderNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  timeStr: string;
  category: ActivityCategory;
}

export type ActiveTab = 'dashboard' | 'logs' | 'analytics' | 'reports' | 'routine';
