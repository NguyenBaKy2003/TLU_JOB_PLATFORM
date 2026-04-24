// src/presentation/components/admin/templates/TemplateFormTips.tsx

export function TemplateFormTips() {
  return (
    <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 dark:border-blue-900 dark:bg-blue-950">
      <p className="text-xs font-medium text-blue-700 dark:text-blue-300">Tips</p>
      <ul className="mt-1 space-y-1 text-xs text-blue-600 dark:text-blue-400">
        <li>• Dùng nút <strong>Import file .html</strong> để upload file từ máy — tránh lỗi JSON escape</li>
        <li>• HTML phải là XHTML strict (tag tự đóng <code>{`<br/>`}</code>, attribute lowercase)</li>
        <li>• Biến <code>{`\${cv}`}</code>, <code>{`\${personalInfo}`}</code>, <code>{`\${sections}`}</code> — inject bởi backend khi export PDF</li>
      </ul>
    </div>
  );
}