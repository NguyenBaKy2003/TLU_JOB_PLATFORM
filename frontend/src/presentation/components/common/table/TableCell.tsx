'use client';

import React from 'react';
import { Column } from './useTable';

export interface TableCellProps<T = any> {
  column: Column<T>;
  record: T;
  index: number;
  align?: 'left' | 'center' | 'right';
}

export const TableCell: React.FC<TableCellProps> = ({
  column,
  record,
  index,
  align = 'left'
}) => {
  const value = record[column.key];
  const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';
  
  let content: React.ReactNode;
  if (column.render) {
    content = column.render(value, record, index);
  } else {
    content = value !== null && value !== undefined ? String(value) : '—';
  }
  
  return (
    <td className={`px-4 py-3 text-[16px] text-foreground ${alignClass} ${column.className || ''}`}>
      {content}
    </td>
  );
};