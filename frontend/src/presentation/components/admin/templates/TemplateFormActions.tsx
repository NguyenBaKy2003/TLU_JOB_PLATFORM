// src/presentation/components/admin/templates/TemplateFormActions.tsx

import Link from "next/link";

interface TemplateFormActionsProps {
  isEdit: boolean;
  saving: boolean;
  isValid: boolean;
  backHref?: string;
  onToggleActive?: () => void;
  active?: boolean;
}

export function TemplateFormActions({
  isEdit,
  saving,
  isValid,
  backHref = "/admin/templates",
  onToggleActive,
  active,
}: TemplateFormActionsProps) {
  return (
    <div className={`mt-8 flex items-center gap-3 border-t border-gray-100 pt-6 dark:border-gray-800 ${isEdit ? "justify-between" : "justify-end"}`}>
      <Link
        href={backHref}
        className="rounded-lg border border-gray-200 px-4 py-2 text-[16px] text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
      >
        {isEdit ? "← Quay lại" : "Hủy"}
      </Link>

      <div className="flex items-center gap-3">
        {isEdit && onToggleActive && (
          <button
            type="button"
            onClick={onToggleActive}
            className={`rounded-lg border px-4 py-2 text-[16px] transition active:scale-95 ${
              active
                ? "border-orange-200 text-orange-600 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-400"
                : "border-green-200 text-green-600 hover:bg-green-50 dark:border-green-800 dark:text-green-400"
            }`}
          >
            {active ? "Đặt thành Ẩn" : "Đặt thành Hiện"}
          </button>
        )}

        <button
          type="submit"
          disabled={saving || !isValid}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-[16px] font-medium text-white transition hover:bg-indigo-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? (
            <>
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              {isEdit ? "Đang lưu..." : "Đang tạo..."}
            </>
          ) : (
            isEdit ? "Lưu thay đổi" : "Tạo template"
          )}
        </button>
      </div>
    </div>
  );
}