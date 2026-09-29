import { BabyProfile, ActivityLog, ScheduleItem } from '../types';

export const DEFAULT_BABY: BabyProfile = {
  name: 'Lumi',
  birthDate: '2025-07-29',
  avatar: '/src/assets/images/companion_mascot_avatar_1790690928325.jpg',
  vision: 'Anemo',
  adventureRank: 14,
  primogems: 480,
  dailyTargetSleepHours: 12.5,
  dailyTargetFluidsMl: 800,
  dailyMaxScreenMins: 45,
  dailyFeedingsTarget: 4,
};

export const DEFAULT_SCHEDULE: ScheduleItem[] = [
  {
    id: 'sch-1',
    time: '07:00',
    label: 'Morning Warm Milk',
    category: 'drink',
    subType: 'formula',
    targetAmount: 200,
    reminderEnabled: true,
    completedDates: [],
  },
  {
    id: 'sch-2',
    time: '08:30',
    label: 'Warm Oatmeal & Fruit Puree',
    category: 'eat',
    subType: 'solid',
    targetAmount: 140,
    reminderEnabled: true,
    completedDates: [],
  },
  {
    id: 'sch-3',
    time: '10:30',
    label: 'Morning Dream Nap',
    category: 'sleep',
    subType: 'nap',
    targetDurationMins: 80,
    reminderEnabled: true,
    completedDates: [],
  },
  {
    id: 'sch-4',
    time: '12:30',
    label: 'Lunch & Fresh Water',
    category: 'eat',
    subType: 'solid',
    targetAmount: 160,
    reminderEnabled: true,
    completedDates: [],
  },
  {
    id: 'sch-5',
    time: '15:00',
    label: 'Afternoon Slumber Nap',
    category: 'sleep',
    subType: 'nap',
    targetDurationMins: 75,
    reminderEnabled: true,
    completedDates: [],
  },
  {
    id: 'sch-6',
    time: '17:15',
    label: 'Nursery Rhymes & Little TV',
    category: 'screen',
    subType: 'tv',
    targetDurationMins: 30,
    reminderEnabled: true,
    completedDates: [],
  },
  {
    id: 'sch-7',
    time: '18:30',
    label: 'Nutritious Evening Dinner',
    category: 'eat',
    subType: 'solid',
    targetAmount: 150,
    reminderEnabled: true,
    completedDates: [],
  },
  {
    id: 'sch-8',
    time: '19:45',
    label: 'Night Slumber (Windtrace Bedtime)',
    category: 'sleep',
    subType: 'night_sleep',
    targetDurationMins: 600,
    reminderEnabled: true,
    completedDates: [],
  },
];

