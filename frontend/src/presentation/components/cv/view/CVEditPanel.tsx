// presentation/components/cv/view/CVEditPanel.tsx
"use client";

import { useState } from "react";
import type { OnlineCVDetail, UpdateCVSectionPayload } from "@/domain/models/Cv";

interface Props {
  cv: OnlineCVDetail;
  saving: boolean;
  onUpdatePersonalInfo: (field: string, value: string) => void;
  onUpdateSection: (sectionId: string, payload: UpdateCVSectionPayload) => Promise<void>;
}

const PERSONAL_FIELDS: { key: string; label: string; type?: string }[] = [
  { key: "fullName",  label: "Họ và tên" },
  { key: "email",     label: "Email", type: "email" },
  { key: "phone",     label: "Số điện thoại" },
  { key: "headline",  label: "Chức danh" },
  { key: "address",   label: "Địa chỉ" },
  { key: "linkedIn",  label: "LinkedIn" },
  { key: "github",    label: "GitHub" },
  { key: "website",   label: "Website" },
];

export function CVEditPanel({ cv, saving, onUpdatePersonalInfo, onUpdateSection }: Props) {
  const [activeTab, setActiveTab] = useState<"info" | "sections">("info");
  const [updatingSection, setUpdatingSection] = useState<string | null>(null);

  const handleSectionChange = async (
    sectionId: string,
    field: "title" | "content" | "visible",
    value: string | boolean
  ) => {
    const section = cv.sections.find(s => s.id === sectionId);
    if (!section) return;
    setUpdatingSection(sectionId);
    await onUpdateSection(sectionId, {
      title:   field === "title"   ? (value as string) : section.title,
      content: field === "content" ? (value as string) : section.content,
      visible: field === "visible" ? (value as boolean) : section.visible,
      type:    section.type,
    });
    setUpdatingSection(null);
  };

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      height: "100vh", borderRight: "1px solid #e5e7eb",
      background: "#fff", overflow: "hidden"
    }}>
      {/* Header */}
      <div style={{
        padding: "16px 20px",
        borderBottom: "1px solid #e5e7eb",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexShrink: 0
      }}>
        <span style={{ fontWeight: 500, fontSize: "15px" }}>Chỉnh sửa CV</span>
        {saving && (
          <span style={{ fontSize: "12px", color: "#6b7280" }}>
            Đang lưu...
          </span>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #e5e7eb", flexShrink: 0 }}>
        {(["info", "sections"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1, padding: "10px",
              background: "none", border: "none",
              borderBottom: activeTab === tab ? "2px solid #2563eb" : "2px solid transparent",
              color: activeTab === tab ? "#2563eb" : "#6b7280",
              fontWeight: activeTab === tab ? 500 : 400,
              cursor: "pointer", fontSize: "13px"
            }}
          >
            {tab === "info" ? "Thông tin cá nhân" : "Nội dung"}
          </button>
        ))}
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>

        {/* Tab: Thông tin cá nhân */}
        {activeTab === "info" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {PERSONAL_FIELDS.map(({ key, label, type }) => (
              <div key={key}>
                <label style={{ display: "block", fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>
                  {label}
                </label>
                <input
                  type={type ?? "text"}
                  value={(cv.personalInfo as any)?.[key] ?? ""}
                  onChange={e => onUpdatePersonalInfo(key, e.target.value)}
                  style={{
                    width: "100%", padding: "8px 10px",
                    border: "1px solid #d1d5db", borderRadius: "6px",
                    fontSize: "13px", outline: "none",
                    boxSizing: "border-box"
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Tab: Sections */}
        {activeTab === "sections" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {cv.sections
              .slice()
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map(section => (
                <div key={section.id} style={{
                  border: "1px solid #e5e7eb", borderRadius: "8px",
                  padding: "12px", background: "#fafafa"
                }}>
                  {/* Section header */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontSize: "11px", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      {section.type}
                    </span>
                    <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "12px", color: "#6b7280" }}>
                      <input
                        type="checkbox"
                        checked={section.visible}
                        onChange={e => handleSectionChange(section.id, "visible", e.target.checked)}
                      />
                      Hiển thị
                    </label>
                  </div>

                  {/* Title */}
                  <input
                    value={section.title}
                    onChange={e => handleSectionChange(section.id, "title", e.target.value)}
                    placeholder="Tên section"
                    style={{
                      width: "100%", padding: "6px 8px", marginBottom: "8px",
                      border: "1px solid #d1d5db", borderRadius: "4px",
                      fontSize: "13px", fontWeight: 500,
                      boxSizing: "border-box"
                    }}
                  />

                  {/* Content */}
                  <textarea
                    value={section.content ?? ""}
                    onChange={e => handleSectionChange(section.id, "content", e.target.value)}
                    placeholder="Nội dung..."
                    rows={4}
                    style={{
                      width: "100%", padding: "6px 8px",
                      border: "1px solid #d1d5db", borderRadius: "4px",
                      fontSize: "13px", resize: "vertical",
                      boxSizing: "border-box"
                    }}
                  />

                  {updatingSection === section.id && (
                    <p style={{ fontSize: "11px", color: "#9ca3af", marginTop: "4px" }}>Đang lưu...</p>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}