'use client';

import React from 'react';
import { Inbox, FolderOpen, Search, Users, Calendar, Package, Plus } from 'lucide-react';

export type EmptyStateIcon = 'inbox' | 'search' | 'folder' | 'users' | 'calendar' | 'package';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: EmptyStateIcon;
  actionText?: string;
  onAction?: () => void;
  className?: string;
  children?: React.ReactNode;
}

const iconMap: Record<EmptyStateIcon, React.ReactNode> = {
  inbox: <Inbox className="w-12 h-12" />,
  search: <Search className="w-12 h-12" />,
  folder: <FolderOpen className="w-12 h-12" />,
  users: <Users className="w-12 h-12" />,
  calendar: <Calendar className="w-12 h-12" />,
  package: <Package className="w-12 h-12" />
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Không có dữ liệu',
  description = 'Hiện tại chưa có dữ liệu nào để hiển thị',
  icon = 'inbox',
  actionText,
  onAction,
  className = '',
  children
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-12 px-4 ${className}`}>
      <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4 text-muted-foreground">
        {iconMap[icon]}
      </div>
      
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {title}
      </h3>
      
      <p className="text-sm text-muted-foreground max-w-md mb-6">
        {description}
      </p>
      
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 font-medium"
        >
          <Plus className="w-4 h-4" />
          {actionText}
        </button>
      )}
      
      {children}
    </div>
  );
};

// Compact version for tables/cards
export type CompactEmptyStateProps = Omit<EmptyStateProps, 'icon'>;

export const CompactEmptyState: React.FC<CompactEmptyStateProps> = ({
  title = 'Không có dữ liệu',
  description,
  actionText,
  onAction,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-8 px-4 ${className}`}>
      <Inbox className="w-10 h-10 text-muted-foreground mb-3" />
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description && (
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      )}
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-3 text-xs text-primary hover:underline"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};