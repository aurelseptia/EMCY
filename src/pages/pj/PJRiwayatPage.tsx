import React, { useState, useEffect } from 'react';
import { inspectionService } from '../../services/inspectionService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import type { Inspection, InspectionResult } from '../../types';
import { History, Eye, Calendar, User, MapPin } from 'lucide-react';

export const PJRiwayatPage: React.FC = () => {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);
  const [inspectionResults, setInspectionResults] = useState<InspectionResult[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await inspectionService.getAllInspections();
      setInspections(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = async (insp: Inspection) => {
    setSelectedInspection(insp);
    try {
      const detail = await inspectionService.getInspectionById(insp.id);
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
          Riwayat Pemeriksaan & Maintenance
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Semua catatan historis pemeriksaan sarpras yang masuk ke sistem.
        </p>
      </div>

      {inspections.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
          <History size={36} className="mx-auto text-slate-300 mb-2" />
          <div className="font-bold text-slate-800">Belum ada riwayat</div>
        </div>
      ) : (
        <div className="space-y-3">
          {inspections.map(insp => (
            <div
              key={insp.id}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded-md">
                      {insp.assetCode}
                    </span>
                    <StatusBadge status={insp.overallStatus} size="sm" />
                    <StatusBadge status={insp.status} size="sm" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900 mt-1">
                    {insp.assetName}
                  </h3>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Petugas: {insp.obName} • Lokasi: {insp.assetLocation}
                  </div>
                </div>

                <button
                  onClick={() => handleOpenDetail(insp)}
                  className="flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800 transition"
                >
                  <Eye size={14} />
                  <span>Detail</span>
                </button>
              </div>

              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                Waktu: {new Date(insp.createdAt).toLocaleString('id-ID')}
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Modal Detail */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Detail Pemeriksaan"
        maxWidth="lg"
      >
        {selectedInspection && (
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs sm:text-sm space-y-1">
              <div>Sarana: <strong>{selectedInspection.assetName}</strong> ({selectedInspection.assetCode})</div>
              <div>Lokasi: {selectedInspection.assetLocation}</div>
              <div>Petugas OB: {selectedInspection.obName}</div>
              <div className="flex items-center gap-2">
                <span>Kondisi Keseluruhan:</span>
                <StatusBadge status={selectedInspection.overallStatus} size="sm" />
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-sm text-slate-900">Rincian Butir Ceklis:</h4>
              {inspectionResults.map((r, i) => (
                <div key={r.id} className="p-3 rounded-xl border border-slate-200 bg-white space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-900">{i + 1}. {r.question}</span>
                    <StatusBadge status={r.result} size="sm" />
                  </div>
                  {r.note && <div className="text-slate-600">Catatan: {r.note}</div>}
                  {r.photoUrl && (
                    <img src={r.photoUrl} alt="Foto Bukti" className="w-full max-h-48 object-cover rounded-lg mt-1" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};