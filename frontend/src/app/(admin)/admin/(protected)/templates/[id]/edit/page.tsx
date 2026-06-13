// src/app/admin/templates/[id]/edit/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { AdminCVTemplateRepository } from "@/infrastructure/repositories/AdminCVTemplateRepository";
import { AdminCVTemplateService } from "@/application/services/AdminCVTemplateService";
import {
  TemplateFormData,
  TemplateFormFields,
} from "@/presentation/components/admin/templates/TemplateFormFields";
import { TemplateFormSkeleton } from "@/presentation/components/admin/templates/TemplateFormSkeleton";
import { TemplateFormError } from "@/presentation/components/admin/templates/TemplateFormError";
import { TemplateFormHeader } from "@/presentation/components/admin/templates/TemplateFormHeader";
import { TemplateFormBreadcrumb } from "@/presentation/components/admin/templates/TemplateFormBreadcrumb";
import { TemplateFormActions } from "@/presentation/components/admin/templates/TemplateFormActions";
import { TemplateFormCard } from "@/presentation/components/admin/templates/TemplateFormCard";
import { TemplateFormTips } from "@/presentation/components/admin/templates/TemplateFormTips";
import { SaveStatusBadge } from "@/presentation/components/admin/templates/SaveStatusBadge";
import { useToast } from "@/presentation/components/ui/toast";
import { extractErrorMessage } from "@/lib/extractErrorMessage";
import type { CVTemplateCategory } from "@/domain/models/AdminTemplates";

const service = new AdminCVTemplateService(new AdminCVTemplateRepository());

export default function EditTemplatePage() {
  const params = useParams();
  const toast = useToast();
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

  const [pendingThumbnail, setPendingThumbnail] = useState<File | null>(null);
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [thumbnailError, setThumbnailError] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  // ── Load ─────

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

  // ── Handlers ──

  function handleChange(field: keyof TemplateFormData, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (saveError) setSaveError(null);
    setSavedAt(null);
  }

  function handleThumbnailSelect(file: File) {
    setPendingThumbnail(file);
    setThumbnailError(null);
    setSavedAt(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    setThumbnailError(null);

    try {
      // 1. Upload thumbnail trước nếu có file mới
      let resolvedThumbnailUrl = form.thumbnailUrl;

      if (pendingThumbnail) {
        setThumbnailUploading(true);
        try {
          const updated = await service.uploadThumbnail(id, pendingThumbnail);
          resolvedThumbnailUrl = updated.thumbnailUrl ?? "";
          setPendingThumbnail(null);
          setForm((prev) => ({ ...prev, thumbnailUrl: resolvedThumbnailUrl }));
        } catch (err) {
          const msg = extractErrorMessage(err);
          setThumbnailError(msg);
          toast.error("Lỗi upload thumbnail", msg);
          return;
        } finally {
          setThumbnailUploading(false);
        }
      }

      // 2. Cập nhật metadata
      await service.updateTemplate(id, {
        name: form.name.trim(),
        thumbnailUrl: resolvedThumbnailUrl.trim() || null,
        category: (form.category || null) as CVTemplateCategory | null,
        premium: form.premium,
        htmlContent: form.htmlContent,
        active: form.active ?? true,
      });

      setSavedAt(new Date());
      toast.success("Thành công", "Template đã được cập nhật.");
    } catch (err) {
      const msg = extractErrorMessage(err);
      setSaveError(msg);
      toast.error("Lỗi cập nhật", msg);
    } finally {
      setSaving(false);
    }
  }

  const isValid = form.name.trim().length > 0 && form.htmlContent.trim().length > 0;
  const isBusy = saving || thumbnailUploading;

  // ── Render ────

  if (loadState === "loading") return <TemplateFormSkeleton />;
  if (loadState === "error") return <TemplateFormError message={loadError!} onRetry={load} />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <TemplateFormBreadcrumb templateName={form.name || id} isEdit />

        <TemplateFormCard>
          <TemplateFormHeader title="Chỉnh sửa template" templateId={id}>
            <SaveStatusBadge savedAt={savedAt} />
          </TemplateFormHeader>

          <form onSubmit={handleSubmit} className="px-6 py-6">
            <TemplateFormFields
              data={form}
              onChange={handleChange}
              pendingThumbnail={pendingThumbnail}
              onThumbnailSelect={handleThumbnailSelect}
              thumbnailUploading={thumbnailUploading}
              thumbnailError={thumbnailError}
              isEdit
              error={saveError}
            />

            <TemplateFormActions
              isEdit
              saving={isBusy}
              isValid={isValid && !thumbnailUploading}
              active={form.active}
              onToggleActive={() => handleChange("active", !form.active)}
            />
          </form>
        </TemplateFormCard>

        <TemplateFormTips />
      </div>
    </div>
  );
}