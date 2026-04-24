// src/presentation/components/admin/templates/TemplateHtmlSource.tsx

interface TemplateHtmlSourceProps {
  htmlContent: string | null;
}

export function TemplateHtmlSource({ htmlContent }: TemplateHtmlSourceProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 px-4 py-3">
        <span className="text-xs font-medium text-gray-500">HTML Source</span>
        <span className="text-xs text-gray-400">
          {htmlContent?.length.toLocaleString() ?? 0} chars
        </span>
      </div>
      <pre 
        className="overflow-auto p-4 font-mono text-xs text-gray-700 dark:text-gray-300 leading-relaxed"
        style={{ maxHeight: "600px", tabSize: 2 }}
      >
        {htmlContent ?? "(trống)"}
      </pre>
    </div>
  );
}