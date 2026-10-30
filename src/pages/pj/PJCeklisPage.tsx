import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { inspectionService } from '../../services/inspectionService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import type { Inspection, InspectionResult } from '../../types';
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  Calendar,
  User,
  Eye,
  CheckCheck,
  AlertTriangle,
  MapPin,
} from 'lucide-react';

export const PJCeklisPage: React.FC = () => {
  const { user } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [filter, setFilter] = useState<'all' | 'submitted' | 'verified'>('submitted');
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);
  const [inspectionResults, setInspectionResults] = useState<InspectionResult[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInspections();
  }, []);

  const loadInspections = async () => {
    try {
      const data = await inspectionService.getAllInspections();
      setInspections(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = async (inspection: Inspection) => {
    setSelectedInspection(inspection);
    try {
      const detail = await inspectionService.getInspectionById(inspection.id);
      setInspectionResults(detail.results);
      setIsModalOpen(true);
    } catch (err) {
      console.error(err);
      toastError('Gagal memuat detail hasil pemeriksaan.');
    }
  };

  const handleVerify = async (inspectionId: string) => {
    if (!user) return;
    setIsVerifying(true);
    try {
      await inspectionService.verifyInspection(inspectionId, user.uid, user.name);
      toastSuccess('Pemeriksaan berhasil diverifikasi.');
      setIsModalOpen(false);
      await loadInspections();
    } catch (err: any) {
      toastError(err?.message || 'Gagal memverifikasi.');
    } finally {
      setIsVerifying(false);
    }
  };

  const filtered = inspections.filter(i => {
    if (filter === 'submitted') return i.status === 'submitted';
    if (filter === 'verified') return i.status === 'verified';
    return true;
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Verifikasi Hasil Ceklis OB
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Periksa dan verifikasi laporan kondisi sarana prasarana yang diinput oleh OB.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-slate-200/70 p-1 rounded-xl text-xs font-bold text-slate-600">
        <button
          onClick={() => setFilter('submitted')}
          className={`flex-1 py-2 rounded-lg transition ${
            filter === 'submitted'
              ? 'bg-white text-amber-900 shadow-xs'
              : 'hover:text-slate-900'
          }`}
        >
          Belum Diverifikasi ({inspections.filter(i => i.status === 'submitted').length})
        </button>
        <button
          onClick={() => setFilter('verified')}
          className={`flex-1 py-2 rounded-lg transition ${
            filter === 'verified'
              ? 'bg-white text-emerald-900 shadow-xs'
              : 'hover:text-slate-900'
          }`}
        >
          Sudah Diverifikasi ({inspections.filter(i => i.status === 'verified').length})
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-2 rounded-lg transition ${
            filter === 'all'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'hover:text-slate-900'
          }`}
        >
          Semua ({inspections.length})
        </button>
      </div>

      {/* List Inspections */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
          <CheckCheck size={36} className="mx-auto text-emerald-500 mb-2" />
          <div className="font-bold text-slate-800">Tidak ada data ceklis pada filter ini</div>
          <p className="text-xs text-slate-400">
            {filter === 'submitted'
              ? 'Semua kiriman ceklis OB telah diverifikasi.'
              : 'Belum ada data pemeriksaan ceklis.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(insp => (
            <div
              key={insp.id}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between hover:border-amber-400 transition"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded-md">
                      {insp.assetCode}
                    </span>
                    <StatusBadge status={insp.overallStatus} size="sm" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900 mt-1 truncate">
                    {insp.assetName}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      <User size={13} className="text-slate-400" />
                      OB: {insp.obName}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin size={13} className="text-slate-400" />
                      {insp.assetLocation}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 flex flex-col items-end gap-1">
                  {insp.status === 'verified' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <CheckCheck size={13} />
                      Terverifikasi
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                      <Clock size={13} />
                      Menunggu Verifikasi
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar size={13} className="text-slate-400" />
                  {new Date(insp.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>

                <button
                  onClick={() => handleOpenDetail(insp)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold transition active:scale-95"
                >
                  <Eye size={14} />
                  <span>{insp.status === 'submitted' ? 'Tinjau & Verifikasi' : 'Lihat Detail'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Detail & Action Verifikasi */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tinjauan Ceklis Pemeriksaan"
        maxWidth="lg"
      >
        {selectedInspection && (
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Sarana:</span>
                <span className="font-bold text-slate-900">
                  {selectedInspection.assetName} ({selectedInspection.assetCode})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Petugas OB:</span>
                <span className="font-semibold text-slate-800">{selectedInspection.obName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Lokasi:</span>
                <span className="text-slate-800">{selectedInspection.assetLocation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status Keseluruhan:</span>
                <StatusBadge status={selectedInspection.overallStatus} size="sm" />
              </div>
              {selectedInspection.notes && (
                <div className="pt-2 border-t border-slate-200 text-xs text-slate-600">
                  <strong>Catatan OB:</strong> {selectedInspection.notes}
                </div>
              )}
            </div>

            {/* List Butir */}
            <div>
              <h4 className="font-bold text-sm text-slate-900 mb-2">
                Rincian Butir Ceklis ({inspectionResults.length} Butir):
              </h4>
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {inspectionResults.map((res, idx) => (
                  <div
                    key={res.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-xs sm:text-sm text-slate-900">
                        {idx + 1}. {res.question}
                      </span>
                      <StatusBadge status={res.result} size="sm" />
                    </div>

                    {res.note && (
                      <p className="text-xs text-slate-700 bg-amber-50/60 p-2 rounded-lg border border-amber-200">
                        <strong>Catatan Kerusakan:</strong> {res.note}
                      </p>
                    )}

                    {res.photoUrl && (
                      <div>
                        <span className="text-[11px] font-bold text-slate-500">Foto Bukti Kerusakan:</span>
                        <img
                          src={res.photoUrl}
                          alt="Foto Bukti"
                          className="mt-1 w-full max-h-52 object-cover rounded-xl border border-slate-200"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Tombol Verifikasi */}
            {selectedInspection.status === 'submitted' && (
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => handleVerify(selectedInspection.id)}
                  disabled={isVerifying}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md transition disabled:opacity-50"
                >
                  <CheckCheck size={16} />
                  <span>{isVerifying ? 'Memverifikasi...' : 'Verifikasi Hasil Pemeriksaan'}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
