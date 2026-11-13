import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message?: string;
}

interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />,
    info: <Info className="w-4 h-4 text-[#00F0FF] shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-500/40 bg-[#121416]',
    warning: 'border-amber-500/40 bg-[#121416]',
    error: 'border-red-500/40 bg-[#121416]',
    info: 'border-[#00F0FF]/40 bg-[#121416]',
  };

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-[4px] border shadow-xl min-w-[300px] max-w-[420px] transition-all animate-in fade-in slide-in-from-top-2 ${
        borders[toast.type]
      }`}
    >
      {icons[toast.type]}
      <div className="flex-1 min-w-0">
        <div className="font-mono text-[12px] font-semibold text-[#e2e2e5] tracking-wide">
          {toast.title}
        </div>
        {toast.message && (
          <div className="font-sans text-[12px] text-[#b9cacb] mt-0.5 leading-snug">
            {toast.message}
          </div>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-[#b9cacb] hover:text-[#e2e2e5] transition-colors p-0.5"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
