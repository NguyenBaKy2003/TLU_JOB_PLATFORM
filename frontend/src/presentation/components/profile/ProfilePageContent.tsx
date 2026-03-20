"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FileText, Briefcase, BookOpen, Link2,
  Globe, Target, Gift, Save, ChevronDown, ChevronUp,
  AlertCircle, RefreshCw,
} from "lucide-react";
import { ProfileHeader }          from "./ProfileHeader";
import { CandidateProfile }       from "@/domain/models/Candidate";
import { CandidateService,
         UpdateProfilePayload }   from "@/application/services/CandidateService";
import { PersonalInfo }           from "./PersonalInfo";
import { SectionCard }            from "../layout/profile/SectionCard";
import { SidebarWidgets }         from "./SidebarWidgets";
import { BioSection }             from "./BioSection";
import { SkillsSection }          from "./SkillsSection";
import { ExperienceSection }      from "./ExperienceSection";
import { EducationSection }       from "./EducationSection";
import { LinksSection }           from "./LinksSection";
import { LanguageSection }        from "./LanguageSection";
import { JobExpectationsSection } from "./JobExpectationsSection";
import { BenefitsSection }        from "./BenefitsSection";

interface ProfilePageContentProps {
  service: CandidateService;
}

type SectionKey =
  | "bio" | "skills" | "experiences" | "educations"
  | "links" | "languages" | "jobExpectation" | "benefits";

type SaveStatus = "idle" | "saving" | "saved" | "error";

