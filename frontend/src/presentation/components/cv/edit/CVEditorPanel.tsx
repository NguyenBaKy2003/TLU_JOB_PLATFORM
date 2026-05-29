"use client";

import { useEffect, useState } from "react";
import { Loader2, Download, UserCircle2, Type } from "lucide-react";
import type {
  OnlineCVDetail, CVSection,
  PersonalInfoForm, UpdateCVSectionPayload,
} from "@/domain/models/Cv";
import { SECTION_TYPE_LABELS } from "@/domain/models/Cv";
import { EditorTab } from "@/app/(cv)/cv/[id]/edit/page";

// ── Shared field component ─────────────────────────────────────────────────

function FormField({
  label, value, onChange, type = "text", placeholder, hint, span2 = false,
}: {
  label:       string;
  value:       string;
  onChange:    (v: string) => void;
  type?:       string;
  placeholder?: string;
  hint?:       string;
  span2?:      boolean;
}) {
  return (
    <div className={span2 ? "col-span-2" : ""}>
      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="
          w-full px-3.5 py-2.5 text-sm text-slate-900
          bg-white border border-slate-200 rounded-xl
          focus:outline-none focus:ring-2 focus:ring-[#3D5A80]/20 focus:border-[#3D5A80]
          placeholder:text-slate-300 transition-all
        "
      />
      {hint && <p className="text-[11px] text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

// ── Personal Info Editor ───────────────────────────────────────────────────

function PersonalInfoEditor({
  cv, saving, onSave, onImportFromProfile, onRealtimeUpdate,
}: {
  cv:                  OnlineCVDetail;
  saving:              boolean;
  onSave:              (form: PersonalInfoForm) => Promise<void>;
  onImportFromProfile: () => Promise<void>;
  onRealtimeUpdate:    (form: PersonalInfoForm) => void;
}) {
  const makeForm = (): PersonalInfoForm => ({
    fullName:  cv.personalInfo?.fullName  ?? "",
    email:     cv.personalInfo?.email     ?? "",
    phone:     cv.personalInfo?.phone     ?? "",
    address:   cv.personalInfo?.address   ?? "",
    avatarUrl: cv.personalInfo?.avatarUrl ?? "",
    headline:  cv.personalInfo?.headline  ?? "",
    linkedIn:  cv.personalInfo?.linkedIn  ?? "",
    github:    cv.personalInfo?.github    ?? "",
    website:   cv.personalInfo?.website   ?? "",
  });

  const [form,      setForm]      = useState<PersonalInfoForm>(makeForm);
  const [importing, setImporting] = useState(false);

  useEffect(() => { setForm(makeForm()); }, [cv.personalInfo]);

  const set = (key: keyof PersonalInfoForm) => (val: string) => {
    const next = { ...form, [key]: val };
    setForm(next);
    onRealtimeUpdate(next);
  };

  const handleImport = async () => {
    setImporting(true);
    await onImportFromProfile();
    setImporting(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 flex-shrink-0">
        <div className="flex items-center gap-2">
          <UserCircle2 className="w-4 h-4 text-[#3D5A80]" />
          <h2 className="text-sm font-bold text-slate-800">Thông tin cá nhân</h2>
        </div>
        <button
          type="button"
          onClick={handleImport}
          disabled={importing}
          className="flex items-center gap-1.5 text-[11px] font-semibold text-[#3D5A80] hover:underline disabled:opacity-50 transition-opacity"
        >
          {importing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
          Nhập từ profile
        </button>
      </div>

      {/* Scrollable fields */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
        {/* Avatar preview */}
        {form.avatarUrl && (
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <img
              src={form.avatarUrl}
              alt="Avatar"
              className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">{form.fullName || "Chưa có tên"}</p>
              <p className="text-[11px] text-slate-400 truncate">{form.headline || "Chưa có headline"}</p>
            </div>
          </div>
        )}

        {/* Basic */}
        <div className="grid grid-cols-2 gap-3.5">
          <FormField span2 label="Họ và tên"   value={form.fullName}  onChange={set("fullName")}  placeholder="Nguyễn Văn A" />
          <FormField span2 label="Headline"    value={form.headline}  onChange={set("headline")}  placeholder="Frontend Developer · 3 năm kinh nghiệm" />
          <FormField       label="Email"       value={form.email}     onChange={set("email")}     type="email" placeholder="email@example.com" />
          <FormField       label="Điện thoại"  value={form.phone}     onChange={set("phone")}     type="tel"   placeholder="0912 345 678" />
          <FormField span2 label="Địa chỉ"    value={form.address}   onChange={set("address")}   placeholder="Hà Nội, Việt Nam" />
          <FormField span2 label="URL ảnh đại diện" value={form.avatarUrl} onChange={set("avatarUrl")} placeholder="https://..." hint="Dán link ảnh từ Internet" />
        </div>

        {/* Social */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Mạng xã hội</p>
          <div className="space-y-3">
            <FormField label="LinkedIn" value={form.linkedIn} onChange={set("linkedIn")} placeholder="https://linkedin.com/in/username" />
            <FormField label="GitHub"   value={form.github}   onChange={set("github")}   placeholder="https://github.com/username" />
            <FormField label="Website / Portfolio" value={form.website} onChange={set("website")} placeholder="https://mysite.com" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="
            flex items-center gap-2 px-5 py-2.5
            bg-[#3D5A80] hover:bg-[#2E4565]
            text-white text-xs font-bold rounded-xl
            transition-all active:scale-95 disabled:opacity-60 shadow-sm
          "
        >
          {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          Lưu thông tin
        </button>
      </div>
    </form>
  );
}

// ── Section Editor ─────────────────────────────────────────────────────────

function SectionEditor({
  section, saving, onUpdate, onRealtimeUpdate,
}: {
  section:           CVSection;
  saving:            boolean;
  onUpdate:          (sectionId: string, payload: UpdateCVSectionPayload) => Promise<void>;
  onRealtimeUpdate:  (sectionId: string, payload: UpdateCVSectionPayload) => void;
}) {
  const [title,   setTitle]   = useState(section.title);
  const [content, setContent] = useState(section.content);
  const [isDirty, setIsDirty] = useState(false);

  // Sync when switching sections
  useEffect(() => {
    setTitle(section.title);
    setContent(section.content);
    setIsDirty(false);
  }, [section.id]);

  const handleTitle = (v: string) => {
    setTitle(v); setIsDirty(true);
    onRealtimeUpdate(section.id, { title: v, content, visible: section.visible });
  };
  const handleContent = (v: string) => {
    setContent(v); setIsDirty(true);
    onRealtimeUpdate(section.id, { title, content: v, visible: section.visible });
  };

  const insertMarkdown = (tag: string) => {
    handleContent(content + `${tag}text${tag}`);
  };

  const handleSave = async () => {
    await onUpdate(section.id, { title, content, visible: section.visible });
    setIsDirty(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-100 flex-shrink-0">
        <Type className="w-4 h-4 text-[#3D5A80]" />
        <span className="text-sm font-bold text-slate-800">
          {SECTION_TYPE_LABELS[section.type]}
        </span>
        <span className="text-slate-300">·</span>
        <span className="text-xs text-slate-400">Chỉnh sửa nội dung</span>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4">
        {/* Title field */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
            Tiêu đề mục
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitle(e.target.value)}
            className="
              w-full px-3.5 py-2.5 text-sm font-semibold text-slate-900
              bg-white border border-slate-200 rounded-xl
              focus:outline-none focus:ring-2 focus:ring-[#3D5A80]/20 focus:border-[#3D5A80]
              transition-all
            "
          />
        </div>

        {/* Content editor */}
        <div className="flex flex-col flex-1 min-h-0">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
            Nội dung
          </label>
          <div className="flex flex-col rounded-xl border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-[#3D5A80]/20 focus-within:border-[#3D5A80] transition-all flex-1 min-h-0">
            {/* Mini toolbar */}
            <div className="flex items-center gap-1 px-3 py-2 border-b border-slate-100 bg-slate-50 flex-shrink-0">
              {[
                { label: "B", style: { fontWeight: 700 },         tag: "**" },
                { label: "I", style: { fontStyle: "italic" },     tag: "_" },
                { label: "U", style: { textDecoration: "underline" }, tag: "__" },
              ].map(({ label, style, tag }) => (
                <button
                  key={label}
                  type="button"
                  style={style as React.CSSProperties}
                  className="w-7 h-7 text-xs text-slate-500 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center"
                  onClick={() => insertMarkdown(tag)}
                >
                  {label}
                </button>
              ))}
              <div className="w-px h-4 bg-slate-200 mx-1" />
              <button
                type="button"
                className="text-[10px] font-mono text-slate-400 hover:bg-slate-200 px-2 py-1 rounded-lg transition-colors"
                onClick={() => handleContent(content + "\n- ")}
              >
                — list
              </button>
            </div>

            <textarea
              value={content}
              onChange={(e) => handleContent(e.target.value)}
              rows={14}
              placeholder={`Nội dung cho "${title}"…\n\nMarkdown:\n- **in đậm**, _in nghiêng_\n- Danh sách: bắt đầu "- "\n- Tách đoạn bằng dòng trống`}
              className="
                flex-1 px-4 py-3 text-sm text-slate-800 font-mono
                bg-white resize-none outline-none
                placeholder:text-slate-300 placeholder:font-sans
                leading-relaxed
              "
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5">{content.length} ký tự · Hỗ trợ Markdown</p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <span className={`text-[11px] font-medium transition-colors ${isDirty ? "text-amber-500" : "text-slate-400"}`}>
          {isDirty ? "Có thay đổi chưa lưu" : "Đã lưu"}
        </span>
        <button
          onClick={handleSave}
          disabled={saving || !isDirty}
          className="
            flex items-center gap-2 px-5 py-2.5
            bg-[#3D5A80] hover:bg-[#2E4565]
            text-white text-xs font-bold rounded-xl
            transition-all active:scale-95
            disabled:opacity-50 disabled:cursor-not-allowed shadow-sm
          "
        >
          {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          Lưu mục
        </button>
      </div>
    </div>
  );
}

// ── Main panel ─────────────────────────────────────────────────────────────

interface Props {
  cv:                         OnlineCVDetail;
  activeTab:                  EditorTab;
  activeSection:              CVSection | null;
  saving:                     boolean;
  onSavePersonalInfo:         (form: PersonalInfoForm) => Promise<void>;
  onUpdateSection:            (sectionId: string, payload: UpdateCVSectionPayload) => Promise<void>;
  onImportFromProfile:        () => Promise<void>;
  onRealtimePersonalInfoUpdate?: (form: PersonalInfoForm) => void;
  onRealtimeSectionUpdate?:      (sectionId: string, payload: UpdateCVSectionPayload) => void;
}

export function CVEditorPanel({
  cv, activeTab, activeSection, saving,
  onSavePersonalInfo, onUpdateSection, onImportFromProfile,
  onRealtimePersonalInfoUpdate,
  onRealtimeSectionUpdate,
}: Props) {
  return (
    <main className="flex-1 min-w-0 bg-slate-100 flex flex-col overflow-hidden p-3 md:p-4">
      <div className="flex-1 overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col">
        {activeTab === "personal" ? (
          <PersonalInfoEditor
            cv={cv}
            saving={saving}
            onSave={onSavePersonalInfo}
            onImportFromProfile={onImportFromProfile}
            onRealtimeUpdate={onRealtimePersonalInfoUpdate ?? (() => {})}
          />
        ) : activeSection ? (
          <SectionEditor
            key={activeSection.id}
            section={activeSection}
            saving={saving}
            onUpdate={onUpdateSection}
            onRealtimeUpdate={onRealtimeSectionUpdate ?? (() => {})}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-3 p-8">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
              <Type className="w-5 h-5 text-slate-300" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-slate-500">Chưa chọn mục</p>
              <p className="text-xs text-slate-400 mt-1">Chọn một mục ở sidebar để bắt đầu chỉnh sửa</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}