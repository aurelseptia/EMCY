import React, { useState, useEffect } from 'react';
import { assetService } from '../../services/assetService';
import { TemplateModal } from '../../components/crud/TemplateModal';
import { ConfirmDeleteModal } from '../../components/crud/ConfirmDeleteModal';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../hooks/useToast';
import type { ChecklistTemplate, ChecklistItem } from '../../types';
import {
  Plus,
  Edit2,
  Trash2,
  ListChecks,
  Eye,
  Calendar,
  CheckCircle2,
  Layers,
} from 'lucide-react';

export const PJTemplatePage: React.FC = () => {
  const { success: toastSuccess, error: toastError } = useToast();

  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
  const [templateItemsMap, setTemplateItemsMap] = useState<Record<string, ChecklistItem[]>>({});
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [templateToEdit, setTemplateToEdit] = useState<ChecklistTemplate | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<ChecklistTemplate | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [selectedTemplateDetail, setSelectedTemplateDetail] = useState<ChecklistTemplate | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const data = await assetService.getAllTemplates();
      setTemplates(data);

      const itemsMap: Record<string, ChecklistItem[]> = {};
      for (const tpl of data) {
        itemsMap[tpl.id] = await assetService.getItemsByTemplateId(tpl.id);
      }
      setTemplateItemsMap(itemsMap);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setTemplateToEdit(null);
    setIsTemplateModalOpen(true);
  };

  const handleOpenEdit = (template: ChecklistTemplate) => {
    setTemplateToEdit(template);
    setIsTemplateModalOpen(true);
  };

  const handleOpenDelete = (template: ChecklistTemplate) => {
    setTemplateToDelete(template);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!templateToDelete) return;
    setIsDeleting(true);
    try {
      await assetService.deleteTemplate(templateToDelete.id);
      toastSuccess(`Template ceklis "${templateToDelete.name}" berhasil dihapus.`);
      setIsDeleteModalOpen(false);
      setTemplateToDelete(null);
      await loadTemplates();
    } catch (err: any) {
      toastError(err?.message || 'Gagal menghapus template ceklis.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenDetail = (template: ChecklistTemplate) => {
    setSelectedTemplateDetail(template);
    setIsDetailModalOpen(true);
  };

  const frequencyLabels: Record<string, string> = {
    daily: 'Harian',
    weekly: 'Mingguan',
    monthly: 'Bulanan',
  };

  return (
    <div className="space-y-4">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Kelola Template Ceklis
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Buat dan atur format lembar ceklis pemeriksaan digital untuk petugas OB.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs sm:text-sm font-bold shadow-md transition active:scale-95 shrink-0"
        >
          <Plus size={16} />
          <span>Buat Template Ceklis</span>
        </button>
      </div>

      {/* Templates List */}
      {templates.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
          <ListChecks size={36} className="mx-auto text-slate-300 mb-2" />
          <div className="font-bold text-slate-700">Belum ada template ceklis</div>
          <p className="text-xs text-slate-400">Tekan tombol 'Buat Template Ceklis' untuk menambahkan lembar pemeriksaan baru.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {templates.map(tpl => {
            const items = templateItemsMap[tpl.id] || [];

            return (
              <div
                key={tpl.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between hover:border-amber-400 transition"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded-md">
                      Kategori {tpl.assetCategory}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {frequencyLabels[tpl.frequency] || tpl.frequency}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900">{tpl.name}</h3>

                  <div className="mt-2 text-xs text-slate-600 flex items-center gap-1.5 font-medium">
                    <ListChecks size={14} className="text-amber-700" />
                    <span>{items.length} Butir Pertanyaan Ceklis</span>
                  </div>

                  {/* Preview Items */}
                  <div className="mt-2.5 space-y-1">
                    {items.slice(0, 3).map((item, idx) => (
                      <div key={item.id} className="text-xs text-slate-500 flex items-center gap-1.5 truncate">
                        <span className="text-slate-400 text-[10px]">{idx + 1}.</span>
                        <span className="truncate">{item.question}</span>
                      </div>
                    ))}
                    {items.length > 3 && (
                      <div className="text-[11px] text-amber-700 font-semibold pl-3">
                        + {items.length - 3} butir lainnya
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => handleOpenDetail(tpl)}
                    className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
                  >
                    <Eye size={14} />
                    <span>Lihat Butir</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(tpl)}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-amber-800 hover:bg-amber-50 transition"
                      title="Edit template"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => handleOpenDelete(tpl)}
                      className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition"
                      title="Hapus template"
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

      {/* Create / Edit Modal */}
      <TemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        templateToEdit={templateToEdit}
        onSuccess={loadTemplates}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        message="Apakah Anda yakin ingin menghapus data ini?"
        itemName={templateToDelete?.name}
        isLoading={isDeleting}
      />

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Detail Template Ceklis"
        maxWidth="md"
      >
        {selectedTemplateDetail && (
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Nama Template:</span>
                <span className="font-bold text-slate-900">{selectedTemplateDetail.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Kategori:</span>
                <span className="text-slate-800 font-medium">{selectedTemplateDetail.assetCategory}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Frekuensi:</span>
                <span className="text-slate-800">{frequencyLabels[selectedTemplateDetail.frequency]}</span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-sm text-slate-900 mb-2">
                Daftar Butir Ceklis ({templateItemsMap[selectedTemplateDetail.id]?.length || 0}):
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {(templateItemsMap[selectedTemplateDetail.id] || []).map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-white text-xs"
                  >
                    <span className="text-slate-900 font-medium">
                      {idx + 1}. {item.question}
                    </span>
                    {item.isRequired && (
                      <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                        Wajib
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setIsDetailModalOpen(false);
                  handleOpenEdit(selectedTemplateDetail);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold transition"
              >
                <Edit2 size={14} />
                <span>Edit Template Ini</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