export function ProfilePageContent({ service }: ProfilePageContentProps) {
  const [profile, setProfile]           = useState<CandidateProfile | null>(null);
  const [loading, setLoading]           = useState(true);
  const [fetchError, setFetchError]     = useState<string | null>(null);
  const [cvFile, setCvFile]             = useState<string | undefined>();
  const [saveStatus, setSaveStatus]     = useState<SaveStatus>("idle");
  const [saveError, setSaveError]       = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<Partial<Record<SectionKey, boolean>>>({});
  const [sidebarOpen, setSidebarOpen]   = useState(false);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await service.getProfile();
      setProfile(data);
    } catch (err: any) {
      setFetchError(err?.message ?? "Không thể tải hồ sơ. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [service]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const openSection = (key: SectionKey) =>
    setOpenSections((prev) => ({ ...prev, [key]: true }));

  const isVisible = (key: SectionKey, hasData: boolean) =>
    hasData || !!openSections[key];

  const patchProfile = (patch: Partial<CandidateProfile>) =>
    setProfile((prev) => prev ? { ...prev, ...patch } : prev);

  // ─────────────────────────────────────────────────────────────────────────────
  // handleSave — builds UpdateProfilePayload to match Java UpdateProfileRequest:
  //   • desiredJob: singular (backend field name), mapped from desiredJobs[0]
  //   • languages / socialLinks / skills: arrays with correct shape
  //   • experiences: excluded (separate endpoint on backend)
  // ─────────────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!profile) return;
    setSaveStatus("saving");
    setSaveError(null);

    const firstJob = profile.desiredJobs?.[0];

    const payload: UpdateProfilePayload = {
      firstName:      profile.firstName     ?? undefined,
      lastName:       profile.lastName      ?? undefined,
      headline:       profile.headline      ?? undefined,
      summary:        profile.summary       ?? undefined,
      phone:          profile.phone         ?? undefined,
      location:       profile.location      ?? undefined,
      dateOfBirth:    profile.dateOfBirth   ?? undefined,
      gender:         profile.gender        ?? undefined,
      maritalStatus:  profile.maritalStatus ?? undefined,
      expectedSalary: profile.expectedSalary,
      currency:       profile.currency,

      skills: profile.skills?.map((s) => ({
        name:       s.name,
        level:      s.level,
        yearsOfExp: s.yearsOfExp,
      })),

      languages: profile.languages?.map((l) => ({
        name:  l.name,
        level: l.level,
      })),

      socialLinks: profile.socialLinks?.map((sl) => ({
        platform: sl.platform,
        url:      sl.url,
      })),

      // Backend field is "desiredJob" (singular), takes only the first entry
      desiredJob: firstJob ? {
        industry:      firstJob.industry,
        minSalary:     firstJob.minSalary,
        currency:      firstJob.currency,
        contractTypes: firstJob.contractTypes,
        levels:        firstJob.levels,
      } : undefined,

      benefits: profile.benefits,
    };

    try {
      const updated = await service.updateProfile(payload);
      setProfile(updated);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2500);
    } catch (err: any) {
      setSaveError(err?.message ?? "Lưu hồ sơ thất bại. Vui lòng thử lại.");
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen p-4 sm:p-6 space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4" />
            <div className="space-y-2">
              <div className="h-3 bg-gray-100 rounded w-3/4" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (fetchError || !profile) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-red-100 p-8 max-w-md w-full text-center space-y-4">
          <AlertCircle size={40} className="mx-auto text-red-400" />
          <p className="text-sm text-red-600 font-medium">{fetchError}</p>
          <button onClick={fetchProfile}
            className="flex items-center gap-2 mx-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors">
            <RefreshCw size={14} />Thử lại
          </button>
        </div>
      </div>
    );
  }

  const sidebarProps = {
    completionPercent: undefined,
    profileUrl:        profile.profileUrl ?? undefined,
    cvFile,
    saving:            saveStatus === "saving",
    onUpload:          (file: File) => setCvFile(file.name),
    onRemoveCv:        () => setCvFile(undefined),
    onSave:            handleSave,
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {saveStatus === "error" && saveError && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 text-red-600 text-sm font-medium rounded-xl shadow-md">
          <AlertCircle size={15} />{saveError}
        </div>
      )}
      {saveStatus === "saved" && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 bg-green-50 border border-green-200 text-green-600 text-sm font-medium rounded-xl shadow-md">
          <Save size={15} />Đã lưu hồ sơ thành công!
        </div>
      )}

      {/* Mobile sidebar accordion */}
      <div className="lg:hidden px-4 pt-4 pb-2">
        <button onClick={() => setSidebarOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-gray-100 shadow-sm text-sm font-semibold text-gray-700">
          <span>Hoàn thiện hồ sơ</span>
          {sidebarOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </button>
        {sidebarOpen && <div className="mt-3"><SidebarWidgets {...sidebarProps} /></div>}
      </div>

      <div className="flex gap-6 px-4 sm:px-6 pb-6 lg:p-6">
        <div className="flex-1 min-w-0 space-y-4">
          <ProfileHeader user={profile} onViewCV={() => {}} onDownloadPDF={() => {}}
            onAvatarChange={(file) => patchProfile({ avatarUrl: URL.createObjectURL(file) })} />

          <PersonalInfo user={profile} onSave={patchProfile} />

          {isVisible("bio", !!profile.summary) ? (
            <BioSection value={profile.summary ?? ""} onChange={(val) => patchProfile({ summary: val })} />
          ) : (
            <SectionCard title="Giới thiệu bản thân" icon={<FileText size={16} />}
              addLabel="Giới thiệu bản thân" onAdd={() => openSection("bio")}
              isEmpty emptyText="Giới thiệu về bản thân bạn" />
          )}

          {isVisible("skills", !!profile.skills?.length) ? (
            <SkillsSection skills={profile.skills}
              onAdd={(skill) => patchProfile({ skills: [...profile.skills, skill] })}
              onRemove={(name) => patchProfile({ skills: profile.skills.filter((s) => s.name !== name) })} />
          ) : (
            <SectionCard title="Kỹ năng chuyên môn" icon={<Target size={16} />}
              addLabel="Kỹ năng chuyên môn" onAdd={() => openSection("skills")}
              isEmpty emptyText="Thêm kỹ năng chuyên môn của bạn" />
          )}

          {isVisible("experiences", !!profile.experiences?.length) ? (
            <ExperienceSection experiences={profile.experiences}
              onAdd={(exp) => patchProfile({ experiences: [...profile.experiences, exp] })}
              onRemove={(id) => patchProfile({ experiences: profile.experiences.filter((e) => e.id !== id) })} />
          ) : (
            <SectionCard title="Kinh nghiệm làm việc" icon={<Briefcase size={16} />}
              addLabel="Kinh nghiệm làm việc" onAdd={() => openSection("experiences")}
              isEmpty emptyText="Thêm kinh nghiệm làm việc của bạn" />
          )}

          {isVisible("educations", !!profile.educations?.length) ? (
            <EducationSection educations={profile.educations}
              onAdd={(edu) => patchProfile({ educations: [...profile.educations, edu] })}
              onRemove={(id) => patchProfile({ educations: profile.educations.filter((e) => e.id !== id) })} />
          ) : (
            <SectionCard title="Học vấn" icon={<BookOpen size={16} />}
              addLabel="Học vấn" onAdd={() => openSection("educations")}
              isEmpty emptyText="Thêm quá trình học vấn" />
          )}

          {isVisible("links", !!profile.socialLinks?.length) ? (
            <LinksSection links={profile.socialLinks}
              onAdd={(link) => patchProfile({ socialLinks: [...profile.socialLinks, link] })}
              onRemove={(id) => patchProfile({ socialLinks: profile.socialLinks.filter((l) => l.id !== id) })} />
          ) : (
            <SectionCard title="Liên kết" icon={<Link2 size={16} />}
              addLabel="Liên kết" onAdd={() => openSection("links")}
              isEmpty emptyText="Thêm danh mục dự án (Portfolio) và liên kết mạng xã hội" />
          )}

          {isVisible("languages", !!profile.languages?.length) ? (
            <LanguageSection languages={profile.languages}
              onAdd={(lang) => patchProfile({ languages: [...profile.languages, lang] })}
              onRemove={(id) => patchProfile({ languages: profile.languages.filter((l) => l.id !== id) })} />
          ) : (
            <SectionCard title="Ngoại ngữ" icon={<Globe size={16} />}
              addLabel="Ngôn ngữ" onAdd={() => openSection("languages")}
              isEmpty emptyText="Thêm trình độ ngoại ngữ" />
          )}

          {isVisible("jobExpectation", !!profile.desiredJobs?.length) ? (
            <JobExpectationsSection value={profile.desiredJobs}
              onChange={(val) => patchProfile({ desiredJobs: val })} />
          ) : (
            <SectionCard title="Công việc mong muốn" icon={<Target size={16} />}
              addLabel="Công việc mong muốn" onAdd={() => openSection("jobExpectation")}
              isEmpty emptyText="Thêm công việc mong muốn" />
          )}

          {isVisible("benefits", !!profile.benefits?.length) ? (
            <BenefitsSection selected={profile.benefits}
              onChange={(val) => patchProfile({ benefits: val })} />
          ) : (
            <SectionCard title="Phúc lợi kỳ vọng" icon={<Gift size={16} />}
              addLabel="Phúc lợi kỳ vọng" onAdd={() => openSection("benefits")}
              isEmpty emptyText="Thêm phúc lợi kỳ vọng" />
          )}

          {/* Mobile Save bar */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 px-4 py-3 bg-white border-t border-gray-100 z-30">
            <button onClick={handleSave} disabled={saveStatus === "saving"}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2">
              {saveStatus === "saving"
                ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Đang lưu...</>
                : <><Save size={15} />Lưu hồ sơ</>}
            </button>
          </div>
          <div className="lg:hidden h-20" />
        </div>

        <div className="hidden lg:block w-64 flex-shrink-0 space-y-4">
          <SidebarWidgets {...sidebarProps} />
        </div>
      </div>
    </div>
  );
}