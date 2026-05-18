'use client';

import React from 'react';
import { FilterInput } from './FilterInput';
import { FilterSelect, SelectOption } from './FilterSelect';
import { Calendar, Download, RefreshCw } from 'lucide-react';

export interface AdminFilterConfig {
  searchKey?: string;
  statusKey?: string;
  dateKey?: string;
  customFilters?: {
    key: string;
    label: string;
    options: SelectOption[];
  }[];
}

export interface AdminFilterProps {
  config: AdminFilterConfig;
  filters: Record<string, any>;
  onFilterChange: (key: string, value: any) => void;
  onReset: () => void;
  onExport?: () => void;
  onRefresh?: () => void;
  searchPlaceholder?: string;
  statusOptions?: SelectOption[];
  statusPlaceholder?: string;
  showDateFilter?: boolean;
  loading?: boolean;
}

export const AdminFilter: React.FC<AdminFilterProps> = ({
  config,
  filters,
  onFilterChange,
  onReset,
  onExport,
  onRefresh,
  searchPlaceholder = 'Tìm kiếm theo tên, email, số điện thoại...',
  statusOptions = [],
  statusPlaceholder = 'Tất cả trạng thái',
  showDateFilter = true,
  loading = false
}) => {
  const searchValue = filters[config.searchKey || 'search'] || '';
  const statusValue = filters[config.statusKey || 'status'] || '';
  const dateValue = filters[config.dateKey || 'date'] || '';
  
  const hasActiveFilters = Object.values(filters).some(v => v && v !== '');
  
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-border p-4 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 min-w-[200px]">
          <FilterInput
            value={searchValue}
            onChange={(val) => onFilterChange(config.searchKey || 'search', val)}
            placeholder={searchPlaceholder}
            clearable
          />
        </div>
        
        {/* Status Filter */}
        {statusOptions.length > 0 && (
          <div className="w-full lg:w-48">
            <FilterSelect
              value={statusValue}
              onChange={(val) => onFilterChange(config.statusKey || 'status', val)}
              options={statusOptions}
              placeholder={statusPlaceholder}
              clearable
            />
          </div>
        )}
        
        {/* Date Filter */}
        {showDateFilter && (
          <div className="w-full lg:w-48">
            <div className="relative">
              <input
                type="date"
                value={dateValue}
                onChange={(e) => onFilterChange(config.dateKey || 'date', e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-[16px] rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        )}
        
        {/* Custom Filters */}
        {config.customFilters?.map(custom => (
          <div key={custom.key} className="w-full lg:w-48">
            <FilterSelect
              value={filters[custom.key] || ''}
              onChange={(val) => onFilterChange(custom.key, val)}
              options={custom.options}
              placeholder={custom.label}
              clearable
            />
          </div>
        ))}
        
        {/* Action Buttons */}
        <div className="flex gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              className="px-3 py-2 rounded-lg border border-border bg-background hover:bg-muted transition-colors disabled:opacity-50"
              title="Làm mới"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          )}
          
          {onExport && (
            <button
              onClick={onExport}
              className="px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Xuất</span>
            </button>
          )}
          
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="px-3 py-2 rounded-lg border border-border bg-background hover:bg-muted transition-colors text-[16px]"
            >
              Xóa lọc
            </button>
          )}
        </div>
      </div>
    </div>
  );
};