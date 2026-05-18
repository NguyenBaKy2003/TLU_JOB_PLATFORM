'use client';

import React from 'react';
import { AlertCircle, RefreshCw, Home, AlertTriangle, WifiOff } from 'lucide-react';
import { useRouter } from 'next/navigation';

export type ErrorType = 'general' | 'network' | 'notfound' | 'unauthorized' | 'server';

export interface ErrorStateProps {
  type?: ErrorType;
  title?: string;
  message?: string;
  onRetry?: () => void;
  onBack?: () => void;
  showHomeButton?: boolean;
  className?: string;
}

const errorConfig: Record<ErrorType, { icon: React.ReactNode; defaultTitle: string; defaultMessage: string }> = {
  general: {
    icon: <AlertCircle className="w-12 h-12" />,
    defaultTitle: 'Đã xảy ra lỗi',
    defaultMessage: 'Có lỗi xảy ra, vui lòng thử lại sau'
  },
  network: {
    icon: <WifiOff className="w-12 h-12" />,
    defaultTitle: 'Mất kết nối mạng',
    defaultMessage: 'Vui lòng kiểm tra kết nối internet của bạn'
  },
  notfound: {
    icon: <AlertTriangle className="w-12 h-12" />,
    defaultTitle: 'Không tìm thấy trang',
    defaultMessage: 'Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển'
  },
  unauthorized: {
    icon: <AlertCircle className="w-12 h-12" />,
    defaultTitle: 'Không có quyền truy cập',
    defaultMessage: 'Bạn không có quyền truy cập vào nội dung này'
  },
  server: {
    icon: <AlertTriangle className="w-12 h-12" />,
    defaultTitle: 'Lỗi máy chủ',
    defaultMessage: 'Máy chủ đang gặp sự cố, vui lòng thử lại sau'
  }
};

export const ErrorState: React.FC<ErrorStateProps> = ({
  type = 'general',
  title,
  message,
  onRetry,
  onBack,
  showHomeButton = true,
  className = ''
}) => {
  const router = useRouter();
  const config = errorConfig[type];
  
  const displayTitle = title || config.defaultTitle;
  const displayMessage = message || config.defaultMessage;
  
  const handleGoHome = () => {
    router.push('/');
  };
  
  return (
    <div className={`flex flex-col items-center justify-center text-center py-12 px-4 ${className}`}>
      <div className="w-24 h-24 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4 text-red-500">
        {config.icon}
      </div>
      
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {displayTitle}
      </h3>
      
      <p className="text-[16px] text-muted-foreground max-w-md mb-6">
        {displayMessage}
      </p>
      
      <div className="flex gap-3 flex-wrap justify-center">
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Thử lại
          </button>
        )}
        
        {onBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-background hover:bg-muted transition-all duration-200"
          >
            Quay lại
          </button>
        )}
        
        {showHomeButton && !onBack && (
          <button
            onClick={handleGoHome}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-background hover:bg-muted transition-all duration-200"
          >
            <Home className="w-4 h-4" />
            Về trang chủ
          </button>
        )}
      </div>
    </div>
  );
};

// Inline error for forms
export interface InlineErrorProps {
  message: string;
  className?: string;
}

export const InlineError: React.FC<InlineErrorProps> = ({ 
  message, 
  className = '' 
}) => {
  return (
    <div className={`flex items-center gap-2 text-red-500 text-[16px] ${className}`}>
      <AlertCircle className="w-4 h-4" />
      <span>{message}</span>
    </div>
  );
};