import React from 'react';
import { Modal } from '../common/Modal';
import { AlertTriangle, Trash2, Loader2 } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  message?: string;
  itemName?: string;
  isLoading?: boolean;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Konfirmasi Penghapusan',
  message = 'Apakah Anda yakin ingin menghapus data ini?',
  itemName,
  isLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800">
          <div className="p-2 bg-rose-100 rounded-lg text-rose-600 shrink-0">
            <AlertTriangle size={22} />
          </div>
          <div className="text-xs sm:text-sm">
            <p className="font-bold">{message}</p>
            {itemName && (
              <p className="text-slate-700 mt-1 font-semibold truncate">"{itemName}"</p>
            )}
            <p className="text-[11px] text-rose-700 mt-1">
              Tindakan ini permanen dan data tidak dapat dikembalikan.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-100 transition disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold shadow-md transition disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Menghapus...</span>
              </>
            ) : (
              <>
                <Trash2 size={15} />
                <span>Hapus Data</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};
