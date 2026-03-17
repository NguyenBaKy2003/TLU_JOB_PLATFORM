"use client";

import React from "react";
import { Plus } from "lucide-react";

interface SectionCardProps {
  title: string;
  icon?: React.ReactNode;
  addLabel?: string;
  onAdd?: () => void;
  isEmpty?: boolean;
  emptyText?: string;
  children?: React.ReactNode;
  className?: string;
}

export function SectionCard({
  title,
  icon,
  addLabel,
  onAdd,
  isEmpty = true,
  emptyText,
  children,
  className = "",
}: SectionCardProps) {
  return (
    <section className={`bg-white rounded-2xl border border-gray-100 p-6 shadow-sm ${className}`}>
      <h2 className="flex items-center gap-2 text-[15px] font-semibold text-gray-800 mb-4">
        {icon && <span className="text-gray-500">{icon}</span>}
        {title}
      </h2>

      {isEmpty && !children ? (
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center gap-2 min-h-[80px]">
          {emptyText && (
            <p className="text-sm text-gray-400">{emptyText}</p>
          )}
          {addLabel && onAdd && (
            <button
              onClick={onAdd}
              className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              <Plus size={16} />
              {addLabel}
            </button>
          )}
        </div>
      ) : (
        <>
          {children}
          {addLabel && onAdd && (
            <button
              onClick={onAdd}
              className="mt-3 flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              <Plus size={16} />
              {addLabel}
            </button>
          )}
        </>
      )}
    </section>
  );
}