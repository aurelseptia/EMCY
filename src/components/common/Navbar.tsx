import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { PWAInstallButton } from './PWAInstallButton';
import { ScheduleNotifications } from './ScheduleNotifications';
import { syncService, type SyncStatusType } from '../../services/syncService';
import { LogOut, RefreshCw, CheckCircle2, ShieldCheck, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [syncStatus, setSyncStatus] = useState<SyncStatusType>('Tersinkron');
  const [isSyncing, setIsSyncing] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    return syncService.subscribe(status => {
      setSyncStatus(status);
    });
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    await syncService.syncPendingData();
    setIsSyncing(false);
  };

  const handleConfirmLogout = async () => {
    await logout();
    navigate('/login');
  };

  const roleLabels: Record<string, { label: string; badge: string }> = {
    ob: { label: 'Petugas Lapangan', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    pj_sarpras: { label: 'PJ Sarpras', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
    ketua_sarpras: { label: 'Ketua Sarpras', badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  };

  const currentRoleInfo = user?.role ? roleLabels[user.role] : { label: 'User', badge: 'bg-blue-800 text-blue-200' };

  return (
    <>
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-2">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <ShieldCheck size={20} className="stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-white">SarprasCheck</span>
                {user && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold border ${currentRoleInfo.badge}`}>
                    {currentRoleInfo.label}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Install button */}
            <PWAInstallButton />

            <ScheduleNotifications />

            {/* Sync status */}
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              title={`Status Sinkronisasi: ${syncStatus}. Klik untuk sinkronisasi ulang.`}
              className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition"
            >
              <RefreshCw size={12} className={isSyncing || syncStatus === 'Mengunggah' ? 'animate-spin text-blue-400' : 'text-slate-400'} />
              <span className="hidden sm:inline">{syncStatus}</span>
            </button>

            {/* User profile / Logout */}
            {user && (
              <div className="flex items-center gap-1.5 pl-1">
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  title="Keluar dari akun"
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 transition"
                  aria-label="Keluar"
                >
                  <LogOut size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl text-slate-900">
            <h3 className="text-base font-bold text-slate-900">Konfirmasi Keluar</h3>
            <p className="mt-2 text-sm text-slate-600">
              Apakah Anda yakin ingin keluar dari akun <strong>{user?.name}</strong>?
            </p>
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmLogout}
                className="flex-1 py-2 rounded-xl bg-rose-600 text-sm font-semibold text-white hover:bg-rose-700 transition"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
