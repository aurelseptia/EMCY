import React, { useEffect } from 'react';
import { useToast } from '../../hooks/useToast';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, subscribe, removeToast } = useToast();

  useEffect(() => {
    return subscribe();
  }, [subscribe]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto sm:w-96 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => {
        let bg = 'bg-white border-blue-200 text-gray-800';
        let Icon = Info;
        let iconColor = 'text-blue-600';

        if (toast.type === 'success') {
          bg = 'bg-emerald-50 border-emerald-300 text-emerald-950';
          Icon = CheckCircle2;
          iconColor = 'text-emerald-600';
        } else if (toast.type === 'error') {
          bg = 'bg-rose-50 border-rose-300 text-rose-950';
          Icon = AlertCircle;
          iconColor = 'text-rose-600';
        } else if (toast.type === 'warning') {
          bg = 'bg-amber-50 border-amber-300 text-amber-950';
          Icon = AlertTriangle;
          iconColor = 'text-amber-600';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-lg ${bg} transition-all duration-200 animate-in fade-in slide-in-from-top-2`}
          >
            <Icon size={20} className={`${iconColor} shrink-0 mt-0.5`} />
            <div className="flex-1 text-sm">
              {toast.title && <div className="font-semibold">{toast.title}</div>}
              <div>{toast.message}</div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-gray-600 p-0.5"
              aria-label="Tutup notifikasi"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
