import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../hooks/useAuth';
import { reportService } from '../../services/reportService';
import { assetService } from '../../services/assetService';
import type { Report } from '../../types';
import { FileText, Save, Loader2, Sparkles } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportToEdit?: Report | null;
  onSuccess: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  reportToEdit,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  const [title, setTitle] = useState('');
  const [period, setPeriod] = useState('');
  const [summary, setSummary] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (reportToEdit) {
      setTitle(reportToEdit.title);
      setPeriod(reportToEdit.period);
      setSummary(reportToEdit.summary);
      setRecommendations(reportToEdit.recommendations || '');
    } else {
      const defaultPeriod = new Date().toLocaleDateString('id-ID', {
        month: 'long',
        year: 'numeric',
      });
      setTitle(`Laporan Rekapitulasi Maintenance Sarpras - ${defaultPeriod}`);
      setPeriod(defaultPeriod);
      setSummary('');
      setRecommendations('');
    }
  }, [reportToEdit, isOpen]);

  const handleGenerateSummary = async () => {
    try {
      const assets = await assetService.getAllAssets();
      const goodCount = assets.filter(a => a.status === 'good').length;
      const needsRepairCount = assets.filter(a => a.status === 'needs_repair').length;
      const brokenCount = assets.filter(a => a.status === 'broken').length;
      const total = assets.length;

      const autoSummary = `Berdasarkan rekapitulasi data pemeriksaan sarana prasarana sekolah periode ${period || 'terbaru'}, tercatat total ${total} unit fasilitas terdaftar dengan rincian: ${goodCount} unit dalam kondisi Baik (${total > 0 ? Math.round((goodCount / total) * 100) : 0}%), ${needsRepairCount} unit Perlu Perbaikan (${total > 0 ? Math.round((needsRepairCount / total) * 100) : 0}%), dan ${brokenCount} unit Rusak (${total > 0 ? Math.round((brokenCount / total) * 100) : 0}%). Seluruh penanganan kerusakan telah ditindaklanjuti untuk mendukung kenyamanan KBM.`;

      setSummary(autoSummary);
      if (!recommendations) {
        setRecommendations(
          needsRepairCount > 0 || brokenCount > 0
            ? 'Disarankan untuk mengalokasikan anggaran perbaikan sarana berkala serta mempercepat penggantian suku cadang yang mengalami aus pemakaian.'
            : 'Pertahankan jadwal pemeliharaan rutin oleh tim OB dan monitoring sarana setiap awal pekan.'
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!title.trim()) {
      toastError('Judul laporan tidak boleh kosong.');
      return;
    }
    if (!period.trim()) {
      toastError('Periode laporan tidak boleh kosong.');
      return;
    }
    if (!summary.trim()) {
      toastError('Ringkasan laporan tidak boleh kosong.');
      return;
    }

    setIsLoading(true);
    try {
      if (reportToEdit) {
        await reportService.updateReport(reportToEdit.id, {
          title: title.trim(),
          period: period.trim(),
          summary: summary.trim(),
          recommendations: recommendations.trim(),
        });
        toastSuccess(`Laporan "${title}" berhasil diperbarui.`);
      } else {
        await reportService.createReport({
          title: title.trim(),
          period: period.trim(),
          inspectionIds: [],
          createdBy: user.uid,
          createdByName: user.name,
          summary: summary.trim(),
          recommendations: recommendations.trim(),
        });
        toastSuccess(`Laporan "${title}" berhasil disusun dan diajukan ke Ketua Sarpras.`);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toastError(err?.message || 'Gagal menyimpan laporan.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={reportToEdit ? 'Edit Laporan Sarana Prasarana' : 'Susun Laporan Baru untuk Ketua Sarpras'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Judul Laporan */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Judul Dokumen Laporan <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Contoh: Laporan Evaluasi Sarpras Semester Genap"
            className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-900"
          />
        </div>

        {/* Periode */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Periode Pemeriksaan <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={period}
            onChange={e => setPeriod(e.target.value)}
            placeholder="Contoh: Oktober 2026, Triwulan IV 2026"
            className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-900"
          />
        </div>

        {/* Ringkasan */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-700">
              Ringkasan Kondisi & Pemeliharaan <span className="text-rose-500">*</span>
            </label>
            <button
              type="button"
              onClick={handleGenerateSummary}
              className="text-[11px] font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 transition"
            >
              <Sparkles size={12} />
              <span>Generate Otomatis</span>
            </button>
          </div>
          <textarea
            rows={4}
            required
            value={summary}
            onChange={e => setSummary(e.target.value)}
            placeholder="Tuliskan ikhtisar kondisi sarpras, perbaikan yang telah dilaksanakan, dan kendala lapangan..."
            className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-900"
          />
        </div>

        {/* Rekomendasi */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Rekomendasi / Usulan Tindak Lanjut
          </label>
          <textarea
            rows={3}
            value={recommendations}
            onChange={e => setRecommendations(e.target.value)}
            placeholder="Usulan pengadaan cadangan, pergantian unit rusak total, atau renovasi fasilitas..."
            className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-900"
          />
        </div>

        <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
          Disusun oleh: <strong>{user?.name}</strong> ({user?.role === 'pj_sarpras' ? 'Penanggung Jawab Sarpras' : 'Ketua Sarpras'})
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
                <span>{reportToEdit ? 'Simpan Perubahan' : 'Ajukan Laporan'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
