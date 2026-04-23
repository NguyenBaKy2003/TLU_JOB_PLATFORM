"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AdminCVTemplateRepository } from "@/infrastructure/repositories/AdminCVTemplateRepository";
import { AdminCVTemplateService } from "@/application/services/AdminCVTemplateService";
import { TemplateFormData, TemplateFormFields } from "@/presentation/components/admin/templates/TemplateFormFields";

// ─── DI ───────────────────────────────────────────────────────
const service = new AdminCVTemplateService(new AdminCVTemplateRepository());

const INITIAL: TemplateFormData = {
  name: "",
  thumbnailUrl: "",
  category: "",
  premium: false,
  htmlContent: "",
};

export default function NewTemplatePage() {
  const router = useRouter();
  const [form, setForm] = useState<TemplateFormData>(INITIAL);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(field: keyof TemplateFormData, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await service.createTemplate({
        name: form.name.trim(),
        thumbnailUrl: form.thumbnailUrl.trim() || null,
        category: (form.category || null) as "professional" | "creative" | "simple" | null,
        premium: form.premium,
        htmlContent: form.htmlContent,
      });
      router.push("/admin/templates");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tạo template thất bại.");
      setSaving(false);
    }
  }

  const isValid = form.name.trim().length > 0 && form.htmlContent.trim().length > 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">

        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Link href="/admin/templates" className="hover:text-gray-700 dark:hover:text-gray-200">
            CV Templates
          </Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white">Tạo mới</span>
        </nav>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
          {/* Card header */}
          <div className="border-b border-gray-100 px-6 py-5 dark:border-gray-800">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              Tạo CV Template mới
            </h1>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
              Viết HTML Thymeleaf XHTML hợp lệ để Flying Saucer render PDF.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-6">
            <TemplateFormFields
              data={form}
              onChange={handleChange}
              isEdit={false}
              error={error}
            />

            {/* Actions */}
            <div className="mt-8 flex items-center justify-end gap-3 border-t border-gray-100 pt-6 dark:border-gray-800">
              <Link
                href="/admin/templates"
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                Hủy
              </Link>
              <button
                type="submit"
                disabled={saving || !isValid}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Đang tạo...
                  </>
                ) : (
                  "Tạo template"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Tips */}
        <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 dark:border-blue-900 dark:bg-blue-950">
          <p className="text-xs font-medium text-blue-700 dark:text-blue-300">Tips</p>
          <ul className="mt-1 space-y-1 text-xs text-blue-600 dark:text-blue-400">
            <li>• Dùng nút <strong>Import file .html</strong> để upload file từ máy — tránh lỗi JSON escape</li>
            <li>• HTML phải là XHTML strict (tag tự đóng <code>{`<br/>`}</code>, attribute lowercase)</li>
            <li>• Biến <code>{`\${cv}`}</code>, <code>{`\${personalInfo}`}</code>, <code>{`\${sections}`}</code> — inject bởi backend khi export PDF</li>
          </ul>
        </div>
      </div>
    </div>
  );
}