'use client';

import React, { useState, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';

export interface SearchInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  loading?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  autoFocus?: boolean;
  clearable?: boolean;
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-[16px] pl-9 pr-8',
  md: 'px-4 py-2 text-base pl-10 pr-9',
  lg: 'px-5 py-3 text-lg pl-12 pr-10'
};

const iconSizes = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6'
};

export const SearchInput: React.FC<SearchInputProps> = ({
  value: externalValue = '',
  onChange,
  onSearch,
  placeholder = 'Tìm kiếm...',
  debounceMs = 300,
  loading = false,
  className = '',
  size = 'md',
  autoFocus = false,
  clearable = true
}) => {
  const [internalValue, setInternalValue] = useState(externalValue);
  
  useEffect(() => {
    setInternalValue(externalValue);
  }, [externalValue]);
  
  useEffect(() => {
    if (!onChange) return;
    
    const timer = setTimeout(() => {
      if (internalValue !== externalValue) {
        onChange(internalValue);
      }
    }, debounceMs);
    
    return () => clearTimeout(timer);
  }, [internalValue, debounceMs, onChange, externalValue]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
  };
  
  const handleClear = () => {
    setInternalValue('');
    onChange?.('');
    onSearch?.('');
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(internalValue);
    }
  };
  
  const handleSearchClick = () => {
    if (onSearch) {
      onSearch(internalValue);
    }
  };
  
  return (
    <div className={`relative ${className}`}>
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
        {loading ? (
          <Loader2 className={`${iconSizes[size]} animate-spin`} />
        ) : (
          <Search className={`${iconSizes[size]}`} />
        )}
      </div>
      
      <input
        type="text"
        value={internalValue}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={`
          w-full rounded-xl border border-input bg-background
          focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
          transition-all duration-200
          ${sizeClasses[size]}
          ${clearable && internalValue ? 'pr-16' : 'pr-4'}
        `}
      />
      
      {clearable && internalValue && (
        <button
          onClick={handleClear}
          className="absolute right-12 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Clear search"
        >
          <X className={iconSizes[size]} />
        </button>
      )}
      
      {onSearch && (
        <button
          onClick={handleSearchClick}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 rounded-lg text-[16px] font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Tìm
        </button>
      )}
    </div>
  );
};