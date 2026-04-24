'use client';

import React, { useEffect } from 'react';
import { X, AlertTriangle, CheckCircle, Info, HelpCircle } from 'lucide-react';

export type ConfirmType = 'info' | 'warning' | 'danger' | 'success' | 'question';

export interface ConfirmModelProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onCancel?: () => void;
  title?: string;
  message?: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  type?: ConfirmType;
  loading?: boolean;
  disabled?: boolean;
  showCancel?: boolean;
}

const iconConfig = {
  info: {
    icon: Info,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    borderColor: 'border-blue-200 dark:border-blue-800'
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    borderColor: 'border-yellow-200 dark:border-yellow-800'
  },
  danger: {
    icon: AlertTriangle,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    borderColor: 'border-red-200 dark:border-red-800'
  },
  success: {
    icon: CheckCircle,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    borderColor: 'border-green-200 dark:border-green-800'
  },
  question: {
    icon: HelpCircle,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/20'
  }
};

export const ConfirmModel: React.FC<ConfirmModelProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onCancel,
  title = 'Xác nhận',
  message = 'Bạn có chắc chắn muốn thực hiện hành động này?',
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  type = 'question',
  loading = false,
  disabled = false,
  showCancel = true
}) => {
  // Prevent scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const config = iconConfig[type];
  const Icon = config.icon;

  const handleCancel = () => {
    onCancel?.();
    onClose();
  };

  const getConfirmButtonClass = () => {
    const baseClass = 'px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const typeClasses = {
      info: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600',
      warning: 'bg-yellow-600 hover:bg-yellow-700 text-white focus:ring-yellow-500 dark:bg-yellow-500 dark:hover:bg-yellow-600',
      danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 dark:bg-red-500 dark:hover:bg-red-600',
      success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500 dark:bg-green-500 dark:hover:bg-green-600',
      question: 'bg-primary hover:bg-primary/90 text-primary-foreground focus:ring-primary'
    };
    
    return `${baseClass} ${typeClasses[type]}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={handleCancel}
      />
      
      {/* Modal */}
      <div className="relative bg-background rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 animate-in fade-in zoom-in-95">
        {/* Close button */}
        <button
          onClick={handleCancel}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        {/* Content */}
        <div className="p-6">
          {/* Icon */}
          <div className={`flex items-center justify-center w-14 h-14 rounded-full ${config.bgColor} mx-auto mb-4`}>
            <Icon className={`w-7 h-7 ${config.color}`} />
          </div>
          
          {/* Title */}
          <h3 className="text-lg font-semibold text-center mb-2">
            {title}
          </h3>
          
          {/* Message */}
          <div className="text-muted-foreground text-center mb-6">
            {typeof message === 'string' ? <p>{message}</p> : message}
          </div>
          
          {/* Buttons */}
          <div className="flex gap-3 justify-center">
            {showCancel && (
              <button
                onClick={handleCancel}
                disabled={loading}
                className="px-4 py-2 rounded-lg font-medium border border-border bg-background hover:bg-muted transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelText}
              </button>
            )}
            <button
              onClick={onConfirm}
              disabled={loading || disabled}
              className={getConfirmButtonClass()}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Đang xử lý...
                </span>
              ) : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};