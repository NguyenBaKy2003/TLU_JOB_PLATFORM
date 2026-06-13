"use client";

import {
  useState, useEffect, useCallback, useRef, useMemo,
} from "react";
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
  BoostResult,
  BoostStatus,
} from "@/domain/models/Candidate";
import { SectionKey }            from "@/presentation/components/profile/types/SectionKey";
import { extractErrorMessage }   from "@/lib/extractErrorMessage";
import { useToast }              from "@/presentation/components/ui/toast";
import { CvService }             from "@/application/services/CvService";
import { CvRepository }          from "@/infrastructure/repositories/CvRepository";
import { useRouter }             from "next/navigation";

const service   = new CandidateService(new CandidateRepository());
const cvService = new CvService(new CvRepository());

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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

// ── Inline BoostCard ─

interface BoostCardProps {
  boosted:         boolean;
  boostedUntil:    string | null;
  boostsRemaining: number | null;
  boosting:        boolean;
  onBoost:         () => void;
}

function BoostCard({ boosted, boostedUntil, boostsRemaining, boosting, onBoost }: BoostCardProps) {
  const unlimited = boostsRemaining === -1;
  const noQuota   = !unlimited && boostsRemaining !== null && boostsRemaining <= 0;
  const isActive  = boosted && boostedUntil && new Date(boostedUntil) > new Date();
  const canBoost  = !isActive && !noQuota;

  const daysLeft = boostedUntil
    ? Math.ceil((new Date(boostedUntil).getTime() - Date.now()) / 86_400_000)
    : 0;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 flex flex-col gap-3 shadow-sm">

      <div className="flex items-center gap-2">
        <span className="text-lg">⚡</span>
        <span className="font-semibold text-gray-800 text-[15px]">Boost CV</span>
        {isActive && (
          <span className="ml-auto text-[11px] font-medium text-emerald-700 bg-emerald-50
            border border-emerald-200 rounded-full px-2 py-0.5">
            Đang boost
          </span>
        )}
      </div>

      <div className="text-[13px] text-gray-500 leading-relaxed">
        {isActive && boostedUntil ? (
          <span>
            Hồ sơ đang được ưu tiên hiển thị đến{" "}
            <span className="font-medium text-gray-700">{formatDate(boostedUntil)}</span>
            {daysLeft > 0 && (
              <span className="text-emerald-600"> ({daysLeft} ngày còn lại)</span>
            )}
            . Bạn có thể boost lại sau khi hết hạn.
          </span>
        ) : boostedUntil && !isActive ? (
          <span>
            Boost trước đã hết hạn vào{" "}
            <span className="font-medium text-gray-700">{formatDate(boostedUntil)}</span>
            . Boost lại để tiếp tục ưu tiên.
          </span>
        ) : (
          "Đẩy hồ sơ lên đầu kết quả tìm kiếm của nhà tuyển dụng trong 7 ngày."
        )}
      </div>

      {boostsRemaining !== null && (
        <div className="flex items-center gap-1.5 text-[12px]">
          <span className="text-gray-400">Lượt còn lại tháng này:</span>
          <span className={`font-semibold ${noQuota ? "text-red-500" : "text-blue-600"}`}>
            {unlimited ? "∞ Không giới hạn" : boostsRemaining}
          </span>
        </div>
      )}

      <button
        onClick={onBoost}
        disabled={boosting || !canBoost}
        className={`
          w-full py-2 rounded-lg text-[13px] font-semibold transition-all
          ${!canBoost
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700 active:scale-[.98]"
          }
          disabled:opacity-60
        `}
      >
        {boosting
          ? "Đang boost…"
          : isActive
            ? `⚡ Đang boost · còn ${daysLeft} ngày`
            : noQuota
              ? "Hết lượt boost tháng này"
              : "⚡ Boost ngay"}
      </button>
    </div>
  );
}

// ── Page ─────────────

