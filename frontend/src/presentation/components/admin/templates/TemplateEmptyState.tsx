// src/presentation/components/admin/templates/TemplateEmptyState.tsx

import Link from "next/link";

interface TemplateEmptyStateProps {
  hasTemplates: boolean;
  hasFilters: boolean;
}

export function TemplateEmptyState({ hasTemplates, hasFilters }: TemplateEmptyStateProps) {
  return (
    <div className="py-24 text-center text-gray-400">
      <svg className="mx-auto mb-3 h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p className="text-[16px]">
        {!hasTemplates
          ? "Chưa có template nào. Hãy tạo template đầu tiên!"
          : "Không tìm thấy template phù hợp."}
      </p>
      {!hasTemplates && !hasFilters && (
        <Link
          href="/admin/templates/new"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-[16px] font-medium text-white hover:bg-indigo-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tạo template mới
        </Link>
      )}
    </div>
  );
}