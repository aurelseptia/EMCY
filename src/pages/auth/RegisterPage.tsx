import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import type { UserRole } from '../../types';
import { ShieldCheck, UserCheck, Wrench, BarChart3, Eye, EyeOff, Loader2 } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register, getDefaultRouteForRole } = useAuth();
  const { error: toastError, success: toastSuccess } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('ob');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Validasi Sisi Klien
    if (!name.trim()) {
      setErrorMessage('Nama lengkap tidak boleh kosong.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Format email tidak valid.');
      return;
    }
    if (password.length < 8) {
      setErrorMessage('Kata sandi minimal harus 8 karakter.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Konfirmasi kata sandi tidak cocok.');
      return;
    }
    if (!role) {
      setErrorMessage('Silakan pilih salah satu role.');
      return;
    }

    setIsLoading(true);
    try {
      const newUser = await register({
        name,
        email,
        password,
        confirmPassword,
        role,
      });
      toastSuccess(`Pendaftaran berhasil. Selamat datang, ${newUser.name}!`);
      // Redirect langsung ke halaman sesuai role
      const targetRoute = getDefaultRouteForRole(newUser.role);
      navigate(targetRoute, { replace: true });
    } catch (err: any) {
      const msg = err?.message || 'Gagal melakukan pendaftaran. Silahkan coba lagi.';
      setErrorMessage(msg);
      toastError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* App Branding */}
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-900 text-white flex items-center justify-center shadow-lg shadow-blue-900/20">
            <ShieldCheck size={34} className="stroke-[2.3]" />
          </div>
        </div>
        <h1 className="mt-4 text-center text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          EMCY
        </h1>
        <p className="mt-1 text-center text-xs sm:text-sm text-slate-600">
          Aplikasi Monitoring & Maintenance Sarana Prasarana Kampus
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-6 px-5 sm:px-8 shadow-xl rounded-2xl border border-slate-200">
          <div className="mb-5 pb-3 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">Registrasi Akun Baru</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Lengkapi data di bawah ini untuk memulai penggunaan sistem.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nama Lengkap */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Contoh : Mahardika"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-800 focus:border-transparent transition"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                Alamat Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="nama@ac.id"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-800 focus:border-transparent transition"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                Kata Sandi <span className="text-xs font-normal text-slate-500">(minimal 8 karakter)</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-800 focus:border-transparent pr-10 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Konfirmasi Password */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                Konfirmasi Kata Sandi
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-800 focus:border-transparent transition"
              />
            </div>

            {/* Pilihan Role */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">
                Pilih Role Anda
              </label>
              <div className="space-y-2">
                {/* Role Petugas Lapangan */}
                <label
                  className={`flex items-start p-3 rounded-xl border cursor-pointer transition ${role === 'ob'
                    ? 'bg-blue-50/70 border-blue-600 ring-1 ring-blue-600'
                    : 'border-slate-200 hover:bg-slate-50'
                    }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="ob"
                    checked={role === 'ob'}
                    onChange={() => setRole('ob')}
                    className="mt-1 h-4 w-4 text-blue-900 focus:ring-blue-800"
                  />
                  <div className="ml-3">
                    <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900">
                      <UserCheck size={16} className="text-blue-700" />
                      <span>Petugas Lapangan</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Melakukan pemeriksaan sarana prasarana melalui ceklis digital harian & mingguan.
                    </p>
                  </div>
                </label>

                {/* Role PJ Sarpras */}
                <label
                  className={`flex items-start p-3 rounded-xl border cursor-pointer transition ${role === 'pj_sarpras'
                    ? 'bg-amber-50/70 border-amber-600 ring-1 ring-amber-600'
                    : 'border-slate-200 hover:bg-slate-50'
                    }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="pj_sarpras"
                    checked={role === 'pj_sarpras'}
                    onChange={() => setRole('pj_sarpras')}
                    className="mt-1 h-4 w-4 text-amber-600 focus:ring-amber-500"
                  />
                  <div className="ml-3">
                    <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900">
                      <Wrench size={16} className="text-amber-700" />
                      <span>Penanggung Jawab Sarpras</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Memverifikasi hasil ceklis, mengelola perbaikan kerusakan, dan menyusun laporan.
                    </p>
                  </div>
                </label>

                {/* Role Ketua Sarpras */}
                <label
                  className={`flex items-start p-3 rounded-xl border cursor-pointer transition ${role === 'ketua_sarpras'
                    ? 'bg-purple-50/70 border-purple-600 ring-1 ring-purple-600'
                    : 'border-slate-200 hover:bg-slate-50'
                    }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="ketua_sarpras"
                    checked={role === 'ketua_sarpras'}
                    onChange={() => setRole('ketua_sarpras')}
                    className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500"
                  />
                  <div className="ml-3">
                    <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900">
                      <BarChart3 size={16} className="text-purple-700" />
                      <span>Kepala Sarpras</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Memantau kondisi keseluruhan, menyetujui laporan, dan menerbitkan laporan untuk Kepala Sarpras.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Tombol Daftar */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-blue-900 hover:bg-blue-800 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-blue-900 disabled:opacity-50 transition active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin mr-2" />
                    <span>Mendaftarkan Akun...</span>
                  </>
                ) : (
                  <span>Daftar Sekarang</span>
                )}
              </button>
            </div>
          </form>

          {/* Tautan ke Login */}
          <div className="mt-6 text-center text-xs sm:text-sm text-slate-600 border-t border-slate-100 pt-4">
            Sudah punya akun?{' '}
            <Link to="/login" className="font-bold text-blue-900 hover:underline">
              Masuk
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
