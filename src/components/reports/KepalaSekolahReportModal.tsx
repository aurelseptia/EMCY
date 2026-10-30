import React, { useRef } from 'react';
import { Modal } from '../common/Modal';
import { StatusBadge } from '../common/StatusBadge';
import type { Report, Asset, InspectionResult } from '../../types';
import { Printer, Share2, CheckCheck, FileText, Building2 } from 'lucide-react';
import { reportService } from '../../services/reportService';
import { useToast } from '../../hooks/useToast';

interface KepalaSekolahReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: Report | null;
  assets?: Asset[];
  defectiveItems?: InspectionResult[];
  onReportUpdated?: () => void;
}

export const KepalaSekolahReportModal: React.FC<KepalaSekolahReportModalProps> = ({
  isOpen,
  onClose,
  report,
  assets = [],
  defectiveItems = [],
  onReportUpdated,
}) => {
  const { success: toastSuccess } = useToast();
  const printRef = useRef<HTMLDivElement>(null);

  if (!report) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleForwardToPrincipal = async () => {
    try {
      await reportService.forwardToPrincipal(report.id);
      toastSuccess('Status laporan berhasil diperbarui: Diteruskan ke Kepala Sekolah.');
      onReportUpdated?.();
    } catch (err) {
      console.error(err);
    }
  };

  // Asset breakdown
  const goodAssets = assets.filter(a => a.status === 'good').length;
  const repairAssets = assets.filter(a => a.status === 'needs_repair').length;
  const brokenAssets = assets.filter(a => a.status === 'broken').length;
  const totalAssets = assets.length || 1;

  const healthScore = Math.round((goodAssets / totalAssets) * 100);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Format Laporan Resmi untuk Kepala Sekolah"
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {/* Printable Official Document */}
        <div
          ref={printRef}
          className="bg-white p-6 sm:p-8 rounded-xl border border-slate-300 shadow-sm text-slate-900 font-sans space-y-6 print:m-0 print:p-0 print:border-none"
        >
          {/* Kop Surat Resmi */}
          <div className="border-b-4 border-double border-slate-900 pb-4 text-center space-y-1">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Building2 size={26} className="text-slate-900" />
              <h2 className="text-base sm:text-lg font-black tracking-wide uppercase">
                PEMERINTAH PROVINSI DAERAH KHUSUS
              </h2>
            </div>
            <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-wide">
              DINAS PENDIDIKAN - UNIT MONITORING SARANA PRASARANA
            </h3>
            <p className="text-xs text-slate-600">
              Jalan Pendidikan No. 01, Kompleks Kampus Sekolah • Email: sarpras@sekolah.sch.id
            </p>
          </div>

          {/* Nomor & Perihal */}
          <div className="flex flex-col sm:flex-row justify-between text-xs text-slate-800 gap-2 border-b border-slate-200 pb-3">
            <div>
              <div><strong>Nomor Dokumen:</strong> 421/SARPRAS-EVAL/{new Date().getFullYear()}</div>
              <div><strong>Lampiran:</strong> 1 (Satu) Berkas Rekapitulasi Kondisi</div>
              <div><strong>Perihal:</strong> Laporan Monitoring & Pemeliharaan Sarana Prasarana</div>
            </div>
            <div className="sm:text-right">
              <div>Tanggal Terbit: {new Date(report.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
              <div>Kepada Yth: <strong>Kepala Sekolah</strong></div>
              <div>Tempat</div>
            </div>
          </div>

          {/* Isi Laporan */}
          <div className="space-y-4 text-xs sm:text-sm text-slate-800 leading-relaxed">
            <div>
              <h4 className="font-bold text-slate-900 uppercase text-xs tracking-wider mb-1">
                I. Ringkasan Eksekutif & Kondisi Kelaikan
              </h4>
              <p className="text-slate-700 text-justify">
                {report.summary}
              </p>
            </div>

            {/* Statistik Kelayakan Aset */}
            <div>
              <h4 className="font-bold text-slate-900 uppercase text-xs tracking-wider mb-2">
                II. Rekapitulasi Status Kelaikan Fasilitas
              </h4>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-base font-bold text-slate-900">{totalAssets}</div>
                  <div className="text-[10px] text-slate-500 font-semibold">Total Aset</div>
                </div>
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                  <div className="text-base font-bold text-emerald-800">{goodAssets}</div>
                  <div className="text-[10px] text-emerald-700 font-semibold">Kondisi Baik</div>
                </div>
                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200">
                  <div className="text-base font-bold text-amber-800">{repairAssets}</div>
                  <div className="text-[10px] text-amber-700 font-semibold">Perlu Perbaikan</div>
                </div>
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200">
                  <div className="text-base font-bold text-rose-800">{brokenAssets}</div>
                  <div className="text-[10px] text-rose-700 font-semibold">Rusak</div>
                </div>
              </div>
            </div>

            {/* Rekomendasi untuk Kepala Sekolah */}
            {report.recommendations && (
              <div>
                <h4 className="font-bold text-slate-900 uppercase text-xs tracking-wider mb-1">
                  III. Rekomendasi & Rencana Tindak Lanjut Anggaran
                </h4>
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-slate-800 text-xs text-justify">
                  {report.recommendations}
                </div>
              </div>
            )}

            {/* Tanda Tangan Pengesahan Digital */}
            <div className="pt-6 grid grid-cols-2 text-center text-xs text-slate-800">
              <div>
                <div className="font-medium text-slate-500">Disusun Oleh:</div>
                <div className="font-bold text-slate-900 mt-0.5">Penanggung Jawab Sarpras</div>
                <div className="mt-12 font-bold text-slate-900 underline underline-offset-4">
                  {report.createdByName || 'PJ Sarpras Sekolah'}
                </div>
                <div className="text-[10px] text-slate-500">NIP. 19850412 201001 1 008</div>
              </div>

              <div>
                <div className="font-medium text-slate-500">Disetujui & Diteruskan Oleh:</div>
                <div className="font-bold text-slate-900 mt-0.5">Ketua Sarana Prasarana</div>
                <div className="mt-12 font-bold text-slate-900 underline underline-offset-4">
                  {report.approvedByName || 'Ketua Sarpras Sekolah'}
                </div>
                <div className="text-[10px] text-slate-500">NIP. 19780215 200312 1 002</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200">
          <div className="text-xs text-slate-500">
            {report.forwardedToPrincipalAt ? (
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCheck size={14} />
                Telah Diteruskan ke Kepala Sekolah ({new Date(report.forwardedToPrincipalAt).toLocaleDateString('id-ID')})
              </span>
            ) : (
              <span>Siap dicetak atau diteruskan ke Kepala Sekolah</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!report.forwardedToPrincipalAt && (
              <button
                type="button"
                onClick={handleForwardToPrincipal}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-900 hover:bg-purple-800 text-white text-xs font-bold transition shadow-xs"
              >
                <CheckCheck size={14} />
                <span>Tandai Terkirim ke Kepsek</span>
              </button>
            )}

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs"
            >
              <Printer size={14} />
              <span>Cetak / Ekspor PDF</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
