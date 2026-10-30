import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { inspectionService } from '../../services/inspectionService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import type { Inspection, InspectionResult } from '../../types';
import {
  History,
  Clock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  FileCheck2,
  Edit2,
} from 'lucide-react';

export const OBRiwayatPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);
  const [inspectionResults, setInspectionResults] = useState<InspectionResult[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadInspections();
    }
  }, [user]);

  const loadInspections = async () => {
    if (!user) return;
    try {
      const data = await inspectionService.getInspectionsByOB(user.uid);
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
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Riwayat Pemeriksaan
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Catatan hasil ceklis pemeriksaan yang telah Anda lakukan.
        </p>
      </div>

      {inspections.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
          <History size={36} className="mx-auto text-slate-300 mb-2" />
          <div className="font-bold text-slate-700">Belum ada riwayat pemeriksaan</div>
          <p className="text-xs text-slate-400">
            Hasil pemeriksaan yang Anda kirimkan akan muncul di halaman ini.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {inspections.map(insp => (
            <div
              key={insp.id}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="text-[11px] font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded-md">
                    {insp.assetCode || 'KODE'}
                  </span>
                  <h3 className="font-bold text-base text-slate-900 mt-1">
                    {insp.assetName || 'Sarana Sekolah'}
                  </h3>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {insp.assetLocation} • {insp.templateName}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  <StatusBadge status={insp.overallStatus} size="sm" />
                  <span className="text-[11px] font-semibold text-slate-500">
                    {insp.status === 'verified'
                      ? 'Terverifikasi PJ'
                      : insp.status === 'submitted'
                      ? 'Terkirim ke PJ'
                      : 'Draft'}
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar size={13} className="text-slate-400" />
                  {new Date(insp.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>

                <div className="flex items-center gap-2">
                  {insp.status === 'draft' && (
                    <button
                      onClick={() => navigate(`/ob/ceklis/${insp.assetId}`)}
                      className="flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 transition"
                    >
                      <Edit2 size={13} />
                      <span>Lanjut Edit Draft</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleOpenDetail(insp)}
                    className="flex items-center gap-1 font-bold text-blue-900 hover:text-blue-700 transition"
                  >
                    <Eye size={14} />
                    <span>Lihat Detail</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Detail Pemeriksaan */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Detail Hasil Pemeriksaan Ceklis"
        maxWidth="lg"
      >
        {selectedInspection && (
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Sarana:</span>
                <span className="font-bold text-slate-900">
                  {selectedInspection.assetName} ({selectedInspection.assetCode})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Lokasi:</span>
                <span className="font-medium text-slate-800">{selectedInspection.assetLocation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status Keseluruhan:</span>
                <StatusBadge status={selectedInspection.overallStatus} size="sm" />
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tanggal Periksa:</span>
                <span className="text-slate-700">
                  {new Date(selectedInspection.createdAt).toLocaleString('id-ID')}
                </span>
              </div>
              {selectedInspection.notes && (
                <div className="pt-2 border-t border-slate-200 text-xs text-slate-600">
                  <strong>Catatan Umum:</strong> {selectedInspection.notes}
                </div>
              )}
            </div>

            {/* Daftar Butir Ceklis & Hasil */}
            <div>
              <h4 className="font-bold text-sm text-slate-900 mb-2">Hasil Butir Pemeriksaan:</h4>
              <div className="space-y-3">
                {inspectionResults.map((res, idx) => (
                  <div
                    key={res.id}
                    className="p-3 rounded-xl border border-slate-200 bg-white space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-xs sm:text-sm text-slate-900">
                        {idx + 1}. {res.question}
                      </span>
                      <StatusBadge status={res.result} size="sm" />
                    </div>

                    {res.note && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <strong>Catatan:</strong> {res.note}
                      </p>
                    )}

                    {res.photoUrl && (
                      <div>
                        <span className="text-[11px] font-bold text-slate-500">Foto Bukti:</span>
                        <img
                          src={res.photoUrl}
                          alt="Bukti Ceklis"
                          className="mt-1 w-full max-h-56 object-cover rounded-lg border border-slate-200"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {selectedInspection.status === 'draft' && (
              <div className="flex justify-end pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    navigate(`/ob/ceklis/${selectedInspection.assetId}`);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-md"
                >
                  <Edit2 size={14} />
                  <span>Lanjutkan Pengisian Draft</span>
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
