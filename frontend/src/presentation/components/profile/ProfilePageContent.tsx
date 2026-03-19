"use client";

import React, { useState } from "react";
import {
  FileText,
  Briefcase,
  BookOpen,
  Link2,
  Globe,
  Target,
  Gift,
  Save,
} from "lucide-react";
import { ProfileHeader } from "./ProfileHeader";
import { UserProfile } from "@/types/profile";
import { PersonalInfo } from "./PersonalInfo";
import { SectionCard } from "../layout/profile/SectionCard";
import { ProfileCompletion } from "./ProfileCompletion";
import { CVUpload } from "./CVUpload";
import { ProfileUrl } from "./ProfileUrl";

interface ProfilePageContentProps {
  initialUser: UserProfile;
}

export function ProfilePageContent({ initialUser }: ProfilePageContentProps) {
  const [user, setUser] = useState<UserProfile>(initialUser);
  const [cvFile, setCvFile] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
  };

  const updateUser = (data: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...data }));
  };

  return (
    <div className="flex gap-6 p-6 bg-gray-50 min-h-screen">
      {/* Main content */}
      <div className="flex-1 min-w-0 space-y-4">
        <ProfileHeader
          user={user}
          onViewCV={() => {}}
          onDownloadPDF={() => {}}
          onAvatarChange={(file) => {
            const url = URL.createObjectURL(file);
            updateUser({ avatar: url });
          }}
        />

        <PersonalInfo user={user} onSave={updateUser} />

        <SectionCard
          title="Giới thiệu bản thân"
          icon={<FileText size={16} />}
          addLabel="Giới thiệu bản thân"
          onAdd={() => {}}
          isEmpty={!user?.bio}
          emptyText="Giới thiệu về bản thân bạn"
        />

        <SectionCard
          title="Kỹ năng chuyên môn"
          icon={<Target size={16} />}
          addLabel="Kỹ năng chuyên môn"
          onAdd={() => {}}
          isEmpty={!user?.skills?.length}
          emptyText="Giới thiệu về bản thân bạn"
        />

        <SectionCard
          title="Kinh nghiệm làm việc"
          icon={<Briefcase size={16} />}
          addLabel="Kinh nghiệm làm việc"
          onAdd={() => {}}
          isEmpty={!user?.experiences?.length}
          emptyText="Giới thiệu về bản thân bạn"
        />

        <SectionCard
          title="Học vấn"
          icon={<BookOpen size={16} />}
          addLabel="Học vấn"
          onAdd={() => {}}
          isEmpty={!user?.educations?.length}
          emptyText="Thêm quá trình học vấn"
        />

        <SectionCard
          title="Liên kết"
          icon={<Link2 size={16} />}
          addLabel="Liên kết"
          onAdd={() => {}}
          isEmpty={!user?.links?.length}
          emptyText="Thêm danh mục dự án (Portfolio) và liên kết mạng xã hội của bạn"
        />

        <SectionCard
          title="Ngoại ngữ"
          icon={<Globe size={16} />}
          addLabel="Ngôn ngữ"
          onAdd={() => {}}
          isEmpty={!user?.languages?.length}
          emptyText="Thêm trình độ ngoại ngữ"
        />

        <SectionCard
          title="Công việc mong muốn"
          icon={<Target size={16} />}
          addLabel="Công việc mong muốn"
          onAdd={() => {}}
          isEmpty={!user?.desiredJobs?.length}
          emptyText="Thêm công việc mong muốn"
        />

        <SectionCard
          title="Phúc lợi kỳ vọng"
          icon={<Gift size={16} />}
          addLabel="Phúc lợi kỳ vọng"
          onAdd={() => {}}
          isEmpty={!user?.benefits?.length}
          emptyText="Add your preferred job benefits"
        />
      </div>

      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 space-y-4">
        <ProfileCompletion percent={user?.completionPercent} />
        <CVUpload
          onUpload={(file) => setCvFile(file.name)}
          currentFile={cvFile}
          onRemove={() => setCvFile(undefined)}
        />
        <ProfileUrl url={user?.profileUrl} />

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Đang lưu...
            </>
          ) : (
            <>
              <Save size={15} />
              Lưu hồ sơ
            </>
          )}
        </button>
      </div>
    </div>
  );
}