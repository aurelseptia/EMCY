import React, { useState, useEffect } from 'react';
import { assetService } from '../../services/assetService';
import { ScheduleModal } from '../../components/crud/ScheduleModal';
import { ConfirmDeleteModal } from '../../components/crud/ConfirmDeleteModal';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../hooks/useToast';
import type { InspectionSchedule, Asset, ChecklistTemplate } from '../../types';
import {
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
  MapPin,
  ClipboardList,
  Eye,
} from 'lucide-react';

export const PJJadwalPage: React.FC = () => {
  const { success: toastSuccess, error: toastError } = useToast();

  const [schedules, setSchedules] = useState<
    Array<InspectionSchedule & { asset?: Asset; template?: ChecklistTemplate }>
  >([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleToEdit, setScheduleToEdit] = useState<InspectionSchedule | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<InspectionSchedule | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [selectedScheduleDetail, setSelectedScheduleDetail] = useState<
    (InspectionSchedule & { asset?: Asset; template?: ChecklistTemplate }) | null
  >(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

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

  const handleOpenAdd = () => {
    setScheduleToEdit(null);
    setIsScheduleModalOpen(true);
  };

  const handleOpenDetail = (
    schedule: InspectionSchedule & { asset?: Asset; template?: ChecklistTemplate }
  ) => {
    setSelectedScheduleDetail(schedule);
    setIsDetailModalOpen(true);
  };

  const handleOpenEdit = (schedule: InspectionSchedule) => {
    setScheduleToEdit(schedule);
    setIsScheduleModalOpen(true);
  };

  const handleOpenDelete = (schedule: InspectionSchedule) => {
    setScheduleToDelete(schedule);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!scheduleToDelete) return;
    setIsDeleting(true);
    try {
      await assetService.deleteSchedule(scheduleToDelete.id);
      toastSuccess('Jadwal pemeriksaan berhasil dihapus.');
      setIsDeleteModalOpen(false);
      setScheduleToDelete(null);
      await loadSchedules();
    } catch (err: any) {
      toastError(err?.message || 'Gagal menghapus jadwal.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = schedules.filter(s => {
    if (filter === 'pending') return s.status === 'pending';
    if (filter === 'completed') return s.status === 'completed';
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Kelola Jadwal Pemeriksaan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Atur dan jadwalkan inspeksi sarana prasarana sekolah untuk petugas OB.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs sm:text-sm font-bold shadow-md transition active:scale-95 shrink-0"
        >
          <Plus size={16} />
          <span>Buat Jadwal Baru</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-slate-200/70 p-1 rounded-xl text-xs font-bold text-slate-600">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-2 rounded-lg transition ${
            filter === 'all' ? 'bg-white text-amber-900 shadow-xs' : 'hover:text-slate-900'
          }`}
        >
          Semua ({schedules.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`flex-1 py-2 rounded-lg transition ${
            filter === 'pending' ? 'bg-white text-amber-900 shadow-xs' : 'hover:text-slate-900'
          }`}
        >
          Menunggu ({schedules.filter(s => s.status === 'pending').length})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`flex-1 py-2 rounded-lg transition ${
            filter === 'completed' ? 'bg-white text-emerald-900 shadow-xs' : 'hover:text-slate-900'
          }`}
        >
          Selesai ({schedules.filter(s => s.status === 'completed').length})
        </button>
      </div>

      {/* Schedules List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
          <Calendar size={36} className="mx-auto text-slate-300 mb-2" />
          <div className="font-bold text-slate-700">Tidak ada jadwal ditemukan</div>
          <p className="text-xs text-slate-400">Tekan tombol 'Buat Jadwal Baru' untuk menjadwalkan pemeriksaan.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(schedule => {
            const asset = schedule.asset;
            const template = schedule.template;

            return (
              <div
                key={schedule.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between gap-3 hover:border-amber-400 transition"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded-md">
                      {asset?.code || 'KODE'}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                        schedule.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : schedule.status === 'late'
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : 'bg-amber-100 text-amber-900 border-amber-300'
                      }`}
                    >
                      {schedule.status === 'completed'
                        ? 'Selesai'
                        : schedule.status === 'late'
                        ? 'Terlambat'
                        : 'Menunggu'}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900">{asset?.name || 'Aset'}</h3>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin size={13} className="text-slate-400" />
                      {asset?.location}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <ClipboardList size={13} className="text-slate-400" />
                      {template?.name || 'Template'} ({schedule.frequency})
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-1">
                    <span className="flex items-center gap-1 font-medium text-slate-800">
                      <User size={13} className="text-slate-400" />
                      Petugas OB: {schedule.assignedToName || 'Belum ditugaskan'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <Calendar size={13} className="text-slate-400" />
                      Jatuh Tempo: <strong>{schedule.dueDate}</strong>
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="shrink-0 flex sm:flex-col justify-end sm:justify-center items-end gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenDetail(schedule)}
                      className="p-2 rounded-xl text-slate-600 hover:text-amber-800 hover:bg-amber-50 border border-slate-200 transition"
                      title="Lihat detail jadwal"
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(schedule)}
                      className="p-2 rounded-xl text-slate-600 hover:text-amber-800 hover:bg-amber-50 border border-slate-200 transition"
                      title="Edit jadwal"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => handleOpenDelete(schedule)}
                      className="p-2 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 transition"
                      title="Hapus jadwal"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Detail Jadwal Pemeriksaan"
        maxWidth="md"
      >
        {selectedScheduleDetail && (
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Sarana Prasarana:</span>
                <span className="font-bold text-slate-900">
                  {selectedScheduleDetail.asset?.name} ({selectedScheduleDetail.asset?.code})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Lokasi:</span>
                <span className="font-medium text-slate-800">
                  {selectedScheduleDetail.asset?.location || '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Kategori:</span>
                <span className="text-slate-700">{selectedScheduleDetail.asset?.category || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Template Ceklis:</span>
                <span className="font-medium text-slate-800">
                  {selectedScheduleDetail.template?.name || '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Frekuensi:</span>
                <span className="capitalize text-slate-700">
                  {selectedScheduleDetail.frequency === 'daily'
                    ? 'Harian'
                    : selectedScheduleDetail.frequency === 'weekly'
                    ? 'Mingguan'
                    : 'Bulanan'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Petugas OB:</span>
                <span className="font-semibold text-slate-900">
                  {selectedScheduleDetail.assignedToName || 'Semua Petugas OB (Bebas)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tanggal Jatuh Tempo:</span>
                <span className="font-bold text-amber-900">
                  {selectedScheduleDetail.dueDate}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Status:</span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                    selectedScheduleDetail.status === 'completed'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : selectedScheduleDetail.status === 'late'
                      ? 'bg-rose-100 text-rose-800 border-rose-300'
                      : 'bg-amber-100 text-amber-900 border-amber-300'
                  }`}
                >
                  {selectedScheduleDetail.status === 'completed'
                    ? 'Selesai'
                    : selectedScheduleDetail.status === 'late'
                    ? 'Terlambat'
                    : 'Menunggu'}
                </span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Create / Edit Modal */}
      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        scheduleToEdit={scheduleToEdit}
        onSuccess={loadSchedules}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        message="Apakah Anda yakin ingin menghapus data ini?"
        itemName="Jadwal Pemeriksaan Terpilih"
        isLoading={isDeleting}
      />
    </div>
  );
};
