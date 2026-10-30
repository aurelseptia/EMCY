import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { assetService } from '../../services/assetService';
import { StatusBadge } from '../../components/common/StatusBadge';
import type { InspectionSchedule, Asset, ChecklistTemplate } from '../../types';
import {
  ClipboardList,
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  Filter,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const OBPemeriksaanPage: React.FC = () => {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState<
    Array<InspectionSchedule & { asset?: Asset; template?: ChecklistTemplate }>
  >([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      const data = await assetService.getSchedulesWithDetails();
      setSchedules(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = schedules.filter(s => {
    if (filter === 'pending') return s.status === 'pending';
    if (filter === 'completed') return s.status === 'completed';
    return true;
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Daftar Jadwal Pemeriksaan
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Pilih sarana prasarana sekolah untuk mulai mengisi ceklis berkala.
        </p>
      </div>

      {/* Tabs Filter */}
      <div className="flex bg-slate-200/70 p-1 rounded-xl text-xs font-bold text-slate-600">
        <button
          onClick={() => setFilter('pending')}
          className={`flex-1 py-2 rounded-lg transition ${
            filter === 'pending'
              ? 'bg-white text-blue-900 shadow-xs'
              : 'hover:text-slate-900'
          }`}
        >
          Menunggu ({schedules.filter(s => s.status === 'pending').length})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`flex-1 py-2 rounded-lg transition ${
            filter === 'completed'
              ? 'bg-white text-blue-900 shadow-xs'
              : 'hover:text-slate-900'
          }`}
        >
          Selesai ({schedules.filter(s => s.status === 'completed').length})
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-2 rounded-lg transition ${
            filter === 'all'
              ? 'bg-white text-blue-900 shadow-xs'
              : 'hover:text-slate-900'
          }`}
        >
          Semua ({schedules.length})
        </button>
      </div>

      {/* List of Schedules */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 space-y-2">
          <CheckCircle2 size={36} className="mx-auto text-emerald-500" />
          <div className="font-bold text-slate-800">Tidak ada jadwal pada kategori ini</div>
          <p className="text-xs text-slate-400">
            {filter === 'pending'
              ? 'Luar biasa! Semua ceklis pemeriksaan telah selesai dikerjakan.'
              : 'Belum ada data jadwal yang sesuai filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(schedule => {
            const asset = schedule.asset;
            const template = schedule.template;

            return (
              <div
                key={schedule.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-blue-400 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded-md">
                      {asset?.code || 'KODE'}
                    </span>
                    <h2 className="font-bold text-base text-slate-900 mt-1 truncate">
                      {asset?.name || 'Aset Sekolah'}
                    </h2>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin size={13} className="text-slate-400" />
                        {asset?.location || 'Lokasi tidak ditentukan'}
                      </span>
                      <span>•</span>
                      <span>Kategori {asset?.category}</span>
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col items-end gap-1">
                    {schedule.status === 'completed' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 size={13} />
                        Selesai
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                        <Clock size={13} />
                        Menunggu
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs text-slate-500">
                    Template: <strong className="text-slate-700">{template?.name || 'Ceklis Standar'}</strong> ({schedule.frequency})
                  </div>

                  <button
                    onClick={() => navigate(`/ob/ceklis/${schedule.assetId}?scheduleId=${schedule.id}`)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold shadow-xs transition active:scale-95 ml-auto"
                  >
                    <span>{schedule.status === 'completed' ? 'Periksa Ulang' : 'Mulai Ceklis'}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
