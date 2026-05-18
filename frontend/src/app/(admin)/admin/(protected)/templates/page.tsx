// src/app/admin/templates/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { AdminCVTemplateRepository } from "@/infrastructure/repositories/AdminCVTemplateRepository";
import { AdminCVTemplateService } from "@/application/services/AdminCVTemplateService";
import type { CVTemplate } from "@/domain/models/AdminTemplates";
import { TemplateCard } from "@/presentation/components/admin/templates/TemplateCard";
import { TemplateFilters } from "@/presentation/components/admin/templates/TemplateFilters";
import { TemplateListSkeleton } from "@/presentation/components/admin/templates/TemplateListSkeleton";
import { TemplateEmptyState } from "@/presentation/components/admin/templates/TemplateEmptyState";
import { useToast } from "@/presentation/components/ui/toast";
import { extractErrorMessage } from "@/lib/extractErrorMessage";

const service = new AdminCVTemplateService(new AdminCVTemplateRepository());

export default function AdminTemplatesPage() {
  const toast = useToast();

  const [templates, setTemplates] = useState<CVTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  // Filters
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState<"" | "active" | "inactive">("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await service.listTemplates();
      setTemplates(data);
    } catch (e) {
      const msg = extractErrorMessage(e);
      setError(msg);
      toast.error("Lỗi tải dữ liệu", msg);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  async function handleToggle(id: string, active: boolean) {
    setTogglingId(id);
    try {
      const updated = active 
        ? await service.activateTemplate(id)
        : await service.deactivateTemplate(id);
      setTemplates((prev) => prev.map((t) => (t.id === id ? updated : t)));
      toast.success(
        active ? "Đã kích hoạt" : "Đã ẩn",
        `Template "${updated.name}" đã được ${active ? "kích hoạt" : "ẩn khỏi danh sách"}.`
      );
    } catch (e) {
      toast.error("Lỗi", extractErrorMessage(e));
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
      const templateToDelete = templates.find(t => t.id === id);
      await service.deleteTemplate(id);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      toast.success("Đã xóa", `Template "${templateToDelete?.name}" đã được xóa thành công.`);
    } catch (e) {
      toast.error("Lỗi", extractErrorMessage(e));
    } finally {
      setDeletingId(null);
      setDeleteConfirmId(null);
    }
  }

  const filtered = templates.filter((t) => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = !filterCategory || t.category === filterCategory;
    const matchStatus = !filterStatus || (filterStatus === "active" ? t.active : !t.active);
    return matchSearch && matchCat && matchStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">CV Templates</h1>
            <p className="mt-1 text-[16px] text-gray-500 dark:text-gray-400">
              {templates.length} template · {templates.filter((t) => t.active).length} đang hiển thị
            </p>
          </div>
          <Link
            href="/admin/templates/new"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-[16px] font-medium text-white shadow-sm transition hover:bg-indigo-700 active:scale-95"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tạo template mới
          </Link>
        </div>

        <TemplateFilters
          search={search}
          onSearchChange={setSearch}
          filterCategory={filterCategory}
          onCategoryChange={setFilterCategory}
          filterStatus={filterStatus}
          onStatusChange={setFilterStatus}
        />

        {deleteConfirmId && (
          <div className="mb-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[16px] dark:border-red-800 dark:bg-red-950">
            <span className="text-red-700 dark:text-red-300">
              Nhấn nút xóa lần nữa để xác nhận xóa template này. Thao tác không thể hoàn tác.
            </span>
            <button onClick={() => setDeleteConfirmId(null)} className="ml-4 text-red-400 hover:text-red-600">✕</button>
          </div>
        )}

        {loading && <TemplateListSkeleton />}

        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-950">
            <p className="text-red-600 dark:text-red-300">{error}</p>
            <button onClick={load} className="mt-3 text-[16px] text-red-500 underline hover:text-red-700">
              Thử lại
            </button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <TemplateEmptyState 
            hasTemplates={templates.length > 0} 
            hasFilters={!!(search || filterCategory || filterStatus)}
          />
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
                deleteConfirmId={deleteConfirmId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}