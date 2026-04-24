'use client';

import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

export interface FilterInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
  clearable?: boolean;
  autoFocus?: boolean;
}

export const FilterInput: React.FC<FilterInputProps> = ({
  value,
  onChange,
  placeholder = 'Tìm kiếm...',
  debounceMs = 300,
  className = '',
  clearable = true,
  autoFocus = false
}) => {
  const [localValue, setLocalValue] = useState(value);
  
  useEffect(() => {
    setLocalValue(value);
  }, [value]);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, debounceMs);
    
    return () => clearTimeout(timer);
  }, [localValue, debounceMs, onChange, value]);
  
  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };
  
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full pl-9 pr-8 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
      />
      {clearable && localValue && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};