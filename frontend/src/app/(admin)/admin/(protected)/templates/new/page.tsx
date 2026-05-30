// src/app/admin/templates/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminCVTemplateRepository } from "@/infrastructure/repositories/AdminCVTemplateRepository";
import { AdminCVTemplateService } from "@/application/services/AdminCVTemplateService";
import {
  TemplateFormData,
  TemplateFormFields,
} from "@/presentation/components/admin/templates/TemplateFormFields";
import { TemplateFormHeader } from "@/presentation/components/admin/templates/TemplateFormHeader";
import { TemplateFormBreadcrumb } from "@/presentation/components/admin/templates/TemplateFormBreadcrumb";
import { TemplateFormActions } from "@/presentation/components/admin/templates/TemplateFormActions";
import { TemplateFormCard } from "@/presentation/components/admin/templates/TemplateFormCard";
import { TemplateFormTips } from "@/presentation/components/admin/templates/TemplateFormTips";
import { useToast } from "@/presentation/components/ui/toast";
import { extractErrorMessage } from "@/lib/extractErrorMessage";
import type { CVTemplateCategory } from "@/domain/models/AdminTemplates";

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
  const toast = useToast();

  const [form, setForm] = useState<TemplateFormData>(INITIAL);

  const [pendingThumbnail, setPendingThumbnail] = useState<File | null>(null);
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [thumbnailError, setThumbnailError] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Handlers ──────────────────────────────────────────────────────────

  function handleChange(field: keyof TemplateFormData, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null);
  }

  function handleThumbnailSelect(file: File) {
    setPendingThumbnail(file);
    setThumbnailError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setThumbnailError(null);

    try {
      // 1. Tạo template (thumbnailUrl = null, upload riêng ở bước 2)
      const created = await service.createTemplate({
        name: form.name.trim(),
        thumbnailUrl: null,
        category: (form.category || null) as CVTemplateCategory | null,
        premium: form.premium,
        htmlContent: form.htmlContent,
      });

      // 2. Upload thumbnail nếu người dùng đã chọn
      if (pendingThumbnail) {
        setThumbnailUploading(true);
        try {
          await service.uploadThumbnail(created.id, pendingThumbnail);
        } catch (err) {
          // Template đã tạo thành công — warn rồi redirect sang edit để upload lại
          const msg = extractErrorMessage(err);
          setThumbnailError(msg);
          toast.error("Tạo thành công, nhưng upload thumbnail thất bại", msg);
          router.push(`/admin/templates/${created.id}/edit`);
          return;
        } finally {
          setThumbnailUploading(false);
        }
      }

      toast.success("Thành công", `Template "${created.name}" đã được tạo.`);
      router.push("/admin/templates");
    } catch (err) {
      const msg = extractErrorMessage(err);
      setError(msg);
      toast.error("Lỗi tạo template", msg);
      setSaving(false);
    }
  }

  const isValid = form.name.trim().length > 0 && form.htmlContent.trim().length > 0;
  const isBusy = saving || thumbnailUploading;

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <TemplateFormBreadcrumb isEdit={false} />

        <TemplateFormCard>
          <TemplateFormHeader
            title="Tạo CV Template mới"
            subtitle="Viết HTML Thymeleaf XHTML hợp lệ để Flying Saucer render PDF."
          />

          <form onSubmit={handleSubmit} className="px-6 py-6">
            <TemplateFormFields
              data={form}
              onChange={handleChange}
              pendingThumbnail={pendingThumbnail}
              onThumbnailSelect={handleThumbnailSelect}
              thumbnailUploading={thumbnailUploading}
              thumbnailError={thumbnailError}
              isEdit={false}
              error={error}
            />

            <TemplateFormActions
              isEdit={false}
              saving={isBusy}
              isValid={isValid}
            />
          </form>
        </TemplateFormCard>

        <TemplateFormTips />
      </div>
    </div>
  );
}