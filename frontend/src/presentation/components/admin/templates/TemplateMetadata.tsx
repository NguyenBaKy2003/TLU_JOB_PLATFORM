// src/presentation/components/admin/templates/TemplateMetadata.tsx

import type { CVTemplate } from "@/domain/models/CVTemplate";
import { CategoryBadge } from "./CategoryBadge";
import { MetaRow } from "./MetaRow";

interface TemplateMetadataProps {
  template: CVTemplate;
}

export function TemplateMetadata({ template }: TemplateMetadataProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900 px-5 py-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Thông tin</p>

      <MetaRow label="Danh mục">
        <CategoryBadge category={template.category} />
      </MetaRow>

      <MetaRow label="Loại">
        {template.premium ? (
          <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900 dark:text-amber-300">
            Premium
          </span>
        ) : (
          <span className="text-[16px] text-gray-600 dark:text-gray-300">Free</span>
        )}
      </MetaRow>

      <MetaRow label="Trạng thái">
        <span className={`text-[16px] font-medium ${template.active ? "text-green-600 dark:text-green-400" : "text-gray-400"}`}>
          {template.active ? "Đang hiển thị" : "Đang ẩn"}
        </span>
      </MetaRow>

      <MetaRow label="Tạo lúc">
        <span className="text-[16px] text-gray-600 dark:text-gray-300">
          {template.createdAt 
            ? new Date(template.createdAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }) 
            : "—"}
        </span>
      </MetaRow>

      <MetaRow label="Cập nhật">
        <span className="text-[16px] text-gray-600 dark:text-gray-300">
          {template.updatedAt 
            ? new Date(template.updatedAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }) 
            : "—"}
        </span>
      </MetaRow>

      <MetaRow label="Template ID">
        <span className="font-mono text-xs text-gray-400 break-all">{template.id}</span>
      </MetaRow>
    </div>
  );
}