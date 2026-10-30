import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { inspectionService } from '../../services/inspectionService';
import { assetService } from '../../services/assetService';
import { StatusBadge } from '../../components/common/StatusBadge';
import type { Inspection, InspectionResult, Asset } from '../../types';
import {
  LayoutDashboard,
  Clock,
  AlertTriangle,
  XCircle,
  Wrench,
  CheckCircle2,
  ArrowRight,
  FileText,
  ShieldAlert,
  Box,
  ListChecks,
  Calendar,
  Layers,
} from 'lucide-react';

export const PJDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [defectiveItems, setDefectiveItems] = useState<
    Array<InspectionResult & { inspection?: Inspection }>
  >([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [allInspections, defective, allAssets] = await Promise.all([
        inspectionService.getAllInspections(),
        inspectionService.getDefectiveItems(),
        assetService.getAllAssets(),
      ]);

      setInspections(allInspections);
      setDefectiveItems(defective);
      setAssets(allAssets);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const pendingVerification = inspections.filter(i => i.status === 'submitted');
  const needsRepairCount = defectiveItems.filter(d => d.result === 'needs_repair').length;
  const brokenCount = defectiveItems.filter(d => d.result === 'broken').length;
  const inProgressFollowUps = defectiveItems.filter(d => d.followUpStatus === 'in_progress').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-700 to-amber-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-800/80 text-amber-200 text-xs font-semibold mb-3">
            <Wrench size={14} />
            <span>Penanggung Jawab Sarpras</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            Dashboard Maintenance
          </h1>
          <p className="mt-1 text-sm text-amber-100 max-w-md">
            Verifikasi ceklis dari petugas OB dan koordinasikan tindak lanjut perbaikan sarana sekolah.
          </p>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Butuh Verifikasi */}
        <div
          onClick={() => navigate('/pj/ceklis')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs cursor-pointer hover:border-amber-400 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Butuh Verifikasi</span>
            <div className="p-2 bg-sky-50 text-sky-700 rounded-lg">
              <Clock size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {pendingVerification.length}
          </div>
          <span className="text-[11px] text-sky-600 font-medium">Ceklis baru dari OB</span>
        </div>

        {/* Perlu Perbaikan */}
        <div
          onClick={() => navigate('/pj/kerusakan')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs cursor-pointer hover:border-amber-400 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Perlu Perbaikan</span>
            <div className="p-2 bg-amber-50 text-amber-700 rounded-lg">
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-700 mt-2">{needsRepairCount}</div>
          <span className="text-[11px] text-amber-600 font-medium">Kondisi ringan/sedang</span>
        </div>

        {/* Rusak Total */}
        <div
          onClick={() => navigate('/pj/kerusakan')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs cursor-pointer hover:border-amber-400 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Rusak</span>
            <div className="p-2 bg-rose-50 text-rose-700 rounded-lg">
              <XCircle size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-700 mt-2">{brokenCount}</div>
          <span className="text-[11px] text-rose-600 font-medium">Perlu tindakan cepat</span>
        </div>

        {/* Sedang Diproses */}
        <div
          onClick={() => navigate('/pj/tindak-lanjut')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs cursor-pointer hover:border-amber-400 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Sedang Diproses</span>
            <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
              <Wrench size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-800 mt-2">{inProgressFollowUps}</div>
          <span className="text-[11px] text-blue-600 font-medium">Dalam perbaikan</span>
        </div>
      </div>

      {/* Action Banner: Susun Laporan untuk Ketua Sarpras */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <FileText size={18} className="text-amber-600" />
            <span>Penyusunan Laporan untuk Ketua Sarpras</span>
          </h2>
          <p className="text-xs text-slate-500 max-w-xl">
            Kompilasikan riwayat pemeriksaan dan status perbaikan untuk diajukan dan disetujui oleh Ketua Sarpras.
          </p>
        </div>
        <button
          onClick={() => navigate('/pj/tindak-lanjut')}
          className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs sm:text-sm font-bold shadow-xs transition active:scale-95"
        >
          <span>Kelola Tindak Lanjut & Laporan</span>
          <ArrowRight size={15} />
        </button>
      </div>

      {/* CRUD Master Data Management */}
      <div className="space-y-3">
        <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
          <Layers size={18} className="text-amber-700" />
          <span>Kelola Data & Konfigurasi Sarpras</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* CRUD Sarana Prasarana */}
          <div
            onClick={() => navigate('/pj/sarana')}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs cursor-pointer hover:border-amber-400 hover:shadow-md transition group"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-blue-50 text-blue-900 rounded-xl group-hover:scale-105 transition">
                <Box size={20} />
              </div>
              <span className="text-xs font-bold text-amber-700 flex items-center gap-1">
                Kelola <ArrowRight size={13} />
              </span>
            </div>
            <h3 className="font-bold text-base text-slate-900 mt-3">Sarana Prasarana</h3>
            <p className="text-xs text-slate-500 mt-1">
              Tambah, edit, dan hapus sarpras ({assets.length} aset terdaftar).
            </p>
          </div>

          {/* CRUD Template Ceklis */}
          <div
            onClick={() => navigate('/pj/template')}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs cursor-pointer hover:border-amber-400 hover:shadow-md transition group"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-purple-50 text-purple-900 rounded-xl group-hover:scale-105 transition">
                <ListChecks size={20} />
              </div>
              <span className="text-xs font-bold text-amber-700 flex items-center gap-1">
                Kelola <ArrowRight size={13} />
              </span>
            </div>
            <h3 className="font-bold text-base text-slate-900 mt-3">Template Ceklis</h3>
            <p className="text-xs text-slate-500 mt-1">
              Buat dan modifikasi pertanyaan serta butir ceklis digital OB.
            </p>
          </div>

          {/* CRUD Jadwal Pemeriksaan */}
          <div
            onClick={() => navigate('/pj/jadwal')}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs cursor-pointer hover:border-amber-400 hover:shadow-md transition group"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-emerald-50 text-emerald-900 rounded-xl group-hover:scale-105 transition">
                <Calendar size={20} />
              </div>
              <span className="text-xs font-bold text-amber-700 flex items-center gap-1">
                Kelola <ArrowRight size={13} />
              </span>
            </div>
            <h3 className="font-bold text-base text-slate-900 mt-3">Jadwal Pemeriksaan</h3>
            <p className="text-xs text-slate-500 mt-1">
              Atur jatuh tempo dan penugasan inspeksi kepada petugas OB.
            </p>
          </div>

          {/* CRUD Laporan Sarpras */}
          <div
            onClick={() => navigate('/pj/laporan')}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs cursor-pointer hover:border-amber-400 hover:shadow-md transition group"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-amber-50 text-amber-900 rounded-xl group-hover:scale-105 transition">
                <FileText size={20} />
              </div>
              <span className="text-xs font-bold text-amber-700 flex items-center gap-1">
                Kelola <ArrowRight size={13} />
              </span>
            </div>
            <h3 className="font-bold text-base text-slate-900 mt-3">Dokumen Laporan</h3>
            <p className="text-xs text-slate-500 mt-1">
              Susun, edit, dan ajukan laporan evaluasi untuk Ketua Sarpras.
            </p>
          </div>
        </div>
      </div>

      {/* Ceklis yang Menunggu Verifikasi */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-base text-slate-900">
            Ceklis Menunggu Verifikasi ({pendingVerification.length})
          </h2>
          <Link
            to="/pj/ceklis"
            className="text-xs font-bold text-amber-700 hover:underline flex items-center gap-1"
          >
            Lihat Semua
            <ArrowRight size={13} />
          </Link>
        </div>

        {pendingVerification.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            <CheckCircle2 size={32} className="mx-auto text-emerald-500 mb-1" />
            <div className="font-bold text-slate-700">Semua hasil ceklis sudah terverifikasi</div>
            <p className="text-xs text-slate-400">Belum ada kiriman ceklis baru dari petugas OB.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingVerification.slice(0, 4).map(insp => (
              <div
                key={insp.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-amber-300 transition"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded-md">
                      {insp.assetCode}
                    </span>
                    <StatusBadge status={insp.overallStatus} size="sm" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 mt-1 truncate">
                    {insp.assetName}
                  </h3>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Petugas OB: <strong>{insp.obName}</strong> • Lokasi: {insp.assetLocation}
                  </div>
                </div>

                <button
                  onClick={() => navigate('/pj/ceklis')}
                  className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold transition"
                >
                  <span>Verifikasi</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