// Helper to format Date to YYYY-MM-DD
export function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Generate realistic historical seed data for the last 14 days
export function generateSeedActivities(): ActivityLog[] {
  const now = new Date();
  const logs: ActivityLog[] = [];

  for (let offset = 0; offset <= 13; offset++) {
    const targetDate = new Date(now.getTime() - offset * 24 * 60 * 60 * 1000);
    const dateStr = formatDate(targetDate);

    // Night sleep from previous evening
    logs.push({
      id: `seed-night-${offset}`,
      date: dateStr,
      timestamp: `${dateStr}T06:45:00.000Z`,
      category: 'sleep',
      subType: 'night_sleep',
      title: 'Night Sleep',
      durationMinutes: 580 + (offset % 3) * 20 - (offset % 2) * 15, // ~9.5 to 10.3 hrs
      notes: offset % 4 === 0 ? 'Slept peacefully through the night' : 'Woke once for pacifier around 3 AM',
      mood: 'cheerful',
    });

    // Morning Formula
    logs.push({
      id: `seed-drink-1-${offset}`,
      date: dateStr,
      timestamp: `${dateStr}T07:15:00.000Z`,
      category: 'drink',
      subType: 'formula',
      title: 'Morning Formula Milk',
      amount: 210,
      unit: 'ml',
      notes: 'Drank the entire bottle with gusto',
      mood: 'cheerful',
    });

    // Morning Diaper
    logs.push({
      id: `seed-diaper-1-${offset}`,
      date: dateStr,
      timestamp: `${dateStr}T07:45:00.000Z`,
      category: 'diaper',
      subType: 'wet',
      title: 'Morning Diaper Change',
      notes: 'Wet diaper, fresh skin',
    });

    // Breakfast
    logs.push({
      id: `seed-eat-1-${offset}`,
      date: dateStr,
      timestamp: `${dateStr}T08:35:00.000Z`,
      category: 'eat',
      subType: 'solid',
      title: offset % 2 === 0 ? 'Banana Oatmeal with Chia' : 'Avocado & Sweet Potato Puree',
      amount: 130 + (offset % 4) * 10,
      unit: 'g',
      mood: 'calm',
    });

    // Morning Nap
    logs.push({
      id: `seed-nap-1-${offset}`,
      date: dateStr,
      timestamp: `${dateStr}T10:30:00.000Z`,
      category: 'sleep',
      subType: 'nap',
      title: 'Morning Nap',
      durationMinutes: 75 + (offset % 4) * 10,
      notes: 'Fell asleep to soft lullaby',
      mood: 'calm',
    });

    // Lunch & Hydration
    logs.push({
      id: `seed-eat-2-${offset}`,
      date: dateStr,
      timestamp: `${dateStr}T12:40:00.000Z`,
      category: 'eat',
      subType: 'solid',
      title: offset % 3 === 0 ? 'Steamed Salmon & Carrot Mash' : 'Chicken & Butternut Squash',
      amount: 150,
      unit: 'g',
      mood: 'cheerful',
    });

    logs.push({
      id: `seed-drink-2-${offset}`,
      date: dateStr,
      timestamp: `${dateStr}T13:00:00.000Z`,
      category: 'drink',
      subType: 'water',
      title: 'Filtered Water from Sippy Cup',
      amount: 90 + (offset % 3) * 15,
      unit: 'ml',
      mood: 'cheerful',
    });

    // Play & Tummy/Floor time
    logs.push({
      id: `seed-play-1-${offset}`,
      date: dateStr,
      timestamp: `${dateStr}T14:00:00.000Z`,
      category: 'play',
      subType: 'tummy_time',
      title: 'Block Stacking & Crawling Explorations',
      durationMinutes: 40,
      mood: 'cheerful',
      notes: 'Active crawling and explored living room cushions',
    });

    // Afternoon Nap
    logs.push({
      id: `seed-nap-2-${offset}`,
      date: dateStr,
      timestamp: `${dateStr}T15:15:00.000Z`,
      category: 'sleep',
      subType: 'nap',
      title: 'Afternoon Power Nap',
      durationMinutes: 65 + (offset % 3) * 15,
      mood: 'sleepy',
    });

    // Afternoon Milk / Snack
    logs.push({
      id: `seed-drink-3-${offset}`,
      date: dateStr,
      timestamp: `${dateStr}T16:45:00.000Z`,
      category: 'drink',
      subType: 'milk',
      title: 'Whole Milk & Teething Biscuit',
      amount: 180,
      unit: 'ml',
      mood: 'cheerful',
    });

    // TV / Screen Time
    const screenMins = offset % 5 === 0 ? 40 : 25 + (offset % 3) * 5;
    logs.push({
      id: `seed-screen-1-${offset}`,
      date: dateStr,
      timestamp: `${dateStr}T17:20:00.000Z`,
      category: 'screen',
      subType: 'tv',
      title: 'Educational Song Cartoons (Cocomelon / Bluey)',
      durationMinutes: screenMins,
      notes: 'Enjoyed dancing to the nursery animal songs',
      mood: 'cheerful',
    });

    // Evening Diaper
    logs.push({
      id: `seed-diaper-2-${offset}`,
      date: dateStr,
      timestamp: `${dateStr}T18:00:00.000Z`,
      category: 'diaper',
      subType: 'both',
      title: 'Evening Diaper Change',
    });

    // Dinner
    logs.push({
      id: `seed-eat-3-${offset}`,
      date: dateStr,
      timestamp: `${dateStr}T18:45:00.000Z`,
      category: 'eat',
      subType: 'solid',
      title: 'Mild Lentil Dal with Soft Rice & Spinach',
      amount: 160,
      unit: 'g',
      mood: 'cheerful',
    });

    // Bedtime Milk
    logs.push({
      id: `seed-drink-4-${offset}`,
      date: dateStr,
      timestamp: `${dateStr}T19:30:00.000Z`,
      category: 'drink',
      subType: 'formula',
      title: 'Bedtime Warm Milk',
      amount: 220,
      unit: 'ml',
      notes: 'Drank drowsily before bedtime story',
      mood: 'sleepy',
    });
  }

  return logs;
}
