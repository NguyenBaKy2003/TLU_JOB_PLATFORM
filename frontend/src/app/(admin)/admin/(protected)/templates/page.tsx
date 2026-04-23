"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { AdminCVTemplateRepository } from "@/infrastructure/repositories/AdminCVTemplateRepository";
import { AdminCVTemplateService } from "@/application/services/AdminCVTemplateService";
import type { CVTemplate } from "@/domain/models/CVTemplate";

// ─── DI ───────────────────────────────────────────────────────
const service = new AdminCVTemplateService(new AdminCVTemplateRepository());

// ─── Sub-components ───────────────────────────────────────────

function CategoryBadge({ category }: { category: string | null }) {
  const map: Record<string, string> = {
    professional: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    creative: "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
    simple: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
  };
  if (!category) return null;
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${map[category] ?? "bg-gray-100 text-gray-600"}`}>
      {category}
    </span>
  );
}

function StatusDot({ active }: { active: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs ${active ? "text-green-600 dark:text-green-400" : "text-gray-400"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"}`} />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function TemplateCard({
  template,
  onToggle,
  onDelete,
  toggling,
  deleting,
}: {
  template: CVTemplate;
  onToggle: (id: string, active: boolean) => void;
  onDelete: (id: string) => void;
  toggling: boolean;
  deleting: boolean;
}) {
  return (
    <div className={`group flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-md dark:bg-gray-900 ${template.active ? "border-gray-200 dark:border-gray-700" : "border-dashed border-gray-200 opacity-60 dark:border-gray-700"}`}>
      {/* Thumbnail */}
      <div className="relative h-40 overflow-hidden bg-gradient-to-br from-indigo-50 to-slate-100 dark:from-indigo-950 dark:to-slate-900">
        {template.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={template.thumbnailUrl} alt={template.name} className="h-full w-full object-cover transition group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <svg className="h-10 w-10 text-indigo-200 dark:text-indigo-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        )}
        {template.premium && (
          <div className="absolute right-2 top-2 rounded-full bg-amber-400 px-2 py-0.5 text-xs font-semibold text-amber-900">
            Premium
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="font-medium text-gray-900 dark:text-gray-100 line-clamp-1">{template.name}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <CategoryBadge category={template.category} />
            <StatusDot active={template.active} />
          </div>
        </div>

        <p className="text-xs text-gray-400">
          {template.updatedAt
            ? `Cập nhật ${new Date(template.updatedAt).toLocaleDateString("vi-VN")}`
            : `Tạo ${template.createdAt ? new Date(template.createdAt).toLocaleDateString("vi-VN") : "—"}`}
        </p>

        {/* Actions */}
        <div className="mt-auto flex items-center gap-2 border-t border-gray-100 pt-3 dark:border-gray-800">
          <Link
            href={`/admin/templates/${template.id}/edit`}
            className="flex-1 rounded-lg border border-gray-200 py-1.5 text-center text-xs font-medium text-gray-600 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-gray-700 dark:text-gray-400 dark:hover:text-indigo-400"
          >
            Chỉnh sửa
          </Link>

          <button
            disabled={toggling}
            onClick={() => onToggle(template.id, !template.active)}
            className={`flex-1 rounded-lg border py-1.5 text-xs font-medium transition disabled:opacity-50 ${
              template.active
                ? "border-orange-200 text-orange-600 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-400"
                : "border-green-200 text-green-600 hover:bg-green-50 dark:border-green-800 dark:text-green-400"
            }`}
          >
            {toggling ? "..." : template.active ? "Ẩn" : "Hiện"}
          </button>

          <button
            disabled={deleting}
            onClick={() => onDelete(template.id)}
            className="rounded-lg border border-red-100 p-1.5 text-red-400 transition hover:border-red-300 hover:text-red-600 disabled:opacity-50 dark:border-red-900 dark:text-red-500"
            title="Xóa template"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<CVTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState<"" | "active" | "inactive">("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await service.listTemplates();
      setTemplates(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tải được danh sách template.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleToggle(id: string, active: boolean) {
    setTogglingId(id);
    try {
      const updated = await service.toggleActive(id, active);
      setTemplates((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch {
      alert("Không thể thay đổi trạng thái.");
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(id: string) {
    if (deleteConfirmId !== id) {
      setDeleteConfirmId(id);
      return;
    }
    setDeletingId(id);
    try {
      await service.deleteTemplate(id);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    } catch {
      alert("Không thể xóa template.");
    } finally {
      setDeletingId(null);
      setDeleteConfirmId(null);
    }
  }

  const filtered = templates.filter((t) => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = !filterCategory || t.category === filterCategory;
    const matchStatus =
      !filterStatus ||
      (filterStatus === "active" ? t.active : !t.active);
    return matchSearch && matchCat && matchStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">CV Templates</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {templates.length} template · {templates.filter((t) => t.active).length} đang hiển thị
            </p>
          </div>
          <Link
            href="/admin/templates/new"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 active:scale-95"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tạo template mới
          </Link>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm tên template..."
              className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-3.5 text-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          >
            <option value="">Tất cả danh mục</option>
            <option value="professional">Professional</option>
            <option value="creative">Creative</option>
            <option value="simple">Simple</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as "" | "active" | "inactive")}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang hiển thị</option>
            <option value="inactive">Đang ẩn</option>
          </select>
        </div>

        {/* Delete confirm banner */}
        {deleteConfirmId && (
          <div className="mb-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm dark:border-red-800 dark:bg-red-950">
            <span className="text-red-700 dark:text-red-300">
              Nhấn nút xóa lần nữa để xác nhận xóa template này. Thao tác không thể hoàn tác.
            </span>
            <button onClick={() => setDeleteConfirmId(null)} className="ml-4 text-red-400 hover:text-red-600">✕</button>
          </div>
        )}

        {/* States */}
        {loading && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800" />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-950">
            <p className="text-red-600 dark:text-red-300">{error}</p>
            <button onClick={load} className="mt-3 text-sm text-red-500 underline hover:text-red-700">
              Thử lại
            </button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="py-24 text-center text-gray-400">
            <svg className="mx-auto mb-3 h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm">
              {templates.length === 0
                ? "Chưa có template nào. Hãy tạo template đầu tiên!"
                : "Không tìm thấy template phù hợp."}
            </p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((t) => (
              <TemplateCard
                key={t.id}
                template={t}
                onToggle={handleToggle}
                onDelete={handleDelete}
                toggling={togglingId === t.id}
                deleting={deletingId === t.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}