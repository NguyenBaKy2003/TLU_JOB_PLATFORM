// src/presentation/components/cv/edit/CVEditorPanel.tsx
"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Loader2, Download, UserCircle2 } from "lucide-react";
import type { OnlineCVDetail, CVSection, PersonalInfoForm, UpdateCVSectionPayload } from "@/domain/models/Cv";
import { EMPTY_PERSONAL_INFO_FORM, SECTION_TYPE_LABELS } from "@/domain/models/Cv";
import { EditorTab } from "@/app/(cv)/cv/[id]/edit/page";

// ── Helpers ────────────────────────────────────────────────────────────────────

function FormField({
  label, value, onChange, type = "text", placeholder, hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="
          w-full px-3.5 py-2.5 text-sm text-gray-900
          bg-white border border-gray-200 rounded-xl
          focus:outline-none focus:ring-2 focus:ring-[#3D5A80]/25 focus:border-[#3D5A80]
          placeholder:text-gray-300 transition-all
        "
      />
      {hint && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

// ── Personal Info Form ────────────────────────────────────────────────────────

function PersonalInfoEditor({
  cv,
  saving,
  onSave,
  onImportFromProfile,
  onRealtimeUpdate, // Thêm prop mới
}: {
  cv: OnlineCVDetail;
  saving: boolean;
  onSave: (form: PersonalInfoForm) => Promise<void>;
  onImportFromProfile: () => Promise<void>;
  onRealtimeUpdate: (form: PersonalInfoForm) => void; // Cập nhật realtime
}) {
  const [form, setForm] = useState<PersonalInfoForm>({
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
  const [importing, setImporting] = useState(false);

  // Sync form khi cv thay đổi từ bên ngoài
  useEffect(() => {
    setForm({
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
  }, [cv.personalInfo]);

  const set = (key: keyof PersonalInfoForm) => (val: string) => {
    const newForm = { ...form, [key]: val };
    setForm(newForm);
    // Cập nhật realtime cho preview
    onRealtimeUpdate(newForm);
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
      {/* Panel header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-2">
          <UserCircle2 className="w-4 h-4 text-[#3D5A80]" />
          <h2 className="text-sm font-bold text-gray-800">Thông tin cá nhân</h2>
        </div>
        <button
          type="button"
          onClick={handleImport}
          disabled={importing}
          className="flex items-center gap-1.5 text-[11px] font-medium text-[#3D5A80] hover:underline disabled:opacity-50"
        >
          {importing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
          Nhập từ profile
        </button>
      </div>

      {/* Scrollable fields */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
        {/* Avatar preview */}
        {form.avatarUrl && (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
            <img
              src={form.avatarUrl}
              alt="Avatar"
              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
            <div>
              <p className="text-xs font-semibold text-gray-700">{form.fullName || "Chưa có tên"}</p>
              <p className="text-[11px] text-gray-400">{form.headline || "Chưa có headline"}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <FormField label="Họ và tên" value={form.fullName} onChange={set("fullName")} placeholder="Nguyễn Văn A" />
          </div>
          <div className="col-span-2">
            <FormField label="Headline" value={form.headline} onChange={set("headline")} placeholder="Frontend Developer · 3 năm kinh nghiệm" />
          </div>
          <FormField label="Email" type="email" value={form.email} onChange={set("email")} placeholder="email@example.com" />
          <FormField label="Số điện thoại" type="tel" value={form.phone} onChange={set("phone")} placeholder="0912 345 678" />
          <div className="col-span-2">
            <FormField label="Địa chỉ" value={form.address} onChange={set("address")} placeholder="Hà Nội, Việt Nam" />
          </div>
          <div className="col-span-2">
            <FormField label="URL ảnh đại diện" value={form.avatarUrl} onChange={set("avatarUrl")} placeholder="https://..." hint="Dán link ảnh từ Internet" />
          </div>
        </div>

        <hr className="border-gray-100" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Mạng xã hội</p>

        <FormField label="LinkedIn" value={form.linkedIn} onChange={set("linkedIn")} placeholder="https://linkedin.com/in/username" />
        <FormField label="GitHub" value={form.github} onChange={set("github")} placeholder="https://github.com/username" />
        <FormField label="Website / Portfolio" value={form.website} onChange={set("website")} placeholder="https://mysite.com" />
      </div>

      {/* Save footer */}
      <div className="flex-shrink-0 px-6 py-3 border-t border-gray-100 bg-gray-50/50 flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="
            flex items-center gap-2 px-5 py-2
            bg-[#3D5A80] hover:bg-[#2E4565]
            text-white text-xs font-semibold rounded-xl
            transition-all active:scale-95 disabled:opacity-60
          "
        >
          {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          Lưu thông tin
        </button>
      </div>
    </form>
  );
}

// ── Section Content Editor ────────────────────────────────────────────────────

function SectionEditor({
  section,
  saving,
  onUpdate,
  onRealtimeUpdate, // Thêm prop mới
}: {
  section: CVSection;
  saving: boolean;
  onUpdate: (sectionId: string, payload: UpdateCVSectionPayload) => Promise<void>;
  onRealtimeUpdate: (sectionId: string, payload: UpdateCVSectionPayload) => void; // Cập nhật realtime
}) {
  const [title, setTitle] = useState(section.title);
  const [content, setContent] = useState(section.content);
  const [isDirty, setIsDirty] = useState(false);

  // Sync khi section thay đổi từ bên ngoài (chỉ khi không dirty)
  useEffect(() => {
    if (!isDirty) {
      setTitle(section.title);
      setContent(section.content);
    }
  }, [section.id]); // Chỉ sync khi chuyển section

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    setIsDirty(true);
    // Cập nhật realtime cho preview
    onRealtimeUpdate(section.id, { 
      title: newTitle, 
      content, 
      visible: section.visible 
    });
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setIsDirty(true);
    // Cập nhật realtime cho preview
    onRealtimeUpdate(section.id, { 
      title, 
      content: newContent, 
      visible: section.visible 
    });
  };

  const handleSave = async () => {
    await onUpdate(section.id, { title, content, visible: section.visible });
    setIsDirty(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100 flex-shrink-0">
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
          {SECTION_TYPE_LABELS[section.type]}
        </span>
        <span className="text-gray-300">·</span>
        <span className="text-xs text-gray-400">Chỉnh sửa nội dung</span>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
        {/* Section title */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Tiêu đề mục
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="
              w-full px-3.5 py-2.5 text-sm font-semibold text-gray-900
              bg-white border border-gray-200 rounded-xl
              focus:outline-none focus:ring-2 focus:ring-[#3D5A80]/25 focus:border-[#3D5A80]
              transition-all
            "
          />
        </div>

        {/* Content editor */}
        <div className="flex-1">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Nội dung
          </label>
          <div className="rounded-xl border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-[#3D5A80]/25 focus-within:border-[#3D5A80] transition-all">
            {/* Mini toolbar */}
            <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-100 bg-gray-50">
              {["B", "I", "U"].map((f) => (
                <button
                  key={f}
                  type="button"
                  className="w-6 h-6 text-xs font-bold text-gray-500 hover:bg-gray-200 rounded transition-colors"
                  style={{ fontStyle: f === "I" ? "italic" : "normal", textDecoration: f === "U" ? "underline" : "none" }}
                  onClick={() => {
                    const tag = f === "B" ? "**" : f === "I" ? "_" : "__";
                    const newContent = content + `${tag}text${tag}`;
                    handleContentChange(newContent);
                  }}
                >
                  {f}
                </button>
              ))}
              <div className="w-px h-4 bg-gray-200 mx-1" />
              <button
                type="button"
                className="text-[10px] font-mono text-gray-400 hover:bg-gray-200 px-1.5 py-0.5 rounded transition-colors"
                onClick={() => {
                  const newContent = content + "\n- ";
                  handleContentChange(newContent);
                }}
              >
                — list
              </button>
            </div>

            <textarea
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              rows={16}
              placeholder={`Nhập nội dung cho mục "${title}"...\n\nHỗ trợ Markdown:\n- **in đậm**, _in nghiêng_\n- Danh sách: bắt đầu với "- "\n- Tách đoạn bằng dòng trống`}
              className="
                w-full px-4 py-3 text-sm text-gray-800 font-mono
                bg-white resize-none outline-none
                placeholder:text-gray-300 placeholder:font-sans
                leading-relaxed
              "
            />
          </div>
          <p className="text-[11px] text-gray-400 mt-1.5">
            Hỗ trợ Markdown cơ bản · {content.length} ký tự
          </p>
        </div>
      </div>

      {/* Save footer */}
      <div className="flex-shrink-0 px-6 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
        <span className={`text-[11px] ${isDirty ? "text-amber-500 font-medium" : "text-gray-400"}`}>
          {isDirty ? "Có thay đổi chưa lưu" : "Đã lưu"}
        </span>
        <button
          onClick={handleSave}
          disabled={saving || !isDirty}
          className="
            flex items-center gap-2 px-5 py-2
            bg-[#3D5A80] hover:bg-[#2E4565]
            text-white text-xs font-semibold rounded-xl
            transition-all active:scale-95
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          Lưu mục
        </button>
      </div>
    </div>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────

interface Props {
  cv: OnlineCVDetail;
  activeTab: EditorTab;
  activeSection: CVSection | null;
  saving: boolean;
  onSavePersonalInfo: (form: PersonalInfoForm) => Promise<void>;
  onUpdateSection: (sectionId: string, payload: UpdateCVSectionPayload) => Promise<void>;
  onImportFromProfile: () => Promise<void>;
  onRealtimePersonalInfoUpdate?: (form: PersonalInfoForm) => void; // Mới
  onRealtimeSectionUpdate?: (sectionId: string, payload: UpdateCVSectionPayload) => void; // Mới
}

export function CVEditorPanel({
  cv, activeTab, activeSection, saving,
  onSavePersonalInfo, onUpdateSection, onImportFromProfile,
  onRealtimePersonalInfoUpdate,
  onRealtimeSectionUpdate,
}: Props) {
  return (
    <main className="flex-1 min-w-0 bg-[#F7F6F3] flex flex-col overflow-hidden">
      <div className="flex-1 overflow-hidden bg-white mx-4 my-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col">
        {activeTab === "personal" ? (
          <PersonalInfoEditor
            cv={cv}
            saving={saving}
            onSave={onSavePersonalInfo}
            onImportFromProfile={onImportFromProfile}
            onRealtimeUpdate={onRealtimePersonalInfoUpdate || (() => {})}
          />
        ) : activeSection ? (
          <SectionEditor
            key={activeSection.id}
            section={activeSection}
            saving={saving}
            onUpdate={onUpdateSection}
            onRealtimeUpdate={onRealtimeSectionUpdate || (() => {})}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <p className="text-sm">Chọn một mục ở sidebar để chỉnh sửa</p>
          </div>
        )}
      </div>
    </main>
  );
}