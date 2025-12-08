import React, { useEffect } from 'react';
import { CheckCircle2, XCircle, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const config = {
    success: { icon: CheckCircle2, bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', iconColor: 'text-emerald-500' },
    error: { icon: XCircle, bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', iconColor: 'text-red-500' },
    info: { icon: AlertCircle, bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', iconColor: 'text-blue-500' }
  }[type];

  const Icon = config.icon;

  return (
    <div className={`fixed bottom-6 right-6 z-[100] flex items-center p-4 rounded-lg border shadow-lg animate-in slide-in-from-bottom-5 fade-in duration-300 ${config.bg} ${config.border} max-w-sm`}>
      <Icon className={`w-5 h-5 mr-3 flex-shrink-0 ${config.iconColor}`} />
      <span className={`text-sm font-medium ${config.text}`}>{message}</span>
      <button onClick={onClose} className={`ml-4 p-1 rounded-full hover:bg-black/5 ${config.text}`}>
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
