'use client';

import React from 'react';

export interface TableSkeletonProps {
  columns: number;
  rows?: number;
  selectable?: boolean;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({
  columns,
  rows = 5,
  selectable = false
}) => {
  const totalColumns = selectable ? columns + 1 : columns;
  
  return (
    <div className="animate-pulse">
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr className="border-b border-border">
              {Array.from({ length: totalColumns }).map((_, i) => (
                <th key={i} className="px-4 py-3">
                  <div className="h-4 bg-muted rounded w-20"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, rowIdx) => (
              <tr key={rowIdx} className="border-b border-border">
                {Array.from({ length: totalColumns }).map((_, colIdx) => (
                  <td key={colIdx} className="px-4 py-3">
                    <div className="h-4 bg-muted rounded w-full max-w-[200px]"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};