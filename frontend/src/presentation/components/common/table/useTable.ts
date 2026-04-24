'use client';

import { useState, useCallback, useMemo } from 'react';

export interface Column<T = any> {
  key: string;
  title: string;
  width?: string | number;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export interface UseTableOptions<T = any> {
  data: T[];
  columns: Column<T>[];
  defaultSort?: SortConfig;
  defaultPageSize?: number;
  onSortChange?: (sortConfig: SortConfig | null) => void;
  onPageChange?: (page: number, pageSize: number) => void;
}

export function useTable<T = any>(options: UseTableOptions<T>) {
  const {
    data,
    columns,
    defaultSort,
    defaultPageSize = 10,
    onSortChange,
    onPageChange
  } = options;

  const [sortConfig, setSortConfig] = useState<SortConfig | null>(defaultSort || null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal === bVal) return 0;
      
      let comparison = 0;
      if (aVal === null || aVal === undefined) comparison = -1;
      else if (bVal === null || bVal === undefined) comparison = 1;
      else if (typeof aVal === 'string' && typeof bVal === 'string') {
        comparison = aVal.localeCompare(bVal, 'vi');
      } else {
        comparison = aVal < bVal ? -1 : 1;
      }
      
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [data, sortConfig]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return sortedData.slice(start, end);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = useMemo(() => Math.ceil(sortedData.length / pageSize), [sortedData.length, pageSize]);
  const totalItems = sortedData.length;
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalItems);

  // Sort handlers
  const handleSort = useCallback((key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig && sortConfig.key === key) {
      direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
    }
    
    const newSortConfig: SortConfig = { key, direction };
    setSortConfig(newSortConfig);
    onSortChange?.(newSortConfig);
  }, [sortConfig, onSortChange]);

  const clearSort = useCallback(() => {
    setSortConfig(null);
    onSortChange?.(null);
  }, [onSortChange]);

  // Pagination handlers
  const goToPage = useCallback((page: number) => {
    const newPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(newPage);
    onPageChange?.(newPage, pageSize);
  }, [totalPages, pageSize, onPageChange]);

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  }, [currentPage, totalPages, goToPage]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  }, [currentPage, goToPage]);

  const setItemsPerPage = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
    onPageChange?.(1, size);
  }, [onPageChange]);

  // Row selection handlers
  const selectRow = useCallback((id: string | number) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const selectAllRows = useCallback(() => {
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set());
    } else {
      const ids = paginatedData.map((item, idx) => item.id || idx);
      setSelectedRows(new Set(ids));
    }
  }, [selectedRows.size, paginatedData]);

  const clearSelection = useCallback(() => {
    setSelectedRows(new Set());
  }, []);

  const isRowSelected = useCallback((id: string | number) => {
    return selectedRows.has(id);
  }, [selectedRows]);

  const selectedCount = selectedRows.size;

  return {
    // Data
    data: paginatedData,
    allData: sortedData,
    columns,
    
    // Sort
    sortConfig,
    handleSort,
    clearSort,
    
    // Pagination
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    startIndex,
    endIndex,
    goToPage,
    nextPage,
    prevPage,
    setItemsPerPage,
    
    // Selection
    selectedRows,
    selectedCount,
    selectRow,
    selectAllRows,
    clearSelection,
    isRowSelected,
    isAllSelected: selectedRows.size === paginatedData.length && paginatedData.length > 0,
    isIndeterminate: selectedRows.size > 0 && selectedRows.size < paginatedData.length,
    
    // Utilities
    hasData: paginatedData.length > 0,
    isEmpty: paginatedData.length === 0
  };
}