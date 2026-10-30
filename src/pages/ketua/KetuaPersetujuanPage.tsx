import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { reportService } from '../../services/reportService';
import { assetService } from '../../services/assetService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { KepalaSekolahReportModal } from '../../components/reports/KepalaSekolahReportModal';
import type { Report, Asset } from '../../types';
import { FileCheck2, CheckCheck, Clock, User, Calendar, Printer } from 'lucide-react';

export const KetuaPersetujuanPage: React.FC = () => {
  const { user } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  const [reports, setReports] = useState<Report[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isApproving, setIsApproving] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [allReports, allAssets] = await Promise.all([
        reportService.getAllReports(),
        assetService.getAllAssets(),
      ]);
      setReports(allReports);
      setAssets(allAssets);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reportId: string) => {
    if (!user) return;
    setIsApproving(reportId);
    try {
      await reportService.approveReport(reportId, user.uid, user.name);
      toastSuccess('Laporan berhasil disetujui. Siap diteruskan ke Kepala Sekolah.');
      await loadData();
    } catch (err: any) {
      toastError(err?.message || 'Gagal menyetujui laporan.');
    } finally {
      setIsApproving(null);
    }
  };

  const pendingReports = reports.filter(r => r.reportStatus === 'submitted');
  const approvedReports = reports.filter(r => r.reportStatus === 'approved');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Persetujuan Laporan Sarpras
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Tinjau dan setujui draf laporan evaluasi yang diajukan oleh Penanggung Jawab Sarpras.
        </p>
      </div>

      {/* Menunggu Persetujuan */}
      <div className="space-y-3">
        <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <Clock size={16} className="text-amber-600" />
          <span>Menunggu Persetujuan ({pendingReports.length})</span>
        </h2>

        {pendingReports.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center text-slate-400 text-xs sm:text-sm">
            Tidak ada laporan yang menunggu persetujuan saat ini.
          </div>
        ) : (
          pendingReports.map(report => (
            <div
              key={report.id}
              className="bg-white rounded-2xl p-5 border-2 border-purple-200 shadow-sm space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">{report.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span>Oleh: <strong>{report.createdByName}</strong></span>
                    <span>•</span>
                    <span>Periode: {report.period}</span>
                  </div>
                </div>
                <StatusBadge status="submitted" size="sm" />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
                <strong>Ringkasan:</strong> {report.summary}
              </div>

              {report.recommendations && (
                <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200 text-xs text-purple-950 leading-relaxed">
                  <strong>Usulan Rekomendasi:</strong> {report.recommendations}
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedReport(report);
                    setIsExportModalOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
                >
                  Lihat Pratinjau
                </button>

                <button
                  type="button"
                  onClick={() => handleApprove(report.id)}
                  disabled={isApproving === report.id}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-900 hover:bg-purple-800 text-white text-xs font-bold shadow-md transition disabled:opacity-50"
                >
                  <CheckCheck size={15} />
                  <span>{isApproving === report.id ? 'Memproses...' : 'Setujui Laporan'}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Riwayat Disetujui */}
      <div className="space-y-3 pt-4 border-t border-slate-200">
        <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <CheckCheck size={16} className="text-emerald-600" />
          <span>Laporan Telah Disetujui ({approvedReports.length})</span>
        </h2>

        {approvedReports.map(report => (
          <div
            key={report.id}
            className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-900">{report.title}</h3>
                <StatusBadge status="approved" size="sm" />
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Periode: {report.period} • Disetujui oleh: {report.approvedByName || user?.name}
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedReport(report);
                setIsExportModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs"
            >
              <Printer size={13} />
              <span>Format Kepala Sekolah</span>
            </button>
          </div>
        ))}
      </div>

      {/* Modal Format Laporan Kepala Sekolah */}
      <KepalaSekolahReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        report={selectedReport}
        assets={assets}
        onReportUpdated={loadData}
      />
    </div>
  );
};
