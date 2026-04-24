import { useState, useCallback, useEffect, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  key: string;
  type: 'select' | 'input' | 'date' | 'daterange' | 'search';
  label: string;
  options?: FilterOption[];
  placeholder?: string;
  defaultValue?: any;
}

export interface UseFilterOptions {
  configs: FilterConfig[];
  syncWithUrl?: boolean;
  onFilterChange?: (filters: Record<string, any>) => void;
  debounceMs?: number;
}

export function useFilter(options: UseFilterOptions) {
  const { configs, syncWithUrl = true, onFilterChange, debounceMs = 300 } = options;
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Khởi tạo filters
  const getInitialFilters = useCallback(() => {
    const initial: Record<string, any> = {};
    
    configs.forEach(config => {
      if (syncWithUrl && searchParams.has(config.key)) {
        let value: any = searchParams.get(config.key);
        
        // Parse value based on type
        if (config.type === 'daterange' && value) {
          try {
            value = JSON.parse(value);
          } catch {
            value = null;
          }
        }
        
        initial[config.key] = value;
      } else if (config.defaultValue !== undefined) {
        initial[config.key] = config.defaultValue;
      } else {
        initial[config.key] = '';
      }
    });
    
    return initial;
  }, [configs, syncWithUrl, searchParams]);
  
  const [filters, setFilters] = useState<Record<string, any>>(getInitialFilters);
  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  
  // Debounce timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
    }, debounceMs);
    
    return () => clearTimeout(timer);
  }, [filters, debounceMs]);
  
  // Update URL
  useEffect(() => {
    if (!syncWithUrl) return;
    
    const params = new URLSearchParams();
    
    Object.entries(debouncedFilters).forEach(([key, value]) => {
      if (value && value !== '' && value !== null && value !== undefined) {
        if (typeof value === 'object') {
          params.set(key, JSON.stringify(value));
        } else {
          params.set(key, String(value));
        }
      }
    });
    
    const url = `${pathname}?${params.toString()}`;
    router.replace(url, { scroll: false });
  }, [debouncedFilters, syncWithUrl, pathname, router]);
  
  // Trigger onFilterChange
  useEffect(() => {
    onFilterChange?.(debouncedFilters);
  }, [debouncedFilters, onFilterChange]);
  
  // Count active filters
  useEffect(() => {
    const count = Object.values(filters).filter(v => 
      v !== '' && v !== null && v !== undefined && 
      !(Array.isArray(v) && v.length === 0) &&
      !(typeof v === 'object' && Object.keys(v).length === 0)
    ).length;
    setActiveFilterCount(count);
  }, [filters]);
  
  const setFilter = useCallback((key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);
  
  const setMultipleFilters = useCallback((newFilters: Record<string, any>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);
  
  const resetFilter = useCallback((key: string) => {
    const config = configs.find(c => c.key === key);
    setFilters(prev => ({ ...prev, [key]: config?.defaultValue || '' }));
  }, [configs]);
  
  const resetAllFilters = useCallback(() => {
    const defaultFilters: Record<string, any> = {};
    configs.forEach(config => {
      defaultFilters[config.key] = config.defaultValue || '';
    });
    setFilters(defaultFilters);
  }, [configs]);
  
  const hasActiveFilters = useMemo(() => activeFilterCount > 0, [activeFilterCount]);
  
  const getFilterValue = useCallback((key: string) => {
    return filters[key];
  }, [filters]);
  
  return {
    filters,
    debouncedFilters,
    setFilter,
    setMultipleFilters,
    resetFilter,
    resetAllFilters,
    activeFilterCount,
    hasActiveFilters,
    getFilterValue
  };
}