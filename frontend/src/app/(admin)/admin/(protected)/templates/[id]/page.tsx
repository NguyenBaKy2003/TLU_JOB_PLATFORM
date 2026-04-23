"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AdminCVTemplateRepository } from "@/infrastructure/repositories/AdminCVTemplateRepository";
import { AdminCVTemplateService } from "@/application/services/AdminCVTemplateService";
import type { CVTemplate } from "@/domain/models/CVTemplate";

// ─── DI ───────────────────────────────────────────────────────
const service = new AdminCVTemplateService(new AdminCVTemplateRepository());

// ─── Helpers ──────────────────────────────────────────────────

function CategoryBadge({ category }: { category: string | null }) {
  const map: Record<string, string> = {
    professional: "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:ring-blue-800",
    creative:     "bg-purple-50 text-purple-700 ring-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:ring-purple-800",
    simple:       "bg-gray-100 text-gray-600 ring-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700",
  };
  if (!category) return <span className="text-sm text-gray-400">—</span>;
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ring-1 ring-inset ${map[category] ?? "bg-gray-100 text-gray-600"}`}>
      {category.charAt(0).toUpperCase() + category.slice(1)}
    </span>
  );
}

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <span className="text-sm text-gray-500 dark:text-gray-400 min-w-28">{label}</span>
      <div className="flex-1 text-right">{children}</div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────

export default function AdminTemplateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [template, setTemplate] = useState<CVTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState(false);
  const [htmlTab, setHtmlTab] = useState<"preview" | "source">("preview");

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await service.getTemplate(id);
      setTemplate(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tải được template.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function handleToggle() {
    if (!template) return;
    setToggling(true);
    try {
      const updated = await service.toggleActive(template.id, !template.active);
      setTemplate(updated);
    } catch {
      alert("Không thể thay đổi trạng thái.");
    } finally {
      setToggling(false);
    }
  }

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6 h-4 w-64 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 h-[600px] animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800" />
            <div className="h-80 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800" />
          </div>
        </div>
      </div>
    );
  }

  // ── Error ──
  if (error || !template) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">{error ?? "Không tìm thấy template."}</p>
          <Link href="/admin/templates" className="text-sm text-indigo-600 hover:underline">
            ← Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Link href="/admin/templates" className="hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
            CV Templates
          </Link>
          <span>/</span>
          <span className="max-w-xs truncate text-gray-900 dark:text-white">{template.name}</span>
        </nav>

        {/* Page title row */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{template.name}</h1>
            {template.premium && (
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                Premium
              </span>
            )}
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${template.active ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${template.active ? "bg-green-500" : "bg-gray-400"}`} />
              {template.active ? "Active" : "Inactive"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={toggling}
              onClick={handleToggle}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition active:scale-95 disabled:opacity-50 ${
                template.active
                  ? "border-orange-200 text-orange-600 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-400"
                  : "border-green-200 text-green-600 hover:bg-green-50 dark:border-green-800 dark:text-green-400"
              }`}
            >
              {toggling ? "..." : template.active ? "Ẩn template" : "Kích hoạt"}
            </button>
            <Link
              href={`/admin/templates/${template.id}/edit`}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 active:scale-95"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Chỉnh sửa
            </Link>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* Left: Preview + Source */}
          <div className="lg:col-span-2 flex flex-col gap-4">

            {/* Tab bar */}
            <div className="flex items-center gap-1 rounded-xl bg-white border border-gray-200 p-1 dark:bg-gray-900 dark:border-gray-700 self-start">
              {(["preview", "source"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setHtmlTab(tab)}
                  className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${
                    htmlTab === tab
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                  }`}
                >
                  {tab === "preview" ? "Preview" : "HTML Source"}
                </button>
              ))}
            </div>

            {/* Preview */}
            {htmlTab === "preview" && (
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
                {template.htmlContent ? (
                  <div className="relative">
                    {/* Scale wrapper — simulate A4 */}
                    <div className="overflow-hidden bg-gray-100 dark:bg-gray-800 px-4 py-6">
                      <div
                        className="mx-auto w-full max-w-full origin-top-left overflow-hidden rounded-lg bg-white shadow-md"
                        style={{ aspectRatio: "210 / 297" }}
                      >
                        <iframe
                          srcDoc={template.htmlContent}
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
                ) : (
                  <div className="flex h-64 items-center justify-center text-gray-400">
                    <div className="text-center">
                      <svg className="mx-auto h-10 w-10 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-sm">Chưa có HTML content</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Source */}
            {htmlTab === "source" && (
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 px-4 py-3">
                  <span className="text-xs font-medium text-gray-500">HTML Source</span>
                  <span className="text-xs text-gray-400">
                    {template.htmlContent?.length.toLocaleString() ?? 0} chars
                  </span>
                </div>
                <pre className="overflow-auto p-4 font-mono text-xs text-gray-700 dark:text-gray-300 leading-relaxed"
                  style={{ maxHeight: "600px", tabSize: 2 }}>
                  {template.htmlContent ?? "(trống)"}
                </pre>
              </div>
            )}
          </div>

          {/* Right: Metadata */}
          <div className="flex flex-col gap-4">

            {/* Thumbnail */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
              <div className="aspect-video w-full bg-gradient-to-br from-indigo-50 to-slate-100 dark:from-indigo-950 dark:to-slate-900">
                {template.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={template.thumbnailUrl}
                    alt={template.name}
                    className="h-full w-full object-cover"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <svg className="h-10 w-10 text-indigo-200 dark:text-indigo-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Metadata card */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900 px-5 py-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Thông tin</p>

              <MetaRow label="Danh mục">
                <CategoryBadge category={template.category} />
              </MetaRow>

              <MetaRow label="Loại">
                {template.premium ? (
                  <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                    Premium
                  </span>
                ) : (
                  <span className="text-sm text-gray-600 dark:text-gray-300">Free</span>
                )}
              </MetaRow>

              <MetaRow label="Trạng thái">
                <span className={`text-sm font-medium ${template.active ? "text-green-600 dark:text-green-400" : "text-gray-400"}`}>
                  {template.active ? "Đang hiển thị" : "Đang ẩn"}
                </span>
              </MetaRow>

              <MetaRow label="Tạo lúc">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {template.createdAt ? new Date(template.createdAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—"}
                </span>
              </MetaRow>

              <MetaRow label="Cập nhật">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {template.updatedAt ? new Date(template.updatedAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—"}
                </span>
              </MetaRow>

              <MetaRow label="Template ID">
                <span className="font-mono text-xs text-gray-400 break-all">{template.id}</span>
              </MetaRow>
            </div>

            {/* Quick actions */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900 px-5 py-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Thao tác nhanh</p>
              <div className="flex flex-col gap-2">
                <Link
                  href={`/admin/templates/${template.id}/edit`}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-gray-700 transition hover:bg-indigo-50 hover:text-indigo-700 dark:text-gray-300 dark:hover:bg-indigo-950 dark:hover:text-indigo-300"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Chỉnh sửa template
                </Link>

                <button
                  onClick={handleToggle}
                  disabled={toggling}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition disabled:opacity-50 ${
                    template.active
                      ? "text-orange-600 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-950"
                      : "text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950"
                  }`}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={template.active ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" : "M15 12a3 3 0 11-6 0 3 3 0 016 0z"} />
                    {!template.active && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />}
                  </svg>
                  {template.active ? "Ẩn khỏi danh sách" : "Kích hoạt template"}
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
          </div>
        </div>
      </div>
    </div>
  );
}