import React, { useRef } from 'react';
import { Camera, Image as ImageIcon, Trash2 } from 'lucide-react';

interface PhotoCaptureProps {
  photoUrl?: string;
  onPhotoSelected: (base64Url: string | undefined) => void;
  label?: string;
}

export const PhotoCapture: React.FC<PhotoCaptureProps> = ({
  photoUrl,
  onPhotoSelected,
  label = 'Lampirkan Foto Bukti (Kamera/Galeri)',
}) => {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Kompresi dan convert ke Base64 via canvas
    const reader = new FileReader();
    reader.onload = event => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1000;
        const MAX_HEIGHT = 1000;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.75);
          onPhotoSelected(compressedDataUrl);
        }
      };
      if (typeof event.target?.result === 'string') {
        img.src = event.target.result;
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2 mt-2">
      <div className="text-xs font-semibold text-slate-700 flex items-center justify-between">
        <span>{label}</span>
        {photoUrl && (
          <span className="text-[11px] text-emerald-600 font-medium">Foto siap diunggah</span>
        )}
      </div>

      {photoUrl ? (
        <div className="relative rounded-xl overflow-hidden border border-slate-300 bg-slate-100 group">
          <img
            src={photoUrl}
            alt="Bukti Pemeriksaan"
            className="w-full h-44 object-cover object-center"
          />
          <button
            type="button"
            onClick={() => onPhotoSelected(undefined)}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-600 text-white shadow-md hover:bg-rose-700 transition"
            title="Hapus Foto"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {/* Kamera Langsung */}
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl border border-dashed border-blue-400 bg-blue-50/50 hover:bg-blue-100/50 text-blue-900 text-xs sm:text-sm font-semibold transition active:scale-95"
          >
            <Camera size={18} className="text-blue-700" />
            <span>Buka Kamera</span>
          </button>

          {/* Pilih dari Galeri */}
          <button
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-semibold transition active:scale-95"
          >
            <ImageIcon size={18} className="text-slate-600" />
            <span>Pilih Galeri</span>
          </button>

          {/* Hidden file inputs */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
};
