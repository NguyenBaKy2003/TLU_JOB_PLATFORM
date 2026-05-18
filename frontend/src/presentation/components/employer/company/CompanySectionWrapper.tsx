// src/presentation/components/company-profile/CompanySectionWrapper.tsx
"use client";
import { Pencil } from "lucide-react";

interface Props {
  title:    string;
  icon:     React.ReactNode;
  editing?: boolean;
  onEdit?:  () => void;
  actionButton?: React.ReactNode;  // Thêm prop cho nút tùy chỉnh
  children: React.ReactNode;
}

export function CompanySectionWrapper({ 
  title, 
  icon, 
  editing, 
  onEdit, 
  actionButton,  // Thêm actionButton
  children 
}: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
        <div className="flex items-center gap-2.5">
          <span className="text-gray-400">{icon}</span>
          <h3 className="text-[16px] font-semibold text-gray-800">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          {/* Action button (Thêm, Upload, etc.) - ưu tiên hiển thị trước */}
          {actionButton}
          {/* Edit button - chỉ hiển thị khi có onEdit và không ở chế độ editing */}
          {onEdit && !editing && (
            <button onClick={onEdit}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              <Pencil size={14} />
            </button>
          )}
        </div>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}