'use client';

import { createContext, useContext, useState,useRef, useCallback, useEffect, ReactNode } from "react";
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Info, 
  X, 
} from "lucide-react";

// ── Types ───

export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
  exiting?: boolean;
}

export interface ToastOptions {
  duration?: number;
  position?: ToastPosition;
  icon?: ReactNode;
}

export interface ToastContextType {
  showToast: (type: ToastType, title: string, message: string, options?: ToastOptions) => void;
  success: (title: string, message: string, options?: ToastOptions) => void;
  error: (title: string, message: string, options?: ToastOptions) => void;
  warning: (title: string, message: string, options?: ToastOptions) => void;
  info: (title: string, message: string, options?: ToastOptions) => void;
  dismissAll: () => void;
}

// ── Context ─

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};

// ── Config ──

const toastConfig: Record<ToastType, {
  icon: ReactNode;
  gradient: string;
  border: string;
  bg: string;
  text: string;
  subText: string;
  shadow: string;
  progressBar: string;
  iconBg: string;
}> = {
  success: {
    icon: <CheckCircle2 size={20} strokeWidth={2.5} />,
    gradient: "from-emerald-50 to-green-50 dark:from-emerald-950/60 dark:to-green-950/40",
    border: "border-emerald-200 dark:border-emerald-800/60",
    bg: "bg-white/80 dark:bg-gray-900/80",
    text: "text-emerald-900 dark:text-emerald-100",
    subText: "text-emerald-700 dark:text-emerald-300",
    shadow: "shadow-emerald-500/10 dark:shadow-emerald-500/5",
    progressBar: "bg-emerald-500",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400",
  },
  error: {
    icon: <XCircle size={20} strokeWidth={2.5} />,
    gradient: "from-rose-50 to-red-50 dark:from-rose-950/60 dark:to-red-950/40",
    border: "border-rose-200 dark:border-rose-800/60",
    bg: "bg-white/80 dark:bg-gray-900/80",
    text: "text-rose-900 dark:text-rose-100",
    subText: "text-rose-700 dark:text-rose-300",
    shadow: "shadow-rose-500/10 dark:shadow-rose-500/5",
    progressBar: "bg-rose-500",
    iconBg: "bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400",
  },
  warning: {
    icon: <AlertTriangle size={20} strokeWidth={2.5} />,
    gradient: "from-amber-50 to-yellow-50 dark:from-amber-950/60 dark:to-yellow-950/40",
    border: "border-amber-200 dark:border-amber-800/60",
    bg: "bg-white/80 dark:bg-gray-900/80",
    text: "text-amber-900 dark:text-amber-100",
    subText: "text-amber-700 dark:text-amber-300",
    shadow: "shadow-amber-500/10 dark:shadow-amber-500/5",
    progressBar: "bg-amber-500",
    iconBg: "bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400",
  },
  info: {
    icon: <Info size={20} strokeWidth={2.5} />,
    gradient: "from-sky-50 to-blue-50 dark:from-sky-950/60 dark:to-blue-950/40",
    border: "border-sky-200 dark:border-sky-800/60",
    bg: "bg-white/80 dark:bg-gray-900/80",
    text: "text-sky-900 dark:text-sky-100",
    subText: "text-sky-700 dark:text-sky-300",
    shadow: "shadow-sky-500/10 dark:shadow-sky-500/5",
    progressBar: "bg-sky-500",
    iconBg: "bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400",
  },
};

// ── Position Styles ────────

const positionStyles: Record<ToastPosition, string> = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
};

// ── Individual Toast Component ────

