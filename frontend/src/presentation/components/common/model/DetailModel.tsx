'use client';

import React, { useEffect } from 'react';
import { X, Copy, Check } from 'lucide-react';

export interface DetailField {
  key: string;
  label: string;
  value: any;
  type?: 'text' | 'html' | 'image' | 'badge' | 'copy' | 'date';
  format?: (value: any) => string;
  copyable?: boolean;
}

export interface DetailModelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  fields: DetailField[];
  actions?: React.ReactNode;
}

export const DetailModel: React.FC<DetailModelProps> = ({
  isOpen,
  onClose,
  title,
  fields,
  actions
}) => {
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

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

  const handleCopy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(key);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatDate = (date: any): string => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getBadgeColor = (value: any): string => {
    const badgeColors: Record<string, string> = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      verified: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      unverified: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      suspended: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
      submitted: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      reviewing: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      shortlisted: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      interview_scheduled: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
      hired: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      withdrawn: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
    };

    // Kiểm tra nếu value không phải string
    if (typeof value !== 'string') {
      return 'bg-gray-100 text-gray-800';
    }

    const key = value.toLowerCase();
    return badgeColors[key] || 'bg-gray-100 text-gray-800';
  };

  const renderValue = (field: DetailField) => {
    let value = field.value;
    
    if (field.format) {
      value = field.format(value);
    }
    
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground italic">Chưa có dữ liệu</span>;
    }
    
    switch (field.type) {
      case 'html':
        return (
          <div 
            className="prose prose-sm max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: value }}
          />
        );
      
      case 'image':
        return (
          <div className="flex gap-2 flex-wrap">
            {Array.isArray(value) ? value.map((img, idx) => (
              <img key={idx} src={img} alt={`${field.label} ${idx + 1}`} className="w-20 h-20 object-cover rounded-lg border" />
            )) : (
              <img src={value} alt={field.label} className="w-20 h-20 object-cover rounded-lg border" />
            )}
          </div>
        );
      
      case 'badge':
        const colorClass = getBadgeColor(value);
        return (
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${colorClass}`}>
            {value}
          </span>
        );
      
      case 'date':
        return <span>{formatDate(value)}</span>;
      
      case 'copy':
      default:
        const displayValue = String(value);
        return (
          <div className="flex items-center gap-2">
            <span className="break-all">{displayValue}</span>
            {field.copyable !== false && displayValue && (
              <button
                onClick={() => handleCopy(displayValue, field.key)}
                className="p-1 hover:bg-muted rounded transition-colors"
                title="Sao chép"
              >
                {copiedField === field.key ? (
                  <Check className="w-3.5 h-3.5 text-green-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                )}
              </button>
            )}
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-background rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col transform transition-all duration-300 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {fields.map(field => (
              <div key={field.key} className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <dt className="text-[16px] font-medium text-muted-foreground">
                    {field.label}
                  </dt>
                </div>
                <div className="col-span-2">
                  <dd className="text-[16px] text-foreground">
                    {renderValue(field)}
                  </dd>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Footer */}
        {actions && (
          <div className="flex justify-end gap-3 p-6 border-t border-border">
            {actions}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg font-medium border border-border bg-background hover:bg-muted transition-colors duration-200"
            >
              Đóng
            </button>
          </div>
        )}
        
        {!actions && (
          <div className="flex justify-end p-6 border-t border-border">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg font-medium border border-border bg-background hover:bg-muted transition-colors duration-200"
            >
              Đóng
            </button>
          </div>
        )}
      </div>
    </div>
  );
};