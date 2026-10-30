import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { assetService } from '../../services/assetService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import type { Asset } from '../../types';
import { Search, MapPin, ClipboardCheck, Box, Eye, Calendar, Layers, FileText } from 'lucide-react';

export const OBSaranaPage: React.FC = () => {
  const navigate = useNavigate();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [loading, setLoading] = useState(true);

  // Detail Modal
  const [selectedAssetDetail, setSelectedAssetDetail] = useState<Asset | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    try {
      const data = await assetService.getAllAssets();
      setAssets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = (asset: Asset) => {
    setSelectedAssetDetail(asset);
    setIsDetailModalOpen(true);
  };

  const categories = ['Semua', 'Bangku/Meja', 'Elektronik', 'Transportasi', 'Fasilitas Lainnya'];

  const filteredAssets = assets.filter(asset => {
    const matchesCategory =
      selectedCategory === 'Semua' ||
      asset.category === selectedCategory ||
      (selectedCategory === 'Bangku/Meja' && asset.category === 'Mebel');
    const matchesSearch =
      asset.name.toLowerCase().includes(search.toLowerCase()) ||
      asset.code.toLowerCase().includes(search.toLowerCase()) ||
      asset.location.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Daftar Sarana & Prasarana
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Inventaris aset sekolah yang dipantau kondisinya secara berkala oleh petugas OB.
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari nama, kode aset, atau lokasi ruangan..."
          className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-900"
        />
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar text-xs font-semibold">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition ${
              selectedCategory === cat
                ? 'bg-blue-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Assets List */}
      {filteredAssets.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
          <Box size={36} className="mx-auto text-slate-300 mb-2" />
          <div className="font-bold text-slate-700">Tidak ada sarana prasarana ditemukan</div>
          <p className="text-xs text-slate-400">Coba ubah kata kunci pencarian atau kategori.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredAssets.map(asset => (
            <div
              key={asset.id}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between hover:border-blue-400 transition"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded-md">
                    {asset.code}
                  </span>
                  <StatusBadge status={asset.status} size="sm" />
                </div>
                <h3 className="font-bold text-base text-slate-900">{asset.name}</h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                  <MapPin size={13} className="text-slate-400 shrink-0" />
                  <span className="truncate">{asset.location}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleOpenDetail(asset)}
                  className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-blue-900 transition"
                >
                  <Eye size={14} />
                  <span>Detail</span>
                </button>

                <button
                  onClick={() => navigate(`/ob/ceklis/${asset.id}`)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold shadow-xs transition active:scale-95"
                >
                  <ClipboardCheck size={14} />
                  <span>Periksa Ceklis</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Detail Sarana Prasarana untuk OB */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Detail Sarana Prasarana"
        maxWidth="md"
      >
        {selectedAssetDetail && (
          <div className="space-y-4">
            {selectedAssetDetail.photoUrl && (
              <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                <img
                  src={selectedAssetDetail.photoUrl}
                  alt={selectedAssetDetail.name}
                  className="w-full h-48 object-cover object-center"
                />
              </div>
            )}

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Kode Aset:</span>
                <span className="font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
                  {selectedAssetDetail.code}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Nama Fasilitas:</span>
                <span className="font-bold text-slate-900">{selectedAssetDetail.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Kategori:</span>
                <span className="text-slate-700">{selectedAssetDetail.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Lokasi Penempatan:</span>
                <span className="font-medium text-slate-800">{selectedAssetDetail.location}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Kondisi Terkini:</span>
                <StatusBadge status={selectedAssetDetail.status} size="sm" />
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pemeriksaan Terakhir:</span>
                <span className="text-slate-700">
                  {selectedAssetDetail.lastInspectionAt
                    ? new Date(selectedAssetDetail.lastInspectionAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'Belum pernah'}
                </span>
              </div>
              {selectedAssetDetail.notes && (
                <div className="pt-2 border-t border-slate-200 text-xs text-slate-600">
                  <strong>Catatan:</strong> {selectedAssetDetail.notes}
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition"
              >
                Tutup
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsDetailModalOpen(false);
                  navigate(`/ob/ceklis/${selectedAssetDetail.id}`);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold transition shadow-md"
              >
                <ClipboardCheck size={14} />
                <span>Mulai Ceklis Sekarang</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
