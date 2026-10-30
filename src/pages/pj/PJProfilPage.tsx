import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { PWAInstallButton } from '../../components/common/PWAInstallButton';
import { User, Mail, Shield, LogOut, Wrench, Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PJProfilPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/register', { replace: true });
  };

  return (
    <div className="space-y-4 max-w-md mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Profil Penanggung Jawab
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Informasi Akun Penanggung Jawab Sarpras.
        </p>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-700 text-white flex items-center justify-center font-bold text-xl shadow-md">
            {user?.name.charAt(0).toUpperCase() || 'P'}
          </div>
          <div className="min-w-0">
            <h2 className="font-extrabold text-base sm:text-lg text-slate-900 truncate">
              {user?.name}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
              <Mail size={13} />
              <span className="truncate">{user?.email}</span>
            </div>
            <div className="mt-1.5">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                <Wrench size={11} />
                Penanggung Jawab Sarpras
              </span>
            </div>
          </div>
        </div>
      </div>


      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-sm font-bold transition"
      >
        <LogOut size={16} />
        <span>Keluar dari Akun</span>
      </button>
    </div>
  );
};
