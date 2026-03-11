"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (type: ToastType, title: string, message: string, duration?: number) => void;
  success: (title: string, message: string, duration?: number) => void;
  error: (title: string, message: string, duration?: number) => void;
  warning: (title: string, message: string, duration?: number) => void;
  info: (title: string, message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};

function Toast({ 
  toast, 
  onClose 
}: { 
  toast: ToastMessage; 
  onClose: (id: string) => void;
}) {
  const config = {
    success: {
      bgColor: 'bg-green-50',
      borderColor: 'border-green-500',
      textColor: 'text-green-900',
      descColor: 'text-green-700',
      hoverColor: 'hover:bg-green-100 text-green-700',
      icon: <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
    },
    error: {
      bgColor: 'bg-red-50',
      borderColor: 'border-red-500',
      textColor: 'text-red-900',
      descColor: 'text-red-700',
      hoverColor: 'hover:bg-red-100 text-red-700',
      icon: <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
    },
    warning: {
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-500',
      textColor: 'text-yellow-900',
      descColor: 'text-yellow-700',
      hoverColor: 'hover:bg-yellow-100 text-yellow-700',
      icon: <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
    },
    info: {
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-500',
      textColor: 'text-blue-900',
      descColor: 'text-blue-700',
      hoverColor: 'hover:bg-blue-100 text-blue-700',
      icon: <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
    }
  };

  const style = config[toast.type];

  return (
    <div className="animate-slide-in-right">
      <div className={`
        flex items-start gap-3 p-4 rounded-xl shadow-2xl border-2 min-w-[320px] max-w-md
        ${style.bgColor} ${style.borderColor}
      `}>
        {style.icon}
        <div className="flex-1">
          <p className={`font-semibold text-sm ${style.textColor}`}>
            {toast.title}
          </p>
          <p className={`text-sm mt-1 ${style.descColor}`}>
            {toast.message}
          </p>
        </div>
        <button
          onClick={() => onClose(toast.id)}
          className={`p-1 rounded-lg transition-colors ${style.hoverColor}`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((
    type: ToastType,
    title: string,
    message: string,
    duration: number = 5000
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastMessage = { id, type, title, message, duration };
    
    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const success = useCallback((title: string, message: string, duration?: number) => {
    showToast('success', title, message, duration);
  }, [showToast]);

  const error = useCallback((title: string, message: string, duration?: number) => {
    showToast('error', title, message, duration);
  }, [showToast]);

  const warning = useCallback((title: string, message: string, duration?: number) => {
    showToast('warning', title, message, duration);
  }, [showToast]);

  const info = useCallback((title: string, message: string, duration?: number) => {
    showToast('info', title, message, duration);
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[60] space-y-3 pointer-events-none">
        <div className="pointer-events-auto space-y-3">
          {toasts.map((toast) => (
            <Toast key={toast.id} toast={toast} onClose={removeToast} />
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}
