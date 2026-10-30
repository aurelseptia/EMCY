import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  Home,
  ClipboardCheck,
  Box,
  History,
  User,
  LayoutDashboard,
  CheckSquare,
  AlertTriangle,
  Wrench,
  FileText,
  Activity,
  FileCheck2,
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  // Navigasi untuk OB
  const obNavItems = [
    { to: '/ob', label: 'Beranda', icon: Home, end: true },
    { to: '/ob/pemeriksaan', label: 'Pemeriksaan', icon: ClipboardCheck },
    { to: '/ob/sarana', label: 'Sarana', icon: Box },
    { to: '/ob/riwayat', label: 'Riwayat', icon: History },
    { to: '/ob/profil', label: 'Profil', icon: User },
  ];

  // Navigasi untuk PJ Sarpras
  const pjNavItems = [
    { to: '/pj', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/pj/ceklis', label: 'Hasil Ceklis', icon: CheckSquare },
    { to: '/pj/kerusakan', label: 'Kerusakan', icon: AlertTriangle },
    { to: '/pj/tindak-lanjut', label: 'Tindak Lanjut', icon: Wrench },
    { to: '/pj/profil', label: 'Profil', icon: User },
  ];

  // Navigasi untuk Ketua Sarpras
  const ketuaNavItems = [
    { to: '/ketua', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/ketua/laporan', label: 'Laporan', icon: FileText },
    { to: '/ketua/perbaikan', label: 'Perbaikan', icon: Activity },
    { to: '/ketua/persetujuan', label: 'Persetujuan', icon: FileCheck2 },
    { to: '/ketua/profil', label: 'Profil', icon: User },
  ];

  let items = obNavItems;
  if (user.role === 'pj_sarpras') {
    items = pjNavItems;
  } else if (user.role === 'ketua_sarpras') {
    items = ketuaNavItems;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-lg pb-safe">
      <div className="max-w-lg mx-auto grid grid-cols-5 h-16">
        {items.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 select-none transition-all py-1 ${isActive
                  ? 'text-blue-900 font-bold scale-105'
                  : 'text-slate-500 hover:text-slate-700 font-medium'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-blue-100 text-blue-900' : ''}`}>
                    <Icon size={20} className={isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'} />
                  </div>
                  <span className="text-[11px] leading-tight truncate max-w-[64px] text-center">
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
