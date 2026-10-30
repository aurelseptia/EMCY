import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { inspectionService } from '../../services/inspectionService';
import { reportService } from '../../services/reportService';
import { assetService } from '../../services/assetService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { FollowUpModal } from '../../components/crud/FollowUpModal';
import { ConfirmDeleteModal } from '../../components/crud/ConfirmDeleteModal';
import type {
  InspectionResult,
  Inspection,
  FollowUpStatus,
  MaintenanceFollowUp,
  Asset,
} from '../../types';
import {
  Wrench,
  Clock,
  CheckCircle2,
  FileText,
  Send,
  AlertTriangle,
  MapPin,
  CheckCheck,
  Plus,
  Trash2,
  Edit2,
} from 'lucide-react';

export const PJTindakLanjutPage: React.FC = () => {
  const { user } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  const [defectiveItems, setDefectiveItems] = useState<
    Array<InspectionResult & { inspection?: Inspection }>
  >([]);
  const [customFollowUps, setCustomFollowUps] = useState<MaintenanceFollowUp[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);

  // Modal State for Quick Update
  const [selectedItem, setSelectedItem] = useState<
    (InspectionResult & { inspection?: Inspection }) | null
  >(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<FollowUpStatus>('in_progress');
  const [followUpNote, setFollowUpNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Modal State for Create / Edit FollowUp
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [followUpToEdit, setFollowUpToEdit] = useState<MaintenanceFollowUp | null>(null);

  // Modal State for Delete
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [followUpToDelete, setFollowUpToDelete] = useState<MaintenanceFollowUp | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form Susun Laporan untuk Ketua Sarpras
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportTitle, setReportTitle] = useState('Laporan Rekapitulasi Maintenance Sarpras Sekolah');
  const [reportPeriod, setReportPeriod] = useState(
    new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
  );
  const [reportSummary, setReportSummary] = useState('');
  const [reportRecommendations, setReportRecommendations] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [data, followUps, allAssets] = await Promise.all([
        inspectionService.getDefectiveItems(),
        inspectionService.getAllFollowUps(),
        assetService.getAllAssets(),
      ]);
      setDefectiveItems(data);
      setCustomFollowUps(followUps);
      setAssets(allAssets);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenQuickUpdate = (item: InspectionResult & { inspection?: Inspection }) => {
    setSelectedItem(item);
    setNewStatus(item.followUpStatus || 'in_progress');
    setFollowUpNote(item.followUpNote || '');
    setIsUpdateModalOpen(true);
  };

  const handleSaveQuickUpdate = async () => {
    if (!selectedItem) return;
    setIsUpdating(true);
    try {
      await inspectionService.updateFollowUp(selectedItem.id, newStatus, followUpNote);
      toastSuccess('Status tindak lanjut maintenance berhasil diperbarui.');
      setIsUpdateModalOpen(false);
      await loadAllData();
    } catch (err: any) {
      toastError(err?.message || 'Gagal memperbarui tindak lanjut.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOpenAddFollowUp = () => {
    setFollowUpToEdit(null);
    setIsFollowUpModalOpen(true);
  };

  const handleOpenEditFollowUp = (fu: MaintenanceFollowUp) => {
    setFollowUpToEdit(fu);
    setIsFollowUpModalOpen(true);
  };

  const handleOpenDeleteFollowUp = (fu: MaintenanceFollowUp) => {
    setFollowUpToDelete(fu);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDeleteFollowUp = async () => {
    if (!followUpToDelete) return;
    setIsDeleting(true);
    try {
      await inspectionService.deleteFollowUp(followUpToDelete.id);
      toastSuccess('Tindak lanjut maintenance berhasil dihapus.');
      setIsDeleteModalOpen(false);
      setFollowUpToDelete(null);
      await loadAllData();
    } catch (err: any) {
      toastError(err?.message || 'Gagal menghapus data.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenReportModal = () => {
    const totalDefective = defectiveItems.length;
    const waitingCount = defectiveItems.filter(d => d.followUpStatus === 'waiting').length;
    const inProgressCount = defectiveItems.filter(d => d.followUpStatus === 'in_progress').length;
    const doneCount = defectiveItems.filter(d => d.followUpStatus === 'done').length;

    const goodAssets = assets.filter(a => a.status === 'good').length;
    const needsRepairAssets = assets.filter(a => a.status === 'needs_repair').length;
    const brokenAssets = assets.filter(a => a.status === 'broken').length;

    setReportSummary(
      `Telah dilakukan monitoring sarpras sekolah periode ${reportPeriod}. Teridentifikasi ${totalDefective} temuan kerusakan/perlu perbaikan dengan rincian: ${waitingCount} menunggu perbaikan, ${inProgressCount} sedang dalam proses perbaikan, dan ${doneCount} telah selesai diperbaiki. Rekapitulasi kondisi aset sekolah: ${goodAssets} Baik, ${needsRepairAssets} Perlu Perbaikan, dan ${brokenAssets} Rusak.`
    );
    setReportRecommendations(
      'Disarankan alokasi penggantian suku cadang proyektor kelas dan pelumasan berkala engsel meubel ruang kelas.'
    );
    setIsReportModalOpen(true);
  };

  const handleSendReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!reportSummary.trim()) {
      toastError('Ringkasan laporan tidak boleh kosong.');
      return;
    }

    setIsSubmittingReport(true);
    try {
      const inspectionIds = Array.from(
        new Set(defectiveItems.map(d => d.inspectionId).filter(Boolean))
      );

      const goodAssets = assets.filter(a => a.status === 'good').length;
      const needsRepairAssets = assets.filter(a => a.status === 'needs_repair').length;
      const brokenAssets = assets.filter(a => a.status === 'broken').length;

      await reportService.createReport({
        title: reportTitle,
        period: reportPeriod,
        inspectionIds,
        createdBy: user.uid,
        createdByName: user.name,
        summary: reportSummary,
        recommendations: reportRecommendations,
        goodCount: goodAssets,
        needsRepairCount: needsRepairAssets,
        brokenCount: brokenAssets,
        totalAssetsCount: assets.length,
      });

      toastSuccess('Laporan berhasil dikirimkan kepada SPV untuk disetujui.');
      setIsReportModalOpen(false);
    } catch (err: any) {
      toastError(err?.message || 'Gagal mengirim laporan.');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Tindak Lanjut Maintenance
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Atur proses perbaikan, catat tindakan pemeliharaan, dan buat laporan untuk Ketua Sarpras.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAddFollowUp}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold shadow-xs transition active:scale-95 shrink-0"
          >
            <Plus size={15} />
            <span>Tambah Tindak Lanjut</span>
          </button>

          <button
            onClick={handleOpenReportModal}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs sm:text-sm font-bold shadow-md transition active:scale-95 shrink-0"
          >
            <FileText size={15} />
            <span>Susun Laporan ke Ketua</span>
          </button>
        </div>
      </div>

      {/* Daftar Tindak Lanjut dari Temuan Ceklis */}
      <div className="space-y-3">
        <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <Wrench size={16} className="text-amber-700" />
          <span>Tindak Lanjut dari Hasil Ceklis ({defectiveItems.length})</span>
        </h2>

        {defectiveItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center text-slate-500 text-xs sm:text-sm">
            <CheckCheck size={32} className="mx-auto text-emerald-500 mb-1" />
            <div className="font-bold text-slate-800">Semua sarana prasarana dalam kondisi baik</div>
            <p className="text-xs text-slate-400">Tidak ada butir ceklis yang perlu perbaikan.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {defectiveItems.map(item => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3 hover:border-amber-400 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded-md">
                        {item.inspection?.assetCode}
                      </span>
                      <StatusBadge status={item.result} size="sm" />
                      {item.followUpStatus && (
                        <StatusBadge status={item.followUpStatus} size="sm" />
                      )}
                    </div>
                    <h3 className="font-bold text-base text-slate-900 mt-1">
                      {item.inspection?.assetName} — {item.question}
                    </h3>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {item.inspection?.assetLocation} • Dilaporkan oleh: {item.inspection?.obName}
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenQuickUpdate(item)}
                    className="self-start sm:self-center flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition active:scale-95"
                  >
                    <Wrench size={14} />
                    <span>Update Status</span>
                  </button>
                </div>

                {/* OB's Inspection Note */}
                {item.note && (
                  <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="font-semibold text-slate-900">Catatan Temuan OB:</span> {item.note}
                  </div>
                )}

                {/* PJ's Follow-up Note */}
                {item.followUpNote && (
                  <div className="text-xs text-blue-950 bg-blue-50/70 p-2.5 rounded-xl border border-blue-200">
                    <span className="font-semibold text-blue-900">Catatan Tindak Lanjut PJ:</span>{' '}
                    {item.followUpNote}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Catatan Tindak Lanjut Tambahan / Manual */}
      {customFollowUps.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-slate-200">
          <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Clock size={16} className="text-blue-900" />
            <span>Pekerjaan Pemeliharaan Lainnya ({customFollowUps.length})</span>
          </h2>

          <div className="space-y-3">
            {customFollowUps.map(fu => (
              <div
                key={fu.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between gap-3 hover:border-amber-400 transition"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-slate-900">{fu.assetName}</h3>
                    <StatusBadge status={fu.status} size="sm" />
                  </div>
                  <p className="text-xs text-slate-700">
                    <strong>Masalah:</strong> {fu.issueDescription}
                  </p>
                  {fu.followUpNote && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <strong>Tindakan:</strong> {fu.followUpNote}
                    </p>
                  )}
                  <div className="text-[11px] text-slate-400">
                    PJ: {fu.pjName} • Tanggal: {fu.followUpDate}
                  </div>
                </div>

                <div className="flex sm:flex-col justify-end items-end gap-1.5 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                  <button
                    onClick={() => handleOpenEditFollowUp(fu)}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-amber-800 hover:bg-amber-50 border border-slate-200 transition"
                    title="Edit tindak lanjut"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => handleOpenDeleteFollowUp(fu)}
                    className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 transition"
                    title="Hapus tindak lanjut"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Quick Update Status Tindak Lanjut */}
      <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        title="Update Tindak Lanjut Maintenance"
        maxWidth="md"
      >
        {selectedItem && (
          <div className="space-y-4">
            <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
              <div>
                Sarana: <strong>{selectedItem.inspection?.assetName}</strong> (
                {selectedItem.inspection?.assetCode})
              </div>
              <div>
                Butir: <strong>{selectedItem.question}</strong>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Pilih Status Pengerjaan Maintenance
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setNewStatus('waiting')}
                  className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition ${newStatus === 'waiting'
                      ? 'bg-orange-500 text-white border-orange-500 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                >
                  Menunggu
                </button>
                <button
                  type="button"
                  onClick={() => setNewStatus('in_progress')}
                  className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition ${newStatus === 'in_progress'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                >
                  Diproses
                </button>
                <button
                  type="button"
                  onClick={() => setNewStatus('done')}
                  className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition ${newStatus === 'done'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                >
                  Selesai
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Catatan Tindak Lanjut / Tindakan Perbaikan
              </label>
              <textarea
                rows={3}
                value={followUpNote}
                onChange={e => setFollowUpNote(e.target.value)}
                placeholder="Contoh: Telah dilakukan perbaikan kabel dan unit berfungsi normal kembali..."
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsUpdateModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveQuickUpdate}
                disabled={isUpdating}
                className="px-5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs sm:text-sm font-bold shadow-md transition disabled:opacity-50"
              >
                {isUpdating ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Create / Edit FollowUp */}
      <FollowUpModal
        isOpen={isFollowUpModalOpen}
        onClose={() => setIsFollowUpModalOpen(false)}
        followUpToEdit={followUpToEdit}
        onSuccess={loadAllData}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDeleteFollowUp}
        message="Apakah Anda yakin ingin menghapus data ini?"
        itemName={followUpToDelete?.assetName}
        isLoading={isDeleting}
      />

      {/* Modal Susun Laporan untuk Ketua Sarpras */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title="Susun Laporan untuk Ketua Sarpras"
        maxWidth="lg"
      >
        <form onSubmit={handleSendReport} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Judul Laporan
            </label>
            <input
              type="text"
              required
              value={reportTitle}
              onChange={e => setReportTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Periode Laporan
            </label>
            <input
              type="text"
              required
              value={reportPeriod}
              onChange={e => setReportPeriod(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ringkasan Kondisi & Pemeliharaan
            </label>
            <textarea
              rows={4}
              required
              value={reportSummary}
              onChange={e => setReportSummary(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Rekomendasi Tindak Lanjut / Anggaran
            </label>
            <textarea
              rows={3}
              value={reportRecommendations}
              onChange={e => setReportRecommendations(e.target.value)}
              placeholder="Usulan penggantian aset, pengadaan cadangan, dsb..."
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsReportModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmittingReport}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs sm:text-sm font-bold shadow-md transition disabled:opacity-50"
            >
              <Send size={15} />
              <span>{isSubmittingReport ? 'Mengirim...' : 'Kirim ke Ketua Sarpras'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
