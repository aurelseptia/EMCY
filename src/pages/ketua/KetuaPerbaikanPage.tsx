import React, { useState, useEffect } from 'react';
import { inspectionService } from '../../services/inspectionService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ConfirmDeleteModal } from '../../components/crud/ConfirmDeleteModal';
import { useToast } from '../../hooks/useToast';
import type { InspectionResult, Inspection } from '../../types';
import { Activity, Wrench, CheckCheck, Clock, MapPin, Trash2 } from 'lucide-react';

export const KetuaPerbaikanPage: React.FC = () => {
  const { success: toastSuccess, error: toastError } = useToast();

  const [items, setItems] = useState<
    Array<InspectionResult & { inspection?: Inspection }>
  >([]);
  const [filter, setFilter] = useState<'all' | 'waiting' | 'in_progress' | 'done'>('all');
  const [loading, setLoading] = useState(true);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<(InspectionResult & { inspection?: Inspection }) | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const data = await inspectionService.getDefectiveItems();
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDelete = (item: InspectionResult & { inspection?: Inspection }) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      // Hapus status follow-up atau item
      await inspectionService.updateFollowUp(itemToDelete.id, 'done', 'Dihapus/Diselesaikan oleh Kepala Sarpras');
      toastSuccess('Data status perbaikan berhasil diperbarui.');
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      await loadItems();
    } catch (err: any) {
      toastError(err?.message || 'Gagal menghapus data.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = items.filter(item => {
    if (filter === 'waiting') return item.followUpStatus === 'waiting';
    if (filter === 'in_progress') return item.followUpStatus === 'in_progress';
    if (filter === 'done') return item.followUpStatus === 'done';
    return true;
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Status Perbaikan Sarpras
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Pantau progres tindak lanjut pemeliharaan sarana prasarana yang sedang berlangsung.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-200/70 p-1 rounded-xl text-xs font-bold text-slate-600">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-2 rounded-lg transition ${
            filter === 'all' ? 'bg-white text-purple-900 shadow-xs' : 'hover:text-slate-900'
          }`}
        >
          Semua ({items.length})
        </button>
        <button
          onClick={() => setFilter('in_progress')}
          className={`flex-1 py-2 rounded-lg transition ${
            filter === 'in_progress' ? 'bg-white text-blue-900 shadow-xs' : 'hover:text-slate-900'
          }`}
        >
          Diproses ({items.filter(i => i.followUpStatus === 'in_progress').length})
        </button>
        <button
          onClick={() => setFilter('waiting')}
          className={`flex-1 py-2 rounded-lg transition ${
            filter === 'waiting' ? 'bg-white text-orange-900 shadow-xs' : 'hover:text-slate-900'
          }`}
        >
          Menunggu ({items.filter(i => i.followUpStatus === 'waiting').length})
        </button>
        <button
          onClick={() => setFilter('done')}
          className={`flex-1 py-2 rounded-lg transition ${
            filter === 'done' ? 'bg-white text-emerald-900 shadow-xs' : 'hover:text-slate-900'
          }`}
        >
          Selesai ({items.filter(i => i.followUpStatus === 'done').length})
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
          <Activity size={36} className="mx-auto text-slate-300 mb-2" />
          <div className="font-bold text-slate-800">Tidak ada data pada status ini</div>
          <p className="text-xs text-slate-400">Tidak ada riwayat perbaikan yang sesuai filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-2.5"
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
                  <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                    <MapPin size={13} className="text-slate-400" />
                    <span>{item.inspection?.assetLocation}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  {item.photoUrl && (
                    <img
                      src={item.photoUrl}
                      alt="Bukti"
                      className="w-16 h-16 object-cover rounded-xl border border-slate-200 shrink-0"
                    />
                  )}
                  <button
                    onClick={() => handleOpenDelete(item)}
                    className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl border border-slate-200 transition"
                    title="Hapus / Selesaikan tindak lanjut"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {item.followUpNote && (
                <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-900">Catatan Pemeliharaan PJ:</span>{' '}
                  {item.followUpNote}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        message="Apakah Anda yakin ingin menghapus data ini?"
        itemName={itemToDelete?.question}
        isLoading={isDeleting}
      />
    </div>
  );
};
