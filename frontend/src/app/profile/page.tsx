"use client";

import {
  useState, useEffect, useCallback, useRef, useMemo,
} from "react";
import { DashboardLayout }       from "@/presentation/components/layout/profile/DashboardLayout";
import { CandidateService }      from "@/application/services/CandidateService";
import { CandidateRepository }   from "@/infrastructure/repositories/CandidateRepository";
import ProfileHero               from "@/presentation/components/profile/ProfileHero";
import PersonalInfoSection       from "@/presentation/components/profile/PersonalInfoSection";
import BioSection                from "@/presentation/components/profile/BioSection";
import SkillsSection             from "@/presentation/components/profile/SkillsSection";
import WorkExperienceSection     from "@/presentation/components/profile/WorkExperienceSection";
import EducationSection          from "@/presentation/components/profile/EducationSection";
import LinksSection              from "@/presentation/components/profile/LinksSection";
import LanguagesSection          from "@/presentation/components/profile/LanguagesSection";
import JobExpectationSection     from "@/presentation/components/profile/JobExpectationSection";
import BenefitsSection           from "@/presentation/components/profile/BenefitsSection";
import ProfileCompletionCard     from "@/presentation/components/profile/ProfileCompletionCard";
import CVUploadCard              from "@/presentation/components/profile/CVUploadCard";
import ProfileShareCard          from "@/presentation/components/profile/ProfileShareCard";
import {
  CandidateProfile,
  CandidateCV,
  UpdateProfilePayload,
  ExperiencePayload,
  EducationPayload,
  UploadCVPayload,
} from "@/domain/models/Candidate";
import { SectionKey } from "@/presentation/components/profile/types/SectionKey";

// ─── Singleton service ────────────────────────────────────────────────────────

const service = new CandidateService(new CandidateRepository());

// ─── Completion calculator ────────────────────────────────────────────────────

