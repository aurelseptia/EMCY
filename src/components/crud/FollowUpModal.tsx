import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../hooks/useAuth';
import { assetService } from '../../services/assetService';
import { inspectionService } from '../../services/inspectionService';
import type { MaintenanceFollowUp, Asset, FollowUpStatus } from '../../types';
import { Wrench, Save, Loader2 } from 'lucide-react';

interface FollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  followUpToEdit?: MaintenanceFollowUp | null;
  initialAsset?: Asset | null;
  onSuccess: () => void;
}

export const FollowUpModal: React.FC<FollowUpModalProps> = ({
  isOpen,
  onClose,
  followUpToEdit,
  initialAsset,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  const [assets, setAssets] = useState<Asset[]>([]);
  const [assetId, setAssetId] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [followUpNote, setFollowUpNote] = useState('');
  const [status, setStatus] = useState<FollowUpStatus>('waiting');
  const [followUpDate, setFollowUpDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadAssets();
  }, [isOpen]);

  const loadAssets = async () => {
    try {
      const allAssets = await assetService.getAllAssets();
      setAssets(allAssets);

      if (followUpToEdit) {
        setAssetId(followUpToEdit.assetId);
        setIssueDescription(followUpToEdit.issueDescription);
        setFollowUpNote(followUpToEdit.followUpNote);
        setStatus(followUpToEdit.status);
        setFollowUpDate(followUpToEdit.followUpDate.split('T')[0]);
      } else if (initialAsset) {
        setAssetId(initialAsset.id);
        setIssueDescription(initialAsset.notes || 'Perlu perbaikan pada fasilitas ini.');
        setFollowUpNote('');
        setStatus('waiting');
        setFollowUpDate(new Date().toISOString().split('T')[0]);
      } else {
        setAssetId(allAssets[0]?.id || '');
        setIssueDescription('');
        setFollowUpNote('');
        setStatus('waiting');
        setFollowUpDate(new Date().toISOString().split('T')[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!assetId) {
      toastError('Sarana prasarana wajib dipilih.');
      return;
    }
    if (!issueDescription.trim()) {
      toastError('Deskripsi masalah tidak boleh kosong.');
      return;
    }

    const selectedAsset = assets.find(a => a.id === assetId);

    setIsLoading(true);
    try {
      if (followUpToEdit) {
        await inspectionService.updateFollowUpItem(followUpToEdit.id, {
          assetId,
          assetName: selectedAsset?.name || followUpToEdit.assetName,
          assetLocation: selectedAsset?.location || followUpToEdit.assetLocation,
          issueDescription: issueDescription.trim(),
          followUpNote: followUpNote.trim(),
          status,
          followUpDate,
        });
        toastSuccess('Tindak lanjut pemeliharaan berhasil diperbarui.');
      } else {
        await inspectionService.createFollowUp({
          assetId,
          assetName: selectedAsset?.name || 'Sarana Sekolah',
          assetLocation: selectedAsset?.location,
          issueDescription: issueDescription.trim(),
          followUpNote: followUpNote.trim(),
          status,
          followUpDate,
          pjId: user.uid,
          pjName: user.name,
        });
        toastSuccess('Tindak lanjut pemeliharaan baru berhasil dicatat.');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toastError(err?.message || 'Gagal menyimpan tindak lanjut maintenance.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={followUpToEdit ? 'Edit Tindak Lanjut Pemeliharaan' : 'Catat Tindak Lanjut Maintenance'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Pilih Sarana */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Sarana Prasarana Terkait <span className="text-rose-500">*</span>
          </label>
          <select
            required
            value={assetId}
            onChange={e => setAssetId(e.target.value)}
            className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
          >
            {assets.map(a => (
              <option key={a.id} value={a.id}>
                [{a.code}] {a.name} — {a.location} ({a.status})
              </option>
            ))}
          </select>
        </div>

        {/* Deskripsi Masalah */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Deskripsi Masalah / Kerusakan <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={2}
            required
            value={issueDescription}
            onChange={e => setIssueDescription(e.target.value)}
            placeholder="Jelaskan kendala atau kerusakan yang dialami..."
            className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Catatan Tindak Lanjut */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Catatan Tindakan Pemeliharaan
          </label>
          <textarea
            rows={2}
            value={followUpNote}
            onChange={e => setFollowUpNote(e.target.value)}
            placeholder="Tindakan yang diambil, estimasi penyelesaian, dsb..."
            className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Status & Tanggal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Status Pengerjaan
            </label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as FollowUpStatus)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
            >
              <option value="waiting">Menunggu</option>
              <option value="in_progress">Diproses</option>
              <option value="done">Selesai</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tanggal Tindak Lanjut <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              value={followUpDate}
              onChange={e => setFollowUpDate(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
            />
          </div>
        </div>

        <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
          Penanggung Jawab: <strong>{user?.name}</strong> (PJ Sarpras)
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
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs sm:text-sm font-bold shadow-md transition disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Simpan Tindak Lanjut</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
