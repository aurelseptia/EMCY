import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { syncService, type SyncStatusType } from '../../services/syncService';
import { db } from '../../lib/db';
import { PWAInstallButton } from '../../components/common/PWAInstallButton';
import {
  User,
  Mail,
  Shield,
  RefreshCw,
  HardDrive,
  CheckCircle2,
  LogOut,
  Smartphone,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const OBProfilPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { success: toastSuccess } = useToast();
  const navigate = useNavigate();

  const [syncStatus, setSyncStatus] = useState<SyncStatusType>('Tersinkron');
  const [isSyncing, setIsSyncing] = useState(false);
  const [stats, setStats] = useState({
    inspectionsCount: 0,
    assetsCount: 0,
  });

  useEffect(() => {
    loadStats();
    return syncService.subscribe(setSyncStatus);
  }, [user]);

  const loadStats = async () => {
    if (!user) return;
    const count = await db.inspections.where('obId').equals(user.uid).count();
    const assetsTotal = await db.assets.count();
    setStats({
      inspectionsCount: count,
      assetsCount: assetsTotal,
    });
  };

  const handleSyncNow = async () => {
    setIsSyncing(true);
    await syncService.syncPendingData();
    setIsSyncing(false);
    toastSuccess('Sinkronisasi data selesai.');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/register', { replace: true });
  };

  return (
    <div className="space-y-4 max-w-md mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Profil Petugas
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Informasi Akun Petugas Lapangan Sarpras.
        </p>
      </div>

      {/* User Info Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-900 text-white flex items-center justify-center font-bold text-xl shadow-md">
            {user?.name.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="min-w-0">
            <h2 className="font-extrabold text-base sm:text-lg text-slate-900 truncate">
              {user?.name}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
              <Mail size={13} />
              <span className="truncate">{user?.email}</span>
            </div>
            <div className="mt-1.5">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                <Shield size={11} />
                Petugas Lapangan
              </span>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
            <div className="text-xl font-black text-slate-900">{stats.inspectionsCount}</div>
            <div className="text-xs text-slate-500">Ceklis Dikerjakan</div>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
            <div className="text-xl font-black text-slate-900">{stats.assetsCount}</div>
            <div className="text-xs text-slate-500">Total Sarana Terdaftar</div>
          </div>
        </div>
      </div>

      {/* Logout Action */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-sm font-bold transition"
      >
        <LogOut size={16} />
        <span>Keluar dari Akun</span>
      </button>
    </div>
  );
};
