// src/presentation/components/admin/templates/TemplateFormBreadcrumb.tsx

import Link from "next/link";

interface TemplateFormBreadcrumbProps {
  templateName?: string;
  isEdit: boolean;
}

export function TemplateFormBreadcrumb({ templateName, isEdit }: TemplateFormBreadcrumbProps) {
  return (
    <nav className="mb-6 flex items-center gap-2 text-[16px] text-gray-500 dark:text-gray-400">
      <Link href="/admin/templates" className="hover:text-gray-700 dark:hover:text-gray-200">
        CV Templates
      </Link>
      <span>/</span>
      {isEdit && templateName ? (
        <>
          <span className="max-w-48 truncate text-gray-900 dark:text-white">{templateName}</span>
          <span>/</span>
          <span className="text-gray-900 dark:text-white">Chỉnh sửa</span>
        </>
      ) : (
        <span className="text-gray-900 dark:text-white">Tạo mới</span>
      )}
    </nav>
  );
}