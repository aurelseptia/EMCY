import React, { useState, useEffect } from 'react';
import { inspectionService } from '../../services/inspectionService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ConfirmDeleteModal } from '../../components/crud/ConfirmDeleteModal';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../hooks/useToast';
import type { Inspection, InspectionResult } from '../../types';
import { History, Eye, Trash2, Calendar, User, MapPin } from 'lucide-react';

export const KetuaRiwayatPage: React.FC = () => {
  const { success: toastSuccess, error: toastError } = useToast();

  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);
  const [inspectionResults, setInspectionResults] = useState<InspectionResult[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [inspectionToDelete, setInspectionToDelete] = useState<Inspection | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInspections();
  }, []);

  const loadInspections = async () => {
    try {
      const data = await inspectionService.getAllInspections();
      setInspections(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = async (insp: Inspection) => {
    setSelectedInspection(insp);
    try {
      const detail = await inspectionService.getInspectionById(insp.id);
      setInspectionResults(detail.results);
      setIsModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenDelete = (insp: Inspection) => {
    setInspectionToDelete(insp);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!inspectionToDelete) return;
    setIsDeleting(true);
    try {
      await inspectionService.deleteInspection(inspectionToDelete.id);
      toastSuccess(`Data pemeriksaan "${inspectionToDelete.assetName}" berhasil dihapus.`);
      setIsDeleteModalOpen(false);
      setInspectionToDelete(null);
      await loadInspections();
    } catch (err: any) {
      toastError(err?.message || 'Gagal menghapus hasil pemeriksaan.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Seluruh Arsip Pemeriksaan
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Monitoring seluruh hasil ceklis yang telah diisi oleh petugas OB dan diverifikasi PJ Sarpras.
        </p>
      </div>

      {inspections.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
          <History size={36} className="mx-auto text-slate-300 mb-2" />
          <div className="font-bold text-slate-800">Belum ada riwayat pemeriksaan</div>
        </div>
      ) : (
        <div className="space-y-3">
          {inspections.map(insp => (
            <div
              key={insp.id}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between hover:border-purple-300 transition"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded-md">
                      {insp.assetCode}
                    </span>
                    <StatusBadge status={insp.overallStatus} size="sm" />
                    <StatusBadge status={insp.status} size="sm" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900 mt-1">
                    {insp.assetName}
                  </h3>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Petugas OB: <strong>{insp.obName}</strong> • Lokasi: {insp.assetLocation}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleOpenDetail(insp)}
                    className="flex items-center gap-1 text-xs font-bold text-purple-900 hover:text-purple-700 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200 transition"
                  >
                    <Eye size={14} />
                    <span>Detail</span>
                  </button>

                  <button
                    onClick={() => handleOpenDelete(insp)}
                    className="p-1.5 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 transition"
                    title="Hapus data pemeriksaan ini"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                Waktu Periksa: {new Date(insp.createdAt).toLocaleString('id-ID')}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Detail Pemeriksaan Lengkap"
        maxWidth="lg"
      >
        {selectedInspection && (
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs sm:text-sm space-y-1">
              <div>Sarana: <strong>{selectedInspection.assetName}</strong> ({selectedInspection.assetCode})</div>
              <div>Lokasi: {selectedInspection.assetLocation}</div>
              <div>Petugas OB: {selectedInspection.obName}</div>
              <div className="flex items-center gap-2">
                <span>Kondisi Keseluruhan:</span>
                <StatusBadge status={selectedInspection.overallStatus} size="sm" />
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-sm text-slate-900">Rincian Butir Ceklis:</h4>
              {inspectionResults.map((r, i) => (
                <div key={r.id} className="p-3 rounded-xl border border-slate-200 bg-white space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-900">{i + 1}. {r.question}</span>
                    <StatusBadge status={r.result} size="sm" />
                  </div>
                  {r.note && <div className="text-slate-600">Catatan: {r.note}</div>}
                  {r.photoUrl && (
                    <img src={r.photoUrl} alt="Foto Bukti" className="w-full max-h-48 object-cover rounded-lg mt-1" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        message="Apakah Anda yakin ingin menghapus data ini?"
        itemName={inspectionToDelete?.assetName}
        isLoading={isDeleting}
      />
    </div>
  );
};
