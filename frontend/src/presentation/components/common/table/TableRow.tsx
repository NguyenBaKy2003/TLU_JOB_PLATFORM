'use client';

import React from 'react';
import { TableCell } from './TableCell';
import { Column } from './useTable';

export interface TableRowProps<T = any> {
  record: T;
  columns: Column<T>[];
  index: number;
  selectable?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  onClick?: (record: T) => void;
  className?: string;
}

export const TableRow: React.FC<TableRowProps> = ({
  record,
  columns,
  index,
  selectable = false,
  isSelected = false,
  onSelect,
  onClick,
  className = ''
}) => {
  const handleRowClick = () => {
    if (onClick) {
      onClick(record);
    }
  };
  
  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect?.();
  };
  
  return (
    <tr
      onClick={handleRowClick}
      className={`
        border-b border-border transition-colors
        ${onClick ? 'cursor-pointer hover:bg-muted/30' : ''}
        ${isSelected ? 'bg-primary/5' : ''}
        ${className}
      `}
    >
      {selectable && (
        <td className="w-10 px-4 py-3" onClick={handleCheckboxClick}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => {}}
            className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
          />
        </td>
      )}
      
      {columns.map((column, colIndex) => (
        <TableCell
          key={column.key}
          column={column}
          record={record}
          index={index}
          align={column.align}
        />
      ))}
    </tr>
  );
};