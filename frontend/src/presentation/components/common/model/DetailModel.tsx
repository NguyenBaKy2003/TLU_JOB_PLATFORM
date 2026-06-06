'use client';

import React, { useEffect } from 'react';
import { X, Copy, Check } from 'lucide-react';

export interface DetailField {
  key:       string;
  label:     string;
  value:     any;
  type?:     'text' | 'html' | 'image' | 'badge' | 'copy' | 'date';
  format?:   (value: any) => string;
  copyable?: boolean;
}

export interface DetailModelProps {
  isOpen:   boolean;
  onClose:  () => void;
  title:    string;
  fields:   DetailField[];
  actions?: React.ReactNode;
  loading?: boolean;
}

export const DetailModel: React.FC<DetailModelProps> = ({
  isOpen,
  onClose,
  title,
  fields,
  actions,
  loading = false,
}) => {
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(key);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const renderValue = (field: DetailField) => {
    let value = field.value;
    if (field.format) value = field.format(value);

    if (value === null || value === undefined || value === '') {
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
            {Array.isArray(value)
              ? value.map((img: string, idx: number) => (
                  <img key={idx} src={img} alt={`${field.label} ${idx + 1}`}
                    className="w-20 h-20 object-cover rounded-lg border" />
                ))
              : <img src={value} alt={field.label}
                  className="w-20 h-20 object-cover rounded-lg border" />
            }
          </div>
        );

      case 'badge':
        // value là ReactNode (sudah dirender dari luar)
        if (typeof value === 'object' && React.isValidElement(value)) return value;
        return (
          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-muted text-muted-foreground">
            {String(value)}
          </span>
        );

      case 'date':
        return <span>{String(value)}</span>;

      default: {
        // value có thể là ReactNode
        if (typeof value === 'object' && React.isValidElement(value)) return value;
        const displayValue = String(value);
        return (
          <div className="flex items-center gap-2">
            <span className="break-all">{displayValue}</span>
            {field.copyable && displayValue && (
              <button
                onClick={() => handleCopy(displayValue, field.key)}
                className="p-1 hover:bg-muted rounded transition-colors shrink-0"
                title="Sao chép"
              >
                {copiedField === field.key
                  ? <Check className="w-3.5 h-3.5 text-green-500" />
                  : <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                }
              </button>
            )}
          </div>
        );
      }
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
      <div className="relative bg-background rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-300">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border shrink-0">
          <h3 className="text-lg font-semibold truncate pr-4">
            {loading ? 'Đang tải...' : title}
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            // Skeleton
            <div className="space-y-5 animate-pulse">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="grid grid-cols-3 gap-4 items-center">
                  <div className="h-3.5 bg-muted rounded col-span-1" />
                  <div className={`h-3.5 bg-muted rounded col-span-2 ${i % 3 === 0 ? 'w-3/4' : ''}`} />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {fields.map(field => (
                <div key={field.key} className="grid grid-cols-3 gap-4">
                  <dt className="col-span-1 text-[14px] font-medium text-muted-foreground pt-0.5">
                    {field.label}
                  </dt>
                  <dd className="col-span-2 text-[14px] text-foreground">
                    {renderValue(field)}
                  </dd>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-border shrink-0">
          {actions}
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg font-medium border border-border bg-background hover:bg-muted transition-colors duration-200 text-sm"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};