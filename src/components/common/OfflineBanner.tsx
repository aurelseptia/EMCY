import React from 'react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="bg-amber-500 text-slate-950 px-3 py-1.5 text-xs font-semibold flex items-center justify-center gap-2 shadow-sm sticky top-0 z-40 animate-pulse">
      <WifiOff size={14} className="shrink-0" />
      <span>Mode Offline Aktif — Anda tetap bisa mengisi ceklis. Data disimpan di perangkat.</span>
    </div>
  );
};
