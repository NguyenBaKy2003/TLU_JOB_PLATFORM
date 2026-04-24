// src/presentation/components/admin/templates/TemplateCard.tsx

import Link from "next/link";
import type { CVTemplate } from "@/domain/models/AdminTemplates";
import { TEMPLATE_CATEGORY_LABELS, TEMPLATE_CATEGORY_COLORS } from "@/domain/models/AdminTemplates";

interface TemplateCardProps {
  template: CVTemplate;
  onToggle: (id: string, active: boolean) => void;
  onDelete: (id: string) => void;
  toggling: boolean;
  deleting: boolean;
  deleteConfirmId: string | null;
}

function CategoryBadge({ category }: { category: CVTemplate['category'] }) {
  if (!category) return null;
  
  return (
    <span 
      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
      style={{
        backgroundColor: TEMPLATE_CATEGORY_COLORS[category] + '20',
        color: TEMPLATE_CATEGORY_COLORS[category]
      }}
    >
      {TEMPLATE_CATEGORY_LABELS[category]}
    </span>
  );
}

function StatusDot({ active }: { active: boolean }) {
  return (
    <span className="flex items-center gap-1 text-xs">
      <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-green-500' : 'bg-gray-400'}`} />
      <span className={active ? 'text-green-600' : 'text-gray-500'}>
        {active ? 'Active' : 'Inactive'}
      </span>
    </span>
  );
}

export function TemplateCard({
  template,
  onToggle,
  onDelete,
  toggling,
  deleting,
  deleteConfirmId,
}: TemplateCardProps) {
  const isConfirming = deleteConfirmId === template.id;

  return (
    <div className={`group flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-md dark:bg-gray-900 ${
      template.active 
        ? "border-gray-200 dark:border-gray-700" 
        : "border-dashed border-gray-200 opacity-60 dark:border-gray-700"
    }`}>
      {/* Thumbnail */}
      <div className="relative h-40 overflow-hidden bg-gradient-to-br from-indigo-50 to-slate-100 dark:from-indigo-950 dark:to-slate-900">
        {template.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            src={template.thumbnailUrl} 
            alt={template.name} 
            className="h-full w-full object-cover transition group-hover:scale-105" 
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <svg className="h-10 w-10 text-indigo-200 dark:text-indigo-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        )}
        {template.premium && (
          <div className="absolute right-2 top-2 rounded-full bg-amber-400 px-2 py-0.5 text-xs font-semibold text-amber-900">
            Premium
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="font-medium text-gray-900 dark:text-gray-100 line-clamp-1">{template.name}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <CategoryBadge category={template.category} />
            <StatusDot active={template.active} />
          </div>
        </div>

        <p className="text-xs text-gray-400">
          {template.updatedAt
            ? `Cập nhật ${new Date(template.updatedAt).toLocaleDateString("vi-VN")}`
            : template.createdAt
            ? `Tạo ${new Date(template.createdAt).toLocaleDateString("vi-VN")}`
            : "—"}
        </p>

        {/* Actions */}
        <div className="mt-auto flex items-center gap-2 border-t border-gray-100 pt-3 dark:border-gray-800">
          <Link
            href={`/admin/templates/${template.id}/edit`}
            className="flex-1 rounded-lg border border-gray-200 py-1.5 text-center text-xs font-medium text-gray-600 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-gray-700 dark:text-gray-400 dark:hover:text-indigo-400"
          >
            Chỉnh sửa
          </Link>

          <button
            disabled={toggling}
            onClick={() => onToggle(template.id, !template.active)}
            className={`flex-1 rounded-lg border py-1.5 text-xs font-medium transition disabled:opacity-50 ${
              template.active
                ? "border-orange-200 text-orange-600 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-400"
                : "border-green-200 text-green-600 hover:bg-green-50 dark:border-green-800 dark:text-green-400"
            }`}
          >
            {toggling ? "..." : template.active ? "Ẩn" : "Hiện"}
          </button>

          <button
            disabled={deleting}
            onClick={() => onDelete(template.id)}
            className={`rounded-lg border p-1.5 transition disabled:opacity-50 ${
              isConfirming
                ? "border-red-400 bg-red-50 text-red-600 dark:border-red-600 dark:bg-red-950 dark:text-red-400"
                : "border-red-100 text-red-400 hover:border-red-300 hover:text-red-600 dark:border-red-900 dark:text-red-500"
            }`}
            title={isConfirming ? "Nhấn lần nữa để xác nhận xóa" : "Xóa template"}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}