export default function ProfilePage() {
  const toast  = useToast();
  const router = useRouter();

  const [profile,       setProfile]       = useState<CandidateProfile | null>(null);
  const [cvList,        setCvList]        = useState<CandidateCV[]>([]);
  const [cvListLoading, setCvListLoading] = useState(false);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState<string | null>(null);
  const [saving,        setSaving]        = useState<Partial<Record<SectionKey, boolean>>>({});
  const [sectionErrors, setSectionErrors] = useState<Partial<Record<SectionKey, string>>>({});

  const [boostStatus,     setBoostStatus]     = useState<BoostStatus | null>(null);
  const [boostsRemaining, setBoostsRemaining] = useState<number | null>(null);
  const [boosting,        setBoosting]        = useState(false);

  const hasLoaded = useRef(false);

  const startSaving       = (s: SectionKey) => setSaving((p) => ({ ...p, [s]: true  }));
  const stopSaving        = (s: SectionKey) => setSaving((p) => ({ ...p, [s]: false }));
  const setSectionError   = (s: SectionKey, e: unknown) =>
    setSectionErrors((p) => ({ ...p, [s]: extractErrorMessage(e) }));
  const clearSectionError = (s: SectionKey) =>
    setSectionErrors((p) => ({ ...p, [s]: undefined }));

  const loadProfile = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [profileData, cvData, status] = await Promise.all([
        service.getProfile(),
        service.listCVs(),
        service.getBoostStatus(),
      ]);
      setProfile(profileData);
      setCvList(cvData);
      setBoostStatus(status);
    } catch (e) { setError(extractErrorMessage(e, "Không thể tải hồ sơ")); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;
    loadProfile();
  }, [loadProfile]);

  const handleEditOnlineCV = useCallback((cvId: string) => {
    router.push(`/cv/${cvId}/edit`);
  }, [router]);

  const handleViewOnlineCV = useCallback(async (cv: CandidateCV) => {
    if ((cv as any).id && (cv as any).status === "PUBLISHED") {
      window.open(`/cv/${(cv as any).id}/edit`, "_blank");
      return;
    }
    try {
      const html = await cvService.previewHtml(cv.id);
      const blob = new Blob([html], { type: "text/html" });
      const url  = URL.createObjectURL(blob);
      const tab  = window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
      if (!tab) toast.error("Bị chặn popup", "Vui lòng cho phép popup cho trang này.");
    } catch (e) {
      toast.error("Không thể xem trước", extractErrorMessage(e));
    }
  }, [toast]);

  // ── Boost ──────────

  const handleBoost = useCallback(async () => {
    setBoosting(true);
    try {
      const result: BoostResult = await service.boostCv();
      setBoostStatus({
        currentlyBoosted: result.currentlyBoosted,
        boostedUntil:     result.boostedUntil,
      });
      setBoostsRemaining(result.boostsRemaining);
      setProfile((prev) =>
        prev ? { ...prev, boosted: true, boostedUntil: result.boostedUntil } : prev
      );
      const remaining = result.boostsRemaining === -1
        ? "Không giới hạn lượt."
        : `Còn ${result.boostsRemaining} lượt boost trong tháng.`;
      toast.success(
        "Boost thành công! ⚡",
        `Hồ sơ được ưu tiên đến ${formatDate(result.boostedUntil)}. ${remaining}`
      );
    } catch (e) {
      toast.error("Boost thất bại", extractErrorMessage(e));
    } finally {
      setBoosting(false);
    }
  }, [toast]);

  // ── Profile handlers ───────────────────────────

  const updateProfile = useCallback(async (section: SectionKey, data: UpdateProfilePayload) => {
    startSaving(section); clearSectionError(section);
    try {
      const updated = await service.updateProfile(data);
      setProfile(updated);
      toast.success("Đã lưu", "Thông tin đã được cập nhật thành công.");
    } catch (e) { setSectionError(section, e); toast.error("Lưu thất bại", extractErrorMessage(e)); throw e; }
    finally { stopSaving(section); }
  }, [toast]);

  const updateAvatar = useCallback(async (file: File) => {
    startSaving("personal"); clearSectionError("personal");
    try {
      setProfile(await service.updateAvatar(file));
      toast.success("Đã cập nhật", "Ảnh đại diện đã được thay đổi.");
    } catch (e) { setSectionError("personal", e); toast.error("Upload thất bại", extractErrorMessage(e)); throw e; }
    finally { stopSaving("personal"); }
  }, [toast]);

  const addExperience = useCallback(async (data: ExperiencePayload) => {
    startSaving("experience"); clearSectionError("experience");
    try { setProfile(await service.addExperience(data)); toast.success("Đã thêm", "Kinh nghiệm làm việc đã được thêm."); }
    catch (e) { setSectionError("experience", e); toast.error("Thêm thất bại", extractErrorMessage(e)); throw e; }
    finally { stopSaving("experience"); }
  }, [toast]);

  const updateExperience = useCallback(async (id: string, data: ExperiencePayload) => {
    startSaving("experience"); clearSectionError("experience");
    try { setProfile(await service.updateExperience(id, data)); toast.success("Đã cập nhật", "Kinh nghiệm đã được cập nhật."); }
    catch (e) { setSectionError("experience", e); toast.error("Cập nhật thất bại", extractErrorMessage(e)); throw e; }
    finally { stopSaving("experience"); }
  }, [toast]);

  const deleteExperience = useCallback(async (id: string) => {
    startSaving("experience"); clearSectionError("experience");
    try {
      await service.deleteExperience(id);
      setProfile((prev) => prev ? { ...prev, experiences: prev.experiences.filter((e) => e.id !== id) } : prev);
      toast.success("Đã xóa", "Kinh nghiệm làm việc đã được xóa.");
    } catch (e) { setSectionError("experience", e); toast.error("Xóa thất bại", extractErrorMessage(e)); throw e; }
    finally { stopSaving("experience"); }
  }, [toast]);

  const addEducation = useCallback(async (data: EducationPayload) => {
    startSaving("education"); clearSectionError("education");
    try { setProfile(await service.addEducation(data)); toast.success("Đã thêm", "Học vấn đã được thêm."); }
    catch (e) { setSectionError("education", e); toast.error("Thêm thất bại", extractErrorMessage(e)); throw e; }
    finally { stopSaving("education"); }
  }, [toast]);

  const updateEducation = useCallback(async (id: string, data: EducationPayload) => {
    startSaving("education"); clearSectionError("education");
    try { setProfile(await service.updateEducation(id, data)); toast.success("Đã cập nhật", "Học vấn đã được cập nhật."); }
    catch (e) { setSectionError("education", e); toast.error("Cập nhật thất bại", extractErrorMessage(e)); throw e; }
    finally { stopSaving("education"); }
  }, [toast]);

  const deleteEducation = useCallback(async (id: string) => {
    startSaving("education"); clearSectionError("education");
    try {
      await service.deleteEducation(id);
      setProfile((prev) => prev ? { ...prev, educations: prev.educations.filter((e) => e.id !== id) } : prev);
      toast.success("Đã xóa", "Học vấn đã được xóa.");
    } catch (e) { setSectionError("education", e); toast.error("Xóa thất bại", extractErrorMessage(e)); throw e; }
    finally { stopSaving("education"); }
  }, [toast]);

  const uploadCV = useCallback(async (data: UploadCVPayload & { setAsPrimary?: boolean }) => {
    const newCV = await service.uploadCV(data);
    setCvList((prev) => [newCV, ...prev]);
    toast.success("Tải lên thành công", "CV của bạn đã được lưu.");
  }, [toast]);

  const deleteCV = useCallback(async (cvId: string) => {
    await service.deleteCV(cvId);
    setCvList((prev) => prev.filter((cv) => cv.id !== cvId));
    toast.success("Đã xóa", "CV đã được xóa.");
  }, [toast]);

  const viewCV = useCallback(async () => {
    const primary = cvList.find((cv) => cv.primary) ?? cvList[0];
    if (!primary) { toast.error("Chưa có CV", "Vui lòng tải CV lên trước."); return; }
    await service.viewCV(primary.id);
  }, [cvList, toast]);

  const downloadCV = useCallback(async () => {
    const primary = cvList.find((cv) => cv.primary) ?? cvList[0];
    if (!primary) { toast.error("Chưa có CV", "Vui lòng tải CV lên trước."); return; }
    await service.downloadCV(primary.id, primary.title);
  }, [cvList, toast]);

  const setPrimaryCV = useCallback(async (cvId: string) => {
    await service.setPrimaryCV(cvId);
    setCvList(await service.listCVs());
    toast.success("Đã cập nhật", "CV chính đã được thay đổi.");
  }, [toast]);

  const refreshCvList = useCallback(async () => {
    setCvListLoading(true);
    try { setCvList(await service.listCVs()); } finally { setCvListLoading(false); }
  }, []);

  const primaryCV = useMemo(() => cvList.find((cv) => cv.primary) ?? null, [cvList]);
  const { percentage, steps } = useMemo(
    () => (profile ? calcCompletion(profile) : { percentage: 0, steps: [] }),
    [profile],
  );

  const isBoosted    = boostStatus?.currentlyBoosted ?? profile?.boosted ?? false;
  const boostedUntil = boostStatus?.boostedUntil     ?? profile?.boostedUntil ?? null;

  // ── Loading ───────

  if (loading) {
    return (
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 animate-pulse">
        <div className="flex-1 flex flex-col gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={`bg-gray-100 rounded-xl ${i === 0 ? "h-24" : "h-32"}`} />
          ))}
        </div>
        <div className="w-full lg:w-72 shrink-0 flex flex-col gap-4">
          <div className="h-52 bg-gray-100 rounded-xl" />
          <div className="h-36 bg-gray-100 rounded-xl" />
          <div className="h-48 bg-gray-100 rounded-xl" />
          <div className="h-44 bg-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  // ── Error ─────────

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-[16px] text-red-500">{error ?? "Không thể tải hồ sơ"}</p>
        <button
          onClick={loadProfile}
          className="px-4 py-2 text-[16px] font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Thử lại
        </button>
      </div>
    );
  }

  // ── Render ────────

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-start">

      {/* ── Left: profile sections ───── */}
      <div className="w-full lg:flex-1 lg:min-w-0 flex flex-col gap-4">
              <ProfileHero
        firstName={profile.firstName ?? undefined}
        lastName={profile.lastName   ?? undefined}
        title={profile.headline      ?? undefined}
        avatar={profile.avatarUrl    ?? undefined}
        onAvatarChange={updateAvatar}
        onViewCV={cvList.length > 0 ? viewCV      : undefined}
        onDownloadCV={cvList.length > 0 ? downloadCV : undefined}
        onTitleChange={async (newTitle) => {
          await updateProfile("personal", { headline: newTitle });
        }}
      />
        <PersonalInfoSection   profile={profile} saving={!!saving.personal}      error={sectionErrors.personal}      onSave={updateProfile} />
        <BioSection            profile={profile} saving={!!saving.bio}            error={sectionErrors.bio}            onSave={updateProfile} />
        <SkillsSection         profile={profile} saving={!!saving.skills}         error={sectionErrors.skills}         onSave={updateProfile} />
        <WorkExperienceSection profile={profile} saving={!!saving.experience}     error={sectionErrors.experience}
          onAdd={addExperience} onUpdate={updateExperience} onDelete={deleteExperience} />
        <EducationSection      profile={profile} saving={!!saving.education}      error={sectionErrors.education}
          onAdd={addEducation}  onUpdate={updateEducation}  onDelete={deleteEducation} />
        <LinksSection          profile={profile} saving={!!saving.links}          error={sectionErrors.links}          onSave={updateProfile} />
        <LanguagesSection      profile={profile} saving={!!saving.languages}      error={sectionErrors.languages}      onSave={updateProfile} />
        <JobExpectationSection profile={profile} saving={!!saving.jobExpectation} error={sectionErrors.jobExpectation} onSave={updateProfile} />
        <BenefitsSection       profile={profile} saving={!!saving.benefits}       error={sectionErrors.benefits}       onSave={updateProfile} />
      </div>

      {/* ── Right: sidebar cards ─────────────────

      ──────────────── */}
      <div className="w-full lg:w-72 lg:shrink-0 lg:sticky lg:top-4 flex flex-col gap-4">
        <ProfileCompletionCard percentage={percentage} steps={steps} />
        <BoostCard
          boosted={isBoosted}
          boostedUntil={boostedUntil}
          boostsRemaining={boostsRemaining}
          boosting={boosting}
          onBoost={handleBoost}
        />
        <CVUploadCard
          primaryCV={primaryCV}
          cvList={cvList}
          cvListLoading={cvListLoading}
          onUpload={uploadCV}
          onDelete={deleteCV}
          onView={(cvId) => service.viewCV(cvId)}
          onDownload={(cvId, title) => service.downloadCV(cvId, title)}
          onSetPrimary={setPrimaryCV}
          onRefreshList={refreshCvList}
          onEdit={handleEditOnlineCV}
          onViewOnline={handleViewOnlineCV}
        />
        <ProfileShareCard
          profileUrl={profile.profileUrl ?? `CareerUp.com/u/${profile.id.slice(0, 8)}`}
        />
      </div>
    </div>
  );
}