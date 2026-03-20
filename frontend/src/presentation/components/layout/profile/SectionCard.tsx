"use client";

import React from "react";
import { Plus, Pencil } from "lucide-react";

interface SectionCardProps {
  title:      string;
  icon?:      React.ReactNode;
  addLabel?:  string;
  onAdd?:     () => void;
  onEdit?:    () => void;
  isEmpty?:   boolean;
  emptyText?: string;
  children?:  React.ReactNode;
  className?: string;
}

export function SectionCard({
  title, icon, addLabel, onAdd, onEdit,
  isEmpty = true, emptyText, children, className = "",
}: SectionCardProps) {
  return (
    <section className={`bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-4 gap-2">
        <h2 className="flex items-center gap-2 text-sm sm:text-[15px] font-semibold text-gray-800">
          {icon && <span className="text-gray-500 flex-shrink-0">{icon}</span>}
          <span className="truncate">{title}</span>
        </h2>
        <div className="flex items-center gap-2 flex-shrink-0">
          {onEdit && (
            <button onClick={onEdit}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
              aria-label="Chỉnh sửa">
              <Pencil size={14} />
            </button>
          )}
          {addLabel && onAdd && (
            <button onClick={onAdd}
              className="sm:hidden flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors">
              <Plus size={14} />{addLabel}
            </button>
          )}
        </div>
      </div>

      {isEmpty && !children ? (
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 sm:p-6 flex flex-col items-center justify-center gap-2 min-h-[80px]">
          {emptyText && <p className="text-sm text-gray-400 text-center">{emptyText}</p>}
          {addLabel && onAdd && (
            <button onClick={onAdd}
              className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
              <Plus size={16} />{addLabel}
            </button>
          )}
        </div>
      ) : (
        <>
          {children}
          {addLabel && onAdd && (
            <button onClick={onAdd}
              className="hidden sm:flex mt-3 items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
              <Plus size={16} />{addLabel}
            </button>
          )}
        </>
      )}
    </section>
  );
}