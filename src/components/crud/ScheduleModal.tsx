import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useToast } from '../../hooks/useToast';
import { assetService } from '../../services/assetService';
import type {
  InspectionSchedule,
  Asset,
  ChecklistTemplate,
  User,
  ScheduleStatus,
  FrequencyType,
} from '../../types';
import { Calendar, Save, Loader2 } from 'lucide-react';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  scheduleToEdit?: InspectionSchedule | null;
  onSuccess: () => void;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  scheduleToEdit,
  onSuccess,
}) => {
  const { success: toastSuccess, error: toastError } = useToast();

  const [assets, setAssets] = useState<Asset[]>([]);
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
  const [obUsers, setObUsers] = useState<User[]>([]);

  const [assetId, setAssetId] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [frequency, setFrequency] = useState<FrequencyType>('daily');
  const [status, setStatus] = useState<ScheduleStatus>('pending');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadOptions();
  }, [isOpen]);

  const loadOptions = async () => {
    try {
      const [allAssets, allTemplates, allObs] = await Promise.all([
        assetService.getAllAssets(),
        assetService.getAllTemplates(),
        assetService.getOBUsers(),
      ]);
      setAssets(allAssets);
      setTemplates(allTemplates);
      setObUsers(allObs);

      if (scheduleToEdit) {
        setAssetId(scheduleToEdit.assetId);
        setTemplateId(scheduleToEdit.templateId);
        setAssignedTo(scheduleToEdit.assignedTo || '');
        setDueDate(scheduleToEdit.dueDate);
        setFrequency(scheduleToEdit.frequency);
        setStatus(scheduleToEdit.status);
      } else {
        setAssetId(allAssets[0]?.id || '');
        setTemplateId(allTemplates[0]?.id || '');
        setAssignedTo(allObs[0]?.uid || '');
        setDueDate(new Date().toISOString().split('T')[0]);
        setFrequency('daily');
        setStatus('pending');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!assetId) {
      toastError('Silakan pilih sarana prasarana.');
      return;
    }
    if (!templateId) {
      toastError('Silakan pilih template ceklis.');
      return;
    }
    if (!dueDate) {
      toastError('Tanggal jatuh tempo wajib diisi.');
      return;
    }

    const assignedUser = obUsers.find(u => u.uid === assignedTo);

    setIsLoading(true);
    try {
      if (scheduleToEdit) {
        await assetService.updateSchedule(scheduleToEdit.id, {
          assetId,
          templateId,
          assignedTo: assignedTo || undefined,
          assignedToName: assignedUser?.name,
          dueDate,
          frequency,
          status,
        });
        toastSuccess('Jadwal pemeriksaan berhasil diperbarui.');
      } else {
        await assetService.createSchedule({
          assetId,
          templateId,
          assignedTo: assignedTo || undefined,
          assignedToName: assignedUser?.name,
          dueDate,
          frequency,
          status,
        });
        toastSuccess('Jadwal pemeriksaan baru berhasil dibuat.');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toastError(err?.message || 'Gagal menyimpan jadwal pemeriksaan.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={scheduleToEdit ? 'Edit Jadwal Pemeriksaan' : 'Buat Jadwal Pemeriksaan Baru'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Pilih Sarana Prasarana */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Sarana Prasarana <span className="text-rose-500">*</span>
          </label>
          <select
            required
            value={assetId}
            onChange={e => setAssetId(e.target.value)}
            className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-900 bg-white"
          >
            {assets.map(a => (
              <option key={a.id} value={a.id}>
                [{a.code}] {a.name} — {a.location}
              </option>
            ))}
          </select>
        </div>

        {/* Pilih Template Ceklis */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Template Ceklis <span className="text-rose-500">*</span>
          </label>
          <select
            required
            value={templateId}
            onChange={e => setTemplateId(e.target.value)}
            className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-900 bg-white"
          >
            {templates.map(t => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.frequency})
              </option>
            ))}
          </select>
        </div>

        {/* Petugas OB yang Ditugaskan */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Tugaskan Kepada Petugas OB
          </label>
          <select
            value={assignedTo}
            onChange={e => setAssignedTo(e.target.value)}
            className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-900 bg-white"
          >
            <option value="">Semua Petugas OB (Bebas diambil)</option>
            {obUsers.map(u => (
              <option key={u.uid} value={u.uid}>
                {u.name} ({u.email})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Tanggal Jatuh Tempo */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tanggal Jatuh Tempo <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-900 bg-white"
            />
          </div>

          {/* Frekuensi */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Frekuensi
            </label>
            <select
              value={frequency}
              onChange={e => setFrequency(e.target.value as FrequencyType)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-900 bg-white"
            >
              <option value="daily">Harian</option>
              <option value="weekly">Mingguan</option>
              <option value="monthly">Bulanan</option>
            </select>
          </div>
        </div>

        {/* Status Jadwal */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Status Jadwal
          </label>
          <select
            value={status}
            onChange={e => setStatus(e.target.value as ScheduleStatus)}
            className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-900 bg-white"
          >
            <option value="pending">Menunggu (Pending)</option>
            <option value="in_progress">Sedang Berjalan (In Progress)</option>
            <option value="completed">Selesai (Completed)</option>
            <option value="late">Terlambat (Late)</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-100 transition disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs sm:text-sm font-bold shadow-md transition disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Simpan Jadwal</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