function ToastItem({ 
  toast, 
  onClose,
}: { 
  toast: ToastMessage; 
  onClose: (id: string) => void;
}) {
  const config = toastConfig[toast.type];
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (toast.duration === 0 || isPaused) return;

    const duration = toast.duration || 5000;
    const interval = 10;
    const step = (100 / duration) * interval;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev - step;
        return next <= 0 ? 0 : next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [toast.id, toast.duration, isPaused]);

  useEffect(() => {
    if (progress <= 0 && toast.duration !== 0) {
      onCloseRef.current(toast.id);
    }
  }, [progress, toast.id, toast.duration]);

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl border backdrop-blur-xl
        transition-all duration-300 ease-out
        ${config.bg} ${config.border} ${config.shadow}
        ${toast.exiting ? 'opacity-0 scale-95 translate-x-4' : 'opacity-100 scale-100'}
        hover:shadow-lg hover:scale-[1.02]
        group
      `}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="alert"
    >
      {/* Gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-50`} />
      
      {/* Content */}
      <div className="relative flex items-start gap-4 p-4 min-w-[360px] max-w-[420px]">
        {/* Icon with animation */}
        <div className={`
          relative flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center
          ${config.iconBg} transition-transform duration-300
          group-hover:scale-110 group-hover:rotate-3
        `}>
          {config.icon}
          {/* Pulse ring */}
          <span className={`
            absolute inset-0 rounded-xl animate-ping opacity-20
            ${config.iconBg}
          `} />
        </div>

        {/* Text content */}
        <div className="flex-1 min-w-0 pt-0.5">
          <div className="flex items-center gap-2 mb-1">
            <p className={`font-semibold text-sm ${config.text}`}>
              {toast.title}
            </p>
            {/* Type badge */}
            <span className={`
              text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md
              ${config.iconBg}
            `}>
              {toast.type === 'error' ? 'Lỗi' : 
               toast.type === 'warning' ? 'Cảnh báo' : 
               toast.type === 'success' ? 'Thành công' : 'Thông tin'}
            </span>
          </div>
          <p className={`text-sm leading-relaxed ${config.subText}`}>
            {toast.message}
          </p>
        </div>

        {/* Close button */}
        <button
          onClick={() => onClose(toast.id)}
          className={`
            flex-shrink-0 p-1.5 rounded-lg transition-all duration-200
            hover:bg-black/5 dark:hover:bg-white/5
            opacity-0 group-hover:opacity-100
            ${config.subText}
          `}
          aria-label="Đóng thông báo"
        >
          <X size={16} strokeWidth={2} />
        </button>
      </div>

      {/* Progress bar */}
      {toast.duration !== 0 && (
        <div className="relative h-1 bg-black/5 dark:bg-white/5">
          <div
            className={`absolute inset-y-0 left-0 transition-all duration-100 ease-linear ${config.progressBar}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Shine effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
      </div>
    </div>
  );
}

// ── Toast Provider ─────────

export interface ToastProviderProps {
  children: ReactNode;
  defaultPosition?: ToastPosition;
  defaultDuration?: number;
  maxToasts?: number;
}

export function ToastProvider({ 
  children, 
  defaultPosition = 'top-right',
  defaultDuration = 5000,
  maxToasts = 5,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => {
      // Mark as exiting first for animation
      const updated = prev.map(t => t.id === id ? { ...t, exiting: true } : t);
      return updated;
    });

    // Actually remove after animation
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 300);
  }, []);

  const dismissAll = useCallback(() => {
    setToasts((prev) => prev.map(t => ({ ...t, exiting: true })));
    setTimeout(() => {
      setToasts([]);
    }, 300);
  }, []);

  const showToast = useCallback((
    type: ToastType,
    title: string,
    message: string,
    options?: ToastOptions
  ) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const duration = options?.duration ?? defaultDuration;

    setToasts((prev) => {
      // Remove oldest toast if exceeding max
      const updated = prev.length >= maxToasts 
        ? prev.slice(1).map(t => ({ ...t }))
        : [...prev];
      
      return [...updated, { id, type, title, message, duration, exiting: false }];
    });

    // Auto dismiss
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration + 300);
    }
  }, [defaultDuration, maxToasts, removeToast]);

  const success = useCallback((title: string, message: string, options?: ToastOptions) => {
    showToast('success', title, message, options);
  }, [showToast]);

  const error = useCallback((title: string, message: string, options?: ToastOptions) => {
    showToast('error', title, message, options);
  }, [showToast]);

  const warning = useCallback((title: string, message: string, options?: ToastOptions) => {
    showToast('warning', title, message, options);
  }, [showToast]);

  const info = useCallback((title: string, message: string, options?: ToastOptions) => {
    showToast('info', title, message, options);
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info, dismissAll }}>
      {children}
      
      {/* Toast Container */}
      <div 
        className={`
          fixed z-[100] space-y-3 pointer-events-none
          ${positionStyles[defaultPosition]}
        `}
        style={{ maxWidth: 'calc(100vw - 2rem)' }}
      >
        <div className="pointer-events-auto space-y-3">
          {toasts.map((toast, index) => (
            <div
              key={toast.id}
              style={{
                zIndex: 100 - index,
                opacity: 1 - (toasts.length - 1 - index) * 0.08,
                transform: `scale(${1 - (toasts.length - 1 - index) * 0.02}) translateY(${(toasts.length - 1 - index) * 4}px)`,
              }}
            >
              <ToastItem 
                toast={toast} 
                onClose={removeToast}
              />
            </div>
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}

// ── Standalone Toast Component (for non-context usage) ──────────

export interface ToastProps {
  type?: ToastType;
  title: string;
  message?: string;
  onClose?: () => void;
  showClose?: boolean;
  className?: string;
}

export function Toast({
  type = 'info',
  title,
  message,
  onClose,
  showClose = true,
  className,
}: ToastProps) {
  const config = toastConfig[type];

  return (
    <div className={`
      relative overflow-hidden rounded-2xl border backdrop-blur-xl
      ${config.bg} ${config.border} ${config.shadow}
      ${className}
    `}>
      <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-50`} />
      
      <div className="relative flex items-start gap-3 p-4">
        <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${config.iconBg}`}>
          {config.icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-sm ${config.text}`}>{title}</p>
          {message && (
            <p className={`text-sm mt-1 ${config.subText}`}>{message}</p>
          )}
        </div>

        {showClose && onClose && (
          <button
            onClick={onClose}
            className={`flex-shrink-0 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition ${config.subText}`}
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}