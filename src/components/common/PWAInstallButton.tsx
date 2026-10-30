import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Download, Share2, PlusSquare, X } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // Jika sudah terinstall standalone, sembunyikan tombol
  if (isInstalled) {
    return null;
  }

  // Tampilan untuk browser Android / Desktop Chromium
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-medium shadow-sm transition active:scale-95"
      >
        <Download size={15} />
        <span>Install Aplikasi</span>
      </button>
    );
  }

  // Tampilan untuk Safari iOS
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-800 hover:bg-blue-700 text-white text-xs font-medium transition"
        >
          <Download size={14} />
          <span>Install di iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl text-gray-900 animate-in fade-in zoom-in-95">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold text-gray-900">Pasang EMCY di iPhone / iPad</h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-full text-gray-400 hover:bg-gray-100"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0 mt-0.5">
                    <Share2 size={18} />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">1. Tekan tombol Bagikan (Share)</span> di bilah bawah browser Safari.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg shrink-0 mt-0.5">
                    <PlusSquare size={18} />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">2. Pilih 'Tambah ke Layar Utama'</span> (Add to Home Screen).
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-blue-900 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 transition"
              >
                Mengerti
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
