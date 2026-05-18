'use client';

import React from 'react';
import { Inbox, RefreshCw } from 'lucide-react';

export interface TableEmptyProps {
  message?: string;
  description?: string;
  onRefresh?: () => void;
  actionText?: string;
}

export const TableEmpty: React.FC<TableEmptyProps> = ({
  message = 'Không có dữ liệu',
  description = 'Hiện tại chưa có dữ liệu nào để hiển thị',
  onRefresh,
  actionText = 'Làm mới'
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Inbox className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-base font-medium text-foreground mb-1">{message}</h3>
      <p className="text-[16px] text-muted-foreground text-center mb-4">{description}</p>
      
      {onRefresh && (
        <button
          onClick={onRefresh}
          className="inline-flex items-center gap-2 px-4 py-2 text-[16px] font-medium rounded-lg border border-border bg-background hover:bg-muted transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          {actionText}
        </button>
      )}
    </div>
  );
};