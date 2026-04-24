// src/app/admin/templates/[id]/edit/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { AdminCVTemplateRepository } from "@/infrastructure/repositories/AdminCVTemplateRepository";
import { AdminCVTemplateService } from "@/application/services/AdminCVTemplateService";
import { TemplateFormData, TemplateFormFields } from "@/presentation/components/admin/templates/TemplateFormFields";
import { TemplateFormHeader } from "@/presentation/components/admin/templates/TemplateFormHeader";
import { TemplateFormBreadcrumb } from "@/presentation/components/admin/templates/TemplateFormBreadcrumb";
import { TemplateFormActions } from "@/presentation/components/admin/templates/TemplateFormActions";
import { TemplateFormCard } from "@/presentation/components/admin/templates/TemplateFormCard";
import { TemplateFormTips } from "@/presentation/components/admin/templates/TemplateFormTips";
import { useToast } from "@/presentation/components/ui/toast";
import { extractErrorMessage } from "@/lib/extractErrorMessage";
import type { CVTemplateCategory } from "@/domain/models/AdminTemplates";

const service = new AdminCVTemplateService(new AdminCVTemplateRepository());

export default function EditTemplatePage() {
  const router = useRouter();
  const params = useParams();
  const toast = useToast();
  const templateId = params.id as string;

  const [form, setForm] = useState<TemplateFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTemplate();
  }, [templateId]);

  async function loadTemplate() {
    try {
      setLoading(true);
      const template = await service.getTemplate(templateId);
      setForm({
        name: template.name || "",
        thumbnailUrl: template.thumbnailUrl || "",
        category: template.category || "",
        premium: template.premium,
        htmlContent: template.htmlContent || "",
      });
    } catch (e) {
      toast.error("Lỗi", extractErrorMessage(e));
      router.push("/admin/templates");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(field: keyof TemplateFormData, value: string | boolean) {
    setForm((prev) => prev ? { ...prev, [field]: value } : prev);
    if (error) setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    
    setSaving(true);
    setError(null);
    try {
      const updated = await service.updateTemplate(templateId, {
        name: form.name.trim(),
        thumbnailUrl: form.thumbnailUrl.trim() || null,
        category: (form.category || null) as CVTemplateCategory | null,
        premium: form.premium,
        htmlContent: form.htmlContent,
        active: form.active ?? true,
      });
      
      toast.success("Thành công", `Template "${updated.name}" đã được cập nhật.`);
      router.push("/admin/templates");
    } catch (err) {
      const msg = extractErrorMessage(err);
      setError(msg);
      toast.error("Lỗi cập nhật", msg);
      setSaving(false);
    }
  }

  if (loading || !form) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const isValid = form.name.trim().length > 0 && form.htmlContent.trim().length > 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        
        <TemplateFormBreadcrumb isEdit={true} />

        <TemplateFormCard>
          <TemplateFormHeader
            title="Chỉnh sửa CV Template"
            subtitle={`Đang chỉnh sửa: ${form.name || "Template"}`}
          />

          <form onSubmit={handleSubmit} className="px-6 py-6">
            <TemplateFormFields
              data={form}
              onChange={handleChange}
              isEdit={true}
              error={error}
            />

            <TemplateFormActions
              isEdit={true}
              saving={saving}
              isValid={isValid}
            />
          </form>
        </TemplateFormCard>

        <TemplateFormTips />
      </div>
    </div>
  );
}