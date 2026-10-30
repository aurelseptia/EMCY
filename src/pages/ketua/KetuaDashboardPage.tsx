import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { assetService } from '../../services/assetService';
import { reportService } from '../../services/reportService';
import { inspectionService } from '../../services/inspectionService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { KepalaSekolahReportModal } from '../../components/reports/KepalaSekolahReportModal';
import type { Asset, Report, InspectionResult } from '../../types';
import {
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCheck2,
  FileText,
  Printer,
  Layers,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';

export const KetuaDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [assets, setAssets] = useState<Asset[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [defectiveItems, setDefectiveItems] = useState<InspectionResult[]>([]);
  const [selectedReportForExport, setSelectedReportForExport] = useState<Report | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [allAssets, allReports, allDefective] = await Promise.all([
        assetService.getAllAssets(),
        reportService.getAllReports(),
        inspectionService.getDefectiveItems(),
      ]);

      setAssets(allAssets);
      setReports(allReports);
      setDefectiveItems(allDefective);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const goodCount = assets.filter(a => a.status === 'good').length;
  const needsRepairCount = assets.filter(a => a.status === 'needs_repair').length;
  const brokenCount = assets.filter(a => a.status === 'broken').length;
  const totalAssets = assets.length || 1;
  const healthPercent = Math.round((goodCount / totalAssets) * 100);

  const pendingReports = reports.filter(r => r.reportStatus === 'submitted');
  const approvedReports = reports.filter(r => r.reportStatus === 'approved');

  const handleOpenExport = (report: Report) => {
    setSelectedReportForExport(report);
    setIsExportModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-800/80 text-purple-200 text-xs font-semibold mb-3">
            <BarChart3 size={14} />
            <span>Ketua Sarana & Prasarana</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            Pemantauan & Evaluasi Sarpras
          </h1>
          <p className="mt-1 text-sm text-purple-200 max-w-lg">
            Pantau kondisi kelayakan sarana prasarana kampus secara menyeluruh, setujui laporan PJ Sarpras, dan terbitkan laporan evaluasi untuk Kepala Sarpras.
          </p>
        </div>
      </div>

      {/* Main KPI Status Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Tingkat Kelayakan Fasilitas Kampus
            </span>
            <div className="text-3xl font-black text-slate-900 mt-1 flex items-baseline gap-2">
              <span>{healthPercent}%</span>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {goodCount} dari {totalAssets} Sarana Prima
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/ketua/persetujuan')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-50 text-purple-900 hover:bg-purple-100 text-xs font-bold border border-purple-200 transition"
            >
              <FileCheck2 size={15} />
              <span>Persetujuan ({pendingReports.length})</span>
            </button>
          </div>
        </div>

        {/* Multi-segment Progress Bar */}
        <div className="space-y-1.5">
          <div className="w-full bg-slate-100 rounded-full h-3 flex overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all duration-300"
              style={{ width: `${(goodCount / totalAssets) * 100}%` }}
              title={`Baik: ${goodCount}`}
            />
            <div
              className="bg-amber-400 h-full transition-all duration-300"
              style={{ width: `${(needsRepairCount / totalAssets) * 100}%` }}
              title={`Perlu Perbaikan: ${needsRepairCount}`}
            />
            <div
              className="bg-rose-500 h-full transition-all duration-300"
              style={{ width: `${(brokenCount / totalAssets) * 100}%` }}
              title={`Rusak: ${brokenCount}`}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Baik: {goodCount}
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              Perlu Perbaikan: {needsRepairCount}
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              Rusak: {brokenCount}
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Key Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Mebel */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Mebel & Perabot</div>
          <div className="text-lg font-bold text-slate-900 mt-1">Bangku, Meja, Lemari</div>
          <div className="mt-2 text-xs text-slate-600">
            Total:{' '}
            <strong>{assets.filter(a => a.category === 'Mebel').length} Unit</strong>
          </div>
        </div>

        {/* Elektronik */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Peralatan Elektronik</div>
          <div className="text-lg font-bold text-slate-900 mt-1">Proyektor, Komputer, AC</div>
          <div className="mt-2 text-xs text-slate-600">
            Total:{' '}
            <strong>{assets.filter(a => a.category === 'Elektronik').length} Unit</strong>
          </div>
        </div>

        {/* Transportasi */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Armada Transportasi</div>
          <div className="text-lg font-bold text-slate-900 mt-1">Mobil & Kendaraan Sekolah</div>
          <div className="mt-2 text-xs text-slate-600">
            Total:{' '}
            <strong>{assets.filter(a => a.category === 'Transportasi').length} Unit</strong>
          </div>
        </div>
      </div>

      {/* Quick Monitoring Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div
          onClick={() => navigate('/ketua/sarana')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs cursor-pointer hover:border-purple-400 hover:shadow-md transition flex flex-col justify-between"
        >
          <div>
            <h3 className="font-bold text-sm text-slate-900">Inventaris Sarana</h3>
            <p className="text-xs text-slate-500 mt-1">
              Lihat seluruh data fasilitas dan hapus jika diperlukan.
            </p>
          </div>
          <span className="text-xs font-bold text-purple-700 mt-3 flex items-center gap-1">
            Buka <ArrowRight size={13} />
          </span>
        </div>

        <div
          onClick={() => navigate('/ketua/template')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs cursor-pointer hover:border-purple-400 hover:shadow-md transition flex flex-col justify-between"
        >
          <div>
            <h3 className="font-bold text-sm text-slate-900">Template Ceklis</h3>
            <p className="text-xs text-slate-500 mt-1">
              Pantau seluruh butir instrumen ceklis dan hapus jika perlu.
            </p>
          </div>
          <span className="text-xs font-bold text-purple-700 mt-3 flex items-center gap-1">
            Buka <ArrowRight size={13} />
          </span>
        </div>

        <div
          onClick={() => navigate('/ketua/jadwal')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs cursor-pointer hover:border-purple-400 hover:shadow-md transition flex flex-col justify-between"
        >
          <div>
            <h3 className="font-bold text-sm text-slate-900">Jadwal Pemeriksaan</h3>
            <p className="text-xs text-slate-500 mt-1">
              Pantau agenda jatuh tempo inspeksi dan hapus jika perlu.
            </p>
          </div>
          <span className="text-xs font-bold text-purple-700 mt-3 flex items-center gap-1">
            Buka <ArrowRight size={13} />
          </span>
        </div>

        <div
          onClick={() => navigate('/ketua/riwayat')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs cursor-pointer hover:border-purple-400 hover:shadow-md transition flex flex-col justify-between"
        >
          <div>
            <h3 className="font-bold text-sm text-slate-900">Arsip Ceklis OB</h3>
            <p className="text-xs text-slate-500 mt-1">
              Lihat hasil ceklis dan hapus arsip jika diperlukan.
            </p>
          </div>
          <span className="text-xs font-bold text-purple-700 mt-3 flex items-center gap-1">
            Buka <ArrowRight size={13} />
          </span>
        </div>
      </div>

      {/* Laporan untuk Kepala Sekolah Section */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-base text-slate-900">
              Laporan Evaluasi untuk Kepala Sarpras
            </h2>
            <p className="text-xs text-slate-500">
              Dokumen resmi yang telah disetujui dan siap diteruskan kepada Kepala Sarpras.
            </p>
          </div>
          
        </div>

        {reports.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            <FileText size={32} className="mx-auto text-slate-300 mb-2" />
            <div className="font-bold text-slate-700">Belum ada laporan masuk dari PJ Sarpras</div>
            <p className="text-xs text-slate-400">
              Laporan yang disusun PJ Sarpras akan muncul di sini untuk Anda verifikasi dan teruskan ke Kepala Sarpras.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map(report => (
              <div
                key={report.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-purple-300 transition"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      {report.title}
                    </span>
                    <StatusBadge status={report.reportStatus} size="sm" />
                  </div>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                    {report.summary}
                  </p>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Periode: {report.period} • Disusun: {report.createdByName}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <button
                    onClick={() => handleOpenExport(report)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-900 hover:bg-purple-800 text-white text-xs font-bold shadow-xs transition active:scale-95"
                  >
                    <Printer size={13} />
                    <span>Format Kepala Sekolah</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Format Laporan Kepala Sekolah */}
      <KepalaSekolahReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        report={selectedReportForExport}
        assets={assets}
        defectiveItems={defectiveItems}
        onReportUpdated={loadData}
      />
    </div>
  );
};
