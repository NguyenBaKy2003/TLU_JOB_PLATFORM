// src/app/employer/company/page.tsx
"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { DashboardLayout }                from "@/presentation/components/layout/profile/DashboardLayout";
import { CompanyService }                from "@/application/services/CompanyService";
import { CompanyRepository }             from "@/infrastructure/repositories/CompanyRepository";
import type { CompanyProfile, UpdateCompanyPayload } from "@/domain/models/Company";
import { extractErrorMessage }           from "@/lib/extractErrorMessage";
import { useToast }                      from "@/presentation/components/ui/toast";
import { CompanyHero } from "@/presentation/components/employer/company/CompanyHero";
import { BasicInfoSection } from "@/presentation/components/employer/company/BasicInfoSection";
import { DescriptionSection } from "@/presentation/components/employer/company/DescriptionSection";
import { VerificationStatusCard } from "@/presentation/components/employer/company/VerificationStatusCard";
import { CompanyProfileCompletionCard } from "@/presentation/components/employer/company/CompanyProfileCompletionCard";

// ── Singleton service ──────────────────────────────────────────────────────────

const service = new CompanyService(new CompanyRepository());

// ── Section key ───────────────────────────────────────────────────────────────

type SectionKey = "basic" | "description" | "logo" | "cover";

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CompanyProfilePage() {
  const toast = useToast();

  const [profile,       setProfile]       = useState<CompanyProfile | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState<string | null>(null);
  const [saving,        setSaving]        = useState<Partial<Record<SectionKey, boolean>>>({});
  const [sectionErrors, setSectionErrors] = useState<Partial<Record<SectionKey, string>>>({});

  const hasLoaded = useRef(false);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const startSaving     = (s: SectionKey) => setSaving(p => ({ ...p, [s]: true  }));
  const stopSaving      = (s: SectionKey) => setSaving(p => ({ ...p, [s]: false }));
  const setSectionError = (s: SectionKey, e: unknown) =>
    setSectionErrors(p => ({ ...p, [s]: extractErrorMessage(e) }));
  const clearError      = (s: SectionKey) =>
    setSectionErrors(p => ({ ...p, [s]: undefined }));

  // ── Load ───────────────────────────────────────────────────────────────────

  const loadProfile = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await service.getMyCompany();
      setProfile(data);
    } catch (e) {
      setError(extractErrorMessage(e, "Không thể tải hồ sơ công ty"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;
    loadProfile();
  }, [loadProfile]);

  // ── Update ─────────────────────────────────────────────────────────────────

  const updateProfile = useCallback(async (
    section: SectionKey,
    payload: UpdateCompanyPayload,
  ) => {
    if (!profile) return;
    startSaving(section);
    clearError(section);
    try {
      const updated = await service.updateCompany(profile.id, payload);
      setProfile(updated);
      toast.success("Đã lưu", "Thông tin công ty đã được cập nhật.");
    } catch (e) {
      setSectionError(section, e);
      toast.error("Lưu thất bại", extractErrorMessage(e));
      throw e;
    } finally {
      stopSaving(section);
    }
  }, [profile, toast]);

  // ── Logo / Cover ───────────────────────────────────────────────────────────

  const uploadLogo = useCallback(async (file: File) => {
    if (!profile) return;
    startSaving("logo"); clearError("logo");
    try {
      const updated = await service.uploadLogo(profile.id, file);
      setProfile(updated);
      toast.success("Đã cập nhật", "Logo công ty đã được thay đổi.");
    } catch (e) {
      setSectionError("logo", e);
      toast.error("Upload thất bại", extractErrorMessage(e));
      throw e;
    } finally {
      stopSaving("logo");
    }
  }, [profile, toast]);

  const uploadCover = useCallback(async (file: File) => {
    if (!profile) return;
    startSaving("cover"); clearError("cover");
    try {
      const updated = await service.uploadCover(profile.id, file);
      setProfile(updated);
      toast.success("Đã cập nhật", "Ảnh bìa công ty đã được thay đổi.");
    } catch (e) {
      setSectionError("cover", e);
      toast.error("Upload thất bại", extractErrorMessage(e));
      throw e;
    } finally {
      stopSaving("cover");
    }
  }, [profile, toast]);

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loading) {
    return (

        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 animate-pulse">
          <div className="flex-1 flex flex-col gap-4">
            <div className="h-48 bg-gray-100 rounded-2xl" />
            <div className="h-64 bg-gray-100 rounded-2xl" />
            <div className="h-40 bg-gray-100 rounded-2xl" />
          </div>
          <div className="w-full lg:w-72 shrink-0 flex flex-col gap-4">
            <div className="h-52 bg-gray-100 rounded-2xl" />
            <div className="h-36 bg-gray-100 rounded-2xl" />
          </div>
        </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────

  if (error || !profile) {
    return (

        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <p className="text-sm text-red-500">{error ?? "Không thể tải hồ sơ công ty"}</p>
          <button onClick={loadProfile}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700">
            Thử lại
          </button>
        </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-start">

        {/* ── Left: edit sections ────────────────────────────────── */}
        <div className="w-full lg:flex-1 lg:min-w-0 flex flex-col gap-4">
          <CompanyHero
            profile={profile}
            onLogoChange={uploadLogo}
            onCoverChange={uploadCover}
          />
          <BasicInfoSection
            profile={profile}
            saving={!!saving.basic}
            error={sectionErrors.basic}
            onSave={payload => updateProfile("basic", payload)}
          />
          <DescriptionSection
            profile={profile}
            saving={!!saving.description}
            error={sectionErrors.description}
            onSave={payload => updateProfile("description", payload)}
          />
        </div>

        {/* ── Right: sidebar ─────────────────────────────────────── */}
        <div className="w-full lg:w-72 lg:shrink-0 lg:sticky lg:top-4 flex flex-col gap-4">
          <VerificationStatusCard
            status={profile.verificationStatus}
            rejectionReason={profile.rejectionReason}
            onResubmit={profile.verificationStatus === "REJECTED"
              ? () => toast.success("Đã gửi", "Yêu cầu xét duyệt lại đã được gửi.")
              : undefined}
          />
          <CompanyProfileCompletionCard profile={profile} />
        </div>

      </div>
  );
}