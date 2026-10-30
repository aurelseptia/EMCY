import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { PhotoCapture } from '../checklist/PhotoCapture';
import { useToast } from '../../hooks/useToast';
import { assetService } from '../../services/assetService';
import type { Asset, AssetStatus } from '../../types';
import { Loader2, Save, Box } from 'lucide-react';

interface AssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetToEdit?: Asset | null;
  onSuccess: () => void;
}

export const AssetModal: React.FC<AssetModalProps> = ({
  isOpen,
  onClose,
  assetToEdit,
  onSuccess,
}) => {
  const { success: toastSuccess, error: toastError } = useToast();

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Bangku/Meja');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState<AssetStatus>('good');
  const [notes, setNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (assetToEdit) {
      setCode(assetToEdit.code);
      setName(assetToEdit.name);
      setCategory(assetToEdit.category);
      setLocation(assetToEdit.location);
      setStatus(assetToEdit.status);
      setNotes(assetToEdit.notes || '');
      setPhotoUrl(assetToEdit.photoUrl);
    } else {
      // Default reset
      setCode('');
      setName('');
      setCategory('Bangku/Meja');
      setLocation('');
      setStatus('good');
      setNotes('');
      setPhotoUrl(undefined);
    }
  }, [assetToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim()) {
      toastError('Kode aset tidak boleh kosong.');
      return;
    }
    if (!name.trim()) {
      toastError('Nama sarana prasarana tidak boleh kosong.');
      return;
    }
    if (!location.trim()) {
      toastError('Lokasi tidak boleh kosong.');
      return;
    }

    setIsLoading(true);
    try {
      if (assetToEdit) {
        await assetService.updateAsset(assetToEdit.id, {
          code: code.trim().toUpperCase(),
          name: name.trim(),
          category,
          location: location.trim(),
          status,
          notes: notes.trim(),
          photoUrl,
        });
        toastSuccess(`Data sarana prasarana "${name}" berhasil diperbarui.`);
      } else {
        await assetService.createAsset({
          code: code.trim().toUpperCase(),
          name: name.trim(),
          category,
          location: location.trim(),
          status,
          notes: notes.trim(),
          photoUrl,
        });
        toastSuccess(`Sarana prasarana baru "${name}" berhasil ditambahkan.`);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toastError(err?.message || 'Gagal menyimpan data sarana prasarana.');
    } finally {
      setIsLoading(false);
    }
  };

  const categories = ['Bangku/Meja', 'Elektronik', 'Transportasi', 'Fasilitas Lainnya'];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={assetToEdit ? 'Edit Sarana Prasarana' : 'Tambah Sarana Prasarana Baru'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Kode & Kategori */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Kode Aset <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="Contoh: BNK-003, ELK-005"
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Kategori Fasilitas <span className="text-rose-500">*</span>
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-900 bg-white"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Nama Aset */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Nama Sarana Prasarana <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Contoh: Meja Siswa Kelas 2A, Proyektor Lab IPA"
            className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-900"
          />
        </div>

        {/* Lokasi */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Lokasi Penempatan <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="Contoh: Ruang Kelas 2 Lantai 1, Gedung B"
            className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-900"
          />
        </div>

        {/* Status Kondisi */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Status Kondisi
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setStatus('good')}
              className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition ${
                status === 'good'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              Baik
            </button>
            <button
              type="button"
              onClick={() => setStatus('needs_repair')}
              className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition ${
                status === 'needs_repair'
                  ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              Perlu Perbaikan
            </button>
            <button
              type="button"
              onClick={() => setStatus('broken')}
              className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition ${
                status === 'broken'
                  ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              Rusak
            </button>
          </div>
        </div>

        {/* Catatan */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Catatan Tambahan (Opsional)
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Keterangan spesifikasi, merk, tahun pengadaan, dsb..."
            className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-900"
          />
        </div>

        {/* Lampirkan Foto Aset */}
        <PhotoCapture
          photoUrl={photoUrl}
          onPhotoSelected={setPhotoUrl}
          label="Foto Sarana Prasarana (Opsional)"
        />

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
                <span>Simpan Sarana</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
