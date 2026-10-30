import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Clock, Wrench, CheckCheck } from 'lucide-react';
import type { AssetStatus, ItemResultStatus, FollowUpStatus, InspectionStatus, ReportStatus } from '../../types';

interface StatusBadgeProps {
  status: AssetStatus | ItemResultStatus | FollowUpStatus | InspectionStatus | ReportStatus | string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
}) => {
  let bgClass = 'bg-gray-100 text-gray-800 border-gray-200';
  let label = status;
  let Icon = CheckCircle2;

  // Kondisi Aset / Ceklis
  if (status === 'good' || status === 'pass') {
    bgClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';
    label = 'Baik';
    Icon = CheckCircle2;
  } else if (status === 'needs_repair') {
    bgClass = 'bg-amber-100 text-amber-900 border-amber-300';
    label = 'Perlu Perbaikan';
    Icon = AlertTriangle;
  } else if (status === 'broken') {
    bgClass = 'bg-rose-100 text-rose-800 border-rose-300';
    label = 'Rusak';
    Icon = XCircle;
  }

  // Follow Up Tindak Lanjut
  else if (status === 'waiting') {
    bgClass = 'bg-orange-100 text-orange-900 border-orange-300';
    label = 'Menunggu Tindak Lanjut';
    Icon = Clock;
  } else if (status === 'in_progress') {
    bgClass = 'bg-blue-100 text-blue-900 border-blue-300';
    label = 'Sedang Diproses';
    Icon = Wrench;
  } else if (status === 'done') {
    bgClass = 'bg-teal-100 text-teal-800 border-teal-300';
    label = 'Selesai Diperbaiki';
    Icon = CheckCheck;
  }

  // Status Inspeksi & Laporan
  else if (status === 'draft') {
    bgClass = 'bg-slate-100 text-slate-800 border-slate-300';
    label = 'Draft';
    Icon = Clock;
  } else if (status === 'submitted') {
    bgClass = 'bg-sky-100 text-sky-900 border-sky-300';
    label = 'Terkirim';
    Icon = Clock;
  } else if (status === 'verified' || status === 'approved') {
    bgClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';
    label = status === 'verified' ? 'Terverifikasi' : 'Disetujui';
    Icon = CheckCheck;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs sm:text-sm px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm sm:text-base px-3.5 py-1.5 gap-2 font-semibold',
  };

  const iconSizes = {
    sm: 12,
    md: 15,
    lg: 18,
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-xs transition-colors ${sizeClasses[size]} ${bgClass}`}
    >
      {showIcon && <Icon size={iconSizes[size]} className="shrink-0" />}
      <span>{label}</span>
    </span>
  );
};
