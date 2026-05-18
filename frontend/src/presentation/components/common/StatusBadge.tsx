'use client';

import React from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle, MinusCircle, Loader2 } from 'lucide-react';

export type StatusType = 
  | 'active' 
  | 'inactive' 
  | 'pending' 
  | 'cancelled' 
  | 'completed' 
  | 'failed'
  | 'success'
  | 'warning'
  | 'info'
  | 'default';

export interface StatusBadgeProps {
  status: StatusType | string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const statusConfig: Record<StatusType, { bg: string; text: string; border: string; icon: React.ReactNode; defaultLabel: string }> = {
  active: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-800 dark:text-green-400',
    border: 'border-green-200 dark:border-green-800',
    icon: <CheckCircle className="w-3 h-3" />,
    defaultLabel: 'Hoạt động'
  },
  inactive: {
    bg: 'bg-gray-100 dark:bg-gray-800',
    text: 'text-gray-600 dark:text-gray-400',
    border: 'border-gray-200 dark:border-gray-700',
    icon: <MinusCircle className="w-3 h-3" />,
    defaultLabel: 'Không hoạt động'
  },
  pending: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    text: 'text-yellow-800 dark:text-yellow-400',
    border: 'border-yellow-200 dark:border-yellow-800',
    icon: <Clock className="w-3 h-3" />,
    defaultLabel: 'Chờ xử lý'
  },
  cancelled: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-800 dark:text-red-400',
    border: 'border-red-200 dark:border-red-800',
    icon: <XCircle className="w-3 h-3" />,
    defaultLabel: 'Đã hủy'
  },
  completed: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-800 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800',
    icon: <CheckCircle className="w-3 h-3" />,
    defaultLabel: 'Hoàn thành'
  },
  failed: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-800 dark:text-red-400',
    border: 'border-red-200 dark:border-red-800',
    icon: <XCircle className="w-3 h-3" />,
    defaultLabel: 'Thất bại'
  },
  success: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-800 dark:text-green-400',
    border: 'border-green-200 dark:border-green-800',
    icon: <CheckCircle className="w-3 h-3" />,
    defaultLabel: 'Thành công'
  },
  warning: {
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    text: 'text-orange-800 dark:text-orange-400',
    border: 'border-orange-200 dark:border-orange-800',
    icon: <AlertCircle className="w-3 h-3" />,
    defaultLabel: 'Cảnh báo'
  },
  info: {
    bg: 'bg-cyan-100 dark:bg-cyan-900/30',
    text: 'text-cyan-800 dark:text-cyan-400',
    border: 'border-cyan-200 dark:border-cyan-800',
    icon: <AlertCircle className="w-3 h-3" />,
    defaultLabel: 'Thông tin'
  },
  default: {
    bg: 'bg-gray-100 dark:bg-gray-800',
    text: 'text-gray-600 dark:text-gray-400',
    border: 'border-gray-200 dark:border-gray-700',
    icon: null,
    defaultLabel: 'Khác'
  }
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs gap-1',
  md: 'px-2.5 py-1 text-[16px] gap-1.5',
  lg: 'px-3 py-1.5 text-base gap-2'
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'md',
  showIcon = true,
  className = ''
}) => {
  const config = statusConfig[status as StatusType] || statusConfig.default;
  const displayLabel = label || config.defaultLabel;
  
  return (
    <span
      className={`
        inline-flex items-center rounded-full font-medium
        ${config.bg} ${config.text} border ${config.border}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {showIcon && config.icon && (
        <span className="flex-shrink-0">{config.icon}</span>
      )}
      <span>{displayLabel}</span>
    </span>
  );
};

// Variant with dot instead of icon
export interface DotStatusBadgeProps extends StatusBadgeProps {}

export const DotStatusBadge: React.FC<DotStatusBadgeProps> = ({
  status,
  label,
  size = 'md',
  className = ''
}) => {
  const config = statusConfig[status as StatusType] || statusConfig.default;
  const displayLabel = label || config.defaultLabel;
  
  const dotColors: Record<StatusType, string> = {
    active: 'bg-green-500',
    inactive: 'bg-gray-400',
    pending: 'bg-yellow-500',
    cancelled: 'bg-red-500',
    completed: 'bg-blue-500',
    failed: 'bg-red-500',
    success: 'bg-green-500',
    warning: 'bg-orange-500',
    info: 'bg-cyan-500',
    default: 'bg-gray-400'
  };
  
  const dotColor = dotColors[status as StatusType] || dotColors.default;
  
  const sizeClass = {
    sm: 'text-xs',
    md: 'text-[16px]',
    lg: 'text-base'
  }[size];
  
  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        ${sizeClass}
        ${className}
      `}
    >
      <span className={`w-2 h-2 rounded-full ${dotColor}`} />
      <span className="text-foreground">{displayLabel}</span>
    </span>
  );
};