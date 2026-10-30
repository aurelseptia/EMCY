import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { seedInitialData } from './lib/db';
import { RoleRoute, PublicAuthRoute } from './layouts/RoleRoute';
import { AppLayout } from './layouts/AppLayout';

// Auth Pages
import { RegisterPage } from './pages/auth/RegisterPage';
import { LoginPage } from './pages/auth/LoginPage';

// OB Pages
import { OBHomePage } from './pages/ob/OBHomePage';
import { OBPemeriksaanPage } from './pages/ob/OBPemeriksaanPage';
import { OBChecklistPage } from './pages/ob/OBChecklistPage';
import { OBSaranaPage } from './pages/ob/OBSaranaPage';
import { OBRiwayatPage } from './pages/ob/OBRiwayatPage';
import { OBProfilPage } from './pages/ob/OBProfilPage';

// PJ Sarpras Pages
import { PJDashboardPage } from './pages/pj/PJDashboardPage';
import { PJSaranaPage } from './pages/pj/PJSaranaPage';
import { PJTemplatePage } from './pages/pj/PJTemplatePage';
import { PJJadwalPage } from './pages/pj/PJJadwalPage';
import { PJCeklisPage } from './pages/pj/PJCeklisPage';
import { PJKerusakanPage } from './pages/pj/PJKerusakanPage';
import { PJTindakLanjutPage } from './pages/pj/PJTindakLanjutPage';
import { PJLaporanPage } from './pages/pj/PJLaporanPage';
import { PJRiwayatPage } from './pages/pj/PJRiwayatPage';
import { PJProfilPage } from './pages/pj/PJProfilPage';

// Ketua Sarpras Pages
import { KetuaDashboardPage } from './pages/ketua/KetuaDashboardPage';
import { KetuaSaranaPage } from './pages/ketua/KetuaSaranaPage';
import { KetuaTemplatePage } from './pages/ketua/KetuaTemplatePage';
import { KetuaJadwalPage } from './pages/ketua/KetuaJadwalPage';
import { KetuaRiwayatPage } from './pages/ketua/KetuaRiwayatPage';
import { KetuaLaporanPage } from './pages/ketua/KetuaLaporanPage';
import { KetuaPerbaikanPage } from './pages/ketua/KetuaPerbaikanPage';
import { KetuaPersetujuanPage } from './pages/ketua/KetuaPersetujuanPage';
import { KetuaProfilPage } from './pages/ketua/KetuaProfilPage';

// Component for Root & Wildcard Redirection
const RootRedirect: React.FC = () => {
  const { user, loading, getDefaultRouteForRole } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-blue-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
  }

  // Pengguna baru / belum login langsung diarahkan ke halaman Login
  return <Navigate to="/login" replace />;
};

export default function App() {
  useEffect(() => {
    // Inisialisasi seed data IndexedDB saat aplikasi pertama kali dimuat
    seedInitialData().catch(err => console.error('Seeding error:', err));
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes: Register & Login (dialihkan ke dashboard jika sudah login) */}
          <Route element={<PublicAuthRoute />}>
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
          </Route>

          {/* Root Redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Role OB Protected Routes */}
          <Route element={<RoleRoute allowedRoles={['ob']} />}>
            <Route element={<AppLayout />}>
              <Route path="/ob" element={<OBHomePage />} />
              <Route path="/ob/pemeriksaan" element={<OBPemeriksaanPage />} />
              <Route path="/ob/ceklis/:assetId" element={<OBChecklistPage />} />
              <Route path="/ob/sarana" element={<OBSaranaPage />} />
              <Route path="/ob/riwayat" element={<OBRiwayatPage />} />
              <Route path="/ob/profil" element={<OBProfilPage />} />
            </Route>
          </Route>

          {/* Role PJ Sarpras Protected Routes */}
          <Route element={<RoleRoute allowedRoles={['pj_sarpras']} />}>
            <Route element={<AppLayout />}>
              <Route path="/pj" element={<PJDashboardPage />} />
              <Route path="/pj/sarana" element={<PJSaranaPage />} />
              <Route path="/pj/template" element={<PJTemplatePage />} />
              <Route path="/pj/jadwal" element={<PJJadwalPage />} />
              <Route path="/pj/ceklis" element={<PJCeklisPage />} />
              <Route path="/pj/kerusakan" element={<PJKerusakanPage />} />
              <Route path="/pj/tindak-lanjut" element={<PJTindakLanjutPage />} />
              <Route path="/pj/laporan" element={<PJLaporanPage />} />
              <Route path="/pj/riwayat" element={<PJRiwayatPage />} />
              <Route path="/pj/profil" element={<PJProfilPage />} />
            </Route>
          </Route>

          {/* Role Ketua Sarpras Protected Routes */}
          <Route element={<RoleRoute allowedRoles={['ketua_sarpras']} />}>
            <Route element={<AppLayout />}>
              <Route path="/ketua" element={<KetuaDashboardPage />} />
              <Route path="/ketua/sarana" element={<KetuaSaranaPage />} />
              <Route path="/ketua/template" element={<KetuaTemplatePage />} />
              <Route path="/ketua/jadwal" element={<KetuaJadwalPage />} />
              <Route path="/ketua/riwayat" element={<KetuaRiwayatPage />} />
              <Route path="/ketua/laporan" element={<KetuaLaporanPage />} />
              <Route path="/ketua/perbaikan" element={<KetuaPerbaikanPage />} />
              <Route path="/ketua/persetujuan" element={<KetuaPersetujuanPage />} />
              <Route path="/ketua/profil" element={<KetuaProfilPage />} />
            </Route>
          </Route>

          {/* Wildcard: Redirect ke root */}
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
