"use client";

import {
  Mail, Phone, MapPin, Linkedin, Github, Globe,
  Link as LinkIcon,
} from "lucide-react";
import type { OnlineCVDetail, CVSection, SectionType } from "@/domain/models/Cv";

// ── Markdown-lite renderer ────────────────────────────────────────────────────

function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/_(.*?)_/g, "<em>$1</em>")
    .replace(/__(.*?)__/g, "<u>$1</u>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>)/s, "<ul>$1</ul>")
    .replace(/\n\n/g, "</p><p>")
    .trim();
}

function MarkdownContent({ content }: { content: string }) {
  if (!content.trim()) return null;
  return (
    <div
      className="text-[11px] text-gray-600 leading-relaxed prose-sm"
      dangerouslySetInnerHTML={{
        __html: `<p>${renderMarkdown(content)}</p>`,
      }}
    />
  );
}

// ── Section type colors ───────────────────────────────────────────────────────

const SECTION_ACCENT: Partial<Record<SectionType, string>> = {
  EXPERIENCE:  "#3D5A80",
  EDUCATION:   "#2E7D6B",
  SKILL:       "#B45309",
  PROJECT:     "#6D28D9",
  CERTIFICATE: "#C2410C",
  LANGUAGE:    "#15803D",
  AWARD:       "#BE185D",
  SUMMARY:     "#374151",
  CUSTOM:      "#374151",
};

// ── Preview section ───────────────────────────────────────────────────────────

function PreviewSection({ section }: { section: CVSection }) {
  const accent = SECTION_ACCENT[section.type] ?? "#3D5A80";
  if (!section.visible) return null;

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <h3
          className="text-[10px] font-black uppercase tracking-widest"
          style={{ color: accent }}
        >
          {section.title}
        </h3>
        <div className="flex-1 h-px" style={{ backgroundColor: accent, opacity: 0.2 }} />
      </div>
      {section.content ? (
        <MarkdownContent content={section.content} />
      ) : (
        <p className="text-[10px] text-gray-300 italic">Chưa có nội dung</p>
      )}
    </div>
  );
}

// ── CV Preview ────────────────────────────────────────────────────────────────

interface Props {
  cv: OnlineCVDetail;
}

export function CVPreviewPanel({ cv }: Props) {
  const info = cv.personalInfo;
  const visibleSections = cv.sections.filter((s) => s.visible);

  return (
    <aside className="w-72 flex-shrink-0 border-l border-gray-200 bg-[#F7F6F3] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-white flex items-center justify-between flex-shrink-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
          Preview
        </p>
        <span className="text-[9px] text-gray-300">Live · A4</span>
      </div>

      {/* A4 preview */}
      <div className="flex-1 overflow-y-auto p-4">
        <div
          className="bg-white rounded-lg shadow-md overflow-hidden"
          style={{ fontFamily: "'Georgia', serif" }}
        >
          {/* Header section */}
          <div className="px-5 py-5 bg-[#3D5A80] text-white">
            {/* Avatar + name */}
            <div className="flex items-center gap-3 mb-3">
              {info?.avatarUrl ? (
                <img
                  src={info.avatarUrl}
                  alt={info.fullName ?? "Avatar"}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white/40 flex-shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-white/20 flex-shrink-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-white/80">
                    {(info?.fullName ?? "?")
                      .split(" ")
                      .filter(Boolean)
                      .slice(-2)
                      .map((w) => w[0])
                      .join("")
                      .toUpperCase()}
                  </span>
                </div>
              )}
              <div className="min-w-0">
                <h1 className="text-sm font-bold text-white leading-tight truncate">
                  {info?.fullName || <span className="text-white/40">Họ và tên</span>}
                </h1>
                <p className="text-[11px] text-white/70 truncate">
                  {info?.headline || <span className="text-white/30">Vị trí ứng tuyển</span>}
                </p>
              </div>
            </div>

            {/* Contact info */}
            <div className="space-y-1">
              {info?.email && (
                <div className="flex items-center gap-1.5">
                  <Mail className="w-2.5 h-2.5 text-white/60 flex-shrink-0" />
                  <span className="text-[10px] text-white/80 truncate">{info.email}</span>
                </div>
              )}
              {info?.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="w-2.5 h-2.5 text-white/60 flex-shrink-0" />
                  <span className="text-[10px] text-white/80">{info.phone}</span>
                </div>
              )}
              {info?.address && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-2.5 h-2.5 text-white/60 flex-shrink-0" />
                  <span className="text-[10px] text-white/80 truncate">{info.address}</span>
                </div>
              )}

              {/* Social links */}
              {(info?.linkedIn || info?.github || info?.website) && (
                <div className="flex items-center gap-3 pt-1">
                  {info.linkedIn && (
                    <div className="flex items-center gap-1">
                      <Linkedin className="w-2.5 h-2.5 text-white/50" />
                      <span className="text-[9px] text-white/60 truncate max-w-[60px]">
                        {info.linkedIn.replace("https://linkedin.com/in/", "")}
                      </span>
                    </div>
                  )}
                  {info.github && (
                    <div className="flex items-center gap-1">
                      <Github className="w-2.5 h-2.5 text-white/50" />
                      <span className="text-[9px] text-white/60 truncate max-w-[60px]">
                        {info.github.replace("https://github.com/", "")}
                      </span>
                    </div>
                  )}
                  {info.website && (
                    <div className="flex items-center gap-1">
                      <Globe className="w-2.5 h-2.5 text-white/50" />
                      <span className="text-[9px] text-white/60 truncate max-w-[60px]">
                        {info.website.replace(/^https?:\/\//, "")}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Content sections */}
          <div className="px-5 py-4">
            {visibleSections.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-[11px] text-gray-300">Chưa có mục nội dung nào</p>
                <p className="text-[10px] text-gray-200 mt-1">Thêm mục từ sidebar bên trái</p>
              </div>
            ) : (
              visibleSections.map((section) => (
                <PreviewSection key={section.id} section={section} />
              ))
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}