function calcCompletion(p: CandidateProfile) {
  const checks = [
    { label: "Hoàn thiện thông tin cá nhân", done: !!(p.firstName && p.phone && p.location), percent: 15 },
    { label: "Thêm giới thiệu bản thân",     done: !!p.summary,                              percent: 10 },
    { label: "Thêm kỹ năng chuyên môn",      done: p.skills.length > 0,                      percent: 15 },
    { label: "Thêm kinh nghiệm làm việc",    done: p.experiences.length > 0,                 percent: 20 },
    { label: "Thêm học vấn",                 done: p.educations.length > 0,                  percent: 15 },
    { label: "Thêm ngoại ngữ",               done: p.languages.length > 0,                   percent: 10 },
    { label: "Thêm kỳ vọng công việc",       done: p.desiredJobs.length > 0,                 percent: 15 },
  ];
  return {
    percentage: checks.reduce((sum, c) => sum + (c.done ? c.percent : 0), 0),
    steps: checks.filter((c) => !c.done).slice(0, 3).map((c) => ({ ...c, done: false })),
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {

  // ── State ───────────────────────────────────────────────────────────────────

  const [profile,       setProfile]       = useState<CandidateProfile | null>(null);
  const [cvList,        setCvList]        = useState<CandidateCV[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState<string | null>(null);
  const [saving,        setSaving]        = useState<Partial<Record<SectionKey, boolean>>>({});
  const [sectionErrors, setSectionErrors] = useState<Partial<Record<SectionKey, string>>>({});

  const hasLoaded = useRef(false);

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const startSaving       = (s: SectionKey) => setSaving((p) => ({ ...p, [s]: true  }));
  const stopSaving        = (s: SectionKey) => setSaving((p) => ({ ...p, [s]: false }));
  const setSectionError   = (s: SectionKey, msg: string) => setSectionErrors((p) => ({ ...p, [s]: msg }));
  const clearSectionError = (s: SectionKey) => setSectionErrors((p) => ({ ...p, [s]: undefined }));

  // ── Load ─────────────────────────────────────────────────────────────────

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Tải profile và CV list song song
      const [profileData, cvData] = await Promise.all([
        service.getProfile(),
        service.listCVs(),
      ]);
      setProfile(profileData);
      setCvList(cvData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể tải hồ sơ");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;
    loadProfile();
  }, [loadProfile]);

  // ── updateProfile ────────────────────────────────────────────────────────

  const updateProfile = useCallback(
    async (section: SectionKey, data: UpdateProfilePayload) => {
      startSaving(section);
      clearSectionError(section);
      try {
        const updated = await service.updateProfile(data);
        setProfile(updated);
      } catch (e) {
        setSectionError(section, e instanceof Error ? e.message : "Lưu thất bại");
        throw e;
      } finally {
        stopSaving(section);
      }
    }, [],
  );

  // ── updateAvatar ─────────────────────────────────────────────────────────

  const updateAvatar = useCallback(async (file: File) => {
    startSaving("personal");
    clearSectionError("personal");
    try {
      const updated = await service.updateAvatar(file);
      setProfile(updated);
    } catch (e) {
      setSectionError("personal", e instanceof Error ? e.message : "Upload ảnh thất bại");
      throw e;
    } finally {
      stopSaving("personal");
    }
  }, []);

  // ── Experience ────────────────────────────────────────────────────────────

  const addExperience = useCallback(async (data: ExperiencePayload) => {
    startSaving("experience"); clearSectionError("experience");
    try { setProfile(await service.addExperience(data)); }
    catch (e) { setSectionError("experience", e instanceof Error ? e.message : "Thêm thất bại"); throw e; }
    finally { stopSaving("experience"); }
  }, []);

  const updateExperience = useCallback(async (id: string, data: ExperiencePayload) => {
    startSaving("experience"); clearSectionError("experience");
    try { setProfile(await service.updateExperience(id, data)); }
    catch (e) { setSectionError("experience", e instanceof Error ? e.message : "Cập nhật thất bại"); throw e; }
    finally { stopSaving("experience"); }
  }, []);

  const deleteExperience = useCallback(async (id: string) => {
    startSaving("experience"); clearSectionError("experience");
    try {
      await service.deleteExperience(id);
      setProfile((prev) =>
        prev ? { ...prev, experiences: prev.experiences.filter((e) => e.id !== id) } : prev,
      );
    } catch (e) { setSectionError("experience", e instanceof Error ? e.message : "Xóa thất bại"); throw e; }
    finally { stopSaving("experience"); }
  }, []);

  // ── Education ─────────────────────────────────────────────────────────────

  const addEducation = useCallback(async (data: EducationPayload) => {
    startSaving("education"); clearSectionError("education");
    try { setProfile(await service.addEducation(data)); }
    catch (e) { setSectionError("education", e instanceof Error ? e.message : "Thêm thất bại"); throw e; }
    finally { stopSaving("education"); }
  }, []);

  const updateEducation = useCallback(async (id: string, data: EducationPayload) => {
    startSaving("education"); clearSectionError("education");
    try { setProfile(await service.updateEducation(id, data)); }
    catch (e) { setSectionError("education", e instanceof Error ? e.message : "Cập nhật thất bại"); throw e; }
    finally { stopSaving("education"); }
  }, []);

  const deleteEducation = useCallback(async (id: string) => {
    startSaving("education"); clearSectionError("education");
    try {
      await service.deleteEducation(id);
      setProfile((prev) =>
        prev ? { ...prev, educations: prev.educations.filter((e) => e.id !== id) } : prev,
      );
    } catch (e) { setSectionError("education", e instanceof Error ? e.message : "Xóa thất bại"); throw e; }
    finally { stopSaving("education"); }
  }, []);

  // ── CV ────────────────────────────────────────────────────────────────────

  const uploadCV = useCallback(async (data: UploadCVPayload) => {
    const newCV = await service.uploadCV(data);
    setCvList((prev) => [newCV, ...prev]);
  }, []);

  const deleteCV = useCallback(async (cvId: string) => {
    await service.deleteCV(cvId);
    setCvList((prev) => prev.filter((cv) => cv.id !== cvId));
  }, []);

  const viewCV = useCallback(async () => {
    const primary = cvList.find((cv) => cv.primary) ?? cvList[0];
    if (!primary) throw new Error("Chưa có CV nào");
    await service.viewCV(primary.id);
  }, [cvList]);

  const downloadCV = useCallback(async () => {
    const primary = cvList.find((cv) => cv.primary) ?? cvList[0];
    if (!primary) throw new Error("Chưa có CV nào");
    await service.downloadCV(primary.id, primary.title);
  }, [cvList]);

  // ── Derived ───────────────────────────────────────────────────────────────

  const primaryCV = useMemo(
    () => cvList.find((cv) => cv.primary) ?? cvList[0] ?? null,
    [cvList],
  );

  const { percentage, steps } = useMemo(
    () => (profile ? calcCompletion(profile) : { percentage: 0, steps: [] }),
    [profile],
  );

  // ── Loading skeleton ──────────────────────────────────────────────────────

  if (loading) {
    return (
      <DashboardLayout activeHref="/profile" topbarTitle="Hồ Sơ Của Tôi"
        topbarSubtitle="Cập nhật hồ sơ để nhận được các gợi ý việc làm chính xác nhất.">
        <div className="flex gap-6 animate-pulse">
          <div className="flex-1 flex flex-col gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`bg-gray-100 rounded-xl ${i === 0 ? "h-24" : "h-32"}`} />
            ))}
          </div>
          <div className="w-72 shrink-0 flex flex-col gap-4">
            <div className="h-52 bg-gray-100 rounded-xl" />
            <div className="h-48 bg-gray-100 rounded-xl" />
            <div className="h-44 bg-gray-100 rounded-xl" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ── Global error ──────────────────────────────────────────────────────────

  if (error || !profile) {
    return (
      <DashboardLayout activeHref="/profile" topbarTitle="Hồ Sơ Của Tôi">
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <p className="text-sm text-red-500">{error ?? "Không thể tải hồ sơ"}</p>
          <button onClick={loadProfile}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
            Thử lại
          </button>
        </div>
      </DashboardLayout>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <DashboardLayout
      activeHref="/profile"
      topbarTitle="Hồ Sơ Của Tôi"
      topbarSubtitle="Cập nhật hồ sơ để nhận được các gợi ý việc làm chính xác nhất."
    >
      <div className="flex gap-6">

        {/* ── Left ──────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">

          <ProfileHero
            firstName={profile.firstName ?? undefined}
            lastName={profile.lastName  ?? undefined}
            title={profile.headline     ?? undefined}
            avatar={profile.avatarUrl   ?? undefined}
            onAvatarChange={updateAvatar}
            onViewCV={cvList.length > 0 ? viewCV : undefined}
            onDownloadCV={cvList.length > 0 ? downloadCV : undefined}
          />
          

          <PersonalInfoSection
            profile={profile} saving={!!saving.personal} error={sectionErrors.personal} onSave={updateProfile} />
          <BioSection
            profile={profile} saving={!!saving.bio}      error={sectionErrors.bio}      onSave={updateProfile} />
          <SkillsSection
            profile={profile} saving={!!saving.skills}   error={sectionErrors.skills}   onSave={updateProfile} />

          <WorkExperienceSection
            profile={profile} saving={!!saving.experience} error={sectionErrors.experience}
            onAdd={addExperience} onUpdate={updateExperience} onDelete={deleteExperience} />

          <EducationSection
            profile={profile} saving={!!saving.education} error={sectionErrors.education}
            onAdd={addEducation} onUpdate={updateEducation} onDelete={deleteEducation} />

          <LinksSection
            profile={profile} saving={!!saving.links}          error={sectionErrors.links}          onSave={updateProfile} />
          <LanguagesSection
            profile={profile} saving={!!saving.languages}      error={sectionErrors.languages}      onSave={updateProfile} />
          <JobExpectationSection
            profile={profile} saving={!!saving.jobExpectation} error={sectionErrors.jobExpectation} onSave={updateProfile} />
          <BenefitsSection
            profile={profile} saving={!!saving.benefits}       error={sectionErrors.benefits}       onSave={updateProfile} />

        </div>

        {/* ── Right ─────────────────────────────────────────────────── */}
        <div className="w-72 shrink-0 flex flex-col gap-4">

          <ProfileCompletionCard percentage={percentage} steps={steps} />

          <CVUploadCard
            primaryCV={primaryCV}
            onUpload={uploadCV}
            onDelete={deleteCV}
          />

          <ProfileShareCard
            profileUrl={profile.profileUrl ?? `Joblin.com/u/${profile.id.slice(0, 8)}`}
          />

        </div>
      </div>
    </DashboardLayout>
  );
}