import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, type RegisterParams, type LoginParams } from '../services/authService';
import type { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  register: (params: RegisterParams) => Promise<User>;
  login: (params: LoginParams) => Promise<User>;
  logout: () => Promise<void>;
  getDefaultRouteForRole: (role: UserRole) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Muat user dari storage lokal saat app mulai
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const getDefaultRouteForRole = (role: UserRole): string => {
    switch (role) {
      case 'ob':
        return '/ob';
      case 'pj_sarpras':
        return '/pj';
      case 'ketua_sarpras':
        return '/ketua';
      default:
        return '/register';
    }
  };

  const register = async (params: RegisterParams): Promise<User> => {
    const newUser = await authService.register(params);
    setUser(newUser);
    return newUser;
  };

  const login = async (params: LoginParams): Promise<User> => {
    const loggedUser = await authService.login(params);
    setUser(loggedUser);
    return loggedUser;
  };

  const logout = async (): Promise<void> => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        getDefaultRouteForRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
