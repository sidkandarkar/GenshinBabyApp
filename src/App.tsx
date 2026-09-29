import { useState, useEffect, useMemo } from 'react';
import { 
  BabyProfile, 
  ActivityLog, 
  ScheduleItem, 
  ActiveTab, 
  ReminderNotification 
} from './types';
import { 
  DEFAULT_BABY, 
  DEFAULT_SCHEDULE, 
  generateSeedActivities, 
  formatDate 
} from './data/seedData';
import { soundManager } from './utils/audio';
import { Header } from './components/Header';
import { BabyProfileBar } from './components/BabyProfileBar';
import { DashboardView } from './components/DashboardView';
import { HistoryChartsView } from './components/HistoryChartsView';
import { ReportsView } from './components/ReportsView';
import { ScheduleView } from './components/ScheduleView';
import { ActivityLogView } from './components/ActivityLogView';
import { QuickLogModal } from './components/QuickLogModal';
import { NotificationModal, FloatingReminderToast } from './components/NotificationModal';

export default function App() {
  // Baby Profile State
  const [profile, setProfile] = useState<BabyProfile>(() => {
    const saved = localStorage.getItem('teyvat_baby_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return DEFAULT_BABY;
  });

  // Activity Logs State (persisted in localStorage)
  const [logs, setLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('teyvat_baby_logs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch {
        // fallback
      }
    }
    return generateSeedActivities();
  });

  // Daily Schedule State
  const [schedule, setSchedule] = useState<ScheduleItem[]>(() => {
    const saved = localStorage.getItem('teyvat_baby_schedule');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch {
        // fallback
      }
    }
    return DEFAULT_SCHEDULE;
  });

  // Navigation tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Modals & Floating Toast
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<ReminderNotification[]>([]);
  const [activeToast, setActiveToast] = useState<ReminderNotification | null>(null);

  // Daily Commissions claimed tracker
  const todayStr = formatDate(new Date());
  const [claimedCommissionsDate, setClaimedCommissionsDate] = useState<string>(() => {
    return localStorage.getItem('teyvat_claimed_commissions_date') || '';
  });
  const dailyCommissionsClaimed = claimedCommissionsDate === todayStr;

  // Browser Web Notification Permission
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | 'unsupported'>('default');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotifPermission(Notification.permission);
    } else {
      setNotifPermission('unsupported');
    }
  }, []);

  const handleRequestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const res = await Notification.requestPermission();
      setNotifPermission(res);
      if (res === 'granted') {
        soundManager.playLogSuccessChime();
        triggerNotification({
          title: 'Notifications Activated',
          message: 'Teyvat Baby Chronicle will now alert you for scheduled routines!',
          category: 'play',
        });
      }
    }
  };

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('teyvat_baby_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('teyvat_baby_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('teyvat_baby_schedule', JSON.stringify(schedule));
  }, [schedule]);

  // Periodic Schedule Reminder Checker (runs every 20 seconds)
  useEffect(() => {
    const notifiedKey = `teyvat_notified_${todayStr}`;
    const notifiedIds: string[] = JSON.parse(sessionStorage.getItem(notifiedKey) || '[]');

    const checkSchedule = () => {
      const now = new Date();
      const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      schedule.forEach((item) => {
        if (item.reminderEnabled && item.time === currentHHMM && !notifiedIds.includes(item.id)) {
          notifiedIds.push(item.id);
          sessionStorage.setItem(notifiedKey, JSON.stringify(notifiedIds));

          triggerNotification({
            title: `Routine Reminder: ${item.label}`,
            message: `Time for ${profile.name}'s scheduled ${item.category} routine (${item.time}).`,
            category: item.category,
          });
        }
      });
    };

    const interval = setInterval(checkSchedule, 20000);
    return () => clearInterval(interval);
  }, [schedule, profile.name, todayStr]);

  // Trigger interactive notification (sound + toast + list)
  const triggerNotification = (params: {
    title: string;
    message: string;
    category: ActivityLog['category'];
  }) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newNotif: ReminderNotification = {
      id: `notif-${Date.now()}`,
      title: params.title,
      message: params.message,
      timestamp: now.toISOString(),
      timeStr,
      category: params.category,
    };

    setNotifications((prev) => [newNotif, ...prev]);
    setActiveToast(newNotif);
    soundManager.playReminderChime();

    // Trigger system browser notification if enabled
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(params.title, {
          body: params.message,
          icon: profile.avatar,
        });
      } catch {
        // Ignore iframe restrictions if any
      }
    }

    // Auto dismiss floating toast after 7s
    setTimeout(() => {
      setActiveToast((current) => (current?.id === newNotif.id ? null : current));
    }, 7000);
  };

  // Activity Log Handlers
  const handleAddLog = (newLog: Omit<ActivityLog, 'id'>) => {
    const entry: ActivityLog = {
      ...newLog,
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    setLogs((prev) => [entry, ...prev]);
  };

  const handleDeleteLog = (id: string) => {
    setLogs((prev) => prev.filter((l) => l.id !== id));
  };

  // Claim Daily Commissions Bounty
  const handleClaimDailyCommissions = () => {
    soundManager.playPrimogemChime();
    setProfile((prev) => ({
      ...prev,
      primogems: prev.primogems + 60,
    }));
    setClaimedCommissionsDate(todayStr);
    localStorage.setItem('teyvat_claimed_commissions_date', todayStr);

    triggerNotification({
      title: 'Daily Commissions Claimed!',
      message: 'Claimed +60 Primogems for completing all daily baby care quests!',
      category: 'play',
    });
  };

  // Schedule Handlers
  const handleToggleScheduleCheck = (id: string) => {
    setSchedule((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const hasCompleted = item.completedDates.includes(todayStr);
          const nextDates = hasCompleted
            ? item.completedDates.filter((d) => d !== todayStr)
            : [...item.completedDates, todayStr];
          return { ...item, completedDates: nextDates };
        }
        return item;
      })
    );
  };

  const handleToggleReminder = (id: string) => {
    setSchedule((prev) =>
      prev.map((item) => (item.id === id ? { ...item, reminderEnabled: !item.reminderEnabled } : item))
    );
  };

  const handleAddScheduleItem = (newItem: Omit<ScheduleItem, 'id' | 'completedDates'>) => {
    const entry: ScheduleItem = {
      ...newItem,
      id: `sch-${Date.now()}`,
      completedDates: [],
    };
    setSchedule((prev) => [...prev, entry]);
  };

  const handleDeleteScheduleItem = (id: string) => {
    setSchedule((prev) => prev.filter((s) => s.id !== id));
  };

  // Filter today's logs
  const todayLogs = useMemo(() => {
    return logs.filter((l) => l.date === todayStr);
  }, [logs, todayStr]);

  return (
    <div className="min-h-screen bg-[#0b101d] text-[#e8eaed] flex flex-col font-sans selection:bg-[#4be3b5]/30 selection:text-[#4be3b5]">
      
      {/* Top Bar Contract compliant Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        primogems={profile.primogems}
        onOpenQuickLog={() => setIsQuickLogOpen(true)}
        unreadRemindersCount={notifications.length}
        onOpenNotifications={() => setIsNotificationsModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* Baby Status Banner (AR, Vision, Goals) */}
        <BabyProfileBar
          profile={profile}
          onUpdateProfile={setProfile}
          todayLoggedCount={todayLogs.length}
        />

        {/* View Switching */}
        {activeTab === 'dashboard' && (
          <DashboardView
            profile={profile}
            todayLogs={todayLogs}
            schedule={schedule}
            onOpenQuickLog={() => setIsQuickLogOpen(true)}
            onDeleteLog={handleDeleteLog}
            onAddLog={handleAddLog}
            onClaimDailyCommissions={handleClaimDailyCommissions}
            dailyCommissionsClaimed={dailyCommissionsClaimed}
            onToggleScheduleCheck={handleToggleScheduleCheck}
            onNavigateToSchedule={() => setActiveTab('routine')}
          />
        )}

        {activeTab === 'logs' && (
          <ActivityLogView
            logs={logs}
            onDeleteLog={handleDeleteLog}
            onOpenQuickLog={() => setIsQuickLogOpen(true)}
          />
        )}

        {activeTab === 'analytics' && (
          <HistoryChartsView logs={logs} profile={profile} />
        )}

        {activeTab === 'reports' && (
          <ReportsView logs={logs} profile={profile} />
        )}

        {activeTab === 'routine' && (
          <ScheduleView
            schedule={schedule}
            onToggleScheduleCheck={handleToggleScheduleCheck}
            onToggleReminder={handleToggleReminder}
            onAddScheduleItem={handleAddScheduleItem}
            onDeleteScheduleItem={handleDeleteScheduleItem}
            onTriggerTestReminder={() =>
              triggerNotification({
                title: 'Test Reminder: Afternoon Nap & Water',
                message: `This is how ${profile.name}'s scheduled daily care alerts chime and notify you!`,
                category: 'sleep',
              })
            }
            notificationPermission={notifPermission}
            onRequestNotificationPermission={handleRequestNotificationPermission}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-[#1b253b] py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="font-genshin text-slate-400">
            Teyvat Baby Chronicle · Little Traveler Care System
          </span>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Sleep & Hydration Optimal</span>
            <span>·</span>
            <span>Screen Moderation Compliant</span>
          </div>
        </div>
      </footer>

      {/* Quick Activity Logging Modal */}
      <QuickLogModal
        isOpen={isQuickLogOpen}
        onClose={() => setIsQuickLogOpen(false)}
        onSaveLog={handleAddLog}
      />

      {/* Notifications History Modal */}
      <NotificationModal
        isOpen={isNotificationsModalOpen}
        onClose={() => setIsNotificationsModalOpen(false)}
        notifications={notifications}
        onDismiss={(id) => setNotifications((prev) => prev.filter((n) => n.id !== id))}
        onClearAll={() => setNotifications([])}
      />

      {/* Floating Real-time Reminder Toast */}
      <FloatingReminderToast
        notification={activeToast}
        onDismiss={() => setActiveToast(null)}
      />

    </div>
  );
}
