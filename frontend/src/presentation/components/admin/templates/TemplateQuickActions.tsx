// src/presentation/components/admin/templates/TemplateQuickActions.tsx

import Link from "next/link";

interface TemplateQuickActionsProps {
  templateId: string;
  active: boolean;
  toggling: boolean;
  onToggle: () => void;
}

export function TemplateQuickActions({ templateId, active, toggling, onToggle }: TemplateQuickActionsProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900 px-5 py-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Thao tác nhanh</p>
      <div className="flex flex-col gap-2">
        <Link
          href={`/admin/templates/${templateId}/edit`}
          className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-gray-700 transition hover:bg-indigo-50 hover:text-indigo-700 dark:text-gray-300 dark:hover:bg-indigo-950 dark:hover:text-indigo-300"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          Chỉnh sửa template
        </Link>

        <button
          onClick={onToggle}
          disabled={toggling}
          className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition disabled:opacity-50 ${
            active
              ? "text-orange-600 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-950"
              : "text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950"
          }`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {active ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            ) : (
              <>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </>
            )}
          </svg>
          {active ? "Ẩn khỏi danh sách" : "Kích hoạt template"}
        </button>

        <Link
          href="/admin/templates"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-gray-500 transition hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Quay lại danh sách
        </Link>
      </div>
    </div>
  );
}