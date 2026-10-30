import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { UserRole } from '../types';

interface RoleRouteProps {
  allowedRoles?: UserRole[];
}

export const RoleRoute: React.FC<RoleRouteProps> = ({ allowedRoles }) => {
  const { user, loading, getDefaultRouteForRole } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-900 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-600 font-medium">Memuat SarprasCheck...</p>
        </div>
      </div>
    );
  }

  // Jika belum login, arahkan ke halaman Login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Jika role dibatasi dan role user tidak sesuai, arahkan ke route role user
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
  }

  return <Outlet />;
};

// Route untuk halaman autentikasi (Register/Login): jika sudah login, redirect otomatis ke dashboard role
export const PublicAuthRoute: React.FC = () => {
  const { user, loading, getDefaultRouteForRole } = useAuth();

  if (loading) {
    return null;
  }

  if (user) {
    return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
  }

  return <Outlet />;
};
