"use client";

import React, { useState } from "react";
import { FileText, Briefcase, BookOpen, Link2, Globe, Target, Gift, Save } from "lucide-react";
import { ProfileHeader } from "./ProfileHeader";
import { UserProfile } from "@/types/profile";
import { PersonalInfo } from "./PersonalInfo";
import { SectionCard } from "../layout/profile/SectionCard";
import { ProfileCompletion } from "./ProfileCompletion";
import { CVUpload } from "./CVUpload";
import { ProfileUrl } from "./ProfileUrl";
import { BioSection } from "./BioSection";
import { SkillsSection } from "./SkillsSection";
import { ExperienceSection } from "./ExperienceSection";
import { EducationSection } from "./EducationSection";
import { LinksSection } from "./LinksSection";
import { LanguageSection } from "./LanguageSection";
import { JobExpectationsSection } from "./JobExpectationsSection";
import { BenefitsSection } from "./BenefitsSection";

interface ProfilePageContentProps {
  initialUser: UserProfile;
}

type SectionKey = "bio" | "skills" | "experiences" | "educations" | "links" | "languages" | "jobExpectation" | "benefits";

export function ProfilePageContent({ initialUser }: ProfilePageContentProps) {
  const [user, setUser] = useState<UserProfile>(initialUser);
  const [cvFile, setCvFile] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);
  const [openSections, setOpenSections] = useState<Partial<Record<SectionKey, boolean>>>({});

  const open = (key: SectionKey) =>
    setOpenSections((prev) => ({ ...prev, [key]: true }));

  const isVisible = (key: SectionKey, hasData: boolean) =>
    hasData || openSections[key];

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
  };

  const updateUser = (data: Partial<UserProfile>) =>
    setUser((prev) => ({ ...prev, ...data }));

  return (
    <div className="flex gap-6 p-6 bg-gray-50 min-h-screen">
      <div className="flex-1 min-w-0 space-y-4">
        <ProfileHeader
          user={user}
          onViewCV={() => {}}
          onDownloadPDF={() => {}}
          onAvatarChange={(file) => updateUser({ avatar: URL.createObjectURL(file) })}
        />

        <PersonalInfo user={user} onSave={updateUser} />

        {/* Bio */}
        {isVisible("bio", !!user?.bio) ? (
          <BioSection value={user?.bio} onChange={(val) => updateUser({ bio: val })} />
        ) : (
          <SectionCard title="Giới thiệu bản thân" icon={<FileText size={16} />}
            addLabel="Giới thiệu bản thân" onAdd={() => open("bio")}
            isEmpty emptyText="Giới thiệu về bản thân bạn" />
        )}

        {/* Skills */}
        {isVisible("skills", !!user?.skills?.length) ? (
          <SkillsSection
            skills={user?.skills ?? []}
            onAdd={(skill) => updateUser({ skills: [...(user.skills ?? []), skill] })}
            onRemove={(id) => updateUser({ skills: user.skills?.filter((s) => s.id !== id) })}
          />
        ) : (
          <SectionCard title="Kỹ năng chuyên môn" icon={<Target size={16} />}
            addLabel="Kỹ năng chuyên môn" onAdd={() => open("skills")}
            isEmpty emptyText="Thêm kỹ năng chuyên môn của bạn" />
        )}

        {/* Experience */}
        {isVisible("experiences", !!user?.experiences?.length) ? (
          <ExperienceSection
            experiences={user?.experiences ?? []}
            onAdd={(exp) => updateUser({ experiences: [...(user.experiences ?? []), exp] })}
            onRemove={(id) => updateUser({ experiences: user.experiences?.filter((e) => e.id !== id) })}
          />
        ) : (
          <SectionCard title="Kinh nghiệm làm việc" icon={<Briefcase size={16} />}
            addLabel="Kinh nghiệm làm việc" onAdd={() => open("experiences")}
            isEmpty emptyText="Thêm kinh nghiệm làm việc của bạn" />
        )}

        {/* Education */}
        {isVisible("educations", !!user?.educations?.length) ? (
          <EducationSection
            educations={user?.educations ?? []}
            onAdd={(edu) => updateUser({ educations: [...(user.educations ?? []), edu] })}
            onRemove={(id) => updateUser({ educations: user.educations?.filter((e) => e.id !== id) })}
          />
        ) : (
          <SectionCard title="Học vấn" icon={<BookOpen size={16} />}
            addLabel="Học vấn" onAdd={() => open("educations")}
            isEmpty emptyText="Thêm quá trình học vấn" />
        )}

        {/* Links */}
        {isVisible("links", !!user?.links?.length) ? (
          <LinksSection
            links={user?.links ?? []}
            onAdd={(link) => updateUser({ links: [...(user.links ?? []), link] })}
            onRemove={(id) => updateUser({ links: user.links?.filter((l) => l.id !== id) })}
          />
        ) : (
          <SectionCard title="Liên kết" icon={<Link2 size={16} />}
            addLabel="Liên kết" onAdd={() => open("links")}
            isEmpty emptyText="Thêm danh mục dự án (Portfolio) và liên kết mạng xã hội" />
        )}

        {/* Languages */}
        {isVisible("languages", !!user?.languages?.length) ? (
          <LanguageSection
            languages={user?.languages ?? []}
            onAdd={(lang) => updateUser({ languages: [...(user.languages ?? []), lang] })}
            onRemove={(id) => updateUser({ languages: user.languages?.filter((l) => l.id !== id) })}
          />
        ) : (
          <SectionCard title="Ngoại ngữ" icon={<Globe size={16} />}
            addLabel="Ngôn ngữ" onAdd={() => open("languages")}
            isEmpty emptyText="Thêm trình độ ngoại ngữ" />
        )}

        {/* JobExpectation */}
        {isVisible("jobExpectation", !!user?.desiredJobs?.length) ? (
          <JobExpectationsSection
            value={user?.jobExpectation}
            onChange={() => updateUser({ desiredJobs: [] })}
          />
        ) : (
          <SectionCard title="Công việc mong muốn" icon={<Target size={16} />}
            addLabel="Công việc mong muốn" onAdd={() => open("jobExpectation")}
            isEmpty emptyText="Thêm công việc mong muốn" />
        )}

        {/* Benefits */}
        {isVisible("benefits", !!user?.benefits?.length) ? (
          <BenefitsSection
            selected={user?.benefits ?? []}
            onChange={(val) => updateUser({ benefits: val })}
          />
        ) : (
          <SectionCard title="Phúc lợi kỳ vọng" icon={<Gift size={16} />}
            addLabel="Phúc lợi kỳ vọng" onAdd={() => open("benefits")}
            isEmpty emptyText="Thêm phúc lợi kỳ vọng" />
        )}
      </div>

      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 space-y-4">
        <ProfileCompletion percent={user?.completionPercent} />
        <CVUpload onUpload={(file) => setCvFile(file.name)} currentFile={cvFile} onRemove={() => setCvFile(undefined)} />
        <ProfileUrl url={user?.profileUrl} />
        <button onClick={handleSave} disabled={saving}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2"
        >
          {saving ? (
            <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Đang lưu...</>
          ) : (
            <><Save size={15} />Lưu hồ sơ</>
          )}
        </button>
      </div>
    </div>
  );
}