'use client';

import React from 'react';
import { Filter, X } from 'lucide-react';
import { FilterInput } from './FilterInput';
import { FilterSelect, SelectOption } from './FilterSelect';

export interface FilterBarConfig {
  key: string;
  type: 'select' | 'input';
  label: string;
  placeholder?: string;
  options?: SelectOption[];
}

export interface FilterBarProps {
  configs: FilterBarConfig[];
  filters: Record<string, any>;
  onFilterChange: (key: string, value: any) => void;
  onResetAll?: () => void;
  showResetButton?: boolean;
  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  configs,
  filters,
  onFilterChange,
  onResetAll,
  showResetButton = true,
  className = ''
}) => {
  const hasActiveFilters = Object.values(filters).some(v => v && v !== '');
  
  const renderFilter = (config: FilterBarConfig) => {
    const value = filters[config.key] || '';
    
    switch (config.type) {
      case 'select':
        return (
          <FilterSelect
            key={config.key}
            value={value}
            onChange={(val) => onFilterChange(config.key, val)}
            options={config.options || []}
            placeholder={config.placeholder || config.label}
          />
        );
      
      case 'input':
      default:
        return (
          <FilterInput
            key={config.key}
            value={value}
            onChange={(val) => onFilterChange(config.key, val)}
            placeholder={config.placeholder || `Tìm ${config.label.toLowerCase()}...`}
          />
        );
    }
  };
  
  return (
    <div className={`bg-muted/30 rounded-lg p-4 border border-border ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-[16px] font-medium">Bộ lọc</span>
          {hasActiveFilters && (
            <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
              Đang lọc
            </span>
          )}
        </div>
        
        {showResetButton && hasActiveFilters && onResetAll && (
          <button
            onClick={onResetAll}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            <X className="w-3 h-3" />
            Xóa tất cả
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {configs.map(renderFilter)}
      </div>
    </div>
  );
};