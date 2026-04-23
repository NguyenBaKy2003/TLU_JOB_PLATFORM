"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { AdminCVTemplateRepository } from "@/infrastructure/repositories/AdminCVTemplateRepository";
import { AdminCVTemplateService } from "@/application/services/AdminCVTemplateService";
import { TemplateFormData, TemplateFormFields } from "@/presentation/components/admin/templates/TemplateFormFields";

// ─── DI ───────────────────────────────────────────────────────
const service = new AdminCVTemplateService(new AdminCVTemplateRepository());

export default function EditTemplatePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [form, setForm] = useState<TemplateFormData>({
    name: "",
    thumbnailUrl: "",
    category: "",
    premium: false,
    htmlContent: "",
    active: true,
  });

  const [loadState, setLoadState] = useState<"loading" | "error" | "ready">("loading");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoadState("loading");
    setLoadError(null);
    try {
      const template = await service.getTemplate(id);
      setForm({
        name: template.name,
        thumbnailUrl: template.thumbnailUrl ?? "",
        category: template.category ?? "",
        premium: template.premium,
        htmlContent: template.htmlContent ?? "",
        active: template.active,
      });
      setLoadState("ready");
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Không tải được template.");
      setLoadState("error");
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  function handleChange(field: keyof TemplateFormData, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (saveError) setSaveError(null);
    setSavedAt(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      await service.updateTemplate(id, {
        name: form.name.trim(),
        thumbnailUrl: form.thumbnailUrl.trim() || null,
        category: (form.category || null) as "professional" | "creative" | "simple" | null,
        premium: form.premium,
        htmlContent: form.htmlContent,
        active: form.active ?? true,
      });
      setSavedAt(new Date());
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Cập nhật thất bại.");
    } finally {
      setSaving(false);
    }
  }

  const isValid = form.name.trim().length > 0 && form.htmlContent.trim().length > 0;

  // ── Loading state ──
  if (loadState === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="mx-auto max-w-3xl px-4 py-8">
          <div className="mb-6 h-4 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
            <div className="space-y-4 px-6 py-6">
              {[80, 60, 40, 100, 200].map((h, i) => (
                <div key={i} className={`h-${h > 60 ? "32" : "10"} animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800`} style={{ height: h }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (loadState === "error") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="mx-auto max-w-3xl px-4 py-8">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-800 dark:bg-red-950">
            <p className="text-red-600 dark:text-red-300">{loadError}</p>
            <div className="mt-4 flex justify-center gap-3">
              <button onClick={load} className="rounded-lg border border-red-200 px-4 py-2 text-sm text-red-600 hover:bg-red-100 dark:border-red-700 dark:text-red-400">
                Thử lại
              </button>
              <Link href="/admin/templates" className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700">
                Quay lại
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Ready ──
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">

        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Link href="/admin/templates" className="hover:text-gray-700 dark:hover:text-gray-200">
            CV Templates
          </Link>
          <span>/</span>
          <span className="max-w-48 truncate text-gray-900 dark:text-white">{form.name || id}</span>
          <span>/</span>
          <span className="text-gray-900 dark:text-white">Chỉnh sửa</span>
        </nav>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
          {/* Card header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5 dark:border-gray-800">
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                Chỉnh sửa template
              </h1>
              <p className="mt-0.5 font-mono text-xs text-gray-400">{id}</p>
            </div>

            {/* Save status */}
            {savedAt && (
              <span className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Đã lưu {savedAt.toLocaleTimeString("vi-VN")}
              </span>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-6">
            <TemplateFormFields
              data={form}
              onChange={handleChange}
              isEdit
              error={saveError}
            />

            {/* Actions */}
            <div className="mt-8 flex items-center justify-between gap-3 border-t border-gray-100 pt-6 dark:border-gray-800">
              <Link
                href="/admin/templates"
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                ← Quay lại
              </Link>

              <div className="flex items-center gap-3">
                {/* Quick toggle active without full save */}
                <button
                  type="button"
                  onClick={() => {
                    const newActive = !form.active;
                    handleChange("active", newActive);
                  }}
                  className={`rounded-lg border px-4 py-2 text-sm transition active:scale-95 ${
                    form.active
                      ? "border-orange-200 text-orange-600 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-400"
                      : "border-green-200 text-green-600 hover:bg-green-50 dark:border-green-800 dark:text-green-400"
                  }`}
                >
                  {form.active ? "Đặt thành Ẩn" : "Đặt thành Hiện"}
                </button>

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
                      Đang lưu...
                    </>
                  ) : (
                    "Lưu thay đổi"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}