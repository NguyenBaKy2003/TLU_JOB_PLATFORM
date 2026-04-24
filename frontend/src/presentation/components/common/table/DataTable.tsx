'use client';

import React from 'react';
import { TableHeader } from './TableHeader';
import { TableRow } from './TableRow';
import { TableSkeleton } from './TableSkeleton';
import { TableEmpty } from './TableEmpty';
import { TablePagination } from './TablePagination';
import { Column, useTable, UseTableOptions } from './useTable';

export interface DataTableProps<T = any> extends UseTableOptions<T> {
  loading?: boolean;
  selectable?: boolean;
  actions?: any[]; // Will be implemented in TableActions
  onRowClick?: (record: T) => void;
  onRefresh?: () => void;
  emptyMessage?: string;
  emptyDescription?: string;
  showPagination?: boolean;
  className?: string;
}

export function DataTable<T = any>({
  data,
  columns,
  loading = false,
  selectable = false,
  defaultSort,
  defaultPageSize = 10,
  onRowClick,
  onRefresh,
  emptyMessage,
  emptyDescription,
  showPagination = true,
  onSortChange,
  onPageChange,
  className = ''
}: DataTableProps<T>) {
  const {
    data: paginatedData,
    columns: tableColumns,
    sortConfig,
    handleSort,
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    startIndex,
    endIndex,
    goToPage,
    setItemsPerPage,
    selectedRows,
    selectRow,
    selectAllRows,
    isAllSelected,
    isIndeterminate,
    hasData,
    isEmpty
  } = useTable({
    data,
    columns,
    defaultSort,
    defaultPageSize,
    onSortChange,
    onPageChange
  });
  
  if (loading) {
    return <TableSkeleton columns={columns.length} selectable={selectable} />;
  }
  
  if (isEmpty) {
    return (
      <TableEmpty
        message={emptyMessage}
        description={emptyDescription}
        onRefresh={onRefresh}
      />
    );
  }
  
  return (
    <div className={`border border-border rounded-lg overflow-hidden bg-background ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <TableHeader
            columns={tableColumns}
            sortConfig={sortConfig}
            onSort={handleSort}
            selectable={selectable}
            isAllSelected={isAllSelected}
            isIndeterminate={isIndeterminate}
            onSelectAll={selectAllRows}
          />
          <tbody>
            {paginatedData.map((record, index) => (
              <TableRow
                key={record.id || index}
                record={record}
                columns={tableColumns}
                index={index}
                selectable={selectable}
                isSelected={selectable && selectedRows.has(record.id || index)}
                onSelect={() => selectRow(record.id || index)}
                onClick={onRowClick}
              />
            ))}
          </tbody>
        </table>
      </div>
      
      {showPagination && totalItems > 0 && (
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          startIndex={startIndex}
          endIndex={endIndex}
          pageSize={pageSize}
          onPageChange={goToPage}
          onPageSizeChange={setItemsPerPage}
        />
      )}
    </div>
  );
}