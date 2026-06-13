"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from "lucide-react";
import type { SectionType } from "@/domain/models/Cv";
import {
  type ExperienceEntry, type EducationEntry,
  type LanguageEntry, type SocialLinkEntry,
  deserializeExperiences, deserializeEducations,
  deserializeLanguages, deserializeSocialLinks,
  emptyExperience, emptyEducation, emptyLanguage, emptySocialLink,
  serializeExperiences, serializeEducations,
  serializeLanguages, serializeSocialLinks,
} from "./sectionContentHelper";

// ── Shared primitives ─────────────────────────

function Field({
  label, value, onChange, type = "text", placeholder, hint,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="
          w-full px-3 py-2 text-sm text-slate-800
          bg-white border border-slate-200 rounded-lg
          focus:outline-none focus:ring-2 focus:ring-[#3D5A80]/20 focus:border-[#3D5A80]
          placeholder:text-slate-300 transition-all
        "
      />
      {hint && <p className="text-[10px] text-slate-400">{hint}</p>}
    </div>
  );
}

function TextAreaField({
  label, value, onChange, placeholder, rows = 3,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; rows?: number;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="
          w-full px-3 py-2 text-sm text-slate-800
          bg-white border border-slate-200 rounded-lg resize-none
          focus:outline-none focus:ring-2 focus:ring-[#3D5A80]/20 focus:border-[#3D5A80]
          placeholder:text-slate-300 transition-all leading-relaxed
        "
      />
    </div>
  );
}

function EntryCard({
  index, label, onDelete, children,
}: {
  index: number; label: string; onDelete: () => void; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <div
        className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 cursor-pointer select-none"
        onClick={() => setOpen((v) => !v)}
      >
        <GripVertical className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
        <span className="text-xs font-semibold text-slate-600 flex-1 truncate">
          {label || `Mục ${index + 1}`}
        </span>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-1 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-400 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
        {open
          ? <ChevronUp   className="w-3.5 h-3.5 text-slate-400" />
          : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        }
      </div>
      {open && <div className="p-3.5 flex flex-col gap-3">{children}</div>}
    </div>
  );
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        w-full flex items-center justify-center gap-1.5 py-2
        text-xs font-semibold text-[#3D5A80]
        border-2 border-dashed border-[#3D5A80]/25
        hover:border-[#3D5A80]/50 hover:bg-[#3D5A80]/5
        rounded-xl transition-all
      "
    >
      <Plus className="w-3.5 h-3.5" /> {label}
    </button>
  );
}

// ── Constants ─────

const DEGREE_OPTIONS = ["", "HIGH_SCHOOL", "ASSOCIATE", "BACHELOR", "ENGINEER", "MASTER", "DOCTOR", "OTHER"];
const DEGREE_LABELS: Record<string, string> = {
  "": "— Chọn bằng cấp —",
  HIGH_SCHOOL: "Trung học phổ thông", ASSOCIATE: "Cao đẳng",
  BACHELOR: "Cử nhân (BACHELOR)",     ENGINEER: "Kỹ sư",
  MASTER: "Thạc sĩ",                  DOCTOR: "Tiến sĩ",
  OTHER: "Khác",
};
const LANGUAGE_LEVELS  = ["", "A1", "A2", "B1", "B2", "C1", "C2", "Native"];
const SOCIAL_PLATFORMS = ["", "LINKEDIN", "GITHUB", "FACEBOOK", "TWITTER", "INSTAGRAM", "YOUTUBE", "WEBSITE", "OTHER","PORTFOLIO"];

// ── Experience ────

function ExperienceEditor({
  rawContent, onChange,
}: { rawContent: string; onChange: (json: string) => void }) {
  const [entries, setEntries] = useState<ExperienceEntry[]>(() =>
    deserializeExperiences(rawContent)
  );

  // Sync khi rawContent thay đổi từ bên ngoài (import profile, switch section)
  useEffect(() => {
    setEntries(deserializeExperiences(rawContent));
  }, [rawContent]);

  const update = useCallback((next: ExperienceEntry[]) => {
    setEntries(next);
    onChange(serializeExperiences(next));
  }, [onChange]);

  const set = (i: number, key: keyof ExperienceEntry, val: string | boolean) =>
    update(entries.map((e, idx) => idx === i ? { ...e, [key]: val } : e));

  return (
    <div className="flex flex-col gap-3">
      {entries.map((exp, i) => (
        <EntryCard
          key={i} index={i}
          label={[exp.position, exp.company].filter(Boolean).join(" @ ")}
          onDelete={() => update(entries.filter((_, idx) => idx !== i))}
        >
          <div className="grid grid-cols-2 gap-3">
            <Field label="Công ty"  value={exp.company}  onChange={(v) => set(i, "company", v)}  placeholder="Tên công ty" />
            <Field label="Vị trí"   value={exp.position} onChange={(v) => set(i, "position", v)} placeholder="Frontend Developer" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Từ ngày"  value={exp.startDate} onChange={(v) => set(i, "startDate", v)} type="date" />
            <Field
              label="Đến ngày" value={exp.endDate}
              onChange={(v) => set(i, "endDate", v)}
              type="date"
              placeholder={exp.current ? "Hiện tại" : ""}
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none w-fit">
            <input
              type="checkbox"
              checked={exp.current}
              onChange={(e) => set(i, "current", e.target.checked)}
              className="w-4 h-4 rounded accent-[#3D5A80]"
            />
            <span className="text-xs text-slate-600 font-medium">Đang làm việc tại đây</span>
          </label>
          <TextAreaField
            label="Mô tả công việc" value={exp.description}
            onChange={(v) => set(i, "description", v)}
            placeholder="Mô tả trách nhiệm, thành tựu…" rows={3}
          />
        </EntryCard>
      ))}
      <AddButton label="Thêm kinh nghiệm" onClick={() => update([...entries, emptyExperience()])} />
    </div>
  );
}

// ── Education ─────

function EducationEditor({
  rawContent, onChange,
}: { rawContent: string; onChange: (json: string) => void }) {
  const [entries, setEntries] = useState<EducationEntry[]>(() =>
    deserializeEducations(rawContent)
  );

  useEffect(() => { setEntries(deserializeEducations(rawContent)); }, [rawContent]);

  const update = useCallback((next: EducationEntry[]) => {
    setEntries(next);
    onChange(serializeEducations(next));
  }, [onChange]);

  const set = (i: number, key: keyof EducationEntry, val: string) =>
    update(entries.map((e, idx) => idx === i ? { ...e, [key]: val } : e));

  return (
    <div className="flex flex-col gap-3">
      {entries.map((edu, i) => (
        <EntryCard
          key={i} index={i}
          label={[edu.school, edu.major].filter(Boolean).join(" · ")}
          onDelete={() => update(entries.filter((_, idx) => idx !== i))}
        >
          <Field label="Trường" value={edu.school} onChange={(v) => set(i, "school", v)} placeholder="Đại học Bách Khoa Hà Nội" />
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Bằng cấp</label>
              <select
                value={edu.degree}
                onChange={(e) => set(i, "degree", e.target.value)}
                className="w-full px-3 py-2 text-sm text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D5A80]/20 focus:border-[#3D5A80] transition-all"
              >
                {DEGREE_OPTIONS.map((d) => <option key={d} value={d}>{DEGREE_LABELS[d]}</option>)}
              </select>
            </div>
            <Field label="Chuyên ngành" value={edu.major} onChange={(v) => set(i, "major", v)} placeholder="Công nghệ thông tin" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Từ ngày"  value={edu.startDate} onChange={(v) => set(i, "startDate", v)} type="date" />
            <Field label="Đến ngày" value={edu.endDate}   onChange={(v) => set(i, "endDate", v)}   type="date" />
          </div>
        </EntryCard>
      ))}
      <AddButton label="Thêm học vấn" onClick={() => update([...entries, emptyEducation()])} />
    </div>
  );
}

// ── Language ──────

function LanguageEditor({
  rawContent, onChange,
}: { rawContent: string; onChange: (json: string) => void }) {
  const [entries, setEntries] = useState<LanguageEntry[]>(() =>
    deserializeLanguages(rawContent)
  );

  useEffect(() => { setEntries(deserializeLanguages(rawContent)); }, [rawContent]);

  const update = useCallback((next: LanguageEntry[]) => {
    setEntries(next);
    onChange(serializeLanguages(next));
  }, [onChange]);

  const set = (i: number, key: keyof LanguageEntry, val: string) =>
    update(entries.map((e, idx) => idx === i ? { ...e, [key]: val } : e));

  return (
    <div className="flex flex-col gap-3">
      {entries.map((lang, i) => (
        <div key={i} className="flex items-end gap-2">
          <div className="flex-1">
            <Field label="Ngôn ngữ" value={lang.name} onChange={(v) => set(i, "name", v)} placeholder="English" />
          </div>
          <div className="w-28 flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Trình độ</label>
            <select
              value={lang.level}
              onChange={(e) => set(i, "level", e.target.value)}
              className="w-full px-3 py-2 text-sm text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D5A80]/20 focus:border-[#3D5A80] transition-all"
            >
              {LANGUAGE_LEVELS.map((l) => <option key={l} value={l}>{l || "— Chọn —"}</option>)}
            </select>
          </div>
          <button
            type="button"
            onClick={() => update(entries.filter((_, idx) => idx !== i))}
            className="mb-0.5 p-2 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      <AddButton label="Thêm ngôn ngữ" onClick={() => update([...entries, emptyLanguage()])} />
    </div>
  );
}

// ── Social Link ───

function SocialLinkEditor({
  rawContent, onChange,
}: { rawContent: string; onChange: (json: string) => void }) {
  const [entries, setEntries] = useState<SocialLinkEntry[]>(() =>
    deserializeSocialLinks(rawContent)
  );

  useEffect(() => { setEntries(deserializeSocialLinks(rawContent)); }, [rawContent]);

  const update = useCallback((next: SocialLinkEntry[]) => {
    setEntries(next);
    onChange(serializeSocialLinks(next));
  }, [onChange]);

  const set = (i: number, key: keyof SocialLinkEntry, val: string) =>
    update(entries.map((e, idx) => idx === i ? { ...e, [key]: val } : e));

  return (
    <div className="flex flex-col gap-3">
      {entries.map((link, i) => (
        <div key={i} className="flex items-end gap-2">
          <div className="w-36 flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Nền tảng</label>
            <select
              value={link.platform}
              onChange={(e) => set(i, "platform", e.target.value)}
              className="w-full px-3 py-2 text-sm text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D5A80]/20 focus:border-[#3D5A80] transition-all"
            >
              {SOCIAL_PLATFORMS.map((p) => <option key={p} value={p}>{p || "— Chọn —"}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <Field label="URL" value={link.url} onChange={(v) => set(i, "url", v)} placeholder="https://…" type="url" />
          </div>
          <button
            type="button"
            onClick={() => update(entries.filter((_, idx) => idx !== i))}
            className="mb-0.5 p-2 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      <AddButton label="Thêm liên kết" onClick={() => update([...entries, emptySocialLink()])} />
    </div>
  );
}

// ── Main export ───

export function StructuredSectionEditor({
  type, rawContent, onChange,
}: {
  type:       SectionType;
  rawContent: string;
  onChange:   (json: string) => void;
}) {
  switch (type) {
    case "EXPERIENCE":  return <ExperienceEditor  rawContent={rawContent} onChange={onChange} />;
    case "EDUCATION":   return <EducationEditor   rawContent={rawContent} onChange={onChange} />;
    case "LANGUAGE":    return <LanguageEditor    rawContent={rawContent} onChange={onChange} />;
    case "SOCIAL_LINK": return <SocialLinkEditor  rawContent={rawContent} onChange={onChange} />;
    default:            return null;
  }
}

export function isStructuredType(type: SectionType): boolean {
  return ["EXPERIENCE", "EDUCATION", "LANGUAGE", "SOCIAL_LINK"].includes(type);
}
