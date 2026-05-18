// src/presentation/components/admin/templates/TemplateFormError.tsx

import Link from "next/link";

interface TemplateFormErrorProps {
  message: string;
  onRetry: () => void;
  backHref?: string;
}

export function TemplateFormError({ 
  message, 
  onRetry, 
  backHref = "/admin/templates" 
}: TemplateFormErrorProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-800 dark:bg-red-950">
          <p className="text-red-600 dark:text-red-300">{message}</p>
          <div className="mt-4 flex justify-center gap-3">
            <button 
              onClick={onRetry} 
              className="rounded-lg border border-red-200 px-4 py-2 text-[16px] text-red-600 hover:bg-red-100 dark:border-red-700 dark:text-red-400"
            >
              Thử lại
            </button>
            <Link 
              href={backHref} 
              className="rounded-lg bg-red-600 px-4 py-2 text-[16px] text-white hover:bg-red-700"
            >
              Quay lại
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}