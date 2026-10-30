import React, { useEffect, useMemo, useState } from 'react';
import { liveQuery } from 'dexie';
import { collection, onSnapshot } from 'firebase/firestore';
import { Bell, BellRing, CalendarClock, Check, Clock3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { assetService } from '../../services/assetService';
import { db } from '../../lib/db';
import { firestoreDb, isFirebaseConfigured } from '../../services/firebase';
import type { InspectionSchedule, UserRole } from '../../types';

type ScheduleNotification = {
  id: string;
  title: string;
  message: string;
  dueDate: string;
  route: string;
  urgency: 'overdue' | 'today' | 'tomorrow';
};

const getWibDate = (date: Date): string => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const part = (type: string) => parts.find(item => item.type === type)?.value ?? '';
  return `${part('year')}-${part('month')}-${part('day')}`;
};

const getDateDifference = (date: string, today: string): number | null => {
  const dateParts = date.split('-').map(Number);
  const todayParts = today.split('-').map(Number);
  if (dateParts.length !== 3 || todayParts.length !== 3 || [...dateParts, ...todayParts].some(Number.isNaN)) {
    return null;
  }

  const targetTime = Date.UTC(dateParts[0], dateParts[1] - 1, dateParts[2]);
  const todayTime = Date.UTC(todayParts[0], todayParts[1] - 1, todayParts[2]);
  return Math.round((targetTime - todayTime) / 86_400_000);
};

