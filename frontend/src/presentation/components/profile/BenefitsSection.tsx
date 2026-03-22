"use client";

import { Heart, X }             from "lucide-react";
import { useState }             from "react";
import SectionWrapper           from "./SectionWrapper";
import { CandidateProfile,
         UpdateProfilePayload } from "@/domain/models/Candidate";
import { SectionKey } from "./types/SectionKey";

// API trả về Benefit object {id, name} nhưng gửi lên chỉ cần name string
const PRESET_BENEFITS = [
  "Cơ hội thăng tiến", "Xe đưa đón", "Giờ làm việc linh hoạt",
  "Bảo hiểm sức khỏe", "Thưởng hiệu suất", "Làm việc từ xa",
];

interface Props {
  profile: CandidateProfile;
  saving:  boolean;
  error?:  string;
  onSave:  (section: SectionKey, payload: UpdateProfilePayload) => Promise<void>;
}

export default function BenefitsSection({ profile, saving, error, onSave }: Props) {
  // API trả về benefits là Benefit[] {id, name} — lấy name để hiển thị
  const currentNames = profile.benefits.map((b) =>
    typeof b === "string" ? b : (b as { id: string; name: string }).name
  );

  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState<string[]>(currentNames);

  const toggle = (b: string) =>
    setDraft((p) => p.includes(b) ? p.filter((x) => x !== b) : [...p, b]);

  const handleSave = async () => {
    // Gửi lên chỉ cần name string[] theo API spec
    await onSave("benefits", { benefits: draft });
    setEditing(false);
  };
  const handleCancel = () => { setDraft(currentNames); setEditing(false); };

  return (
    <SectionWrapper title="Phúc lợi mong muốn" icon={<Heart size={16} />}
      onEdit={() => setEditing(true)} editing={editing}>
      {error && <p className="mb-3 text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

      {editing ? (
        <>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {PRESET_BENEFITS.map((b) => (
              <label key={b} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50"
                onClick={() => toggle(b)}>
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors
                  ${draft.includes(b) ? "border-blue-600 bg-blue-600" : "border-gray-300"}`}>
                  {draft.includes(b) && <svg viewBox="0 0 12 12" className="w-3 h-3">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" /></svg>}
                </div>
                <span className="text-sm text-gray-700">{b}</span>
              </label>
            ))}
          </div>

          {draft.filter((b) => !PRESET_BENEFITS.includes(b)).length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4 pt-2 border-t border-gray-100">
              {draft.filter((b) => !PRESET_BENEFITS.includes(b)).map((b) => (
                <span key={b} className="flex items-center gap-1.5 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full">
                  {b} <button onClick={() => toggle(b)} className="hover:text-red-500"><X size={12} /></button>
                </span>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button onClick={handleCancel} disabled={saving}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50">Hủy</button>
            <button onClick={handleSave} disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
              {saving && <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />}Lưu</button>
          </div>
        </>
      ) : (
        <div className="flex flex-wrap gap-2">
          {currentNames.length > 0 ? currentNames.map((b) => (
            <span key={b} className="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded-full border border-gray-200">{b}</span>
          )) : <p className="text-sm text-gray-400 italic">Chưa có phúc lợi</p>}
        </div>
      )}
    </SectionWrapper>
  );
}