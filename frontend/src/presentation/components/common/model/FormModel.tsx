'use client';

import React, { useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';

export interface FormField {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'date';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  rows?: number;
  validation?: (value: any) => string | undefined;
}

export interface FormModelProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void | Promise<void>;
  title: string;
  fields: FormField[];
  initialData?: any;
  submitText?: string;
  loading?: boolean;
  disabled?: boolean;
}

export const FormModel: React.FC<FormModelProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  fields,
  initialData = {},
  submitText = 'Lưu',
  loading = false,
  disabled = false
}) => {
  const [formData, setFormData] = React.useState<any>(initialData);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData);
      setErrors({});
      setTouched({});
    }
  }, [isOpen, initialData]);

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

  const validateField = (name: string, value: any): string | undefined => {
    const field = fields.find(f => f.name === name);
    if (!field) return undefined;

    if (field.required && (!value || (typeof value === 'string' && !value.trim()))) {
      return `${field.label} là bắt buộc`;
    }

    if (field.validation) {
      return field.validation(value);
    }

    return undefined;
  };

  const validateAll = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    fields.forEach(field => {
      const error = validateField(field.name, formData[field.name]);
      if (error) {
        newErrors[field.name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (name: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error || '' }));
    }
  };

  const handleBlur = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, formData[name]);
    setErrors(prev => ({ ...prev, [name]: error || '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched: Record<string, boolean> = {};
    fields.forEach(field => {
      allTouched[field.name] = true;
    });
    setTouched(allTouched);
    
    if (validateAll()) {
      await onSubmit(formData);
    }
  };

  const renderField = (field: FormField) => {
    const value = formData[field.name] || '';
    const error = errors[field.name];
    const isTouched = touched[field.name];
    const showError = isTouched && error;
    
    const baseInputClass = `w-full px-3 py-2 rounded-lg border bg-background transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${
      showError 
        ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
        : 'border-input hover:border-primary/50'
    }`;

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            id={field.name}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            onBlur={() => handleBlur(field.name)}
            placeholder={field.placeholder}
            rows={field.rows || 3}
            className={baseInputClass}
            disabled={disabled}
          />
        );
      
      case 'select':
        return (
          <select
            id={field.name}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            onBlur={() => handleBlur(field.name)}
            className={baseInputClass}
            disabled={disabled}
          >
            <option value="">Chọn {field.label.toLowerCase()}</option>
            {field.options?.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        );
      
      default:
        return (
          <input
            type={field.type || 'text'}
            id={field.name}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            onBlur={() => handleBlur(field.name)}
            placeholder={field.placeholder}
            className={baseInputClass}
            disabled={disabled}
          />
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
      <div className="relative bg-background rounded-xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] flex flex-col transform transition-all duration-300 animate-in fade-in zoom-in-95">
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
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {fields.map(field => (
              <div key={field.name}>
                <label htmlFor={field.name} className="block text-sm font-medium mb-1.5">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {renderField(field)}
                {errors[field.name] && touched[field.name] && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors[field.name]}
                  </p>
                )}
              </div>
            ))}
          </div>
        </form>
        
        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg font-medium border border-border bg-background hover:bg-muted transition-colors duration-200"
          >
            Hủy
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading || disabled}
            className="px-4 py-2 rounded-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Đang xử lý...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {submitText}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};