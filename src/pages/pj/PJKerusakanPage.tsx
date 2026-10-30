import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { inspectionService } from '../../services/inspectionService';
import { StatusBadge } from '../../components/common/StatusBadge';
import type { InspectionResult, Inspection } from '../../types';
import {
  AlertTriangle,
  XCircle,
  Wrench,
  MapPin,
  Calendar,
  Eye,
  Filter,
} from 'lucide-react';

export const PJKerusakanPage: React.FC = () => {
  const navigate = useNavigate();
  const [defectiveItems, setDefectiveItems] = useState<
    Array<InspectionResult & { inspection?: Inspection }>
  >([]);
  const [filter, setFilter] = useState<'all' | 'needs_repair' | 'broken'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDefectiveItems();
  }, []);

  const loadDefectiveItems = async () => {
    try {
      const data = await inspectionService.getDefectiveItems();
      setDefectiveItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = defectiveItems.filter(item => {
    if (filter === 'needs_repair') return item.result === 'needs_repair';
    if (filter === 'broken') return item.result === 'broken';
    return true;
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Daftar Kerusakan & Perlu Perbaikan
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Inventarisir butir fasilitas sekolah yang mengalami penurunan fungsi atau kerusakan.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-slate-200/70 p-1 rounded-xl text-xs font-bold text-slate-600">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-2 rounded-lg transition ${
            filter === 'all'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'hover:text-slate-900'
          }`}
        >
          Semua ({defectiveItems.length})
        </button>
        <button
          onClick={() => setFilter('needs_repair')}
          className={`flex-1 py-2 rounded-lg transition ${
            filter === 'needs_repair'
              ? 'bg-white text-amber-900 shadow-xs'
              : 'hover:text-slate-900'
          }`}
        >
          Perlu Perbaikan ({defectiveItems.filter(d => d.result === 'needs_repair').length})
        </button>
        <button
          onClick={() => setFilter('broken')}
          className={`flex-1 py-2 rounded-lg transition ${
            filter === 'broken'
              ? 'bg-white text-rose-900 shadow-xs'
              : 'hover:text-slate-900'
          }`}
        >
          Rusak ({defectiveItems.filter(d => d.result === 'broken').length})
        </button>
      </div>

      {/* Items List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
          <AlertTriangle size={36} className="mx-auto text-emerald-500 mb-2" />
          <div className="font-bold text-slate-800">Tidak ada data kerusakan aktif</div>
          <p className="text-xs text-slate-400">
            Kondisi sarana prasarana sekolah saat ini dalam keadaan baik dan terpelihara.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-amber-400 transition flex flex-col sm:flex-row gap-4 justify-between"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded-md">
                    {item.inspection?.assetCode || 'ASET'}
                  </span>
                  <StatusBadge status={item.result} size="sm" />
                  {item.followUpStatus && (
                    <StatusBadge status={item.followUpStatus} size="sm" />
                  )}
                </div>

                <h3 className="font-bold text-base text-slate-900">
                  {item.inspection?.assetName} — {item.question}
                </h3>

                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <MapPin size={13} className="text-slate-400" />
                  <span>{item.inspection?.assetLocation || 'Lokasi Sekolah'}</span>
                  <span>•</span>
                  <span>OB: {item.inspection?.obName}</span>
                </div>

                {item.note && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                    <strong className="text-slate-900">Catatan Kondisi:</strong> {item.note}
                  </div>
                )}
              </div>

              {/* Photo & Action */}
              <div className="shrink-0 flex flex-col justify-between items-end gap-3 sm:w-44">
                {item.photoUrl ? (
                  <img
                    src={item.photoUrl}
                    alt="Foto Kerusakan"
                    className="w-full h-28 object-cover rounded-xl border border-slate-200 shadow-xs"
                  />
                ) : (
                  <div className="w-full h-28 bg-slate-100 rounded-xl border border-dashed border-slate-300 flex items-center justify-center text-xs text-slate-400 text-center p-2">
                    Tidak ada foto lampiran
                  </div>
                )}

                <button
                  onClick={() => navigate('/pj/tindak-lanjut')}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold transition active:scale-95 shadow-xs"
                >
                  <Wrench size={13} />
                  <span>Tindak Lanjuti</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
