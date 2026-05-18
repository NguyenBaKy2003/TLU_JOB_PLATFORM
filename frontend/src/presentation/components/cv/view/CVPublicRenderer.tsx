"use client";

import { useState } from "react";
import {
  Mail, Phone, MapPin, Linkedin, Github, Globe,
  Eye, Share2, Download, Check, Printer,
  Briefcase, GraduationCap, Zap, FolderKanban,
  Award, Languages, Trophy, User, FileText,
} from "lucide-react";
import type { OnlineCVDetail, CVSection, SectionType } from "@/domain/models/Cv";

// ── Markdown-lite renderer 

function renderMd(raw: string): string {
  return raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/_(.*?)_/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, "<code>$1</code>")
    .split("\n")
    .map((line) => {
      if (line.startsWith("- ")) return `<li>${line.slice(2)}</li>`;
      if (line.trim() === "") return "<br/>";
      return `<span>${line}</span><br/>`;
    })
    .join("")
    .replace(/(<li>[\s\S]*?<\/li>)+/g, (m) => `<ul>${m}</ul>`);
}

function MD({ content }: { content: string }) {
  if (!content.trim()) return null;
  return (
    <div
      className="cv-content"
      dangerouslySetInnerHTML={{ __html: renderMd(content) }}
    />
  );
}

// ── Section icons ─────────

const SECTION_ICONS: Partial<Record<SectionType, React.ReactNode>> = {
  SUMMARY:     <User className="w-3.5 h-3.5" />,
  EXPERIENCE:  <Briefcase className="w-3.5 h-3.5" />,
  EDUCATION:   <GraduationCap className="w-3.5 h-3.5" />,
  SKILL:       <Zap className="w-3.5 h-3.5" />,
  PROJECT:     <FolderKanban className="w-3.5 h-3.5" />,
  CERTIFICATE: <Award className="w-3.5 h-3.5" />,
  LANGUAGE:    <Languages className="w-3.5 h-3.5" />,
  AWARD:       <Trophy className="w-3.5 h-3.5" />,
  CUSTOM:      <FileText className="w-3.5 h-3.5" />,
};

// ── Contact row ───────────

function ContactItem({ icon, text, href }: { icon: React.ReactNode; text: string; href?: string }) {
  const cls = "flex items-center gap-2 text-[13px] text-[#4A5568] hover:text-[#3D5A80] transition-colors";
  const inner = (
    <>
      <span className="text-[#3D5A80] flex-shrink-0">{icon}</span>
      <span className="truncate">{text}</span>
    </>
  );
  return href ? (
    <a href={href} target="_blank" rel="noreferrer" className={cls}>{inner}</a>
  ) : (
    <span className={cls}>{inner}</span>
  );
}

// ── Top action bar ────────

function ActionBar({ cv }: { cv: OnlineCVDetail }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="print:hidden sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-3xl mx-auto px-6 h-12 flex items-center justify-between gap-4">
        {/* View count */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Eye className="w-3.5 h-3.5" />
          <span>{cv.viewCount.toLocaleString("vi-VN")} lượt xem</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {copied
              ? <><Check className="w-3.5 h-3.5 text-emerald-500" />Đã sao chép</>
              : <><Share2 className="w-3.5 h-3.5" />Chia sẻ</>
            }
          </button>

          {cv.exportedPdfUrl && (
            <a
              href={cv.exportedPdfUrl}
              download
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Tải PDF
            </a>
          )}

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#3D5A80] hover:bg-[#2E4565] text-white rounded-lg transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            In CV
          </button>
        </div>
      </div>
    </div>
  );
}

// ── CV Section ────────────

