import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { assetService } from '../../services/assetService';
import { inspectionService } from '../../services/inspectionService';
import { syncService, type SyncStatusType } from '../../services/syncService';
import { PhotoCapture } from '../../components/checklist/PhotoCapture';
import { StatusBadge } from '../../components/common/StatusBadge';
import type {
  Asset,
  ChecklistTemplate,
  ChecklistItem,
  ItemResultStatus,
} from '../../types';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Save,
  Send,
  MapPin,
  Sparkles,
  CloudCheck,
  RefreshCw,
  Info,
} from 'lucide-react';

interface ItemAnswer {
  checklistItemId: string;
  question: string;
  result: ItemResultStatus;
  note?: string;
  photoUrl?: string;
}

export const OBChecklistPage: React.FC = () => {
  const { assetId } = useParams<{ assetId: string }>();
  const [searchParams] = useSearchParams();
  const scheduleId = searchParams.get('scheduleId') || undefined;
  const navigate = useNavigate();

  const { user } = useAuth();
  const { success: toastSuccess, error: toastError, warning: toastWarning } = useToast();

  const [asset, setAsset] = useState<Asset | null>(null);
  const [template, setTemplate] = useState<ChecklistTemplate | null>(null);
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [answers, setAnswers] = useState<Record<string, ItemAnswer>>({});
  const [inspectionId, setInspectionId] = useState<string>('');
  const [generalNotes, setGeneralNotes] = useState('');
  const [syncStatus, setSyncStatus] = useState<SyncStatusType>('Tersinkron');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Auto-save debounce timer ref
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadData();
    const unsubscribeSync = syncService.subscribe(setSyncStatus);
    return () => {
      unsubscribeSync();
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [assetId, user]);

  const loadData = async () => {
    if (!assetId || !user) return;
    try {
      const assetData = await assetService.getAssetById(assetId);
      if (!assetData) {
        toastError('Data sarana prasarana tidak ditemukan.');
        navigate('/ob/pemeriksaan');
        return;
      }
      setAsset(assetData);

      // Cari template berdasarkan kategori aset
      let tpl = await assetService.getTemplateByCategory(assetData.category);
      if (!tpl) {
        const allTpl = await assetService.getAllTemplates();
        tpl = allTpl[0];
      }
      setTemplate(tpl);

      if (tpl) {
        const checklistItems = await assetService.getItemsByTemplateId(tpl.id);
        setItems(checklistItems);

        // Cek apakah ada draft tersimpan sebelumnya di IndexedDB
        const activeDraft = await inspectionService.getActiveDraft(assetId, user.uid);
        if (activeDraft.inspection) {
          setInspectionId(activeDraft.inspection.id);
          setGeneralNotes(activeDraft.inspection.notes || '');

          const existingAnswers: Record<string, ItemAnswer> = {};
          activeDraft.results.forEach(res => {
            existingAnswers[res.checklistItemId] = {
              checklistItemId: res.checklistItemId,
              question: res.question,
              result: res.result,
              note: res.note,
              photoUrl: res.photoUrl,
            };
          });
          setAnswers(existingAnswers);
          toastSuccess('Melanjutkan draft pemeriksaan yang tersimpan.');
        } else {
          setInspectionId('insp_' + Date.now());
        }
      }
    } catch (err) {
      console.error(err);
      toastError('Gagal memuat form ceklis.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-save trigger
  const triggerAutoSave = (updatedAnswers: Record<string, ItemAnswer>, notes: string) => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(async () => {
      if (!asset || !template || !user) return;
      try {
        setIsDraftSaving(true);
        await inspectionService.saveDraft({
          inspectionId: inspectionId || 'insp_' + Date.now(),
          scheduleId,
          assetId: asset.id,
          obId: user.uid,
          obName: user.name,
          templateId: template.id,
          notes,
          items: Object.values(updatedAnswers),
        });
        setSyncStatus('Tersimpan lokal');
      } catch (err) {
        console.error('Auto save failed', err);
      } finally {
        setIsDraftSaving(false);
      }
    }, 800); // Debounce 800ms
  };

  const handleSelectResult = (item: ChecklistItem, result: ItemResultStatus) => {
    const updated: Record<string, ItemAnswer> = {
      ...answers,
      [item.id]: {
        checklistItemId: item.id,
        question: item.question,
        result,
        note: answers[item.id]?.note || '',
        photoUrl: answers[item.id]?.photoUrl,
      },
    };
    setAnswers(updated);
    triggerAutoSave(updated, generalNotes);
  };

  const handleUpdateNote = (itemId: string, note: string) => {
    if (!answers[itemId]) return;
    const updated = {
      ...answers,
      [itemId]: { ...answers[itemId], note },
    };
    setAnswers(updated);
    triggerAutoSave(updated, generalNotes);
  };

  const handleUpdatePhoto = (itemId: string, photoUrl: string | undefined) => {
    if (!answers[itemId]) return;
    const updated = {
      ...answers,
      [itemId]: { ...answers[itemId], photoUrl },
    };
    setAnswers(updated);
    triggerAutoSave(updated, generalNotes);
  };

  const handleManualSaveDraft = async () => {
    if (!asset || !template || !user) return;
    setIsDraftSaving(true);
    try {
      await inspectionService.saveDraft({
        inspectionId: inspectionId || 'insp_' + Date.now(),
        scheduleId,
        assetId: asset.id,
        obId: user.uid,
        obName: user.name,
        templateId: template.id,
        notes: generalNotes,
        items: Object.values(answers),
      });
      toastSuccess('Draft berhasil disimpan di perangkat.');
      setSyncStatus('Tersimpan lokal');
    } catch (err) {
      toastError('Gagal menyimpan draft.');
    } finally {
      setIsDraftSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!asset || !template || !user) return;

    // 1. Validasi bahwa semua item yang required telah dijawab
    const missingRequired = items.filter(
      item => item.isRequired && !answers[item.id]
    );

    if (missingRequired.length > 0) {
      toastWarning(
        `Masih ada ${missingRequired.length} item wajib yang belum diperiksa: "${missingRequired[0].question}"`
      );
      return;
    }

    // 2. Validasi bahwa item "needs_repair" atau "broken" wajib melampirkan catatan atau foto
    for (const item of items) {
      const ans = answers[item.id];
      if (ans && (ans.result === 'needs_repair' || ans.result === 'broken')) {
        if (!ans.note?.trim()) {
          toastWarning(
            `Mohon isi catatan kerusakan untuk item: "${item.question}".`
          );
          return;
        }
      }
    }

    setIsSubmitting(true);
    try {
      await inspectionService.submitInspection({
        inspectionId: inspectionId || 'insp_' + Date.now(),
        scheduleId,
        assetId: asset.id,
        obId: user.uid,
        obName: user.name,
        templateId: template.id,
        notes: generalNotes,
        items: Object.values(answers),
      });

      toastSuccess('Hasil pemeriksaan berhasil dikirim ke Penanggung Jawab Sarpras!');
      navigate('/ob/riwayat', { replace: true });
    } catch (err: any) {
      toastError(err?.message || 'Gagal mengirim hasil pemeriksaan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Progress Bar Calculation
  const answeredCount = items.filter(item => !!answers[item.id]).length;
  const totalCount = items.length;
  const progressPercent = totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0;

  if (loading) {
    return (
      <div className="py-12 text-center text-slate-500">
        <RefreshCw size={28} className="animate-spin mx-auto text-blue-900 mb-2" />
        <p className="text-sm">Menyiapkan form ceklis...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {/* Top Header & Back Button */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-xl border border-slate-200 transition"
        >
          <ArrowLeft size={16} />
          <span>Kembali</span>
        </button>

        {/* Sync Status Badge */}
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-xs">
          <span
            className={`w-2 h-2 rounded-full ${
              syncStatus === 'Tersinkron'
                ? 'bg-emerald-500'
                : syncStatus === 'Mengunggah'
                ? 'bg-blue-500 animate-ping'
                : 'bg-amber-500'
            }`}
          />
          <span>{isDraftSaving ? 'Menyimpan draft...' : syncStatus}</span>
        </div>
      </div>

      {/* Target Asset Information Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-md">
            {template?.name || 'Ceklis Sarpras'}
          </span>
          <StatusBadge status={asset?.status || 'good'} size="sm" />
        </div>

        <h1 className="text-xl font-black text-slate-900 tracking-tight">
          {asset?.name}
        </h1>

        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-1">
          <span className="font-semibold text-slate-800">{asset?.code}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <MapPin size={13} className="text-slate-400" />
            {asset?.location}
          </span>
          <span>•</span>
          <span>Kategori {asset?.category}</span>
        </div>

        {/* Progress Bar */}
        <div className="pt-3 border-t border-slate-100">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="font-semibold text-slate-700">Kemajuan Ceklis</span>
            <span className="font-bold text-blue-900">
              {answeredCount} dari {totalCount} item selesai ({progressPercent}%)
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-blue-900 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Checklist Items List */}
      <div className="space-y-4">
        {items.map((item, index) => {
          const currentAnswer = answers[item.id];
          const selectedResult = currentAnswer?.result;

          return (
            <div
              key={item.id}
              className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all ${
                selectedResult
                  ? 'border-slate-300 shadow-xs'
                  : 'border-slate-200 ring-1 ring-slate-100'
              }`}
            >
              {/* Question header */}
              <div className="flex items-start gap-2.5 mb-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-bold shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 leading-snug">
                    {item.question}
                  </h3>
                  {item.isRequired && (
                    <span className="text-[11px] text-rose-500 font-medium">
                      * Wajib diperiksa
                    </span>
                  )}
                </div>
              </div>

              {/* 3 Large Tactile Buttons */}
              <div className="grid grid-cols-3 gap-2">
                {/* 1. Tombol BAIK (Hijau) */}
                <button
                  type="button"
                  onClick={() => handleSelectResult(item, 'pass')}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-3 px-2 rounded-xl font-bold text-xs sm:text-sm border transition active:scale-95 ${
                    selectedResult === 'pass'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-300'
                      : 'bg-emerald-50/60 hover:bg-emerald-100/70 text-emerald-800 border-emerald-200'
                  }`}
                >
                  <CheckCircle2 size={18} />
                  <span>Baik</span>
                </button>

                {/* 2. Tombol PERLU PERBAIKAN (Kuning/Amber) */}
                <button
                  type="button"
                  onClick={() => handleSelectResult(item, 'needs_repair')}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-3 px-2 rounded-xl font-bold text-xs sm:text-sm border transition active:scale-95 ${
                    selectedResult === 'needs_repair'
                      ? 'bg-amber-500 text-white border-amber-500 shadow-md ring-2 ring-amber-300'
                      : 'bg-amber-50/60 hover:bg-amber-100/70 text-amber-900 border-amber-200'
                  }`}
                >
                  <AlertTriangle size={18} />
                  <span>Perlu Perbaikan</span>
                </button>

                {/* 3. Tombol RUSAK (Merah) */}
                <button
                  type="button"
                  onClick={() => handleSelectResult(item, 'broken')}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-3 px-2 rounded-xl font-bold text-xs sm:text-sm border transition active:scale-95 ${
                    selectedResult === 'broken'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-md ring-2 ring-rose-300'
                      : 'bg-rose-50/60 hover:bg-rose-100/70 text-rose-800 border-rose-200'
                  }`}
                >
                  <XCircle size={18} />
                  <span>Rusak</span>
                </button>
              </div>

              {/* Dynamic Expansion for Needs Repair / Broken */}
              {(selectedResult === 'needs_repair' || selectedResult === 'broken') && (
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-3 animate-in fade-in slide-in-from-top-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Catatan Kondisi / Kerusakan <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      value={currentAnswer?.note || ''}
                      onChange={e => handleUpdateNote(item.id, e.target.value)}
                      placeholder="Jelaskan bagian mana yang rusak atau butuh perbaikan..."
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-800"
                    />
                  </div>

                  {/* Photo Capture from Camera or Gallery */}
                  <PhotoCapture
                    photoUrl={currentAnswer?.photoUrl}
                    onPhotoSelected={photo => handleUpdatePhoto(item.id, photo)}
                    label="Foto Bukti Kerusakan (Kamera / Galeri)"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* General Notes */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
        <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1">
          Catatan Tambahan Pemeriksaan (Opsional)
        </label>
        <textarea
          rows={2}
          value={generalNotes}
          onChange={e => {
            setGeneralNotes(e.target.value);
            triggerAutoSave(answers, e.target.value);
          }}
          placeholder="Catatan umum mengenai ruangan atau fasilitas terkait..."
          className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-800"
        />
      </div>

      {/* Action Buttons: Simpan Draft & Kirim Hasil */}
      <div className="sticky bottom-16 sm:bottom-0 z-20 bg-white/90 backdrop-blur-md p-3 rounded-2xl border border-slate-200 shadow-xl grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={handleManualSaveDraft}
          disabled={isDraftSaving}
          className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold transition active:scale-95 disabled:opacity-50"
        >
          <Save size={16} />
          <span>{isDraftSaving ? 'Menyimpan...' : 'Simpan Draft'}</span>
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs sm:text-sm font-bold shadow-md transition active:scale-95 disabled:opacity-50"
        >
          <Send size={16} />
          <span>{isSubmitting ? 'Mengirim...' : 'Kirim Hasil'}</span>
        </button>
      </div>
    </div>
  );
};
