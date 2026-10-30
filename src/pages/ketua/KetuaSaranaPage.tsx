import React, { useState, useEffect } from 'react';
import { assetService } from '../../services/assetService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ConfirmDeleteModal } from '../../components/crud/ConfirmDeleteModal';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../hooks/useToast';
import type { Asset } from '../../types';
import { Search, MapPin, Eye, Trash2, Box } from 'lucide-react';

export const KetuaSaranaPage: React.FC = () => {
  const { success: toastSuccess, error: toastError } = useToast();

  const [assets, setAssets] = useState<Asset[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [loading, setLoading] = useState(true);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleOpenDelete = (asset: Asset) => {
    setAssetToDelete(asset);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!assetToDelete) return;
    setIsDeleting(true);
    try {
      await assetService.deleteAsset(assetToDelete.id);
      toastSuccess(`Sarana prasarana "${assetToDelete.name}" berhasil dihapus.`);
      setIsDeleteModalOpen(false);
      setAssetToDelete(null);
      await loadAssets();
    } catch (err: any) {
      toastError(err?.message || 'Gagal menghapus sarana prasarana.');
    } finally {
      setIsDeleting(false);
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
          Data Sarana & Prasarana Sekolah
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Monitoring seluruh inventaris fasilitas sekolah dan pengelolaan data sarpras.
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari kode aset, nama fasilitas, atau lokasi ruangan..."
          className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-900"
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
                ? 'bg-purple-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Assets Grid */}
      {filteredAssets.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
          <Box size={36} className="mx-auto text-slate-300 mb-2" />
          <div className="font-bold text-slate-700">Tidak ada data sarana prasarana</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredAssets.map(asset => (
            <div
              key={asset.id}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between hover:border-purple-300 transition"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded-md">
                    {asset.code}
                  </span>
                  <StatusBadge status={asset.status} size="sm" />
                </div>
                <h3 className="font-bold text-base text-slate-900">{asset.name}</h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                  <MapPin size={13} className="text-slate-400 shrink-0" />
                  <span className="truncate">{asset.location}</span>
                  <span>•</span>
                  <span>Kategori {asset.category}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleOpenDetail(asset)}
                  className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  <Eye size={14} />
                  <span>Detail</span>
                </button>

                <button
                  onClick={() => handleOpenDelete(asset)}
                  className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition"
                  title="Hapus aset jika diperlukan"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        message="Apakah Anda yakin ingin menghapus data ini?"
        itemName={assetToDelete?.name}
        isLoading={isDeleting}
      />

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Detail Sarana Prasarana"
        maxWidth="md"
      >
        {selectedAssetDetail && (
          <div className="space-y-4">
            {selectedAssetDetail.photoUrl && (
              <img
                src={selectedAssetDetail.photoUrl}
                alt={selectedAssetDetail.name}
                className="w-full h-48 object-cover rounded-xl border border-slate-200"
              />
            )}

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Kode Aset:</span>
                <span className="font-bold text-slate-900">{selectedAssetDetail.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Nama Fasilitas:</span>
                <span className="font-bold text-slate-900">{selectedAssetDetail.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Kategori:</span>
                <span className="text-slate-800 font-medium">{selectedAssetDetail.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Lokasi:</span>
                <span className="text-slate-800">{selectedAssetDetail.location}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Status Kondisi:</span>
                <StatusBadge status={selectedAssetDetail.status} size="sm" />
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
