import React, { useState, useEffect } from 'react';
import { reportService } from '../../services/reportService';
import { assetService } from '../../services/assetService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ReportModal } from '../../components/crud/ReportModal';
import { ConfirmDeleteModal } from '../../components/crud/ConfirmDeleteModal';
import { Modal } from '../../components/common/Modal';
import { KepalaSekolahReportModal } from '../../components/reports/KepalaSekolahReportModal';
import { useToast } from '../../hooks/useToast';
import type { Report, Asset } from '../../types';
import {
  FileText,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Calendar,
  User,
  CheckCheck,
  Printer,
  Sparkles,
} from 'lucide-react';

export const PJLaporanPage: React.FC = () => {
  const { success: toastSuccess, error: toastError } = useToast();

  const [reports, setReports] = useState<Report[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State for Add / Edit
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportToEdit, setReportToEdit] = useState<Report | null>(null);

  // Modal State for Delete
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<Report | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Modal State for Detail & Printable format
  const [selectedReportDetail, setSelectedReportDetail] = useState<Report | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

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

  const handleOpenAdd = () => {
    setReportToEdit(null);
    setIsReportModalOpen(true);
  };

  const handleOpenEdit = (report: Report) => {
    setReportToEdit(report);
    setIsReportModalOpen(true);
  };

  const handleOpenDelete = (report: Report) => {
    setReportToDelete(report);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!reportToDelete) return;
    setIsDeleting(true);
    try {
      await reportService.deleteReport(reportToDelete.id);
      toastSuccess(`Dokumen laporan "${reportToDelete.title}" berhasil dihapus.`);
      setIsDeleteModalOpen(false);
      setReportToDelete(null);
      await loadData();
    } catch (err: any) {
      toastError(err?.message || 'Gagal menghapus laporan.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenDetail = (report: Report) => {
    setSelectedReportDetail(report);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Laporan Sarana & Prasarana
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Susun dan kelola laporan rekapitulasi maintenance sarpras untuk diajukan ke Ketua Sarpras.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs sm:text-sm font-bold shadow-md transition active:scale-95 shrink-0"
        >
          <Plus size={16} />
          <span>Susun Laporan Baru</span>
        </button>
      </div>

      {/* Reports List */}
      {reports.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
          <FileText size={36} className="mx-auto text-slate-300 mb-2" />
          <div className="font-bold text-slate-800">Belum ada dokumen laporan</div>
          <p className="text-xs text-slate-400 mt-1">
            Klik tombol "Susun Laporan Baru" untuk menyusun laporan evaluasi sarana prasarana sekolah.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map(report => (
            <div
              key={report.id}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-amber-400 transition flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-slate-900">{report.title}</span>
                    <StatusBadge status={report.reportStatus} size="sm" />
                    {report.forwardedToPrincipalAt && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                        <CheckCheck size={11} />
                        Diteruskan ke Kepsek
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      <User size={13} className="text-slate-400" />
                      Penyusun: {report.createdByName}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar size={13} className="text-slate-400" />
                      Periode: {report.period}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleOpenDetail(report)}
                    className="p-2 rounded-xl text-slate-600 hover:text-amber-800 hover:bg-amber-50 border border-slate-200 transition"
                    title="Lihat Detail Laporan"
                  >
                    <Eye size={15} />
                  </button>
                  <button
                    onClick={() => handleOpenEdit(report)}
                    className="p-2 rounded-xl text-slate-600 hover:text-blue-800 hover:bg-blue-50 border border-slate-200 transition"
                    title="Edit Laporan"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => handleOpenDelete(report)}
                    className="p-2 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 transition"
                    title="Hapus Laporan"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 my-2 line-clamp-2">
                {report.summary}
              </p>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Dibuat: {new Date(report.createdAt).toLocaleDateString('id-ID')}</span>
                <button
                  onClick={() => handleOpenDetail(report)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold transition active:scale-95 shadow-xs"
                >
                  <Printer size={13} />
                  <span>Lihat Format Laporan</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add / Edit Report */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        reportToEdit={reportToEdit}
        onSuccess={loadData}
      />

      {/* Modal Format Detail Cetak */}
      <KepalaSekolahReportModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        report={selectedReportDetail}
        assets={assets}
        onReportUpdated={loadData}
      />

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        message="Apakah Anda yakin ingin menghapus dokumen laporan ini?"
        itemName={reportToDelete?.title}
        isLoading={isDeleting}
      />
    </div>
  );
};