const formatWibDate = (date: string): string =>
  new Date(`${date}T00:00:00+07:00`).toLocaleDateString('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

const getSchedulesRoute = (role: UserRole): string => {
  if (role === 'pj_sarpras') return '/pj/jadwal';
  if (role === 'ketua_sarpras') return '/ketua/jadwal';
  return '/ob/pemeriksaan';
};

export const ScheduleNotifications: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState<Array<InspectionSchedule & { asset?: { name: string; code: string } }>>([]);
  const [now, setNow] = useState(() => new Date());
  const [isOpen, setIsOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [browserPermission, setBrowserPermission] = useState(
    typeof Notification === 'undefined' ? 'unsupported' : Notification.permission
  );
  const [browserMessage, setBrowserMessage] = useState('');
  const readStorageKey = user ? `emcy_schedule_notifications_read_${user.uid}` : '';
  const sentStorageKey = user ? `emcy_schedule_notifications_sent_${user.uid}` : '';

  useEffect(() => {
    if (!user) return;

    let active = true;
    const subscription = liveQuery(() => assetService.getSchedulesWithDetails()).subscribe({
      next: schedulesWithDetails => {
        if (active) setSchedules(schedulesWithDetails);
      },
      error: error => console.error('Gagal memuat notifikasi jadwal:', error),
    });

    let unsubscribeFirestore: (() => void) | undefined;
    if (isFirebaseConfigured() && firestoreDb) {
      unsubscribeFirestore = onSnapshot(
        collection(firestoreDb, 'inspectionSchedules'),
        snapshot => {
          const changes = snapshot.docChanges();
          const incoming = changes
            .filter(change => change.type !== 'removed')
            .map(change => ({ ...change.doc.data(), id: change.doc.id } as InspectionSchedule));
          const removed = changes.filter(change => change.type === 'removed').map(change => change.doc.id);

          void db.transaction('rw', db.inspectionSchedules, async () => {
            if (incoming.length) await db.inspectionSchedules.bulkPut(incoming);
            if (removed.length) await db.inspectionSchedules.bulkDelete(removed);
          }).catch(error => console.error('Gagal memperbarui jadwal realtime:', error));
        },
        error => console.error('Koneksi realtime jadwal gagal:', error)
      );
    }

    return () => {
      active = false;
      subscription.unsubscribe();
      unsubscribeFirestore?.();
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;
    try {
      const saved = localStorage.getItem(readStorageKey);
      setReadIds(new Set(saved ? JSON.parse(saved) as string[] : []));
    } catch (error) {
      console.error('Gagal memuat status notifikasi:', error);
      setReadIds(new Set());
    }
  }, [readStorageKey, user]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const notifications = useMemo<ScheduleNotification[]>(() => {
    if (!user) return [];
    const today = getWibDate(now);

    return schedules.flatMap(schedule => {
      if (schedule.status === 'completed') return [];
      if (user.role === 'ob' && schedule.assignedTo && schedule.assignedTo !== user.uid) return [];

      const daysUntilDue = getDateDifference(schedule.dueDate, today);
      if (daysUntilDue === null || daysUntilDue > 1) return [];

      const urgency: ScheduleNotification['urgency'] =
        daysUntilDue < 0 ? 'overdue' : daysUntilDue === 0 ? 'today' : 'tomorrow';
      const title =
        urgency === 'overdue'
          ? 'Jadwal pemeriksaan terlambat'
          : urgency === 'today'
            ? 'Jadwal pemeriksaan hari ini'
            : 'Pengingat jadwal untuk besok';
      const assetName = schedule.asset?.name ?? 'Sarana prasarana';
      const message =
        urgency === 'overdue'
          ? `${assetName} seharusnya diperiksa pada ${formatWibDate(schedule.dueDate)}.`
          : `${assetName} dijadwalkan untuk diperiksa ${urgency === 'today' ? 'hari ini' : 'besok'} (${formatWibDate(schedule.dueDate)}).`;

      return [{
        id: `schedule-${schedule.id}-${schedule.dueDate}`,
        title,
        message,
        dueDate: schedule.dueDate,
        route: getSchedulesRoute(user.role),
        urgency,
      }];
    }).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [now, schedules, user]);

  useEffect(() => {
    if (browserPermission !== 'granted' || !user || notifications.length === 0) return;

    try {
      const alreadySent = new Set(JSON.parse(localStorage.getItem(sentStorageKey) ?? '[]') as string[]);
      const newlySent: string[] = [];

      notifications.forEach(notification => {
        if (alreadySent.has(notification.id)) return;
        const browserNotification = new Notification(notification.title, {
          body: notification.message,
          icon: '/pwa-192x192.png',
          tag: notification.id,
        });
        browserNotification.onclick = () => {
          window.focus();
          navigate(notification.route);
          browserNotification.close();
        };
        newlySent.push(notification.id);
      });

      if (newlySent.length > 0) {
        localStorage.setItem(sentStorageKey, JSON.stringify([...alreadySent, ...newlySent]));
      }
    } catch (error) {
      console.error('Gagal menampilkan notifikasi browser:', error);
      setBrowserMessage('Notifikasi browser tidak dapat ditampilkan.');
    }
  }, [browserPermission, navigate, notifications, sentStorageKey, user]);

  const persistReadIds = (nextReadIds: Set<string>) => {
    setReadIds(nextReadIds);
    try {
      localStorage.setItem(readStorageKey, JSON.stringify([...nextReadIds]));
    } catch (error) {
      console.error('Gagal menyimpan status notifikasi:', error);
      setBrowserMessage('Status baca notifikasi tidak dapat disimpan.');
    }
  };

  const markAllAsRead = () => persistReadIds(new Set([...readIds, ...notifications.map(item => item.id)]));
  const unreadCount = notifications.filter(item => !readIds.has(item.id)).length;

  const enableBrowserNotifications = async () => {
    if (typeof Notification === 'undefined') {
      setBrowserMessage('Browser ini tidak mendukung notifikasi.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setBrowserPermission(permission);
      setBrowserMessage(
        permission === 'granted'
          ? 'Notifikasi browser aktif saat aplikasi terbuka.'
          : 'Izin notifikasi browser belum diberikan.'
      );
    } catch (error) {
      console.error('Gagal meminta izin notifikasi browser:', error);
      setBrowserMessage('Gagal meminta izin notifikasi browser.');
    }
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(open => !open)}
        aria-label={`Pusat notifikasi${unreadCount ? `, ${unreadCount} belum dibaca` : ''}`}
        aria-expanded={isOpen}
        className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition"
      >
        {unreadCount > 0 ? <BellRing size={17} /> : <Bell size={17} />}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] leading-4 font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <section
          aria-label="Pusat notifikasi jadwal"
          className="absolute right-0 top-full mt-2 w-[min(22rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl"
        >
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
            <div>
              <h2 className="text-sm font-bold">Notifikasi Jadwal</h2>
              <p className="text-[11px] text-slate-500">Waktu Indonesia Barat (WIB)</p>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-[11px] font-semibold text-blue-800 hover:underline"
              >
                Tandai dibaca
              </button>
            )}
          </div>

          <div className="max-h-[min(60vh,26rem)] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <CalendarClock size={26} className="mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-semibold text-slate-700">Belum ada pengingat jadwal</p>
                <p className="mt-1 text-xs text-slate-500">Pengingat muncul sehari sebelum, pada hari jadwal, atau jika terlambat.</p>
              </div>
            ) : (
              notifications.map(notification => {
                const isRead = readIds.has(notification.id);
                return (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => {
                      persistReadIds(new Set([...readIds, notification.id]));
                      setIsOpen(false);
                      navigate(notification.route);
                    }}
                    className={`flex w-full items-start gap-3 border-b border-slate-100 px-4 py-3 text-left transition hover:bg-slate-50 ${
                      isRead ? 'bg-white' : 'bg-blue-50/70'
                    }`}
                  >
                    <span className={`mt-0.5 rounded-lg p-2 ${
                      notification.urgency === 'overdue'
                        ? 'bg-rose-100 text-rose-700'
                        : notification.urgency === 'today'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-blue-100 text-blue-700'
                    }`}>
                      {notification.urgency === 'overdue' ? <Clock3 size={16} /> : <CalendarClock size={16} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold">{notification.title}</span>
                        {isRead && <Check size={14} className="shrink-0 text-emerald-600" aria-label="Sudah dibaca" />}
                      </span>
                      <span className="mt-1 block text-xs leading-relaxed text-slate-600">{notification.message}</span>
                    </span>
                  </button>
                );
              })
            )}
          </div>

          <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
            {browserPermission === 'default' || browserPermission === 'unsupported' ? (
              <button
                type="button"
                onClick={enableBrowserNotifications}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Aktifkan notifikasi browser
              </button>
            ) : (
              <p className="text-center text-[11px] text-slate-500">
                {browserPermission === 'granted' ? 'Notifikasi browser aktif saat aplikasi terbuka.' : 'Izin notifikasi browser diblokir di pengaturan browser.'}
              </p>
            )}
            {browserMessage && <p role="status" className="mt-2 text-center text-[11px] text-slate-500">{browserMessage}</p>}
          </div>
        </section>
      )}
    </div>
  );
};
