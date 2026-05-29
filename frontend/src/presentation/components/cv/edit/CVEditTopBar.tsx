"use client";

import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft, Save, Eye, EyeOff, Download, Globe, Lock,
  Sparkles, CheckCircle2, Loader2, ChevronDown, Pencil,
} from "lucide-react";
import type { OnlineCVDetail, CVVisibility } from "@/domain/models/Cv";
import type { MobileView } from "./page"; // re-exported from page

interface Props {
  cv:              OnlineCVDetail;
  saving:          boolean;
  exportingPdf:    boolean;
  showPreview:     boolean;
  mobileView:      MobileView;
  onTogglePreview: () => void;
  onPublish:       () => void;
  onExportPdf:     () => void;
  onUpdateTitle:   (title: string) => void;
  onUpdateVisibility: (v: CVVisibility) => void;
  onAiOptimize:    () => void;
  onBack:          () => void;
  onMobileViewChange: (v: MobileView) => void;
}

export function CVEditTopBar({
  cv, saving, exportingPdf, showPreview,
  onTogglePreview, onPublish, onExportPdf,
  onUpdateTitle, onUpdateVisibility, onAiOptimize, onBack,
}: Props) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue,   setTitleValue]   = useState(cv.title ?? "CV của tôi");
  const [visMenu,      setVisMenu]      = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const visRef   = useRef<HTMLDivElement>(null);

  useEffect(() => { setTitleValue(cv.title ?? "CV của tôi"); }, [cv.title]);
  useEffect(() => { if (editingTitle) titleRef.current?.select(); }, [editingTitle]);

  // Close visibility menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (visRef.current && !visRef.current.contains(e.target as Node)) setVisMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const commitTitle = () => {
    setEditingTitle(false);
    if (titleValue.trim() && titleValue.trim() !== cv.title) {
      onUpdateTitle(titleValue.trim());
    }
  };

  const visibilityOptions: { value: CVVisibility; label: string; icon: React.ReactNode; desc: string }[] = [
    { value: "PUBLIC",  label: "Công khai",  icon: <Globe className="w-3.5 h-3.5" />,   desc: "Ai cũng có thể tìm thấy" },
    { value: "PRIVATE", label: "Riêng tư",   icon: <Lock className="w-3.5 h-3.5" />,    desc: "Chỉ bạn mới thấy" },
  ];
  const currentVis = visibilityOptions.find((o) => o.value === cv.visibility) ?? visibilityOptions[1];

  const isPublished = cv.status === "PUBLISHED";

  return (
    <header className="flex-shrink-0 h-14 bg-white border-b border-slate-200 flex items-center gap-2 px-3 md:px-4 shadow-sm">
      {/* Back */}
      <button
        onClick={onBack}
        className="flex-shrink-0 p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
        title="Quay lại"
      >
        <ArrowLeft className="w-4 h-4" />
      </button>

      {/* Title */}
      <div className="flex-1 min-w-0 flex items-center gap-1.5">
        {editingTitle ? (
          <input
            ref={titleRef}
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => { if (e.key === "Enter") commitTitle(); if (e.key === "Escape") { setEditingTitle(false); setTitleValue(cv.title ?? ""); } }}
            className="text-sm font-semibold text-slate-800 bg-slate-100 rounded-lg px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-[#3D5A80]/30 w-full max-w-xs"
          />
        ) : (
          <button
            onClick={() => setEditingTitle(true)}
            className="flex items-center gap-1.5 group"
          >
            <span className="text-sm font-semibold text-slate-800 truncate max-w-[120px] md:max-w-xs">
              {titleValue}
            </span>
            <Pencil className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </button>
        )}

        {/* Status badge */}
        <span className={`hidden md:inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
          isPublished
            ? "bg-emerald-100 text-emerald-700"
            : "bg-slate-100 text-slate-500"
        }`}>
          {isPublished && <CheckCircle2 className="w-2.5 h-2.5" />}
          {isPublished ? "Đã xuất bản" : "Nháp"}
        </span>

        {/* Saving indicator */}
        {saving && (
          <span className="flex items-center gap-1 text-[10px] text-slate-400 flex-shrink-0">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span className="hidden sm:inline">Đang lưu…</span>
          </span>
        )}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {/* AI — hidden on very small screens */}
        <button
          onClick={onAiOptimize}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-200 rounded-lg transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden md:inline">AI Tối ưu</span>
        </button>

        {/* Visibility picker */}
        <div className="relative hidden md:block" ref={visRef}>
          <button
            onClick={() => setVisMenu((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all"
          >
            {currentVis.icon}
            <span className="hidden lg:inline">{currentVis.label}</span>
            <ChevronDown className="w-3 h-3" />
          </button>
          {visMenu && (
            <div className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-30 overflow-hidden py-1">
              {visibilityOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { onUpdateVisibility(opt.value); setVisMenu(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors ${
                    cv.visibility === opt.value ? "bg-[#3D5A80]/5 text-[#3D5A80]" : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <span className={cv.visibility === opt.value ? "text-[#3D5A80]" : "text-slate-400"}>
                    {opt.icon}
                  </span>
                  <div>
                    <div className="text-xs font-semibold">{opt.label}</div>
                    <div className="text-[10px] text-slate-400">{opt.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Preview toggle */}
        <button
          onClick={onTogglePreview}
          title={showPreview ? "Ẩn preview" : "Xem trước"}
          className={`p-2 rounded-lg transition-all text-sm ${
            showPreview
              ? "bg-[#3D5A80] text-white"
              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
          }`}
        >
          {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>

        {/* Export PDF */}
        <button
          onClick={onExportPdf}
          disabled={exportingPdf}
          title="Xuất PDF"
          className="p-2 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all disabled:opacity-50"
        >
          {exportingPdf
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <Download className="w-4 h-4" />
          }
        </button>

        {/* Publish */}
        <button
          onClick={onPublish}
          className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            isPublished
              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
              : "bg-[#3D5A80] text-white hover:bg-[#2E4565] active:scale-95"
          }`}
        >
          {isPublished ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
          {isPublished ? "Đã xuất bản" : "Xuất bản"}
        </button>
      </div>
    </header>
  );
}