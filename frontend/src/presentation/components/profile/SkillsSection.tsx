"use client";

import { Star, X, Plus }           from "lucide-react";
import { useState, KeyboardEvent } from "react";
import SectionWrapper              from "./SectionWrapper";
import {
  CandidateProfile,
  UpdateProfilePayload,
  SkillPayload,
}                                  from "@/domain/models/Candidate";
import { SectionKey } from "./types/SectionKey";

// ─── Constants ────────────

const LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;

const LEVEL_LABELS: Record<string, string> = {
  BEGINNER:     "Cơ bản",
  INTERMEDIATE: "Trung cấp",
  ADVANCED:     "Nâng cao",
};

// ─── Types ─

interface DraftSkill {
  name:       string;
  level:      string;
  yearsOfExp: number;
}

interface Props {
  profile: CandidateProfile;
  saving:  boolean;
  error?:  string;
  onSave:  (section: SectionKey, payload: UpdateProfilePayload) => Promise<void>;
}

// ─── Helpers ──────────────

/**
 * Dedup theo name (case-insensitive), giữ phần tử đầu tiên.
 * Chạy khi khởi tạo draft từ profile để không bị ảnh hưởng bởi
 * data cũ bị duplicate từ backend.
 */
function dedup(skills: DraftSkill[]): DraftSkill[] {
  const seen = new Set<string>();
  return skills.filter((s) => {
    const key = s.name.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ─── Component ────────────

export default function SkillsSection({ profile, saving, error, onSave }: Props) {
  const [editing, setEditing] = useState(false);

  // Draft khởi tạo đã dedup — xử lý luôn data cũ bẩn từ backend
  const [draft, setDraft] = useState<DraftSkill[]>(() =>
    dedup(profile.skills.map((s) => ({
      name: s.name, level: s.level, yearsOfExp: s.yearsOfExp,
    }))),
  );

  const [input, setInput] = useState("");
  const [level, setLevel] = useState<string>("INTERMEDIATE");

  // ── Actions ────────────

  const addSkill = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    // Chặn duplicate ngay tại UI (case-insensitive)
    const already = draft.some(
      (s) => s.name.toLowerCase() === trimmed.toLowerCase(),
    );
    if (already) { setInput(""); return; }

    setDraft((prev) => [...prev, { name: trimmed, level, yearsOfExp: 0 }]);
    setInput("");
  };

  /**
   * Xóa theo INDEX — không dùng name vì có thể trùng trong data cũ.
   * React key cũng dùng index để tránh conflict khi có tên giống nhau.
   */
  const removeSkill = (index: number) =>
    setDraft((prev) => prev.filter((_, i) => i !== index));

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill(input);
    }
  };

  const handleSave = async () => {
    const payload: SkillPayload[] = draft.map((s) => ({
      name:       s.name,
      level:      s.level,
      yearsOfExp: s.yearsOfExp,
    }));
    await onSave("skills", { skills: payload });
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft(dedup(profile.skills.map((s) => ({
      name: s.name, level: s.level, yearsOfExp: s.yearsOfExp,
    }))));
    setEditing(false);
  };

  // ── Render ─────────────

  return (
    <SectionWrapper
      title="Kỹ năng chuyên môn"
      icon={<Star size={16} />}
      onEdit={() => setEditing(true)}
      editing={editing}
    >
      {error && (
        <p className="mb-3 text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
      )}

      {editing ? (
        <>
          {/* Input row */}
          <div className="flex gap-2 mb-4">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Nhập kỹ năng, Enter để thêm..."
              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-300"
            />
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {LEVELS.map((l) => (
                <option key={l} value={l}>{LEVEL_LABELS[l]}</option>
              ))}
            </select>
            <button
              onClick={() => addSkill(input)}
              className="px-3 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Draft tags — key là INDEX, xóa bằng INDEX */}
          <div className="flex flex-wrap gap-2 mb-4">
            {draft.map((s, index) => (
              <span
                key={index}               // ← index, không phải s.name
                className="flex items-center gap-1.5 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full"
              >
                {s.name}
                <span className="text-[10px] text-gray-400">
                  · {LEVEL_LABELS[s.level] ?? s.level}
                </span>
                <button
                  onClick={() => removeSkill(index)}  // ← index, không phải s.name
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
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg
                hover:bg-gray-200 disabled:opacity-50 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg
                hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
            >
              {saving && (
                <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              )}
              Lưu
            </button>
          </div>
        </>
      ) : (
        // Read view — dedup lại khi render để không hiển thị trùng
        <div className="flex flex-wrap gap-2">
          {dedup(profile.skills.map((s) => ({ name: s.name, level: s.level, yearsOfExp: s.yearsOfExp })))
            .map((s, index) => (
              <span
                key={index}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700
                  bg-gray-100 rounded-full border border-gray-200"
              >
                {s.name}
                <span className="text-[10px] text-gray-400">
                  · {LEVEL_LABELS[s.level] ?? s.level}
                </span>
              </span>
            ))}
          {profile.skills.length === 0 && (
            <p className="text-sm text-gray-400 italic">Chưa có kỹ năng</p>
          )}
        </div>
      )}
    </SectionWrapper>
  );
}