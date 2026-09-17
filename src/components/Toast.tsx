import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div
      id="toast-container"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-600 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-200 bg-white text-slate-800 shadow-lg shadow-emerald-50',
    error: 'border-rose-200 bg-white text-slate-800 shadow-lg shadow-rose-50',
    info: 'border-blue-200 bg-white text-slate-800 shadow-lg shadow-blue-50',
  };

  return (
    <div
      id={`toast-${toast.id}`}
      className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border text-sm transition-all duration-200 ${borders[toast.type]}`}
    >
      {icons[toast.type]}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-900 leading-tight">{toast.title}</p>
        {toast.description && (
          <p className="text-slate-600 text-xs mt-0.5 leading-normal">{toast.description}</p>
        )}
      </div>
      <button
        id={`toast-close-${toast.id}`}
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="text-slate-400 hover:text-slate-600 p-0.5 rounded focus:outline-none"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
