import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { BottomNav } from '../components/common/BottomNav';
import { OfflineBanner } from '../components/common/OfflineBanner';
import { ToastContainer } from '../components/common/ToastContainer';

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900">
      <OfflineBanner />
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 pb-24 sm:p-6 lg:p-8">
        <Outlet />
      </main>
      <BottomNav />
      <ToastContainer />
    </div>
  );
};
