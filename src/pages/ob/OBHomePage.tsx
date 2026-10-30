import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { assetService } from '../../services/assetService';
import { inspectionService } from '../../services/inspectionService';
import { StatusBadge } from '../../components/common/StatusBadge';
import type { Asset, InspectionSchedule, Inspection } from '../../types';
import {
  ClipboardCheck,
  Calendar,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Layers,
  MapPin,
  Clock,
} from 'lucide-react';

export const OBHomePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [schedules, setSchedules] = useState<Array<InspectionSchedule & { asset?: Asset }>>([]);
  const [recentInspections, setRecentInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(false);
    try {
      const allSchedules = await assetService.getSchedulesWithDetails();
      const myInspections = await inspectionService.getInspectionsByOB(user.uid);
      setSchedules(allSchedules);
      setRecentInspections(myInspections.slice(0, 5));
    } catch (err) {
      console.error(err);
    }
  };

  const pendingSchedules = schedules.filter(s => s.status === 'pending');
  const nextSchedule = pendingSchedules[0];

  return (
    <div className="space-y-6">
      {/* Header Greeting */}
      <div className="bg-gradient-to-r from-blue-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-800/80 text-blue-200 text-xs font-semibold mb-3">
            <Sparkles size={14} />
            <span>Petugas Lapangan</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            Halo, {user?.name}
          </h1>
          <p className="mt-1 text-sm text-blue-200 max-w-md">
            Pantau dan pastikan sarana prasarana sekolah tetap bersih, aman, dan siap digunakan mahasiswa & civitas akademika.
          </p>
        </div>
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-blue-600/20 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-700 rounded-xl shrink-0">
            <ClipboardCheck size={22} />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900">{pendingSchedules.length}</div>
            <div className="text-xs text-slate-500 font-medium">Jadwal Menunggu</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl shrink-0">
            <CheckCircle size={22} />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900">
              {recentInspections.filter(i => i.status === 'submitted' || i.status === 'verified').length}
            </div>
            <div className="text-xs text-slate-500 font-medium">Selesai Diperiksa</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3 col-span-2 sm:col-span-1">
          <div className="p-3 bg-amber-50 text-amber-700 rounded-xl shrink-0">
            <Layers size={22} />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900">{schedules.length}</div>
            <div className="text-xs text-slate-500 font-medium">Total Jadwal Aktif</div>
          </div>
        </div>
      </div>

      {/* Next Inspection Card */}
      {nextSchedule && nextSchedule.asset ? (
        <div className="bg-white rounded-2xl p-5 border-2 border-blue-600/30 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-lg uppercase tracking-wider">
              Tugas Berikutnya
            </span>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Calendar size={13} />
              Jatuh Tempo: {nextSchedule.dueDate}
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900">{nextSchedule.asset.name}</h2>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-600">
            <span className="font-semibold text-slate-800">{nextSchedule.asset.code}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin size={13} />
              {nextSchedule.asset.location}
            </span>
            <span>•</span>
            <span>Kategori {nextSchedule.asset.category}</span>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <StatusBadge status={nextSchedule.asset.status} size="sm" />
            <button
              onClick={() => navigate(`/ob/ceklis/${nextSchedule.assetId}?scheduleId=${nextSchedule.id}`)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs sm:text-sm font-bold shadow-md transition active:scale-95"
            >
              <span>Mulai Ceklis Sekarang</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-200 text-emerald-950 flex items-center gap-3">
          <CheckCircle size={28} className="text-emerald-600 shrink-0" />
          <div className="text-sm">
            <div className="font-bold">Semua Jadwal Selesai!</div>
            <div className="text-xs text-emerald-800">
              Tidak ada sarana prasarana yang menunggu pemeriksaan saat ini.
            </div>
          </div>
        </div>
      )}

      {/* Recent Inspections History */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-base text-slate-900">Riwayat Pemeriksaan Terakhir</h2>
          <Link to="/ob/riwayat" className="text-xs font-bold text-blue-900 hover:underline flex items-center gap-1">
            Lihat Semua
            <ArrowRight size={13} />
          </Link>
        </div>

        {recentInspections.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            Belum ada data pemeriksaan. Mulai pemeriksaan pertama Anda melalui menu Pemeriksaan.
          </div>
        ) : (
          <div className="space-y-3">
            {recentInspections.map(insp => (
              <div
                key={insp.id}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="font-bold text-sm text-slate-900 truncate">
                    {insp.assetName || 'Sarana Sekolah'}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span>{insp.assetCode}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {new Date(insp.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
                <div className="shrink-0 flex flex-col items-end gap-1">
                  <StatusBadge status={insp.overallStatus} size="sm" />
                  <span className="text-[10px] text-slate-400 font-medium">
                    {insp.status === 'verified' ? 'Terverifikasi PJ' : insp.status === 'submitted' ? 'Terkirim' : 'Draft'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
