// src/presentation/components/admin/templates/TemplatePreview.tsx

interface TemplatePreviewProps {
  htmlContent: string | null;
}

export function TemplatePreview({ htmlContent }: TemplatePreviewProps) {
  if (!htmlContent) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400">
        <div className="text-center">
          <svg className="mx-auto h-10 w-10 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-[16px]">Chưa có HTML content</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="overflow-hidden bg-gray-100 dark:bg-gray-800 px-4 py-6">
        <div
          className="mx-auto w-full max-w-full origin-top-left overflow-hidden rounded-lg bg-white shadow-md"
          style={{ aspectRatio: "210 / 297" }}
        >
          <iframe
            srcDoc={htmlContent}
            title="Template preview"
            className="h-full w-full border-0"
            sandbox="allow-same-origin"
            style={{ pointerEvents: "none" }}
          />
        </div>
      </div>
      <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-2.5 flex items-center gap-2">
        <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-xs text-gray-400">
          Preview hiển thị HTML thô — Thymeleaf expressions chưa được render bởi backend.
        </span>
      </div>
    </div>
  );
}