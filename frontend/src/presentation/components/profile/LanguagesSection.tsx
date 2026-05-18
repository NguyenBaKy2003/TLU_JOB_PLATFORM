"use client";

import { Globe, X, Plus }       from "lucide-react";
import { useState, useEffect }  from "react";
import SectionWrapper           from "./SectionWrapper";
import { CandidateProfile,
         UpdateProfilePayload } from "@/domain/models/Candidate";
import { SectionKey } from "./types/SectionKey";

// ─── Constants ────────────

// Map API enum → label hiển thị
const LEVEL_OPTIONS: { value: string; label: string }[] = [
  { value: "A1",     label: "A1 – Sơ cấp"         },
  { value: "A2",     label: "A2 – Cơ bản"          },
  { value: "B1",     label: "B1 – Trung cấp"       },
  { value: "B2",     label: "B2 – Khá"             },
  { value: "C1",     label: "C1 – Thành thạo"      },
  { value: "C2",     label: "C2 – Thành thạo cao"  },
  { value: "NATIVE", label: "Bản ngữ"              },
];

const levelLabel = (v: string) =>
  LEVEL_OPTIONS.find((o) => o.value === v)?.label ?? v;

// ─── Types ─

interface DraftLang { name: string; level: string; }

interface Props {
  profile: CandidateProfile;
  saving:  boolean;
  error?:  string;
  onSave:  (section: SectionKey, payload: UpdateProfilePayload) => Promise<void>;
}

// ─── Component ────────────

export default function LanguagesSection({ profile, saving, error, onSave }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState<DraftLang[]>(() =>
    profile.languages.map((l) => ({ name: l.name, level: l.level }))
  );
  const [name,  setName]  = useState("");
  const [level, setLevel] = useState("B1");

  // Sync khi profile thay đổi từ bên ngoài
  useEffect(() => {
    if (!editing) {
      setDraft(profile.languages.map((l) => ({ name: l.name, level: l.level })));
    }
  }, [profile.languages, editing]);

  // ── Actions ─────────

  const addLang = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    // Chặn trùng tên (case-insensitive)
    const exists = draft.some((l) => l.name.toLowerCase() === trimmed.toLowerCase());
    if (!exists) setDraft((p) => [...p, { name: trimmed, level }]);
    setName("");
  };

  const removeLang = (index: number) =>
    setDraft((p) => p.filter((_, i) => i !== index));

  const handleSave = async () => {
    await onSave("languages", {
      languages: draft.map((l) => ({ name: l.name, level: l.level })),
    });
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft(profile.languages.map((l) => ({ name: l.name, level: l.level })));
    setEditing(false);
  };

  // ── Render ───────────

  return (
    <SectionWrapper
      title="Ngoại ngữ"
      icon={<Globe size={16} />}
      onEdit={() => setEditing(true)}
      editing={editing}
    >
      {error && (
        <p className="mb-3 text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
      )}

      {editing ? (
        <>
          {/* Input row */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-[11px] text-gray-400 uppercase tracking-wide mb-1">
                Tên ngôn ngữ
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addLang()}
                placeholder="Tiếng Anh, Tiếng Nhật..."
                className="w-full px-3 py-2 text-[16px] border border-gray-200 rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-300"
              />
            </div>
            <div>
              <label className="block text-[11px] text-gray-400 uppercase tracking-wide mb-1">
                Trình độ thông thạo
              </label>
              <div className="flex gap-2">
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="flex-1 px-3 py-2 text-[16px] border border-gray-200 rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {LEVEL_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <button
                  onClick={addLang}
                  className="px-3 py-2 text-blue-600 border border-blue-300 rounded-lg
                    hover:bg-blue-50 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Draft tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {draft.map((lang, i) => (
              <span
                key={i}
                className="flex items-center gap-1.5 px-3 py-1 text-[16px] bg-gray-100
                  text-gray-700 rounded-full"
              >
                {lang.name}
                <span className="text-[10px] text-gray-400">· {levelLabel(lang.level)}</span>
                <button
                  onClick={() => removeLang(i)}
                  className="hover:text-red-500 transition-colors"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <button
              onClick={handleCancel}
              disabled={saving}
              className="px-4 py-2 text-[16px] font-medium text-gray-600 bg-gray-100
                rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 text-[16px] font-medium text-white bg-blue-600
                rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
            >
              {saving && (
                <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              )}
              Lưu
            </button>
          </div>
        </>
      ) : (
        /* Read view */
        <div className="flex flex-wrap gap-2">
          {profile.languages.length > 0 ? (
            profile.languages.map((l, i) => (
              <span
                key={i}
                className="px-3 py-1.5 text-[16px] text-gray-700 bg-gray-100
                  rounded-full border border-gray-200"
              >
                {l.name}
                <span className="text-gray-400"> / {levelLabel(l.level)}</span>
              </span>
            ))
          ) : (
            <p className="text-[16px] text-gray-400 italic">Chưa có ngoại ngữ</p>
          )}
        </div>
      )}
    </SectionWrapper>
  );
}