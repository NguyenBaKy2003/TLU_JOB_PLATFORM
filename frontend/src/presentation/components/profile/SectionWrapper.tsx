"use client";

import {  SquarePen } from "lucide-react";
import { ReactNode } from "react";

interface SectionWrapperProps {
  title: string;
  icon: ReactNode;
  onEdit?: () => void;
  children: ReactNode;
  editing?: boolean;
}

export default function SectionWrapper({
  title,
  icon,
  onEdit,
  children,
  editing = false,
}: SectionWrapperProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-gray-500">{icon}</span>
          <h3 className="text-[16px] font-semibold text-gray-900">{title}</h3>
        </div>
        {!editing && onEdit && (
          <button
            onClick={onEdit}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >

            <SquarePen size={18} className="text-blue-500" />
          </button>
        )}
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}