import React, { useEffect } from 'react';
import { CheckCircle, AlertTriangle, X, Info, AlertCircle } from 'lucide-react';
import type { ToastType } from "../context/ToastContext";


interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  onClose: (id: string) => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ id, message, type, onClose, duration = 5000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);
    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const getStyles = () => {
    switch (type) {
      case 'success': return 'bg-gray-900 text-white border-gray-800';
      case 'error': return 'bg-red-600 text-white border-red-700';
      case 'warning': return 'bg-amber-500 text-white border-amber-600';
      case 'critical': return 'bg-red-700 text-white border-2 border-red-400 animate-pulse';
      default: return 'bg-blue-600 text-white border-blue-700';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle size={20} className="text-emerald-400" />;
      case 'error': return <AlertCircle size={20} className="text-white" />;
      case 'warning': return <AlertTriangle size={20} className="text-white" />;
      case 'critical': return <AlertTriangle size={20} className="text-white" />;
      default: return <Info size={20} className="text-white" />;
    }
  };

  return (
    <div className={`px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 min-w-[320px] max-w-md animate-in slide-in-from-bottom-5 fade-in duration-300 border ${getStyles()}`}>
        <div className="shrink-0">{getIcon()}</div>
        <span className="font-bold text-sm flex-1 leading-tight">{message}</span>
        <button onClick={() => onClose(id)} className="ml-2 hover:opacity-80 transition-opacity shrink-0">
            <X size={18} />
        </button>
    </div>
  );
};

export default Toast;