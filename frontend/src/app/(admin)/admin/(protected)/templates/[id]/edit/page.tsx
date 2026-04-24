// src/app/admin/templates/[id]/edit/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { AdminCVTemplateRepository } from "@/infrastructure/repositories/AdminCVTemplateRepository";
import { AdminCVTemplateService } from "@/application/services/AdminCVTemplateService";
import { TemplateFormData, TemplateFormFields } from "@/presentation/components/admin/templates/TemplateFormFields";
import { TemplateFormSkeleton } from "@/presentation/components/admin/templates/TemplateFormSkeleton";
import { TemplateFormError } from "@/presentation/components/admin/templates/TemplateFormError";
import { TemplateFormHeader } from "@/presentation/components/admin/templates/TemplateFormHeader";
import { TemplateFormBreadcrumb } from "@/presentation/components/admin/templates/TemplateFormBreadcrumb";
import { TemplateFormActions } from "@/presentation/components/admin/templates/TemplateFormActions";
import { TemplateFormCard } from "@/presentation/components/admin/templates/TemplateFormCard";
import { SaveStatusBadge } from "@/presentation/components/admin/templates/SaveStatusBadge";

const service = new AdminCVTemplateService(new AdminCVTemplateRepository());

export default function EditTemplatePage() {
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

  if (loadState === "loading") {
    return <TemplateFormSkeleton />;
  }

  if (loadState === "error") {
    return (
      <TemplateFormError 
        message={loadError!} 
        onRetry={load} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        
        <TemplateFormBreadcrumb 
          templateName={form.name || id} 
          isEdit 
        />

        <TemplateFormCard>
          <TemplateFormHeader
            title="Chỉnh sửa template"
            templateId={id}
          >
            <SaveStatusBadge savedAt={savedAt} />
          </TemplateFormHeader>

          <form onSubmit={handleSubmit} className="px-6 py-6">
            <TemplateFormFields
              data={form}
              onChange={handleChange}
              isEdit
              error={saveError}
            />

            <TemplateFormActions
              isEdit
              saving={saving}
              isValid={isValid}
              active={form.active}
              onToggleActive={() => {
                const newActive = !form.active;
                handleChange("active", newActive);
              }}
            />
          </form>
        </TemplateFormCard>
      </div>
    </div>
  );
}