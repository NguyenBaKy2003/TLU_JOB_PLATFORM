'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  showFirstLast?: boolean;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  showFirstLast = true,
  className = ''
}) => {
  if (totalPages <= 1) return null;

  const range = (start: number, end: number) => {
    const length = end - start + 1;
    return Array.from({ length }, (_, i) => start + i);
  };

  const getPaginationRange = () => {
    const totalPageNumbers = siblingCount * 2 + 5;
    
    if (totalPageNumbers >= totalPages) {
      return range(1, totalPages);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);
    const showLeftDots = leftSiblingIndex > 2;
    const showRightDots = rightSiblingIndex < totalPages - 2;
    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    if (!showLeftDots && showRightDots) {
      const leftRange = range(1, 3 + siblingCount * 2);
      return [...leftRange, '...', totalPages];
    }

    if (showLeftDots && !showRightDots) {
      const rightRange = range(totalPages - (3 + siblingCount * 2) + 1, totalPages);
      return [firstPageIndex, '...', ...rightRange];
    }

    if (showLeftDots && showRightDots) {
      const middleRange = range(leftSiblingIndex, rightSiblingIndex);
      return [firstPageIndex, '...', ...middleRange, '...', lastPageIndex];
    }

    return range(1, totalPages);
  };

  const pages = getPaginationRange();

  return (
    <nav className={`flex items-center justify-center gap-1 ${className}`}>
      {showFirstLast && (
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border border-border bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          aria-label="First page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>
      )}
      
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg border border-border bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      
      <div className="flex gap-1">
        {pages.map((page, index) => {
          if (page === '...') {
            return (
              <span
                key={`dots-${index}`}
                className="px-3 py-2 text-sm text-muted-foreground"
              >
                ...
              </span>
            );
          }
          
          const pageNumber = page as number;
          const isActive = pageNumber === currentPage;
          
          return (
            <button
              key={pageNumber}
              onClick={() => onPageChange(pageNumber)}
              className={`
                min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-all duration-200
                ${isActive 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'border border-border bg-background hover:bg-muted'
                }
              `}
            >
              {pageNumber}
            </button>
          );
        })}
      </div>
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg border border-border bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        aria-label="Next page"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
      
      {showFirstLast && (
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg border border-border bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          aria-label="Last page"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      )}
    </nav>
  );
};