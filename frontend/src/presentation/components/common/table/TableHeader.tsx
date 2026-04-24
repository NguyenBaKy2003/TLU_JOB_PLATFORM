'use client';

import React from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { Column, SortConfig } from './useTable';

export interface TableHeaderProps<T = any> {
  columns: Column<T>[];
  sortConfig: SortConfig | null;
  onSort: (key: string) => void;
  selectable?: boolean;
  isAllSelected?: boolean;
  isIndeterminate?: boolean;
  onSelectAll?: () => void;
}

export const TableHeader: React.FC<TableHeaderProps> = ({
  columns,
  sortConfig,
  onSort,
  selectable = false,
  isAllSelected = false,
  isIndeterminate = false,
  onSelectAll
}) => {
  const getSortIcon = (key: string) => {
    if (sortConfig?.key !== key) {
      return <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="w-3.5 h-3.5" />
      : <ArrowDown className="w-3.5 h-3.5" />;
  };

  return (
    <thead className="bg-muted/50">
      <tr className="border-b border-border">
        {selectable && (
          <th className="w-10 px-4 py-3 text-left">
            <input
              type="checkbox"
              checked={isAllSelected}
              ref={input => {
                if (input) {
                  input.indeterminate = isIndeterminate;
                }
              }}
              onChange={onSelectAll}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
            />
          </th>
        )}
        
        {columns.map(column => {
          const isSortable = column.sortable !== false;
          const align = column.align || 'left';
          
          let alignClass = 'text-left';
          if (align === 'center') alignClass = 'text-center';
          if (align === 'right') alignClass = 'text-right';
          
          return (
            <th
              key={column.key}
              className={`px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider ${alignClass} ${column.className || ''}`}
              style={{ width: column.width }}
            >
              {isSortable ? (
                <button
                  onClick={() => onSort(column.key)}
                  className={`flex items-center gap-1.5 hover:text-foreground transition-colors ${alignClass}`}
                >
                  {column.title}
                  {getSortIcon(column.key)}
                </button>
              ) : (
                <span>{column.title}</span>
              )}
            </th>
          );
        })}
      </tr>
    </thead>
  );
};