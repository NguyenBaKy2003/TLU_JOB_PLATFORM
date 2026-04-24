'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  pageSize: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  showTotal?: boolean;
}

export const TablePagination: React.FC<TablePaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  startIndex,
  endIndex,
  pageSize,
  pageSizeOptions = [10, 20, 50, 100],
  onPageChange,
  onPageSizeChange,
  showTotal = true
}) => {
  if (totalItems === 0) return null;
  
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };
  
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t border-border bg-muted/30 rounded-b-lg">
      {/* Left - Total info */}
      {showTotal && (
        <div className="text-sm text-muted-foreground">
          Hiển thị <span className="font-medium text-foreground">{startIndex}</span> -{' '}
          <span className="font-medium text-foreground">{endIndex}</span> trên{' '}
          <span className="font-medium text-foreground">{totalItems}</span> kết quả
        </div>
      )}
      
      {/* Right - Pagination controls */}
      <div className="flex items-center gap-2 flex-wrap justify-center">
        {/* Page size selector */}
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="px-2 py-1.5 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          {pageSizeOptions.map(size => (
            <option key={size} value={size}>{size} / trang</option>
          ))}
        </select>
        
        {/* Navigation buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="p-1.5 rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-1.5 rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          {getPageNumbers().map((page, idx) => (
            <button
              key={idx}
              onClick={() => typeof page === 'number' && onPageChange(page)}
              className={`
                min-w-[32px] h-8 px-2 rounded-md text-sm font-medium transition-colors
                ${page === currentPage 
                  ? 'bg-primary text-primary-foreground' 
                  : page === '...' 
                    ? 'cursor-default hover:bg-transparent' 
                    : 'hover:bg-muted'
                }
              `}
              disabled={page === '...'}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};