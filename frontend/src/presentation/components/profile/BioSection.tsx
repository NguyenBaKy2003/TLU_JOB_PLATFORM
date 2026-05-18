"use client";

import { UserCircle }            from "lucide-react";
import { useState, useEffect }   from "react";
import SectionWrapper            from "./SectionWrapper";
import { CandidateProfile,
         UpdateProfilePayload }  from "@/domain/models/Candidate";
import { SectionKey } from "./types/SectionKey";

const MAX = 512;

interface Props {
  profile: CandidateProfile;
  saving:  boolean;
  error?:  string;
  onSave:  (section: SectionKey, payload: UpdateProfilePayload) => Promise<void>;
}

export default function BioSection({ profile, saving, error, onSave }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState(profile.summary ?? "");

  // Sync draft khi profile thay đổi từ bên ngoài (reload sau khi lưu)
  useEffect(() => {
    if (!editing) setDraft(profile.summary ?? "");
  }, [profile.summary, editing]);

  const handleSave = async () => {
    await onSave("bio", { summary: draft.trim() === "" ? null : draft });
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft(profile.summary ?? "");
    setEditing(false);
  };

  return (
    <SectionWrapper
      title="Giới thiệu bản thân"
      icon={<UserCircle size={16} />}
      onEdit={() => setEditing(true)}
      editing={editing}
    >
      {error && (
        <p className="mb-3 text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
      )}

      {editing ? (
        <>
          <label className="block text-xs text-gray-500 mb-1.5">Tóm tắt hồ sơ</label>
          <div className="relative">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value.slice(0, MAX))}
              placeholder="Giới thiệu về bản thân bạn..."
              rows={5}
              className="w-full px-3 py-2.5 text-[16px] border border-gray-200 rounded-lg bg-white
                resize-none focus:outline-none focus:ring-2 focus:ring-blue-500
                placeholder:text-gray-300 text-gray-800"
            />
            <span className="absolute bottom-2.5 right-3 text-[11px] text-gray-400">
              {draft.length}/{MAX}
            </span>
          </div>
          <div className="flex justify-end gap-2 mt-3">
            <button
              onClick={handleCancel}
              disabled={saving}
              className="px-4 py-2 text-[16px] font-medium text-gray-600 bg-gray-100 rounded-lg
                hover:bg-gray-200 disabled:opacity-50 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 text-[16px] font-medium text-white bg-blue-600 rounded-lg
                hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {saving && (
                <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              )}
              Lưu
            </button>
          </div>
        </>
      ) : (
        <p className="text-[16px] text-gray-700 leading-relaxed">
          {profile.summary || (
            <span className="text-gray-400 italic">Chưa có giới thiệu</span>
          )}
        </p>
      )}
    </SectionWrapper>
  );
}