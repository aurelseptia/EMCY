import React, { useState, useEffect } from 'react';
import { assetService } from '../../services/assetService';
import { ConfirmDeleteModal } from '../../components/crud/ConfirmDeleteModal';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../hooks/useToast';
import type { ChecklistTemplate, ChecklistItem } from '../../types';
import {
  ListChecks,
  Eye,
  Trash2,
  Calendar,
  CheckCircle2,
  Layers,
} from 'lucide-react';

export const KetuaTemplatePage: React.FC = () => {
  const { success: toastSuccess, error: toastError } = useToast();

  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
  const [templateItemsMap, setTemplateItemsMap] = useState<Record<string, ChecklistItem[]>>({});
  const [loading, setLoading] = useState(true);

  // Modal State for Delete
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<ChecklistTemplate | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Modal State for Detail
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
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Template Ceklis Pemeriksaan
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Monitoring seluruh format instrumen ceklis digital yang diterapkan pada sarpras sekolah.
        </p>
      </div>

      {templates.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
          <ListChecks size={36} className="mx-auto text-slate-300 mb-2" />
          <div className="font-bold text-slate-800">Belum ada template ceklis</div>
          <p className="text-xs text-slate-400">
            Penanggung Jawab Sarpras akan menyusun template butir ceklis baru.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {templates.map(tpl => {
            const items = templateItemsMap[tpl.id] || [];
            return (
              <div
                key={tpl.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-purple-300 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-purple-900 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                      Kategori {tpl.assetCategory}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                      <Calendar size={13} className="text-slate-400" />
                      {frequencyLabels[tpl.frequency] || tpl.frequency}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 mb-1">{tpl.name}</h3>

                  <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-2">
                    <ListChecks size={14} className="text-purple-700" />
                    <span>
                      {items.length} butir pertanyaan ceklis standar
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => handleOpenDetail(tpl)}
                    className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-purple-900 transition"
                  >
                    <Eye size={14} />
                    <span>Lihat Detail Butir</span>
                  </button>

                  <button
                    onClick={() => handleOpenDelete(tpl)}
                    className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 transition"
                    title="Hapus template jika tidak diperlukan"
                  >
                    <Trash2 size={15} />
                  </button>
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
        title="Detail Template Ceklis"
        maxWidth="md"
      >
        {selectedTemplateDetail && (
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Nama Template:</span>
                <span className="font-bold text-slate-900">{selectedTemplateDetail.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Kategori Fasilitas:</span>
                <span className="font-semibold text-slate-800">
                  {selectedTemplateDetail.assetCategory}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Frekuensi:</span>
                <span className="text-slate-800">
                  {frequencyLabels[selectedTemplateDetail.frequency]}
                </span>
              </div>
            </div>

            {/* Daftar Pertanyaan */}
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900 mb-2 flex items-center gap-1.5">
                <ListChecks size={15} className="text-purple-900" />
                <span>
                  Daftar Pertanyaan Ceklis (
                  {(templateItemsMap[selectedTemplateDetail.id] || []).length})
                </span>
              </h4>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {(templateItemsMap[selectedTemplateDetail.id] || []).map((it, idx) => (
                  <div
                    key={it.id}
                    className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800"
                  >
                    <span className="font-bold text-slate-400 w-5 shrink-0">{idx + 1}.</span>
                    <span className="flex-1 font-medium">{it.question}</span>
                    {it.isRequired && (
                      <span className="text-[10px] bg-rose-50 text-rose-600 font-bold px-1.5 py-0.5 rounded shrink-0">
                        Wajib
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
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

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        message="Apakah Anda yakin ingin menghapus data ini?"
        itemName={templateToDelete?.name}
        isLoading={isDeleting}
      />
    </div>
  );
};
