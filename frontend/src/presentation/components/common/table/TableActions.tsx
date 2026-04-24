'use client';

import React from 'react';
import { Eye, Edit, Trash2, MoreVertical, Copy, Archive, Lock, Unlock } from 'lucide-react';

export interface ActionItem<T = any> {
  key: string;
  label: string | ((record: T) => string);
  icon?: React.ReactNode | ((record: T) => React.ReactNode);
  onClick: (record: T) => void;
  color?: 'default' | 'danger' | 'success' | 'warning';
  disabled?: boolean | ((record: T) => boolean);
  hidden?: boolean | ((record: T) => boolean);
}

export interface TableActionsProps<T = any> {
  record: T;
  actions: ActionItem<T>[];
  showLabel?: boolean;
  className?: string;
}

const defaultIcons: Record<string, React.ReactNode> = {
  view: <Eye className="w-4 h-4" />,
  edit: <Edit className="w-4 h-4" />,
  delete: <Trash2 className="w-4 h-4" />,
  copy: <Copy className="w-4 h-4" />,
  archive: <Archive className="w-4 h-4" />,
  lock: <Lock className="w-4 h-4" />,
  unlock: <Unlock className="w-4 h-4" />,
  more: <MoreVertical className="w-4 h-4" />
};

const colorClasses = {
  default: 'text-muted-foreground hover:text-foreground hover:bg-muted',
  danger: 'text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30',
  success: 'text-green-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30',
  warning: 'text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-950/30'
};

export function TableActions<T = any>({
  record,
  actions,
  showLabel = false,
  className = ''
}: TableActionsProps<T>) {
  const visibleActions = actions.filter(action => {
    if (action.hidden === undefined) return true;
    if (typeof action.hidden === 'function') return !action.hidden(record);
    return !action.hidden;
  });
  
  if (visibleActions.length === 0) return null;
  
  const getLabel = (action: ActionItem<T>): string => {
    if (typeof action.label === 'function') {
      return action.label(record);
    }
    return action.label;
  };
  
  const getIcon = (action: ActionItem<T>): React.ReactNode => {
    if (action.icon) {
      if (typeof action.icon === 'function') {
        return action.icon(record);
      }
      return action.icon;
    }
    return defaultIcons[action.key] || defaultIcons.more;
  };
  
  const getDisabled = (action: ActionItem<T>): boolean => {
    if (action.disabled === undefined) return false;
    if (typeof action.disabled === 'function') return action.disabled(record);
    return action.disabled;
  };
  
  if (showLabel) {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {visibleActions.map(action => {
          const disabled = getDisabled(action);
          const color = action.color || 'default';
          
          return (
            <button
              key={action.key}
              onClick={() => !disabled && action.onClick(record)}
              disabled={disabled}
              className={`
                inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md
                transition-all duration-200
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                ${colorClasses[color]}
              `}
            >
              {getIcon(action)}
              {getLabel(action)}
            </button>
          );
        })}
      </div>
    );
  }
  
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {visibleActions.map(action => {
        const disabled = getDisabled(action);
        const color = action.color || 'default';
        
        return (
          <button
            key={action.key}
            onClick={() => !disabled && action.onClick(record)}
            disabled={disabled}
            title={getLabel(action)}
            className={`
              p-1.5 rounded-md transition-all duration-200
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              ${colorClasses[color]}
            `}
          >
            {getIcon(action)}
          </button>
        );
      })}
    </div>
  );
}