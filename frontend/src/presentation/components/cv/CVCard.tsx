"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Eye, Copy, Trash2, Globe, Archive, RotateCcw,
  MoreVertical, FileEdit, ExternalLink, Download,
} from "lucide-react";
import type { OnlineCV, CVStatus, CVVisibility } from "@/domain/models/Cv";
import { CV_STATUS_LABELS, CV_VISIBILITY_LABELS } from "@/domain/models/Cv";

// ── Status / Visibility badges ───

const STATUS_STYLES: Record<CVStatus, string> = {
  DRAFT:     "bg-amber-50 text-amber-700 border-amber-200",
  PUBLISHED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  ARCHIVED:  "bg-gray-100 text-gray-500 border-gray-200",
};

const VISIBILITY_STYLES: Record<CVVisibility, string> = {
  PUBLIC:    "bg-blue-50 text-blue-600",
  PRIVATE:   "bg-gray-100 text-gray-500",
  LINK_ONLY: "bg-purple-50 text-purple-600",
};

// ── Helpers 

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(
    new Date(iso)
  );
}

// ── CV Thumbnail placeholder ─────

function CVThumbnail({ title, status }: { title: string; status: CVStatus }) {
  const initials = title
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

  const bg: Record<CVStatus, string> = {
    DRAFT:     "from-[#E8EFF7] to-[#D0DCF0]",
    PUBLISHED: "from-[#E0F4EC] to-[#C5EAD8]",
    ARCHIVED:  "from-[#EDEDE9] to-[#E0E0D8]",
  };

  return (
    <div className={`relative w-full aspect-[3/4] rounded-t-xl bg-gradient-to-br ${bg[status]} flex flex-col items-center justify-center overflow-hidden`}>
      {/* Decorative lines mimicking a CV */}
      <div className="absolute inset-x-6 top-5 space-y-2 opacity-30">
        <div className="h-2.5 bg-current rounded-full w-3/4 mx-auto" />
        <div className="h-1.5 bg-current rounded-full w-1/2 mx-auto" />
        <div className="mt-3 h-px bg-current" />
        <div className="h-1 bg-current rounded-full w-full" />
        <div className="h-1 bg-current rounded-full w-5/6" />
        <div className="h-1 bg-current rounded-full w-4/6" />
        <div className="mt-2 h-px bg-current opacity-50" />
        <div className="h-1 bg-current rounded-full w-full" />
        <div className="h-1 bg-current rounded-full w-3/4" />
      </div>

      {/* Initials circle */}
      <div className="relative z-10 w-12 h-12 rounded-full bg-white/60 backdrop-blur-sm flex items-center justify-center">
        <span className="text-base font-bold text-[#3D5A80]">{initials || "CV"}</span>
      </div>
    </div>
  );
}

// ── Dropdown menu ─────────

interface MenuProps {
  cv: OnlineCV;
  onClose: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onPublish: () => void;
  onArchive: () => void;
  onRestore: () => void;
}

function CVCardMenu({ cv, onClose, onDuplicate, onDelete, onPublish, onArchive, onRestore }: MenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const item = "flex items-center gap-2.5 w-full px-3 py-2 text-[16px] rounded-lg hover:bg-gray-50 transition-colors text-left";

  const action = (fn: () => void) => () => { fn(); onClose(); };

  return (
    <div
      ref={ref}
      className="absolute right-2 top-10 z-30 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5"
    >
      <Link
        href={`/cv/${cv.id}/edit`}
        className={`${item} text-gray-700`}
        onClick={onClose}
      >
        <FileEdit className="w-4 h-4 text-gray-400" />
        Chỉnh sửa
      </Link>

      {cv.status !== "ARCHIVED" && (
        <button className={`${item} text-gray-700`} onClick={action(onDuplicate)}>
          <Copy className="w-4 h-4 text-gray-400" />
          Nhân bản
        </button>
      )}

      {cv.status === "DRAFT" && (
        <button className={`${item} text-emerald-600`} onClick={action(onPublish)}>
          <Globe className="w-4 h-4" />
          Publish CV
        </button>
      )}

      {cv.status === "PUBLISHED" && (
        <button className={`${item} text-amber-600`} onClick={action(onArchive)}>
          <Archive className="w-4 h-4" />
          Lưu trữ
        </button>
      )}

      {cv.status === "ARCHIVED" && (
        <button className={`${item} text-blue-600`} onClick={action(onRestore)}>
          <RotateCcw className="w-4 h-4" />
          Khôi phục
        </button>
      )}

      {cv.exportedPdfUrl && (
        <a href={cv.exportedPdfUrl} target="_blank" rel="noreferrer" className={`${item} text-gray-700`} onClick={onClose}>
          <Download className="w-4 h-4 text-gray-400" />
          Tải PDF
        </a>
      )}

      {cv.slug && cv.status === "PUBLISHED" && (
        <a href={`/cv/view/${cv.slug}`} target="_blank" rel="noreferrer" className={`${item} text-gray-700`} onClick={onClose}>
          <ExternalLink className="w-4 h-4 text-gray-400" />
          Xem public
        </a>
      )}

      <div className="my-1 border-t border-gray-100" />

      <button className={`${item} text-red-500 hover:bg-red-50`} onClick={action(onDelete)}>
        <Trash2 className="w-4 h-4" />
        Xóa CV
      </button>
    </div>
  );
}

// ── Main Card ─────────────

interface Props {
  cv: OnlineCV;
  onDuplicate: () => void;
  onDelete: () => void;
  onPublish: () => void;
  onArchive: () => void;
  onRestore: () => void;
}

export function CVCard({ cv, onDuplicate, onDelete, onPublish, onArchive, onRestore }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="group relative bg-white rounded-xl border border-gray-200 hover:border-[#3D5A80]/40 hover:shadow-md transition-all duration-200">
      {/* Thumbnail */}
      <Link href={`/cv/${cv.id}/edit`}>
        <CVThumbnail title={cv.title} status={cv.status} />
      </Link>

      {/* Card body */}
      <div className="p-4">
        {/* Title + menu trigger */}
        <div className="flex items-start justify-between gap-2">
          <Link href={`/cv/${cv.id}/edit`} className="flex-1 min-w-0">
            <h3 className="text-[16px] font-semibold text-gray-900 truncate leading-snug hover:text-[#3D5A80] transition-colors">
              {cv.title}
            </h3>
          </Link>

          <div className="relative flex-shrink-0">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Tùy chọn"
            >
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>

            {menuOpen && (
              <CVCardMenu
                cv={cv}
                onClose={() => setMenuOpen(false)}
                onDuplicate={onDuplicate}
                onDelete={onDelete}
                onPublish={onPublish}
                onArchive={onArchive}
                onRestore={onRestore}
              />
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-1.5 mt-2.5">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_STYLES[cv.status]}`}>
            {CV_STATUS_LABELS[cv.status]}
          </span>
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${VISIBILITY_STYLES[cv.visibility]}`}>
            {CV_VISIBILITY_LABELS[cv.visibility]}
          </span>
        </div>

        {/* Meta */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <span className="text-[11px] text-gray-400">
            {formatDate(cv.updatedAt)}
          </span>
          {cv.status === "PUBLISHED" && (
            <div className="flex items-center gap-1 text-[11px] text-gray-400">
              <Eye className="w-3 h-3" />
              {cv.viewCount.toLocaleString("vi-VN")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}