import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useToast } from '../../hooks/useToast';
import { assetService } from '../../services/assetService';
import type { ChecklistTemplate, ChecklistItem, FrequencyType } from '../../types';
import { Plus, Trash2, Save, Loader2, ListChecks } from 'lucide-react';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateToEdit?: ChecklistTemplate | null;
  onSuccess: () => void;
}

interface ItemInput {
  question: string;
  isRequired: boolean;
}

export const TemplateModal: React.FC<TemplateModalProps> = ({
  isOpen,
  onClose,
  templateToEdit,
  onSuccess,
}) => {
  const { success: toastSuccess, error: toastError } = useToast();

  const [name, setName] = useState('');
  const [assetCategory, setAssetCategory] = useState('Bangku/Meja');
  const [frequency, setFrequency] = useState<FrequencyType>('daily');
  const [items, setItems] = useState<ItemInput[]>([
    { question: '', isRequired: true },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (templateToEdit) {
      setName(templateToEdit.name);
      setAssetCategory(templateToEdit.assetCategory);
      setFrequency(templateToEdit.frequency);
      loadExistingItems(templateToEdit.id);
    } else {
      setName('');
      setAssetCategory('Bangku/Meja');
      setFrequency('daily');
      setItems([
        { question: '', isRequired: true },
        { question: '', isRequired: true },
      ]);
    }
  }, [templateToEdit, isOpen]);

  const loadExistingItems = async (templateId: string) => {
    try {
      const existingItems = await assetService.getItemsByTemplateId(templateId);
      if (existingItems.length > 0) {
        setItems(
          existingItems.map(i => ({
            question: i.question,
            isRequired: i.isRequired,
          }))
        );
      } else {
        setItems([{ question: '', isRequired: true }]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddItem = () => {
    setItems([...items, { question: '', isRequired: true }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      toastError('Template harus memiliki minimal 1 butir ceklis.');
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, question: string) => {
    const updated = [...items];
    updated[index].question = question;
    setItems(updated);
  };

  const handleToggleRequired = (index: number) => {
    const updated = [...items];
    updated[index].isRequired = !updated[index].isRequired;
    setItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toastError('Nama template ceklis tidak boleh kosong.');
      return;
    }

    const validItems = items.filter(i => i.question.trim().length > 0);
    if (validItems.length === 0) {
      toastError('Mohon isi minimal 1 pertanyaan butir ceklis.');
      return;
    }

    setIsLoading(true);
    try {
      if (templateToEdit) {
        await assetService.updateTemplate(
          templateToEdit.id,
          {
            name: name.trim(),
            assetCategory,
            frequency,
          },
          validItems
        );
        toastSuccess(`Template ceklis "${name}" berhasil diperbarui.`);
      } else {
        await assetService.createTemplate(
          {
            name: name.trim(),
            assetCategory,
            frequency,
            createdBy: 'pj_sarpras',
          },
          validItems
        );
        toastSuccess(`Template ceklis baru "${name}" berhasil dibuat.`);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toastError(err?.message || 'Gagal menyimpan template ceklis.');
    } finally {
      setIsLoading(false);
    }
  };

  const categories = ['Bangku/Meja', 'Elektronik', 'Transportasi', 'Fasilitas Lainnya'];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={templateToEdit ? 'Edit Template Ceklis' : 'Buat Template Ceklis Baru'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Nama Template Ceklis <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Contoh: Ceklis Harian Kebersihan Kelas, Ceklis Mingguan AC"
            className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-900"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Kategori Fasilitas <span className="text-rose-500">*</span>
            </label>
            <select
              value={assetCategory}
              onChange={e => setAssetCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-900 bg-white"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Frekuensi Pemeriksaan <span className="text-rose-500">*</span>
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

        {/* Dynamic Checklist Items */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <ListChecks size={15} className="text-blue-900" />
              <span>Daftar Butir Ceklis ({items.length})</span>
            </label>
            <button
              type="button"
              onClick={handleAddItem}
              className="flex items-center gap-1 text-xs font-bold text-blue-900 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 transition"
            >
              <Plus size={13} />
              <span>Tambah Butir</span>
            </button>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {items.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50/70"
              >
                <span className="w-5 text-center text-xs font-bold text-slate-500 shrink-0">
                  {index + 1}.
                </span>
                <input
                  type="text"
                  required
                  value={item.question}
                  onChange={e => handleItemChange(index, e.target.value)}
                  placeholder={`Pertanyaan ceklis ${index + 1}...`}
                  className="flex-1 px-2.5 py-1.5 text-xs sm:text-sm bg-white rounded-lg border border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-blue-900"
                />
                <label className="flex items-center gap-1 text-[11px] text-slate-600 font-semibold cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={item.isRequired}
                    onChange={() => handleToggleRequired(index)}
                    className="rounded text-blue-900 focus:ring-blue-900"
                  />
                  <span>Wajib</span>
                </label>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md transition shrink-0"
                  title="Hapus butir ini"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
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
                <span>Simpan Template</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