function CVSectionBlock({ section }: { section: CVSection }) {
  if (!section.visible) return null;

  return (
    <section className="mb-8 break-inside-avoid">
      {/* Section heading */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-[#3D5A80]/10 text-[#3D5A80] flex-shrink-0">
          {SECTION_ICONS[section.type] ?? <FileText className="w-3.5 h-3.5" />}
        </div>
        <h2 className="text-[16px] font-black uppercase tracking-widest text-[#3D5A80]">
          {section.title}
        </h2>
        <div className="flex-1 h-px bg-[#3D5A80]/15" />
      </div>

      {/* Content */}
      {section.content ? (
        <MD content={section.content} />
      ) : (
        <p className="text-[16px] text-gray-300 italic">Chưa có nội dung</p>
      )}
    </section>
  );
}

// ── Main renderer ─────────

interface Props {
  cv: OnlineCVDetail;
}

export function CVPublicRenderer({ cv }: Props) {
  const info = cv.personalInfo;
  const initials = (info?.fullName ?? "?")
    .split(" ").filter(Boolean).slice(-2)
    .map((w) => w[0].toUpperCase()).join("");

  const visibleSections = cv.sections.filter((s) => s.visible);

  return (
    <>
      {/* Global styles for CV content + print */}
      <style>{`
        .cv-content { font-size: 13.5px; line-height: 1.75; color: #374151; }
        .cv-content ul { padding-left: 1.25rem; margin: 0.5rem 0; list-style-type: disc; }
        .cv-content li { margin-bottom: 0.25rem; }
        .cv-content strong { font-weight: 700; color: #1F2937; }
        .cv-content em { font-style: italic; }
        .cv-content code { font-family: monospace; background: #F3F4F6; padding: 1px 5px; border-radius: 4px; font-size: 12px; }
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>

      <div className="min-h-screen bg-[#F0EEE9]">
        <ActionBar cv={cv} />

        {/* A4-like document */}
        <div className="max-w-3xl mx-auto px-4 py-8 print:py-0 print:px-0">
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden print:shadow-none print:rounded-none">

            {/* ── Header / Hero ── */}
            <div className="relative bg-gradient-to-br from-[#2E4565] to-[#3D5A80] px-8 py-10 print:px-10">
              {/* Subtle pattern */}
              <div
                className="absolute inset-0 opacity-5 print:hidden"
                style={{
                  backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                  backgroundSize: "28px 28px",
                }}
              />

              <div className="relative flex items-start gap-6">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {info?.avatarUrl ? (
                    <img
                      src={info.avatarUrl}
                      alt={info.fullName ?? "Avatar"}
                      className="w-20 h-20 rounded-2xl object-cover border-3 border-white/30 shadow-lg"
                      onError={(e) => {
                        const el = e.target as HTMLImageElement;
                        el.style.display = "none";
                        el.nextElementSibling?.removeAttribute("style");
                      }}
                    />
                  ) : null}
                  <div
                    className="w-20 h-20 rounded-2xl bg-white/15 flex items-center justify-center"
                    style={{ display: info?.avatarUrl ? "none" : "flex" }}
                  >
                    <span className="text-2xl font-black text-white/90">{initials}</span>
                  </div>
                </div>

                {/* Name + headline + contacts */}
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-black text-white leading-tight mb-1">
                    {info?.fullName || <span className="text-white/40">Chưa cập nhật tên</span>}
                  </h1>
                  {info?.headline && (
                    <p className="text-[16px] text-white/75 font-medium mb-4">{info.headline}</p>
                  )}

                  {/* Contact grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
                    {info?.email && (
                      <ContactItem icon={<Mail className="w-3.5 h-3.5" />} text={info.email} href={`mailto:${info.email}`} />
                    )}
                    {info?.phone && (
                      <ContactItem icon={<Phone className="w-3.5 h-3.5" />} text={info.phone} href={`tel:${info.phone}`} />
                    )}
                    {info?.address && (
                      <ContactItem icon={<MapPin className="w-3.5 h-3.5" />} text={info.address} />
                    )}
                    {info?.website && (
                      <ContactItem icon={<Globe className="w-3.5 h-3.5" />} text={info.website.replace(/^https?:\/\//, "")} href={info.website} />
                    )}
                    {info?.linkedIn && (
                      <ContactItem icon={<Linkedin className="w-3.5 h-3.5" />} text={info.linkedIn.replace("https://linkedin.com/in/", "in/")} href={info.linkedIn} />
                    )}
                    {info?.github && (
                      <ContactItem icon={<Github className="w-3.5 h-3.5" />} text={info.github.replace("https://github.com/", "github/")} href={info.github} />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Body / Sections ── */}
            <div className="px-8 py-8 print:px-10">
              {visibleSections.length === 0 ? (
                <div className="py-16 text-center text-gray-400">
                  <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-[16px]">CV này chưa có nội dung</p>
                </div>
              ) : (
                visibleSections.map((section) => (
                  <CVSectionBlock key={section.id} section={section} />
                ))
              )}
            </div>

            {/* ── Footer ── */}
            <div className="px-8 pb-6 print:hidden">
              <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
                <p className="text-[11px] text-gray-300">
                  CV được tạo tại TLU Job Platform
                </p>
                <p className="text-[11px] text-gray-300">
                  {cv?.updatedAt ? (
  new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(cv.updatedAt))
) : "--"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}