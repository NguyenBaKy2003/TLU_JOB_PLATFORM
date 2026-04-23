"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft, Eye, EyeOff, Download, Globe,
  Check, Loader2, Pencil, ChevronDown,
} from "lucide-react";
import type { OnlineCVDetail } from "@/domain/models/Cv";
import { CV_STATUS_LABELS } from "@/domain/models/Cv";

interface Props {
  cv: OnlineCVDetail;
  saving: boolean;
  exportingPdf: boolean;
  showPreview: boolean;
  onTogglePreview: () => void;
  onPublish: () => void;
  onExportPdf: () => void;
  onUpdateTitle: (title: string) => Promise<void>;
  onBack: () => void;
}

const STATUS_PILL: Record<string, string> = {
  DRAFT:     "bg-amber-100 text-amber-700",
  PUBLISHED: "bg-emerald-100 text-emerald-700",
  ARCHIVED:  "bg-gray-100 text-gray-500",
};

export function CVEditTopBar({
  cv, saving, exportingPdf, showPreview,
  onTogglePreview, onPublish, onExportPdf, onUpdateTitle, onBack,
}: Props) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState(cv.title);
  const [savingTitle, setSavingTitle] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setTitle(cv.title); }, [cv.title]);

  const commitTitle = async () => {
    if (title.trim() === cv.title) { setEditingTitle(false); return; }
    setSavingTitle(true);
    await onUpdateTitle(title.trim() || cv.title);
    setSavingTitle(false);
    setEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") commitTitle();
    if (e.key === "Escape") { setTitle(cv.title); setEditingTitle(false); }
  };

  useEffect(() => {
    if (editingTitle) inputRef.current?.focus();
  }, [editingTitle]);

  return (
    <header className="h-14 flex-shrink-0 bg-white border-b border-gray-200 flex items-center justify-between px-4 gap-4 z-20">
      {/* Left: back + title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onBack}
          className="flex-shrink-0 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Quay lại"
        >
          <ArrowLeft className="w-4 h-4 text-gray-600" />
        </button>

        {/* Title editable */}
        <div className="flex items-center gap-2 min-w-0">
          {editingTitle ? (
            <input
              ref={inputRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={handleTitleKeyDown}
              className="
                text-sm font-semibold text-gray-900 bg-transparent border-b-2 border-[#3D5A80]
                outline-none px-0.5 min-w-0 w-48
              "
            />
          ) : (
            <button
              onClick={() => setEditingTitle(true)}
              className="flex items-center gap-1.5 group"
            >
              <span className="text-sm font-semibold text-gray-900 truncate max-w-[200px]">
                {cv.title}
              </span>
              <Pencil className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </button>
          )}

          {savingTitle && <Loader2 className="w-3 h-3 text-gray-400 animate-spin flex-shrink-0" />}
        </div>

        {/* Status badge */}
        <span className={`flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_PILL[cv.status]}`}>
          {CV_STATUS_LABELS[cv.status]}
        </span>

        {/* Auto-save indicator */}
        {saving && (
          <span className="flex items-center gap-1 text-[11px] text-gray-400 flex-shrink-0">
            <Loader2 className="w-3 h-3 animate-spin" />
            Đang lưu...
          </span>
        )}
        {!saving && (
          <span className="flex items-center gap-1 text-[11px] text-gray-400 flex-shrink-0">
            <Check className="w-3 h-3 text-emerald-500" />
            Đã lưu
          </span>
        )}
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Preview toggle */}
        <button
          onClick={onTogglePreview}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all
            ${showPreview
              ? "bg-[#3D5A80]/10 text-[#3D5A80]"
              : "hover:bg-gray-100 text-gray-600"
            }
          `}
        >
          {showPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          {showPreview ? "Ẩn preview" : "Preview"}
        </button>

        {/* Export PDF */}
        <button
          onClick={onExportPdf}
          disabled={exportingPdf}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
        >
          {exportingPdf
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <Download className="w-3.5 h-3.5" />
          }
          Xuất PDF
        </button>

        {/* Publish */}
        {cv.status !== "PUBLISHED" && (
          <button
            onClick={onPublish}
            className="
              flex items-center gap-1.5 px-4 py-1.5
              bg-[#3D5A80] hover:bg-[#2E4565]
              text-white text-xs font-semibold rounded-lg
              transition-all active:scale-95
            "
          >
            <Globe className="w-3.5 h-3.5" />
            Publish
          </button>
        )}

        {/* View live link */}
        {cv.status === "PUBLISHED" && cv.slug && (
          <a
            href={`/cv/view/${cv.slug}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-all"
          >
            <Globe className="w-3.5 h-3.5" />
            Xem CV
          </a>
        )}
      </div>
    </header>
  );
}