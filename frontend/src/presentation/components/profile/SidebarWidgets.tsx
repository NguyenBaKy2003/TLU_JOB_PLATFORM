"use client";

import { Save } from "lucide-react";
import { CVUpload } from "./CVUpload";
import { ProfileCompletion } from "./ProfileCompletion";
import { ProfileUrl } from "./ProfileUrl";

interface SidebarWidgetsProps {
  completionPercent?: number;
  profileUrl?:        string;
  cvFile?:            string;
  saving:             boolean;
  onUpload:           (file: File) => void;
  onRemoveCv:         () => void;
  onSave:             () => void;
}

export function SidebarWidgets({
  completionPercent,
  profileUrl,
  cvFile,
  saving,
  onUpload,
  onRemoveCv,
  onSave,
}: SidebarWidgetsProps) {
  return (
    <div className="space-y-4">
      <ProfileCompletion percent={completionPercent} />
      <CVUpload
        onUpload={onUpload}
        currentFile={cvFile}
        onRemove={onRemoveCv}
      />
      <ProfileUrl url={profileUrl} />
      <button
        onClick={onSave}
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
  );
}