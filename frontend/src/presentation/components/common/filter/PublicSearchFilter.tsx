'use client';

import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { FilterSelect, SelectOption } from './FilterSelect';

export interface PublicSearchFilterProps {
  onSearch: (keyword: string, filters?: Record<string, any>) => void;
  categories?: SelectOption[];
  placeholder?: string;
  className?: string;
  loading?: boolean;
}

export const PublicSearchFilter: React.FC<PublicSearchFilterProps> = ({
  onSearch,
  categories = [],
  placeholder = 'Tìm kiếm...',
  className = '',
  loading = false
}) => {
  const [keyword, setKeyword] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [category, setCategory] = useState('');
  
  const handleSearch = () => {
    const filters: Record<string, any> = {};
    if (category) filters.category = category;
    onSearch(keyword, filters);
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  const handleClear = () => {
    setKeyword('');
    setCategory('');
    onSearch('', {});
  };
  
  const hasActiveFilters = keyword || category;
  
  return (
    <div className={`${className}`}>
      <div className="relative flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="w-full pl-12 pr-4 py-3 text-base rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
          />
        </div>
        
        {categories.length > 0 && (
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-3 rounded-xl border transition-all duration-200 flex items-center gap-2 ${
              showFilters || hasActiveFilters
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-input bg-background hover:bg-muted'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Lọc</span>
          </button>
        )}
        
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-6 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            'Tìm kiếm'
          )}
        </button>
      </div>
      
      {/* Filter Panel */}
      {showFilters && categories.length > 0 && (
        <div className="mt-3 p-4 bg-muted/30 rounded-xl border border-border animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Bộ lọc nâng cao</span>
            <button
              onClick={() => setShowFilters(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FilterSelect
              value={category}
              onChange={setCategory}
              options={categories}
              placeholder="Danh mục"
              clearable
            />
          </div>
          
          <div className="flex justify-end gap-2 mt-3">
            {hasActiveFilters && (
              <button
                onClick={handleClear}
                className="px-3 py-1.5 text-sm rounded-lg border border-border bg-background hover:bg-muted"
              >
                Xóa tất cả
              </button>
            )}
            <button
              onClick={() => {
                setShowFilters(false);
                handleSearch();
              }}
              className="px-3 py-1.5 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Áp dụng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};